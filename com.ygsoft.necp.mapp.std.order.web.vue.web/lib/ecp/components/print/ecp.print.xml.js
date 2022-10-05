/*
 * Copyright 2010-2020 广东远光软件股份有限公司 All Rights Reserved.
 *
 * @describe 通用打印xml节点  @author Qinz
 * @version 2019-10-10
 * @see
 * @since javascript ES5
 */
function PrintXmlNode (xmlDoc, NodeName, NodeValue, NodeId) {
  this.name = NodeName
  this.value = NodeValue
  this.id = NodeId
  this.type = 'node'
  this.index = null
  this.pNode = null

  this.attribs = {}
  this.nodes = {}
  this.nodeAry = []

  this.xmlDoc = xmlDoc

  if (NodeId != null) {
    this.attribs['ID'] = NodeId
  }
}

PrintXmlNode.prototype.length = function () {
  return this.nodeAry.length
}

PrintXmlNode.prototype.each = function (func) {
  if (typeof func === 'function') {
    var len = this.nodeAry.length
    for (var i = 0; i < len; i++) {
      var cn = this.nodeAry[i]
      func(cn, cn.name, cn.value)
    }
  }
}

PrintXmlNode.prototype.isEmpty = function (value) {
  return value == null || value === ''
}

PrintXmlNode.prototype.cloneNode = function (pNode, noadd) {
  if (noadd === false && this._add === true) return null
  // 复制
  var cn = new PrintXmlNode(this.xmlDoc, this.name, this.value, this.id)
  cn.pNode = pNode
  cn.setAttrib(this.attribs)
  var tn
  for (var name in this.nodes) {
    if (this.nodes[name].type === 'array') {
      for (var i = 0; i < this.nodes[name]['array'].length; i++) {
        tn = this.nodes[name]['array'][i].cloneNode(cn, noadd)
        if (tn != null) {
          cn.addNode(tn)
        }
      }
    } else {
      tn = this.nodes[name].cloneNode(cn, noadd)
      if (tn != null) {
        cn.addNode(tn)
      }
    }
  }
  tn = null
  return cn
}

PrintXmlNode.prototype.addAryNode = function (ary, node, index) {
  if (ary == null || ary['array'] == null || node == null) {
    return
  }
  var len = ary['array'].length
  if (index != null && index >= 0 && index < len) {
    for (var i = len; i > index; i--) {
      ary['array'][i] = ary['array'][i - 1]
      ary['array'][i].index = i
    }
    ary['array'][index] = node
    node.index = index
    if (node.id != null && ary['id'] != null) {
      ary['id'][node.id] = node
    }
  } else {
    var ins = ary['array'].length
    ary['array'][ins] = node
    node.index = ins
    if (node.id != null && ary['id'] != null) {
      ary['id'][node.id] = node
    }
    ins = null
  }
}

