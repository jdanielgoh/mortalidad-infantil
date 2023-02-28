import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import DefuncionesTemporales from '../views/DefuncionesTemporales.vue'
import CasoChiapas from '../views/CasoChiapas.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/defunciones',
    name: 'DefuncionesTemporales',
    component: DefuncionesTemporales
  },
  {
    path: '/chiapas',
    name: 'CasoChiapas',
    component: CasoChiapas
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
