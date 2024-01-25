<template>
  <div id="vista-defunciones-temporales">
    <div class="contenedor-flex">
      <div class="contenedor-texto">
        <router-link to="/">Leer en español</router-link>
        <h1>Child and Adolescents Mortality in Mexico</h1>
        <p>
          This project emerged from the
          <i> Datatón sobre la niñez y adolescencia en México 2023</i>. The
          tool is aimed at researchers, decision-makers, and citizens interested
          in obtaining preventive information for children.
        </p>
        <p>
          Based on an exploration of the Mortality Database
          <a
            href="https://datamx.io/dataset/mortalidad-de-ninas-ninos-y-adolescentes-en-chiapas-2021"
            ><i>Mortalidad de Niñas, Niños y Adolescentes en Chiapas 2021</i></a
          >
          provided by <a href="https://redias.org/">REDIAS</a> it was found that
          for the age range between 14 and 15 years old, one of the main causes
          of death is intentionally self-inflicted injuries, and assaults were
          the leading cause of death for 16-year-olds. From this, several
          questions arise: How has the pandemic impacted the causes of death for
          the adolescent and child population? Is there an annual seasonality in
          which certain causes of death increase? And what are the main causes
          of mortality for any age group, and how have these causes changed over
          time?
        </p>

        <p>
          To answer the aforementioned questions, microdata from
          <a href="https://www.inegi.org.mx/programas/mortalidad/#Microdatos"
            >microdata from INEGI on mortality
          </a>
          and
          <a
            href="https://datos.gob.mx/busca/dataset/proyecciones-de-la-poblacion-de-mexico-y-de-las-entidades-federativas-2016-2050/resource/353817d4-ac9d-4709-bbd9-52936fe0423f"
            >mid-year population projections from CONAPO
          </a>
          were used to calculate rates and reduce population biases. The
          visualizations presented below aim to provide users with the tools to
          answer the aforementioned questions. You can adjust the controls to
          obtain information on the specific population group of your interest.
        </p>
      </div>
    </div>
    <div class="tablero">
      <div class="col-controles">
        <h2>Controls</h2>
        <div class="contenedor-selectores">
          <div class="contenedor-selector">
            <p>State</p>
            <select
              name="selector-entidad"
              id="selector-entidad"
              v-model="estado_seleccionado"
            >
              <option
                v-for="(entidad, i) in entidades"
                :value="entidad.cve"
                :key="i"
              >
                {{ entidad.estado }}
              </option>
            </select>
          </div>
          <div class="contenedor-selector">
            <p>Gender</p>
            <select
              name="selector-sexo"
              id="selector-sexo"
              v-model="sexo_seleccionado"
            >
              <option v-for="(sexo, i) in sexos" :value="sexo.cve" :key="i">
                {{ sexo.sexo }}
              </option>
            </select>
          </div>
        </div>

        <p>Please select an age range (years).</p>

        <OrdinalBrush :getter_store="'cambiaRangoEdadPrincipal'"></OrdinalBrush>
        <div class="contenedor-barras">
          <h3>
            Mortality Rate in 2021 by State for Individuals Aged
            {{
              ` ${
                rango_edad_principal.length > 1
                  ? rango_edad_principal[0] +
                    " to " +
                    rango_edad_principal.slice(-1)
                  : rango_edad_principal[0]
              }`
            }}
            ,
            {{
              ` ${
                sexo_seleccionado == 0
                  ? " Both Genders"
                  : sexo_seleccionado == 1
                  ? " Male Gender"
                  : " Female Gender"
              }`
            }}
          </h3>
          <Barras
            :barras_id="'id-barras'"
            :datos="data_estatal_2021"
            :variables="[
              { id: 'tasa', nombre_colores: 'rate', color: '#ffffcc' },
            ]"
            :nombre_barra="'entidad'"
            :nombre_color="'nombre_colores'"
            titulo_eje_y="States"
            titulo_eje_x="Mortality rate "
            orientacion="horizontal"
            :seleccionada="estado_seleccionado"
            :margen="{ arriba: 10, abajo: 30, izquierda: 54, derecha: 0 }"
            :alto_vis="400"
          >
          </Barras>
        </div>
      </div>
      <div class="col-visualizaciones">
        <h2>
          {{
            `Annual Death Rate ${
              estado_seleccionado == "00"
                ? " Nationwide "
                : " in " + claves_estatales[estado_seleccionado]
            }`
          }}
          for Individuals Aged
          {{
            ` ${
              rango_edad_principal.length > 1
                ? rango_edad_principal[0] +
                  " to " +
                  rango_edad_principal.slice(-1)
                : rango_edad_principal[0]
            }`
          }},
          {{
            ` ${
              sexo_seleccionado == 0
                ? " Both Genders"
                : sexo_seleccionado == 1
                ? " Male Gender"
                : " Female Gender"
            }`
          }}
        </h2>
        <p>
          The ordered stacked area chart displays, using the thickness of each
          stripe, the death rate per year and by cause. Additionally, these
          stripes are reordered from bottom to top in an ascending manner,
          allowing the identification of the top 10 causes per year by hovering
          your cursor over a year, which triggers an information tooltip.
        </p>
        <StreamGraph
          :stream_graph_id="'streamgraph1'"
          :datos="datos"
          :variables="variables"
          nombre_columna_horizontal="ANIO_OCUR"
          titulo_eje_y="Death rate per 100,000 inhabitants *"
          titulo_eje_x="Year"
          :class="{ cargando: esta_cargando }"
          :hover_activo="!esta_cargando"
        >
        </StreamGraph>

        <p>
          * Population with the selected annual characteristics in the age,
          gender, and state or nationwide filters. <br/>
          ** The diseases were translated into English using the python library googletrans.
        </p>
        <div class="nomenclatura">
          <div
            v-for="(variable, i) in totales.slice(0, 10)"
            :key="i"
            class="variable"
          >
            <span :style="{ background: variable.color }"></span>
            <b>{{ i + 1 }}<sup>{{ i==0? "st": i==1?"nd": i==2?"rd": "th" }}</sup> cause:</b> {{ catalogo[variable.cve] }}
          </div>
        </div>
        <h2>
          Monthly Cumulative Deaths
          {{
            ` ${
              estado_seleccionado == "00"
                ? " Nationwide"
                : " in " + claves_estatales[estado_seleccionado]
            }`
          }}
          for Individuals Aged
          {{
            ` ${
              rango_edad_principal.length > 1
                ? rango_edad_principal[0] +
                  " to " +
                  rango_edad_principal.slice(-1)
                : rango_edad_principal[0]
            }`
          }}
          , for
          {{
            ` ${
              sexo_seleccionado == 0
                ? "Both Genders"
                : sexo_seleccionado == 1
                ? "Male Genders"
                : "Female Genders"
            }`
          }}
          , from 2012 to 2021, for the Top 10 Causes of Death
        </h2>
        <p>
          This radial stacked area visualization displays the number of deaths
          for each cause that have occurred from 2012 to 2021, according to the
          month. It allows you to identify periods in which any of these causes
          have become more prominent.
        </p>
        <Huevo
          id_stream_circular="huevo"
          :variables="
            totales.slice(0, 10).map((d) => ({
              cve: d.cve,
              color: d.color,
              causa: catalogo[d.cve],
            }))
          "
          :datos="casos_mensuales_agrupados"
        >
        </Huevo>
      </div>
    </div>
  </div>
