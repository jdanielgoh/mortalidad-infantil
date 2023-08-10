<template>
  <div id="vista-defunciones-temporales">
    <div class="contenedor-flex">
      <div class="contenedor-texto">
        <router-link to="/en">Read in English</router-link>

        <h1>Mortalidad de niñas, niños y adolescentes en México</h1>
        <p>
          Este proyecto surge a partir del
          <i> Datatón sobre la niñez y adolescencia en México 2023</i>. La
          herramienta está dirigida a personas investigadoras, tomadoras de
          decisiones y a la ciudadania con interés en obtener información
          preventiva para las infancias.
        </p>
        <p>
          A partir de una exploración de la base de datos
          <a
            href="https://datamx.io/dataset/mortalidad-de-ninas-ninos-y-adolescentes-en-chiapas-2021"
            ><i>Mortalidad de Niñas, Niños y Adolescentes en Chiapas 2021</i></a
          >
          proporcionada por <a href="https://redias.org/">REDIAS</a> se encontró
          que para el rango de edad entre 14 y 15 años, una de las principales
          causas de muerte son las lesiones autoinflingidas intencionalmente,
          así como las agresiones fueron la principal causa de muerte de
          personas de 16 años. A partir de ello surgen varias preguntas ¿cómo ha
          impactado la pandemia en las causas de muerte de la población
          adolescente e infantil?, ¿existe alguna estacionalidad anual en la
          cual ciertas causas de defunción incrementen? y ¿Cúales son las
          principales causas de mortalidad para cualquier grupo de edad y como
          han cambiado estas causas a lo largo de tiempo?
        </p>

        <p>
          Para responder las preguntas anteriores se usaron los
          <a href="https://www.inegi.org.mx/programas/mortalidad/#Microdatos"
            >microdatos de mortalidad de INEGI</a
          >
          y las
          <a
            href="https://datos.gob.mx/busca/dataset/proyecciones-de-la-poblacion-de-mexico-y-de-las-entidades-federativas-2016-2050/resource/353817d4-ac9d-4709-bbd9-52936fe0423f"
            >proyecciones de población de CONAPO a mitad de año</a
          >
          para hacer el cálculo de las tasas y reducir sesgos poblacionales. Con
          las visualizaciones que se muestran a continuación se pretende dar a
          la persona usuaria las herramientas para responder las preguntas
          anteriores. Puedes modificar los controles para obtener información
          del grupo poblacional de tu interés.
        </p>
      </div>
    </div>
    <div class="tablero">
      <div class="col-controles">
        <h2>Controles</h2>
        <div class="contenedor-selectores">
          <div class="contenedor-selector">
            <p>Entidad</p>
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
            <p>Sexo</p>
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

        <p>Selecciona un rango de edad (años)</p>

        <OrdinalBrush :getter_store="'cambiaRangoEdadPrincipal'"></OrdinalBrush>
        <div class="contenedor-barras">
          <h3>
            Tasa de mortalidad en 2021 por estado de personas
            {{
              ` ${
                rango_edad_principal.length > 1
                  ? rango_edad_principal[0] +
                    " a " +
                    rango_edad_principal.slice(-1) +
                    " años "
                  : rango_edad_principal[0] + " año"
              }`
            }}
            y de
            {{
              ` ${
                sexo_seleccionado == 0
                  ? "ambos sexos"
                  : sexo_seleccionado == 1
                  ? "sexo masculino"
                  : "sexo femenino"
              }`
            }}
          </h3>
          <Barras
            :barras_id="'id-barras'"
            :datos="data_estatal_2021"
            :variables="[
              { id: 'tasa', nombre_colores: 'tasa', color: '#ffffcc' },
            ]"
            :nombre_barra="'entidad'"
            :nombre_color="'nombre_colores'"
            titulo_eje_y="Estados"
            titulo_eje_x="Tasa de mortalidad "
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
            `Tasa de defunciones anuales ${
              estado_seleccionado == "00"
                ? "a nivel nacional"
                : " en " + claves_estatales[estado_seleccionado]
            }`
          }}
          de personas de
          {{
            ` ${
              rango_edad_principal.length > 1
                ? rango_edad_principal[0] +
                  " a " +
                  rango_edad_principal.slice(-1) +
                  " años "
                : rango_edad_principal[0] + " año"
            }`
          }}
          y de
          {{
            ` ${
              sexo_seleccionado == 0
                ? "ambos sexos"
                : sexo_seleccionado == 1
                ? "sexo masculino"
                : "sexo femenino"
            }`
          }}
        </h2>
        <p>
          El diagrama de areas apiladas ordenadas muestra, con el grosor de cada
          franja, la tasa de defunciones por año y por causa. Además, estas
          franjas se reordenan de abajo hacia arriba de forma ascendente
          permitiendo identificar el top 10 de causas por año mediante el globo
          de información al pasar tu cursor en un año
        </p>
        <StreamGraph
          :stream_graph_id="'streamgraph1'"
          :datos="datos"
          :variables="variables"
          nombre_columna_horizontal="ANIO_OCUR"
          titulo_eje_y="Tasa de mortalidad por 100 mil habitantes *"
          titulo_eje_x="Año"
          :class="{ cargando: esta_cargando }"
          :hover_activo="!esta_cargando"
        >
        </StreamGraph>

        <p>
          * Habitantes con las características anuales seleccionadas en los
          filtros de edad, sexo y entidad o nacional.
        </p>
        <div class="nomenclatura">
          <div
            v-for="(variable, i) in totales.slice(0, 10)"
            :key="i"
            class="variable"
          >
            <span :style="{ background: variable.color }"></span>
            <b>{{ i + 1 }}<sup>a</sup> causa:</b> {{ catalogo[variable.cve] }}
          </div>
        </div>
        <h2>
          Acumulado mensual de defunciones
          {{
            ` ${
              estado_seleccionado == "00"
                ? "a nivel nacional"
                : " en " + claves_estatales[estado_seleccionado]
            }`
          }}
          de personas de
          {{
            ` ${
              rango_edad_principal.length > 1
                ? rango_edad_principal[0] +
                  " a " +
                  rango_edad_principal.slice(-1) +
                  " años "
                : rango_edad_principal[0] + " año"
            }`
          }}
          y de
          {{
            ` ${
              sexo_seleccionado == 0
                ? "ambos sexos"
                : sexo_seleccionado == 1
                ? "sexo masculino"
                : "sexo femenino"
            }`
          }}
          de 2012 a 2021 del top 10 de causas de defunción
        </h2>
        <p>
          Esta visualización de areas apiladas radial muestra el número de
          defunciones por cada causa que han ocurrido desde 2012 a 2021 según el
          mes. Permite identificar en cuales periodos alguna de estas causas ha
          cobrado mayor relevancia.
        </p>

        <Huevo
          id_stream_circular="huevo"
          :variables="
            totales
              .slice(0, 10)
              .map((d) => ({
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

import catalogo from "@/assets/data/catalogo.json";
import OrdinalBrush from "@/components/OrdinalBrush.vue";
import { mapState } from "vuex";
var claves_estatales = {
  "00": "Nacional",
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
        { cve: 0, sexo: "Ambos" },
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