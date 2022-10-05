// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import pms from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import 'devstate'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ei from 'ecp.interceptor'
import './assets/css/xdeer.css'

if (!window.Promise) {
  window.Promise = pms
}

ei.register(function (result) {
  if (result != null && (result.status !== 200 || (result.headers && result.headers.error_code === 'ERROR'))) {
    window.console.error(result.data)
    return false
  } else {
    window.console.info('interceptor')
  }
})

ei.registerCatch(function (err) {
  if (err.response != null && err.response.status === 500) {
    window.console.error(err.response.data)
    return false
  } else {
    window.console.info('interceptor')
  }
})

import 'ecp.common.style'
import 'ecp.themes.style'
import 'ecp.index.style'

//实现了全局的事件总线对象
Vue.prototype.$bus = new Vue()

Vue.config.productionTip = false

// Vue.use(elementUI)
Vue.use(elementUI, { size: 'mini' })
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
