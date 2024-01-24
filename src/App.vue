<template>
  <div id="app">
    <Header></Header>
    
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
