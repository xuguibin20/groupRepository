import dataList from './dataList'

function Server () {

}

Server.prototype.doPost = function (url, methodName, param) {
  return new Promise(function (resolve, reject) {
    var res = dataList[url]
    if (typeof res === 'function') {
      res = res.apply(this, param)
    }
    resolve(res)
  })
}

Server.prototype.doPostSync = function (url, methodName, param) {
  return dataList[url]
}

Server.prototype.doGet = function (url, param) {
  return new Promise(function (resolve, reject) {
    var res = dataList[url]
    if (typeof res === 'function') {
      res = res.apply(this, param)
    }
    resolve(res)
  })
}

Server.prototype.doGetSync = function (url, methodName, param) {
  return dataList[url]
}

export default new Server()
