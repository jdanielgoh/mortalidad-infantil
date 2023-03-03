<template>
  <div class="contenedor-stream-nomenclatura">
    <div class="contenedor-nomenclatura"></div>
    <div class="contenedor-stream" :id="id_stream_circular">
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
    };
  },

  mounted() {
    this.svg = d3
      .select(`div#${this.id_stream_circular}`)
      .select("svg.svg-stream");
    this.grupo_contenedor = this.svg.select("g.grupo-contenedor-de-stream");
    this.eje_x = this.svg.select("g.eje-x");
    this.eje_y = this.svg.select("g.eje-y");

    this.configurandoDimensionesSVG();

    if (this.datos.length > 0) {
      this.configurandoDimensionesStreams();
      this.agregandoNomenclatura();
      this.creandoStreams();
    }
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
        .style("font-family", "Roboto")
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
              (d) => -this.escalaRad(this.escalaRad.ticks(5).pop()) - 10
            )
            .attr("dy", "-1em")
            .style("fill", "#1a1a1a")
            .attr("class", "radial-escala")
            .style("fill", "#000")
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

      this.streams_apilados = this.grupo_contenedor
        .selectAll("streams")
        .data(this.datos_apilados)
        .enter()
        .append("path")
        .attr("class", "areas")
        .style("fill-opacity", 0.6)
        .style(
          "fill",
          (d) => this.variables.filter((v) => v.cve == d.key)[0].color
        )
        .attr("d", this.area)
        .attr("class", (d) => "cve-" + d.key);
    },
    actualizandoStreams() {
      this.streams_apilados
        .data(this.datos_apilados)

        .transition()
        .duration(1000)
        .style(
          "fill",
          (d) => this.variables.filter((v) => v.cve == d.key)[0].color
        )
        .attr("d", this.area)
        .attr("class", (d) => "cve-" + d.key);
    },
    reescalandoPantalla() {
      this.grupo_contenedor.selectAll("path").remove();
      this.configurandoDimensionesSVG();

      this.configurandoDimensionesStreams();
      this.agregandoNomenclatura();
      this.creandoStreams();
    },
  },
  watch: {
    datos(nv) {
      this.configurandoDimensionesStreams();
      this.agregandoNomenclatura();
      this.actualizandoStreams();
    },
  },
};
</script>

<style scoped lang="scss">
</style>
