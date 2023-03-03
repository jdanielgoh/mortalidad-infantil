<template>
  <div class="tarjeta-portafolio">
    <div
      class="cover"
      :style="{
        backgroundImage: `url('${img_fondo}')`,
      }"
    ></div>
    <div class="contenedor-texto">
      <slot name="tarjeta-portafolio-texto"> </slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    color_fondo: {
      default: () => '#ffffff',
      type: String,
    },
    enlace: {
      default: () => '/',
      type: String,
    },
    img_fondo: {
      default: () => 'https://placekitten.com/2000/3000',
      type: String,
    },
  },
  cssProps() {
    return {
      '--color-fondo': this.color_fondo,
    }
  },
}
</script>
<style lang="scss">
$altura_tarjeta: 300px;

.tarjeta-portafolio {
  //height: $altura_tarjeta;
  text-decoration: none;
  position: relative;
  width: 100%;
  display: flex;

  div.cover {
    background-size: cover;
    background-position: 50%;
    text-align: center;
    display: flex;
    justify-content: center;
    width: 50%;
    position: absolute;
    height: 100%;
    background-blend-mode: luminosity;
    backdrop-filter: blur(1px);
    transition: background-color 0.5s;
    background-color: $color-fondo;
  }

  &.img-derecha {
    div.cover {
      right: 0;
    }

    div.contenedor-texto {
      @media (max-width: $pantalla-movil) {
        margin-left: 0;
      }
    }
  }

  &.img-izquierda {
    div.cover {
      left: 0;
    }

    div.contenedor-texto {
      @media (max-width: $pantalla-movil) {
        margin-right: 0;
      }
    }
  }

  &:hover {
    div.cover {
      background-color: transparent;
    }
  }

  .contenedor-texto {
    width: 80%;
    margin: 50px auto;
    max-width: 800px;

    //background: var(--color-fondo);
  }
}
</style>