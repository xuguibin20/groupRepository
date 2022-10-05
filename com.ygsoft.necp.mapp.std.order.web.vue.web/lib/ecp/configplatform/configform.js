import cconst from './commonConst'
import Compmanage from './compmanage'
import actionList from './actionList'
import checkList from './checkList'

function Controllor (option) {
  this.comList = []
  this.comJson = {}
  this.waits = {}
  this.container = null
  // 合并继承关系.
  this.option = this.mergeExtend(this.extend({}, option))
}

Controllor.prototype.getData = function () {
  if (this.option.data == null) {
    this.option.data = {}
  }
  return this.option.data
}

Controllor.prototype.mounted = function () {
  var cdom = this.option.el // document.querySelector(this.option.el)
  if (typeof cdom === 'string') {
    cdom = document.querySelector(this.option.el)
  }
  this.ctrl = this.option
  this.ctrl.$root = this
  this.init(cdom)
}

Controllor.prototype._toDom = function (template) {
  var frm = document.createDocumentFragment()
  var frmContent = document.createElement('div')
  frm.appendChild(frmContent)
  frmContent.innerHTML = template
  return frmContent
}

Controllor.prototype.mergeCondition = function (eobj, obj) {
  // 合并其他结果
  var objs = this.extend({}, eobj)
  for (var key in obj) {
    objs[key] = obj[key]
  }
  return objs
}

Controllor.prototype.mergeExtend = function (option) {
  // 复制出独立的对象
  if (option.extend) {
    var poption = option.extend
    if (poption.extend != null) {
      // 一层层递归处理
      poption = this.mergeExtend(poption)
    }
    // 合并模板
    var template = poption.template
    var dom = this._toDom(template)
    var ctemplate = option.template
    var cdom = this._toDom(ctemplate)
    var bflist = []
    var dellist = []
    var i = 0
    for (i = cdom.childNodes.length - 1; i >= 0; i--) {
      var ccdom = cdom.childNodes[i]
      if (ccdom.nodeType === 1) {
        // 处理前面添加操作
        var bf = ccdom.getAttribute(cconst.VBEFORE)
        ccdom.removeAttribute(cconst.VBEFORE)
        var cns = null
        var pcns = null
        if (bf != null) {
          cns = dom.querySelector('#' + bf)
          if (cns) {
            pcns = cns.parentElement
            bflist.push({pnode: pcns, cdom: ccdom, bnode: cns})
            continue
          }
        }
        // 处理后面添加操作
        var af = ccdom.getAttribute(cconst.VAFTER)
        ccdom.removeAttribute(cconst.VAFTER)
        if (af != null) {
          cns = dom.querySelector('#' + af)
          if (cns) {
            pcns = cns.parentElement
            pcns.insertBefore(ccdom, cns)
            pcns.insertBefore(cns, ccdom)
            continue
          }
        }
        // 处理替换操作
        var rf = ccdom.getAttribute(cconst.VREPLACE)
        ccdom.removeAttribute(cconst.VREPLACE)
        if (rf != null) {
          cns = dom.querySelector('#' + rf)
          if (cns) {
            pcns = cns.parentElement
            pcns.insertBefore(ccdom, cns)
            pcns.insertBefore(cns, ccdom)
            dellist.push({pnode: pcns, dnode: cns})
            continue
          }
        }
        // 添加删除列表
        var df = ccdom.getAttribute(cconst.VDELETE)
        ccdom.removeAttribute(cconst.VDELETE)
        if (df != null) {
          cns = dom.querySelector('#' + df)
          if (cns) {
            pcns = cns.parentElement
            dellist.push({pnode: pcns, dnode: cns})
            continue
          }
        }
      }
    }
    for (i = bflist.length - 1; i >= 0; i--) {
      var cbf = bflist[i]
      cbf.pnode.insertBefore(cbf.cdom, cbf.bnode)
    }
    var ilen = 0
    for (i = 0, ilen = dellist.length; i < ilen; i++) {
      var cdel = dellist[i]
      if (cdel.dnode.parentElement === cdel.pnode) {
        cdel.pnode.removeChild(cdel.dnode)
      }
    }
    option.template = dom.innerHTML
    // 合并其他结果
    for (var key in poption) {
      var eopt = poption[key]
      if (typeof eopt === 'object' && key !== '$root') {
        option[key] = this.mergeCondition(eopt, option[key])
      }
    }
  }
  return option
}
/**
 * 通过id获取组件对象.
 */
