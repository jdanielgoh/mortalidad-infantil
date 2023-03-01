

<template>
    <div class="contenedor-brush" :id="brush_id">
        <svg>

        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
export default {
    name: "OrdinalBrush",
    props:{
        brush_id: {
            type: String,
            default: "brush-id"
        },
        alto:{
            type: Number,
            default: 40
        },
        dominio: {
            type: Array,
            default: ()=> [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
        },
        getter_store: {
            type: String,
            default: ""
        }
    },
    data(){
        return {
            listado_seleccionado: [],
        }
    },

    mounted(){
        this.ancho = document.querySelector(`#${this.brush_id}`)
            .clientWidth;
        
        this.x = d3.scalePoint()
            .domain(this.dominio)
            .range([0, this.ancho])
            .padding(0.5)

        this.svg = d3.select(`#${this.brush_id} svg`)
            .attr("viewBox", [0, 0, this.ancho, this.alto]);

        this.brush = d3.brushX()
            .on("start brush end", this.brushed)
            .on("end.snap", this.brushended);

        this.bar = this.svg
            .append("g")
            .style("fill","#e2e2e2")
            .selectAll("rect")
            .data(this.x.domain())
            .join("rect")
            .attr("x", d => this.x(d) - this.x.step() / 2)
            .attr("height", this.alto)
            .attr("width", this.x.step());
        
        this.svg.append("g")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.x.bandwidth() / 2},${this.alto / 2})`)
            .selectAll("text")
            .data(this.x.domain())
            .join("text")
            .attr("x", d => this.x(d))
            .attr("dy", "0.35em")
            .attr("font-size", "14px")

            .text(d => d);
        
        this.g = this.svg.append("g")
            .call(this.brush);

        this.brushed({selection: [0, this.ancho]})
        this.brushended({selection: [0, this.ancho], sourceEvent:true})
    }, 
    methods: {
        brushed({selection}) {
            if (selection) {
                const range = this.x.domain().map(this.x);

                const i0 = d3.bisectRight(range, selection[0]);
                const i1 = d3.bisectRight(range, selection[1]);
                this.bar.attr("fill", (d, i) => i0 <= i && i < i1 ? "orange" : null);
                this.bar.attr("activa",  (d, i) => i0 <= i && i < i1 ? true : null);
                this.listado_seleccionado = this.x.domain().slice(i0, i1)
            } else {
                this.bar.attr("fill", null);
            }
        },

        brushended({selection, sourceEvent}) {

            if (!sourceEvent || !selection) return;
                const range = this.x.domain().map(this.x), dx = this.x.step() / 2;
                const x0 = range[d3.bisectRight(range, selection[0])] - dx;
                const x1 = range[d3.bisectRight(range, selection[1]) - 1] + dx;
                this.g.transition().call(this.brush.move, x1 > x0 ? [x0, x1] : null);

                this.$store.commit(this.getter_store, this.listado_seleccionado);

        },
        
    },     

}

</script>
<style lang="scss">
rect.handle{
    fill:black
}
</style>