import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    rango_edad_chiapas: [14],
    rango_edad_principal: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
  },
  mutations: {
    cambiarRangoEdadChiapas(state,valor){
      state.rango_edad_chiapas = valor;

    },
    cambiaRangoEdadPrincipal(state, valor){
      state.rango_edad_principal = valor;
    }
  },
  actions: {
  },
  modules: {
  }
})
