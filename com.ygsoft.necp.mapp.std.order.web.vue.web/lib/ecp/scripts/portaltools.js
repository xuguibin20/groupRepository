import NRS from 'ecp.service'
import DES from 'ecp.des'
var ecpDataContext = null
var currentToken = null
var webParam = null
var bsportal = null
export const portaltools = {
  getArguments: function (url, argName2Lower) {
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

  getCookie: function (name) {
    name = name + '='
    var start = document.cookie.indexOf(name),
      value = null
    if (start > -1) {
      var end = document.cookie.indexOf(';', start)
      if (end == -1) {
        end = document.cookie.length
      }
      value = document.cookie.substring(start + name.length, end)
    }
    return value
  },

  /**
   * 请求上下文.
   */
  requestDataContext: function (preUrl) {
    var args = this.getArguments()
    // 处理CEF加载的页面场景
    var cefToken = args['cefEcpTokenId']
    if (cefToken) {
      document.cookie = 'ecpDataContext.tokenId=' + cefToken + ';path=/'
    }
    var token = this.getCookie('ecp_token')
    currentToken = token
    var urlToken = args['tokenid']
    if (token == null && urlToken) {
      currentToken = token = urlToken
      document.cookie = 'ecp_token' + '=' + token + ';path=/'
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
  init: function (preUrl, loginUrl) {
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
  getUserId: function () {
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
  getUserName: function () {
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
  getUserDisplayName: function () {
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
  getLoginOrgId: function () {
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
  getLoginOrgName: function () {
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
  getTokenId: function () {
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
  getIp: function () {
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
  getCurrentLanguage: function () {
    return (
      document.cookie('ecp_locale') ||
      (navigator.language || navigator.userLanguage || 'zh-cn').toLowerCase()
    )
  },
  /**
   * 获取所访问服务的端口.
   *
   * @return {string}
   */
  getPort: function () {
    return document.location.port
  },
  /**
   * 获取登录时间.
   *
   * @return {object} EcpDate对象
   */
  getLoginDate: function () {
    this.init()
    if (bsportal.ecpDataContext && bsportal.ecpDataContext.loginContext) {
      return bsportal.ecpDataContext.loginContext.loginDate
    }
  },

  /**
   *  获取上下文.
   */
  getEcpDataContext: function () {
    this.init()
    if (bsportal && bsportal.ecpDataContext) {
      return bsportal.ecpDataContext
    }
  },

  /**
   * 退出.
   */
  logout: function (preUrl,callback) {
    var url = "/logout4";
    var arr = []
    url = preUrl + url;
    // NRS.doPost(
    //   url,
    //   arr
    // ).then(result => {
    //     if (result.isSuccess) {
    //         window.unloadFlag = true;
    //     }
    //     callback && callback(result);
    // }).catch(err => {
    //     if (window.console) {
    //       window.console.log(err)
    //     }
    // })
    NRS.doPost(url, arr)
      .then(() => {
        window.unloadFlag = true
        callback && callback()
      })
      .catch(err => {
        if (window.console) {
          window.console.log(err)
        }
      })
  }
}