PrintXmlNode.prototype.addNode = function (name, value, id, index, aryIndex) {
  if (typeof (name) === 'object') {
    if (value != null) {
      name.value = value
    }
    value = name
    name = value.name
    id = value.id
  }
  if (!this.isEmpty(name)) {
    var rs
    if (value != null) {
      if (this.nodes[name] == null) {
        if (typeof (value) === 'object') {
          this.nodes[name] = value
          value.index = 0
          this.nodeAry.push(value)
        } else {
          var nn = new PrintXmlNode(this.xmlDoc, name, value, id)
          this.nodes[name] = nn
          nn.index = 0
          // store in Ary
          this.nodeAry.push(nn)
        }
        rs = this.nodes[name]
      } else {
        var on = this.nodes[name]
        if (on.type === 'node') {
          var ary = {}
          ary['type'] = 'array'
          ary['array'] = []
          ary['id'] = {}
          this.addAryNode(ary, on)
          this.nodes[name] = ary
          if (typeof (value) === 'object') {
            this.addAryNode(ary, value, index)
            if (index != null && index < this.nodeAry.length) {
              if (aryIndex != null) {
                index = aryIndex
              }
              this.nodeAry.splice(index, 0, value)
            } else {
              this.nodeAry.push(value)
            }
            rs = value
          } else {
            // eslint-disable-next-line no-redeclare
            var nn = new PrintXmlNode(this.xmlDoc, name, value, id)
            this.addAryNode(ary, nn, index)
            if (index != null && index < this.nodeAry.length) {
              if (aryIndex != null) {
                index = aryIndex
              }
              this.nodeAry.splice(index, 0, nn)
            } else {
              this.nodeAry.push(nn)
            }
            rs = nn
          }
          ary = null
        } else {
          // eslint-disable-next-line no-redeclare
          var ary = this.nodes[name]
          if (typeof (value) === 'object') {
            this.addAryNode(ary, value, index)
            if (index != null && index < this.nodeAry.length) {
              if (aryIndex != null) {
                index = aryIndex
              }
              this.nodeAry.splice(index, 0, value)
            } else {
              this.nodeAry.push(value)
            }
            rs = value
          } else {
            // eslint-disable-next-line no-redeclare
            var nn = new PrintXmlNode(this.xmlDoc, name, value, id)
            this.addAryNode(ary, nn, index)
            if (index != null && index < this.nodeAry.length) {
              if (aryIndex != null) {
                index = aryIndex
              }
              this.nodeAry.splice(index, 0, nn)
            } else {
              this.nodeAry.push(nn)
            }
            rs = nn
          }
          ary = null
        }
        on = null
      }
    } else {
      if (this.nodes[name] == null) {
        // eslint-disable-next-line no-redeclare
        var nn = new PrintXmlNode(this.xmlDoc, name, undefined, id)
        this.nodes[name] = nn
        nn.index = 0
        this.nodeAry.push(nn)
        rs = this.nodes[name]
      } else {
        // eslint-disable-next-line no-redeclare
        var on = this.nodes[name]
        if (on.type === 'node') {
          // eslint-disable-next-line no-redeclare
          var ary = {}
          ary['type'] = 'array'
          ary['array'] = []
          ary['id'] = {}
          this.addAryNode(ary, on)
          this.nodes[name] = ary
          if (typeof (value) === 'object') {
            this.addAryNode(ary, value, index)
            this.nodeAry.push(value)
            rs = value
          } else {
            // eslint-disable-next-line no-redeclare
            var nn = new PrintXmlNode(this.xmlDoc, name, value, id)
            this.addAryNode(ary, nn, index)
            this.nodeAry.push(nn)
            rs = nn
          }
          ary = null
        } else {
          // eslint-disable-next-line no-redeclare
          var ary = this.nodes[name]
          if (typeof (value) === 'object') {
            this.addAryNode(ary, value, index)
            this.nodeAry.push(value)
            rs = value
          } else {
            // eslint-disable-next-line no-redeclare
            var nn = new PrintXmlNode(this.xmlDoc, name, value, id)
            this.addAryNode(ary, nn, index)
            this.nodeAry.push(nn)
            rs = nn
          }
          ary = null
        }
        on = null
      }
    }
    rs.pNode = this
    return rs
  }
}

PrintXmlNode.prototype.setAttrib = function (name, value, dfNode) {
  var re = null
  if (typeof (name) === 'object') {
    for (var n in name) {
      this.attribs[n] = name[n]
      if (n === 'dataField') {
        if (dfNode == null) {
          var dfs
          var pn = this.pNode
          var dfj = null
          while (pn != null && dfs == null) {
            dfs = pn.getAttrib('dataFields')
            if (dfs != null) {
              dfj = pn._dataFields
            }
            pn = pn.pNode
          }
          if (dfj != null) {
            dfNode = dfj
          }
          if (dfs == null) {
            re = this.xmlDoc.addDataField(name[n], this, dfNode)
          } else {
            re = this.xmlDoc.addDataField(dfs + '/' + name[n], this, dfNode)
          }
        } else {
          re = this.xmlDoc.addDataField(name[n], this, dfNode)
        }
      } else if (n === 'dataFields') {
        re = this.xmlDoc.addDataFields(name[n], this)
      }
    }
  } else {
    this.attribs[name] = value
    if (name === 'dataField') {
      if (dfNode == null) {
        // eslint-disable-next-line no-redeclare
        var dfs = null
        // eslint-disable-next-line no-redeclare
        var pn = this.pNode
        while (pn != null && dfs == null) {
          dfs = pn.getAttrib('dataFields')
          pn = pn.pNode
        }
        if (dfs == null) {
          re = this.xmlDoc.addDataField(value, this, dfNode)
        } else {
          re = this.xmlDoc.addDataField(dfs + '/' + value, this, dfNode)
        }
      } else {
        re = this.xmlDoc.addDataField(value, this, dfNode)
      }
    } else if (name === 'dataFields') {
      re = this.xmlDoc.addDataFields(value, this)
    }
  }
  return re
}

