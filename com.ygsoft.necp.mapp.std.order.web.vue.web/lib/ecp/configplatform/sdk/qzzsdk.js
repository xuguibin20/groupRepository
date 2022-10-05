import {Sdkbase, sdks} from './sdkbase'

/**
 * 下拉框组件.
 */
class Combobox extends Sdkbase {
  create () {
    this.tagName = 'combobox'
    this.template = '<div></div>'
    this.clazz = window.qzz.ui.input.combobox
  }
  initOption (dom, option) {
    if (option.disInput == null) {
      option.disInput = true
    }
    if (option.canClear == null) {
      option.canClear = false
    }
    return super.initOption(dom, option)
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.getValue()
    }
    return res
  }
  setValue (val) {
    if (this.com) {
      return this.com.setValue(val)
    }
  }
  setValueByIndex (index) {
    if (index != null && index !== '') {
      var cval = this.com.getData()
      if (index < 0) {
        index = 0
      }
      if (index >= cval.length) {
        index = cval.length - 1
      }
      if (cval.length > 0 && cval[index]) {
        var key = this.com.getOption().idkey || 'id'
        this.setValue(cval[index][key])
      }
    }
  }
  loadData (datas) {
    if (this.com) {
      this.com.loadData(datas)
      this.com.setValue('')
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

/**
 * 下拉框组件.
 */
class Updown extends Sdkbase {
  create () {
    this.tagName = 'updown'
    this.template = '<div></div>'
    this.clazz = window.qzz.ui.input.updown
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.getValue()
    }
    return res
  }
  setValue (val) {
    if (this.com) {
      return this.com.setValue(val)
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

/**
 * 下拉框组件.
 */
class Edit extends Sdkbase {
  create () {
    this.tagName = 'edit'
    this.template = '<div></div>'
    this.clazz = window.qzz.ui.input.edit
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.getValue()
    }
    return res
  }
  setValue (val) {
    if (this.com) {
      return this.com.setValue(val)
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

/**
 * 下拉框组件.
 */
class Switch extends Sdkbase {
  create () {
    this.tagName = 'switch'
    this.template = '<div></div>'
    this.clazz = window.qzz.ui.input.switch
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.getValue()
    }
    return res
  }
  setValue (val) {
    if (this.com) {
      return this.com.setValue(val)
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

/**
 * 下拉框组件.
 */
class Datepicker extends Sdkbase {
  create () {
    this.tagName = 'datepicker'
    this.template = '<div></div>'
    this.clazz = window.qzz.ui.input.datepicker
  }
  initOption (dom, option) {
    if (option.disInput == null) {
      option.disInput = true
    }
    return super.initOption(dom, option)
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.getValue()
    }
    return res
  }
  setValue (val) {
    if (this.com) {
      return this.com.setValue(val)
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

/**
 * 表格组件.
 */
class Grid extends Sdkbase {
  create () {
    this.tagName = 'grid'
    this.template = '<table><tr><td></td></tr></table>'
    this.clazz = window.qzz.ui.grid
  }
  getValue () {
    var res = null
    if (this.com) {
      res = this.com.value()
    }
    return res
  }
  setValue (datas) {
    if (this.com) {
      var that = this
      return new Promise(function (resolve, reject) {
        that.com.value(datas, function () {
          resolve('')
        })
        that = null
      })
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        this.com.bind('onChanged', func)
      }
    }
  }
}

var csdks = sdks
sdks.combobox = Combobox
sdks.updown = Updown
sdks.edit = Edit
sdks.switch = Switch
sdks.datepicker = Datepicker
sdks.grid = Grid
export default csdks
