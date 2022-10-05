
class Sdkbase {
  constructor () {
    this.id = ''
    this.dom = null
    this.com = null
    this.create()
  }
  create () {}
  initOption (dom, option) {
    return option
  }
  createComponent (dom, option) {
    this.dom = dom
    var Clazz = this.clazz
    if (Clazz) {
      // 属性转换
      var copt = this.initOption(dom, option)
      this.com = new Clazz(dom, copt)
      this.option = copt
    } else {
      this.com = dom
    }
  }
  getValue () {}
  setValue () {}
  addEvent (cevent, func) {}
}
/**
 * 普通数据.
 */
class Comdata extends Sdkbase {
  getValue () {
    var res = this.com[this.id]
    return res
  }
  setValue (val) {
    this.com[this.id] = val
  }
}
/**
   * 普通dom元素.
   */
class Comdom extends Sdkbase {
  getValue () {
    var res = this.dom.innerHTML
    return res
  }
  setValue (val) {
    this.dom.innerHTML = val
  }
  addEvent (cevent, func) {
    if (this.dom.addEventListener) {
      this.dom.addEventListener(cevent.replace(/^on/, ''), func)
    } else {
      this.dom.attachEvent(cevent, func, false)
    }
  }
}

var sdks = {
  comdata: Comdata,
  comdom: Comdom
}
export {Sdkbase, sdks}