PrintXmlNode.prototype.getAttrib = function (name) {
  return this.attribs[name]
}

PrintXmlNode.prototype.getAttribs = function () {
  return this.attribs
}

PrintXmlNode.prototype.getNodeByIndex = function (name, index) {
  if (this.type === 'array') {
    return this.nodes['name'][index]
  }
}

PrintXmlNode.prototype.getNodes = function () {
  return this.nodes
}

PrintXmlNode.prototype.getPath = function () {
  var result = ''
  var cn = this
  while (cn != null) {
    if (result !== '') {
      result = '/' + result
    }
    if (cn.id != null) {
      result = cn.name + '&' + cn.id + result
    } else if (cn.index != null) {
      result = cn.name + '&' + cn.index + result
    } else {
      result = cn.name + result
    }
    cn = cn.pNode
  }
  return result
}

PrintXmlNode.prototype.getNode = function (path) {
  if (typeof (path) !== 'object') {
    // eslint-disable-next-line no-useless-escape
    path = path.split(/[\\\/]/)
  }
  var rn = null
  if (path.length > 0) {
    var key, id
    var pAry = path[0].split('&')
    key = pAry[0]
    if (pAry.length === 2) {
      id = pAry[1]
    }
    rn = this.nodes[key]
    if (rn != null && rn.type === 'array') {
      if (!this.isEmpty(id)) {
        if (isNaN(id)) {
          var crn = rn['id'][id]
          if (crn == null) {
            for (var ri = 0, rilen = rn['array'].length; ri < rilen; ri++) {
              if (rn['array'][ri].attribs.ID === id) {
                rn = rn['array'][ri]
                break
              }
            }
          } else {
            rn = crn
          }
        } else {
          if (id >= 0 && id < rn['array'].length) {
            rn = rn['array'][id]
          } else {
            rn = rn['id'][id]
          }
        }
      } else {
        return rn['array']
      }
    }
  }
  if (rn != null && path.length > 1 && rn.type !== 'array') {
    path.shift()
    return rn.getNode(path)
  } else {
    return rn
  }
}

PrintXmlNode.prototype.delNode = function (path, notFree) {
  var dn = path
  if (typeof path === 'string') {
    dn = this.getNode(path)
  }
  if (dn != null) {
    var pn = dn.pNode
    // json结构删除
    if (pn.type === 'array') {
      var pAry = pn['array']
      var dindex = -1
      for (var i = 0; i < pAry.length; i++) {
        if (pAry[i].id === dn.id) {
          dindex = i
          break
        }
      }
      if (dindex >= 0) {
        pAry.splice(dindex, 1)
      }
      var pids = pn['id']
      delete pids['id']
      pAry = null
      pids = null
    } else {
      delete pn.nodes[dn.name]
    }
    // 数组结构删除
    var pnAry = pn.nodeAry
    // eslint-disable-next-line no-redeclare
    var dindex = -1
    var cn = null
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < pnAry.length; i++) {
      cn = pnAry[i]
      if (cn.name === dn.name && cn.id === dn.id) {
        dindex = i
        break
      }
    }
    if (dindex >= 0) {
      pnAry.splice(dindex, 1)
    }
    cn = null
    pnAry = null
    if (notFree !== true) {
      dn.free()
    }
  }
  dn = null
}

