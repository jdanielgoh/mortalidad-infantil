<template>
  <div id="app">
    <Header></Header>
    <div class="contenedor-flex">
      <div class="contenedor-texto">
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
            >proyecciones de población de CONAPO a mitad de año</a> para hacer el cálculo de las tasas y reducir sesgos poblacionales.
          Con las visualizaciones que se muestran a continuación se pretende dar
          a la persona usuaria las herramientas para responder las preguntas
          anteriores. Puedes modificar los controles para obtener información
          del grupo poblacional de tu interés.
        </p>
      </div>
    </div>
    <router-view class="vista-router-view" />
    <div class="ancho-maxi">
      <p><b>Repositorio del proyecto</b></p>
    <a href="https://github.com/jdanielgoh/web-defunciones-infancias" target="_blank">
      

      <img src="@/assets/img/github-mark.svg" alt="">
    </a>
    </div>
    
    <Footer></Footer>
  </div>
</template>

<script>
import Header from "@/components/navegacion/Header.vue";

import Footer from "@/components/navegacion/Footer.vue";
export default {
  components: {
    Header,
    Footer,
  },
};
</script>

<style lang="scss" >
#app,
svg > text {
  font-family: "Poppins", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
}
.contenedor-flex {
  display: flex;
}
body {
  margin: 0;
  padding: 0px 15px;
  background: #eee !important;
  font-family: "Poppins", sans-serif;
  a {
    color: #176f69;
  }
  .vista-router-view, .ancho-maxi {
    max-width: 1280px;
    margin: auto;
  }
  .contenedor-texto {
    max-width: 720px;
    margin: auto;
  }
}

h1 {
  font-size: 40px;
  margin-top: 0px;
  margin-bottom: 10px;
  max-width: 600px;
}
@media (max-width: 768px) {
  h1 {
    font-size: 24px;
  }
}
.pie {
  p {
    b {
      font-weight: 700;
    }
  }
}
</style>