Controllor.prototype.getComById = function (id) {
  var res = null
  if (this.comJson[id]) {
    res = this.comJson[id]
  }
  return res
}

Controllor.prototype.logInfo = function (str) {
  if (window.console) {
    window.console.info(str)
  }
}

Controllor.prototype.logError = function (e) {
  if (window.console) {
    window.console.error(e)
  }
}

Controllor.prototype.getDataByPath = function (res, path) {
  if (path == null || path === '') {
    return res
  }
  var pathAry = path.split('.')
  var cval = res
  for (var i = 0, ilen = pathAry.length; i < ilen; i++) {
    var cp = pathAry[i]
    if (cval != null && cval[cp]) {
      cval = cval[cp]
    } else {
      cval = null
      break
    }
  }
  if (cval == null) {
    this.logInfo('数据节点:' + path + '不存在。')
  }
  return cval
}

/**
 * 设置当前值.
 */
Controllor.prototype.setValue = function (com, path, res, callBack) {
  if (com != null && com.setValue) {
    var cval = this.getDataByPath(res, path)
    if (cval != null) {
      var id = com.id
      this.logInfo('[' + com.tagName + '] ' + id + '.setValue')
      var pms = com.setValue(cval)
      if (pms) {
        var that = this
        pms.then(function () {
          that.runComWaits(com).then(callBack)
          that = null
        })
      } else {
        this.runComWaits(com).then(callBack)
      }
    }
  }
}

Controllor.prototype.runComWaits = function (com) {
  var that = this
  return new Promise(function (resolve, reject) {
    var pmsAry = []
    if (com.waits && com.waits.length > 0) {
      for (var i = 0, ilen = com.waits.length; i < ilen; i++) {
        var cw = com.waits[i]
        var pms = that.doRun(cw)
        pmsAry.push(pms)
      }
      com.waits = null
    }
    that.toLastCallBack(pmsAry, function () {
      resolve()
    })
  })
}

Controllor.prototype.toLastCallBack = function (pmsAry, callBack) {
  var ilen = pmsAry.length
  var k = 0
  if (ilen > 0) {
    for (var i = 0; i < ilen; i++) {
      var cpms = pmsAry[i]
      if (cpms) {
        cpms.then(function () {
          k++
          if (k === ilen && typeof callBack === 'function') {
            callBack()
          }
        })
      } else {
        k++
        if (k === ilen && typeof callBack === 'function') {
          callBack()
        }
      }
    }
  } else {
    if (typeof callBack === 'function') {
      callBack()
    }
  }
}

Controllor.prototype._setDefValue = function (com, callBack) {
  var eventObj = this.getEventObject(com)
  var defValue = eventObj.defaultValue
  var defIndex = eventObj.defaultIndex
  var cpms1 = null
  var cpms2 = null
  if (defValue != null && defValue !== '') {
    cpms1 = com.setValue(defValue)
  } else if (defIndex != null && defIndex !== '' && com.setValueByIndex) {
    cpms2 = com.setValueByIndex(defIndex)
  }
  var cpms4 = this.runComWaits(com)
  this.toLastCallBack([cpms1, cpms2, cpms4], callBack)
}

Controllor.prototype.loadData = function (com, path, res, callBack) {
  if (com != null && com.loadData) {
    var cval = this.getDataByPath(res, path)
    if (cval != null) {
      var id = com.id
      this.logInfo('[' + com.tagName + '] ' + id + '.loadData')
      var pms = com.loadData(cval)
      var that = this
      this.toLastCallBack([pms], function () {
        that._setDefValue(com, callBack)
        that = null
      })
    } else if (typeof callBack === 'function') {
      callBack()
    }
  } else if (typeof callBack === 'function') {
    callBack()
  }
}

