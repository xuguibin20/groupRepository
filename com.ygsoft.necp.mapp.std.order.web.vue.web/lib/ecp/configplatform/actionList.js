import server from 'ecp.service'
import cconst from './commonConst'

export default {
  'getArguments': function (eventObj, params) {
    var url, argName
    if (params.length === 1) {
      argName = params[0]
      url = window.location.href
    } else if (params.length > 1) {
      url = params[0]
      argName = params[1]
    } else {
      return
    }
    var com = this.getComById(eventObj.comid)
    // 以上方法无法处理如果参数中存在#号的情况
    var reg = new RegExp('(^|\\?|&|#)' + argName + '=([^&]*)(\\s|&|$)', 'ig')
    // if (decode === true) {
    //     url = this.decodeSearch(url);
    // }
    if (reg.test(url)) {
      var ret = unescape(RegExp.$2.replace(/\+/g, ' '))
      var p = ret.indexOf('#')
      if (p > -1) {
        ret = ret.substring(0, p)
      }
      this.setValue(com, '', ret)
      // return ret;
    }
  },
  'saveData': function (eventObj, params) {
    var rs = this.servers[eventObj.server]
    if (rs == null) {
      return
    }
    // var to = eventObj.init

    if (window.console) {
      window.console.info('[' + eventObj.comtype + '] ' + eventObj.comid + '.saveData' +
        JSON.stringify(params).replace('[', '(').replace(']', ')'))
    }
    if (rs.sync === true) {
      // 同步请求
      var res = null
      if (/get/i.test(rs.mothed)) {
        res = server.doGetSync(rs.url, rs.mothedName, params)
      } else {
        res = server.doPostSync(rs.url, rs.mothedName, params)
      }
      return res
    } else {
      return new Promise(function (resolve, reject) {
        // var that = this
        if (/get/i.test(rs.mothed)) {
          // 异步请求
          server.doGet(rs.url, rs.mothedName, params).then(function (result) {
            res = result
            resolve(res)
          })
        } else {
          // 异步请求
          server.doPost(rs.url, rs.mothedName, params).then(function (result) {
            res = result
            resolve(res)
          })
        }
      }) // Promise
    }
  },
  'getData': function (eventObj, params) {
    var com = this.getComById(eventObj.comid)
    var rs = this.servers[eventObj.server]
    if (rs == null) {
      return
    }
    var to = eventObj.init
    if (window.console) {
      window.console.info('[' + eventObj.comtype + '] ' + eventObj.comid + '.getData' +
            JSON.stringify(params).replace('[', '(').replace(']', ')'))
    }
    var that = this
    if (rs.sync === true) {
      // 同步请求
      var res = null
      var pms = null
      if (/get/i.test(rs.mothed)) {
        res = server.doGetSync(rs.url, rs.mothedName, params)
      } else {
        res = server.doPostSync(rs.url, rs.mothedName, params)
      }
      if (to == null || to === '') {
        pms = that.setValue(com, rs.path, res)
      } else if (to === cconst.LOAD) {
        pms = that.loadData(com, rs.path, res)
      }
      if (rs.totalCount != null) {
        that.setTotalCount(com, rs.totalCount, res)
      }
      return pms
    } else {
      return new Promise(function (resolve, reject) {
        if (/get/i.test(rs.mothed)) {
          // 异步请求
          server.doGet(rs.url, rs.mothedName, params).then(function (result) {
            res = result.data
            var pms = null
            if (to == null || to === '') {
              pms = that.setValue(com, rs.path, res)
            } else if (to === cconst.LOAD) {
              pms = that.loadData(com, rs.path, res)
            }
            if (rs.totalCount != null) {
              that.setTotalCount(com, rs.totalCount, res)
            }
            if (pms instanceof Promise) {
              pms.then(function () {
                resolve(res)
              })
            } else {
              resolve(res)
            }
            that = null
          })
        } else {
          // 异步请求
          server.doPost(rs.url, rs.mothedName, params).then(function (result) {
            res = result.data
            var pms = null
            if (to == null || to === '') {
              pms = that.setValue(com, rs.path, res)
            } else if (to === cconst.LOAD) {
              pms = that.loadData(com, rs.path, res)
            }
            if (rs.totalCount != null) {
              that.setTotalCount(com, rs.totalCount, res)
            }
            if (pms instanceof Promise) {
              pms.then(function () {
                resolve(res)
              })
            } else {
              resolve(res)
            }
            that = null
          })
        }
      })
    }
  },
  next: function (action, params) {
    var com = action.com
    if (typeof com.next === 'function') {
      com.next(params)
    }
  }
}