PrintXmlNode.prototype.toString = function (template) {
  var result = []
  var i = 0
  result[i++] = '<'
  result[i++] = this.name
  for (var name in this.attribs) {
    if (!this.isEmpty(this.attribs[name]) && typeof this.attribs[name] !== 'function') {
      if (template === true || (name !== 'dataField' && name !== 'dataFields')) {
        result[i++] = ' ' + name + '="' + this.attribs[name] + '"'
      }
    }
  }
  result[i++] = '>'
  // if(template == true) {
  result[i - 1] += '\n'
  // }
  var hasNode = false
  if (!this.isEmpty(this.value)) {
    result[i - 1] = '>'
    var cv = this.value
    if (template) {
      if (typeof cv === 'string') {
        cv = cv.replace(/<|>/g, function (key) {
          if (key === '<') return '&lt;'
          else return '&gt;'
        })
      }
    }
    if (cv !== '') {
      result[i++] = '<![CDATA[' + cv + ']]>'
    } else {
      result[i++] = this.value
    }
    hasNode = true
  }
  for (var j = 0, len = this.nodeAry.length; j < len; j++) {
    result[i] = this.nodeAry[j].toString(template)
    result[i] += '\n'
    i++
    hasNode = true
  }
  /*
       for(var name in this.nodes) {
               if(this.nodes[name] != null) {
                       if(this.nodes[name].type == "node") {
                               result[i++] = this.nodes[name].toString(template);
                               //if(template == true)
                                 result[i - 1] += "\n";
                               hasNode = true;
                     } else {
                         for(var j = 0; j < this.nodes[name]["array"].length; j++) {
                              result[i++] = this.nodes[name]["array"][j].toString(template);
                              //if(template == true) {
                                result[i - 1] += "\n";
                              //}
                              hasNode = true;
                         }
                     }
               }
       }
       */
  if (hasNode) {
    result[i++] = '</'
    result[i++] = this.name
    result[i++] = '>'
  } else {
    result[i - 1] = '/>'
  }
  return result.join('')
}

PrintXmlNode.prototype.free = function () {
  var name
  for (name in this.attribs) {
    this.attribs[name] = null
  }
  this.attribs = null

  for (name in this.nodes) {
    if (this.nodes[name].type === 'node') {
      this.nodes[name].free()
      this.nodes[name] = null
    } else {
      var cnodeAry = this.nodes[name]['array']
      if (cnodeAry != null) {
        for (var j = 0; j < this.nodes[name]['array'].length; j++) {
          this.nodes[name]['array'][j].free()
          this.nodes[name]['array'][j] = null
        }
      }
      cnodeAry = null
      this.nodes[name]['array'] = null
      this.nodes[name] = null
    }
  }
  this.nodes = null
  this.nodeAry = null

  this.name = null
  this.value = null
  this.id = null
  this.type = null
  this.index = null
  this.pNode = null
  this.xmlDoc = null
}

function PrintXmlDoc () {
  this.attribs = {'version': '1.0', 'encoding': 'gb2312'}
  this.topNode = {}
  this.dataFields = []
  this.dataField = {}
  this.pnode = []
  this.dataFieldsIndex = 0
}

PrintXmlDoc.prototype.isEmpty = function (value) {
  return value == null || value === ''
}

PrintXmlDoc.prototype.addDataField = function (name, node, dfNode) {
  // eslint-disable-next-line no-useless-escape
  var nameAry = name.split(/[\\\/]/g)
  if (nameAry.length === 1 && dfNode == null) {
    if (this.dataField[nameAry[0]] == null) {
      this.dataField[nameAry[0]] = node
    } else {
      var cdf = this.dataField[nameAry[0]].childDataField
      if (cdf == null) {
        cdf = []
        this.dataField[nameAry[0]].childDataField = cdf
      }
      cdf.push(node)
    }
    return true
  } else {
    var nalen = nameAry.length
    if (dfNode == null && nalen === 2) {
      dfNode = this.getDataFields(nameAry[0])
    }
    if (dfNode != null) {
      if (dfNode['cnode'] == null) {
        dfNode['cnode'] = {}
      }
      if (dfNode['cnode'][nameAry[nalen - 1]] == null) {
        dfNode['cnode'][nameAry[nalen - 1]] = node
      } else {
        // eslint-disable-next-line no-redeclare
        var cdf = dfNode['cnode'][nameAry[nalen - 1]].childDataField
        if (cdf == null) {
          cdf = []
          dfNode['cnode'][nameAry[nalen - 1]].childDataField = cdf
        }
        cdf.push(node)
      }
      return true
    }
    return false
  }
}

