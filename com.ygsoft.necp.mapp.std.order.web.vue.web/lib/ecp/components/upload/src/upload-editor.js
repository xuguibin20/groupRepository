import Vue from 'vue'
import Upload from './upload-input'
let UploadConstructor = Vue.extend(Upload)
const EcpUpload = function(dom, options) {
  options.width = '1000px'
  options.init = false
  let instance = new UploadConstructor({
    data: {},
    propsData: options
  })
  instance.$mount()
  dom.setAttribute('class', 'ecp-upload-cell')
  dom.appendChild(instance.$el)

  this.getValue = () => {
    return instance.ywkey + ':' + instance.currentValue
  }
  this.getText = () => {
    return instance.currentValue
  }
  this.getPopState = () => {
    return true
  }
  this.setValue = val => {
    let text = val.text.split(':')[1]
    instance.ywkey = val.id.split(':')[0]
    instance.currentValue = text ? text : ''
  }
}
export default EcpUpload