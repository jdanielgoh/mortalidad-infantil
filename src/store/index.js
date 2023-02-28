import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    rango_edad_chiapas: [14],
    rango_edad_principal: [14]
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