PrintXmlDoc.prototype.setDataField = function (name, value) {
  if (this.dataField[name] != null) {
    this.dataField[name].value = value
    var cdf = this.dataField[name].childDataField
    if (cdf != null) {
      for (var i = 0, len = cdf.length; i < len; i++) {
        cdf[i].value = value
      }
    }
  }
}

PrintXmlDoc.prototype.addDataFields = function (name, node) {
  var dfs = {
    'name': name,
    'node': node,
    'index': this.dataFieldsIndex++
  }
  node.dataFields = dfs
  this.dataFields.push(dfs)
  node._dataFields = dfs
  return dfs
}

PrintXmlDoc.prototype.getDataFields = function (name, index) {
  var rn = null
  for (var i = 0, len = this.dataFields.length; i < len; i++) {
    if (this.dataFields[i].name === name) {
      if (typeof index === 'number' && index > 0) {
        index--
      } else {
        rn = this.dataFields[i]
        break
      }
    }
  }
  return rn
}

PrintXmlDoc.prototype._setNodeValue = function (cnode, val) {
  if (val != null && typeof val === 'string' && val.indexOf('<img') >= 0) {
    // 如果有图片
    // eslint-disable-next-line no-useless-escape
    var src = val.match(/src='([^<> ]+)'[ \/]*>/)
    if (src != null && src.length > 0) {
      src = src[1]
      var imgNode = cnode.addNode('Img')
      var x = 2
      imgNode.setAttrib({'X': x, 'Y': 2, 'Height': 16, 'Width': 18})
      if (src.indexOf('http://') < 0) {
        if (src.indexOf('/') !== 0) {
          src = '/' + src
        }
        src = 'http://127.0.0.1:9080' + src
      }
      imgNode.addNode('Value', src)
      imgNode = null
    } else {
      cnode.value = val
    }
  } else if (typeof val !== 'function') {
    cnode.value = val
    for (var i = cnode.nodeAry.length - 1; i >= 0; i--) {
      cnode.delNode(cnode.nodeAry[i], true)
    }
  }
}

PrintXmlDoc.prototype.setDataFields = function (name, nodes, pnode) {
  var dfs = name
  if (typeof name === 'string') {
    dfs = this.getDataFields(name)
  }
  if (dfs == null) {
    return false
  }
  if (pnode == null) {
    pnode = dfs
  }
  var colWidths = pnode.node.pNode.getAttrib('TdWidths')
  if (colWidths == null || colWidths === '') {
    colWidths = []
  } else if (typeof colWidths === 'string') {
    colWidths = colWidths.split(/,/g)
  }
  for (var cname in nodes) {
    var citem = nodes[cname]
    if (typeof citem === 'object') {
      // 支持深入二级取数.
      for (var ccname in citem) {
        var cnode = pnode['cnode'][cname + '.' + ccname]
        if (cnode == null) {
          cnode = pnode['cnode'][(cname + '.' + ccname).toUpperCase()]
        }
        if (cnode != null) {
          var val = citem[ccname]
          this._setNodeValue(cnode, val)
        }
      }
    } else {
      // eslint-disable-next-line no-redeclare
      var cnode = pnode['cnode'][cname]
      if (cnode == null) {
        cnode = pnode['cnode'][cname.toUpperCase()]
      }
      if (cnode != null) {
        // eslint-disable-next-line no-redeclare
        var val = nodes[cname]
        this._setNodeValue(cnode, val)
      }
    }
  }
  return true
}

