<template>
  <div id="vista-defunciones-temporales">
    <h1>Mortalidad de niñas, niños y adolescentes en México</h1>
    <div class="controles">
      
      <p>Entidad</p>
      <select name="selector-entidad" id="selector-entidad"  v-model="estado_seleccionado">
        <option v-for="entidad, i in entidades" :value="entidad.cve" :key="i">
          {{ entidad.estado }}
        </option>
      </select>
      <p>Sexo</p>
      <select name="selector-sexo" id="selector-sexo"  v-model="sexo_seleccionado">
        <option v-for="sexo, i in sexos" :value="sexo.cve" :key="i">
          {{ sexo.sexo }}
        </option>
      </select>
      <p>Selecciona un rango de edad (años)</p>

      <OrdinalBrush
         :getter_store="'cambiaRangoEdadPrincipal'"
      ></OrdinalBrush>
    </div>
    
    <StreamGraph
      :stream_graph_id="'streamgraph1'"
      :datos="datos"
      :variables="variables"
      nombre_columna_horizontal="ANIO_BASE"
      titulo_eje_y="Tasa de mortalidad por 100 mil habitantes *"
      titulo_eje_x="Año"
      :class="{cargando: esta_cargando}"
      :hover_activo="!esta_cargando"
    >
    </StreamGraph>
    <p>* Habitantes con las características anuales seleccionadas en los filtros de edad, sexo y entidad (o país) </p>
    <div class="nomenclatura">
        <div v-for="(variable, i) in totales.slice(0,10)" :key="i" class="variable">
          <span :style="{ background: variable.color }"></span>
          {{ catalogo[variable.cve] }}
        </div>
      </div>

  </div>
</template>
<script>
import * as d3 from "d3";
import StreamGraph from "../components/StreamGraph.vue";
import catalogo from "@/assets/data/catalogo.json";
import OrdinalBrush from "@/components/OrdinalBrush.vue";
import { mapState } from 'vuex';
var claves_estatales={'00': 'Nacional',
 '01': 'Aguascalientes',
 '02': 'Baja California',
 '03': 'Baja California Sur',
 '04': 'Campeche',
 '05': 'Coahuila',
 '06': 'Colima',
 '07': 'Chiapas',
 '08': 'Chihuahua',
 '09': 'Ciudad de México',
 '10': 'Durango',
 '11': 'Guanajuato',
 '12': 'Guerrero',
 '13': 'Hidalgo',
 '14': 'Jalisco',
 '15': 'México',
 '16': 'Michoacán',
 '17': 'Morelos',
 '18': 'Nayarit',
 '19': 'Nuevo León',
 '20': 'Oaxaca',
 '21': 'Puebla',
 '22': 'Querétaro',
 '23': 'Quintana Roo',
 '24': 'San Luis Potosí',
 '25': 'Sinaloa',
 '26': 'Sonora',
 '27': 'Tabasco',
 '28': 'Tamaulipas',
 '29': 'Tlaxcala',
 '30': 'Veracruz',
 '31': 'Yucatán',
 '32': 'Zacatecas'}
