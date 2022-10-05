/**
 * pdf导出控件.
 * 创建：QZZ
 * 日期：2019-10-22
 */
import utils from 'ecp.utils'
import svr from 'ecp.service'
import dct from 'ecp.datacontext'

var ecp = require('../../../../ecpconfig')

var servletName = ecp.ecp.source.printServlet[ecp.ecp.config.name]
if (window.console) {
  window.console.info(servletName)
}

function PdfExport () {};
PdfExport.prototype.execute = function (params, callBack) {
  this.open(params, callBack)
}

PdfExport.prototype.open = function (params, callBack) {
  var form = document.createElement('form')
  form.setAttribute('style', 'display:none;position:absolute;top:0px;left:0px;')
  var download = params.download === true || params.download === 'true'
  if (download) {
    form.setAttribute('target', '')
  } else {
    form.setAttribute('target', '_blank')
  }
  form.setAttribute('accept-charset', 'UTF-8')
  // form.attr("enctype","text/plain");
  form.setAttribute('enctype', 'multipart/form-data')
  form.setAttribute('method', 'post')
  var vipAddress = params.vipAddress
  if (vipAddress == null) {
    vipAddress = ''
  }
  form.setAttribute('action', this.getContextPath() + vipAddress + servletName)
  document.body.appendChild(form)
  if (params != null) {
    params.i18n = utils.getLanguage()
    if (dct != null) {
      params.context = JSON.stringify(dct.getEcpDataContext())
    }
    // 处理岗位流程， 图片问题。
    if (params.data != null) {
      if (typeof params.data === 'string') {
        params.data = JSON.parse(params.data)
      }
      if (params.data.postFlow != null) {
        var pf = params.data.postFlow
        for (var i = 0, ilen = pf.length; i < ilen; i++) {
          var cf = pf[i]
          if (typeof cf === 'object') {
            if (cf.url != null && cf.url !== '' && cf.url.indexOf('http') < 0) {
              cf.url = window.location.origin + cf.url
            }
            if (cf.wturl != null && cf.wturl !== '' && cf.wturl.indexOf('http') < 0) {
              cf.wturl = window.location.origin + cf.wturl
            }
          }
        }
      }
    }
    for (var key in params) {
      if (typeof params[key] === 'object') {
        params[key] = JSON.stringify(params[key])
      }
      if (params[key] != null && params[key] !== '') {
        var vals = params[key]
        if (typeof vals === 'string') {
          // eslint-disable-next-line no-useless-escape
          vals = vals.replace(/\-\-/g, '—')
        }
        var input = document.createElement('input')
        input.setAttribute('type', 'hidden')
        input.setAttribute('name', key)
        input.setAttribute('value', encodeURIComponent(vals))
        form.appendChild(input)
      }
    }
  }
  form.submit()
  if (typeof callBack === 'function') {
    var option = params
    // 设置打印份数.
    try {
      if (download !== true && option.classid != null && option.typeid != null &&
                        option.gid != null && option.gid !== 0) {
        var iservice = 'com.ygsoft.ecp.app.operator.system.service.context.IXtdyfaContext'
        var mothed = 'setPrintCounts'
        var yhdm = option.yhdm
        if (dct != null) {
          yhdm = yhdm || dct.getEcpDataContext().loginContext.userId
        }
        var bindArray = [option.classid, option.typeid, (option.gid || '') + '', yhdm]
        svr.doPost(iservice, mothed, bindArray)
      }
    } catch (e) {
      //
    }
    callBack()
  }
}

PdfExport.prototype.getContextPath = function () {
  var cp = window._ecp_remote_context_path
  if (cp != null && cp !== '') {
    var res = cp
    return res
  }
  var baseStr = '/mapp/'
  var assertsStr = '/assets/'
  var baseUrl = window.location.pathname
  var bi = baseUrl.indexOf(baseStr)

  // eslint-disable-next-line no-redeclare
  var res = ''
  if (bi >= 0) {
    baseUrl = baseUrl.substr(0, bi)
    res = baseUrl.replace(/\/[^\/]+$/, '')
  } else {
    bi = baseUrl.indexOf(assertsStr)
    if (bi >= 0) {
      res = baseUrl.substr(0, bi)
    }
  }
  if (window.console) {
    window.console.log('context path is:' + res)
  }
  return res
}

PdfExport.prototype.browser = function () {
  var re = {}
  var ua = navigator.userAgent.toLowerCase()
  re.firefox = /firefox\/([\d\.]+)/.test(ua)
  re.msie = /msie\s([\d\.]+)/.test(ua)
  re.chrome = /chrome\/([\d\.]+)/.test(ua)
  return re
}

export default new PdfExport()
