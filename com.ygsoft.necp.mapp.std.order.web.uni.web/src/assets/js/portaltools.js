import NRS from '@/lib/ecp/scripts/ecp.service.js'
import DES from '@/lib/ecp/scripts/ecp.des.js'
import utils from '@/lib/ecp/scripts/ecp.utils.js'  
var ecpDataContext = null
var currentToken = null
var webParam = null
var bsportal = null
export const portaltools = {
	getArguments: function(url, argName2Lower) {
		var argObj = {}
		if (url === null) {
			return argObj
		}

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
			urlSplit[1] = DES.decodeSearch(urlSplit[1])
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
	 * 获取cookie.
	 * @param name cookie键
	 */
	getCookie: function(name) {
		if (name) {
			var coks = utils.getCookies();
			if (coks && coks.length > 0) {
				for (var i = 0; i < coks.length; i++) {
					var arrCookie = coks[i];
					var arr = arrCookie.split('=');
					if (arr[0].trim() == name.trim()) {
						return arr[1];
					}
				}
			}
		}
		return null;
	},

	/**
	 * 请求上下文.
	 */
	requestDataContext: function(preUrl) {
		var args = this.getArguments()
		// 处理CEF加载的页面场景
		var cefToken = args['cefEcpTokenId']
		if (cefToken) {
			utils.setCookie("ecpDataContext.tokenId", cefToken);
		}
		var token = this.getCookie('ecp_token')
		currentToken = token
		var urlToken = args['tokenid']
		if (token == null && urlToken) {
			currentToken = token = urlToken
			//utils.setCookie("ecp_token", cefToken);
		}
		var url = '/context'
		if (preUrl) {
			url = preUrl + url
		}
		var res = NRS.doPost(url, {})
		return res
	},

	/**
	 * 初始化.
	 */
	init: function(preUrl, loginUrl) {
		if (webParam == null) {
			this.requestDataContext(preUrl)

			// 初始化判断上下文用户id是否为空，若为空跳转至loginUrl
			if (!this.getUserId() && loginUrl) {
				window.unloadFlag = true
				window.location = loginUrl
			}
		}
	},

	/**
	 * 获取上下文用户ID.
	 *
	 * @return {number}
	 */
	getUserId: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.userId
		}
	},
	/**
	 * 获取登录名.
	 *
	 * @return {string}
	 */
	getUserName: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.userName
		}
	},
	/**
	 * 获取用户显示名.
	 *
	 * @return {string}
	 */
	getUserDisplayName: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.userDisplayName
		}
	},
	/**
	 * 获取登录单位ID.
	 *
	 * @return {string}
	 */
	getLoginOrgId: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.loginOrgId
		}
	},
	/**
	 * 获取登录单位名称.
	 *
	 * @return {string}
	 */
	getLoginOrgName: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.loginOrgName
		}
	},

	/**
	 * 获取登录上下文.
	 *
	 * @return {string}
	 */
	getTokenId: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.tokenId
		}
	},
	/**
	 * 获取客户端IP.
	 *
	 * @return {string}
	 */
	getIp: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.ip
		}
	},
	/**
	 * 获取客户端语言.
	 *
	 * @return {string}
	 */
	getCurrentLanguage: function() {
		return (
			utils.getCookie('ecp_locale') ||
			(navigator.language || navigator.userLanguage || 'zh-cn').toLowerCase()
		)
	},
	/**
	 * 获取所访问服务的端口.
	 *
	 * @return {string}
	 */
	getPort: function() {
		return document.location.port
	},
	/**
	 * 获取登录时间.
	 *
	 * @return {object} EcpDate对象
	 */
	getLoginDate: function() {
		this.init()
		if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
			return bsportal.ecpDataContext.loginContext.loginDate
		}
	},

	/**
	 *  获取上下文.
	 */
	getEcpDataContext: function() {
		this.init()
		if (bsportal && bsportal.ecpDataContext) {
			return bsportal.ecpDataContext
		}
	},

	/**
	 * 退出.
	 */
	logout: function(callback) {
		let url = 'necp/mapp/4a/necp/login/logoutsession'
		// var url = 'necp/mapp/appserver/logout4'
		var arr = []
		NRS.doPost(url, arr)
			.then(res => {
				window.unloadFlag = true
				callback && callback(res)
			})
			.catch(err => {
				if (window.console) {
					window.console.log(err)
				}
			})
	},
	/**
	 * 校验是否超时.
	 */
	validSession: function(preUrl, callback) {
		let url = '/validsession';
		if (preUrl) {
			url = preUrl + url;
		}
		url = url + "?tokenid=" + utils.getCookie("ecpDataContext.tokenId") ;
		NRS.doPost(url, {})
			.then(res => {
				callback && callback(res)
			})
			.catch(err => {
				if (window.console) {
					window.console.log(err)
				}
			})
	},
	async getSessionTimeout() {
		let url = 'necp/mapp/4a/necp/login/getSessionTimeout'
		let time = 30
		await NRS.doPost(url, {}).then(res => {
			time = res.data
		})
		return time
	},
	/**
	 * 获取上下文.
	 * @param vipAddres 。
	 */
	async getDataContext() {
		// 请求服务端获取上下文
		let urlWebParams = 'necp/mapp/4a/portal/initWebParam'
		let ecpDataContext = ''
		await NRS.doPost(urlWebParams, {}).then(webParam => {
			if (webParam) {
				ecpDataContext = webParam.data.ecpDataContext
				if (ecpDataContext) {
					ecpDataContext.jcls =
						'com.ygsoft.ecp.core.framework.internal.context.EcpDataContext'
				}
			}
		})
		return ecpDataContext
	}
}
