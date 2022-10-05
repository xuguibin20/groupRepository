/**
 * utils 工具类
 */
import cst from './ecp.const'
import des from './ecp.des'

function EcpUtils() {

}

EcpUtils.prototype = {
	/**
	 * 判断对象是不是数组.
	 * @param obj 对象
	 */
	isArray: function(obj) {
		return /\[object array\]/gi.test(Object.prototype.toString.call(obj))
	},
	/**
	 * 判断是否为number类型
	 * @param t
	 * @returns {boolean}
	 * @author wugang5@ygsoft.com
	 */
	isNumber: function(t) {
		// 过滤NaN 和无穷大
		return typeof t === 'number' && !isNaN(t) && isFinite(t)
	},
	/**
	 * 四舍五入函数.
	 * @param val 值
	 * @param scale 精度
	 * @param scaleExt 二次精度
	 * @return 返回结果
	 */
	round: function(val, scale, scaleExt) {
		if (typeof val !== 'number') {
			val = parseFloat(val)
		}
		var pw = Math.pow(10, scale)
		val = val * pw
		if (scaleExt != null) {
			var pwExt = Math.pow(10, scaleExt)
			val = val + 5 / pwExt
		}
		val = Math.round(val)
		return val / pw
	},

	/**
	 * 数字转千分位.
	 * @param
	 */
	formatNumber: function(s, n) {
		n = n >= 0 && n <= 20 ? n : 2
		s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + ''
		if (s !== '' && !isNaN(s)) {
			var re = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g
			s = s.replace(re, '$1,')
		}
		return s
	},

	/**
	 * 格式化字符串
	 * @exapmle
	 *     utils.format("{0} is a { 1 }.","YWY","man"); //YWY is a man.
	 * @param {String} strtmpl 字符串模板,用{n}表示参数位置，n从0开始计数
	 * @return {String}
	 * @date 2019-4-19
	 */
	format: function(strtmpl) {
		var alen = arguments.length
		if (alen === 0) {
			return
		} else if (alen === 1) {
			return strtmpl
		}
		var args = arguments[1]
		if (typeof args === 'string') {
			args = Array.prototype.slice.call(arguments, 1)
		}
		alen = args.length
		var ret = strtmpl
		for (var i = 0; i < alen; i++) {
			ret = ret.replace(new RegExp('\\{\\s*' + i + '\\s*\\}', 'g'), args[i])
		}
		return ret
	},

	/**
	 * 转换成原始的尖括号
	 * @exapmle
	 *     utils.originalAngleBrackets("&lt;script&gt;"); //<script>
	 * @param {String} '&lt;' or '&gt;'
	 * @return {String} '<' or '>'
	 * @date 2019-4-19
	 */
	originalAngleBrackets: function(s) {
		if (!this.isNotEmpty(s) || (typeof(s) !== 'string') || this.isNumber(s)) {
			return s
		}
		s = s.replace(/(&gt;|&lt;|&nbsp;)/g, function(key) {
			if (key == '&gt;') {
				return '>';
			} else if (key == '&lt;') {
				return '<';
			} else if (key == '&nbsp;') {
				return ' ';
			}
		})
		s = s.replace(/&amp;/g, '&')
		return s
	},

	/**
	 * 原始的尖括号转换成编码尖括号
	 * @exapmle
	 *     utils.originalAngleBrackets("<script>"); //&lt;script&gt;
	 * @param {String} '<' or '>'
	 * @return {String} '&lt;' or '&gt;'
	 * @date 2019-4-19
	 */
	escapeAngleBrackets: function(s) {
		if (!this.isNotEmpty(s) || (typeof(s) !== 'string') || this.isNumber(s)) {
			return s
		}
		s = s.replace(/&/g, '&amp;')
		s = s.replace(/[<> ]/g, function(key) {
			if (key == '>') {
				return '&gt;';
			} else if (key === '<') {
				return '&lt;';
			} else if (key === ' ') {
				return '&nbsp;';
			}
		})
		return s
	},

	/**
	 * jquery选择器中".","[","]",":"都是关键字，需要转义
	 * @param {String} str 待替换的字符串
	 * @return {String} 替换后的字符串
	 * @author yinshanpeng@ygsoft.com
	 * @date 2015.4.15
	 */
	replaceJquerySelecter: function(str) {
		return str && str.replace(/[\[,\],\.,\:]/g, function(word) {
			return '\\' + word
		})
	},

	/**
	 * 将字段路径字符串分隔成数组
	 * @example
	 *   var spath = "a.list[0].b.list[1].c";
	 *   var apath = utils.splitStr(spath); // apath = ["a", "list", "0", "b", "list", "1", "c"]
	 *
	 * @param {String} str 字段路径字符串，例如： "a.list[0].b.list[1].c"
	 * @return {String[]} 字段路径数组
	 */
	splitStr: function(str) {
		str = str.replace(/\[(\d*)\]/g, '.$1')
		// 如果以.开头，则去除
		if (str.indexOf('.') === 0) {
			str = str.replace(/(\.*)(.*)/, '$2')
		}
		return str.split('.')
	},

	/**
	 * 用分割符分割字符串,返回字符串数组
	 * <p>
	 *   首先，用sep字符串去分割src字符串得到数组ret，如果index不为undefined并且不是0，将index前后的元素用sep连接起来的左右两个元素作为新数组ret;
	 *   然后，如果给定了有效的callback函数，对ret的每个元素执行callback,得到新ret,返回。
	 *
	 * 分割全部:
	 * @example 1
	 *  utils.split("x.y.z.w",".");        //返回["x","y","z","w"]
	 *
	 * 分割到第一个分隔符
	 * @example 2
	 *   utils.split("x.y.z.w",".",1);    //返回["x","y.z.w"]
	 *   utils.split("x.y.z.w",".",-3);    //返回["x","y.z.w"]
	 * 分割到第二个分隔符
	 * @example 3
	 *   utils.split("x.y.z.w",".",2);    //返回["x.y","z.w"]
	 *   utils.split("x.y.z.w",".",-2);    //返回["x.y","z.w"]
	 *
	 * 分割到最后个分隔符
	 * @example 3
	 *   utils.split("x.y.z.w",".",-1);    //返回["x.y.z","w"]
	 *
	 * 有回调函数的例子
	 * @example 4
	 *   var aa = utils.split("x .y.z . w",".",-1,function(arr){
	 *     for(var i=0;i<arr.length;i++){
	 *       arr[i] = arr[i].replace(/^\s+|\s+$/,"");
	 *     }
	 *     return arr;
	 *   });    //返回["x .y.z","w"]
	 *
	 * 单元测试：
	 * @unittest webtest.cases.ecp.utils
	 *
	 * </p>
	 *
	 * @param {String} src 被分割的目标字符串
	 * @param {String} sep 分割符，单或多个字符串
	 * @param {Number} index 分割到第几个（1表示第1个，-1表示倒数第几个）分隔符，即将src分割成左右两部分；当为0或者没有定义时，表示全部分割
	 * @param {Function} callback 回调函数，对结果数组做进一步处理
	 * @returns {Array}    字符串数组
	 *
	 * @author yangwenyi
	 * @version 1.0
	 * @date 2014-4-25
	 */
	split: function(src, sep, index, callback) {
		var ret
		// 当src为空时返回null
		if (src == null) {
			ret = null
		} else if (src === '' || (sep == null || sep === '')) {
			// 当src为空串时，或者sep为空时返回[src]
			ret = [src]
		} else {
			ret = src.split(sep)
			if (!(index == null || index === 0)) {
				// 非贪婪模式下,只分割到第index个分隔符
				var aa = ret.splice(index, ret.length)
				ret = [ret.join(sep), aa.join(sep)]
			}
			// 贪婪模式下,各个分割
		}
		// 对返回结果做进一步处理
		if (!(ret == null) && typeof callback === 'function') {
			ret = callback(ret)
		}
		return ret
	},

	/**
	 * 将阿拉伯数字转换成中文数字(为金额，日期，数字共用的方法)
	 *  @example
	 *   utils.formartToZh("1234567800056509.3","lm") //一千二百三十四万五千六百七十八亿〇五万六千五百〇九元三角
	 *   utils.formartToZh("1234567800056509.3","um") //壹仟贰佰叁拾肆萬伍仟陆佰柒拾捌億零伍萬陆仟伍佰零玖圆叁角
	 *   utils.formartToZh("1234567800056509.3","l") //一千二百三十四万五千六百七十八亿〇五万六千五百〇九点三
	 *   utils.formartToZh("1234567800056509.3","u")  //壹仟贰佰叁拾肆萬伍仟陆佰柒拾捌億零伍萬陆仟伍佰零玖点叁
	 *   utils.formartToZh("-1234567800056509.3","u")  //-壹仟贰佰叁拾肆萬伍仟陆佰柒拾捌億零伍萬陆仟伍佰零玖点叁
	 *
	 *   utils.formartToZh("2014","ly");  //二〇一四
	 *   utils.formartToZh("10","ld");  //十
	 *   utils.formartToZh("11","ld");  //十一
	 *   utils.formartToZh("20","ld");  //二十
	 *   utils.formartToZh("2014","uy");  //贰零壹肆
	 *   utils.formartToZh("10","ud");  //拾
	 *   utils.formartToZh("21","ud");  //贰拾壹
	 *
	 * @param {Number} num
	 * @param {String} u  "u"表示转换成中文大写，否则("l")表示转换成中文小写;
	 *   第2位(如果有) m表示金额,y表示年份（2014拼读“二〇一四”）,d表示月/日（10拼读“十”）
	 * @param {Boolean} [dot=undefined] 表示有无小数部分，true表示纯小数，false表示纯整数，undefined表示不确定
	 * @return {String} 中文数字
	 */
	formartToZh: function(num, u, dot) {
		function __isUpper(u) {
			return u = u.toLowerCase().startsWith('u')
		}

		function __isMoney(u) {
			return u.toLowerCase().endsWith('m')
		}

		function __isYear(u) {
			return u.toLowerCase().endsWith('y')
		}

		function __isDay(u) {
			return u.toLowerCase().endsWith('d')
		}

		function __toChNum(num, chDigits) {
			num = '' + num
			for (var l = num.length, r = '', i = 0; i < l; i++) {
				r += chDigits[num.charAt(i)]
			}
			return r
		}

		function __toChJfl(num, chDigits) { // 角分厘
			num = num.substring(0, 3)

			for (var d, r = '', i = 0, len = num.length; i < len; i++) {
				d = +num[i]
				r += chDigits[d] + (d === 0 ? '' : (cst.CHINESE_CURRENCY[i + 2]))
			}
			return r
		}

		function __makeGrp4(num) {
			var group4 = [] // 4维组，每4位组成1组，从低位开始
			for (var g = '', i = num.length, c = 1; i--; c++) {
				g = num[i] + g
				if (c % 4 === 0 || i === 0) {
					group4.push(g)
					g = ''
				}
			}
			return group4
		}

		// 拼读4维组，如1234读作一千二百三十四, 1020读作一千〇二十
		function __spellGrp4(num, chDigits) {
			for (var d, r = '', len = num.length, i = 0; i < len; i++) {
				d = +num[i]
				if (isYear) {
					r += chDigits[d]
				} else if (isDay) {
					r += (d > 1 || i === len - 1 ? chDigits[d] : '') + (d === 0 ? '' : (i < len - 1 ? chDigits[9 + len - i - 1] : ''))
				} else {
					r += chDigits[d] + (d === 0 ? '' : (i < len - 1 ? chDigits[9 + len - i - 1] : ''))
				}
			}
			return r
		}

		var di = '', // 整数部分
			dd = '', // 小数部分
			toUpper = __isUpper(u),
			isMoney = __isMoney(u),
			isYear = __isYear(u),
			isDay = __isDay(u),
			currency
		if (isMoney) {
			currency = toUpper ? cst.CHINESE_CURRENCY[0] : cst.CHINESE_CURRENCY[1]
		}
		num = ('' + num).trim()

		if (dot !== true && dot !== false) {
			num = num.split('.')
			var sign = ''
			if (num[0] && num[0] !== '') {
				if (num[0].startsWith('-') || num[0].startsWith('+')) {
					sign = num[0].substring(0, 1)
					num[0] = num[0].from(1)
				}
				di = this.formartToZh(num[0], u, false)
			}
			if (num[1] && num[1] !== '') {
				dd = (!isMoney ? '点' : '') + this.formartToZh(num[1], u, true)
			}
			return sign + (!isMoney ? (di + dd) : (di + currency + (dd == '' ? '整' : dd)))
		} else {
			var chDigits = toUpper ? cst.CHINESE_U_NUMBER : cst.CHINESE_L_NUMBER
			var zero = chDigits[0]
			if (dot === false) { // 整数部分
				var g4 = __makeGrp4(num) // 4维组，每4位组成1组，从低位开始
				for (var d4, i = 0, len = g4.length; i < len; i++) {
					d4 = __spellGrp4(g4[i], chDigits)
					d4 = this.removeZero(d4, zero)
					if (i > 0) d4 += chDigits[12 + i]
					di = d4 + di
				}
				return di
			} else if (dot === true) { // 小数部分
				dd = !isMoney ? __toChNum(num, chDigits) : __toChJfl(num, chDigits)
				if (isMoney) dd = this.removeZero(dd, zero)
				return dd
			}
		}
	},

	/**
	 * 数字转为金额大写
	 * <p>
	 *  var m = utils.transferNumToMoney(1001);//壹仟零壹元整
	 *  var m = utils.transferNumToMoney(1000101); //壹佰萬零壹佰零壹元整
	 *  var m = utils.transferNumToMoney(1000101.011);//壹佰萬零壹佰零壹圆零壹分壹厘
	 * </p>
	 *
	 *  @param {Number} num 金额数字
	 *  @return {String} 大写的金额字符串
	 *
	 */
	transferNumToMoney: function(num) {
		return this.formartToZh(num, 'um')
	},

	/**
	 * 小写数字转换为大写
	 * utils.transferNumToChUpper(123456000101.011) //壹千贰百叁十肆亿伍千陆百万零壹百零壹点零壹壹
	 *
	 * @deprecated 请使用 @link{utils.formartToZh}
	 */
	transferNumToChUpper: function(num) {
		return this.formartToZh(num, 'u')
	},
	/**
	 * 小写数字转换为小写
	 * var d = utils.transferNumToChLower(120345600101.011);//一千二百〇三亿四千五百六十万〇一百〇一点〇一一
	 * @deprecated 请使用 @link{utils.formartToZh}
	 */
	transferNumToChLower: function(num) {
		return this.formartToZh(num, 'l')
	},

	/**
	 * 移除result中包含的zero或者zerozero(内部方法)
	 * @ignore
	 */
	removeZero: function(src, zero) {
		while (src.length > 1 && src.endsWith(zero)) {
			src = src.substring(0, src.length - 1);
		}
		var index = src.indexOf(zero + zero);
		if (index != -1) {
			src = src.substring(0, index) + src.substring(index + 1);
			return this.removeZero(src, zero);
		}
		return src;
	},

	/**
	 * 获取浏览器URL中传入的参数,包括#和?后跟随的参数，如果没有该参数或者该参数没有定义值，则返回undefined。
	 * <p>此方法有瑕疵（当存在#参数时）（已经修正）
	 * 注意与utils.getArguments的区别。
	 * 如果一次要获取多个参数，不建议使用该方法，而使用utils.getArguments。
	 * </p>
	 * @example
	 *  var url = "http://ip:port/example.html?arg1=123&arg2=456#arg3=789#arg4";
	 *  var arg1 = utils.getArguments("arg1"); //arg1 = 123
	 *  var arg2 = utils.getArguments(url,"arg2"); //arg2 = 456
	 *  var arg3 = utils.getArguments(url,"arg3"); //arg3 = 789
	 *  var arg4 = utils.getArguments(url,"arg4"); //arg4 = undefined
	 *  var arg5 = utils.getArguments(url,"arg5"); //arg5 = undefined
	 *
	 * @param {String} url URL串
	 * @param {String} argName 参数名称,不区分大小写
	 * @param {Boolean} decode 是否解密，默认不解密
	 * @return {String}  url中指定参数名称的值,如果没有该参数，则返回undefined
	 * @date 2015.8.2
	 */
	getArguments: function(url, argName, decode) {
		if (arguments.length === 1) {
			argName = url
			url = location.href
		}

		// 以上方法无法处理如果参数中存在#号的情况
		var reg = new RegExp('(^|\\?|&|#)' + argName + '=([^&]*)(\\s|&|$)', 'ig')
		if (decode === true) {
			url = des.decodeSearch(url)
		}
		if (reg.test(url)) {
			var ret = unescape(RegExp.$2.replace(/\+/g, ' ')),
				p = ret.indexOf('#')
			if (p > -1) {
				ret = ret.substring(0, p)
			}
			return ret
		}
	},

	/**
	 * 获取url的所有参数(Object)
	 * @example
	 *    var url1 = "abc.com/index.html?A=123&b=456#c=789";
	 *    var url2 = "abc.com/index.html?a=123&b=456#c=789#d=000";
	 *    var url3 = "abc.com/index.html?a=123&b=456#c=789#d";
	 *    utils.getAllArgument(url1);//{A: "123", b: "456", c: "789", url: "abc.com/index.html"}
	 *    utils.getAllArgument(url1,true);//{a: "123", b: "456", c: "789", url: "abc.com/index.html"}
	 *    utils.getAllArgument(true);//{a: "123", b: "456", c: "789", url: "abc.com/index.html"},如果location.href=url1
	 *    utils.getAllArgument( );//{A: "123", b: "456", c: "789", url: "abc.com/index.html"},如果location.href=url1
	 *    utils.getAllArgument(url2);//{a: "123", b: "456", c: "789", d:"000" ,url: "abc.com/index.html"}
	 *    utils.getAllArgument(url3);//{a: "123", b: "456", c: "789", d:undefined ,url: "abc.com/index.html"}
	 *
	 *  @param {String} [url=location.href] URL格式字符串
	 *  @param {Boolean} [argName2Lower=false] ，结果对象中参数名是否转化为小写
	 *  @return {Object} 以参数为键值的对象，包含url,其值为去掉参数(?前)的字符串
	 *  @modify urlSplit[1].replace("#","&").split("&") 修正为 urlSplit[1].split(/[#&]/)
	 */
	getAllArgument: function(url, argName2Lower) {
		var argObj = {}
		if (url === null) {
			return argObj
		};

		if (arguments.length === 0) {
			url = location.href
		} else if (arguments.length === 1 && typeof url === 'boolean') {
			argName2Lower = url
			url = location.href
		} else if (typeof url === 'object' && typeof url.href === 'string') {
			url = url.href
		}
		argName2Lower = !!argName2Lower

		if (url == null || url === '') {
			return argObj
		}

		var urlSplit = url.split('?')
		if (urlSplit.length > 1) {
			urlSplit[1] = des.decodeSearch(urlSplit[1])
			var args = urlSplit[1].split(/[#&]/)
			for (var i = 0; i < args.length; i++) {
				var arg = args[i].split('=')
				if (argName2Lower) {
					arg[0] = arg[0].toLowerCase()
				}
				argObj[arg[0]] = arg[1]
			}
		}
		argObj.url = urlSplit[0]
		return argObj
	},

	/**
	 * 设置cookie.
	 */
	setCookie: function(name, value, time, path) {
		var times = ''
		if (time != null && time !== '' && !isNaN(time)) {
			var exp = new Date()
			exp.setTime(exp.getTime() + time) //
			times = ';expires=' + exp.toGMTString()
		}
		// var exp = new Date()
		if (path == null) {
			path = ''
		}
		// #ifdef H5
		document.cookie = name + '=' + value + ';path=/' + path + times
		// #endif
		// #ifdef APP-PLUS
		plus.navigator.setCookie(getApp().globalData.hosturl, name + '=' + value + ';path=/' + path + times)
		// #endif
	},
	/**
	 * 获取cookie.
	 */
	getCookie: function(name) {
		var ss = ''
		var cookies = this.getCookies()
		for (var i = 0; i < cookies.length; i++) {
			if (cookies[i] && cookies[i].indexOf(name + '=') !== -1) {
				ss = cookies[i].split('=')
				if (ss instanceof Array && ss.length > 0) {
					ss = ss[1]
				}
				break
			}
		}
		return ss
	},

	/**
	 * 根据不同端,获取对应的cookies.
	 */
	getCookies: function() {
		var cookies = ''
		// #ifdef APP-PLUS
		cookies = getApp().globalData.ecp_token.split(';');
		// #endif

		// #ifdef H5
		cookies = document.cookie.split(';')
		// #endif
		return cookies
	},

	/**
	 * 获取ecp类型.
	 */
	getLanguage: function() {
		return this.getCookie('ecp_locale')
	},
	/**
	 * 把不完成的日期，改成完整的日期格式.
	 * @param str 日期格式
	 */
	formatDate: function(str) {
		var reg = /^\d{4}[-\/]\d{2}$/
		var reg1 = /^\d{4}$/
		if (reg.test(str)) {
			str += '-01'
		} else if (reg1.test(str)) {
			str += '-01-01'
		}
		return str
	},
	strToTimeMillis: function(str) {
		if (!str) {
			return 0
		} else if (str.indexOf('.') !== -1) {
			// 此方法不支持毫秒，去掉毫秒部分
			str = str.substring(0, str.indexOf('.'))
		}
		return +new Date(this.formatDate(str).replace(/-/g, '/'))
	},
	/**
	 * 校验日期格式
	 * @param dateStr
	 */
	invalidDate: function(dateStr) {
		var ds = dateStr.replace(/^(\d{4})(\d{2})?(\d{2})?$/g, function() {
			var y = RegExp.$1
			var m = RegExp.$2
			var d = RegExp.$3

			return y + '-' + (m || "01") + '-' + (d || "01")
		})
		var dt = new Date(ds)
		return (dt).valueOf().toString() === 'NaN' ? true : ds
	},
	/**
	 * 把字日期符串转换成符点数据格式
	 */
	parseDate: function(str, reg) {
		if (str === '' || str == null) {
			return +new Date()
		}
		if (typeof str === 'number' || typeof str === 'date') {
			return +str
		}
		if (typeof str === 'string') {
			var dt = this.invalidDate(str)
			if (typeof dt === 'string') {
				return +new Date(dt)
			}
		}
		var d = this.strToTimeMillis(str)
		// 判断字符串是否为数值
		if (!isNaN(d)) {
			return d
		}
		var reg = reg || /\b\((\-*\d*)\+\b/
		var arr = str.toString().match(reg)
		return arr ? arr[1] : +new Date()
	},

	/**
	 * 字符串转换成日期格式(YYYY-MM-DD)
	 * @param {string} str
	 * @param {boolean} showTime
	 * @param {string} showType
	 * @param {boolean} showSeconds
	 */
	strToDate: function(str, showTime, showType, showSeconds) {
		if (str == null || str === '') {
			return ''
		}
		str = this.parseDate(str)
		var d = !isNaN(str) ? new Date(+str) : new Date()
		var month = d.getMonth() + 1
		var day = d.getDate()
		var hours = d.getHours()
		var minutes = d.getMinutes()
		var seconds = d.getSeconds()
		var time = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
		if (showSeconds) {
			time += ':' + (seconds < 10 ? '0' + seconds : seconds)
		}
		if (showType == 'Y' || showType == 'year') {
			return d.getFullYear()
		} else if (showType == 'M' || showType == 'month' || showType == 'S' || showType == 'season') {
			return d.getFullYear() + '-' + (month < 10 ? '0' + month : month)
		}
		return d.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + (showTime ?
			' ' + time : '')
	},
	/**
	 * /Date(xxx+0800)/格式 转换成 YYYY-MM-DD格式
	 * @param value 日期格式
	 */
	ecpDateToDate: function(value, showTime) {
		var seconds = false
		if (showTime === true) {
			seconds = true
		}
		return this.strToDate(value, showTime, null, seconds)
	},
	/**
	 * 转换成 /Date(xxx+0800)/格式
	 * @param value 日期格式
	 */
	dateToEcpDate: function(value) {
		if (arguments.length) {
			if (value === '') {
				return value
			}
			var timeMillis = this.strToTimeMillis(value)
			timeMillis = isNaN(timeMillis) ? (+new Date()) : timeMillis
			return '\/Date(' + timeMillis + '+0800)\/'
		}
		return '\/Date(' + +new Date() + '+0800)\/'
	},
	/**
	 * 判断校验是否为ECP日期格式
	 */
	isEcpDate: function(date) {
		if (!this.isNotEmpty(date) || typeof(date) !== 'string') {
			return false
		}
		var reg = /^(\/Date\(){1}[0-9]+(\+0800\)\/)/
		return reg.test(date)
	},
	/**
	 * 日期转换成字符串.
	 * @param {Date} date 日期格式，
	 * @param {string} pattern 格式化字符串 yyy-MM-dd
	 */
	dateToStr: function(date, pattern) {
		if (!date) return
		var SIGN_REGEXP = /([yMdhsm])(\1*)/g
		var DEFAULT_PATTERN = 'yyyy-MM-dd'
		var padding = function(s, len) {
			var length = len - (s + '').length
			for (var i = 0; i < length; i++) {
				s = '0' + s
			}
			return s
		}
		pattern = pattern || DEFAULT_PATTERN
		return pattern.replace(SIGN_REGEXP, function($0) {
			switch ($0.charAt(0)) {
				case 'y':
					return padding(date.getFullYear(), $0.length)
				case 'M':
					return padding(date.getMonth() + 1, $0.length)
				case 'd':
					return padding(date.getDate(), $0.length)
				case 'w':
					return date.getDay() + 1
				case 'h':
					return padding(date.getHours(), $0.length)
				case 'm':
					return padding(date.getMinutes(), $0.length)
				case 's':
					return padding(date.getSeconds(), $0.length)
			}
		})
	},
	/**
	 * 创建dlltool对象.
	 */
	getObj: function() {
		var dllToolObj = null
		if (/msie/i.test(window.navigator.appVersion) === false) {
			dllToolObj = document.getElementById('dlltool')
			if (dllToolObj == null) {
				dllToolObj = document.createElement('embed')
			}
			dllToolObj.id = 'dlltool';
			dllToolObj.type = 'application/rpygtooljs';
			dllToolObj.width = 1
			dllToolObj.height = 1

			var ddd = document.getElementsByTagName('BODY')
			var hdiv = document.createElement('DIV')
			hdiv.style.position = 'absolute';
			hdiv.style.top = '0px';
			hdiv.style.left = '0px';
			hdiv.style.width = '1px';
			hdiv.style.height = '1px';
			hdiv.style.overflow = 'hidden';
			ddd[0].appendChild(hdiv)
			hdiv.appendChild(dllToolObj)
		} else {
			dllToolObj = new ActiveXObject('dllAdapter.dllAdapter')
			dllToolObj.utf8 = 0
		}
		return dllToolObj
	},
	/**
	 * 通过webSocket调用本地插件控件.
	 * @param {string} name 传处com+的ole字符串，如'AutoUpdate.WebUpdate'(包括对象+接口) 或 应用程序如 FT_reg.exe,当执行exe时，默认只运行与dllAdapter.dll同目录的exe文件
	 * @param {string} method 方法名 如果是运行exe文件，可传入空
	 * @param {Array} params 传入参数数组，可不传
	 * @param {Array} property 传入属性数组格式[{name:'p1',value:'v1'},{name:'p2', value:'v2'}] 可不传
	 * @param {Boolean} ret 是否需要返回值 可不传，默认是true
	 * @param {string} type 可传入类型 type如 dll, exe等，建议不传，目前默认解析dll和exe，
	 * @param {function} callBack 回调函数 两个参数  state:调用状态true/false, result:返回的结果
	 * @example
	 *    utils.activeInvoke('AutoUpdate.WebUpdate','GetMudVersion', [], [], function(state, result){
	 *       //todo
	 *    });
	 *    utils.activeInvoke('FT_reg.exe', function(state, result) {
	 *       //todo
	 *    });
	 */
	activeInvoke: function(name, method, params, property, ret, type, callBack) {
		// 参数兼容处理
		if (typeof method === 'function') {
			callBack = method
			method = null
			params = null
			property = null
			ret = null
			type = null
		} else if (typeof params === 'function') {
			callBack = params
			params = null
			property = null
			ret = null
			type = null
		} else if (typeof property === 'function') {
			callBack = property
			property = null
			ret = null
			type = null
		} else if (typeof ret === 'function') {
			callBack = ret
			ret = null
			type = null
		} else if (typeof type === 'function') {
			callBack = type
			type = null
		}
		var str = 'name:' + name + '\n'
		if (method !== '') {
			str += 'method:' + method + '\n'
		}
		// 解析参数
		if (params instanceof Array && params.length > 0) {
			var len = params.length
			for (var i = 0; i < len; i++) {
				// if(params[i] == null || params[i] === "") continue;
				str += 'params:'
				var tp = typeof params[i]
				if (tp === 'number') {
					str += 'number\n'
				} else if (tp === 'boolean') {
					str += 'boolean\n'
				} else if (/^[0-9]+\-[0-9]+\-[0-9]+ [0-9]+:[0-9]+:[0-9]+(.[0-9]+)?$/.test(params[i])) {
					str += 'datetime\n'
				} else if (/^[0-9]+\-[0-9]+\-[0-9]+$/.test(params[i])) {
					str += 'datetime\n'
				} else {
					str += 'string\n'
				}
				str += params[i] + ' \n'
			}
		}
		// 解析属性
		if (property instanceof Array && property.length > 0) {
			// eslint-disable-next-line no-redeclare
			var len = property.length
			for (var i = 0; i < len; i++) {
				str += 'property:'
				str += property[i].name
				var tp = typeof property[i].value
				if (tp === 'number') {
					str += ':number\n'
				} else if (tp === 'boolean') {
					str += ':boolean\n'
				} else {
					str += ':string\n'
				}
				str += property[i].value + '\n'
			}
		}
		if (ret !== false) {
			str += 'return:true\n'
		}
		if (type !== '' && type != null) {
			str = 'type:' + type + '\n' + str
		}
		str += '\0'
		var _this = this
		return new Promise(function(resolve, reject) {
			try {
				// 创建npapi的对象
				var dllToolObj = _this.getObj()
				if (dllToolObj != null && (typeof dllToolObj.caller === 'function' || dllToolObj.utf8 === 0)) {
					console.info('use activeX to invoke com+.')
					var res = dllToolObj.caller(str)
					dllToolObj = null
					resolve(true, decodeURIComponent(res))
					if (typeof callBack === 'function') {
						callBack(true, decodeURIComponent(res))
					}
				} else {
					// 创建socket对象.
					var webSocket = new WebSocket('ws://localhost:2063')

					webSocket.onerror = function(event) {
						// eslint-disable-next-line prefer-promise-reject-errors
						reject(false, '')
						if (typeof callBack === 'function') {
							callBack(false, '')
						}
						console.error('create error:' + event.data)
						webSocket.close()
					}

					webSocket.onopen = function(event) {
						console.info('Connection established')
					}

					webSocket.onclose = function(event) {
						console.info('Connection disconnection')
					}

					webSocket.onmessage = function(event) {
						resolve(true, decodeURIComponent(event.data))
						if (typeof callBack === 'function') {
							callBack(true, decodeURIComponent(event.data))
						}
						console.info(decodeURIComponent(event.data))
						webSocket.close()
					}

					if (str != null && str !== '') {
						var sh = setInterval(function() {
							if (webSocket.readyState === 1) {
								webSocket.send(str)
								clearInterval(sh)
							}
						}, 100)
					} else {
						// eslint-disable-next-line prefer-promise-reject-errors
						reject(false, '')
						if (typeof callBack === 'function') {
							callBack(false, '')
						}
					}
				}
			} catch (e) {
				console.error('error:' + e.message)
				// eslint-disable-next-line prefer-promise-reject-errors
				reject(false, '')
				if (typeof callBack === 'function') {
					callBack(false, '')
				}
			}
		})
	},

	/**
	 * 颜色RGB转换成十六进制
	 * @param rgb RGB格式的颜色表示
	 * @return hexColor 返回十六进制的颜色表示
	 */
	fromRGBToHex: function(rgb) {
		var regexp = /^rgb\(([0-9]{0,3})\,\s([0-9]{0,3})\,\s([0-9]{0,3})\)/g,
			re = rgb.replace(regexp, '$1 $2 $3').split(' '), // 利用正则表达式去掉多余的部分
			hexColor = '#',
			hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
		for (var i = 0; i < 3; i++) {
			var r = null,
				c = re[i],
				hexAr = []
			while (c > 16) {
				r = c % 16
				c = (c / 16) >> 0
				hexAr.push(hex[r])
			}
			hexAr.push(hex[c])
			hexColor += hexAr.reverse().join('')
		}

		return hexColor
	},

	/**
	 * 返回二维码服务端实现方式路径.
	 */
	getQRCodeUrl: function(value, width) {
		if (width == null) {
			width = 100
		}
		var url = '/grm/ecp/barcodeServlet?content=' + value + '&barcodeTypeId=QR&width=' + width + '&height=' + width
		return this.getLocaHost() + url
	},
	/**
	 * 身份证.
	 */
	isIDCard: function(value) {
		return /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(value)
	},
	/**
	 * 电话号
	 */
	isTele: function(value) {
		return /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value)
	},
	/**
	 * 手机号.
	 */
	isMobile: function(value) {
		return /^1[34578]\d{9}$/.test(value)
	},
	/**
	 * 电子邮箱.
	 */
	isEmail: function(value) {
		return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
	},
	/**
	 * 邮政编码.
	 */
	isPostid: function(value) {
		return /[1-9]\d{5}(?!\d)/.test(value)
	},
	/**
	 * 较验数据
	 */
	validate: function(validate, value) {
		var show = true
		var i18n = {
			'qzz': {}
		}
		var valiMsg = ''
		if (this.isNotEmpty(validate) && this.isNotEmpty(value)) {
			if (/^email$/i.test(validate)) {
				show = this.isEmail(value)
				valiMsg = i18n.qzz.emailVali
			} else if (/^telePhone$/i.test(validate)) {
				show = this.isTele(value)
				valiMsg = i18n.qzz.teleVali
			} else if (/^mobileTelePhone$/i.test(validate)) {
				show = this.isMobile(value)
				valiMsg = i18n.qzz.mobileVali
			} else if (/^postboat$/i.test(validate)) {
				show = this.isPostid(value)
				valiMsg = i18n.qzz.postVali
			} else if (/^idcard$/i.test(validate)) {
				show = this.isIDCard(value)
				valiMsg = i18n.qzz.idcardVali
			} else {
				return {
					'state': false,
					'message': ''
				}
			}
		}
		return {
			'state': show,
			'message': valiMsg
		}
	},
	/**
	 * 设置时区.
	 */
	setTimeZone: function() {
		var timezone = new Date().getTimezoneOffset() / 60
		if (timezone < 0) {
			timezone = 'GMT+' + -timezone
		} else {
			timezone = 'GMT-' + timezone
		}
		this.setCookie('ecp_timezone', timezone)
		return timezone
	},
	/**
	 * 判断对象是否为空.
	 */
	isNotEmpty: function(value) {
		var re = true
		if (value == null || value === '') {
			re = false
		} else if (typeof value === 'object') {
			if (this.isArray(value)) {
				re = value.length > 0
			} else {
				re = false
				for (var key in value) {
					re = true
					console.info('this object has value:' + key)
					console.info(value[key])
					break
				}
			}
		}
		return re
	},
	/**
	 * 合并json对象.
	 */
	extend: function(base, opt, deep) {
		if (base == null) {
			return opt
		}
		if (deep == null) {
			deep = 10
		} else if (deep === true) {
			deep = 0
		}
		if (this.isArray(opt)) {
			base = []
			// 生成新数组然后复制.
			for (var i = 0, ilen = opt.length; i < ilen; i++) {
				var copt = opt[i]
				if (copt != null && typeof copt === 'object' && deep > 0) {
					copt = this.extend({}, opt[i], deep - 1)
				}
				base.push(copt)
			}
		} else {
			for (var i in opt) {
				var isDeep = opt == null || opt.__deep == null || opt.__deep[i] !== false
				if (opt[i] != null && typeof opt[i] === 'object' && isDeep && deep > 0) {
					if (!base[i]) {
						base[i] = {}
					}
					base[i] = this.extend(base[i], opt[i], deep - 1)
				} else {
					base[i] = opt[i]
				}
			}
		}
		return base
	},
	getQueryString: function(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
		var r = location.search.substr(1).match(reg)
		if (r != null) return unescape(decodeURI(r[2]))
		return null
	},
	/**
	 *  JSON 字符串转换为对象
	 * @param {Object} str
	 */
	strToJson: function(str) {
		var rs = str
		// eslint-disable-next-line no-useless-escape
		if (/^([ \n\t]+)?[{\[]/.test(str)) {
			try {
				rs = JSON.parse(str)
			} catch (e) {
				console.info(e)
				try {
					rs = JSON.parse(str.replace(/([{,])([ ]+)?([a-z]+)([ ]+)?:/ig, '$1$2"$3"$4:'))
				} catch (err) {
					console.info(err)
					rs = str
				}
			}
		}
		return rs
	},
	/**
	 * JavaScript 对象转换为字符串
	 * @param {Object} obj
	 */
	jsonToStr: function(obj) {
		return JSON.stringify(obj)
	},
	getContextPath: function() {
		// #ifdef H5
		var cp = window._ecp_remote_context_path
		// #endif

		// #ifdef APP-PLUS
		var cp = ''
		// #endif

		if (cp != null && cp !== '') {
			var res = cp
			return res
		}
		var baseStr = '/mapp/'
		var assertsStr = '/assets/'
		var baseUrl = window.location.pathname
		var bi = baseUrl.indexOf(baseStr)

		var res = ''
		if (bi >= 0) {
			baseUrl = baseUrl.substr(0, bi)
			res = baseUrl.replace(/\/[^\/]+$/, '')
		} else {
			bi = baseUrl.indexOf(assertsStr)
			if (bi >= 0) {
				res = baseUrl.substr(0, bi);
			}
		}
		console.log('context path is:' + res)
		return res
	},
	/**
	 * 修改模型状态，设置_oldValue
	 */
	 _modifyModelState: function(model, path, oldValue, orgModel,isGrid){
		if(!model){return;}
		//非表格处理oldvalue
		if(!isGrid){
			if(!model[cst.OLD_VALUE]){
				model[cst.OLD_VALUE] = {};
			}
			model[cst.OLD_VALUE][path] = oldValue;
		}
		var dmState = cst.ModelState;
		// 设置状态
		var ms = model.modelState;
		if(!ms){
			ms = model.modelState = dmState.DEFAULT;
		}
		// 当前状态不是修改状态或删除或新增状态就修改成修改状态
		if(dmState && !dmState.isModify(ms) && !dmState.isDelete(ms) && !dmState.isNew(ms)){
			if(dmState.isDefault(ms)){
				ms = dmState.MODIFY;
			}else{
				ms ^= dmState.MODIFY;
			}
			model.modelState = ms;
			// 大模型状态修改
			if(orgModel){
				var orgms = orgModel.modelState;
				if(orgms){
					if(dmState.isDefault(orgms)){
						orgms = dmState.MODIFY;
					}else if(!dmState.isModify(orgms)){
						orgms ^= dmState.MODIFY;
					}
					orgModel.modelState = orgms;
				}else{
					orgModel.modelState = dmState.MODIFY;
				}
			}
		}
	},
	/**
	 * @param model
	 *            大模型
	 * @param path
	 *            路径
	 * @param value
	 *            新值
	 * @param oldValue
	 *            旧值，当isGrid为true时表示删除的旧值（deletedList）
	 * @param gridChange
	 *            表格是否有修改
	 * @param isGrid
	 *            是否为表格（qzzgrid）
	 */
	 setModelValue: function(model, path, value, oldValue, isGrid, gridChange) {
		if(oldValue === undefined){
			oldValue = this.getModelValue(model, path);
		}
		var exists = path in model;
		if (exists || path.indexOf(".") === -1) {
			model[path] = value;
			//修改大模型状态
			if(isGrid && gridChange){
				this._modifyModelState(model, null, null, null, isGrid);
			}else if(!isGrid && value !== oldValue){
				// 设置oldValue
				this._modifyModelState(model, path, oldValue);
			}
		} else {
			var props = path.split("."),
				i = 0, obj,childGrid=false,
				len = props.length,
				orgModel = model;
			do {
				var propStr = props[i];
				if( typeof(propStr) === "string" && propStr.indexOf("[") >=0 ){
					obj = eval("model."+propStr);
					childGrid = true;
				}else{
					obj = model[props[i]];
					if(obj == null) {
						model[props[i]] = {};
						obj = model[props[i]];
					}
				}
				if (value !== undefined) {
					i++;
					model = obj;
				} else {
					if(childGrid){
						eval("model."+props[i]+"={}");
						model = eval("model."+props[i]);
					}else{
						model[props[i]] = {};
						model = model[props[i]];
					}
					obj = model;
					i++;
				}
			} while (i < (len - 1)){
				// 倒数第二个，最后一个是属性
				if(isGrid){
					obj[0][props[i]] = value;
				}else{
					if(childGrid){
						eval("obj."+props[i]+" = value");
					}else{
						obj[props[i]] = value;
					}
				}
				if(!isGrid && value !== oldValue){
					// 设置oldValue
					this._modifyModelState(obj, props[i], oldValue, orgModel);
				}
			}
			//修改大模型状态
			if(isGrid && gridChange){
				this._modifyModelState(orgModel, null, null, null, true);
			}
		}
		// 处理表格的deletedList.
		if(isGrid === true && oldValue && oldValue.length !==0){
			if(!model[cst.OLD_VALUE]){
				model[cst.OLD_VALUE] = {};
			}
				model[cst.OLD_VALUE][path+".deletedList"] = oldValue;
		}
	},
	
	getModelValue: function(model, path) {
		if(!model || !path){
			return "";
		}
		var exists = path in model;
		if (exists) {
			return model[path];
		} else {
			var props = path.split(".");
			var props0 = props[0];
			if(typeof(props0) === "string" && props0.indexOf("[")>=0){
				props0 = props0.substring(0,props0.indexOf("["));
			}
			var exists = props0 in model;
			var i = 0;
			// 兼容key中增加了主key
			if (exists==false) {
				i=1;
			}
			var value;
			if(props.length>i){
				 var len = props.length;
				 var deep = true;
				 do {
					 var propStr = props[i];
					 if( typeof(propStr) === "string" && propStr.indexOf("[") >=0 ){
						value = eval("model."+propStr);
					 }else{
						value = model[props[i]];
					 }
					 
					 if (value) {
						 i++;
						 model = value;
					 } else {
						 deep = false;
					 }
				 } while (i < len && deep)
			}
			return value;
		}
	},
	replaceAll: function(oriStr, findStr, replaceStr) {
		if(typeof oriStr == "string") {
			return oriStr.replace(new RegExp(findStr, "g"), replaceStr);
		}
		return oriStr;
	}
}

// if (window._ecp_remote_utils == null) {
// window._ecp_remote_utils = new EcpUtils()
// }

export default new EcpUtils()
