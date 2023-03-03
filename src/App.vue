<template>
  <div id="app">
    <Header></Header>
    <div class="contenedor-flex">
      <div class="contenedor-texto">
        <h1>Mortalidad de niñas, niños y adolescentes en México</h1>
        <p>
          Este proyecto surge a partir del Datatón sobre la niñez y adolescencia
          en México 2023. La herramienta está dirigida a personas
          investigadoras, tomadoras de decisiones y a la ciudadania que busque información
        </p>
      </div>
    </div>
    <router-view class="vista-router-view" />
    <Footer></Footer>

  </div>

</template>

<script>
import Header from "@/components/navegacion/Header.vue";

import Footer from "@/components/navegacion/Footer.vue";
export default{
  components: {
    Header,
    Footer
  }
}
</script>

<style lang="scss" >

#app,
svg > text {
  font-family: "Roboto", sans-serif;
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

  .vista-router-view {
    max-width: 1280px;
    margin: auto;
  }
  .contenedor-texto {
    max-width: 720px;
    margin: auto;
  }
}

h1 {
  font-size: 30px;
  margin-top: 0px;
  margin-bottom: 10px;
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
