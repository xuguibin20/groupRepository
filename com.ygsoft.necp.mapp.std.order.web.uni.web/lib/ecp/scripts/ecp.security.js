import utils from './ecp.utils'
// 防篡改
var AZ = {
  sign: function (params, method) {
    return SignUtil.dealwithRequestContent('', method, params, true)
  }
}
// 防重放
var CM = {
  sign: function () {
    return SignUtil.getCmSign()
  }
}
var DataReplaceUtil = {
  doReplace: function (text, key) {
    return this.util(text, key)
  },
  util: function (text, key) {
    /**
             * StringBuffer类.
             */
    function StringBuffer () {
      this._strings = new Array()
    }
    StringBuffer.prototype.Append = function (_string) {
      this._strings.push(_string)
    }
    StringBuffer.prototype.ToString = function () {
      return this._strings.join('')
    }
    StringBuffer.prototype.Clear = function () {
      this._strings = []
    }
    /**
             * 矩阵置换工具类.
             */
    var DataReplaceUtils = function (text, encryKey) {
      this.groupedSource = null
      this.text = text
      this.encryKey = encryKey
      this.secretMatrix = this.getTheMatrix()
    }
    /**
             * 根据密钥转换二维矩阵.
             */
    DataReplaceUtils.prototype.getTheMatrix = function () {
      var secretMatrix = new Array(this.encryKey.length)
      var temp = (new Array()).concat(this.encryKey.split(''))
      temp.sort()
      for (var i = 0; i < this.encryKey.length; i++) {
        for (var j = 0; j < this.encryKey.length; j++) {
          if (this.encryKey.split('')[i] == temp[j]) {
            secretMatrix[i] = j
          }
        }
      }
      return secretMatrix
    }
    /**
             * 分组明文.
             */
    DataReplaceUtils.prototype.groupSourceString = function () {
      var sourceLen = this.text.length
      var plaintext = new StringBuffer()
      plaintext.Append(this.text)
      var keyLen = this.encryKey.length
      this.groupedSource = null
      if (sourceLen % keyLen != 0) {
        this.groupedSource = new Array(parseInt(sourceLen / keyLen) + 1)
      } else {
        this.groupedSource = new Array(parseInt(sourceLen / keyLen))
      }
      if (sourceLen % keyLen != 0) {
        for (var i = 0; i < (keyLen - sourceLen % keyLen); i++) {
          plaintext.Append('#')
        }
      }
      sourceLen = plaintext.ToString().length
      for (var i = 6, j = 0; i <= sourceLen; i += keyLen, j++) {
        this.groupedSource[j] = (new Array()).concat(plaintext
          .ToString().substring(i - keyLen, i).split(''))
      }
    }
    /**
             * 明文矩阵置换.
             */
    DataReplaceUtils.prototype.changeSourceMatix = function () {
      var temp = new Array(this.groupedSource.length)
      for (var i = 0; i < this.groupedSource.length; i++) {
        temp[i] = new Array(this.encryKey.length)
        for (var j = 0; j < this.encryKey.length; j++) {
          temp[i][j] = this.groupedSource[i][j]
        }
      }
      for (var i = 0; i < this.groupedSource.length; i++) {
        for (var j = 0; j < this.encryKey.length; j++) {
          this.groupedSource[i][j] = temp[i][this.secretMatrix[j]]
        }
      }
    }
    /**
             * 加密.
             */
    DataReplaceUtils.prototype.encry = function () {
      this.groupSourceString()
      this.changeSourceMatix()
      this.changeSourceMatix()
      var encrytext = new StringBuffer()
      for (var j = 0; j < this.encryKey.length; j++) {
        for (var i = 0; i < this.groupedSource.length; i++) {
          encrytext.Append(this.groupedSource[i][j])
        }
      }
      encrytext.Append('@')
      encrytext.Append(this.text.length)
      return encrytext.ToString()
    }
    return (new DataReplaceUtils(text, key)).encry()
  }
}

