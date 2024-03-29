<template>
  <div v-bind:id=barras_id class="contenedor-barras">
    <slot name="encabezado"></slot>
    <div class="contenedor-tooltip-svg">
      <div class="tooltip">
        <div class="tooltip-contenido">
          <div class="contenedor-boton-cerrar">
            <button class="boton-cerrar-tooltip" @click="cerrarTooltip">
              &times;
            </button>
          </div>
          <div class="tooltip-cifras"></div>
        </div>
      </div>
      <div class="rotation-wrapper-outer">
        <div class="rotation-wrapper-inner">
          <div :style="{width: `${alto_vis - margen.arriba - margen.abajo}px`,
                    transform: `rotate(-90deg)translateX(calc(-100% - ${.5 * margen.arriba}px))`}" class="element-to-rotate">
            <p style="padding:10px 0 5px 0" v-html="titulo_eje_y"></p>
          </div>
        </div>
      </div>
      <svg class="svg-barras">
        <defs></defs>
        <g class="grupo-fondo"></g>
        <g class="grupo-contenedor-de-barras"></g>
        <g class="grupo-frente"></g>
      </svg>
      <div class="eje-x">
        <p :style="{
                    padding: `${margen.abajo +10 }px ${margen.derecha}px 0 ${margen.izquierda + ancho_leyenda_y}px `
                }" v-html="titulo_eje_x"></p>
      </div>
    </div>
    <slot name="pie"></slot>

  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: 'Barras',
  props: {
    barras_id: String,
    datos: Array,
    variables: {
      type: Array,
      default: function () {
        return []
      }
    },
    orientacion: {
      type: String,
      default: 'vertical'
    },
    nombre_barra: String,
    nombre_color: String,
    titulo_eje_y: String,
    titulo_eje_x: String,
    ancho_tooltip: {
      type: Number,
      default: 195
    },
    margen: {
      type: Object,
      default: function () {
        return {arriba: 20, abajo: 50, izquierda: 60, derecha: 20}
      }
    },
    alto_vis: {
      type: Number,
      default: function () {
        return 250
      }
    },
    espaciado_barras: {
      type: Number,
      default: function () {
        return .3
      }
    },
    logo_conacyt: {
      type: Boolean,
      default: function () {
        return true
      }
    },
    tooltip_activo: {
      type: Boolean,
      default: function () {
        return true
      }
    },
    seleccionada:{
      type: String
    },
    textoTooltip: {
      type: Function,
      default: function () {
        var txt = []
        this.variables.map((d) => {
          txt.push(`<p><span class="nomenclatura-tooltip" style="background: ${this.tooltip_data_seleccionada.color}"></span>
                        ${d[this.nombre_color]} | <b>${this.tooltip_data_seleccionada[d.id].toLocaleString("en")}</b> |
                        ${this.tooltip_data_seleccionada["defunciones"].toLocaleString("en")} | ${this.tooltip_data_seleccionada["poblacion"].toLocaleString("en")}
                        </p>`)
        })
        return `<p>${this.tooltip_categoria}</p>
                        ${txt.reverse().join(" ")}`
      }
    },
    apiladas_o_agrupadas:{
      default: () => "apiladas",
      type: String
    },
    padding_agrupadas: {
      type: Number,
      default: () => .1
    }
  },
  watch: {
    variables() {
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.actualizandoBarras();
    },
    datos() {
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.actualizandoBarras();
    }
  },
  data() {
    return {
      width: 200,
      ancho_leyenda_y: 0,
    }
  },
  mounted() {
    this.svg = d3.select(`#${this.barras_id} .svg-barras`);
    this.grupo_contenedor = this.svg.select(".grupo-contenedor-de-barras");
    this.grupo_fondo = this.svg.select(".grupo-fondo");
    this.grupo_frente = this.svg.select(".grupo-frente");
    this.eje_y = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-y")
    this.eje_x = this.grupo_contenedor
        .append("g")
        .attr("class", "eje-x")
    this.tooltip = d3.select(`#${this.barras_id} .tooltip`);
    this.configurandoDimensionesParaSVG();
    if(this.datos.length>0){
      this.configurandoDimensionesParaBarras();
      this.creandoBarras();
      this.actualizandoBarras();
    }
    
    window.addEventListener("resize", this.reescalandoPantalla)
  },
  destroyed() {
    window.removeEventListener("resize", this.reescalandoPantalla)
  },
  methods: {
    configurandoDimensionesParaSVG() {
      this.ancho_leyenda_y = document.querySelector(`#${this.barras_id} .rotation-wrapper-outer .element-to-rotate`)
          .clientHeight;
      this.ancho = document.querySelector(`#${this.barras_id}`).clientWidth - this.margen.derecha - this.margen.izquierda - this.ancho_leyenda_y
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;
      this.svg
          .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
          .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
          .style("left", this.ancho_leyenda_y + "px");
      this.grupo_contenedor
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)
      this.grupo_fondo
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)
      this.grupo_frente
          .attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba})`)
    },
    configurandoDimensionesParaBarras() {
      this.data_apilada = d3.stack()
          .keys(this.variables.map(d => d.id))(this.datos)
      for (let i = 0; i < this.variables.length; i++) {
        this.data_apilada[i].forEach(d => {
          d.data = Object.assign({}, d.data, {"key": this.data_apilada[i].key})
        })
      }
      if (this.orientacion === 'vertical') {
        if(this.apiladas_o_agrupadas === "apiladas"){
          
          this.escalaY = d3.scaleLinear()
            .domain([0, d3.max(this.datos.map((d) => d3.sum(this.variables.map(dd => d[dd.id]))))])
            .range([this.alto, 0]);
        }
        else{
          this.escalaY = d3.scaleLinear()
            .domain([0, d3.max(this.datos.map((d) => d3.max(this.variables.map((dd) => d[dd.id]))))])
            .range([this.alto, 0]);
        }
        
        this.escalaX = d3.scaleBand()
            .domain(this.datos.map(d => d[this.nombre_barra]))
            .range([0, this.ancho])
            .padding(this.espaciado_barras)
        
        // Esta escala se usará sólo para agrupadas
        this.escalaXSub = d3.scaleBand()
          .domain(this.variables.map((d) => d.id))
          .range([0, this.escalaX.bandwidth()])
          .padding(this.padding_agrupadas);
        this.eje_y.call(d3.axisLeft(this.escalaY).ticks(4))
        this.eje_y.select("path.domain")
            .remove()
        this.eje_y.selectAll("line")
            .attr("x1", this.ancho)
            .style("stroke-dasharray", "3 2")
            .style("stroke", "#707070")
        this.eje_x.call(d3.axisBottom(this.escalaX).ticks(4))
            .attr("transform", `translate(${0}, ${this.alto})`)
        this.eje_x.select("path").remove()
        this.eje_x.selectAll("line").remove()
      }
      else {
        if(this.apiladas_o_agrupadas === "apiladas"){
          this.escalaX = d3.scaleLinear()
            .domain([0, d3.max(this.datos.map(d => d3.sum(this.variables.map(dd => d[dd.id]))))])
            .range([0, this.ancho]);
        }
        else{
          this.escalaX = d3.scaleLinear()
            .domain([0, d3.max(this.datos.map(d => d3.max(this.variables.map(dd => d[dd.id]))))])
            .range([0, this.ancho]);
        }
        this.escalaY = d3.scaleBand()
            .domain([... this.datos].sort((a,b) => b.tasa-a.tasa).map(d => d[this.nombre_barra]))
            //.domain(this.datos.map(d => d[this.nombre_barra]))

            .range([0, this.alto])
            .padding(this.espaciado_barras)
        
            // Esta escala se usará sólo para agrupadas
        this.escalaYSub = d3.scaleBand()
          .domain(this.variables.map((d) => d.id))
          .range([0, this.escalaY.bandwidth()])
          .padding(this.padding_agrupadas);
        this.eje_y.call(d3.axisLeft(this.escalaY))
        this.eje_y.select("path.domain").remove()
        this.eje_y.selectAll("line").remove()
        this.eje_x.call(d3.axisBottom(this.escalaX).ticks(10))
            .attr("transform", `translate(${0}, ${this.alto})`)
            this.eje_x.selectAll("text")
            .style("transform","rotate(-90deg)translate(-8px, -15px)")
            .style("text-anchor","end")
            .style("dominant-baseline","middle")
        this.eje_x.select("path.domain").remove()
        this.eje_x.selectAll("line")
            .attr("y1", -this.alto)
            .style("stroke-dasharray", "3 2")
            .style("stroke", "#707070")
      }
    },
    creandoBarras() {
      this.grupo_contenedor.selectAll(".g-rects").remove();
      this.barras_juntadas = this.grupo_contenedor
          .selectAll(".g-rects")
          .data(this.data_apilada)
          .enter()
          .append("g")
          .attr("class", (d) => `${d.key} g-rects`)
      this.barras_individuales = this.barras_juntadas
          .selectAll("rect")
          .data((d) => d)
          .enter()
          .append("rect")
          .style("fill", (d,i) =>d.data.clave == this.seleccionada ? "#000" : "#6e6e6e")
          //.style("fill", (d, i) => {return d.data.color})

      if (this.tooltip_activo) {
        this.svg
            .on("mousemove", (evento) => {
              this.mostrarTooltip(evento)
            })
            .on("mouseout", this.cerrarTooltip)
      }
    },
    actualizandoBarras() {
      if(this.orientacion === 'vertical') {
        if(this.apiladas_o_agrupadas === "apiladas"){
          this.barras_individuales
            .attr("width", this.escalaX.bandwidth)
            .attr("height", d => this.escalaY(d[0]) - this.escalaY(d[1]))
            .attr("x", d => this.escalaX(d.data[this.nombre_barra]))
            .attr("y", d => this.escalaY(d[1]))
        }
        else{
          this.barras_individuales
            .attr("width", this.escalaXSub.bandwidth)
            .attr("height", (d) => this.escalaY(d[0]) - this.escalaY(d[1]))
            .attr("x", (d) => this.escalaX(d.data[this.nombre_barra]) + this.escalaXSub(d.data.key))
            .attr("y", (d) => this.escalaY(d[1] - d[0]));
        }
        
      }
      else {
        if(this.apiladas_o_agrupadas === "apiladas"){
          this.barras_individuales
              .attr("width", d => this.escalaX(d[1]) - this.escalaX(d[0]))
              .attr("height", this.escalaY.bandwidth)
              .attr("x", d => this.escalaX(d[0]))
              .attr("y", d => this.escalaY(d.data[this.nombre_barra]))
        }else{
          this.barras_individuales
              .attr("width", d => this.escalaX(d[1]) - this.escalaX(d[0]))
              .attr("height", this.escalaYSub.bandwidth)
              .attr("x", d => d3.min(this.escalaX.domain()))
              .attr("y", d => this.escalaY(d.data[this.nombre_barra]) + this.escalaYSub(d.data.key))
        }
      }
    },
    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaBarras();
      this.actualizandoBarras();
    },
    mostrarTooltip(evento) {
      // TODO: volter esto layerX y this.escalaX.step();
      if(this.orientacion === 'vertical') {
        this.tooltip_bandas = this.escalaX.step();
        this.tooltip_indice = parseInt((evento.layerX - this.margen.izquierda - this.margen.derecha) / this.tooltip_bandas)
        if (this.tooltip_indice < this.datos.length) {
          this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice]
          this.tooltip_data_seleccionada = this.data_apilada[0].filter(dd => (dd.data[this.nombre_barra] == this.tooltip_categoria))[0].data;
          this.tooltip
              .style("visibility", "visible")
              .style("left", evento.layerX > .5 * (this.ancho + this.margen.izquierda + this.margen.derecha) ? `${evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 20}px` : `${evento.layerX + this.ancho_leyenda_y + 20}px`)
              .style("top", evento.layerY + "px")
          let contenido_tooltip = this.tooltip.select(".tooltip-contenido")
              .style("min-width", this.ancho_tooltip + "px")
              .style("border-radius", "8px")
              .style("width", this.ancho_tooltip + "px")
              .attr("height", 70)
              .style("padding", "0 3px 0 10px")
          contenido_tooltip.select("div.tooltip-cifras")
              .html(this.textoTooltip())
          this.barras_individuales
              .style("fill-opacity", ".2")
          this.barras_individuales
              .filter(d => d.data[this.nombre_barra] == this.tooltip_categoria)
              .style("fill-opacity", "1")
        }
      }
      else {
        this.tooltip_bandas = this.escalaY.step();
        this.tooltip_indice = parseInt((evento.layerY - this.margen.arriba + this.espaciado_barras) / this.tooltip_bandas)
        if (this.tooltip_indice < this.datos.length) {
          this.tooltip_categoria = this.escalaY.domain()[this.tooltip_indice]
          this.tooltip_data_seleccionada = this.data_apilada[0].filter(dd => (dd.data[this.nombre_barra] == this.tooltip_categoria))[0].data;
          this.tooltip
              .style("visibility", "visible")
              .style("left", evento.layerX > .5 * (this.ancho + this.margen.izquierda + this.margen.derecha) ? `${evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 20}px` : `${evento.layerX + this.ancho_leyenda_y + 20}px`)
              .style("top", evento.layerY + "px")
          let contenido_tooltip = this.tooltip.select(".tooltip-contenido")
              .style("min-width", this.ancho_tooltip + "px")
              .style("border-radius", "8px")
              .style("width", this.ancho_tooltip + "px")
              .attr("height", 70)
              .style("padding", "0 3px 0 10px")
          contenido_tooltip.select("div.tooltip-cifras")
              .html(this.textoTooltip())
          this.barras_individuales
              .style("fill-opacity", ".2")
          this.barras_individuales
              .filter(d => d.data[this.nombre_barra] == this.tooltip_categoria)
              .style("fill-opacity", "1")
        }
      }
    },
    cerrarTooltip() {
      this.tooltip
          .style("visibility", "hidden");
      this.barras_individuales
          .style("fill-opacity", "1")
    },
  }
}
</script>

<style lang="scss" scoped>
$border-radius-tarjeta: 10px;
svg.svg-barras {
  position: absolute;
  top: 0;
}

div.contenedor-tooltip-svg {
  position: relative;
  svg{
    z-index: 0;
  }
  .rotation-wrapper-outer {
    display: table;
    .rotation-wrapper-inner {
      padding: 50% 0;
      height: 0;
      .element-to-rotate {
        display: block;
        transform-origin: top left;
        //transform: rotate(-90deg) translate(-100%);
        margin-top: -50%;
        font-size: 12px;
        text-align: center;
        font-weight: 600;
      }
    }
  }
  div.eje-x {
    position: relative;
    width: 100%;
    text-align: center;
    font-size: 12px;
    text-align: center;
    font-weight: 600;
  }
  div.tooltip {
    font-size: 12px;
    position: absolute;
    z-index: 2;
    visibility: hidden;
    backdrop-filter: blur(5px);
  background: rgba(222,222,222, 0.5);
  border-radius: 4px;
  }
  div.tooltip::v-deep
  div.tooltip-cifras {
    padding-bottom: 5px;
    p {
      margin: 3px;
      span.nomenclatura-tooltip {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: solid 1px rgba(255, 255, 255, .7);
        display: inline-block;
      }
    }
  }
  div.tooltip div.contenedor-boton-cerrar {
    height: auto;
    display: flex;
    width: 100%;
    padding-top: 5px;
    font-weight: 600;
  }
  div.tooltip button.boton-cerrar-tooltip {
    background: transparent;
    border: none;
    font-size: 30px;
    line-height: .9;
    font-weight: 300;
    padding: 0 5px;
    border-radius: 5px;
    margin: 0 0 0 auto;
    @media (min-width: 768px) {
      display: none;
    }
    cursor: pointer;
    img {
      width: 30px;
      height: 30px;
      float: right;
    }
  }
}
</style>