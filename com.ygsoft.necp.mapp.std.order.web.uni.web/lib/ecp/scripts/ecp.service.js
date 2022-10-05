import uniRequest from './uni-request/index.js';
import utils from './ecp.utils'
import desUtil from './ecp.des'
import security from './ecp.security'
import config from './ecp.config'

'use strict'

var DEF_REMOTE_SERVICE = '/grm/ecp/webcore/remoteService'
var DEF_REMOTE_SERVICE_PARAM_NAME = 'name'

var webAppRoot = '/grm'
var CommonConst = {
	REMOTE_SERVLET: webAppRoot + '/ecp/webcore/remoteService',
	TOKENID: 'ecp_token',
	EMPTY_TOKEN: 'Empty_Token',
	TOKEN: 'ecpDataContext.tokenId',
	DECOMPRESSION: 'decompression',
	LOG_LEVEL: 'log_level',
	DEBUG: 1,
	INFO: 2,
	WARN: 4,
	ERROR: 8,
	UD_ADDR: '/ecp/xdeer/',
	DOC_ADDR: '/ecp/doc/vue/'
}

function RemoteService() {};

RemoteService.prototype = {
	/**
	 * ud和developer不加密参数
	 */
	_eableDes: function() {
		// #ifdef H5
		var href = window.location.href
		// #endif

		// #ifdef APP-PLUS
		var href = ''
		// #endif

		if (href.indexOf(CommonConst.UD_ADDR) >= 0 || href.indexOf(CommonConst.DOC_ADDR) >= 0) {
			return false
		}
		return true
	},

	_getHeaders: function(signification) {
		// #ifdef H5
		var headers = window.isDebug ? {
			'debug': 1
		} : {}
		// #endif

		// #ifdef APP-PLUS
		var headers = {}
		// #endif

		if (signification && signification['AZ']) {
			headers['AZ'] = signification['AZ']
		}
		var cmSign = null
		if (this._eableDes()) {
			cmSign = desUtil.getCmSign()
		}
		if (cmSign) {
			headers['CM'] = cmSign
		}
		// ui4.0发出的请求
		headers['V4'] = 1
		headers['Content-Type'] = 'application/json;charset=UTF-8'
		return headers
	},
	_paramsToStr: function(params) {
		var res = ''
		if (params != null) {
			var paramAry = []
			if (params instanceof Array) {
				for (var i = 0, ilen = params.length; i < ilen; i++) {
					var cv = params[i]
					paramAry.push('p' + i + '=' + cv)
				}
			} else if (typeof params === 'object') {
				return params
			}
			res = paramAry.join('&')
		}
		return res
	},
	_toJson: function(str) {
		var rs = str
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
	_createStandardXHR: function() {
		try {
			// #ifdef H5
			return new window.XMLHttpRequest()
			// #endif

			// #ifdef APP-PLUS
			return new plus.net.XMLHttpRequest()
			// #endif

		} catch (e) {}
	},
	_createActiveXHR: function() {
		try {
			// #ifdef H5
			return new window.ActiveXObject('Microsoft.XMLHTTP')
			// #endif

			// #ifdef APP-PLUS
			return new ActiveXObject('Microsoft.XMLHTTP')
			// #endif

		} catch (e) {}
	},
	_createaXhr: function() {
		return this._createStandardXHR() || this._createActiveXHR()
	},
	/**
	 * 流式编程.
	 * @param {*} data
	 */
	_fluxAjax: function(data) {
		var me = this
		var xhr = me._createaXhr()
		var params = ''
		if (/get/i.test(data.method) && data.params) {
			for (var key in data.params) {
				if (params !== '') {
					params = params + '&' + key + '=' + escape(data.params[key])
				} else {
					params = key + '=' + escape(data.params[key])
				}
			}
			if (data.url.indexOf('?') < 0) {
				data.url = data.url + '?' + params
			} else {
				data.url = data.url + '&' + params
			}
		} else {
			data.data = JSON.stringify(data.params)
		}
		xhr.open(data.method, data.url, false)
		xhr.setRequestHeader('Accept', 'application/stream+json')
		var headers = data.headers
		if (headers != null) {
			for (var hkey in headers) {
				xhr.setRequestHeader(hkey, headers[hkey]);
			}
		}
		if (/get/i.test(data.method)) {
			xhr.send()
		} else {
			xhr.send(data.data)
		}
		return xhr
	},
	/**
	 * App端同步方式
	 * @param {Object} data
	 */
	async _uniRequest(data) {
		return new Promise(function(resolve, reject) {
			uni.request({
				url: data.url,
				data: data.data || {},
				header: data.headers,
				method: data.method,
				success: function(res) {
					resolve(res.data)
					console.log('bb')
				},
				fail: function(err) {
					reject(err)
				}
			})
		});
	},
	_getFullPath: function(url) {
		// 如果是完整的url则直接返回
		if(/^http(s)?:\/\//i.test(url)) {
			return url;
		}
		var cp = ''
		// #ifdef H5
		var cp = window._ecp_remote_context_path
		// #endif
		
		if(config.contextPath != null) {
			cp = config.contextPath;
		}

		if (cp != null && cp !== '') {
			var split = '/'
			if (/[\\\/]$/.test(cp)) {
				split = ''
			}
			var res = url
			if (url.indexOf('/') !== 0) {
				res = cp + split + url
			}
			var serverIp = ''
			// #ifdef APP-PLUS
			if(config.serverIp != null && config.serverIp !== "") {
				serverIp = config.serverIp;
			}
			// #endif
			return serverIp + res
		}
		var curl = url
		var baseStr = '/mapp/'
		var ui = -1
		if (typeof curl === 'string') {
			if (curl.indexOf('/') === 0) {
				return curl
			}
			ui = curl.indexOf(baseStr)
		}

		var baseUrl = ''
		// #ifdef H5
		baseUrl = window.location.pathname
		// #endif

		// #ifdef APP-PLUS
		baseUrl = ''
		// #endif

		var bi = baseUrl.indexOf(baseStr)

		var res = ''
		if (bi >= 0 && ui >= 0) {
			baseUrl = baseUrl.substr(0, bi)
			curl = '/' + curl.substr(0, ui)
			res = baseUrl.replace(curl, '')
		} else {
			var assetsStr = '/assets/'
			bi = baseUrl.indexOf(assetsStr)
			if (bi >= 0) {
				res = baseUrl.substr(0, bi);
			}
		}
		console.log('context path is:' + res)
		var split = '/'
		if (/[\\\/]$/.test(res)) {
			split = ''
		}
		var serverIp = ''
		// #ifdef APP-PLUS
		if(config.serverIp != null && config.serverIp !== "") {
			serverIp = config.serverIp;
		}
		// #endif
		return serverIp + res + split + url
	},
	/**
	 * 获取请求参数.
	 * @param {string} url
	 * @param {object} params
	 * @param {string} dataType
	 * @param {object} headers
	 * @param {string} postType
	 */
	_getRestServiceParams: function(url, params, dataType, headers, postType) {
		if (headers == null) {
			headers = {}
		}

		// #ifdef H5
		if (window.isDebug) {
			headers['debug'] = 1
		}
		// #endif

		// 需要设置接受的格式，服务端有可能指定多种格式
		// Flux风格的接口需要设置为 applicaiton/stream+json;charset=UTF-8
		headers['Accept'] = 'application/json;charset=UTF-8'
		// ui4.0发出的请求
		headers['V4'] = 1
		if (/POST/i.test(postType)) {
			//POST接口需要设置Content-Type
			if(headers['Content-Type'] == null) {
				headers['Content-Type'] = 'application/json;charset=UTF-8';
			}
		}
		//手机端把token添加在headers里
		headers[CommonConst.TOKENID] = utils.getCookie(CommonConst.TOKENID);
		// 处理url后面的参数
		var urlParam = ''
		var urlPre = url
		if (url && url.indexOf('?') > 0) {
			var idx = url.indexOf('?')
			urlPre = url.substring(0, idx)
			urlParam = url.substring(idx + 1)
		}
		var encData
		var paramJson = JSON.stringify(params)
		var actureParam = {
			param: paramJson
		}
		if (security.isSecurity()) {
			encData = security.az.sign(actureParam, postType)
			if (encData) {
				if (encData.AZ) {
					headers['AZ'] = encData.AZ
					headers['METHOD'] = postType
				}
				if (encData.encryptedParam) {
					actureParam = encData.encryptedParam
					for (var i in actureParam) {
						if (actureParam[i]) {
							actureParam[i] = encodeURIComponent(actureParam[i])
						}
					}
				}
			}
			var cmData = security.cm.sign()
			if (cmData) {
				headers['CM'] = cmData
			}
			paramJson = JSON.stringify(actureParam)
			if (urlParam) {
				encData = security.az.sign({
					param: urlParam
				}, postType)
				if (encData) {
					if (encData.AZ) {
						headers['UAZ'] = encData.AZ
					}
					var encParam = encData.encryptedParam
					url = urlPre + '?up=' + encodeURIComponent(encParam.param)
				}
			}
			params = JSON.parse(paramJson)
			var cdata = params
			// 如果是get请求，处理一下参数
			if (/GET/i.test(postType)) {
				var rurl = []
				for (var key in actureParam) {
					rurl.push(key + '=' + actureParam[key])
				}
				if (url.indexOf('?') > 0) {
					url += '&' + rurl.join('&')
				} else {
					url += '?' + rurl.join('&')
				}
				cdata = paramJson
			}
		}
		var data = {
			method: postType,
			url: this._getFullPath(url),
			params: params,
			headers: headers,
			responseType: dataType || 'json',
			data: cdata
		}
		return data
	},

	restService_DoPostAsync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'POST')
		return new Promise(function(resolve, reject) {
			if (isFlux) {
				try {
					var result = this._fluxAjax(data)
					var res = true
					if (res !== false) {
						resolve(result)
					}
				} catch (err) {
					// eslint-disable-next-line no-redeclare
					var res = true
					if (res !== false) {
						reject(err)
					}
				}
			} else {
				data.data = data.params
				//用params参数
				if (data.headers != null && data.headers.UP !== true) {
					data.params = {}
				}
				uni.setStorage({
					key: 'postkey',
					data: data.data,
				});
				uniRequest(data)
					.then(function(result) {
						var res = true
						if (res !== false) {
							resolve(result)
						}
					})
					.catch(function(err) {
						var res = true
						if (res !== false) {
							reject(err)
						}
					});
			}
		})
	},
	restService_DoPutAsync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'PUT')
		return new Promise(function(resolve, reject) {
			if (isFlux) {
				try {
					var result = this._fluxAjax(data)
					var res = true
					if (res !== false) {
						resolve(result)
					}
				} catch (err) {
					// eslint-disable-next-line no-redeclare
					var res = true
					if (res !== false) {
						reject(err)
					}
				}
			} else {
				data.data = data.params
				//用params参数
				if (data.headers != null && data.headers.UP !== true) {
					data.params = {}
				}
				uniRequest(data)
					.then(function(result) {
						var res = true
						if (res !== false) {
							resolve(result)
						}
					})
					.catch(function(err) {
						var res = true
						if (res !== false) {
							reject(err)
						}
					});
			}
		})
	},
	restService_DoDeleteAsync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'DELETE')
		return new Promise(function(resolve, reject) {
			if (isFlux) {
				try {
					var result = this._fluxAjax(data)
					var res = true
					if (res !== false) {
						resolve(result)
					}
				} catch (err) {
					// eslint-disable-next-line no-redeclare
					var res = true
					if (res !== false) {
						reject(err)
					}
				}
			} else {
				data.data = data.params
				//用params参数
				if (data.headers != null && data.headers.UP !== true) {
					data.params = {}
				}
				uniRequest(data)
					.then(function(result) {
						var res = true
						if (res !== false) {
							resolve(result)
						}
					})
					.catch(function(err) {
						var res = true
						if (res !== false) {
							reject(err)
						}
					});
			}
		})
	},
	restService_DoDeleteSync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'PUT')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	restService_DoGetAsync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'GET')
		return new Promise(function(resolve, reject) {
			if (isFlux) {
				try {
					var result = this._fluxAjax(data)
					var res = true
					if (res !== false) {
						resolve(result)
					}
				} catch (err) {
					// eslint-disable-next-line no-redeclare
					var res = true
					if (res !== false) {
						reject(err)
					}
				}
			} else {
				uni.setStorage({
					key: 'getkey',
					data: data.params
				});
				uniRequest.get(data.url, data)
					.then(function(result) {
						var res = true
						if (res !== false) {
							resolve(result)
						}
					})
					.catch(function(err) {
						var res = true
						if (res !== false) {
							reject(err)
						}
					});
			}
		})
	},
	restService_DoPostSync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'POST')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	restService_DoPutSync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'PUT')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	restService_DoGetSync: function(url, params, dataType, headers, isFlux) {
		var data = this._getRestServiceParams(url, params, dataType, headers, 'GET')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	_getRemoteServiceParams: function(serviceName, methodName, params, dataType, postType) {
		var url = ''
		// #ifdef H5
		url = DEF_REMOTE_SERVICE + '?' +
			DEF_REMOTE_SERVICE_PARAM_NAME + '=' + serviceName + '.' + methodName
		// #endif

		// #ifdef APP-PLUS
		url = (getApp().globalData.hosturl + DEF_REMOTE_SERVICE) + '?' +
			DEF_REMOTE_SERVICE_PARAM_NAME + '=' + serviceName + '.' + methodName
		// #endif

		var timezone = utils.setTimeZone()
		var paramData = {
			name: serviceName + '.' + methodName,
			params: params,
			'ecp_timezone': timezone
		}

		var signification = null
		if (this._eableDes()) {
			signification = desUtil.signData(CommonConst.REMOTE_SERVLET, postType, paramData)
		}
		var headers = this._getHeaders(signification)
		if(headers != null) {
			//手机端把token添加在headers里
			headers[CommonConst.TOKENID] = utils.getCookie(CommonConst.TOKENID);
		}
		if (signification && signification.encryptedParam) {
			paramData = signification.encryptedParam
			for (var i in paramData) {
				if (paramData[i]) {
					paramData[i] = encodeURIComponent(paramData[i])
				}
			}
		}
		var cparams = {}
		if (params != null) {
			if (params instanceof Array) {
				if (/POST/i.test(postType)) {
					// eslint-disable-next-line no-redeclare
					for (var i = 0, ilen = params.length; i < ilen; i++) {
						var cparam = params[i]
						cparams['p' + i] = cparam
					}
				} else {
					cparams = params
				}
				cparams = {
					'params': JSON.stringify(cparams)
				}
			}
		}
		var data = {
			'method': postType,
			'url': url,
			'params': cparams,
			'headers': headers,
			'data': paramData,
			'responseType': dataType || 'json'
		}
		return data
	},
	/**
	 * 服务端请求接口.
	 * @param {*} serviceName 服务端接口名称
	 * @param {*} methodName  服务端接口方法
	 * @param {*} params 参数
	 */
	remoteService_DoPostAsync: function(serviceName, methodName, params, dataType) {
		var data = this._getRemoteServiceParams(serviceName, methodName, params, dataType, 'POST')
		return new Promise(function(resolve, reject) {
			uniRequest(data)
				.then(function(result) {
					var res = true
					if (res !== false) {
						resolve(result)
					}
				})
				.catch(function(err) {
					var res = true
					if (res !== false) {
						reject(err)
					}
				});
		})
	},
	/**
	 * 服务端请求接口.
	 * @param {*} serviceName 服务端接口名称
	 * @param {*} methodName  服务端接口方法
	 * @param {*} params 参数
	 */
	remoteService_DoGetAsync: function(serviceName, methodName, params, dataType) {
		var data = this._getRemoteServiceParams(serviceName, methodName, params, dataType, 'GET')
		return new Promise(function(resolve, reject) {
			uniRequest(data)
				.then(function(result) {
					var res = true
					if (res !== false) {
						resolve(result)
					}
				})
				.catch(function(err) {
					var res = true
					if (res !== false) {
						reject(err)
					}
				});
		})
	},
	remoteService_DoPostSync: function(serviceName, methodName, params, dataType) {
		var data = this._getRemoteServiceParams(serviceName, methodName, params, dataType, 'POST')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	remoteService_DoGetSync: function(serviceName, methodName, params, dataType) {
		var data = this._getRemoteServiceParams(serviceName, methodName, params, dataType, 'GET')
		try {
			var result = this._fluxAjax(data)
			// eslint-disable-next-line no-unused-vars
			var rs = result.responseText
			if (/json/i.test(data.responseType)) {
				rs = this._toJson(rs)
			}
			return rs
		} catch (err) {
			// #ifdef H5
			console.error(err)
			// #endif

			// #ifdef APP-PLUS
			console.log(err)
			// #endif
			// eslint-disable-next-line no-redeclare
		}
		return null
	},
	/**
	 * Post请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doPostSync: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoPostSync(url, params, dataType, headers)
		} else {
			res = this.remoteService_DoPostSync(serviceName, methodName, params, headers)
		}
		return res
	},
	/**
	 * get请求.
	 * @param {*} serviceName  or url
	 * @param {*} methodName  or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doGetSync: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || (typeof methodName === 'object' && (params == null || typeof params ===
				'string'))) {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoGetSync(url, params, dataType, headers)
		} else {
			res = this.remoteService_DoGetSync(serviceName, methodName, params, headers)
		}
		return res
	},
	/**
	 * Post请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doPost: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoPostAsync(url, params, dataType, headers)
		} else {
			res = this.remoteService_DoPostAsync(serviceName, methodName, params, headers)
		}
		return res
	},
	/**
	 * Put请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doPut: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoPutAsync(url, params, dataType, headers)
		}
		return res
	},
	/**
	 * Put请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doPutSync: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoPutSync(url, params, dataType, headers)
		}
		return res
	},
	/**
	 * Delete请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doDelete: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoDeleteAsync(url, params, dataType, headers)
		}
		return res
	},
	/**
	 * Delete请求.
	 * @param {*} serviceName or url
	 * @param {*} methodName or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doDeleteSync: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || typeof methodName === 'object') {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoDeleteSync(url, params, dataType, headers)
		}
		return res
	},
	/**
	 * get请求.
	 * @param {*} serviceName  or url
	 * @param {*} methodName  or params
	 * @param {*} params or dataType
	 * @param {*} headers
	 */
	doGet: function(serviceName, methodName, params, headers) {
		var res = null
		if (methodName == null || methodName === '' || (typeof methodName === 'object' && (params == null || typeof params ===
				'string'))) {
			var url = serviceName
			var dataType = params
			params = methodName
			res = this.restService_DoGetAsync(url, params, dataType, headers)
		} else {
			res = this.remoteService_DoGetAsync(serviceName, methodName, params, headers)
		}
		return res
	}
}

// if (window._ecp_remote_service == null) {
// window._ecp_remote_service = new RemoteService()
// }

export default new RemoteService()
