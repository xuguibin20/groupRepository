function funcMock (obj, method) {
  this.mock = null
  this.func = obj
  this.method = method
}

funcMock.prototype.return = function (data) {
  var oldFunc = null
  var type = null
  if (this.method == null && typeof this.func === 'function') {
    oldFunc = window.abc
    type = 'function'
    if (oldFunc != null && oldFunc.name != null) {
      this.method = oldFunc.name
    }
    window.abc = function () {
      return data
    }
  } else if (this.func[this.method]) {
    oldFunc = this.func[this.method]
    type = 'object'
    this.func[this.method] = function () {
      return data
    }
  } else if (this.func.prototype[this.method]) {
    oldFunc = this.func.prototype[this.method]
    type = 'prototype'
    this.func.prototype[this.method] = function () {
      return data
    }
  }
  this.mock = {key: this.method, func: oldFunc, type: type}
}

funcMock.prototype.reset = function () {
  var cm = this.mock
  if (cm.type === 'function' && cm.key != null) {
    window[cm.key] = cm.func
  } else if (cm.type === 'object') {
    this.func[cm.key] = cm.func
  } else if (cm.type === 'prototype') {
    this.func.prototype[cm.key] = cm.func
  }
}

function ecpMock () {
  this._mockList = []
}

ecpMock.prototype.when = function (obj, method) {
  // eslint-disable-next-line new-cap
  var fm = new funcMock(obj, method)
  this._mockList.push(fm)
  return fm
}

ecpMock.prototype.reset = function () {
  for (var i = 0, len = this._mockList.length; i < len; i++) {
    var cm = this._mockList[i]
    cm.reset()
  }
}

// eslint-disable-next-line new-cap
export default new ecpMock()
