'use strict'
var path = require('path')
var config = require('./index')
var fileObj = require('./file')

var ecp = config.ecp

exports.getEcpTitle = function () {
  return ecp.config.title
}

exports.getdynPath = function (cpath) {
  var pathAry = cpath.split('/')
  var dynpath = ''
  for (var i = 0, len = pathAry.length; i < len; i++) {
    if (pathAry[i] !== '') {
      dynpath += '../'
    }
  }
  return dynpath
}

exports.getEcpPath = function (cur) {
  // console.log('<<<<' + JSON.stringify(cur))
  // var config = cur.config
  var source = cur.source
  var isPro = process.env.NODE_ENV === 'production'
  var res = ''
  if (ecp.config.name === 'ecp') {
    var ewp = source.serverPath['ecp-webCtxPath'] || ''
    if (ewp !== '') {
      ewp = ewp + '/'
    }
    return '/grm/' + ewp
  } else {
    var rootPath = /WebContent|src\/main\/resources\/META-INF\/resources/ig
    // 计算相对路径.
    if (source.serverPath != null) {
      var serpath = source.serverPath[ecp.config.name]
      if (serpath != null) {
        serpath = serpath.replace(rootPath, '')
      }
      var ecppath = ecp.config.path
      if (ecppath != null) {
        ecppath = ecppath.replace(rootPath, '')
      }
      // eslint-disable-next-line no-useless-escape
      var serpathAry = serpath.split(/[\\\/]/g)
      // eslint-disable-next-line no-useless-escape
      var ecppathAry = ecppath.split(/[\\\/]/g)
      // 找到不相同的目录.
      var i = 0
      for (var slen = serpathAry.length, elen = ecppathAry.length; i < slen && i < elen; i++) {
        // eslint-disable-next-line one-var
        var csp = serpathAry[i], cep = ecppathAry[i]
        if (csp !== cep) {
          break
        }
      }
      var pathAry = []
      if (i > 0) {
        ecppathAry.splice(0, i)
        serpathAry.splice(0, i)
        pathAry = ecppathAry
      }
      var sp = serpathAry.join('/') + '/'
      if (isPro === true) {
        // 生产环境要写相对路径
        var dynpath = ''
        // eslint-disable-next-line no-redeclare
        for (var i = 0, len = pathAry.length; i < len; i++) {
          if (pathAry[i] !== '') {
            dynpath += '../'
          }
        }
        res = dynpath + sp
      } else {
        // 开发环境写绝对路径就可以了
        res = ecp.config.contextPath + '/' + sp
      }
    }
    return res
  }
}

exports.getExternals = function () {
  console.log('\n--externals------------------------------')
  var isPro = process.env.NODE_ENV === 'testing'
  var res = {}
  for (var cfkey in config) {
    console.log('--[ ' + cfkey + ' ]--------')
    var cur = config[cfkey]
    var importFromServer = cur.config.importFromServer
    for (var key in importFromServer) {
      if (importFromServer[key] === true && isPro !== true) {
        var cet = cur.source.source[key]
        if (cet != null && cet !== '') {
          var cep = cet.export
          if (cep == null || cep === '') {
            cep = 'window'
          }
          res[key] = cep
          console.log(key + ' : ' + cep)
        }
      }
    }
  }
  console.log('-----------------------------------------')
  return res
}

exports.getAlias = function () {
  console.log('--alias------------------------------')
  var isPro = process.env.NODE_ENV === 'production'
  var res = {}
  for (var cfkey in config) {
    console.log('--[ ' + cfkey + ' ]--------')
    var cur = config[cfkey]
    var importFromServer = cur.config.importFromServer
    for (var key in importFromServer) {
      // console.log(key + '>>' + importFromServer[key])
      if (importFromServer[key] === false || isPro === true) {
        var cal = cur.source.source[key].localPath
        if (cal != null && cal !== '') {
          res[key] = cal
          console.log(key + ' : ' + res[key])
        }
      }
    }
    // mock 固定参数
    var alias = cur.source.alias
    for (var akey in alias) {
      res[akey] = alias[akey]
      console.log(akey + ' : ' + res[akey])
    }
  }
  console.log('--[ 固定 ]--------')
  var mockpath = '/mock'
  if (ecp.config.usemock === false || isPro === true) {
    mockpath = '/mock/empty'
  }
  res['ecp.mock'] = this.resolve('src') + mockpath
  console.log('ecp.mock' + ' : ' + res['ecp.mock'])
  return res
}

exports.getEcpSource = function () {
  console.log('\n\n--EcpSource------------------------------')
  var res = []
  for (var cfkey in config) {
    console.log('--[ ' + cfkey + ' ]--------')
    var cur = config[cfkey]
    var importFromServer = cur.config.importFromServer
    // console.log('>>>>' + JSON.stringify(cur))
    // console.log('>>>>' + cfkey)
    var path = this.getEcpPath(cur)
    for (var key in importFromServer) {
      if (importFromServer[key] === true) {
        var ss = cur.source.source[key]
        var ext = '.js'
        if (ss.type != null && ss.type !== '') {
          ext = '.' + ss.type
        }
        var name = key
        if (ss.name != null && ss.name !== '') {
          name = ss.name
        }
        var lres = path + ss.path + '/' + name + ext
        res.push(lres)
        console.log(key + ' : ' + lres)
      }
    }
  }
  console.log('-----------------------------------------')
  return res
}

exports.resolve = function (dir) {
  return path.join(__dirname, '..', dir)
}

exports.copyfiles = function () {
  var ecpconfig = ecp.config
  if (ecpconfig.autoCopyToBandle === true &&
      ecpconfig.bundlePath != null &&
        ecpconfig.path != null) {
    var sourcePath = this.resolve('src') + '/../dist'
    var targetPath = ecpconfig.bundlePath + '/' + ecpconfig.path
    if (ecpconfig.delOldFiles === true) {
      fileObj.del(targetPath + '/static/')
    }
    fileObj.copy(sourcePath, targetPath)
  }
}
