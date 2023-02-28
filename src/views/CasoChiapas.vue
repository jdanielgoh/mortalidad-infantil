<template>
    <div id="vista-caso-chiapas">
        <OrdinalBrush
         :getter_store="'cambiarRangoEdadChiapas'"
        ></OrdinalBrush>
        <div class="contenedor-componente-barras">
            <Barras
            :barras_id="'barras-grupo'"
            :datos="datos_graf"
            :nombre_barra="'grupo'"
            :nombre_color="'cantidad'"
            titulo_eje_x="Eje horizontal (categórico)"
            titulo_eje_y="Eje vertical (numérico)"
            :variables="[{id:'cantidad', nombre_colores:'cantidad', color: '#7fcdbb'}]"/>

        </div>
        <Barras
            :barras_id="'barras-grupo'"
            :datos="datos_graf"
            :nombre_barra="'grupo'"
            :nombre_color="'cantidad'"
            titulo_eje_x="Eje horizontal (categórico)"
            titulo_eje_y="Eje vertical (numérico)"
            :variables="[{id:'cantidad', nombre_colores:'cantidad', color: '#7fcdbb'}]"/>
  
    </div>
  </template>
  <script>
  import * as d3 from "d3";
  import OrdinalBrush from "@/components/OrdinalBrush.vue";
  import Barras from "@/components/Barras.vue";

  import { mapState } from 'vuex';

  export default {
    name: "CasoChiapas",
    components: {
        OrdinalBrush,
        Barras
    },
    data() {
      return {
        datos_graf:[]
      };
    },
    beforeMount() {
      d3.csv("data/mortalidadchiapas2021.csv").then((data) => {
        data.forEach(d=>{
            if(["m", "d", "h"].map(l => d.edad.toLowerCase().includes(l)).includes(true)){
                d.EDAD = 0 ;
            }
            else{
                d.EDAD = +d.edad
            }

        })
        this.datos = data
        let ef = d3.rollup(data, v=>v.length, d=>d.grupo)
        this.lista_causas = [...ef.keys()]

        //this.datos = data;
      });
    },
    methods: {


    },
    computed: {
    ...mapState(["rango_edad_chiapas"])
  },
  watch:{
    rango_edad_chiapas(nv){
        let datos_graf = d3.rollup(
            this.datos.filter(d=>nv.includes(d.EDAD) ),
            v=>v.length, 
            d=>d.grupo
            )
        let arreglo = [];
        for(var i = 0 ; i< this.lista_causas.length; i++){
            arreglo.push({
                "grupo" : this.lista_causas[i],
                "cantidad": [...datos_graf.keys()].includes(this.lista_causas[i]) ? datos_graf.get(this.lista_causas[i]) : 0
            })
        }
        this.datos_graf = arreglo
    }
  }

  };
  </script>
  <style lang="scss">



  </style>