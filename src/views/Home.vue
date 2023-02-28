<template>
  <div class="home">

    <nav>
      
      Versiones en español:
      <ul>
        <li>
          <router-link to="/defunciones">
            Defunciones por año y por sector
          </router-link>
        </li>
        <li>
          <router-link to="/chiapas">
            Defunciones 2021 en Chiapas
          </router-link>
        </li>
        
      </ul>
    </nav>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {
  },
};
</script>