Controllor.prototype.setTotalCount = function (com, path, res) {
  if (com != null && com.setTotalCount) {
    var cval = this.getDataByPath(res, path)
    if (cval != null) {
      com.setTotalCount(cval)
    }
  }
}

Controllor.prototype.decodeCheck = function (checks) {
  if (checks == null && checks === '') {
    return null
  }
  var checkAry = checks.split(':')
  var id = ''
  if (checkAry.length > 0) {
    id = checkAry[0]
  }
  var check = ''
  if (checkAry.length > 1) {
    check = checkAry[1]
  }
  return {'id': id, 'check': check}
}
/**
 * 拆分wait值.
 */
Controllor.prototype.decodeWait = function (wait) {
  if (wait == null && wait === '') {
    return null
  }
  var waitAry = wait.split(':')
  var id = ''
  if (waitAry.length > 0) {
    id = waitAry[0]
  }
  var evt = ''
  if (waitAry.length > 1) {
    evt = waitAry[1]
  }
  return {'id': id, 'event': evt}
}
/**
 * 检查等待条件.
 */
Controllor.prototype.checkCondition = function (wait) {
  if (wait == null || wait === '') {
    return true
  }
  var waitAry = wait.split(',')
  var cds = true
  for (var i = 0, ilen = waitAry.length; cds && i < ilen; i++) {
    var cw = waitAry[i]
    var cwo = this.decodeCheck(cw)
    if (cwo != null) {
      if (cwo.check != null) {
        var ccw = cwo.check
        // 检验数据
        if (this.ctrl.checks[ccw]) {
          try {
            cds = this.ctrl.checks[ccw].apply(this.ctrl, [this.comJson[cwo.id]])
          } catch (e) {
            this.logError(e)
          }
        } else {
          this.logError('检查规则:' + ccw + '不存在。')
        }
      }
    }
  }
  return cds
}
/**
 * 运行具体事件.
 */
Controllor.prototype.doRun = function (eventObj, action) {
  var that = this
  return new Promise(function (resolve, reject) {
    var check = eventObj.check
    var cdn = that.checkCondition(check)
    if (cdn) {
      if (action == null) {
        action = {}
      }
      var cdo = action.action // eventObj.action
      var params = action.params
      if (cdo == null || cdo === '') {
        if (eventObj.action != null && eventObj.action !== '') {
          var actAry = eventObj.action
          if (actAry.length > 0) {
            cdo = actAry[0].name
            params = actAry[0].params
          }
        }
      }
      if ((cdo == null || cdo === '') && eventObj.server != null) {
        cdo = 'getData'
      }
      var dent = that.ctrl.actions[cdo]
      if (dent) {
        that.logInfo('[' + eventObj.comtype + '] run event ' + eventObj.comid + '.' + cdo)
        var pms = null
        try {
          params = that.initParams(params)
          pms = dent.apply(that.ctrl, [eventObj, params])
        } catch (e) {
          that.logError(e)
        }
        if (pms instanceof Promise) {
          pms.then(function (res) {
            // 事件后续处理.
            resolve(res)
          })
        } else {
          resolve(pms)
        }
      } else {
        resolve(false)
      }
    } else {
      resolve(false)
    }
    that = null
  })
}
/**
 * 获取具体事件对象.
 */
Controllor.prototype.getEventObject = function (com) {
  var id = com.id
  var obj = com._option
  var res = {}
  for (var key in obj) {
    res[key] = obj[key]
  }
  res.com = com
  res.comid = id
  return res
}

Controllor.prototype.decodeAction = function (acts) {
  if (acts == null || acts === '') {
    acts = []
  }
  return acts
}

Controllor.prototype.decodeEvent = function (evobj) {
  var event = evobj[cconst.EVENT]
  if (event == null || event === '') {
    event = []
  }
  evobj[cconst.EVENT] = event
  return evobj
}
/**
 * 读取元素属性.
 */
