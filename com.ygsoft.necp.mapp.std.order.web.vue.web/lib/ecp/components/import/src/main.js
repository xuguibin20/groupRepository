import Vue from 'vue'
import Main from './main.vue'
import utils from 'ecp.utils'
let ImportConstructor = Vue.extend(Main)

const EcpImport = options => {
  options = options || {}
  options.contextPath = utils.getContextPath()
  // 实例化import组件
  let instance = new ImportConstructor({
    data: options
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.$on('on-close', () => {
    instance.visible = false
    document.body.removeChild(instance.$el)
  })
}

export default EcpImport