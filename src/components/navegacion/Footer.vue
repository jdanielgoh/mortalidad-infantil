<template>
  <footer class="contenedor">
    <div class="ancho-max">
      <div class="contenedor">
        <div class="hecho">
          <a href="https://tirandocodigo.mx/" class="marca">
            <strong>Tirando Código</strong>
          </a>

          <p>
            Hecho con amor por su servidor, para México y el mundo, Daniel Gómez
            Hernández &#x1F495;
          </p>
          <ul>
            <li>
              <a href="https://tirandocodigo.mx/"> Inicio </a>
            </li>
            <li>
              <a href="https://tirandocodigo.mx/portafolio"> Portafolio </a>
            </li>
            <li>
              <a href="https://tirandocodigo.mx/tirando-codigo"> Tirando.código </a>
            </li>
          </ul>
          <p class="header"></p>
        </div>
        <div class="contacto">
          <p><strong> Contacto </strong></p>

          <p>Redes</p>
          <div class="contenedor">
            <a href="https://www.instagram.com/tirando.codigo/" target="_blank">
              <img src="@/assets/img/iconos/instagram.svg" alt="instagram" />
            </a>
            <a href="https://twitter.com/jdanielgoh" target="_blank">
              <img src="@/assets/img/iconos/twitter.svg" alt="twitter" />
            </a>
            <a href="https://www.behance.net/jdanielgoh8508" target="_blank">
              <img src="@/assets/img/iconos/behance.svg" alt="behance" />
            </a>
          </div>
          <p>Correo</p>
          <p>
            <a href="mailto: gomezhernandez.dan@gmail.com"
              >gomezhernandez.dan@gmail.com</a
            >
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
footer.contenedor {
  margin-top: 240px;
  a{
    color:#008773;
  }
  background: #eee;
  border-top: solid;
  width: 100%;
  padding: 3 * 16px 0;
  div.ancho-max{
            display: flex;
            flex-wrap: nowrap;
            justify-content: space-between;
            padding: 0 16px;
            width: 100%;
        }
        
        .marca{
            font-family: 'Roboto Mono', monospace;

            padding: 8px 0 ;
            display: block;
            font-size: 20px;
            max-width: 150px;
            line-height: .9;
            text-decoration: none !important;
            color: #000;
        }
        .contenedor{
            flex-wrap: wrap;
            display: flex;
            width: 100%;
        }
  div.ancho-max {
    padding: 0 16px;
    width: 100%;
    max-width: 1280px;
    margin:auto;

    .contenedor {
      justify-content: space-between;
      gap: 30px;

      @media (max-width: 768px) {
        flex-wrap: wrap;
      }

      .hecho {
        max-width: 450px;

        ul {
          padding: 0;

          li {
            list-style-type: none;
          }
        }
      }

      .contacto {
        .contenedor {
          gap: 0 30px;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>