PrintXmlDoc.prototype.appendDataFields = function (name) {
  var dfs = name
  if (typeof name === 'string') {
    dfs = this.getDataFields(name)
    if (dfs == null) {
      return false
    }
  }
  var an = dfs['node']
  if (an != null) {
    var nn = an.cloneNode()
    if (an.pNode != null) {
      var index = 0
      if (an.index != null) {
        index = an.index
      }
      an.pNode.addNode(nn, undefined, undefined, index + 1)
    }
    nn._add = true
    dfs['node'] = nn
    var nary = nn.nodeAry
    var dfcn = dfs['cnode']
    for (var i = 0, len = nary.length; i < len; i++) {
      var cn = nary[i]
      cn.value = ''
      var sdf = cn.getAttrib('dataField')
      if (dfcn[sdf] != null) {
        dfcn[sdf] = cn
      }
    }
  }
  return dfs['node']
}

PrintXmlDoc.prototype.cloneTableNode = function (dataFields) {
  var pnode = dataFields.node.pNode
  if (pnode != null && pnode.pNode != null) {
    var odfs = pnode.xmlDoc.dataFields
    var oc = odfs.length
    var ntab = pnode.cloneNode(pnode.pNode, false)
    var aryIndex = 0
    for (var i = 0, ilen = pnode.pNode.nodeAry.length; i < ilen; i++) {
      if (pnode.pNode.nodeAry[i] === pnode) {
        aryIndex = i
        break
      }
    }
    pnode.pNode.addNode(ntab, null, null, pnode.index + 1, aryIndex + 1)
    var redf = []
    // eslint-disable-next-line no-redeclare
    for (var i = oc, ilen = odfs.length; i < ilen; i++) {
      redf.push(odfs[i])
    }
    return redf
  } else {
    return null
  }
}

PrintXmlDoc.prototype.setAttrib = function (name, value) {
  if (typeof (name) === 'object') {
    var narb
    for (var n in name) {
      narb = name[n]
      if (!this.isEmpty(narb)) {
        this.attribs[n] = narb
      }
    }
    narb = null
  } else {
    if (!this.isEmpty(value)) {
      this.attribs[name] = value
    }
  }
}

PrintXmlDoc.prototype.addNode = function (name, value, id) {
  var xn = new PrintXmlNode(this, name, value, id)
  this.topNode[xn.name] = xn
  return xn
}

PrintXmlDoc.prototype.getNode = function (path) {
  if (typeof (path) !== 'object') {
    // eslint-disable-next-line no-useless-escape
    path = path.split(/[\\\/]/)
  }
  var rn = null
  if (path.length > 0) {
    var key, id
    var pAry = path[0].split('&')
    key = pAry[0]
    if (pAry.length === 2) {
      id = pAry[1]
    }
    rn = this.topNode[key]
    if (rn != null && rn.type === 'array') {
      if (!this.isEmpty(id)) {
        if (isNaN(id)) {
          rn = rn['id'][id]
        } else {
          if (id >= 0 && id < rn['array'].length) {
            rn = rn['array'][id]
          } else {
            rn = rn['id'][id]
          }
        }
      } else {
        return rn['array']
      }
    }
  }
  if (rn != null && path.length > 1 && rn.type !== 'array') {
    path.shift()
    return rn.getNode(path)
  } else {
    return rn
  }
}

PrintXmlDoc.prototype.trim = function (str) {
  if (str != null && str !== '' && typeof str === 'string') {
    str = str.replace(/(^\s*)|(\s*$)/g, '')
  }
  return str
}

