import Vue from 'vue'
import App from './App.vue'
import store from './store.js'
import AuthPlugin from './utils/AuthPlugin.ts'

Vue.config.productionTip = false

Vue.use(AuthPlugin, { store : store })

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