const diccionario_causas = {};
catalogo.map(d=> diccionario_causas[d.CVE_CAPGPO] =d.CAPGPO );
export default {
  name: "DefuncionesTemporales",
  components: {
    StreamGraph,
    OrdinalBrush
  },
  data() {
    return {
      
      modal_visible: false,
      catalogo : diccionario_causas,
      datos: [],
      data_completa:[],
      data_conapo_completa: [],
      variables: Object.keys(diccionario_causas).map((d, i)=>{
        return {
            id: d,
            nombre: diccionario_causas[d],
            color: "rgba(0,0,0)"
          } 
      } ),
      colores_top_10: [
        "#002642",
        "#840032",
        "#E59500",
        "#724E91",
        "#20A4F3",
        "#7D2E68",
        "#4C8577",
        "#F75C03",
        "#89043D",
        "#7F2982"
      ],
      entidades: Object.keys(claves_estatales).sort((a,b) => a-b).map(d=> {
        return {
        "cve": d,
        "estado": claves_estatales[d]
      }}),
      estado_seleccionado: "00",
      sexos:[
        {cve: 1, sexo: "Masculino"},
        {cve: 2, sexo: "Femenino"},
        {cve: 0, sexo: "Ambos"}
      ],
      totales: [],
      esta_cargando: true,
      sexo_seleccionado: 0
    };
  },
  beforeMount() {
    d3.csv("data/poblaciones_conapo.csv")
      .then((data_conapo) => {
        data_conapo.forEach(d=>{
          d.EDAD = +d.EDAD;
          d.POBLACION = +d.POBLACION
        })
        this.data_conapo_completa = data_conapo;
        d3.csv("data/datos_2012_2021.csv").then((data) => {
          data.forEach((d)=>{
            d.EDAD = +d.EDAD
          })
          this.data_completa = data
          this.procesamientoDatos(this.data_completa.filter(d=>this.rango_edad_principal.includes(d.EDAD)))

          //this.datos = data;
        });
    })
    
  },
  methods: {
    procesamientoDatos(data){
      var ef = d3.rollup(data, v=>v.length, d=>d.ANIO_BASE,d=>d.CVE_CAPGPO)
      var datum = [];
      let anios = [...ef.keys()]
      let causas_def = Object.keys(this.catalogo);

      let ef_conapo = this.data_conapo_completa
        .filter(d=> d.CVE_GEO == this.estado_seleccionado)
        .filter(d=>this.rango_edad_principal.includes(d.EDAD))

      if(this.sexo_seleccionado != 0 ){
        ef_conapo = ef_conapo.filter(d=> d.SEXO == this.sexo_seleccionado)
      }
      ef_conapo = d3.rollup(ef_conapo, v=>d3.sum(v.map(dd=>dd.POBLACION)), d=>d.ANIO)

      for(var i = 0; i < anios.length; i++){
        let objeto = {};
        objeto.ANIO_BASE = anios[i]
        objeto.POBLACION = ef_conapo.get(anios[i])

        for(var j = 0; j < causas_def.length; j++){
          objeto[causas_def[j]] = 100000 * (ef.get(anios[i]).get(causas_def[j]) ? ef.get(anios[i]).get(causas_def[j]) : 0) / objeto.POBLACION ;
          objeto[causas_def[j] + "_absoluto"] = (ef.get(anios[i]).get(causas_def[j]) ? ef.get(anios[i]).get(causas_def[j]) : 0);

        }
    
        datum.push(objeto)
      }

      


      console.log(ef_conapo)
      console.log(datum)
      this.datos = datum;
      
      this.totales = causas_def.map((d)=>{
        return {
          cve : d,
          total: d3.sum(datum.map(dd => dd[d]))
        }
      }).sort((a, b) => b.total - a.total);
      let dict_col = {}
      this.totales.forEach((d, i) =>{
        d.color = i<10 ? this.colores_top_10[i] : "rgb(0,0,0)"
        dict_col[d.cve] = i<10 ? this.colores_top_10[i] : "rgb(0,0,0)"
      })


      
      this.variables = Object.keys(this.catalogo).map((d, i)=>{
        return {
            id: d,
            nombre: this.catalogo[d],
            color: dict_col[d]
          } 
      } )
      setTimeout(()=>{this.esta_cargando = false}, 1500)
    }
  },
  computed: {
    ...mapState(["rango_edad_principal"])
  },
  watch:{
    rango_edad_principal(nv){
      this.esta_cargando = true

      let data_filtrada = this.data_completa
        .filter(d=>nv.includes(+d.EDAD))
      if(this.estado_seleccionado !="00"){
        data_filtrada = data_filtrada.filter(d=> d.ENT_OCURR == this.estado_seleccionado)
      }
      if(this.sexo_seleccionado != 0 ){
        data_filtrada = data_filtrada.filter(d=> d.SEXO == this.sexo_seleccionado)
      }
      this.procesamientoDatos(data_filtrada)
    },
    estado_seleccionado(nv){
      this.esta_cargando = true

      let data_filtrada = this.data_completa
        .filter(d=>this.rango_edad_principal.includes(+d.EDAD))
      if(this.estado_seleccionado !="00"){
        data_filtrada = data_filtrada.filter(d=> d.ENT_OCURR == this.estado_seleccionado)
      }
      if(this.sexo_seleccionado != 0 ){
        data_filtrada = data_filtrada.filter(d=> d.SEXO == this.sexo_seleccionado)
      }
      this.procesamientoDatos(data_filtrada)
    },
    sexo_seleccionado(nv){
      this.esta_cargando = true

      let data_filtrada = this.data_completa
        .filter(d=>this.rango_edad_principal.includes(+d.EDAD))
      if(this.estado_seleccionado !="00"){
        data_filtrada = data_filtrada.filter(d=> d.ENT_OCURR == this.estado_seleccionado)
      }
      if(nv != 0 ){
        data_filtrada = data_filtrada.filter(d=> d.SEXO == nv)
      }
      this.procesamientoDatos(data_filtrada)
    },

  }
};
</script>
<style lang="scss">
#vista-defunciones-temporales{
  margin-top: 100px;

  .controles{
    .contenedor-brush{
      max-width: 600px
    }
  }
  #streamgraph1.cargando{
    .cargador{
      width: 100%;
      height:520px;
      backdrop-filter: blur(2px);
      position: absolute;
      z-index: 1;
    }
  }
}

  .nomenclatura {
    font-size: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px 15px;
    .variable {
      span {
        transform: translateY(2px);
        width: 16px;
        height: 16px;
        display: inline-block;
        border-radius: 5px;
        @media (max-width: 768px) {
          width: 16px;
        }
      }
    }
  
}
</style>