</template>
<script>
import * as d3 from "d3";
import StreamGraph from "../components/StreamGraph.vue";
import Barras from "../components/Barras.vue";
import Huevo from "../components/Huevo.vue";

import catalogo from "@/assets/data/catalogo_en.json";
import OrdinalBrush from "@/components/OrdinalBrush.vue";

import { mapState } from "vuex";
var claves_estatales = {
  "00": "National",
  "01": "Aguascalientes",
  "02": "Baja California",
  "03": "Baja California Sur",
  "04": "Campeche",
  "05": "Coahuila",
  "06": "Colima",
  "07": "Chiapas",
  "08": "Chihuahua",
  "09": "Ciudad de México",
  10: "Durango",
  11: "Guanajuato",
  12: "Guerrero",
  13: "Hidalgo",
  14: "Jalisco",
  15: "México",
  16: "Michoacán",
  17: "Morelos",
  18: "Nayarit",
  19: "Nuevo León",
  20: "Oaxaca",
  21: "Puebla",
  22: "Querétaro",
  23: "Quintana Roo",
  24: "San Luis Potosí",
  25: "Sinaloa",
  26: "Sonora",
  27: "Tabasco",
  28: "Tamaulipas",
  29: "Tlaxcala",
  30: "Veracruz",
  31: "Yucatán",
  32: "Zacatecas",
};
var claves_estatales_abr = {
  "00": "Nal.",
  "01": "Ags",
  "02": "BC",
  "03": "BCS",
  "04": "Camp",
  "05": "Coah",
  "06": "Col",
  "07": "Chis",
  "08": "Chih",
  "09": "CDMX",
  10: "Dur",
  11: "Gto",
  12: "Gro",
  13: "Hgo",
  14: "Jal",
  15: "Edo. Mex.",
  16: "Mich",
  17: "Mor",
  18: "Nay",
  19: "NL",
  20: "Oax",
  21: "Pue",
  22: "Qro",
  23: "Q. Roo",
  24: "SLP",
  25: "Sin",
  26: "Son",
  27: "Tab",
  28: "Tamps",
  29: "Tlax",
  30: "Ver",
  31: "Yuc",
  32: "Zac",
};
const diccionario_causas = {};
catalogo.map((d) => (diccionario_causas[d.CVE_CAPGPO] = d.CAPGPO));
export default {
  name: "DefuncionesTemporales",
  components: {
    StreamGraph,
    OrdinalBrush,
    Barras,
    Huevo,
  },
  data() {
    return {
      claves_estatales: claves_estatales,
      modal_visible: false,
      catalogo: diccionario_causas,
      datos: [],
      data_completa: [],
      data_conapo_completa: [],
      variables: Object.keys(diccionario_causas).map((d, i) => {
        return {
          id: d,
          nombre: diccionario_causas[d],
          color: "rgba(0,0,0)",
        };
      }),
      colores_top_10: [
        "#002642",
        "#840032",
        "#E59500",
        "#6F1DAE",
        "#20A4F3",
        "#82A407",
        "#CB45DA",
        "#F75C03",
        "#0077DF",
        "#00955e",
      ],
      entidades: Object.keys(claves_estatales)
        .sort((a, b) => a - b)
        .map((d) => {
          return {
            cve: d,
            estado: claves_estatales[d],
          };
        }),
      estado_seleccionado: "00",
      sexos: [
        { cve: 1, sexo: "Masculino" },
        { cve: 2, sexo: "Femenino" },
        { cve: 0, sexo: "Both" },
      ],
      totales: [],
      esta_cargando: true,
      sexo_seleccionado: 0,
      data_estatal_2021: [{ tasa: 0 }],
      casos_mensuales_agrupados: [{ data: [] }],
    };
  },
  mounted() {
    this.$ga.page("/");
  },
  beforeMount() {
    d3.csv("data/poblaciones_conapo.csv").then((data_conapo) => {
      data_conapo.forEach((d) => {
        d.EDAD = +d.EDAD;
        d.POBLACION = +d.POBLACION;
      });
      this.data_conapo_completa = data_conapo;
      d3.csv("data/datos_2012_2021.csv").then((data) => {
        this.data_completa = data;
        this.procesamientoDatos(
          this.data_completa.filter((d) =>
            this.rango_edad_principal.includes(d.EDAD)
          )
        );

        //this.datos = data;
      });
    });
  },
  methods: {
    procesamientoDatos() {
      let data_filtrada = this.data_completa.filter((d) =>
        this.rango_edad_principal.includes(+d.EDAD)
      );

      if (this.sexo_seleccionado != 0) {
        data_filtrada = data_filtrada.filter(
          (d) => d.SEXO == this.sexo_seleccionado
        );
      }
      let estatales_2021 = d3.rollup(
        [...data_filtrada].filter((d) => d.ANIO_OCUR == 2021),
        (v) => v.length,
        (d) => d.ENT_OCURR
      );
      if (this.estado_seleccionado != "00") {
        data_filtrada = data_filtrada.filter(
          (d) => d.ENT_OCURR == this.estado_seleccionado
        );
      }
      var data_filtrada_agrupada = d3.rollup(
        data_filtrada,
        (v) => v.length,
        (d) => d.ANIO_OCUR,
        (d) => d.CVE_CAPGPO
      );
      var datum = [];
      let anios = [...data_filtrada_agrupada.keys()];
      let causas_def = Object.keys(this.catalogo);

      /**
       * conapo
       */
      let poblaciones_conapo = this.data_conapo_completa.filter((d) =>
        this.rango_edad_principal.includes(d.EDAD)
      );
      let conapo_2021 = [...poblaciones_conapo].filter((d) => d.ANIO == 2021);
      poblaciones_conapo = poblaciones_conapo.filter(
        (d) => d.CVE_GEO == this.estado_seleccionado
      );

      if (this.sexo_seleccionado != 0) {
        poblaciones_conapo = poblaciones_conapo.filter(
          (d) => d.SEXO == this.sexo_seleccionado
        );
        conapo_2021 = conapo_2021.filter(
          (d) => d.SEXO == this.sexo_seleccionado
        );
      }
      poblaciones_conapo = d3.rollup(
        poblaciones_conapo,
        (v) => d3.sum(v.map((dd) => dd.POBLACION)),
        (d) => d.ANIO
      );

      conapo_2021 = d3.rollup(
        conapo_2021,
        (v) => d3.sum(v.map((dd) => dd.POBLACION)),
        (d) => d.CVE_GEO
      );
      let data_estatal_2021 = [];
      estatales_2021.set("00", d3.sum(Array.from(estatales_2021.values())));
      for (var i = 0; i < this.entidades.length; i++) {
        data_estatal_2021.push({
          entidad: claves_estatales_abr[this.entidades[i].cve],
          tasa:
            100000 *
            (estatales_2021.get(this.entidades[i].cve) /
              conapo_2021.get(this.entidades[i].cve)),
          defunciones: estatales_2021.get(this.entidades[i].cve),
          poblacion: conapo_2021.get(this.entidades[i].cve),
          clave: this.entidades[i].cve,
        });
      }
      this.data_estatal_2021 = data_estatal_2021;

      //
      for (var i = 0; i < anios.length; i++) {
        let objeto = {};
        objeto.ANIO_OCUR = anios[i];
        objeto.POBLACION = poblaciones_conapo.get(anios[i]);

        for (var j = 0; j < causas_def.length; j++) {
          objeto[causas_def[j]] =
            (100000 *
              (data_filtrada_agrupada.get(anios[i]).get(causas_def[j])
                ? data_filtrada_agrupada.get(anios[i]).get(causas_def[j])
                : 0)) /
            objeto.POBLACION;
          objeto[causas_def[j] + "_absoluto"] = data_filtrada_agrupada
            .get(anios[i])
            .get(causas_def[j])
            ? data_filtrada_agrupada.get(anios[i]).get(causas_def[j])
            : 0;
        }

        datum.push(objeto);
      }

      this.datos = datum;

      this.totales = causas_def
        .map((d) => {
          return {
            cve: d,
            total: d3.sum(datum.map((dd) => dd[d + "_absoluto"])),
          };
        })
        .sort((a, b) => b.total - a.total);

      let dict_col = {};
      this.totales.forEach((d, i) => {
        d.color = i < 10 ? this.colores_top_10[i] : "#858585";
        dict_col[d.cve] = i < 10 ? this.colores_top_10[i] : "#858585";
      });
      /**
       * meses
       */
      let casos_mensuales_agrupados = [];
      let casos_mensuales = data_filtrada.filter((d) =>
        this.totales
          .slice(0, 10)
          .map((dd) => dd.cve)
          .includes(d.CVE_CAPGPO)
      );
      casos_mensuales = d3.rollup(
        casos_mensuales,
        (v) => v.length,
        (d) => d.MES_OCUR,
        (d) => d.CVE_CAPGPO
      );
      /*for(var i = 0; i<10; i++){
        let ef_dict = {}
        ef_dict.cve_capgpo = this.totales[i].cve
        ef_dict.causa = this.catalogo[ this.totales[i].cve]
        let base_meses = [];
        for(var mes =1; mes <= 12; mes ++){
          base_meses.push({
            "mes": mes,
            "cantidad": casos_mensuales.get(this.totales[i].cve).get(String(mes)) ? casos_mensuales.get(this.totales[i].cve).get(String(mes)) : 0
          })
        }
        ef_dict.data = base_meses

        casos_mensuales_agrupados.push(ef_dict)

      }*/
      for (var mes = 1; mes <= 12; mes++) {
        let ef_dict = {};
        ef_dict.mes = mes;
        for (var i = 0; i < 10; i++) {
          ef_dict[this.totales[i].cve] = casos_mensuales
            .get(String(mes))
            .get(this.totales[i].cve)
            ? casos_mensuales.get(String(mes)).get(this.totales[i].cve)
            : 0;
        }
        casos_mensuales_agrupados.push(ef_dict);
      }

      this.casos_mensuales_agrupados = casos_mensuales_agrupados;

      this.variables = Object.keys(this.catalogo).map((d, i) => {
        return {
          id: d,
          nombre: this.catalogo[d],
          color: dict_col[d],
        };
      });
      setTimeout(() => {
        this.esta_cargando = false;
      }, 1500);
    },
  },
  computed: {
    ...mapState(["rango_edad_principal"]),
  },
  watch: {
    rango_edad_principal(nv) {
      this.esta_cargando = true;

      this.procesamientoDatos();
    },
    estado_seleccionado(nv) {
      this.esta_cargando = true;

      this.procesamientoDatos();
    },
    sexo_seleccionado(nv) {
      this.esta_cargando = true;

      this.procesamientoDatos();
    },
  },
};
</script>
<style lang="scss">
#vista-defunciones-temporales {
  margin-top: 100px;
  .tablero {
    display: flex;
    gap: 30px;

    position: relative;
    .col-controles {
      top: 50px;
      position: sticky;
      position: -webkit-sticky;
      align-self: flex-start;
      .contenedor-selectores {
        display: flex;
        width: 100%;
        gap: 8px;
        .contenedor-selector {
          width: 50%;
          select {
            width: 100%;
            padding: 8px;
            background: transparent;
            border-radius: 4px;
          }
        }
      }
      width: 300px;
      .contenedor-brush {
        max-width: 600px;
      }
    }
    .col-visualizaciones {
      width: calc(100% - 300px);
    }
    @media (max-width: 768px) {
      display: inline-block;
      .col-controles {
        top: 0;
        position: relative;
        width: 100%;
      }
      .col-visualizaciones {
        width: 100%;
      }
    }
  }

  #streamgraph1.cargando {
    .cargador {
      width: 100%;
      height: 520px;
      position: absolute;
      z-index: 1;
    }
  }
}

.nomenclatura {
  font-size: 14px;
  display: block;

  .variable {
    span {
      transform: translateY(2px);
      width: 16px;
      height: 16px;
      display: inline-block;
      border-radius: 5px;
      margin-right: 5px;
      @media (max-width: 768px) {
        width: 16px;
      }
    }
  }
}
</style>