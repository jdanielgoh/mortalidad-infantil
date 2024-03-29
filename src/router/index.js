import Vue from 'vue'
import VueRouter from 'vue-router'

import DefuncionesTemporales from '../views/DefuncionesTemporales.vue'
import DefuncionesTemporalesEn from '../views/DefuncionesTemporalesEn.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'DefuncionesTemporales',
    component: DefuncionesTemporales
  },
  {
    path: '/en',
    name: 'DefuncionesTemporalesEn',
    component: DefuncionesTemporalesEn
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
