import Vue from 'vue'
import Select from './ecp.component.confirm.vue'
let MessageConstructor = Vue.extend(Select)
let instance = ''
const editComponent = function(options) {
  instance = new MessageConstructor({
    data: {},
    propsData: options
  })
  instance.$mount()
  document.body.appendChild(instance.$el)
  instance.visible = true
  instance.close = res => {
    instance.visible = false
    if (options.close) {
      options.close()
    }
  }
  instance.cancel = res => {
    instance.visible = false
    if (options.cancel) {
      options.cancel()
    }
  }
  instance.success = res => {
    instance.visible = false
    if (options.success) {
      options.success()
    }
  }
}
export default editComponent
