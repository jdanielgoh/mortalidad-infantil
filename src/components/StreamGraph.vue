<template>
  <div class="envolvente">
    

    <div :id="stream_graph_id" class="contenedor-stream-graph">
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
            <div
              :style="{
                width: `${alto_vis - margen.arriba - margen.abajo}px`,
                transform: `rotate(-90deg)translateX(calc(-100% - ${
                  0.5 * margen.arriba
                }px))`,
              }"
              class="element-to-rotate"
            >
              <p style="padding: 10px 0 5px 0" v-html="titulo_eje_y"></p>
            </div>
          </div>
        </div>
        <svg class="svg-streamgraph">
          <g class="grupo-fondo">
            <g class="eje-y"></g>
          </g>
          <g class="grupo-contenedor-de-streams"></g>
          <g class="grupo-contenedor-de-ejes"></g>

          <g class="grupo-frente">
            <g class="eje-x"></g>
            <g class="eje-y"></g>
            <line class="guia-x"></line>
          </g>
        </svg>
        <div class="eje-x">
          <p
            :style="{
              padding: `${margen.abajo + 10}px ${margen.derecha}px 0 ${
                margen.izquierda + ancho_leyenda_y
              }px `,
            }"
            v-html="titulo_eje_x"
          ></p>
        </div>
      </div>
      
    </div>
  </div>
</template>
  
  <script>
import * as d3 from "d3";

