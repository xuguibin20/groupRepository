import NRS from 'ecp.service'
import CRYPTOAPI from 'ecp.cryp'
import DES from 'ecp.des'
import utils from 'ecp.utils'

export const logintools = {
  getArguments: function (url, argName2Lower) {
    var argObj = {}
    if (url === null) {
      return argObj
    }

    if (arguments.length === 0) {
      url = location.href
    } else if (arguments.length === 1 && typeof url == 'boolean') {
      argName2Lower = url
      url = location.href
    } else if (typeof url == 'object' && typeof url.href == 'string') {
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
   * 校验用户登录.
   * @param yhmc 用户名
   * @param password 密码
   * @param clientInfo 客户端信息（JSON字符串，服务端转MAP，目前用于传递IP信息）
   * @param callback 回调函数
   */
  checkUserLogin: function (yhmc, password, clientInfo, callback) {
    var url = '/checklogin'
    var preUrl = ''
    var clientInfo = clientInfo || {}
    if (clientInfo.preurl) {
      preUrl = clientInfo.preurl
    } else {
      var subvad = this.getCookie('subvad')
      if (subvad) {
        preUrl = subvad
      }
    }

    url = preUrl + url
    var info = this.getIpAddress(preUrl)
    if (typeof info === 'string') {
      clientInfo['REQUESTIP'] = clientInfo['REQUESTIP'] || info
    } else if (typeof info === 'object') {
      clientInfo['REQUESTIP'] = clientInfo['REQUESTIP'] || info.ip
      clientInfo['REQUESTHOST'] = info.host
      clientInfo['REQUESTMAC'] = info.mac
    }
    clientInfo['APPINFO'] = 'PORTAL;'
    clientInfo['LOCALE'] = this.getCookie('ecp_locale') || 'zh-cn'
    var toaddr = this.getArguments(true)['toaddr']
    clientInfo['toaddr'] = toaddr
    var sc = this.getCookie('sc')
    var encodeUserName = CRYPTOAPI.secEncrypt(yhmc)
    var encodePassword = CRYPTOAPI.secEncrypt(password)
    if (sc === 'false') {
      encodeUserName = yhmc
      encodePassword = password
    }
    // 采用用户名+密码的报文签名方式.
    if (CRYPTOAPI) {
      var sm3Hash = CRYPTOAPI.sm3Digest(encodeUserName + encodePassword)
      clientInfo['CHECKCODE'] = sm3Hash
    }
    var data = {
      p0: encodeUserName,
      p1: encodePassword,
      p2: DES.encodeSearch(JSON.stringify(clientInfo))
    }

    NRS.doPost(url, data)
      .then(res => {
        if (res.data != null) {
          if (res && res.data.tokenid) {
            document.cookie = 'ecp_token=' + res.data.tokenid + ';path=/'
            document.cookie =
              'ecpDataContext.tokenId=' + res.data.tokenid + ';path=/'
          }
          callback(res)
        }
      })
      .catch(err => {
        if (window.console) {
          window.console.log(err)
        }
      })
  },

  /**
   * 获取客户端IP.
   */
  getIpAddress: function (preUrl) {
    var tt = NRS.doPostSync('rptcweb/necp/mapp/4a/ipgetter/getip', {})
    return tt
  },
  /**
   * 获取IE版本.
   */
  getIEVersion: function () {
    var ua = navigator.userAgent.toLowerCase()
    var msie = parseInt((/msie (\d+)/.exec(ua) || [])[1], 10)
    if (isNaN(msie)) {
      msie = parseInt((/trident\/.*; rv:(\d+)/.exec(ua) || [])[1], 10)
    }
    return msie
  },

  /**
   * 获取cookie.
   * @param name cookie键
   */
  getCookie: function (name) {
    var strCookie = document.cookie
    var arrCookie = strCookie.split('; ')
    for (var i = 0; i < arrCookie.length; i++) {
      var arr = arrCookie[i].split('=')
      if (arr[0] == name) return arr[1]
    }
    return null
  }
}
