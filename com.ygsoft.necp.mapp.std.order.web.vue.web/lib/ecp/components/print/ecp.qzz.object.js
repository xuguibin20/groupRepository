import Jclass from './ecp.qzz.base'
import Hz2py from './ecp.qzz.hz2py'
import i18n from 'i18n'
/*!
 * 基础控件类
 * ecp.qzz.object.js
 * 创建：qzz
 * 日期: 2014-03-1
 */
/**
 * 基础控件类
 * @class BaseObject
 * @author qinzhenzhou@ygsoft.com
 * @date 2014.3.1
 */
var Jobject = Jclass(/** @lends BaseObject */{
  /**
  * 初始化方法，合并处理界面和元模型的属性.
  * @param {object} option 属性
  */
  init: function (option) {
    try {
      this.index = window.qzz.index++

      var defaultOption = this.getDefaultOption()

      this.option = this.isEmpty(defaultOption) ? option || {} : this.extend(defaultOption, option)

      this._i18n = i18n
      // ("div",i18n)
      // 是否是控件对象的判断变量
      this.isComponent = true
      var metaItem
      option = option || {}
      if (option && option._merger) {
        metaItem = option
        option = metaItem.inputer.option
      }

      /*
       * 数据元单位.
       * 千分号、百分号、1、10、到1000000为单位
       */
      this.numUnit = {
        perthousand: 0.001,
        percent: 0.01,
        one: 1,
        ten: 10,
        hundred: 100,
        thousand: 1000,
        tenThousand: 10000,
        hundredThousand: 100000,
        million: 1000000
      }
      // 数据源
      this.className = 'Object'
      this._events = {}
      this._create()
    } catch (e) {
      this.logError('init error:' + e.message + e.stack)
    }
  },
  /**
   * 获取国际化语言.
   * @param key 主键
   * @defValue defValue 默认值
   */
  getI18n: function (key, defValue) {
    return this._i18n.getLan(key, defValue)
    // key = key.replace('qzz.', '')
    // if (this._i18n == null || this._i18n.qzz == null ||
    //         this._i18n.qzz[key] == null || this._i18n.qzz[key] === '') {
    //   return defValue
    // } else {
    //   return this._i18n.qzz[key]
    // }
  },
  /**
   * 创建函数.
   */
  _create: function () {
    this.beginDate = null
    this._lockDestroy = false
    this._hasDestroy = false

    // 事件绑定
    // this.logInfo("BaseObject.create");
  },
  /**
   * 绑定单击事件.
   * @param {Function} func 函数体
   * @param {Object} owner 作用域
   */
  click: function (func, owner) {
    this.bind('click', func, owner, true)
  },
  /**
 * 绑定Ecp事件.
 * @param {String} method 方法名称,字符串
 * @param {Object} event 事件的常量参数
 * @param {Function} func 函数对象
 * @param {Object} owner 作用域
 * @param {Boolean} override 是否覆盖
 * @example
 *  #method名称 ："click"
 *  #func : function() {alert("AAA");}
 *  #component ：子控件对象
 *  component.bindEcpEvent("mousedown",function(){to do something});
 *  component.bindEcpEvent("mousedown",{"A":1,"B":2}, function(){to do something}, grid, true | false);
 */
  bindEcpEvent: function (method, event, func, owner, override) {
    this.bind(method, event, func, owner, override)
  },
  /**
   * 绑定事件.
   * @param {String} method 方法名称,字符串
   * @param {Object} event 事件的常量参数
   * @param {Function} func 函数对象
   * @param {Object} owner 作用域
   * @param {Boolean} override 是否覆盖
   * @example
   *  #method名称 ："click"
   *  #func : function() {alert("AAA");}
   *  #component ：子控件对象
   *  component.bind("mousedown",function(){to do something});
   *  component.bind("mousedown",{"A":1,"B":2}, function(){to do something}, grid, true | false);
   */
  bind: function (method, event, func, owner, override) {
    if (typeof event === 'function') {
      override = owner
      owner = func
      func = event
      event = undefined
    }
    if (typeof owner === 'boolean') {
      override = owner
      owner = undefined
    }
    if (this.isEmpty(this._events[method]) || override === true) {
      // 新增加
      this._events[method] = [{'func': func, 'event': event, 'owner': owner}]
      func._funcSourceId = 0
    } else {
      // 添加
      var len = this._events[method].length
      this._events[method].push({'func': func, 'event': event, 'owner': owner})
      func._funcSourceId = len
    }
  },
  /**
 * 取消绑定的事件，如果要求取消绑定的事件不存在，则返回false
 * @param {String[] | String} method 函数名或函数名数组.
 * @param {Function[] | Function} func 函数数组
 * @returns {Boolean} 如果method为空，则返回false，否则返回true
 */
  unbind: function (method, func) {
    if (this.isEmpty(method)) {
      return false
    }
    if (typeof method === 'string') {
      method = [method]
      func = [func]
    }
    // 去除指定函数
    for (var i = 0, len = method.length; i < len; i++) {
      var mt = method[i]
      var fc = func[i]
      if (this.isNotEmpty(this._events[mt]) && this.isNotEmpty(mt)) {
        if (this.isEmpty(fc)) {
          // 直接清空
          this._events[mt] = []
        } else if (this.isNotEmpty(fc._funcSourceId)) {
          var funcLen = this._events[mt].length
          var index = -1
          for (var j = 0; j < funcLen; j++) {
            var funObj = this._events[mt][j]
            if (funObj.func != null && funObj.func._funcSourceId === fc._funcSourceId) {
              index = j
              break
            }
          }
          // 从数组中清除
          if (index >= 0) {
            this._events[mt].splice(index, 1)
          }
        }
      }
      mt = null
      fc = null
    }
    return true
  },
  /**
 * 判断是否已绑定过事件.
 * @param {String} method 事件名
 * @returns {Boolean}
 */
  hasbind: function (method) {
    return this._events[method] != null && this._events[method] !== ''
  },
  /**
 * 判断是否已绑定过事件.
 * @param {String} method 事件名
 * @returns {Boolean}
 */
  hasBind: function (method) {
    return this.isNotEmpty(this._events[method])
  },
  /**
 * 激活事件.
 * @param {String} method 事件名
 * @example
 *    //绑定事件
 *    grid.bind("click", function(ent, key) {
 *        if(key == 13) {
 *            alert(key);
 *        }
 *    })
 *    //激活事件
 *    grid.triggerEcpEvent("click", [ent, key]);
 * @author qzz
 * @version 1.0
 * @date 2014-7-2
 */
  triggerEcpEvent: function (method) {
    return this.trigger.apply(this, Array.prototype.slice.call(arguments))
  },
  /**
 * 激活事件.
 * @param {string} method 事件名
 * @param {object} params 参数
 * @example
 *    //绑定事件
 *    grid.bind("click", function(ent, key) {
 *        if(key == 13) {
 *            alert(key);
 *        }
 *    })
 *    //激活事件
 *    grid.triggerEvent("click", [ent, key]);
 * @author qzz
 * @version 1.0
 * @date 2014-7-2
 */
  triggerEvent: function (method) {
    return this.trigger.apply(this, Array.prototype.slice.call(arguments))
  },
  /**
 * 激活事件.
 * @name trigger
 * @param {string} method 事件名
 * @param {object} params 参数
 * @example
 *    //绑定事件
 *    grid.bind("click", function(ent, key) {
 *        if(key == 13) {
 *            alert(key);
 *        }
 *    })
 *    //激活事件
 *    grid.trigger("click", [ent, key]);
 * @author qzz
 * @version 1.0
 * @date 2014-7-2
 */
  trigger: function (method) {
    var cent = this._events[method]
    if (cent != null) {
      var re = null
      for (var i = 0, len = cent.length; i < len; i++) {
        var fcObj = cent[i]
        if (fcObj != null && typeof fcObj.func === 'function') {
          var args = arguments[1]
          // 事件执行
          if (fcObj.event != null) {
            args.splice(0, 0, fcObj.event)
          }
          if (fcObj.owner == null) {
            fcObj.owner = this
          }
          try {
            this.logInfo('begin to trigger event ' + method)
            this.logInfo(args)
            var cre = fcObj.func.apply(fcObj.owner, args)
            this.logInfo('finish the event ' + method)
          } catch (e) {
            this.logError(method + ' event fire error ' + e.message + e.stack)
          }
          if (cre != null) {
            if (re == null) {
              re = cre
            } else {
              if (this.isArray(re)) {
                re.push(cre)
              } else {
                re = [re]
                re.push(cre)
              }
            }
          }
        } else {
          // this.logInfo(method + " is not a function");
        }
      }
      return re
    } else {
    // this.logInfo(method + " event not found ");
    }
  },
  logError: function (str, date) {
    // alert(console);
    if (window.console != null) {
      if (date == null) {
        date = new Date()
      }
      var h = date.getHours()
      var m = date.getMinutes()
      var s = date.getSeconds()
      var ms = date.getMilliseconds()
      date = null
      var str = '[' + h + ':' + m + ':' + s + '.' + ms + '][' + this.index + ':' + this.className + ']' + str
      if (window.console.logStack == null) {
        window.console.error(str)
      } else {
        var logStr = window.console.logStack.join('\n')
        setTimeout(function () {
          window.console.info(logStr)
          window.console.error(str)
        }, 0)
        window.console.logStack = []
      }
    }
  },
  /**
 *日志输出函数 .
    *@param {String} str 要输出的内容
    *@param {String} date 日期
    */
  logInfo: function (str, date) {
    // alert(console);
    if (window.console != null && window.qzzlog === true) {
      if (date == null) {
        date = new Date()
      }
      var h = date.getHours()
      var m = date.getMinutes()
      var s = date.getSeconds()
      var ms = date.getMilliseconds()
      date = null
      var str = '[' + h + ':' + m + ':' + s + '.' + ms + '][' + this.index + ':' + this.className + ']' + str
      if (window.console.logStack == null) {
        window.console.logStack = [str]
      } else if (window.console.logStack.length < 10) {
        window.console.logStack.push(str)
      } else {
        window.console.logStack.push(str)
        var logStr = window.console.logStack.join('\n')
        setTimeout(function () {
          window.console.info(logStr)
        }, 0)
        window.console.logStack = []
      }
    }
  },
  /**
 * 时间统计日志(开始).
 * @param {String} str 要输出的信息
 */
  logBegin: function (str) {
    this.beginDate = new Date()
    this.logInfo('[BEGIN]' + str, this.beginDate)
  },
  /**
 * 时间统计日志(结束).
 * @param {String} str 要输出的信息
 */
  logEnd: function (str) {
    if (this.beginDate != null) {
      var bh = this.beginDate.getHours()
      var bm = this.beginDate.getMinutes()
      var bs = this.beginDate.getSeconds()
      var bms = this.beginDate.getMilliseconds()
      var date = new Date()
      var eh = date.getHours() - bh
      var em = date.getMinutes() - bm
      if (em < 0) {
        eh--
        em += 60
      }
      var es = date.getSeconds() - bs
      if (es < 0) {
        em--
        es += 60
      }
      var ems = date.getMilliseconds() - bms
      if (ems < 0) {
        es--
        ems += 1000
      }
      date = null
      var times = (eh * 3600 + em * 60 + es) * 1000 + ems
      this.logInfo('[END]' + str + this.getI18n('qzz.useTime', ' 耗时{0}毫秒').replace('{0}', times))
    }
  },
  /**
 * 获取当前浏览器类型.
 * <p>
 * 	如果当前浏览器为IE系列，则返回 "IE" ，<br>
 *  如果是其他浏览器则返回 ""
 * </p>
 */
  getBrowser: function (type) {
    if (type == null) {
      type = 'msie'
    }
    var version = window.navigator.appVersion
    if (typeof version === 'string') {
      version = version.toLowerCase()
    }
    if (version != null && version.indexOf(type) >= 0) {
      return true
    } else {
      if (type === 'msie' && version != null && /(msie\s|trident.*rv:)([\w.]+)/.test(version)) {
        return true
      }
      return false
    }
  },
  /**
 * 字符串截取.
 * @param str 字符串
 * @param length 长度
 * @return 返回字符串
 */
  subStr: function (str, length) {
    if (typeof str !== 'string') {
      str = str + ''
    }
    var v = str
    var len = 0
    var i = 0
    for (; i < v.length; i++) {
      if (v.charCodeAt(i) > 256) {
        if (len + 2 <= length) {
          len += 2
        } else {
          break
        }
      } else if (len + 1 <= length) {
        len++
      } else {
        break
      }
    }
    return str.substring(0, i)
  },
  /**
 * 字符串长度.
 * @param str 字符串
 */
  strLen: function (str) {
    // modify by yinshanpeng on 2014.11.8 ，处理当str为number类型时，报错的问题F639312
    //	    	if(typeof(str) === "number") {
    //	    		return (str + "").len();
    //	    	} else if(typeof(str) === "string") {
    //	    		return str.len();
    //	    	}
    /// *
    var v = str
    if (v == null || v === '') return 0
    if (typeof v !== 'string') {
      v = v + ''
    }
    var len = 0
    for (var i = 0; i < v.length; i++) {
      if (v.charCodeAt(i) > 256) {
        len += 2
      } else {
        len++
      }
    }
    v = null
    i = null
    return len
    //* /
  },
  /**
 * 获取数据源
 * @return {DataSource} 数据源
 */
  getDataSource: function () {
    // if(this.dataSource == null
    //		&& ecp != null && ecp.model != null && ecp.model.DataSource != null) {
    //	this.dataSource = new ecp.model.DataSource();
    // }
    return this.dataSource
  },
  /**
 * 设置数据源
 * @param {DataSource} ds 数据源
 */
  setDataSource: function (ds) {
    this.dataSource = ds
  },
  /**
 * 是否为新的元数据类型.
 * @returns {Boolean}
 */
  isNewByMeta: function () {
    return this.newByMeta
  },
  /**
 * 设置新的元数据类型.
 * @param {Boolean} b
 */
  setNewByMeta: function (b) {
    this.newByMeta = b
  },
  /**
 * 是否为空.
 * @see this.isNotEmpty
 * @param {Object} value 判断的值
 * @param {String} path 层级关系
 * @returns {Boolean}
 */
  isEmpty: function (value, path) {
    // return (value == null || value === "");
    return !this.isNotEmpty(value, path)
  },
  /**
 * 是否不为空.
 * @param {Object} value 判断的值
 * @param {String} path 层级关系
 * @returns {Boolean}
 */
  isNotEmpty: function (value, path) {
    var re = true
    if (value == null || value === '') {
      re = false
    } else if (typeof value === 'object') {
      if (this.isArray(value)) {
        re = value.length > 0
      } else {
        re = false
        // eslint-disable-next-line no-unused-vars
        for (var key in value) {
          re = true
          break
        }
      }
    }
    return re
  },
  /**
 * 合并json对象.
 */
  extend: function (base, opt, deep) {
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
    if (this.isArray(opt)) {
      if (this.isArray(base) !== true) {
        base = []
        opt.___hasCopy = base
      }
      // 生成新数组然后复制.
      for (var i = 0, ilen = opt.length; i < ilen; i++) {
        var copt = opt[i]
        if (copt != null && typeof copt === 'object' && copt.innerHTML == null && deep > 0) {
          copt = this.extend({}, opt[i], deep - 1)
        }
        base.push(copt)
      }
    } else {
      // eslint-disable-next-line no-redeclare
      for (var i in opt) {
        var isDeep = opt == null || opt.__deep == null || opt.__deep[i] !== false
        if (opt[i] != null && typeof opt[i] === 'object' && opt[i].innerHTML == null && isDeep && deep > 0) {
          if (!base[i]) {
            base[i] = {}
          }
          base[i] = this.extend(base[i], opt[i], deep - 1)
        } else {
          base[i] = opt[i]
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
  },

  hz2py: function (value) {
    if (this.hasbind('onHz2py')) {
      value = this.trigger('onHz2py', [value])
    } else {
      if (this._hz2py == null) {
        this._hz2py = new Hz2py()
      }
      value = this._hz2py.transToPinYin(value)
    }
    return value
  },

  /**
 * 数值型添加千分符.
 * @param {Number} value 数值
 * @returns {String}
 */
  numberFormat: function (value) {
    var vlAry = (value + '').split('.')
    vlAry[0] = vlAry[0].replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
    return vlAry.join('.')
  },
  /**
 * 返回类名.
 * @returns {String}
 */
  getEcpType: function () {
    return this.className
  },
  /**
 * 返回属性对象.
 * @return {Object}
 */
  getOption: function () {
    return this.option
  },
  /**
 * 返回默认属性对象(空对象).
 *
 * @returns {Object}
 */
  getDefaultOption: function () {
    return {}
  },
  /**
 * 返回控件名称.
 * @returns {String} 控件名称
 */
  getName: function () {
    return this.getOption().name
    // return this.name;
  },
  /**
 * 设置控件名称.
 * @param {string} name 要设置的名称
 */
  setName: function (name) {
    // this.name = name;
    this.getOption().name = name
  },
  getBooleanValue: function (value, def) {
    return this._getBooleanValue(value, def)
  },
  getJsonValue: function (val1, val2, def) {
    if (val1 != null) {
      return val1
    } else if (val2 != null) {
      return val2
    } else {
      return def
    }
  },
  _delayRun: function (func, args, times) {
    if (times == null && typeof args === 'number') {
      times = args
      args = []
    }
    if (this._delayHandle != null) {
      clearTimeout(this._delayHandle)
    }
    if (typeof func === 'function') {
      var _this = this
      this._delayHandle = setTimeout(function () {
        func.apply(_this, args)
      }, times)
    }
  },
  _asynRun: function (func, args, times) {
    if (times == null && typeof args === 'number') {
      times = args
      args = []
    }
    if (typeof func === 'function') {
      var _this = this
      setTimeout(function () { func.apply(_this, args) }, times)
    }
  },
  /**
 * 获取布尔类型.
 *
 * @param {Object} value 传入的值(任何类型)
 * @param {Boolean} def 缺省值(当value不足以满足转换为Boolean的情况下，返回该值)
 * @returns {Boolean}
 */
  _getBooleanValue: function (value, def) {
    if (typeof value === 'boolean') {
      return value
    } else if (typeof value === 'string') {
      // 处理各种布尔情况
      value = value.toUpperCase()
      return value === 'TRUE' ||
                    value === 'YES' ||
                        value === 'Y' ||
                            (!isNaN(value) && value !== '0')
    } else if (typeof value === 'number') {
      return value != 0
    } else if (typeof value === 'date') {
      return false
    } else if (typeof def === 'boolean') {
      return def
    } else {
      return false
    }
  },
  isNumber: function (prm) {
    if (typeof prm === 'number') {
      return true
    } else if (typeof prm === 'string') {
      // eslint-disable-next-line no-useless-escape
      var res = /^(\-)?[0-9,]+(.[0-9]*)?$/.test(prm)
      if (prm.indexOf(',') >= 0) {
        var resAry = prm.split(',')
        for (var i = 0, ilen = resAry.length; i < ilen; i++) {
          var cv = resAry[i]
          var cvlen = cv.length
          if (cv.indexOf('-') >= 0) {
            cvlen--
          }
          if (i === 0 && (cv === '' || cv === '-')) {
            res = false
          } else if (i === ilen - 1) {
            var vi = cv.indexOf('.')
            if (vi === -1 && cvlen !== 3) {
              res = false
            } else if (vi !== -1 && vi !== 3) {
              res = false
            }
          } else if (cvlen !== 3) {
            res = false
          }
        }
      }
      return res
    } else {
      return false
    }
  },
  /**
 * 比较字符串.
 * @param {string} str1 字符串1
 * @param {string} str2 字符串1
 * @param {json} casch 缓存
 * @return {number} 返回比较结果
 */
  compare: function (str1, str2, casch, dataType) {
    if (dataType != null && dataType === 'string') {
      str1 = 's' + str1
      str2 = 's' + str2
    }
    // eslint-disable-next-line one-var
    var a = str1, b = str2, cashJson = casch
    var apy = null
    var bpy = null
    if (typeof (a) === 'object' || typeof (b) === 'object') {
      return -1
    } else if (this.isNumber(a) && this.isNumber(b)) {
      return a - b > 0 ? 1 : (a === b ? 0 : -1)
    } else {
      if (cashJson != null) {
        apy = cashJson[a]
        if (apy == null) {
          apy = this.hz2py(a)
          cashJson[a] = apy
        }
        bpy = cashJson[b]
        if (bpy == null) {
          bpy = this.hz2py(b)
          cashJson[b] = bpy
        }
      } else {
        apy = this.hz2py(a)
        bpy = this.hz2py(b)
        if (cashJson != null) {
          cashJson[a] = apy
          cashJson[b] = bpy
        }
      }
      return apy.localeCompare(bpy)
    }
  },
  /**
 * 中文大小写转换.
 * @par
 */
  numUpper: function (value, stype) {
    if (this._i18n.getLanType() === 'en-us') {
      return value
    }
    var re = value
    if (typeof re === 'string') {
      re = re.replace(/,| |￥/g, '')
      if (isNaN(re)) {
        return value
      }
    } else {
      re = re + ''
    }
    if (stype === 'Lower' || stype === 'Upper' || stype === 'MoneyLower' || stype === 'MoneyUpper') {
      var num = {'Lower': this.getI18n('qzz.nlower', ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']),
        'Upper': this.getI18n('qzz.nupper', ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'])
      }
      var unit = {'Lower': this.getI18n('qzz.ulower', ['', '', '', '点', '', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万亿', '十', '百', '千', '亿亿', '十', '百', '千', '万']),
        'Upper': this.getI18n('qzz.uupper', ['', '', '', '点', '', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟', '万亿', '拾', '佰', '仟', '亿亿', '拾', '佰', '仟', '万']),
        'MoneyLower': this.getI18n('qzz.umoneylower', ['厘', '分', '角', '整', '元', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万亿', '十', '百', '千', '亿亿', '十', '百', '千', '万']),
        'MoneyUpper': this.getI18n('qzz.umoneyupper', ['厘', '分', '角', '整', '元', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟', '万亿', '拾', '佰', '仟', '亿亿', '拾', '佰', '仟', '万'])
      }
      var cnum = num[stype]
      var dic = 1
      if (cnum == null) {
        cnum = num[stype.replace(/Money/, '')]
        dic = 0
      }
      var cunit = unit[stype]
      var vAry = re.split('.')
      var zv = vAry[0]
      // eslint-disable-next-line one-var
      var zdx = '', pv = '', maxu = ''
      var ui = 4
      // eslint-disable-next-line no-unused-vars
      var hasv = false
      var len = zv.length
      var isminus = false
      var zi = 0
      var zeroLen = len - dic
      if (zeroLen > 1) {
        for (var i = 0; i < zeroLen; i++) {
          var cv = zv.charAt(i)
          if (i === 0 && cv === '-') {
            isminus = true
            zi++
          } else if (cv === 0 || cv === '0') {
            zi++
          } else {
            break
          }
        }
      }
      if ((isminus === false && zi > 0) || (isminus === true && zi > 1)) {
        zv = zv.substr(zi, len)
        if (isminus) {
          zv = '-' + zv
        }
        len = zv.length
      }
      // eslint-disable-next-line no-redeclare
      for (var i = len - 1; i >= 0; i--) {
        // eslint-disable-next-line no-redeclare
        var cv = zv.charAt(i)
        if (cv === '-') {
          zdx = this.getI18n('qzz.minus', '负') + zdx
        } else {
          cv = parseInt(cv, 10)
          var dv = cnum[cv]
          if (cv > 0) {
            if (maxu !== '') {
              if (ui !== 8 && ui !== 12 && ui !== 16 && ui !== 20) {
                zdx = maxu + zdx
              }
              maxu = ''
            }
            if (cv === 1 && (ui === 5 || ui === 9 || ui === 13 || ui === 17 || ui === 21) && (i == 0 || i == 1 && zv.charAt(i - 1) == '-')) {
              zdx = cunit[ui] + zdx
            } else {
              zdx = dv + cunit[ui] + zdx
            }
            hasv = true
          } else if (ui === 8 || ui === 12 || ui === 16 || ui === 20) {
            maxu = cunit[ui]
          } else if (pv > 0) {
            zdx = cnum[0] + zdx
          } else if (pv === '') {
            if (len > 1) {
              zdx = cunit[ui]
            } else {
              zdx = cnum[0] + cunit[ui]
            }
          }
          pv = cv
          ui++
        }
      }// for i

      if (vAry.length > 1) {
        var xv = vAry[1]
        zi = 0
        len = xv.length
        // eslint-disable-next-line no-redeclare
        for (var i = len - 1; i >= 0; i--) {
          // eslint-disable-next-line no-redeclare
          var cv = xv.charAt(i)
          if (cv === 0 || cv === '0') {
            zi++
          } else {
            break
          }
        }
        if (zi > 0) {
          // eslint-disable-next-line no-redeclare
          xv = xv.substr(0, len - zi)
          len = xv.length
        }
        if (xv !== '') {
          if (stype !== 'MoneyUpper' && stype !== 'MoneyLower') {
            zdx = zdx + cunit[3]
          }
          // eslint-disable-next-line no-redeclare
          var ui = 2
          // eslint-disable-next-line no-redeclare
          for (var i = 0; i < len; i++) {
            // eslint-disable-next-line no-redeclare
            var cv = xv.charAt(i)
            cv = parseInt(cv, 10)
            // eslint-disable-next-line no-redeclare
            var dv = cnum[cv]
            zdx = zdx + dv + (cunit[ui] || '')
            ui--
          } // for
        } else if (stype === 'MoneyUpper' || stype === 'MoneyLower') {
          if (zdx === '') {
            zdx = cnum[0]
          }
          zdx = zdx + cunit[3]
        }
      } else if (stype === 'MoneyUpper' || stype == 'MoneyLower') {
        if (zdx === '') {
          zdx = cnum[0]
        }
        zdx = zdx + cunit[3]
      }
      return zdx
    } else if (stype === 'Money') {
      return (value + '').replace(/[.,]/, '').split('').join(' ')
    } else {
      return value
    }
  },
  /**
 * 四舍五入.
 * @param num 数值
 * @param scale 精度
 */
  round: function (val, scale, scaleExt) {
    if (typeof val !== 'number') {
      val = parseFloat(val)
    }
    var index = (val + '').indexOf('.')
    if (scale == null) {
      scale = 14 - index
    }
    var pw = Math.pow(10, scale)
    val = val * pw
    if (scaleExt == null) {
      if (index > 0) {
        scaleExt = 15 - index
      }
    }
    if (scaleExt != null) {
      var pwExt = Math.pow(10, scaleExt)
      val = val + 5 / pwExt
    }
    val = Math.round(val)
    return val / pw
  },
  /**
 * 去除左右边的空格符.
 * str  字符串
 */
  trim: function (str) {
    if (str != null && str !== '' && typeof str === 'string') {
      str = str.replace(/(^\s*)|(\s*$)/g, '')
    }
    return str
  },
  /**
 * 判断对象是不是数组.
 */
  isArray: function (obj) {
    return /\[object array\]/gi.test(Object.prototype.toString.call(obj))
  },
  /**
 * 身份证.
 */
  isIDCard: function (value) {
    return /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(value)
  },
  /**
 * 电话号
 */
  isTele: function (value) {
    return /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}(\(\d{3,4}\)|-\d{3,4}|\s)?$/.test(value)
  },
  /**
 * 手机号.
 */
  isMobile: function (value) {
    return /^1[34578]\d{9}$/.test(value)
  },
  /**
 * 电子邮箱.
 */
  isEmail: function (value) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
  },
  /**
 * 邮政编码.
 */
  isPostid: function (value) {
    return /[1-9]\d{5}(?!\d)/.test(value)
  },
  /**
 * 带标签的字符串转议处理.
 * @param value 字符串
 */
  _textToTag: function (value) {
    if (typeof value === 'string') {
      value = value.replace(/&gt;|&lt;|&nbsp;/g, function (key) {
        if (key == '&gt;') {
          return '>'
        } else if (key == '&lt;') {
          return '<'
        } else if (key == '&nbsp;') {
          return ' '
        }
      })
      value = value.replace(/&amp;/g, '&')
      if (this.getOption().tranSingleQuot !== false) {
        value = value.replace(/&apos;/g, "'")
      }
    }
    return value
  },
  /**
 * 带标签的字符串转议处理.
 * @param value 字符串
 */
  _tagToText: function (value) {
    if (typeof value === 'string') {
      value = value.replace(/&/g, '&amp;')
      value = value.replace(/[<> ]/g, function (key) {
        if (key == '>') {
          return '&gt;'
        } else if (key === '<') {
          return '&lt;'
        } else if (key === ' ') {
          return '&nbsp;'
        }
      })
      // 转义了单引号会引起勾稽表达式问题，增加列属性tranSingleQuote：false不转义，如果不配置默认转义
      if (this.getOption().tranSingleQuot !== false) {
        value = value.replace(/'/g, '&apos;')
      }
    }
    return value
  },
  /**
 * 注析掉当前类.
 * @ignore
 */
  destroy: function () {
    // 单例模式的时候，不释放
    if (this._notFree != true) {
      // 复制静态方法
      var that = this
      if (this._lockDestroy) {
        setTimeout(function () { that.destroy() }, 1000)
      } else {
        that._hasDestroy = true
        setTimeout(function () {
          if (that != null) {
            for (var name in that) {
              if (name === 'baseprototype') {
                that[name] = null
              } else {
                if (that[name] != null && typeof that[name] === 'object' && typeof that[name].destroy === 'function') {
                  try {
                    that[name].destroy()
                  } catch (e) {
                    if (window.console != null) {
                      window.console.error(name + '[Destroy]Error:' + e.message)
                    }
                  }
                }
                delete that[name]
              }
            }
            that._hasDestroy = true
          }
        }, 5000)
      }
    }
  }
})
export default Jobject
