/**
 * ecp mock
 * @param {*} serverAry
 * @param {*} key
 */
function returnMock (serverAry, key) {
  this.serverKey = key
  this.serverAry = serverAry
}
// 注册一个返回接口
returnMock.prototype.reply = function (status, data) {
  if (typeof status === 'function') {
    this.serverAry[this.serverKey].data = status
  } else {
    var len = arguments.length
    if (len > 1) {
      this.serverAry[this.serverKey].status = status
      this.serverAry[this.serverKey].data = data
    } else if (len === 1) {
      this.serverAry[this.serverKey].status = 200
      this.serverAry[this.serverKey].data = status
    }
  }
}

function ecpMock (service) {
  this.serverAry = {}
  this.service = service
  var me = this
  function cresolve (oldFunc) {
    var func = function (serverName, methods, params) {
      if (typeof methods === 'object') {
        params = methods
        methods = ''
      }
      var key = serverName + '_' + (methods || '')
      // 查找serverAry
      var sr = me.serverAry[key]
      if (sr != null) {
        var res = null
        if (typeof sr.data === 'function') {
          var cdata = sr.data.apply(this, [params])
          if (cdata instanceof Promise) {
            res = cdata
          } else {
            res = new Promise(function (resolve, reject) {
              resolve({code: sr.status, msg: '', data: cdata})
            })
          }
        } else {
          res = new Promise(function (resolve, reject) {
            resolve({code: sr.status, msg: '', data: sr.data})
          })
        }
        return res
      } else {
        return oldFunc.apply(this, arguments)
      }
    }
    return func
  }
  var of = this.service.doPost
  this.service.doPost = cresolve(of)
  of = this.service.doGet
  this.service.doGet = cresolve(of)
}
// 注册一个调用入口,
ecpMock.prototype.doPost = function (serverName, methods, params) {
  if (typeof methods === 'object') {
    params = methods
    methods = ''
  }
  var key = serverName + '_' + (methods || '')
  this.serverAry[key] = {'params': params}

  // eslint-disable-next-line new-cap
  return new returnMock(this.serverAry, key)
}
export default ecpMock
