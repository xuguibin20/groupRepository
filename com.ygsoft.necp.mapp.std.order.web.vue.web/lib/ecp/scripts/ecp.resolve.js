var ecp = require('../../../ecpconfig')

export default function (url) {
  var isPro = process.env.NODE_ENV === 'production'
  var res = ''
  if (isPro) {
    // 计算相对路径.
    var serpath = ecp.config.serverPath
    var ecppath = ecp.config.path
    // eslint-disable-next-line no-useless-escape
    var serpathAry = serpath.split(/[\\\/]/g)
    // eslint-disable-next-line no-useless-escape
    var ecppathAry = ecppath.split(/[\\\/]/g)
    // 找到不相同的目录.
    var i = 0
    for (var slen = serpathAry.length, elen = ecppathAry.length; i < slen && i < elen; i++) {
      var csp = serpathAry[i]
      var cep = ecppathAry[i]
      if (csp !== cep) {
        break
      }
    }
    var pathAry = []
    if (i > 0) {
      ecppathAry.splice(0, i)
      pathAry = ecppathAry
    }
    var dynpath = ''
    i = 0
    for (var len = pathAry.length; i < len; i++) {
      if (pathAry[i] !== '') {
        dynpath += '../'
      }
    }

    res = dynpath
  } else {
    res = ecp.config.contextPath + '/'
  }
  if (url != null && url !== '') {
    res = res + url
  }
  window.console.log(res)
  return res
}
