<template>
  <div id="vista-defunciones-temporales">
    <h1>Mortalidad de niñas, niños y adolescentes en México</h1>
    <div class="controles">
      <p>Selecciona un rango de edad (años)</p>
      <OrdinalBrush
         :getter_store="'cambiaRangoEdadPrincipal'"
      ></OrdinalBrush>
      <p>Entidad</p>
      <select name="selector-entidad" id="selector-entidad">
        
      </select>
    </div>
    
    <StreamGraph
      :stream_graph_id="'streamgraph1'"
      :datos="datos"
      :variables="variables"
      nombre_columna_horizontal="ANIO_BASE"
      titulo_eje_y="defunciones"
      titulo_eje_x="Año"
    >
    </StreamGraph>
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
      ]
    };
  },
  beforeMount() {
    d3.csv("data/datos_2012_2021.csv").then((data) => {
      data.forEach((d)=>{
        d.EDAD = +d.EDAD
      })
      this.data_completa = data
      this.procesamientoDatos(this.data_completa.filter(d=>this.rango_edad_principal.includes(d.EDAD)))

      //this.datos = data;
    });
  },
  methods: {
    procesamientoDatos(data){
      var ef = d3.rollup(data, v=>v.length, d=>d.ANIO_BASE,d=>d.CVE_CAPGPO)
      var datum = [];
      let anios = [...ef.keys()]
      let causas_def = Object.keys(this.catalogo);

      for(var i = 0; i < anios.length; i++){
        let objeto = {};
        objeto.ANIO_BASE = anios[i]
        for(var j = 0; j < causas_def.length; j++){
          objeto[causas_def[j]] = ef.get(anios[i]).get(causas_def[j]) ? ef.get(anios[i]).get(causas_def[j]) : 0;
        }
    
        datum.push(objeto)
      }
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
    }
  },
  computed: {
    ...mapState(["rango_edad_principal"])
  },
  watch:{
    rango_edad_principal(nv){
      this.procesamientoDatos(this.data_completa.filter(d=>nv.includes(+d.EDAD)))

    }
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