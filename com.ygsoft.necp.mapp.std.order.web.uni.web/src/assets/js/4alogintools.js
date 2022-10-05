import NRS from '@/lib/ecp/scripts/ecp.service.js'
import CRYPTOAPI from './common/ecp.cryp.js'
import DES from '@/lib/ecp/scripts/ecp.des.js'
import utils from '@/lib/ecp/scripts/ecp.utils.js'  
export const logintools = {
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
    clientInfo = clientInfo || {}
    if (clientInfo.preurl) {
      preUrl = clientInfo.preurl
    }

    url = preUrl + url
    this.getIpAddress('').then(info => {
      if (typeof info === 'string') {
        clientInfo['REQUESTIP'] = clientInfo['REQUESTIP'] || info
      } else if (typeof info === 'object') {
        clientInfo['REQUESTIP'] = clientInfo['REQUESTIP'] || info.data
        clientInfo['REQUESTHOST'] = info.host
        clientInfo['REQUESTMAC'] = info.mac
      }
      clientInfo['APPINFO'] = 'PORTAL;'
      clientInfo['LOCALE'] = this.getCookie('ecp_locale') || 'zh-cn'
      //var toaddr = this.getArguments(true)['toaddr']
      //clientInfo['toaddr'] = toaddr
	  
      var sc = this.getCookie('sc')
      var encodeUserName = this.secEncrypt(yhmc)
      var encodePassword = this.secEncrypt(password)
	  
      if (sc === 'false') {
        encodeUserName = yhmc
        encodePassword = password
      }
      // 采用用户名+密码的报文签名方式.
      if (CRYPTOAPI) {
        var sm3Hash = CRYPTOAPI.cryptoApi.sm3Digest(encodeUserName + encodePassword)
        clientInfo['CHECKCODE'] = sm3Hash
      }
      var data = {
        p0: encodeUserName,
        p1: encodePassword,
        p2: DES.encodeSearch(JSON.stringify(clientInfo))
      }
	  console.log('data:p0='+data.p0+',p1='+data.p1+',p2='+data.p2)

      NRS.doPost(url, data)
        .then(res => {
          if (res.data != null) {
            if (res && res.data.tokenid) {
			  utils.setCookie("ecpDataContext.tokenId", res.data.tokenid);
            }
            callback(res)
          }
        })
        .catch(err => {
          if (window.console) {
            window.console.log(err)
          }
        })
    })
  },
  
  /**
   * 加密参数.
   * @param {String} data 参数
   * @return {String} 密文
   */
  secEncrypt : function(data) {
	var smPK = "045c62ef2ecbd37156525c09c446a0d5197aaca1c3892505209a0228cc00a61b538810477d84c2340ab7ecf5332fd30f25a9cf4f2264b91b63c598b6086330e840"
	var encodeData = "SEC10001" + CRYPTOAPI.cryptoApi.sm2Encrypt(data,smPK,0)
	return encodeData
  },

  /**
   * 获取客户端IP.
   */
  async getIpAddress (preUrl) {
    var tt = await NRS.doPost('necp/mapp/4a/ipgetter/getip', {}, 'text')
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
	if (name) {
		var coks = utils.getCookies();
		if (coks && coks.length > 0) {
			for (var i=0;i<coks.length;i++) {
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
   * the 64 bit des core arithmetic
   *
   * @ignore
   * @param {String}
   *            dataByte
   * @param {String}
   *            keyByte
   * @returns {String}
   */
  enc (dataByte, keyByte) {
    var keys = this.generateKeys(keyByte)
    var ipByte = this.initPermute(dataByte)
    var ipLeft = new Array(32)
    var ipRight = new Array(32)
    var tempLeft = new Array(32)
    var i = 0,
      j = 0,
      k = 0,
      m = 0,
      n = 0
    for (let k = 0; k < 32; k++) {
      ipLeft[k] = ipByte[k]
      ipRight[k] = ipByte[32 + k]
    }
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 32; j++) {
        tempLeft[j] = ipLeft[j]
        ipLeft[j] = ipRight[j]
      }
      var key = new Array(48)
      for (let m = 0; m < 48; m++) {
        key[m] = keys[i][m]
      }
      var tempRight = this.xor(
        this.pPermute(
          this.sBoxPermute(this.xor(this.expandPermute(ipRight), key))
        ),
        tempLeft
      )
      for (let n = 0; n < 32; n++) {
        ipRight[n] = tempRight[n]
      }
    }

    var finalData = new Array(64)
    for (let i = 0; i < 32; i++) {
      finalData[i] = ipRight[i]
      finalData[32 + i] = ipLeft[i]
    }
    return this.finallyPermute(finalData)
  },
  initPermute (originalData) {
    var ipByte = new Array(64)
    for (let i = 0, m = 1, n = 0; i < 4; i++, m += 2, n += 2) {
      for (let j = 7, k = 0; j >= 0; j--, k++) {
        ipByte[i * 8 + k] = originalData[j * 8 + m]
        ipByte[i * 8 + k + 32] = originalData[j * 8 + n]
      }
    }
    return ipByte
  },
  /**
   * @ignore
   */
  expandPermute (rightData) {
    var epByte = new Array(48)
    for (let i = 0; i < 8; i++) {
      if (i == 0) {
        epByte[i * 6 + 0] = rightData[31]
      } else {
        epByte[i * 6 + 0] = rightData[i * 4 - 1]
      }
      epByte[i * 6 + 1] = rightData[i * 4 + 0]
      epByte[i * 6 + 2] = rightData[i * 4 + 1]
      epByte[i * 6 + 3] = rightData[i * 4 + 2]
      epByte[i * 6 + 4] = rightData[i * 4 + 3]
      if (i == 7) {
        epByte[i * 6 + 5] = rightData[0]
      } else {
        epByte[i * 6 + 5] = rightData[i * 4 + 4]
      }
    }
    return epByte
  },
  /**
   * @ignore
   */
  xor (byteOne, byteTwo) {
    var xorByte = new Array(byteOne.length)
    for (let i = 0; i < byteOne.length; i++) {
      xorByte[i] = byteOne[i] ^ byteTwo[i]
    }
    return xorByte
  },
  /**
   * @ignore
   */
  sBoxPermute (expandByte) {
    var sBoxByte = new Array(32)
    var binary = ''
    var s1 = [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
    ]
    /* Table - s2 */
    var s2 = [
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
    ]
    /* Table - s3 */
    var s3 = [
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
    ]
    /* Table - s4 */
    var s4 = [
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
    ]
    /* Table - s5 */
    var s5 = [
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
    ]
    /* Table - s6 */
    var s6 = [
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
    ]
    /* Table - s7 */
    var s7 = [
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
    ]
    /* Table - s8 */
    var s8 = [
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
    ]

    for (let m = 0; m < 8; m++) {
      let i = 0,
        j = 0
      i = expandByte[m * 6 + 0] * 2 + expandByte[m * 6 + 5]
      j =
        expandByte[m * 6 + 1] * 2 * 2 * 2 +
        expandByte[m * 6 + 2] * 2 * 2 +
        expandByte[m * 6 + 3] * 2 +
        expandByte[m * 6 + 4]
      switch (m) {
        case 0:
          binary = this.getBoxBinary(s1[i][j])
          break
        case 1:
          binary = this.getBoxBinary(s2[i][j])
          break
        case 2:
          binary = this.getBoxBinary(s3[i][j])
          break
        case 3:
          binary = this.getBoxBinary(s4[i][j])
          break
        case 4:
          binary = this.getBoxBinary(s5[i][j])
          break
        case 5:
          binary = this.getBoxBinary(s6[i][j])
          break
        case 6:
          binary = this.getBoxBinary(s7[i][j])
          break
        case 7:
          binary = this.getBoxBinary(s8[i][j])
          break
      }
      sBoxByte[m * 4 + 0] = parseInt(binary.substring(0, 1))
      sBoxByte[m * 4 + 1] = parseInt(binary.substring(1, 2))
      sBoxByte[m * 4 + 2] = parseInt(binary.substring(2, 3))
      sBoxByte[m * 4 + 3] = parseInt(binary.substring(3, 4))
    }
    return sBoxByte
  },
  /**
   * @ignore
   */
  pPermute (sBoxByte) {
    var pBoxPermute = new Array(32)
    pBoxPermute[0] = sBoxByte[15]
    pBoxPermute[1] = sBoxByte[6]
    pBoxPermute[2] = sBoxByte[19]
    pBoxPermute[3] = sBoxByte[20]
    pBoxPermute[4] = sBoxByte[28]
    pBoxPermute[5] = sBoxByte[11]
    pBoxPermute[6] = sBoxByte[27]
    pBoxPermute[7] = sBoxByte[16]
    pBoxPermute[8] = sBoxByte[0]
    pBoxPermute[9] = sBoxByte[14]
    pBoxPermute[10] = sBoxByte[22]
    pBoxPermute[11] = sBoxByte[25]
    pBoxPermute[12] = sBoxByte[4]
    pBoxPermute[13] = sBoxByte[17]
    pBoxPermute[14] = sBoxByte[30]
    pBoxPermute[15] = sBoxByte[9]
    pBoxPermute[16] = sBoxByte[1]
    pBoxPermute[17] = sBoxByte[7]
    pBoxPermute[18] = sBoxByte[23]
    pBoxPermute[19] = sBoxByte[13]
    pBoxPermute[20] = sBoxByte[31]
    pBoxPermute[21] = sBoxByte[26]
    pBoxPermute[22] = sBoxByte[2]
    pBoxPermute[23] = sBoxByte[8]
    pBoxPermute[24] = sBoxByte[18]
    pBoxPermute[25] = sBoxByte[12]
    pBoxPermute[26] = sBoxByte[29]
    pBoxPermute[27] = sBoxByte[5]
    pBoxPermute[28] = sBoxByte[21]
    pBoxPermute[29] = sBoxByte[10]
    pBoxPermute[30] = sBoxByte[3]
    pBoxPermute[31] = sBoxByte[24]
    return pBoxPermute
  },
  /**
   * @ignore
   */
  finallyPermute (endByte) {
    var fpByte = new Array(64)
    fpByte[0] = endByte[39]
    fpByte[1] = endByte[7]
    fpByte[2] = endByte[47]
    fpByte[3] = endByte[15]
    fpByte[4] = endByte[55]
    fpByte[5] = endByte[23]
    fpByte[6] = endByte[63]
    fpByte[7] = endByte[31]
    fpByte[8] = endByte[38]
    fpByte[9] = endByte[6]
    fpByte[10] = endByte[46]
    fpByte[11] = endByte[14]
    fpByte[12] = endByte[54]
    fpByte[13] = endByte[22]
    fpByte[14] = endByte[62]
    fpByte[15] = endByte[30]
    fpByte[16] = endByte[37]
    fpByte[17] = endByte[5]
    fpByte[18] = endByte[45]
    fpByte[19] = endByte[13]
    fpByte[20] = endByte[53]
    fpByte[21] = endByte[21]
    fpByte[22] = endByte[61]
    fpByte[23] = endByte[29]
    fpByte[24] = endByte[36]
    fpByte[25] = endByte[4]
    fpByte[26] = endByte[44]
    fpByte[27] = endByte[12]
    fpByte[28] = endByte[52]
    fpByte[29] = endByte[20]
    fpByte[30] = endByte[60]
    fpByte[31] = endByte[28]
    fpByte[32] = endByte[35]
    fpByte[33] = endByte[3]
    fpByte[34] = endByte[43]
    fpByte[35] = endByte[11]
    fpByte[36] = endByte[51]
    fpByte[37] = endByte[19]
    fpByte[38] = endByte[59]
    fpByte[39] = endByte[27]
    fpByte[40] = endByte[34]
    fpByte[41] = endByte[2]
    fpByte[42] = endByte[42]
    fpByte[43] = endByte[10]
    fpByte[44] = endByte[50]
    fpByte[45] = endByte[18]
    fpByte[46] = endByte[58]
    fpByte[47] = endByte[26]
    fpByte[48] = endByte[33]
    fpByte[49] = endByte[1]
    fpByte[50] = endByte[41]
    fpByte[51] = endByte[9]
    fpByte[52] = endByte[49]
    fpByte[53] = endByte[17]
    fpByte[54] = endByte[57]
    fpByte[55] = endByte[25]
    fpByte[56] = endByte[32]
    fpByte[57] = endByte[0]
    fpByte[58] = endByte[40]
    fpByte[59] = endByte[8]
    fpByte[60] = endByte[48]
    fpByte[61] = endByte[16]
    fpByte[62] = endByte[56]
    fpByte[63] = endByte[24]
    return fpByte
  },
  firstLoginChangePW (userName, oldPsw, newPsw) {
    let url = 'necp/mapp/4a/portalmdm/modifypswforsecurityByLocale'
    let tokenId = this.getCookie('ecpDataContext.tokenId')
    let ENCRY_FIRST_KEY = '1a8.jf65;j^f2v-0'
    let ENCRY_SECOND_KEY = '1a8.jf65;j^f2v-1'
    let ENCRY_THIRD_KEY = '1a8.jf65;j^f2v-2'
	var oldPswEn = this.secEncrypt(oldPsw)
	var newPswEn = this.secEncrypt(newPsw)
    let newUsernameEn = this.doEncrypt(
      userName,
      ENCRY_FIRST_KEY,
      ENCRY_SECOND_KEY,
      ENCRY_THIRD_KEY
    )
    NRS.doPost('necp/mapp/4a/ipgetter/getip', {}, 'text')
      .then(res => {
        return (
          url +
          '?ip=' +
          res.data +
          '&tokenId=' +
          tokenId +
          '&newUsername=' +
          newUsernameEn +
          '&oldPsw=' +
          oldPswEn +
          '&newPsw=' +
          newPswEn +
          '&locale=zh-cn'
        )
      })
      .then(res1 => {
        NRS.doPost(res1, {}, 'text').then(res => {
          console.log(res.data)
        })
      })
  },
  /**
   * 加密(三个密钥)
   *
   * @param {String}
   *            data 需要加密的数据
   * @param {String}
   *            firstKey 密钥1
   * @param {String}
   *            secondKey 密钥2
   * @param {String}
   *            thirdKey 密钥3
   * @returns {String} 加密后的数据
   */
  doEncrypt (data, firstKey, secondKey, thirdKey) {
    var leng = data.length
    var encData = ''
    var firstKeyBt,
      secondKeyBt,
      thirdKeyBt,
      firstLength,
      secondLength,
      thirdLength
    if (firstKey != null && firstKey != '') {
      firstKeyBt = this.getKeyBytes(firstKey)
      firstLength = firstKeyBt.length
    }
    if (secondKey != null && secondKey != '') {
      secondKeyBt = this.getKeyBytes(secondKey)
      secondLength = secondKeyBt.length
    }
    if (thirdKey != null && thirdKey != '') {
      thirdKeyBt = this.getKeyBytes(thirdKey)
      thirdLength = thirdKeyBt.length
    }

    if (leng > 0) {
      if (leng < 4) {
        var bt = this.strToBt(data)
        var encByte
        if (
          firstKey != null &&
          firstKey != '' &&
          secondKey != null &&
          secondKey != '' &&
          thirdKey != null &&
          thirdKey != ''
        ) {
          var tempBt
          var x, y, z
          tempBt = bt
          for (x = 0; x < firstLength; x++) {
            tempBt = this.enc(tempBt, firstKeyBt[x])
          }
          for (y = 0; y < secondLength; y++) {
            tempBt = this.enc(tempBt, secondKeyBt[y])
          }
          for (z = 0; z < thirdLength; z++) {
            tempBt = this.enc(tempBt, thirdKeyBt[z])
          }
          encByte = tempBt
        } else {
          if (
            firstKey != null &&
            firstKey != '' &&
            secondKey != null &&
            secondKey != ''
          ) {
            var tempBt
            var x, y
            tempBt = bt
            for (x = 0; x < firstLength; x++) {
              tempBt = this.enc(tempBt, firstKeyBt[x])
            }
            for (y = 0; y < secondLength; y++) {
              tempBt = this.enc(tempBt, secondKeyBt[y])
            }
            encByte = tempBt
          } else {
            if (firstKey != null && firstKey != '') {
              var tempBt
              var x = 0
              tempBt = bt
              for (x = 0; x < firstLength; x++) {
                tempBt = this.enc(tempBt, firstKeyBt[x])
              }
              encByte = tempBt
            }
          }
        }
        encData = this.bt64ToHex(encByte)
      } else {
        var iterator = parseInt(leng / 4)
        var remainder = leng % 4
        var i = 0
        for (let i = 0; i < iterator; i++) {
          var tempData = data.substring(i * 4 + 0, i * 4 + 4)
          var tempByte = this.strToBt(tempData)
          var encByte
          if (
            firstKey != null &&
            firstKey != '' &&
            secondKey != null &&
            secondKey != '' &&
            thirdKey != null &&
            thirdKey != ''
          ) {
            var tempBt
            var x, y, z
            tempBt = tempByte
            for (x = 0; x < firstLength; x++) {
              tempBt = this.enc(tempBt, firstKeyBt[x])
            }
            for (y = 0; y < secondLength; y++) {
              tempBt = this.enc(tempBt, secondKeyBt[y])
            }
            for (z = 0; z < thirdLength; z++) {
              tempBt = this.enc(tempBt, thirdKeyBt[z])
            }
            encByte = tempBt
          } else {
            if (
              firstKey != null &&
              firstKey != '' &&
              secondKey != null &&
              secondKey != ''
            ) {
              var tempBt
              var x, y
              tempBt = tempByte
              for (x = 0; x < firstLength; x++) {
                tempBt = this.enc(tempBt, firstKeyBt[x])
              }
              for (y = 0; y < secondLength; y++) {
                tempBt = this.enc(tempBt, secondKeyBt[y])
              }
              encByte = tempBt
            } else {
              if (firstKey != null && firstKey != '') {
                var tempBt
                var x
                tempBt = tempByte
                for (x = 0; x < firstLength; x++) {
                  tempBt = this.enc(tempBt, firstKeyBt[x])
                }
                encByte = tempBt
              }
            }
          }
          encData += this.bt64ToHex(encByte)
        }
        if (remainder > 0) {
          var remainderData = data.substring(iterator * 4 + 0, leng)
          var tempByte = this.strToBt(remainderData)
          var encByte
          if (
            firstKey != null &&
            firstKey != '' &&
            secondKey != null &&
            secondKey != '' &&
            thirdKey != null &&
            thirdKey != ''
          ) {
            var tempBt
            var x, y, z
            tempBt = tempByte
            for (x = 0; x < firstLength; x++) {
              tempBt = this.enc(tempBt, firstKeyBt[x])
            }
            for (y = 0; y < secondLength; y++) {
              tempBt = this.enc(tempBt, secondKeyBt[y])
            }
            for (z = 0; z < thirdLength; z++) {
              tempBt = this.enc(tempBt, thirdKeyBt[z])
            }
            encByte = tempBt
          } else {
            if (
              firstKey != null &&
              firstKey != '' &&
              secondKey != null &&
              secondKey != ''
            ) {
              var tempBt
              var x, y
              tempBt = tempByte
              for (x = 0; x < firstLength; x++) {
                tempBt = this.enc(tempBt, firstKeyBt[x])
              }
              for (y = 0; y < secondLength; y++) {
                tempBt = this.enc(tempBt, secondKeyBt[y])
              }
              encByte = tempBt
            } else {
              if (firstKey != null && firstKey != '') {
                var tempBt
                var x
                tempBt = tempByte
                for (x = 0; x < firstLength; x++) {
                  tempBt = this.enc(tempBt, firstKeyBt[x])
                }
                encByte = tempBt
              }
            }
          }
          encData += this.bt64ToHex(encByte)
        }
      }
    }
    return encData
  },
  /**
   * 根据字符串获取二进制码数组
   * <p>
   * chang the string into the bit array<br>
   * return bit array(it's length % 64 = 0)
   * </p>
   *
   * @ignore
   * @param {String}
   *            key 字符串
   * @return {String} 二进制码
   */
  getKeyBytes (key) {
    var keyBytes = new Array()
    var leng = key.length
    var iterator = parseInt(leng / 4)
    var remainder = leng % 4
    var i = 0
    for (let i = 0; i < iterator; i++) {
      keyBytes[i] = this.strToBt(key.substring(i * 4 + 0, i * 4 + 4))
    }
    if (remainder > 0) {
      keyBytes[i] = this.strToBt(key.substring(i * 4 + 0, leng))
    }
    return keyBytes
  },

  /**
   * chang the string(it's length <= 4) into the bit array
   *
   * @ignore
   * @param {String}
   *            str 字符串
   * @returns {String} bit array(it's length = 64)
   */
  strToBt (str) {
    var leng = str.length
    var bt = new Array(64)
    if (leng < 4) {
      var i = 0,
        j = 0,
        p = 0,
        q = 0
      for (let i = 0; i < leng; i++) {
        var k = str.charCodeAt(i)
        for (let j = 0; j < 16; j++) {
          var pow = 1,
            m = 0
          for (let m = 15; m > j; m--) {
            pow *= 2
          }
          bt[16 * i + j] = parseInt(k / pow) % 2
        }
      }
      for (let p = leng; p < 4; p++) {
        var k = 0
        for (let q = 0; q < 16; q++) {
          var pow = 1,
            m = 0
          for (let m = 15; m > q; m--) {
            pow *= 2
          }
          bt[16 * p + q] = parseInt(k / pow) % 2
        }
      }
    } else {
      for (let i = 0; i < 4; i++) {
        var k = str.charCodeAt(i)
        for (let j = 0; j < 16; j++) {
          var pow = 1
          for (let m = 15; m > j; m--) {
            pow *= 2
          }
          bt[16 * i + j] = parseInt(k / pow) % 2
        }
      }
    }
    return bt
  },
  bt64ToHex (byteData) {
    var hex = ''
    for (let i = 0; i < 16; i++) {
      var bt = ''
      for (let j = 0; j < 4; j++) {
        bt += byteData[i * 4 + j]
      }
      hex += this.bt4ToHex(bt)
    }
    return hex
  },
  /**
   * generate 16 keys for xor
   *
   * @ignore
   * @param {String}
   *            keyByte
   */
  generateKeys (keyByte) {
    var key = new Array(56)
    var keys = new Array()

    keys[0] = new Array()
    keys[1] = new Array()
    keys[2] = new Array()
    keys[3] = new Array()
    keys[4] = new Array()
    keys[5] = new Array()
    keys[6] = new Array()
    keys[7] = new Array()
    keys[8] = new Array()
    keys[9] = new Array()
    keys[10] = new Array()
    keys[11] = new Array()
    keys[12] = new Array()
    keys[13] = new Array()
    keys[14] = new Array()
    keys[15] = new Array()
    var loop = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1]

    for (let i = 0; i < 7; i++) {
      for (let j = 0, k = 7; j < 8; j++, k--) {
        key[i * 8 + j] = keyByte[8 * k + i]
      }
    }

    for (let i = 0; i < 16; i++) {
      var tempLeft = 0
      var tempRight = 0
      for (let j = 0; j < loop[i]; j++) {
        tempLeft = key[0]
        tempRight = key[28]
        for (let k = 0; k < 27; k++) {
          key[k] = key[k + 1]
          key[28 + k] = key[29 + k]
        }
        key[27] = tempLeft
        key[55] = tempRight
      }
      var tempKey = new Array(48)
      tempKey[0] = key[13]
      tempKey[1] = key[16]
      tempKey[2] = key[10]
      tempKey[3] = key[23]
      tempKey[4] = key[0]
      tempKey[5] = key[4]
      tempKey[6] = key[2]
      tempKey[7] = key[27]
      tempKey[8] = key[14]
      tempKey[9] = key[5]
      tempKey[10] = key[20]
      tempKey[11] = key[9]
      tempKey[12] = key[22]
      tempKey[13] = key[18]
      tempKey[14] = key[11]
      tempKey[15] = key[3]
      tempKey[16] = key[25]
      tempKey[17] = key[7]
      tempKey[18] = key[15]
      tempKey[19] = key[6]
      tempKey[20] = key[26]
      tempKey[21] = key[19]
      tempKey[22] = key[12]
      tempKey[23] = key[1]
      tempKey[24] = key[40]
      tempKey[25] = key[51]
      tempKey[26] = key[30]
      tempKey[27] = key[36]
      tempKey[28] = key[46]
      tempKey[29] = key[54]
      tempKey[30] = key[29]
      tempKey[31] = key[39]
      tempKey[32] = key[50]
      tempKey[33] = key[44]
      tempKey[34] = key[32]
      tempKey[35] = key[47]
      tempKey[36] = key[43]
      tempKey[37] = key[48]
      tempKey[38] = key[38]
      tempKey[39] = key[55]
      tempKey[40] = key[33]
      tempKey[41] = key[52]
      tempKey[42] = key[45]
      tempKey[43] = key[41]
      tempKey[44] = key[49]
      tempKey[45] = key[35]
      tempKey[46] = key[28]
      tempKey[47] = key[31]
      let m = 0
      switch (i) {
        case 0:
          for (m = 0; m < 48; m++) {
            keys[0][m] = tempKey[m]
          }
          break
        case 1:
          for (m = 0; m < 48; m++) {
            keys[1][m] = tempKey[m]
          }
          break
        case 2:
          for (m = 0; m < 48; m++) {
            keys[2][m] = tempKey[m]
          }
          break
        case 3:
          for (m = 0; m < 48; m++) {
            keys[3][m] = tempKey[m]
          }
          break
        case 4:
          for (m = 0; m < 48; m++) {
            keys[4][m] = tempKey[m]
          }
          break
        case 5:
          for (m = 0; m < 48; m++) {
            keys[5][m] = tempKey[m]
          }
          break
        case 6:
          for (m = 0; m < 48; m++) {
            keys[6][m] = tempKey[m]
          }
          break
        case 7:
          for (m = 0; m < 48; m++) {
            keys[7][m] = tempKey[m]
          }
          break
        case 8:
          for (m = 0; m < 48; m++) {
            keys[8][m] = tempKey[m]
          }
          break
        case 9:
          for (m = 0; m < 48; m++) {
            keys[9][m] = tempKey[m]
          }
          break

        case 10:
          for (m = 0; m < 48; m++) {
            keys[10][m] = tempKey[m]
          }
          break
        case 11:
          for (m = 0; m < 48; m++) {
            keys[11][m] = tempKey[m]
          }
          break
        case 12:
          for (m = 0; m < 48; m++) {
            keys[12][m] = tempKey[m]
          }
          break
        case 13:
          for (m = 0; m < 48; m++) {
            keys[13][m] = tempKey[m]
          }
          break
        case 14:
          for (m = 0; m < 48; m++) {
            keys[14][m] = tempKey[m]
          }
          break
        case 15:
          for (m = 0; m < 48; m++) {
            keys[15][m] = tempKey[m]
          }
          break
      }
    }
    return keys
  },
  getBoxBinary (i) {
    var binary = ''
    switch (i) {
      case 0:
        binary = '0000'
        break
      case 1:
        binary = '0001'
        break
      case 2:
        binary = '0010'
        break
      case 3:
        binary = '0011'
        break
      case 4:
        binary = '0100'
        break
      case 5:
        binary = '0101'
        break
      case 6:
        binary = '0110'
        break
      case 7:
        binary = '0111'
        break
      case 8:
        binary = '1000'
        break
      case 9:
        binary = '1001'
        break
      case 10:
        binary = '1010'
        break
      case 11:
        binary = '1011'
        break
      case 12:
        binary = '1100'
        break
      case 13:
        binary = '1101'
        break
      case 14:
        binary = '1110'
        break
      case 15:
        binary = '1111'
        break
    }
    return binary
  },
  bt4ToHex (binary) {
    var hex
    switch (binary) {
      case '0000':
        hex = '0'
        break
      case '0001':
        hex = '1'
        break
      case '0010':
        hex = '2'
        break
      case '0011':
        hex = '3'
        break
      case '0100':
        hex = '4'
        break
      case '0101':
        hex = '5'
        break
      case '0110':
        hex = '6'
        break
      case '0111':
        hex = '7'
        break
      case '1000':
        hex = '8'
        break
      case '1001':
        hex = '9'
        break
      case '1010':
        hex = 'A'
        break
      case '1011':
        hex = 'B'
        break
      case '1100':
        hex = 'C'
        break
      case '1101':
        hex = 'D'
        break
      case '1110':
        hex = 'E'
        break
      case '1111':
        hex = 'F'
        break
    }
    return hex
  }
}