<template>
    <header class="contenedor">
        <div class="ancho-max">
            <div >
                <a href="https://tirandocodigo.mx/" class="marca">
                    <strong>Tirando Código</strong>
                </a>
                
            </div>

        </div>
        
    </header>
</template>

<script>
export default {
    name: "Header",

}
</script>

<style lang="scss">
$margen-lateral: 16px;
    header{
        margin-bottom:120px;
        width: 100%;
        position: sticky;
        top:0;
        z-index: 1;
        background: #eee;
        border-bottom: solid;

        div.ancho-max{
            max-width: 1280px;
            margin:auto;
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

        .ancho-max{
            max-width: 1280px;
            margin:auto;
        }

        


    }


</style>