import Vue from 'vue'
import utils from 'ecp.utils'
import Template from './src/upload-dialog'
let UploadConstructor = Vue.extend(Template)

const EcpUpload = options => {
  options = options || {}
  options.visible = true
  options.init = true
  options.contextPath = utils.getContextPath()
  // 实例化upload组件
  let instance = new UploadConstructor({
    propsData: options
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.$on('on-close', () => {
    instance.visible = false
    document.body.removeChild(instance.$el)
  })
}

export default EcpUpload