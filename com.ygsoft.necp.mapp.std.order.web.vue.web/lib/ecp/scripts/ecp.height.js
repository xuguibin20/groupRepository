var suitheight = {
  __getDomStyle: function (dom) {
    var cst = null
    if (getComputedStyle) {
      cst = getComputedStyle(dom)
    } else {
      cst = dom.currentStyle
    }
    return cst
  },
  __getBorderHeight: function (dom) {
    var cst = this.__getDomStyle(dom)
    var tw = parseInt(cst.borderTopWidth.replace('px', ''), 10)
    var bw = parseInt(cst.borderBottomWidth.replace('px', ''), 10)
    return tw + bw
  },
  __getMarginHeight: function (dom) {
    var cst = this.__getDomStyle(dom)
    var tw = 0 // parseInt(cst.marginTop.replace('px', ''), 10)
    var bw = parseInt(cst.marginBottom.replace('px', ''), 10)
    return tw + bw
  },
  __getPaddingHeight: function (dom) {
    var cst = this.__getDomStyle(dom)
    if (cst.boxSizing === 'border-box') {
      return 0
    } else {
      var tw = parseInt(cst.paddingTop.replace('px', ''), 10)
      var bw = parseInt(cst.paddingBottom.replace('px', ''), 10)
      return tw + bw
    }
  },
  __getOffetTop: function (dom) {
    var pn = dom.parentNode
    var pr = pn.getBoundingClientRect()
    var top = pr.top
    if (pn != null) {
      var tagName = pn.tagName.toUpperCase()
      if (tagName === 'BODY' || pn.tagName.toUpperCase() === 'DOCTYPE') {
        top = 0
      }
    }
    var cr = dom.getBoundingClientRect()
    return cr.top - top
  },
  _getBodyHeight: function () {
    var h1 = document.body.offsetHeight
    var h2 = document.documentElement.clientHeight
    if (h1 < h2) {
      h1 = h2
    }
    return h1
  },
  __doResize: function (dom) {
    var pdom = dom
    if (pdom == null) {
      pdom = document.body
    }
    var clientAry = pdom.querySelectorAll('.clientheight')

    var i = 0
    var ilen = 0
    var cdom = null
    var pnode = null
    var ch = 0
    var top = 0
    // 处理高度
    for (i = 0, ilen = clientAry.length; i < ilen; i++) {
      cdom = clientAry[i]
      pnode = cdom.parentNode
      var bw = this.__getBorderHeight(cdom)

      ch = pnode.clientHeight
      var tagName = pnode.tagName.toUpperCase()
      if (tagName === 'BODY' || (ch === 0 && pnode.tagName.toUpperCase() === 'DOCTYPE')) {
        ch = this._getBodyHeight()
        var mt = this.__getMarginHeight(document.body)
        ch = ch - mt - 1
      }
      var ptz = this.__getPaddingHeight(pnode) / 2
      var pt = this.__getPaddingHeight(cdom)
      var cmt = this.__getMarginHeight(cdom)
      top = this.__getOffetTop(cdom) - 1
      if (ch > top) {
        cdom.style.height = (ch - top - bw - cmt - pt - ptz) + 'px'
        if (typeof cdom.onResize === 'function') {
          cdom.onResize.apply(cdom)
        }
      }
    }
  },
  doResize: function (dom) {
    var me = this
    setTimeout(function () {
      me.__doResize(dom)
    }, 10)
  }
}
suitheight.doResize()

if (window._ecp_auto_suitheight == null) {
  window._ecp_auto_suitheight = function () {
    suitheight.doResize()
  }
  if (window.addEventListener) {
    window.addEventListener('resize', window._ecp_auto_suitheight, false)
  } else {
    window.attachEvent('onresize', window._ecp_auto_suitheight)
  }
}
export default suitheight
