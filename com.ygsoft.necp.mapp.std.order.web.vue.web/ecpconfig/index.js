'use strict'
var fs = require('fs')
var resolve = require('./resolve')

var source = require('./source')
var config = require('./config')
var res = {ecp: {'config': config, 'source': source}}

// 加载其它配置
if (fs != null && fs.readdirSync) {
  var domainpath = resolve('lib/domain')
  var paths = fs.readdirSync(domainpath)
  paths.forEach(function (cpath) {
    // 资源
    var dmsource = require(domainpath + '/' + cpath + '/source')
    if (dmsource.unload !== true) {
      // 配置
      var dmconfig = require(domainpath + '/' + cpath + '/config')
      res[cpath] = {
        'config': dmconfig, 'source': dmsource
      }
    }
  })
}
module.exports = res