Controllor.prototype.getAttribute = function (cdom) {
  var comid = cdom.getAttribute(cconst.COMID)
  // 关系表配置
  var crel = this.ctrl.relations[comid] || {}
  var comtype = crel[cconst.COMTYPE] || cdom.getAttribute(cconst.COMTYPE)
  var to = crel[cconst.TO] || cdom.getAttribute(cconst.TO)
  var rsName = crel[cconst.SOURCE] || cdom.getAttribute(cconst.SOURCE)
  var params = crel[cconst.PARAMS] || cdom.getAttribute(cconst.PARAMS)
  var cdo = crel[cconst.DO] || cdom.getAttribute(cconst.DO)
  var msg = crel[cconst.MESSAGE] || cdom.getAttribute(cconst.MESSAGE)
  var wait = crel[cconst.WAIT] || cdom.getAttribute(cconst.WAIT)
  var check = crel[cconst.CHECK] || cdom.getAttribute(cconst.CHECK)
  var event = crel[cconst.EVENT] || cdom.getAttribute(cconst.EVENT)
  var trigger = crel[cconst.TRIGGER] || cdom.getAttribute(cconst.TRIGGER)
  var defaultValue = crel[cconst.DEFAULTVALUE]
  if (defaultValue == null || defaultValue === '') {
    defaultValue = cdom.getAttribute(cconst.DEFAULTVALUE)
  }
  var defaultIndex = crel[cconst.DEFAULTINDEX]
  if (defaultIndex == null || defaultIndex === '') {
    defaultIndex = cdom.getAttribute(cconst.DEFAULTINDEX)
  }
  // 属性
  var res = {
    'comid': comid,
    'comtype': comtype,
    'server': rsName,
    'init': to,
    'params': params,
    'wait': wait,
    'check': check,
    'action': cdo,
    'event': event,
    'trigger': trigger,
    'dom': cdom,
    'message': msg,
    'defaultValue': defaultValue,
    'defaultIndex': defaultIndex
  }
  return this.decodeEvent(res)
}
/**
 * 初始化所有组件.
 */
Controllor.prototype.initComs = function () {
  this.compmng = new Compmanage(this.ctrl.relations)
  this.compmng.execute(this.container)
  this.comJson = this.compmng.getComJson()
  this.comList = this.compmng.getComList()

  for (var i = 0, ilen = this.comList.length; i < ilen; i++) {
    var ccom = this.comList[i]
    var copt = this.getAttribute(ccom.dom)
    ccom._option = copt
    // 挂到根节点上.
    var id = ccom.id
    this.ctrl[id] = ccom
  }
}
/**
 * 添加行为事件.
 */
Controllor.prototype.addEvent = function (cwcom, cwevent, cwid) {
  var that = this
  cwcom.addEvent(cwevent.name, function () {
    that.doRun(that.waits[cwid], cwevent)
  })
}

Controllor.prototype.initEvent = function (ccom, eventObj) {
  var evts = eventObj.event
  if (evts.length > 0) {
    for (var i = 0, ilen = evts.length; i < ilen; i++) {
      var evt = evts[i]
      var ctr = evt.target
      var wcom = null
      if (ctr == null || ctr === '') {
        wcom = ccom
      } else {
        wcom = this.getComById(ctr)
      }
      if (wcom != null) {
        if (this.waits[wcom.id] == null) {
          // 事件中包含的对象添加到等待列表中
          this.waits[wcom.id] = this.getEventObject(wcom)
        }
        this.addEvent(ccom, evt, wcom.id)
      }
    }
  }
}
/**
 * 初始化组件关系.
 */
