<template>
  <div :style="{ height: alto + 100 + 'px' }">
    <div class="contenedor-tooltip-svg" :id="id_stream_circular">
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
      <svg class="svg-stream">
        <g class="grupo-contenedor-de-stream" />
        <g class="eje-x" />
        <g class="eje-y" />
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "StreamGraphCircular",
  props: {
    id_stream_circular: String,
    margen: {
      type: Object,
      default: function () {
        return { arriba: 30, abajo: 30, izquierda: 30, derecha: 30 };
      },
    },
    ancho_tooltip: {
      type: Number,
      default: 260,
    },
    alto_vis: {
      type: Number,
      default: function () {
        return 300;
      },
    },
    datos: {
      type: Array,
    },
    variables: {
      Array,
    },
    textoTooltip: {
      type: Function,
      default: function () {
        let txt = `<b> ${this.meses[this.tooltip_data_seleccionada.mes - 1]}</b> <br>`
        let datum = this.variables.map(d=> {return {cve: d.cve, cant: this.tooltip_data_seleccionada[d.cve], color : d.color, causa: d.causa}}).sort((a,b) => b.cant - a.cant)
        for(let i = 0; i< this.variables.length; i++){
          txt += `<p><span class="nomenclatura-tooltip" style="background: ${datum[i].color} "></span>
            <b> ${datum[i].cant.toLocaleString("en")}</b> ${datum[i].causa}  <p>`
        }
        return txt 
      },
    }
  },
  data() {
    return {
      parseDate: d3.timeParse("%d/%m/%Y"),
      descripcion: "",
      meses: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Oct.",
        "Noviembre",
        "Diciembre",
      ],
      alto:0
    };
  },

  mounted() {
    this.svg = d3
      .select(`div#${this.id_stream_circular}`)
      .select("svg.svg-stream");
    this.grupo_contenedor = this.svg.select("g.grupo-contenedor-de-stream");
    this.eje_x = this.svg.select("g.eje-x");
    this.eje_y = this.svg.select("g.eje-y");
    this.tooltip = d3.select("div#" + this.id_stream_circular)
        .select("div.tooltip");
    this.configurandoDimensionesSVG();

    this.configurandoDimensionesStreams();
    this.agregandoNomenclatura();
    this.creandoStreams();
    this.actualizandoStreams();

    window.addEventListener("resize", this.reescalandoPantalla);
  },
  methods: {
    configurandoDimensionesSVG() {
      this.ancho =
        document.getElementById(this.id_stream_circular).clientWidth -
        this.margen.izquierda -
        this.margen.derecha;
      this.alto = this.ancho;
      this.rmin = this.alto * 0.21;
      this.rmax = this.alto * 0.49;
      this.svg
        .attr("width", this.ancho + this.margen.izquierda + this.margen.derecha)
        .attr("height", this.alto + this.margen.arriba + this.margen.abajo);
      this.grupo_contenedor.attr(
        "transform",
        `translate(${this.margen.izquierda + 0.5 * this.ancho},${
          this.margen.arriba + 0.5 * this.alto
        })`
      );
      
    },
    configurandoDimensionesStreams() {
      this.escalaAng = d3
        .scaleLinear()
        .domain([1, 13])
        .range([-Math.PI * 0.5, 1.5 * Math.PI]);
      this.escalaRad = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(
            this.datos.map((d) => d3.sum(this.variables.map((dd) => d[dd.cve])))
          ),
        ])
        //.domain([0,1])
        .range([this.rmin, this.rmax]);

      this.datos_apilados = d3
        .stack()
        .offset(d3.stackOffsetNone)
        .keys(this.variables.map((d) => d.cve))(this.datos);
      this.reordenamientoDatosApilados();
      this.area = d3
        .area()
        .x0(
          (d, i) => this.escalaRad(d[0]) * Math.cos(this.escalaAng(d.data.mes))
        )
        .x1(
          (d, i) => this.escalaRad(d[1]) * Math.cos(this.escalaAng(d.data.mes))
        )
        .y0(
          (d, i) => this.escalaRad(d[0]) * Math.sin(this.escalaAng(d.data.mes))
        )
        .y1(
          (d, i) => this.escalaRad(d[1]) * Math.sin(this.escalaAng(d.data.mes))
        )
        .curve(d3.curveCatmullRomClosed);
    },
    reordenamientoDatosApilados() {
      for (var i = 0; i < this.datos.length; i++) {
        var diccionario_apilado = [];
        for (var cats = 0; cats < this.datos_apilados.length; cats++) {
          diccionario_apilado[cats] = {
            cat: cats,
            intervalo: this.datos_apilados[cats][i],
            delta:
              this.datos_apilados[cats][i][1] - this.datos_apilados[cats][i][0],
          };
        }
        let eff = diccionario_apilado.sort((a, b) =>
          d3.ascending(a.delta, b.delta)
        );
        let contador_apilador = 0;
        for (var cats = 0; cats < this.datos_apilados.length; cats++) {
          diccionario_apilado[cats].intervalo = [
            contador_apilador,
            contador_apilador + diccionario_apilado[cats].delta,
          ];
          this.datos_apilados[diccionario_apilado[cats].cat][i][0] =
            contador_apilador;
          this.datos_apilados[diccionario_apilado[cats].cat][i][1] =
            contador_apilador + diccionario_apilado[cats].delta;
          contador_apilador += diccionario_apilado[cats].delta;
        }
      }
    },

    agregandoNomenclatura() {
      this.grupo_contenedor.selectAll(".lineas-guia").remove();
      this.grupo_contenedor.selectAll(".texto-guia").remove();

      this.grupo_contenedor
        .selectAll("lins")
        .data(d3.range(1, 13))
        .enter()
        .append("line")
        .attr("class", "lineas-guia")
        .attr("x1", (d) => this.rmin * Math.cos(this.escalaAng(d)))
        .attr("x2", (d) => this.rmax * Math.cos(this.escalaAng(d)))
        .attr("y1", (d) => this.rmin * Math.sin(this.escalaAng(d)))
        .attr("y2", (d) => this.rmax * Math.sin(this.escalaAng(d)))
        .style("stroke-opacity", ".5")
        .style("stroke", "#000")
        .style("stroke-dasharray", "3 2");
      this.grupo_contenedor
        .selectAll("texs")
        .data(d3.range(1, 13))
        .enter()
        .append("text")
        .attr("class", "texto-guia")

        .attr("x", (d) => this.rmax * Math.cos(this.escalaAng(d)))
        .attr("y", (d) => this.rmax * Math.sin(this.escalaAng(d)))
        .text((d) => this.meses[parseInt(d - 1)])
        .style("fill-opacity", ".8")
        .style("font-family", "Poppins")
        //.style("text-anchor","middle")
        .style("dominant-baseline", "middle")
        .style("text-anchor", "middle")
        .style("font-size", "14px");

      /**
       * Lineal
       */
      this.grupo_contenedor.selectAll(".radial-escala").remove();
      this.grupo_contenedor
        .attr("text-anchor", "middle")
        .call((g) =>
          g
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", "-0.5em")
            .attr(
              "y",
              -this.escalaRad(0)
            )
            .attr("dy", "+1em")
            .style("fill", "#1a1a1a")
            .attr("class", "radial-escala")
            .style("fill", "#000")
            .attr("text-anchor","middle")
            .text("Defunciones")
        )
        .call((g) =>
          g
            .selectAll("g")
            .data(this.escalaRad.ticks(5))
            .join("g")
            .attr("fill", "none")
            .call((g) =>
              g
                .append("circle")
                .attr("class", "radial-escala")

                .style("stroke", "#000")
                .style("stroke-opacity", 0.5)
                .attr("r", this.escalaRad)
            )
            .call((g) =>
              g
                .append("text")
                .attr("y", (d) => -this.escalaRad(d))
                .attr("dy", "0.35em")
                .attr("class", "radial-escala")

                .style("fill", "#000")
                .text(this.escalaRad.tickFormat(6, "s"))
            )
        );
    },
    creandoStreams() {
      this.grupo_contenedor
        .selectAll("path")
        .data(this.datos_apilados)
        .join(
          (enter) => enter.append("path").transition().duration(1000).attr("d", this.area),
          null, // no update function

          (exit) => {
            exit.style("fill-opacity", 0).remove();
          }
        )
        .attr("class", (d) => "cve-" + d.key)
        .transition().duration(1000).attr("d", this.area)

        .style(
          "fill",
          (d) => this.variables.filter((v) => v.cve == d.key)[0].color
        )
        .style("fill-opacity", 0.8);
        this.svg
          .on("mousemove", (evento) => {
            this.mostrarTooltip(evento);
          })
          .on("mouseout", this.cerrarTooltip);
    },
    cerrarTooltip(){
      this.tooltip.style("visibility", "hidden");

    },
    actualizandoStreams() {
      this.grupo_contenedor
        .selectAll("path")
        .data(this.datos_apilados)
        .join(
          (enter) => enter.append("path").transition().duration(1000).attr("d", this.area),
          null, // no update function

          (exit) => {
            exit.style("fill-opacity", 0).remove();
          }
        )
        .attr("class", (d) => "cve-" + d.key)

        .transition().duration(1000).attr("d", this.area)
        .style(
          "fill",
          (d) => this.variables.filter((v) => v.cve == d.key)[0].color
        )
        .style("fill-opacity", 0.8);
    },
    mostrarTooltip(evento){
      let x = evento.layerX - 0.5 * this.ancho;
      let y = evento.layerY - 0.5 * this.alto;
      let angulo = Math.atan(y / x) + 0.5 * Math.PI;
      if (x >= 0) {
        angulo = angulo;
      } else {
        angulo = angulo + Math.PI;
      }
      angulo = angulo - .5 * Math.PI
      let bisectCantidad = d3.bisector((d) => d).center;
        let y0 = this.escalaAng.invert(angulo);
        let indiceY = bisectCantidad([1,2,3,4,5,6,7,8,9,10,11,12].map(d => d), y0)
      this.tooltip_data_seleccionada = this.datos.filter(d=>indiceY == d.mes-1)[0];
      
      this.tooltip
        .style("visibility", "visible")
        .style(
          "left",
          `${
            angulo < Math.PI
              ? evento.layerX - this.ancho_tooltip - 15
              : evento.layerX + 15
          }px`
        )
        .attr("width", this.ancho_tooltip)
        .attr("height", 30);
        let contenido_tooltip = this.tooltip
            .select(".tooltip-contenido")
            .style("min-width", this.ancho_tooltip + "px")
            .style("width", this.ancho_tooltip + "px")
            .style("padding", "0 3px 0 10px");
          contenido_tooltip
            .select("div.tooltip-cifras")
            .html(this.textoTooltip());
   
      this.tooltip.style(
        "top",
        `${
          angulo > 0.5 * Math.PI && angulo < 1.5 * Math.PI
            ? evento.layerY - parseInt(contenido_tooltip.style("height")) - 10
            : evento.layerY + 15
        }px`
      );
      
    },
    reescalandoPantalla() {
      this.grupo_contenedor.selectAll("path").remove();
      this.configurandoDimensionesSVG();

      this.configurandoDimensionesStreams();
      this.agregandoNomenclatura();
      this.creandoStreams();
      this.actualizandoStreams();
    },
  },
  watch: {
    datos(nv, ov) {
      this.configurandoDimensionesSVG();

      this.configurandoDimensionesStreams();
      this.agregandoNomenclatura();
      if (ov.length < 1) {
        this.creandoStreams();
      }
      this.actualizandoStreams();
    },
  },
};
</script>

<style scoped lang="scss">
div.contenedor-tooltip-svg {
  position: relative;
  svg {
    position: absolute;
    top: 0;
  }
  div.tooltip {
    color: #000;
    font-size: 12px;
    position: absolute;
    z-index: 2;
    visibility: hidden;
    backdrop-filter: blur(5px);
    background: rgba(222, 222, 222, 0.5);
    border-radius: 4px;
  }

  div.tooltip:deep() div.tooltip-cifras {
    padding-bottom: 5px;

    p {
      margin: 3px;

      span.nomenclatura-tooltip {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: solid 1px rgba(0, 0, 0, 0.5);
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
    border: none;
    background: transparent;
    font-size: 30px;
    line-height: 0.9;
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
