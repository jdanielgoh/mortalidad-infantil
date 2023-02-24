<template>
  <div id="vista-defunciones-temporales">
    <StreamGraph
      :stream_graph_id="'streamgraph1'"
      :datos="datos"
      :variables="variables"
      nombre_columna_horizontal="ANIO_BASE"
      titulo_eje_y="defunciones"
      titulo_eje_x="Año"
    >
    </StreamGraph>

  </div>
</template>
<script>
import * as d3 from "d3";
import StreamGraph from "../components/StreamGraph.vue";
import catalogo from "@/assets/data/catalogo.json";

const diccionario_causas = {};
catalogo.map(d=> diccionario_causas[d.CVE_CAPGPO] =d.CAPGPO );
export default {
  name: "DefuncionesTemporales",
  components: {
    StreamGraph,
  },
  data() {
    return {
      modal_visible: false,
      catalogo : diccionario_causas,
      datos: [],
      variables: [],
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
      
      this.procesamientoDatos(data.filter(d=>d.EDAD==14))

      //this.datos = data;
    });
  },
  methods: {
    procesamientoDatos(data){
      let listado_unico_causas = [];
      var ef = d3.rollup(data, v=>v.length, d=>d.ANIO_BASE,d=>d.CVE_CAPGPO)
      var datum = [];
      let anios = [...ef.keys()]
      for(var i = 0; i < anios.length; i++){
        let causas_def = [...ef.get(anios[i]).keys()];
        let objeto = {};
        objeto.ANIO_BASE = anios[i]
        for(var j = 0; j < causas_def.length; j++){
          objeto[causas_def[j]] =ef.get(anios[i]).get(causas_def[j]);
          listado_unico_causas.includes(causas_def[j]) ? null : listado_unico_causas.push(causas_def[j])
        }
    
        datum.push(objeto)
      }
      datum.forEach(d=>{
        for(var i = 0 ; i<listado_unico_causas.length; i++){
          if(!Object.keys(d).includes(listado_unico_causas[i])){
            d[listado_unico_causas[i]] = 0;
          }

        }
      })
      
      let totales = listado_unico_causas.map((d)=>{
        return {
          cve : d,
          total: d3.sum(datum.map(dd => dd[d]))
        }
      }).sort((a, b) => b.total - a.total);
      console.log(totales)


      this.datos = datum;
      this.variables = totales.map((d, i)=>{
        return {
            id:d.cve,
            nombre:this.catalogo[d.cve],
            color: i<10 ? this.colores_top_10[i] : "rgb(0,0,0)"
          } 
      } )
    }
  }
};
</script>
<style lang="scss">
.contenido-boton-modal {
  max-width: 1080px;
  margin: 0 auto;
  @media (max-width: 768px) {
    font-size: 14px;
  }
  .btn-modal {
    padding: 5px 10px;
    background: none;
    border: solid 1px black;
    border-radius: 3px;
    cursor: pointer;
  }
  p{
    a{
      text-decoration: none;
      color:black
    }
  }
}

button.cerrar-modal {
  font-weight: 700;
  font-size: 48px;
  padding: 1px 10px;
  float: right;
  background: none;
  border: none;
  border-radius: 3px;
}
.modal-sectores {
  position: absolute;
  top: 0;
  left: 0;
  max-height: 1040px;
  backdrop-filter: blur(5px);
  background: rgba(238, 238, 238, 0.8);
  padding: 16px 16px;
  display: flex;
  width: calc(100% - 32px);
  .contenido-sectores {
    max-width: 1080px;
    margin: 0 auto;
    overflow: auto;
  }
}
.envolvente {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: [first] 60% [line2] 40%;
  grid-auto-rows: minmax(100px, auto);
  gap: 15px;
  .descripcion {
    grid-column: 1 / 2;
    grid-row: 1;
  }
  .mapa-sectores {
    margin-top: auto;
    grid-column: 2 / 2;
    grid-row: 1 / 2;
    max-width: 300px;
  }
  .contenedor-stream-graph {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row: 2 / 2;
  }
  @media (max-width: 768px) {
    & {
      grid-template-columns: [first] 100%;
      grid-auto-rows: minmax(100px, auto);
      .descripcion {
        grid-row: 1;
        grid-column: 1;
      }
      .mapa-sectores {
        grid-row: 3;
        grid-column: 1;
        margin-left: auto;
        margin-right: auto;
        max-width: 300px;
      }
      .contenedor-stream-graph {
        grid-row: 2;
        grid-column: 1;
      }
    }
  }
}
</style>