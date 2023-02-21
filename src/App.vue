<template>
  <div id="app">

    <router-view/>
  </div>
</template>

<style lang="scss">
#app, svg > text {
  font-family: 'Source Sans Pro', sans-serif;  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
}
body{
  margin: 0;
  background: rgba(255,255,255,.7);
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