PrintXmlDoc.prototype.initXml = function (nodeAry, bindex, callBack) {
  // eslint-disable-next-line no-useless-escape
  var atbRe = /((?!\")[^<>=]+(?=\"))|([^<>=\"\/ ]+)/g
  /// ((?!\")?[^<>\"=\/ ]+(?!\")?)/g; 打印机带空格符的时候有问题.
  // ((?!\")?[\w.#,\\]+(?!\")?)/g;
  // eslint-disable-next-line no-useless-escape
  var atbTxt = /<\!(--)?\[CDATA\[([^<>]+)\]\](\1)?>/g
  var atbAry
  var i = bindex
  var curNode, tmpNode
  var nlen = nodeAry.length
  var clen = nlen + 4000
  var dataFields = null
  for (; i < nlen && i < clen; i++) {
    var cstr = nodeAry[i]
    // eslint-disable-next-line no-useless-escape
    if (/<\!(--)?\[CDATA\[/.test(cstr)) {
      cstr = cstr.replace(atbTxt, '$2')
    }
    if (cstr.indexOf('</') === 0) {
      var cnode = this.pnode.pop()
      if (dataFields != null && cnode === dataFields.node) {
        dataFields = null
      }
    } else if (cstr.indexOf('<') >= 0) {
      if (cstr.indexOf('<!--') >= 0) {
        // tmpNode = this.pnode.pop();
        // curNode = tmpNode.addNode(cstr);
        // this.pnode.push(tmpNode);
      } else {
        atbAry = cstr.match(atbRe)
        if (atbAry != null && atbAry.length > 0) {
          if (this.pnode.length === 0) {
            curNode = new PrintXmlNode(this, atbAry[0])
            this.topNode[curNode.name] = curNode
          } else {
            tmpNode = this.pnode.pop()
            curNode = tmpNode.addNode(atbAry[0])
            this.pnode.push(tmpNode)
          }
          var arbNode = null
          for (var j = 1; j < atbAry.length; j = j + 2) {
            arbNode = curNode.setAttrib(atbAry[j], atbAry[j + 1], dataFields)
            if (arbNode != null && typeof arbNode === 'object') {
              dataFields = arbNode
            }
          }
          if (atbAry != null && cstr.lastIndexOf('/>') < 0) {
            this.pnode.push(curNode)
          }
        }// IF
      }// ELSE
    } else if (cstr !== '\n' && cstr != null && this.trim(cstr) !== '') {
      curNode = this.pnode.pop()
      curNode.value = cstr.replace(/&lt;|&gt;/g,
        function (key) {
          if (key === '&lt;') {
            return '<'
          } else {
            return '>'
          }
        })
      this.pnode.push(curNode)
    }
  }
  if (i < nlen) {
    var _owner = this
    setTimeout(function () { _owner.initXml(nodeAry, i, callBack) }, 0)
  } else {
    if (typeof (callBack) === 'function') {
      callBack()
    }
  }
}

PrintXmlDoc.prototype.setXml = function (xmlStr, callBack) {
  // eslint-disable-next-line no-useless-escape
  var atbRe = /((?!\")?[^<>\"= ]+(?!\")?)/g
  // ((?!\")?[\w.#,]+(?!\")?)/g;
  var noRe = /((?!>)[^<>]+(?=<))|(<(\/)?[^<>]+(\/)?>)/g
  var strAry = xmlStr.match(noRe)
  var bindex = 0
  if (strAry != null && strAry.length > 0) {
    var str = strAry[bindex]

    if (str != null && str.indexOf('<?') >= 0) {
      var abAry = str.match(atbRe)
      if (abAry != null && abAry.length > 0) {
        for (var i = 1; i < abAry.length - 1; i = i + 2) {
          this.attribs[abAry[i]] = abAry[i + 1]
        }
      }
      bindex++
    }
    this.initXml(strAry, bindex, callBack)
  } else if (typeof callBack === 'function') {
    callBack()
  }
}

PrintXmlDoc.prototype.free = function () {
  this.setEmpty()
}

PrintXmlDoc.prototype.setEmpty = function () {
  var name
  for (name in this.topNode) {
    this.topNode[name].free()
    this.topNode[name] = null
  }
  for (name in this.dataFields) {
    this.dataFields[name] = null
  }
  for (name in this.dataField) {
    this.dataField[name] = null
  }
  this.topNode = {}
  this.dataFields = []
  this.dataField = {}
  this.pnode = []
}

PrintXmlDoc.prototype.toString = function (template) {
  var result = []
  var i = 0
  result[i++] = '<?xml'
  for (var name in this.attribs) {
    if (typeof this.attribs[name] !== 'function') {
      result[i++] = ' ' + name + '="' + this.attribs[name] + '"'
    }
  }
  result[i++] = '?>'
  if (template === true) {
    result[i - 1] += '\n'
  }
  for (name in this.topNode) {
    if (typeof this.topNode[name] !== 'function') {
      result[i++] = this.topNode[name].toString(template)
    }
  }
  return result.join('')
}

export default PrintXmlDoc
