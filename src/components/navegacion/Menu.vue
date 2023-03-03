<template>
  <div class="navegacion">
    <button @click="mostrarMenu" class="btn">
      <span v-if="!activo">&#127828;</span>
      <span v-else>&#10060;</span>
    </button>

    <nav :class="{ activo: activo }">
      <ul>
        <li @click="clickEnalce">
          <NuxtLink to="/"> Inicio </NuxtLink>
        </li>
        <li @click="clickEnalce">
          <NuxtLink to="/portafolio"> Portafolio </NuxtLink>
        </li>
        <li @click="clickEnalce">
          <NuxtLink to="/tirando-codigo"> Tirando.código </NuxtLink>
        </li>
        
      </ul>
    </nav>
  </div>
</template>
<script>
export default {
  name: 'NavegacionMenu',
  transition: {
    name: 'test',
    mode: 'out-in',
    afterLeave(el) {
    },
  },
  data() {
    return {
      activo: false,
    }
  },
  methods: {
    mostrarMenu() {
      this.activo = !this.activo
    },

    clickEnalce() {
      this.activo = false
    },
  },
}
</script>
<style lang="scss">
$enlaces: 1, 2, 3, 4;

.navegacion {
  position: relative;

  button {
    z-index: 20;
    font-size: 24px;
    filter: grayscale(1);

    span {
      margin: auto;
    }
  }

  nav {
    z-index: -1;
    //background-color: rgba(0,0,0,.5);
    backdrop-filter: blur(5px);
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    transform: translate(-100%);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;

    ul {
      list-style-type: none;
      padding: 0;
      font-size: 64px;
      margin: auto;

      @media (max-width: $pantalla-movil) {
        font-size: 48px;
      }

      li {
        transform: translateX(-50vw);
      }

      li:nth-child(1) {
        transition: transform 500ms ease 1 * 100ms;
      }

      li:nth-child(2) {
        transition: transform 500ms ease 2 * 100ms;
      }

      li:nth-child(3) {
        transition: transform 500ms ease 3 * 100ms;
      }

      li:nth-child(4) {
        transition: transform 500ms ease 4 * 100ms;
      }
    }

    &.activo {
      opacity: 1;
      transform: translate(-0%);

      ul {
        li {
          transform: translateX(0);
        }
      }
    }
  }
}
</style>