Controllor.prototype.initRelation = function () {
  this.runList = []
  var rels = this.ctrl.relations
  for (var key in rels) {
    var crel = rels[key]
    crel.action = this.decodeAction(crel.action)
    var ccom = this.comJson[key]
    var eventObj = crel
    if (ccom) {
      eventObj = this.getEventObject(ccom)
    } else {
      // 创建数据型的组件.
      ccom = this.compmng.createComData(this.ctrl.data)
      ccom.id = key
      if (this.comJson[key]) {
        this.logError('组件' + key + '命名重复，请调整。')
      }
      this.comJson[key] = ccom
      this.comList.push(ccom)

      eventObj.comid = key
      eventObj = this.decodeEvent(eventObj)
    }
    var wait = eventObj.wait
    if (wait !== true) {
      var check = eventObj.check
      var checkState = this.checkCondition(check)
      if (checkState === true) {
        this.runList.push(eventObj)
      } else {
        // 创建直接运行的依赖
        var checkAry = check.split(',')
        for (var j = 0, jlen = checkAry.length; j < jlen; j++) {
          var ccheck = checkAry[j]
          var ccAry = ccheck.split(':')
          if (ccAry.length > 0) {
            var pid = ccAry[0]
            var pcom = this.getComById(pid)
            if (pcom) {
              if (pcom.waits == null) {
                pcom.waits = []
              }
              pcom.waits.push(eventObj)
            }
          }
        }
      }
    } else {
      this.waits[key] = eventObj
    }
    if (ccom) {
      this.initEvent(ccom, eventObj)
    }
  }
}
/**
 * 运行需要马上执行的事件
 */
Controllor.prototype.runEvent = function () {
  var len = this.runList.length
  var pmsAry = []
  for (var i = 0; i < len; i++) {
    var cevt = this.runList[i]
    var pms = this.doRun(cevt)
    pmsAry.push(pms)
  }
  var that = this
  return new Promise(function (resolve, reject) {
    // 渲染后事件.
    that.toLastCallBack(pmsAry, function () {
      window.console.info('the page has finish init.')
      resolve('')
    })
    that = null
  })
}

Controllor.prototype.initParams = function (params) {
  var res = []
  if (params != null) {
    params = JSON.parse(params)
    for (var i = 0, ilen = params.length; i < ilen; i++) {
      var cpv = params[i]
      if (typeof cpv === 'string') {
        // eslint-disable-next-line no-useless-escape
        var cpvAry = cpv.match(/\${([^\${}]+)}/g)
        if (cpvAry != null) {
          for (var j = 0, jlen = cpvAry.length; j < jlen; j++) {
            var ccpv = cpvAry[j]
            var vid = ccpv.replace(/\$\{|\}/g, '')
            var vcom = this.getComById(vid)
            var vval = ''
            if (vcom) {
              vval = vcom.getValue()
            }
            cpv = cpv.replace(ccpv, vval)
          }
          if (cpv != null && cpv !== '') {
            // eslint-disable-next-line no-eval
            cpv = eval('(' + cpv + ')')
          }
        }
      }
      res[i] = cpv
    }
  }
  return res
}

Controllor.prototype.replaceModules = function () {
  var ms = this.ctrl.modules
  if (ms != null) {
    for (var mkey in ms) {
      var mdoms = this.container.querySelectorAll(mkey)
      if (mdoms != null && mdoms.length > 0) {
        for (var i = 0, ilen = mdoms.length; i < ilen; i++) {
          var cmdom = mdoms[i]
          var cmdiv = document.createElement('div')
          cmdiv.setAttribute('modelname', mkey)
          // 复制属性
          for (var a = 0, alen = cmdom.attributes.length; a < alen; a++) {
            var cas = cmdom.attributes[a]
            var ckey = cas.name
            var copt = cas.value
            cmdiv.setAttribute(ckey, copt)
          }
          var pcmdom = cmdom.parentElement
          pcmdom.insertBefore(cmdiv, cmdom)
          pcmdom.removeChild(cmdom)
        }
      }
    }
  }
}

/**
 * 初始化控制器.
 *  */
