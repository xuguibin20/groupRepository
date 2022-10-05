import cconst from './commonConst'
import sdks from './sdkconfig'

function compmanage (relation) {
  this.relation = relation
  this.sdkList = {}
  this.comList = []
  this.comJson = {}
}
compmanage.prototype = {
  _toJson: function (str) {
    var rs = str
    // eslint-disable-next-line no-useless-escape
    if (/^([ \n\t]+)?[{\[]/.test(str)) {
      try {
        str = str.replace(/'/g, '"')
        rs = JSON.parse(str)
      } catch (e) {
        if (window.console) {
          window.console.info(e)
        }
        try {
          rs = JSON.parse(str.replace(/([{,])([ ]+)?([a-z]+)([ ]+)?:/ig, '$1$2"$3"$4:'))
        } catch (err) {
          if (window.console) {
            window.console.info(err)
          }
          rs = str
        }
      }
    }
    return rs
  },
  _toDom: function (template) {
    if (this.frm == null) {
      this.frm = document.createDocumentFragment()
      this.frmContent = document.createElement('div')
      this.frm.appendChild(this.frmContent)
    }
    this.frmContent.innerHTML = template
    var res = null
    if (this.frmContent.childNodes.length > 0) {
      res = this.frmContent.childNodes[0]
    }
    return res
  },
  _decodeTemplate: function (ctn) {
    for (var key in sdks) {
      var obj = new sdks[key]()
      this.sdkList[key] = obj
      var tagName = obj.tagName || key
      var doms = ctn.querySelectorAll(tagName)
      for (var i = 0, ilen = doms.length; i < ilen; i++) {
        var cdom = doms[i]
        var ndom = this._toDom(obj.template)
        var pdom = cdom.parentElement
        pdom.insertBefore(ndom, cdom)
        // 复制属性
        for (var a = 0, alen = cdom.attributes.length; a < alen; a++) {
          var cas = cdom.attributes[a]
          var ckey = cas.name
          var copt = cas.value
          if (ckey === 'style') {
            var ostyle = ndom.getAttribute(ckey)
            if (ostyle != null && ostyle !== '') {
              copt = ostyle + ';' + ostyle
            }
          }
          if (typeof copt !== 'function' && copt != null && copt !== '') {
            ndom.setAttribute(ckey, copt)
          }
        }
        // 复制子节点
        var cin = ndom.querySelector('inner')
        var bobj = cin
        for (var c = cdom.childNodes.length - 1; c >= 0; c--) {
          var ccd = cdom.childNodes[c]
          if (cin == null) {
            if (ndom.childNodes.length === 0) {
              ndom.appendChild(ccd)
            } else {
              ndom.insertBefore(ccd, ndom.childNodes[0])
            }
          } else {
            var pnode = cin.parentElement
            pnode.insertBefore(ccd, bobj)
            bobj = ccd
          }
        }
        if (cin != null) {
          cin.parentElement.removeChild(cin)
        }
        // 配置控件类型属性.
        ndom.setAttribute('comtype', obj.tagName)
        // 移除原来的占位符
        pdom.removeChild(cdom)
      }
    }
  },
  _createComponent: function (key, ndom) {
    // 缓存起来.
    var vcom = ndom.getAttribute(cconst.VCOM)
    if (vcom != null && vcom !== '') {
      ndom.removeAttribute(cconst.VCOM)
      ndom.setAttribute(cconst.COMID, vcom)
    }
    var obj = null
    // 获取对应的sdk对象.
    var Clazz = sdks[key]
    if (typeof Clazz === 'function') {
      obj = new Clazz()
      if (key != null && key !== '') {
        var option = ndom.getAttribute('option')
        if (option != null && option !== '') {
          option = this._toJson(option)
        } else {
          option = {}
        }

        var width = ndom.getAttribute('width') || ndom.style.width
        if (width != null && width !== '') {
          option.width = width
        }
        var height = ndom.getAttribute('height') || ndom.style.height
        if (height != null && height !== '') {
          option.height = height
        }
        if (vcom != null && vcom !== '') {
          // 合并关系列表上的属性配置.
          var ropt = this.relation[vcom]
          if (ropt && ropt.option) {
            for (var rkey in ropt.option) {
              if (option[rkey] == null) {
                option[rkey] = ropt.option[rkey]
              }
            }
          }
          obj.id = vcom
        }
        obj.createComponent(ndom, option)
        if (vcom != null && vcom !== '') {
          if (this.comJson[vcom]) {
            this.logError('组件' + vcom + '命名重复，请调整。')
          }
          this.comJson[vcom] = obj
          this.comList.push(obj)
        }
      }
    } else {
      // eslint-disable-next-line new-cap
      obj = new sdks['comdom']()
      obj.createComponent(ndom, {})
      obj.id = vcom
      if (this.comJson[vcom]) {
        this.logError('组件' + vcom + '命名重复，请调整。')
      }
      this.comJson[vcom] = obj
      this.comList.push(obj)
    }
  },
  _createComponents: function (ctn) {
    var doms = ctn.querySelectorAll('[' + cconst.VCOM + '],[' + cconst.COMTYPE + ']')
    var cols = []
    var rows = []
    var ctnChilds = []
    var container = []
    var menus = []
    var i = 0
    var ilen = 0
    var ndom = null
    var key = ''
    for (i = 0, ilen = doms.length; i < ilen; i++) {
      ndom = doms[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      if (key === 'cols') {
        cols.push(ndom)
      } else if (key === 'row') {
        rows.push(ndom)
      } else if (key === 'header' || key === 'aside' || key === 'main' || key === 'footer') {
        ctnChilds.push(ndom)
      } else if (key === 'container') {
        container.push(ndom)
      } else if (key === 'menu') {
        menus.push(ndom)
      } else {
        this._createComponent(key, ndom)
      }
    }
    for (i = 0, ilen = menus.length; i < ilen; i++) {
      ndom = menus[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      this._createComponent(key, ndom)
    }
    for (i = 0, ilen = cols.length; i < ilen; i++) {
      ndom = cols[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      this._createComponent(key, ndom)
    }
    for (i = 0, ilen = rows.length; i < ilen; i++) {
      ndom = rows[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      this._createComponent(key, ndom)
    }
    for (i = 0, ilen = ctnChilds.length; i < ilen; i++) {
      ndom = ctnChilds[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      this._createComponent(key, ndom)
    }
    for (i = 0, ilen = container.length; i < ilen; i++) {
      ndom = container[i]
      key = ndom.getAttribute(cconst.COMTYPE)
      this._createComponent(key, ndom)
    }
    // if (container != null) {
    //   this._createComponent('container', container)
    // }
  },
  createComData: function (data) {
    // 创建数据型的组件.
    // eslint-disable-next-line new-cap
    var ccom = new sdks['comdata']()
    ccom.createComponent(data, {})
    return ccom
  },
  logError: function (str) {
    if (window.console) {
      window.console.error(str)
    }
  },
  /**
     * 执行替换.
     * @param {dom} container
     */
  execute: function (container) {
    var ctn = container
    if (ctn == null) {
      ctn = document.body
    }
    this._decodeTemplate(ctn)
    this._createComponents(ctn)
  },
  getComList: function () {
    return this.comList
  },
  getComJson: function () {
    return this.comJson
  }
}

export default compmanage