var MD5Util = {
  md5: function (str) {
    return this.utils(str)
  },
  utils: function (str) {
    var rotateLeft = function (lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
    }
    var addUnsigned = function (lX, lY) {
      var lX4, lY4, lX8, lY8, lResult
      lX8 = (lX & 0x80000000)
      lY8 = (lY & 0x80000000)
      lX4 = (lX & 0x40000000)
      lY4 = (lY & 0x40000000)
      lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8)
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8)
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8)
      } else {
        return (lResult ^ lX8 ^ lY8)
      }
    }

    var F = function (x, y, z) {
      return (x & y) | ((~x) & z)
    }

    var G = function (x, y, z) {
      return (x & z) | (y & (~z))
    }

    var H = function (x, y, z) {
      return (x ^ y ^ z)
    }

    var I = function (x, y, z) {
      return (y ^ (x | (~z)))
    }

    var FF = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    var GG = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    var HH = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    var II = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }
    /**
             * 转换成单词数组.
             */
    var convertToWordArray = function (string) {
      var lWordCount
      var lMessageLength = string.length
      var lNumberOfWordsTempOne = lMessageLength + 8
      var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64
      var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16
      var lWordArray = Array(lNumberOfWords - 1)
      var lBytePosition = 0
      var lByteCount = 0
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4
        lBytePosition = (lByteCount % 4) * 8
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition))
        lByteCount++
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
      return lWordArray
    }

    /**
             * 字母转十六进制.
             */
    var wordToHex = function (lValue) {
      var WordToHexValue = '', WordToHexValueTemp = '', lByte, lCount
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255
        WordToHexValueTemp = '0' + lByte.toString(16)
        WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2)
      }
      return WordToHexValue
    }

    /**
             * UTF8编码.
             */
    var uTF8Encode = function (string) {
      string = string.replace(/\x0d\x0a/g, '\x0a')
      var output = ''
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n)
        if (c < 128) {
          output += String.fromCharCode(c)
        } else if ((c > 127) && (c < 2048)) {
          output += String.fromCharCode((c >> 6) | 192)
          output += String.fromCharCode((c & 63) | 128)
        } else {
          output += String.fromCharCode((c >> 12) | 224)
          output += String.fromCharCode(((c >> 6) & 63) | 128)
          output += String.fromCharCode((c & 63) | 128)
        }
      }
      return output
    }
    /**
             * 生成随机字符串.
             */
    var randomString = function (len) {
      len = len || 32
      /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1*** */
      var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      var maxPos = $chars.length
      var pwd = ''
      for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    }
    /**
            * 生成MD摘要串.
            */
    function md5 (string) {
      var x = Array()
      var k, AA, BB, CC, DD, a, b, c, d
      var S11 = 7, S12 = 12, S13 = 17, S14 = 22
      var S21 = 5, S22 = 9, S23 = 14, S24 = 20
      var S31 = 4, S32 = 11, S33 = 16, S34 = 23
      var S41 = 6, S42 = 10, S43 = 15, S44 = 21
      string = uTF8Encode(string)
      x = convertToWordArray(string)
      a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476
      for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821)
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244)
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314)
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391)
        a = addUnsigned(a, AA)
        b = addUnsigned(b, BB)
        c = addUnsigned(c, CC)
        d = addUnsigned(d, DD)
      }
      var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
      // 前后各随机生成四个字符.
      tempValue = randomString(4) + tempValue + randomString(4)
      // 字符串倒序.
      tempValue = tempValue.split('').reverse().join('')
      return tempValue.toLowerCase()
    }
    return md5(str)
  }
}

