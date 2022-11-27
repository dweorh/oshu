import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import ChatPage from './components/ChatPage'
import RegistrationPage from './components/RegistrationPage'
import LoginPage from './components/LoginPage'
import { i18n, loadLanguageAsync } from './i18n/index.js'

loadLanguageAsync(window.navigator.language)
// loadLanguageAsync('pl-pl')

import './assets/style.css'

const routes = [
  { path: '/', component: ChatPage },
  { path: '/registration/:id', component: RegistrationPage },
  { path: '/login/:id', component: LoginPage }
]

const router = new VueRouter({
  mode: 'history',
  routes // short for `routes: routes`
})
Vue.use(VueRouter);
Vue.config.productionTip = false
// loadLanguageAsync(window.navigator.language)
// loadLanguageAsync('en')
/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  router,
  render: h => h(App)
})