Controllor.prototype.init = function (container) {
  if (container.nodeType === 1) {
    var templateStr = this.ctrl.template
    if (templateStr == null) {
      if (window.console) {
        window.console.info('template is null')
      }
      templateStr = ''
    }
    // container.innerHTML = templateStr || ''
    var tmpdiv = this._toDom(templateStr || '')
    while (tmpdiv.childNodes.length > 0) {
      var cdom = tmpdiv.childNodes[0]
      container.appendChild(cdom)
    }
  }

  // 同步部分接口.
  var that = this
  this.ctrl.setValue = function () {
    return that.setValue.apply(that, arguments)
  }
  this.ctrl.getValue = function () {
    return that.getValue.apply(that, arguments)
  }
  this.ctrl.loadData = function () {
    return that.loadData.apply(that, arguments)
  }
  this.ctrl.getComById = function () {
    return that.getComById.apply(that, arguments)
  }
  this.ctrl.setTotalCount = function () {
    return that.setTotalCount.apply(that, arguments)
  }

  // 合并行为
  if (this.ctrl.actions == null) {
    this.ctrl.actions = {}
  }
  for (var key in actionList) {
    if (this.ctrl.actions[key] == null) {
      this.ctrl.actions[key] = actionList[key]
    }
  }
  // 合并校验
  if (this.ctrl.checks == null) {
    this.ctrl.checks = {}
  }
  for (var ckey in checkList) {
    if (this.ctrl.checks[ckey] == null) {
      this.ctrl.checks[ckey] = checkList[ckey]
    }
  }

  this.container = container

  this.replaceModules()

  // 2. 初始化组件
  this.initComs()
  // 3. 初始化组件关系
  this.initRelation()
  // 4. 运行当前可运行事件
  this.runEvent()
    .then(function () {
      var ms = that.ctrl.modules
      if (ms != null) {
        for (var mkey in ms) {
          var cms = ms[mkey]
          var mdoms = that.container.querySelectorAll('[modelname="' + mkey + '"]')
          if (mdoms != null && mdoms.length > 0) {
            for (var i = 0, ilen = mdoms.length; i < ilen; i++) {
              var cmdom = mdoms[i]
              // 创建新的元素替换非标准标签
              var mdiv = document.createElement('div')
              var pm = cmdom.parentElement
              pm.insertBefore(mdiv, cmdom)
              pm.removeChild(cmdom)
              cmdom = mdiv

              cms.el = cmdom
              var cc = new Controllor(cms)
              cc.mounted()
              if (that.childModels == null) {
                that.childModels = []
              }
              that.childModels.push(cc)
            }
          }
        }
      }
    })
}
/**
 * 判断是不是数组.
 */
Controllor.prototype.isArray = function (obj) {
  return /\[object array\]/gi.test(Object.prototype.toString.call(obj))
}
/**
 * 复制JSON对象.
 */
Controllor.prototype.extend = function (base, opt, deep) {
  if (base == null) {
    return opt
  }
  if (opt != null && opt.___hasCopy != null) {
    return opt.___hasCopy
  }
  // 缓存复制对象.
  if (opt != null) {
    opt.___hasCopy = base
  }
  if (deep == null) {
    deep = 10
  } else if (deep === true) {
    deep = 0
  }
  var copt = null
  if (this.isArray(opt)) {
    if (this.isArray(base) !== true) {
      base = []
      opt.___hasCopy = base
    }
    // 生成新数组然后复制.
    for (var i = 0, ilen = opt.length; i < ilen; i++) {
      copt = opt[i]
      if (copt != null && typeof copt === 'object' &&
                copt.nodeType == null && deep > 0) {
        copt = this.extend({}, copt, deep - 1)
      }
      base.push(copt)
    }
  } else {
    for (var key in opt) {
      var isDeep = opt == null || opt.__deep == null || opt.__deep[key] !== false
      copt = opt[key]
      if (copt != null && typeof copt === 'object' &&
                copt.nodeType == null && isDeep && deep > 0) {
        if (!base[key]) {
          base[key] = {}
        }
        base[key] = this.extend(base[key], copt, deep - 1)
      } else {
        base[key] = copt
      }
    }
  }
  // 清除已经复制的状态.
  if (opt != null) {
    delete opt.___hasCopy
  }
  if (base != null) {
    delete base.___hasCopy
  }
  return base
}

// window.plaform_start = function (key) {
//   new Controllor(window[key])
// }
export default Controllor