export default {
  name: "DadsigAreasApiladas",
  components: {},

  props: {
    stream_graph_id: String,
    datos: Array,
    variables: Array,
    titulo_eje_y: String,
    titulo_eje_x: String,

    nombre_columna_horizontal: String,
    conversionTemporal: {
      type: Function,
      default: d3.timeParse("%Y"),
    },

    tooltip_activo: {
      default: true,
      type: Boolean,
    },

    ancho_tooltip: {
      type: Number,
      default: 210,
    },

    tickFormat: {
      default: (d) => d,
      type: Function,
    },
    margen: {
      type: Object,
      default: () => ({
        arriba: 10,
        abajo: 35,
        izquierda: 40,
        derecha: 10,
      }),
    },
    textoTooltip: {
      type: Function,
      default: function () {
        let total_muestras = d3.sum(
          this.variables.map((d) => this.tooltip_data_seleccionada[d.id])
        );
        let cifras_variables = this.variables
          .map((d) => {
            return [
              `<p>
                              <span class="nomenclatura-tooltip" style="background: ${
                                d.color
                              } "></span>
                              ${d.nombre} <b>${parseInt(
                this.tooltip_data_seleccionada[d.id]
              )}</b>
                              (${Math.round(
                                (100 * this.tooltip_data_seleccionada[d.id]) /
                                  total_muestras
                              )}%)
                              </p>`,
              parseInt(this.tooltip_data_seleccionada[d.id]),
            ];
          })
          .sort((a, b) => b[1] - a[1])
          .map((d) => d[0])
          .slice(0, 10);
        return `Año: <b>${
          this.tooltip_data_seleccionada[this.nombre_columna_horizontal]
        }</b> <br/>${cifras_variables.join("")}`;
      },
    },
  },
  watch: {
    variables(nv) {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaStream();
      //this.creandoStreams();
      this.actualizandoStreams();
      //this.creandoBarras();
      this.actualizandoBarras();
    },
    datos() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaStream();
      //this.creandoStreams();
      this.actualizandoStreams();
      //this.creandoBarras();
      this.actualizandoBarras();
    },
    margen() {
      this.reescalandoPantalla();
      this.creandoBarras();
      this.actualizandoBarras();
    },
  },
  data: () => ({
    notas_open: false,
    orden_inicial: true,
    zoom_activo: "hidden",
    width: 200,
    height: 0,
    height_vis: Number,
    lista_filtros_activos: Array,
    status_button: "Quitar todos",
    alto_vis: 450,
    tooltip_is_showing: false,
    width: 200,
    ancho_leyenda_y: 0,
    tooltip_data_seleccionada: {},
    opacidad_barras_default: 1,
    opacidad_areas_default: 0.7,
    opacidad_barras_over: 0.1,
    opacidad_areas_over: 0.1,
    opacidad_barra_over: 1,
    duracion_transicion: 200,
    duracion_transicio_cambio_data: 500,
  }),
  mounted() {
    //this.boton_otras = document.getElementById('boton_otras');

    /*this.lista_filtros_activos = this.variables.map(d => true);
      this.categorias_checkeadas = this.variables.map((d, i) => this.lista_filtros_activos[i] ? d.id : "").filter((d) => d != "");*/

    this.svg = d3.select(`div#${this.stream_graph_id} svg.svg-streamgraph`);
    this.grupo_contenedor = this.svg.select("g.grupo-contenedor-de-streams");

    this.grupo_frente = this.svg.select("g.grupo-frente");
    this.grupo_fondo = this.svg.select("g.grupo-fondo");

    this.eje_x = this.grupo_frente.select("g.eje-x");
    this.eje_y = this.grupo_fondo.select("g.eje-y");

    this.guia_x = this.grupo_frente
      .select("line.guia-x")
      .style("stroke", "gray");

    this.ejes_anios = this.grupo_fondo
      .selectAll("g.ejes-anios")
      .data(d3.range(2012, 2022))
      .enter();

    this.textos_ejes_anios = this.ejes_anios.append("text");

    this.configurandoDimensionesParaSVG();
    this.configurandoDimensionesParaStream();
    this.creandoStreams();
    this.actualizandoStreams();
    this.creandoBarras();
    this.actualizandoBarras();

    this.tooltip = d3.select("div#" + this.stream_graph_id + " div.tooltip");

    window.addEventListener("resize", this.reescalandoPantalla);
  },
  methods: {
    multiFormat(date) {
      /**
       * Método para traducir el formato de fecha
       */
      this.locale = d3.timeFormatLocale({
        decimal: ",",
        thousands: ".",
        grouping: [3],
        currency: ["€", ""],
        dateTime: "%A, %e %B %Y г. %X",
        date: "%d.%m.%Y",
        time: "%H:%M:%S",
        periods: ["AM", "PM"],
        days: [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
        ],
        shortDays: ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
        months: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],
        shortMonths: [
          "ene",
          "feb",
          "mar",
          "abr",
          "may",
          "jun",
          "jul",
          "ago",
          "sep",
          "oct",
          "nov",
          "dic",
        ],
      });
      this.formatMillisecond = this.locale.format(".%L");
      this.formatSecond = this.locale.format(":%S");
      this.formatMinute = this.locale.format("%I:%M");
      this.formatHour = this.locale.format("%I %p");
      this.formatDay = this.locale.format("%a %d");
      this.formatWeek = this.locale.format("%b %d");
      this.formatMonth = this.locale.format("%b");
      this.formatMonthYear = this.locale.format("%b/%Y");
      this.formatYear = this.locale.format("%Y");
      return (
        d3.timeSecond(date) < date
          ? this.formatMillisecond
          : d3.timeMinute(date) < date
          ? this.formatSecond
          : d3.timeHour(date) < date
          ? this.formatMinute
          : d3.timeDay(date) < date
          ? this.formatHour
          : d3.timeMonth(date) < date
          ? d3.timeWeek(date) < date
            ? this.formatDay
            : this.formatWeek
          : d3.timeYear(date) < date
          ? this.formatMonthYear
          : this.formatMonthYear
      )(date);
    },
    configurandoDimensionesParaSVG() {
      this.ancho_leyenda_y = document.querySelector(
        "#" +
          this.stream_graph_id +
          " .rotation-wrapper-outer .element-to-rotate"
      ).clientHeight;

      this.ancho =
        document.querySelector(`#${this.stream_graph_id}`).clientWidth -
        this.margen.derecha -
        this.margen.izquierda -
        this.ancho_leyenda_y;

      this.alto_vis = window.innerWidth > 768 ? 520 : 350;
      this.alto = this.alto_vis - this.margen.arriba - this.margen.abajo;

      this.svg
        .attr("width", this.ancho + this.margen.derecha + this.margen.izquierda)
        .attr("height", this.alto + this.margen.arriba + this.margen.abajo)
        .style("left", this.ancho_leyenda_y + "px");

      this.grupo_contenedor.attr(
        "transform",
        `translate(${this.margen.izquierda},${
          this.margen.arriba - this.alto * 0
        })`
      );
      //.attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba - this.alto * .5})`)

      this.grupo_fondo.attr(
        "transform",
        `translate(${this.margen.izquierda},${this.margen.arriba})`
      );
      //.attr("transform", `translate(${this.margen.izquierda},${this.margen.arriba - this.alto * .5})`)

      this.grupo_frente.attr(
        "transform",
        `translate(${this.margen.izquierda},${this.margen.arriba})`
      );
    },
    configurandoDimensionesParaStream() {
      this.datos.forEach((d) => {
        d.fech = this.conversionTemporal(d[this.nombre_columna_horizontal]);
      });
      this.data_apilada = d3.stack().keys(this.variables.map((d) => d.id))(
        //.offset(d3.stackOffsetSilhouette)
        this.datos
      );
      for (let i = this.variables.length - 1; i >= 0; i -= 1) {
        this.data_apilada[i].forEach((dd) => {
          dd.data = Object.assign({}, dd.data, {
            key: this.data_apilada[i].key,
          });
        });
      }
      for (
        var indice_anio = 0;
        indice_anio < this.datos.length;
        indice_anio++
      ) {
        var dictsStack = [];
        for (
          var indice_franja = 0;
          indice_franja < this.data_apilada.length;
          indice_franja++
        ) {
          var min_val = d3.min(
            d3
              .range(this.data_apilada.length)
              .map((i) => this.data_apilada[i][indice_anio][0])
          );
          dictsStack[indice_franja] = {
            cat: indice_franja,
            intervalo: this.data_apilada[indice_franja][indice_anio],
            delta:
              this.data_apilada[indice_franja][indice_anio][1] -
              this.data_apilada[indice_franja][indice_anio][0],
            minimo: min_val,
          };
        }
        let eff = dictsStack.sort((a, b) => d3.ascending(a.delta, b.delta));
        let contador_apilador = 0; //d3.min(dictsStack.map(d=> d.intervalo));
        for (
          var indice_franja = 0;
          indice_franja < this.data_apilada.length;
          indice_franja++
        ) {
          if (indice_franja == 0) {
            contador_apilador = dictsStack[indice_franja].minimo;
          }

          dictsStack[indice_franja].intervalo = [
            contador_apilador,
            contador_apilador + dictsStack[indice_franja].delta,
          ];
          this.data_apilada[dictsStack[indice_franja].cat][indice_anio][0] =
            contador_apilador;
          this.data_apilada[dictsStack[indice_franja].cat][indice_anio][1] =
            contador_apilador + dictsStack[indice_franja].delta;
          contador_apilador += dictsStack[indice_franja].delta;
        }
      }
      this.escalaX = d3
        .scaleBand()
        .domain(this.datos.map((d) => +d[this.nombre_columna_horizontal]))
        .range([0, this.ancho])
        .paddingInner(0.85);
      this.escalaY = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(
            this.datos.map((d) => d3.sum(this.variables.map((dd) => d[dd.id])))
          ),
        ])
        .range([this.alto, 0]);

      this.data_apilada.forEach((d) => {
        let datums_paddings = [];
        for (let i = 0; i < d.length; i++) {
          datums_paddings.push(
            [
              d[i],
              this.escalaX(+d[i].data[this.nombre_columna_horizontal]),
            ].flat()
          );
          datums_paddings.push(
            [
              d[i],
              this.escalaX(+d[i].data[this.nombre_columna_horizontal]) +
                this.escalaX.bandwidth(),
            ].flat()
          );
        }
        d.datums_paddings = datums_paddings;
      });
      this.guia_x
        .attr("x1", 0)
        .attr("y1", this.escalaY(0))
        .attr("x2", 0)
        .attr("y2", this.escalaY(100))
        .style("stroke-opacity", 0);
      this.area = d3
        .area()

        .x((d) => this.escalaX(d.data.fech))
        .y0((d) => this.escalaY(d[0]))
        .y1((d) => this.escalaY(d[1]))
        .curve(d3.curveCatmullRom);

      this.textos_ejes_anios
        //.attr("x",d=> this.escalaX(this.conversionTemporal(d)))
        //.attr("y",this.alto_vis - this.margen.abajo)
        .text((d) => d)
        .style("transform", (d) => {
          return `translate(${this.escalaX(d) + this.escalaX.bandwidth()}px,${
            this.alto_vis - this.margen.abajo - this.margen.arriba + 6
          }px)rotate(-90deg)`;
        })
        .style("text-anchor", "end")
        .style("dominant-baseline", "middle")
        .style("font-size", "12px");

      this.eje_y.transition()
        .duration(600)
        .call(d3.axisLeft(this.escalaY).ticks(4));
      this.eje_y
        .selectAll("line")
        .attr("x1", this.ancho)
        .style("stroke-dasharray", "3 2")
        .style("stroke", "#707070");
      this.eje_y.selectAll("path").remove();
    },
    creandoStreams() {
      this.grupo_contenedor.selectAll("path.paths-streams").remove();

      this.grupo_contenedor.selectAll("path.paths-streams").remove();
      //console.log(this.data_apilada[0])
      this.streams_apilados = this.grupo_contenedor
        .selectAll("gpaths")
        .data(this.data_apilada)
        .enter()
        .append("path")
        .attr("class", (d) => `${d.key} paths-streams`)
        .style("fill-opacity", this.opacidad_areas_default)
        .style("stroke", "white")

        .style("stroke-opacity", ".3");
      if (this.tooltip_activo) {
        this.svg
          .on("mousemove", (evento) => {
            this.mostrarTooltip(evento);
          })
          .on("mouseout", this.cerrarTooltip);
      }
    },
    actualizandoStreams(transicion = true) {
      if(transicion){
        this.streams_apilados
          .data(this.data_apilada)
          .transition()
          .delay((d, i) => i * 5)
          .duration(this.duracion_transicio_cambio_data)
          .attr("d", (d) => this.generadorAreaBezier(d))
          .transition()
          .duration(this.duracion_transicio_cambio_data)
          //.duration(this.duracion_transicio_cambio_data)
          .style("fill", (d, i) => this.variables[i].color);
      }else{
        this.streams_apilados
          .data(this.data_apilada)
          .attr("d", (d) => this.generadorAreaBezier(d))
          .style("fill", (d, i) => this.variables[i].color);
      }
      
    },
    creandoBarras() {
      this.grupo_fondo.selectAll(".g-rects").remove();
      
    },
    actualizandoBarras() {
      this.grupo_fondo
        .selectAll(".g-rects")
        .data(this.data_apilada)
        .join(
          (enter) =>
            enter.append("g"),

          null, // no update function

          (exit) => {
            exit
              .transition()
              .duration(this.duracion_transicio_cambio_data)
              .style("fill-opacity", 0)
              .remove();
          }
        )
        .attr("class", (d) => `${d.key} g-rects`)
        .style("fill", (d, i) => this.variables[i].color)
        .selectAll("rect")
        .data(
          (d) => d,
          (d) => d.data.key
        )
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("width", this.escalaX.bandwidth)
              .attr("height", (d) => this.escalaY(d[0]) - this.escalaY(d[1]))
              .attr("x", (d) => this.escalaX(+d.data[this.nombre_columna_horizontal]))
              .attr("y", (d) => this.escalaY(d[1]))
              .style("fill-opacity", this.opacidad_barras_default),
          (join) => join,
          (exit) => {
            exit
              .transition()
              .duration(this.duracion_transicio_cambio_data)
              .style("fill-opacity", 0)
              .remove();
          }
        )  
        //.transition()
        //.delay((d, i) => i * 5)
        //.duration(5 * this.duracion_transicio_cambio_data)
        .attr("width", this.escalaX.bandwidth)
        .attr("height", (d) => this.escalaY(d[0]) - this.escalaY(d[1]))
        .attr("x", (d) => this.escalaX(+d.data[this.nombre_columna_horizontal]))
        .attr("y", (d) => this.escalaY(d[1]))
        .style("fill-opacity", this.opacidad_barras_default);
    },

    reescalandoPantalla() {
      this.configurandoDimensionesParaSVG();
      this.configurandoDimensionesParaStream();
      this.actualizandoStreams(false);
      this.actualizandoBarras();
    },
    mostrarTooltip(evento) {
      this.tooltip_bandas = this.escalaX.step();
      this.tooltip_indice = parseInt(
        (evento.layerX - this.margen.izquierda - this.margen.derecha) /
          this.tooltip_bandas
      );
      if (this.tooltip_indice < this.datos.length) {
        this.tooltip_categoria = this.escalaX.domain()[this.tooltip_indice];
        this.tooltip_data_seleccionada = this.data_apilada[0].filter(
          (dd) =>
            dd.data[this.nombre_columna_horizontal] == this.tooltip_categoria
        )[0].data;
        this.tooltip
          .style("visibility", "visible")
          .style(
            "left",
            evento.layerX >
              0.5 * (this.ancho + this.margen.izquierda + this.margen.derecha)
              ? `${
                  evento.layerX - this.ancho_tooltip + this.ancho_leyenda_y - 20
                }px`
              : `${evento.layerX + this.ancho_leyenda_y + 20}px`
          )
          //.style("width", this.ancho_tooltip + "px")
          .style("top", evento.layerY + 10 + "px");
        let contenido_tooltip = this.tooltip
          .select(".tooltip-contenido")
          .style("min-width", this.ancho_tooltip + "px")
          .style("width", this.ancho_tooltip + "px")
          .style("padding", "0 3px 0 10px");
        contenido_tooltip
          .select("div.tooltip-cifras")
          .html(this.textoTooltip());
        let alto_tooltip = parseInt(contenido_tooltip.style("height"));
        this.tooltip.style(
          "top",
          (evento.layerY < this.alto - alto_tooltip
            ? evento.layerY + 10
            : evento.layerY - 10 - alto_tooltip) + "px"
        );

        this.grupo_contenedor.selectAll("rect")
          .filter(
            (d) =>
              d.data[this.nombre_columna_horizontal] != this.tooltip_categoria
          )
          .interrupt()
          //.transition()
          //.duration(this.duracion_transicion)
          .style("fill-opacity", this.opacidad_barras_over);

          this.grupo_contenedor.selectAll("rect")
          .filter(
            (d) =>
              d.data[this.nombre_columna_horizontal] == this.tooltip_categoria
          )
          .interrupt()
          //.transition()
          //.duration(this.duracion_transicion)
          .style("fill-opacity", this.opacidad_barra_over);

        this.streams_apilados
          .interrupt()
          .transition()
          .duration(this.duracion_transicion)
          .style("fill-opacity", this.opacidad_areas_over);
      }
    },

    cerrarTooltip() {
      this.tooltip.style("visibility", "hidden");

      this.grupo_contenedor.selectAll("rect")
        //.transition()
        //.duration(this.duracion_transicion)
        .interrupt()
        .style("fill-opacity", this.opacidad_barras_default);
      this.streams_apilados
        .interrupt()
        .transition()
        .duration(this.duracion_transicion)
        .style("fill-opacity", this.opacidad_areas_default);
      this.tooltip_data_seleccionada = {};
    },
    generadorAreaBezier(datum) {
      if (datum.length > 2) {
        var txt = `M ${this.escalaX(
          +datum[0].data[this.nombre_columna_horizontal]
        )}, ${this.escalaY(datum[0][1])}`;
        for (let i = 0; i < datum.length - 1; i++) {
          //let x00 = this.escalaX(+datum[i-1].data.Year) - this.escalaX.bandwidth() * .5
          let x_i = this.escalaX(
            +datum[i].data[this.nombre_columna_horizontal]
          );
          let x_i_mas_1 = this.escalaX(
            +datum[i + 1].data[this.nombre_columna_horizontal]
          );

          let x_i_bandwidth = x_i + this.escalaX.bandwidth();
          let x_mid = 0.5 * (x_i_mas_1 - x_i_bandwidth) + x_i_bandwidth;

          let y_i = this.escalaY(datum[i][1]);
          let y_i_mas_1 = this.escalaY(datum[i + 1][1]);

          txt += `H ${x_i_bandwidth} C ${x_mid} ${y_i}, ${x_mid} ${y_i_mas_1}, ${x_i_mas_1} ${y_i_mas_1}H ${x_i_mas_1}`;
        }

        txt += `V ${this.escalaY(datum[datum.length - 1][0])}`;
        for (let i = datum.length - 1; i > 0; i--) {
          //let x00 = this.escalaX(+datum[i-1].data.Year) - this.escalaX.bandwidth() * .5
          let x_i = this.escalaX(
            +datum[i].data[this.nombre_columna_horizontal]
          );
          let x_i_menos_1 = this.escalaX(
            +datum[i - 1].data[this.nombre_columna_horizontal]
          );
          let x_i_bandwidth_menos_1 = this.escalaX.bandwidth() + x_i_menos_1;

          let x_mid =
            0.5 * (x_i - x_i_bandwidth_menos_1) + x_i_bandwidth_menos_1;

          let y_i = this.escalaY(datum[i][0]);
          let y_i_menos_1 = this.escalaY(datum[i - 1][0]);

          txt += ` C ${x_mid} ${y_i}, ${x_mid} ${y_i_menos_1}, ${x_i_bandwidth_menos_1} ${y_i_menos_1}H ${x_i_menos_1}`;
        }

        return txt;
      }
    },
  },
};
/* eslint-enable */
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss" scoped>
.descripcion {
  p {
    @media (max-width: 768px) {
      font-size: 14px;
    }
  }
}

svg.svg-streamgraph {
  position: absolute;
  top: 0;
}

div.contenedor-tooltip-svg {
  position: relative;

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
  