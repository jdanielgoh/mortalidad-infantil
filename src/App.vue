<template>
  <div id="app" class="contenedor-flex">

    <router-view class="vista-router-view"/>
  </div>
</template>

<style lang="scss">
#app, svg > text {
  font-family: 'Source Sans Pro', sans-serif;  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
}
.contenedor-flex{
  display: flex;

}
body{
  margin: 0;
  background: rgba(255,255,255,.7);
  .vista-router-view{
    padding: 0px 15px;
    max-width: 1280px;
    margin: auto;

  }
}
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: black;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
h1{
  font-size: 30px;
  margin-top: 0px;
  margin-bottom:10px
}
@media (max-width: 768px) {
      h1{
        font-size: 24px
      }
    }
    .pie{
      p{
        b{
          font-weight: 700;
        }
      }
    }
</style>