var SignUtil = {
  getEncryKey: function () {
    var s_id = utils.getCookie('ecpDataContext.tokenId')
    if (!s_id) {
      s_id = utils.getCookie('ecp_token')
    }
    var key = 'cipher'
    if (s_id && s_id.length > 0) {
      var newKey = ''
      // 去掉重复字符
      for (var i = 0; i < s_id.length; i++) {
        if (newKey.indexOf(s_id[i]) == -1) {
          newKey += s_id[i]
        }
      }
      // 截取前6位作为密钥
      if (newKey.length >= 6) {
        key = newKey.substring(0, 6)
      }
    }
    return key
  },
  dealwithRequestContent: function (_signURI, _method, _params, isEnc) {
    var queryContent = {}
    var urlPattern = _signURI.split('?')
    var uri = urlPattern[0]
    var keyVal, paramVal, encryptUrl = ''
    var key = this.getEncryKey()
    if (urlPattern.length > 1) {
      var params = urlPattern[1].split('&')
      for (var i = 0; i < params.length; i++) {
        if (params[i].indexOf('=') != -1) {
          keyVal = params[i].split('=')
          try {
            paramVal = decodeURIComponent(keyVal[1])
          } catch (e) {
            paramVal = keyVal[1]
          }
          if (isEnc) {
            // 超过4000字符，不加密
            if (paramVal && paramVal.length <= 4000) {
              queryContent[keyVal[0]] = DataReplaceUtil.doReplace(paramVal, key)
            } else {
              queryContent[keyVal[0]] = paramVal
            }
            if (encryptUrl.length != 0) {
              encryptUrl = encryptUrl + '&'
            }
            encryptUrl = encryptUrl + keyVal[0] + '=' + encodeURIComponent(queryContent[keyVal[0]])
          } else {
            queryContent[keyVal[0]] = paramVal
          }
        }
      }
    }
    if (_params) {
      var encryptedData = {}
      for (var op in _params) {
        encryptedData[op] = _params[op]
        if (typeof (_params[op]) === 'undefined') continue
        try {
          paramVal = decodeURIComponent(_params[op])
        } catch (e) {
          paramVal = _params[op]
        }
        if (isEnc) {
          if (paramVal && paramVal.length <= 4000) {
            queryContent[op] = DataReplaceUtil.doReplace(paramVal, key)
          } else {
            queryContent[op] = paramVal
          }
          encryptedData[op] = queryContent[op]
        } else {
          queryContent[op] = paramVal
        }
      }
    }
    var _paramNames = new Array()
    for (var prop in queryContent) {
      _paramNames.push(prop)
    }
    _paramNames.sort()
    var queryString = ''
    // $.each(_paramNames, function(n, value) {
    _paramNames.forEach(function (value, n) {
      // 请求参数字符串以&结尾
      if (queryContent[value] != null && queryContent[value] != 'undefined') {
        if (queryString.length != 0) {
          queryString = queryString + '&'
        }
        queryString = queryString + value + '=' + queryContent[value]
      }
    })
    if (uri.indexOf('?') > -1) {
      uri = uri + '&'
    } else {
      uri = uri + '?'
    }
    if (encryptUrl.length > 0) {
      encryptUrl = uri + encryptUrl
      uri = encryptUrl
    } else {
      encryptUrl = _signURI
    }
    // 组合最终的待签名字符串
    var _tokenId = utils.getCookie('ecp_token') || utils.getCookie('ecpDataContext.tokenId') || ''
    var _signString = _method.toUpperCase() + _tokenId + queryString
    if (_signString.length > 5000) {
      _signString = _signString.substr(0, 5000)
    }
    _signString = _signString.replace(/\n|\r/ig, '')
    // window.console && console.info(_signString);
    return {
      AZ: MD5Util.md5(_signString),
      RequestURI: encryptUrl,
      encryptedParam: encryptedData
    }
  },
  getCmSign: function () {
    var rand = parseInt(Math.random() * 1000000, 10) + ''
    if (rand.length < 6) {
      for (var i = rand.length; i < 6; i++) {
        rand += '0'
      }
    }
    var t = (new Date()).getTime()
    var cm = rand + ',' + t
    var key = this.getEncryKey()
    if (key) {
      return DataReplaceUtil.doReplace(cm, key)
    }
  }
}
var Security = {
  az: AZ,
  cm: CM,
  isSecurity: function () {
    // var res = window._ecp_remote_security_state === true
	var res = getApp().globalData._ecp_remote_security === true
    // window.console.log("security state:" + res);
    return res
  }
}

// if (window._ecp_remote_security == null) {
//   window._ecp_remote_security = Security
// }

export default Security
