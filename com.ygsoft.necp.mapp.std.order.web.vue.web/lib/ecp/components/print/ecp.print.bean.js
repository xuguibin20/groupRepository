import Jclass from './ecp.qzz.base'
import Jobject from './ecp.qzz.object'
import PrintXmlDoc from './ecp.print.xml'
import utils from 'ecp.utils'

var ecp = require('../../../../ecpconfig')

var servletName = ecp.ecp.source.printServlet[ecp.ecp.config.name]
if (window.console) {
  window.console.info(servletName)
}

var PrintBean = Jclass(Jobject, {

  _create: function (option) {
    this.base()
    this.xmlDoc = new PrintXmlDoc()
    this.ReportNode = this.xmlDoc.addNode('Report')
    this.margins = {}
    this.PageSettings = this.ReportNode.addNode('PageSettings')
    this.PageNode = this.ReportNode.addNode('Page')
    this.copies = 1
    this.printAllTable = false
    this.landScape = false
    this.formulaPrint = false
    this.pxPerMM = 3.72
    this.utils = utils

    // 宽度、高度
    this.pswidth = 210
    this.psheight = 297
    var cZoomValue = 1
    this.heightScale = 1.65
    this.widthScale = 0.75
    this.maxWidth = parseInt((parseInt(this.pswidth, 10) - 8 - 8) * this.pxPerMM / cZoomValue, 10)
    this.maxHeight = parseInt((parseInt(this.psheight, 10) - 8 - 8) * this.pxPerMM / cZoomValue, 10)

    // 初始化计算高度对象
    this._textSpan = document.createElement('span')
    this._textSpan.style.top = '0px'
    this._textSpan.style.left = '100px'
    this._textSpan.style.position = 'absolute'
    this._textSpan.style.borderWidth = '1px'
    this._textSpan.style.wordWrap = 'break-word'
    this._textSpan.style.display = 'none'
    this._textSpan.style.zIndex = '10000'
    document.body.appendChild(this._textSpan)
  },
  reset: function () {
    this.xmlDoc.setEmpty()
    this.ReportNode = this.xmlDoc.addNode('Report')
    this.margins = {}
    this.PageSettings = this.ReportNode.addNode('PageSettings')
    this.PageNode = this.ReportNode.addNode('Page')
  },
  /**
   * 把页面模板添加上来.
   */
  addPageNode: function (pageNode) {
    this.ReportNode.delNode('Page')
    this.PageNode = this.ReportNode.addNode(pageNode)
  },
  addWatermarkNode: function (watermarkNode) {
    this.ReportNode.delNode('WaterMark')
    this.Watermark = this.ReportNode.addNode(watermarkNode)
  },
  _getFormatStr: function (value, formatStr) {
    var formatStyle = formatStr
    if (formatStyle != null && formatStyle !== '') {
      var res = ''
      var ods = value + ''
      var vlen = ods.length
      var si = 0
      var slen = formatStyle.length
      for (; si < slen && si < vlen; si++) {
        var cat = formatStyle.charAt(si)
        if (cat === '#') {
          res += ods.charAt(si)
        } else {
          res += cat
        }
      }
      for (; si < vlen; si++) {
        res += ods.charAt(si)
      }
      return res
    } else {
      return value
    }
  },
  /**
   * 获取text函数.
   */
  _getText: function (dom) {
    var re
    if (typeof dom.html === 'function') {
      re = dom.html()
    } else {
      re = dom.innerHTML
    }
    var res = {'&lt;': '<', '&gt;': '>', '&nbsp;': ' '}
    re = re.replace(/<([^<>]+)>|&([a-z]+)(;)?/g, function (key, $1, $2) {
      key = res[key]
      if (key == null) {
        key = ''
      }
      return key
    })
    return re
  },
  _getTdWidth: function (tdNode) {
    if (tdNode.name === 'Td') {
      var cws = tdNode.pNode.pNode.getAttrib('TdWidths')
      var cwAry = cws
      if (typeof cwAry === 'string') {
        cwAry = cwAry.split(',')
      }
      var si = tdNode.index
      var sw = parseInt(cwAry[si])
      var csp = tdNode.getAttrib('ColSpan')
      if (csp != null) {
        csp = parseInt(csp)
        for (var i = si + 1, len = cwAry.length; i < len && i < si + csp; i++) {
          sw += parseInt(cwAry[i])
        }
      }
      cwAry = null
      return sw
    }
    return 0
  },
  _getTextWidthExt: function (str, size, weight, family) {
    // 宋体
    // 每个字占用的宽度
    var sizew = 0.75
    // 每个字占用的行高
    // var sizeh = 1.65
    var sl = this.strLen(str)
    return sl * size * sizew
  },
  /**
   * 获取文字的像素宽.
   * @return 返回宽度
   */
  _getTextWidth: function (str, size, weight, family) {
    this._textSpan.style.display = ''
    this._textSpan.style.width = ''
    if (size != null) {
      this._textSpan.style.fontSize = size
    }
    // 字体样式
    if (weight != null) {
      this._textSpan.style.fontWeight = weight
    }
    if (family != null) {
      this._textSpan.style.fontFamily = family
    }
    this._textSpan.innerHTML = str
    var rs = this._textSpan.offsetWidth
    this._textSpan.style.display = 'none'
    return rs
  },
  /**
   * 固定宽度的情况下获取文字的字体.
   */
  _getTextSize: function (str, width, height, defSize, weight, family) {
    // 插件已经处理，此处无需再处理
    return defSize
  },

  /**
   * 获取文字的像素宽.
   * @return 返回宽度
   */
  _getTextHeight: function (str, width, size, weight, family) {
    // 宋体
    // 每个字占用的宽度
    var sizew = this.widthScale
    // 每个字占用的行高
    var sizeh = this.heightScale

    var sl = this.strLen(str)
    var key = sl + '@' + width + '@' + size// + "@" + weight + "@" + family;
    if (this._textHeightJson == null) {
      this._textHeightJson = {}
    }
    var rs = this._textHeightJson[key]
    if (rs == null) {
      size = parseInt(size, 10)
      width = parseInt(width, 10)
      var rownums = width / (size * sizew)
      var rowcount = sl / rownums
      var rt = parseInt(rowcount, 10)
      if (rowcount > rt) {
        rt++
      }
      if (rt > 1) {
        rt++
      }
      var rowheight = (sizeh * size) * rt
      rs = rowheight
      this._textHeightJson[key] = rs
    }
    return rs
  },
  /**
   * 获取jggrid表格的表头.
   * @param {object} grid 表格对象
   */
  _getGridHeader: function (grid) {
    var headerTab = grid.getControl()[0].grid.hDiv.childNodes[0].childNodes[0]
    var header = []
    if (headerTab != null && headerTab.tagName === 'TABLE') {
      var rlen = headerTab.rows.length
      var bi = 0
      for (var i = bi; i < rlen; i++) {
        var rows = headerTab.rows[i]
        var cls = rows.getAttribute('class')
        if (cls === 'jqg-first-row-header') {
          bi++
          continue
        }
        var rh = []
        var cindex = 0
        for (var j = 0, clen = rows.cells.length; j < clen; j++) {
          var cells = rows.cells[j]
          var id = cells.getAttribute('id')
          if (cells.style.display !== 'none' && (typeof id !== 'string' || id.indexOf('_cb') < 0)) {
            var colspan = cells.colSpan || cells.colspan || 1
            colspan = parseInt(colspan, 10)
            var rowspan = cells.rowSpan || cells.rowspan || 1
            rowspan = parseInt(rowspan, 10)
            var region = {
              colFrom: cindex,
              colTo: cindex + colspan - 1,
              dataType: '',
              rowFrom: i - bi,
              rowTo: i + rowspan - 1 - bi,
              style: 'head',
              text: this._getText(cells)
            }
            rh.push(region)
            cindex += colspan
          }
        }
        header.push(rh)
      }
    }
    return header
  },
  /**
   * 打印页面设置.
   * @param {JSON} params 参数
   * @param {JSON} params.Paper 纸张
   * @param {String} params.Paper.Type 类型  Custom:自定义, A4等
   * @param {number} params.Paper.Width 类型  Type是Custom时，纸张的宽度
   * @param {number} params.Paper.Height 类型  Type是Custom时，纸张的高度
   * @param {JSON} params.Margins 边距 单位mm
   * @param {number} params.Margins.Top 顶边距
   * @param {number} params.Margins.Bottom 底边距
   * @param {number} params.Margins.Left 左边距
   * @param {number} params.Margins.Right 右边距
   * @param {number} params.Copies 打印份数 默认为1份
   * @param {string} params.pageRange 打印页码, 默认全打
   *                 ALL: 全打
   *                 i:打印第i页
   *                 i-j: 打印i页到j页
   * @param {boolean} params.LandScape 是否横向 true ，默认为 false
   * @param {number} params.ZoomValue 缩放系数 整数 如 x 表示 x%
   * @param {number} params.TextModel 文本打印模式，文本过长时分三种模式打印
   *                  0：直接截取，1：缩小显示，2：换行显示, 默认为2：换行显示
   * @param {boolean} ShowSysWin 显示系统窗口
   * @param {boolean} initDef 是否初始化默认值
   */
  setPageSettings: function (params, initDef) {
    if (initDef == null) {
      initDef = true
    }
    if (params == null) {
      params = {}
    }
    // 打印纸张
    var paper = params.paper || params.Paper
    if (initDef && paper == null) {
      paper = {type: 'A4'}
    }
    if (paper != null) {
      var type = paper.type || paper.Type
      if (type === 'Custom' || type === 'custom') {
        this.setPaperSize('Custom', paper.width || paper.Width,
          paper.height || paper.Height)
      } else {
        this.setPaperSize(type)
      }
    }
    // 边距
    var margins = params.margins || params.Margins
    var top, left, right, bottom
    if (margins != null) {
      top = margins.Top || margins.top
      left = margins.Left || margins.left
      bottom = margins.Bottom || margins.bottom
      right = margins.Right || margins.right
    }
    if (initDef) {
      if (top == null) {
        top = 8
      }
      if (left == null) {
        left = 8
      }
      if (bottom == null) {
        bottom = 8
      }
      if (right == null) {
        right = 8
      }
      this.setMargins(top, left, bottom, right)
    }
    // 打印缩放
    var zoomValue = params.zoomValue || params.ZoomValue
    if (zoomValue != null) {
      if (typeof zoomValue === 'string') {
        zoomValue = zoomValue.replace('%', '')
      }
      this.setZoomValue(zoomValue)
    }
    var documentName = params.documentName || params.DocumentName
    if (documentName != null && documentName !== '') {
      this.setDocumentName(documentName)
    }
    // 打印方向
    var lsc = params.landScape === true ||
	    			params.landScape === 'true' ||
	    				params.LandScape === true ||
	    					params.LandScape === 'true'
    this.setLandscape(lsc)
    if (top != null && left != null && right != null && bottom != null) {
      // 宽度、高度

      this.pswidth = paper.width || paper.Width || 210
      this.psheight = paper.height || paper.Height || 297

      var cZoomValue = 1
      if (zoomValue != null && zoomValue !== '') {
        cZoomValue = parseInt(zoomValue, 10) / 100
      }
      this.maxWidth = parseInt((parseInt(this.pswidth, 10) - parseInt(left, 10) - parseInt(right, 10)) * this.pxPerMM / cZoomValue, 10)
      this.maxHeight = parseInt((parseInt(this.psheight, 10) - parseInt(top, 10) - parseInt(bottom, 10)) * this.pxPerMM / cZoomValue, 10)
      if (lsc) {
        var tmpWidth = this.maxWidth
        this.maxWidth = this.maxHeight
        this.maxHeight = tmpWidth
      }
    }

    // 打印份数
    var copies = params.Copies || params.copies
    if (initDef && params.Copies == null) {
      copies = 1
    }
    if (copies != null) {
      this.setCopies(copies)
    }
    // 打印页码
    var pc = params.pageRange || params.pageRange
    if (pc === 'ALL' || (initDef && (pc == null || pc === ''))) {
      this.printAllPage()
    } else {
      var pcAry = (pc + '').split('-')
      var f, t
      if (pcAry.length === 1 && pcAry[0] != null) {
        f = pcAry[0]
        t = f
      } else if (pcAry.length === 2) {
        if (pcAry[0] != null) {
          f = pcAry[0]
        }
        if (pcAry[1] != null) {
          t = pcAry[1]
        }
      }
      if (f != null) {
        this.printSomePage(f, t)
      } else if (initDef) {
        this.printAllPage()
      }
    }

    // 打印方式
    var tableFillModel = params.textModel || params.TextModel
    var sowSysWin = params.ShowSysWin
    if (sowSysWin == null) {
      sowSysWin = params.showSysWin
    }
    if (sowSysWin === false) {
      this.setPrintStyle(2, true, tableFillModel, 0, params.BottomFurl)
    } else {
      this.setPrintStyle(2, true, tableFillModel, 1, params.BottomFurl)
    }
    this.setOffsetPoint(8, 13)
    // 打印状态
    var date = new Date()
    this.option.hasPrintState = date.getTime()
    this.option.hasPrint = 1
    this.option.barcode = {}
  },
  setNoWorkFlow: function (value) {
    if (value == null || value === '') {
      value = true
    }
    this.PageNode.setAttrib('NoWorkFlow', value)
  },
  setWorkFlowWidth: function (value) {
    if (value == null || value === '') {
      value = 800
    } else {
      if (value > this.maxWidth) {
        value = this.maxWidth
      }
      this.PageNode.setAttrib('WorkFlowWidth', value)
    }
  },
  setWorkFlowFontSize: function (value) {
    if (value == null || value === '') {
      value = 9
    }
    this.PageNode.setAttrib('WorkFlowFontSize', value)
  },
  setCopies: function (count) {
    if (count == null || count == null || count === '' || isNaN(count)) {
      count = 1
    }
    this.copies = count
    // 添加打印份数控制
    var pp = this.PageSettings.getNode('PrintRange')
    if (pp == null) {
      pp = this.PageSettings.addNode('PrintRange')
    }
    pp.setAttrib('Copies', count)
  },
  // 设置Report属性.
  setPrintStyle: function (PrintControllerStyle, IsRepeatHeader, tableFillModel, useDefPrinter, bottomfurl) {
    if (bottomfurl == null || bottomfurl === '') {
      bottomfurl = false
    }
    this.ReportNode.setAttrib('BottomFurl', bottomfurl)
    this.ReportNode.setAttrib('PrintControllerStyle', PrintControllerStyle)
    this.ReportNode.setAttrib('IsRepeatHeader', IsRepeatHeader)
    this.ReportNode.setAttrib('TableBodyFillMode', tableFillModel)
    if (useDefPrinter != null && useDefPrinter !== 0) {
      useDefPrinter = 1
    }
    this.ReportNode.setAttrib('UseDefPrinter', useDefPrinter)
  },
  /**
   * 设置是否横向打印.
   */
  setLandscape: function (value) {
    this.PageSettings.addNode('Landscape', value)
    if (typeof value === 'string') {
      value = Boolean(value)
    }
    this.landScape = value
  },
  setPaperSize: function (value, width, height) {
    var psiNode = this.PageSettings.addNode('PaperSize')
    psiNode.addNode('PaperKind', value)
    if (width != null) {
      psiNode.addNode('PaperWidth', width)
    }
    if (height != null) {
      psiNode.addNode('PaperHeight', height)
    }
    psiNode = null
  },
  setMargins: function (top, left, bottom, right) {
    var mgNode = this.PageSettings.addNode('Margins')
    if (top != null) {
      mgNode.setAttrib('Top', top)
    }
    if (left != null) {
      mgNode.setAttrib('Left', left)
    }
    if (right != null) {
      mgNode.setAttrib('Right', right)
    }
    if (bottom != null) {
      mgNode.setAttrib('Bottom', bottom)
    }
    mgNode = null
  },
  printAllPage: function () {
    var pp = this.PageSettings.getNode('PrintRange')
    if (pp == null) {
      pp = this.PageSettings.addNode('PrintRange')
    }
    pp.setAttrib('Name', 'AllPages')
  },
  printSomePage: function (fromPage, toPage) {
    var pp = this.PageSettings.getNode('PrintRange')
    if (pp == null) {
      pp = this.PageSettings.addNode('PrintRange')
    }
    // 页数类型
    pp.setAttrib('Name', 'SomePages')
    pp.setAttrib('FromPage', fromPage)
    pp.setAttrib('ToPage', toPage)
  },
  setOffsetPoint: function (X, Y) {
    var op = this.PageSettings.addNode('OffsetPoint')
    op.setAttrib({'X': X, 'Y': Y})
    op = null
  },
  /**
   * 添加文本显示.
   * text 文本内容
   * @param {JSON} option 对应属性
   * @param {string} option.dataField 数据项目
   * @param {number} option.top 顶点,
   * @param {number} option.left:左边,
   * @param {number} option.width:宽度,
   * @param {number} option.height:高度,
   * @param {number} option.fontSize:字号,
   * @param {string} option.align:横对齐,Left, Center, Right
   * @param {string} option.lineAlign:纵对刘,Top, Center, Bottom
   * @param {number} option.id:id 值
   * @param {boolean} option.I 是否斜体
   * @param {boolean} option.B 是否粗体
   * @param {boolean} option.U 是否有下画线
   * @param {boolean} option.S 是否删除线
   * @param {string} option.relative 是否相对打印
   */
  addText: function (text, option, pnode) {
    var pn = pnode
    if (pn == null) {
      pn = this.PageNode
    }
    if (typeof text === 'object') {
      option = text
      text = this.getJsonValue(option.text, option.Text, '')
    }
    if (option == null) {
      option = {}
    }
    var txtNode = pn.addNode('Text', text, option.id)
    var fontSize = this.getJsonValue(option.fontSize, option.FontSize, 11)
    var left = this.getJsonValue(option.left, option.Left)
    var height = this.getJsonValue(option.height, option.Height, fontSize * this.heightScale)
    var width = this.getJsonValue(option.width, option.Width, fontSize * this.widthScale)
    if (typeof width === 'string') {
      var index = width.indexOf('%')
      if (index >= 0) {
        width = width.substr(0, index)
        var l = left
        if (l == null) {
          l = 0
        }
        if (width !== '') {
          width = this.maxWidth * parseInt(width, 10) / 100 - l
        }
      }
    }
    if (left == null) {
      var right = this.getJsonValue(option.right, option.Right)
      if (right != null) {
        left = this.maxWidth - parseInt(right, 10) - width
      } else {
        left = 0
      }
    }
    txtNode.setAttrib({'X': left,
      'Y': option.top || option.Top || 0,
      'FontSize': fontSize,
      'FontName': option.fontName || option.FontName || this._i18n.getLan('qzz.defFontFamily'),
      'Width': width,
      'Height': height,
      'Color': option.color || option.Color || '#000000',
      'I': option.I || false,
      'B': option.B || false,
      'U': option.U || false,
      'S': option.S || false,
      'Alignment': option.align || option.Align || 'Center',
      'LineAlignment': option.lineAlign || option.LineAlign || 'Center',
      'Lock': option.lock || option.Lock || '',
      'RelativeTableID': option.relative || '1'})
    var dataField = this.getJsonValue(option.dataField, option.DataField)
    if (dataField != null) {
      this.setDataField(txtNode, dataField)
    }
    return txtNode
  },
  setImage: function (imgNode, url, top, left, width, height) {
    if (imgNode != null) {
      imgNode.setAttrib({'X': left, 'Y': top})
      if (height != null) {
        imgNode.setAttrib('Height', height)
      }
      if (width != null) {
        imgNode.setAttrib('Width', width)
      }
      url = this._transFullUrl(url)
      var vln = imgNode.getNode('Value')
      vln.setValue(url)
    }
  },
  _transFullUrl: function (url) {
    if (!(/[a-zA-Z]:|[hH][tT][tT][pP]:/.test(url))) {
      if (this.location == null) {
        this.location = window.location.protocol + '//' + window.location.host
      }
      if (url.charAt(0) !== '/') {
        url = '/' + url
      }
      url = this.location + url
    }
    return url
  },
  _getLocation: function () {
    if (this.location == null) {
      this.location = window.location.protocol + '//' + window.location.host
    }
    return this.location
  },
  _getPrintOption: function (po, key, def) {
    if (typeof key === 'string') {
      key = [key]
    }
    var re = def
    if (po.optionEnable == null || po.optionEnable == true || po.optionEnable === 'true') {
      for (var i = 0, len = key.length; i < len; i++) {
        var vl = po[key[i]]
        if (vl != null && vl !== '') {
          re = vl
          break
        }
      }
    }
    return re
  },
  /**
   * 添加图片.
   * @param {JSON} option 属性对象
   * @param {string} option.dataField 单元数据项
   * @param {string} option.url 路径
   * @param {number} option.top 顶点
   * @param {number} option.left 左点
   * @param {number} option.width 宽
   * @param {number} option.height 高
   * @param {NODE} pNode 父节点
   */
  addImage: function (option, pNode) {
    if (pNode == null) {
      pNode = this.PageNode
    }
    if (option == null) {
      option = {}
    }
    var left = this.getJsonValue(option.left, option.Left)
    var right = this.getJsonValue(option.right, option.Right)
    var width = this.getJsonValue(option.width, option.Width)
    if (left == null && right != null && !isNaN(right)) {
      left = this.maxWidth - parseInt(right, 10) - width
    }
    var imgNode = pNode.addNode('Img')
    imgNode.setAttrib({'X': left,
      'Y': this.getJsonValue(option.top, option.Top),
      'Lock': this.getJsonValue(option.lock, option.Lock, 'Center')
    })
    var height = this.getJsonValue(option.height, option.Height)
    if (height != null) {
      imgNode.setAttrib('Height', height)
    }

    if (width != null) {
      imgNode.setAttrib('Width', width)
    }
    var url = this.getJsonValue(option.url, option.Url, option.URL)
    if (url != null) {
      url = this._transFullUrl(url)
    } else {
      url = ''
    }
    var valNode = imgNode.addNode('Value', url)
    var dataField = this.getJsonValue(option.dataField, option.DataField)
    if (dataField != null) {
      this.setDataField(valNode, dataField)
    }
    return imgNode
  },

  /**
   * 添加画线.
   * @param {string} text 文本显示
   * @param {JSON} option 参数对象
   * @param {string} option.dataField 单元数据项
   * @param {number} option.top 顶点
   * @param {number} option.left 左点
   * @param {number} option.width 宽
   * @param {number} option.height 高
   * @param {string} option.border 线
   * @param {string} option.color 颜色
   * @param {string} option.id id值
   */
  addLine: function (text, option) {
    if (typeof text === 'object') {
      option = text
      text = this.getJsonValue(option.text, option.Text, '')
    }
    if (option == null) {
      option = {}
    }
    var lineNode = this.PageNode.addNode('Line', text, this.getJsonValue(option.id, option.Id))
    var width = this.getJsonValue(option.width, option.Width, 300)
    var left = this.getJsonValue(option.left, option.Left)
    if (typeof width === 'string') {
      var index = width.indexOf('%')
      if (index >= 0) {
        width = width.substr(0, index)
        if (width !== '') {
          var l = left
          if (l == null) {
            l = 0
          }
          width = this.maxWidth * parseInt(width, 10) / 100 - l
        }
      }
    }
    var height = this.getJsonValue(option.height, option.Height, 300)
    var top = this.getJsonValue(option.top, option.Top, 0)
    if (typeof height === 'string') {
      // eslint-disable-next-line no-redeclare
      var index = height.indexOf('%')
      if (index >= 0) {
        height = height.substr(0, index)
        if (height !== '') {
          height = this.maxHeight * parseInt(height, 10) / 100 - top
        }
      }
    }

    if (left == null) {
      var right = this.getJsonValue(option.right, option.Right)
      if (right != null) {
        left = this.maxWidth - parseInt(right, 10) - width
      } else {
        left = 0
      }
    }
    lineNode.setAttrib({'Y': top,
      'X': left,
      'Width': width,
      'Height': height,
      'Border': this.getJsonValue(option.border, option.Border),
      'Style': this.getJsonValue(option.style, option.Style, 'dashed'),
      'Color': this.getJsonValue(option.color, option.Color),
      'Lock': this.getJsonValue(option.lock, option.Lock)
    })
    var dataField = this.getJsonValue(option.dataField, option.DataField)
    if (dataField != null) {
      this.setDataField(lineNode, dataField)
    }
    return lineNode
  },
  /**
   * 添加整个表格控件数据.
   * @param {grid} dataGrid 表格控件
   */
  addGridModel: function (dataGrid) {
    var p = dataGrid.control[0].p
    var dgid = p.id
    // 获取表头
    var header = []
    if (dataGrid.isComponent) {
      header = dataGrid.getHeader(null, dataGrid.getOption().rownumbers)
    } else {
      header = this._getGridHeader(dataGrid)
    }
    var hlen = header.length
    var fontSize = 9
    if (dataGrid.getOption().fontSize != null && dataGrid.getOption().fontSize !== '') {
      fontSize = dataGrid.getOption().fontSize
    }
    var rc = 0
    for (var j = hlen - 1; j >= 0; j--) {
      if (header[j].length > 0) {
        rc++
      }
    }
    if (rc === 0) return null
    var hrs = '0'
    for (var i = 1; i < hlen; i++) {
      hrs += ',' + i
    }
    // 获取相对位置
    var rly = 5
    if (dataGrid.getOption().relativeY != null) {
      rly = dataGrid.getOption().relativeY
    }
    var po = dataGrid.getControl().attr('printOption')
    if (po != null && po !== '') {
      po = JSON.parse(po)
    } else {
      po = {}
    }
    fontSize = this._getPrintOption(po, ['fontSize', 'FontSize', 'fontsize'], fontSize)
    rly = this._getPrintOption(po, ['Top', 'top'], rly)
    var cms = p.colModel
    // 开始打印表格***
    // 过滤掉隐藏列的colModel
    var colModel = []
    var tdWidths = []
    var k = 0
    var colSum = 0
    var hasRn = false
    if (dataGrid.isComponent) {
      cms = dataGrid.getOption().colModels
      if (dataGrid.getOption().rownumbers) {
        colModel.push({align: 'Center', 'caption': this._i18n.getLan('qzz.index'), 'index': 'rn', 'name': 'rn', 'width': 60, 'hidden': false, 'colIndex': 0})
        tdWidths[k++] = 60
        colSum = 60
      }
    }
    // eslint-disable-next-line no-redeclare
    for (var i = 0, len = cms.length; i < len; i++) {
      var curCm = cms[i]
      if (curCm.hidden !== true && curCm.name != null && curCm.name !== '' && curCm.name !== 'cb') {
        if (curCm.name === 'rn' || dataGrid.getOption().rownumbers !== false) {
          hasRn = true
        }
        colModel.push(curCm)
        // 计算宽度
        var cw = curCm.width
        if (dataGrid.isComponent) {
          var ocw = dataGrid.getColWidth(curCm.colIndex + 1)
          if (ocw > 0) {
            cw = ocw
          }
        }
        // 打印表宽，比实际宽要宽一些，所以加10个像素
        tdWidths[k++] = cw + 10
        colSum += cw + 10
      }
    }

    // 重新计算宽度
    if ((colSum > this.maxWidth && k * 20 < this.maxWidth) || this.option.autoWidth === true) {
      var ce = this.maxWidth / colSum
      var nColSum = 0
      // eslint-disable-next-line no-redeclare
      var len = tdWidths.length
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < len; i++) {
        tdWidths[i] = parseInt(tdWidths[i] * ce, 10)
        nColSum += tdWidths[i]
      }
      ce = this.maxWidth - nColSum
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < len && ce !== 0; i++) {
        if (ce > 0) {
          tdWidths[i]++
          ce--
        } else {
          tdWidths[i]--
          ce++
        }
      }
    }
    var tabNode = this.addTable({top: 0, left: 0, id: dgid})
    this.setHeadCount(tabNode, hrs, hlen)
    var clen = 0
    var windex = 0
    var rowHeight = 25
    if (dataGrid.getOption().printRowHeight != null) {
      rowHeight = dataGrid.getOption().printRowHeight
    } else if (dataGrid.getOption().rowHeight != null) {
      rowHeight = dataGrid.getOption().rowHeight
    } else if (dataGrid.rowHeight != null) {
      rowHeight = dataGrid.rowHeight
    }
    // 添加固定行数显示
    if (dataGrid.getOption().lessRows != null) {
      tabNode.setAttrib('lessRows', dataGrid.getOption().lessRows)
    }
    var prowheight = []
    // 生成表头
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < hlen; i++) { // hlen 合并多列的列数，
      // var ma = 0 // ma是p.colModel 里面的下标。  第二列的时候，ma初始化为0;
      var rowNode = this.addRow(tabNode)
      var colheader = header[i]
      clen = colheader.length // 要打印的列数
      var maxHeight = rowHeight
      if (hasRn && i > 0) {
        windex = 1
      }
      // eslint-disable-next-line no-redeclare
      for (var j = 0; j < clen; j++) {
        var colSpan, rowSpan
        var colH = colheader[j]
        if (colH.colTo !== colH.colFrom) {
          colSpan = colH.colTo - colH.colFrom + 1
        }
        if (colH.rowTo !== colH.rowFrom) {
          rowSpan = colH.rowTo - colH.rowFrom + 1
        }
        if (colH.rowspan != null && colH.rowspan > 1) {
          rowSpan = colH.rowspan
        }
        var text = this.trim(colH.text.replace(/&nbsp;/g, ' '))
        this.addCell(rowNode, text,
          {'colSpan': colSpan, 'rowSpan': rowSpan, 'fontSize': fontSize, 'align': 'Center', 'lineAlign': 'Center'})

        var ccw = 0
        for (var ci = colH.colFrom; ci <= colH.colTo; ci++) {
          ccw += tdWidths[ci + windex]
        }
        if (ccw > 0) {
          var ch = this._getTextHeight(text, ccw, fontSize)
          // 减去上几行所占用的行高
          if (rowSpan != null && rowSpan > 1) {
            ch -= (rowSpan - 1) * rowHeight
          }
          if (maxHeight < ch) {
            maxHeight = ch
          }
        }
        colSpan = null
        rowSpan = null
      } // j
      prowheight.push(maxHeight)
      rowNode.setAttrib('Height', maxHeight)
      rowNode = null
      colheader = null
    } // i

    var border = this._getPrintOption(po, ['border', 'Border'], 1)
    // 是否显示边线
    if (this.option.formulaPrint || border === 0) {
      this.setNoBorder(tabNode, 'true')
    }
    this.option.rowCountPerPage = this._getPrintOption(po,
      ['rowCountPerPage', 'RowCountPerPage', 'rowcountperpage'], this.option.rowCountPerPage)
    // 设置每页记录数
    if (this.option.rowCountPerPage > 0) {
      this.setRowCountPerPage(tabNode, this.option.rowCountPerPage)
    }
    // var colModel = dataGrid.getGridParam().colModel;
    var mcount = colModel.length
    // 设置行循环
    // eslint-disable-next-line no-redeclare
    var rowNode = this.addRow(tabNode)
    // var gridDataField = dataGrid.getControl().attr("id");
    // if(gridDataField == null) {
    var gridDataField = dataGrid.getName()
    // }
    var dfs = this.setDataFields(rowNode, gridDataField)
    rowNode.setAttrib('Height', rowHeight)
    // 设置各个列的dataField
    // eslint-disable-next-line no-redeclare
    for (var i = 0; i < mcount; i++) {
      // eslint-disable-next-line no-redeclare
      var curCm = colModel[i]
      if (curCm.hidden !== true && curCm.name != null && curCm.name !== '' && curCm.name !== 'cb') {
        var calign = curCm.align
        if (calign == null && dataGrid.getColAlign != null) {
          calign = dataGrid.getColAlign(curCm.name)
        }
        var cellNode = this.addCell(rowNode, '',
          {'fontSize': fontSize, 'align': calign, 'lineAlign': 'Center'})
        if (curCm.formatStyle != null && curCm.formatStyle !== '') {
          cellNode.setAttrib('formatStyle', curCm.formatStyle)
        }
        this.setDataField(cellNode, curCm.name, dfs)
        cellNode = null
      }
    }
    dfs = null
    // 合计行处理
    // 把合计行属性缓存到table节点的sum属性中.
    if (dataGrid.isComponent) {
      if (dataGrid.getOption().footerrow && !this.option._noAmount) {
        // var rowValue = []
        rowNode = this.addRow(tabNode)
        gridDataField = dataGrid.getName()
        dfs = this.setDataFields(rowNode, gridDataField)
        // eslint-disable-next-line no-redeclare
        for (var j = 0, mcount = colModel.length; j < mcount; j++) {
          // eslint-disable-next-line no-redeclare
          var curCm = colModel[j]
          if (curCm.hidden !== true && curCm.name != null && curCm.name !== '' && curCm.name != 'cb') {
            // eslint-disable-next-line no-redeclare
            var calign = curCm.align
            if (calign == null && dataGrid.getColAlign != null) {
              calign = dataGrid.getColAlign(curCm.name)
            }
            // eslint-disable-next-line no-redeclare
            var cellNode = this.addCell(rowNode, '',
              {'fontSize': fontSize, 'align': calign, 'lineAlign': 'Center'})
            if (curCm.formatStyle != null && curCm.formatStyle !== '') {
              cellNode.setAttrib('formatStyle', curCm.formatStyle)
            }
            this.setDataField(cellNode, curCm.name, dfs)
            cellNode = null
          }
        }
      } // if footerrow
    }

    dfs = null
    var cws = dataGrid.getOption().colWidths
    cws = this._getPrintOption(po, ['colwidths', 'colWidths', 'ColWidths'], cws)
    // 设置各列宽
    if (cws != null) {
      var tdws = cws.split(',')
      if (tdws.length < tdWidths.length) {
        // eslint-disable-next-line no-redeclare
        for (var i = tdws.length, len = tdWidths.length; i < len; i++) {
          tdws.push(tdWidths[i])
        }
      }
      if (tdws != null) {
        this.setCellWidths(tabNode, tdws.join(','))
      } else {
        this.setCellWidths(tabNode, tdWidths.join(','))
      }
    } else {
      this.setCellWidths(tabNode, tdWidths.join(','))
    }
    // 设置相对位置
    tabNode.setAttrib({'RelativeY': 'true',
      'RelativeTableID': this.option.curTableId,
      'Y': rly})
    // 计算子表序号
    if (dgid.indexOf('mainTable') < 0) {
      this.option.subGridIndex++
      // 子表分页打印，或审批单独打印, 多子表一起打印
      if (((this.option.subTableNextPage && !this.option.subGridOnOnePage) ||
	    (this.option.subGridOnOnePage && this.option.subGridIndex < 2)) ||
	    (this.option.printSpInfo && this.option.spPrintType === '1' &&
	    dataGrid.getName() === 'shenpiGridprocessExamineIdea')
      ) {
        tabNode.setAttrib('PrintInNewPage', 'true')
      }
    }
    var lock = this._getPrintOption(po, ['Lock', 'lock'])
    if (lock !== '') {
      tabNode.setAttrib('Lock', lock)
    }
    var pinp = this._getPrintOption(po, ['printinnewpage', 'printInNewPage', 'PrintInNewPage'], false)
    if (pinp === 'true' || pinp === 'True' || pinp === true) {
      tabNode.setAttrib('PrintInNewPage', 'true')
    }
    header = null
    hlen = null
    clen = null
    tdWidths = null
    colModel = null
    mcount = null
    rowNode = null
    // tabNode = null;
    return tabNode
  },
  _addWtToTd: function (wtcaption, wtusername, wturl, td) {
    if (wtusername !== '' && td != null) {
      var textOption = {'top': 0,
        'left': 2,
        'width': 60,
        'height': td.pNode.getAttrib('Height'),
        'fontSize': td.getAttrib('FontSize'),
        'align': 'left',
        'lineAlign': 'Center',
        'Lock': 'center',
        'id': 'wt',
        'B': false
      }
      if (wturl !== '') {
        var cw = this._getTextWidth('(' + wtcaption, td.getAttrib('FontSize')) + 12
        if (cw == null) {
          cw = 60
        }
        textOption.width = cw
        this.addText('(' + wtcaption, textOption, td)
        this.addImage({'url': wturl,
          'top': 0,
          'left': 2,
          'width': null,
          'height': null}, td)
        textOption.id = 'tw2'
        textOption.width = 10
        this.addText(')', textOption, td)
      } else {
        var text = '(' + wtcaption + ' ' + wtusername + ')'
        // eslint-disable-next-line no-redeclare
        var cw = this._getTextWidth(text, td.getAttrib('FontSize')) + 12
        if (cw == null) {
          cw = 100
        }
        textOption.width = cw
        this.addText(text, textOption, td)
      }
    }
  },
  /**
   * 按数组打印.
   * @param {Array} dataAry 二维数据数组
   * @param {number} fontSize 字体
   */
  addArrayTable: function (dataAry, fontSize, top, left, autoWidth, hasNoBorder, colWidths, aligns, headRows) {
    var da = dataAry
    if (!(da instanceof Array)) {
      da = [da]
    }
    if (da.length === 0) {
      return
    }
    if (top == null || top === '') {
      top = 0
    }
    if (left == null || left === '') {
      left = 0
    }
    if (fontSize == null || fontSize === '') {
      fontSize = 9
    }
    var rc = da.length

    var avgW = 100

    if (this.option._arrayId == null) {
      this.option._arrayId = 0
    }
    this.option._arrayId++
    var tabNode = this.addTable({'top': top, 'left': left, 'id': 'ary' + this.option._arrayId})

    var tdws = []
    var fieldNames = []
    var hrs = []
    for (var i = 0; i < rc; i++) {
      hrs.push(i)
      var rowNode = this.addRow(tabNode)
      var maxHeight = 24
      var rowData = da[i]
      if (rowData instanceof Array) {
        var cc = rowData.length
        if (autoWidth === true && i === 0) {
          if (cc > 0) {
            avgW = parseInt(this.maxWidth / cc, 10)
          }
        }
        for (var j = 0; j < cc; j++) {
          if (i === 0) {
            tdws.push(avgW)
          }
          var cell = rowData[j]
          var text = ''
          var url = ''
          var wtcaption = ''
          var wtusername = ''
          var wturl = ''
          if (typeof cell === 'string') {
            text = cell
          } else if (cell != null) {
            text = cell.postname + '：'
            if (cell.url === '') {
              text += cell.username
            } else {
              url = cell.url
            }
            if (cell.wtusername !== '') {
              wtusername = cell.wtusername
              wtcaption = cell.wtcaption
              wturl = cell.wturl
            }
          }
          var align = 'Left'
          if (aligns instanceof Array) {
            align = aligns[j] || align
          }
          var td = this.addCell(rowNode, text, {'colSpab': 1, 'rowSpan': 1, 'fontSize': fontSize, 'align': align, 'lineAlign': 'Center'})
          var cch = this._getTextHeight(text, avgW, fontSize)
          if (cch > maxHeight) {
            maxHeight = cch
          }
          if (url !== '') {
            this.addImage({'url': url,
              'top': 0,
              'left': 2,
              'width': null,
              'height': null}, td)
          }
          this._addWtToTd(wtcaption, wtusername, wturl, td)
        }
      } else {
        if (i === 0) {
          for (var key in rowData) {
            fieldNames.push(key)
          }
          // eslint-disable-next-line no-redeclare
          var cc = fieldNames.length
          if (autoWidth === true && cc > 0) {
            avgW = parseInt(this.maxWidth / cc, 10)
          }
        }
        // eslint-disable-next-line no-redeclare
        for (var j = 0, len = fieldNames.length; j < len; j++) {
          if (i === 0) {
            tdws.push(avgW)
          }
          // eslint-disable-next-line no-redeclare
          var cell = rowData[fieldNames[j]]
          // eslint-disable-next-line no-redeclare
          var text = ''
          // eslint-disable-next-line no-redeclare
          var url = ''
          // eslint-disable-next-line no-redeclare
          var wtcaption = ''
          // eslint-disable-next-line no-redeclare
          var wtusername = ''
          // eslint-disable-next-line no-redeclare
          var wturl = ''
          if (typeof cell === 'string') {
            text = cell
          } else if (cell != null) {
            text = cell.postname + '：'
            if (cell.url === '') {
              text += cell.username
            } else {
              url = cell.url
            }
            if (cell.wtusername !== '') {
              wtusername = cell.wtusername
              wtcaption = cell.wtcaption
              wturl = cell.wturl
            }
          }
          // eslint-disable-next-line no-redeclare
          var align = 'Left'
          if (aligns instanceof Array) {
            align = aligns[j] || align
          }
          // eslint-disable-next-line no-redeclare
          var td = this.addCell(rowNode, text, {'colSpab': 1, 'rowSpan': 1, 'fontSize': fontSize, 'align': align, 'lineAlign': 'Center'})
          // eslint-disable-next-line no-redeclare
          var cch = this._getTextHeight(text, avgW, fontSize)
          if (cch > maxHeight) {
            maxHeight = cch
          }
          if (url !== '') {
            this.addImage({'url': url,
              'top': 0,
              'left': 2,
              'width': null,
              'height': null}, td)
          }
          this._addWtToTd(wtcaption, wtusername, wturl, td)
        }
      }
      rowNode.setAttrib('Height', maxHeight)
      rowNode = null
    }
    if (typeof colWidths === 'string') {
      colWidths = colWidths.split(',')
    }
    if (colWidths instanceof Array) {
      // eslint-disable-next-line no-redeclare
      for (var i = 0, len1 = colWidths.length, len2 = tdws.length; i < len1 && i < len2; i++) {
        tdws[i] = colWidths[i]
      }
    }
    if (typeof headRows === 'string') {
      headRows.split(',')
    }
    if (headRows instanceof Array) {
      hrs = headRows
    }
    this.setCellWidths(tabNode, tdws.join(','))
    if (hasNoBorder == null) {
      hasNoBorder = 'true'
    } else {
      hasNoBorder = hasNoBorder + ''
    }
    this.setNoBorder(tabNode, hasNoBorder)
    this.setHeadCount(tabNode, hrs.join(','), rc)
    tabNode = null
  },
  _findParent: function (dom, attrKey, attrValue) {
    var res = null
    var cdom = dom.parentNode
    while (cdom != null && cdom.getAttribute) {
      if (cdom.getAttribute(attrKey) !== attrValue) {
        res = cdom
        break
      }
      cdom = cdom.parentNode
    }
    return res
  },
  /**
   * 添加整个表格数据.
   * @param {JSON} params 参数
   * @param {number} params.top 顶点
   * @param {number} params.left 左点
   * @param {string} params.id
   * @param {number} params.maxColWidth 单列大最宽度
   * @param {boolean} params.hasBorder 是否有边线
   * @param {OBJECT} params.table 表格对象
   */
  addHTMLTable: function (params) {
    var mtab = params.table
    if (typeof mtab.attr === 'function') {
      mtab = mtab[0]
    }
    var query = params.query
    if (query == null && window.$) {
      query = window.$
    }
    var tabNode = null
    if (mtab != null && (mtab.offsetWidth > 0 || mtab.getAttribute('colwidths'))) {
      var ml = mtab.rows.length
      var rindex = 0
      while (rindex < ml && mtab.rows[rindex].cells.length === 0) {
        rindex++
      }
      if (rindex < ml) {
        var rows = null
        var colSum = mtab.offsetWidth
        var ce = 1
        if (colSum > this.maxWidth || this.autoWidth === true) {
          ce = this.maxWidth / colSum
        }
        // ecp平台窗口容器
        var element = this._findParent(mtab, 'ecpclass', 'ecp.ui.layout.Window')
        // 设置id
        var tabId = params.id || params.Id || params.ID || mtab.id || mtab.name
        tabNode = this.addTable({'top': params.top, 'left': params.left, 'id': tabId})
        var fs = mtab.style.fontSize
        if (mtab.parentElement != null && (fs == null || fs === '')) {
          fs = mtab.parentElement.style.fontSize
        }
        if (fs == null || fs === '') {
          fs = 9
        }
        if (typeof fs === 'string') {
          fs = fs.replace(/px|pt/, '')
        }
        var tdws = mtab.getAttribute('colwidths')
        // 解析通用参数
        var po = mtab.getAttribute('printOption')
        if (po != null && po !== '') {
          po = JSON.parse(po)
        } else {
          po = {}
        }
        fs = this._getPrintOption(po, ['fontsize', 'fontSize', 'FontSize'], fs)
        tdws = this._getPrintOption(po, ['colwidths', 'colWidths', 'ColWidths'], tdws)
        if (tdws != null && tdws !== '') {
          tdws = tdws.split(',')
        }
        var left = this._getPrintOption(po, ['left', 'Left'], params.left)
        if (left != null && left !== 0 && left !== '') {
          tabNode.setAttrib('X', left)
        }
        var top = this._getPrintOption(po, ['left', 'Left'], params.top)
        if (top != null && top !== 0 && top !== '') {
          tabNode.setAttrib('Y', top)
        }
        // 获取列宽数组
        var tdWidths = []
        // var wIndex = 0
        // var colIndex = 0
        var ignoreRow = 0
        // 保留最多列的行
        var colMxLen = 0
        var rowMxIndex = 0
        for (var i = rindex; i < ml; i++) {
          var crow = mtab.rows[i] // 获取TR下面的所有TD
          var clen = crow.cells.length// 获取TD数
          if (clen > 0 && crow.style.display !== 'none') {
            // 去除隐藏行
            var crHasCell = false
            for (var j = 0; j < clen; j++) {
              if (crow.cells[j].style.display !== 'none') {
                crHasCell = true
                break
              }
            }
            if (!crHasCell) {
              ignoreRow++
              continue
            }
            // 保存多列的行
            if (colMxLen < clen) {
              colMxLen = clen
              rowMxIndex = i
            }
            var rowNode = this.addRow(tabNode)
            // 默认高度
            var maxHeight = crow.offsetHeight
            if (maxHeight < 20) {
              maxHeight = crow.getAttribute('height')
              if (typeof maxHeight === 'string') {
                maxHeight = maxHeight.replace('px', '')
              }
              if (maxHeight == null || maxHeight === '') {
                maxHeight = 20
              }
            } else if (maxHeight <= 30) {
              maxHeight = 24
            }
            var hasData = false
            // eslint-disable-next-line no-unused-vars
            var ccount = 0
            // eslint-disable-next-line no-redeclare
            for (var j = 0; j < clen; j++) {
              var curCell = crow.cells[j]
              var html = curCell.innerHTML
              hasData = hasData || (html != null && html.length > 0)
              var isImg = /<[iI][mM][gG]/.test(html)
              var dataField = ''
              var dfAry = html.match(/[dD]ata[fF]ield="([\[\]\w.]+)"/)
              if (dfAry != null && dfAry.length > 0) {
                dataField = dfAry[1]
              }
              var text = this._getText(curCell)
              if (dataField === '' && text === '') {
                var cInput = curCell.querySelector('input')
                if (cInput != null && cInput.getAttribute('type') == 'text') {
                  text = this.trim(cInput.value)
                }
              }
              if (curCell.style.display === 'none') {
                text = ''
                dataField = ''
              } else if (isImg !== true) {
                // ecp输出控件
                var datafAry = curCell.querySelectorAll('[ecpclass]')
                if (datafAry.length === 1 && datafAry[0].tagName === 'DIV' && datafAry[0].style.display === 'none') {
                  text = ''
                  dataField = ''
                } else {
                  for (var x = 0; x < datafAry.length; x++) {
                    if (query && query.ecp && query.ecp.getUI) {
                      var ctrlObj = query.ecp.getUI(datafAry[x], element)
                      if (ctrlObj != null) {
                        var ctrl = ctrlObj.textControl || ctrlObj.control
                        // 获取主表单元格中输入控件的值 modify by zxw
                        if (ctrl != null) {
                          if (ctrl.css('display') === 'none') {
                            text = ''
                            dataField = ''
                          } else {
                            text = ctrl.val ? ctrl.val() : ''
                          }
                        }
                        ctrl = null
                      }
                      ctrlObj = null
                    }
                  }
                }
              }
              var align = curCell.style.textAlign || 'Left'
              var csp = curCell.colSpan == null ? 1 : parseInt(curCell.colSpan || curCell.colspan, 10)
              ccount += csp
              var cellNode = this.addCell(rowNode, text, {'colSpan': csp, 'rowSpan': curCell.rowSpan, 'fontSize': fs, 'align': align, 'lineAlign': 'Center'})
              if (dataField != null && dataField !== '') {
                if (isImg) {
                  // 二维码图片
                  var imgUrl = ''
                  if (query && query.ecp && query.ecp.getUI && window.$) {
                    var dfv = query.ecp.getUI($("[id='" + dataField.replace(/\[[0-9]+\]./, '') + "']", $(mtab)), element)
                    imgUrl = dfv.getURL().replace(/&/g, '[AND]')
                  }

                  this.option.barcode[imgUrl] = this.option.hasPrint
                  var width = imgUrl.match(/width=([0-9]+)/)
                  if (width.length > 1) {
                    width = width[1]
                  } else {
                    width = 100
                  }
                  var height = imgUrl.match(/height=([0-9]+)/)
                  if (height.length > 1) {
                    height = height[1]
                  } else {
                    height = 100
                  }
                  var imgNode = this.addImage({'url': imgUrl,
                    'top': 0,
                    'left': 0,
                    'width': width,
                    'height': height}, cellNode)
                  var vn = imgNode.getNode('Value')
                  if (vn != null) {
                    this.setDataField(vn, dataField)
                  }
                } else {
                  this.setDataField(cellNode, dataField)
                  var fmtAry = html.match(/format[sS]tyle[:=]['"]*([#*,]+)['"]/)
                  if (fmtAry != null && fmtAry.length > 1) {
                    cellNode.setAttrib('formatStyle', fmtAry[1])
                  }
                }
              } else if (isImg) {
                // eslint-disable-next-line no-redeclare
                var imgUrl = html.match(/src=["']([^<>"']+)["']/)
                if (imgUrl != null) {
                  imgUrl = imgUrl[1]
                }
                // eslint-disable-next-line no-redeclare
                var width = html.match(/[wW][iI][Dd][Tt][Hh][=:](["'])?([\d]+)(px)?(["'])?/)
                if (width != null) {
                  width = width[2]
                } else {
                  width = maxHeight
                }
                // eslint-disable-next-line no-redeclare
                var height = html.match(/[hH][eE][iI][gG][hH][tT][=:](["'])?([\d]+)(px)?(["'])?/)
                if (height != null) {
                  height = height[2]
                } else {
                  height = maxHeight
                }
                this.addImage({'url': imgUrl,
                  'top': 0,
                  'left': 0,
                  'width': width,
                  'height': height}, cellNode)
              } else if (text !== '' && curCell.offsetWidth > 0) {
                var ccw = parseInt(curCell.offsetWidth * ce, 10)
                if (tdws instanceof Array) {
                  var cccsp = curCell.colSpan || curCell.colspan
                  if (cccsp !== '') {
                    cccsp = 1
                  }
                  cccsp = parseInt(cccsp, 10)
                  var ccsum = 0
                  for (var k = 0; k < cccsp; k++) {
                    var cws = tdws[k + j]
                    if (cws !== '') {
                      ccsum += parseInt(cws, 10)
                    }
                  }
                  if (ccsum > 0) {
                    ccw = ccsum
                  }
                }
                var cch = this._getTextHeight(text, ccw, fs)
                if (cch > maxHeight) {
                  maxHeight = cch
                }
              }
              cellNode = null
            }// for j
            if (!hasData) {
              maxHeight = crow.offsetHeight
            }
            rowNode.setAttrib('Height', maxHeight)
            rowNode = null
          } else {
            ignoreRow++
          }
        } // for i
        // 获取列宽
        // eslint-disable-next-line no-redeclare
        var rows = mtab.rows[rowMxIndex]
        // eslint-disable-next-line no-redeclare
        for (var j = 0, clen = rows.cells.length; j < clen; j++) {
          var cells = rows.cells[j]
          var cw = cells.offsetWidth
          if (params.maxColWidth != null && cw > params.maxColWidth) {
            cw = params.maxColWidth
          }
          tdWidths[j] = cw
          cells = null
        }
        // 重新计算宽度
        if (colSum > this.maxWidth || this.option.autoWidth == true) {
          var nColSum = 0
          var len = tdWidths.length
          // eslint-disable-next-line no-redeclare
          for (var i = 0; i < len; i++) {
            tdWidths[i] = parseInt(tdWidths[i] * ce, 10)
            nColSum += tdWidths[i]
          }
          ce = this.maxWidth - nColSum
          // eslint-disable-next-line no-redeclare
          for (var i = 0; i < len && ce !== 0; i++) {
            if (ce > 0) {
              tdWidths[i]++
              ce--
            } else {
              tdWidths[i]--
              ce++
            }
          }
        }
        rows = null
        if (tdws instanceof Array) {
          if (tdws.length < tdWidths.length) {
            // eslint-disable-next-line no-redeclare
            for (var i = tdws.length, len = tdWidths.length; i < len; i++) {
              tdws.push(tdWidths[i])
            }
          }
          if (tdws != null) {
            tdWidths = tdws
          }
        }
        // eslint-disable-next-line no-redeclare
        var width = this.getJsonValue(params.width, params.Width)
        // eslint-disable-next-line no-redeclare
        var left = this.getJsonValue(params.left, params.Left, 0)
        if (typeof width === 'string') {
          var index = width.indexOf('%')
          if (index >= 0) {
            width = width.substr(0, index)
            if (width !== '') {
              width = this.maxWidth * parseInt(width, 10) / 100 - left
            }
            tdWidths = this.cacTableWidth(tdWidths, width)
          }
        }
        this.setCellWidths(tabNode, tdWidths.join(','))

        var border = mtab.style.borderWidth || mtab.border
        border = this._getPrintOption(po, ['border', 'Border'], border)
        // 设置连线
        if (params.hasBorder !== true && params.hasBorder !== 'true' &&
	        (border.indexOf('0px') >= 0 ||
	        border === 0 ||
	        border == null ||
	        border === 'medium')) {
          this.setNoBorder(tabNode, 'true')
        }
        // 设置表头列
        if (ml != null) {
          var hrs = '0'
          // eslint-disable-next-line no-redeclare
          for (var i = 1; i < ml - rindex - ignoreRow; i++) {
            hrs += ',' + i
          }
          this.setHeadCount(tabNode, hrs, ml)
        }
        var rly = mtab.getAttribute('relativey')
        rly = this._getPrintOption(po, ['Top', 'top'], rly)
        if (rly != null) {
          tabNode.setAttrib({'RelativeY': 'true',
            'RelativeTableID': '1',
            'Y': rly})
        }
        var lock = ''
        if (params.Lock != null && params.Lock !== '') {
          lock = params.Lock
        }
        lock = this._getPrintOption(po, ['Lock', 'lock'], lock)
        if (lock !== '') {
          tabNode.setAttrib('Lock', lock)
        }
        var np = mtab.getAttribute('printinnewpage')
        np = this._getPrintOption(po, ['printinnewpage', 'printInNewPage', 'PrintInNewPage'], np)
        if (np === true || np === 'true' || np === 'True') {
          tabNode.setAttrib('PrintInNewPage', 'true')
        }
      } // if rindex
    }
    return tabNode
  },
  cacTableWidth: function (tdWidths, newWidth) {
    var oldWidth = 0
    if (typeof tdWidths === 'string') {
      tdWidths = tdWidths.split(/,/g)
    }
    var tlen = tdWidths.length
    if (tlen > 0) {
      for (var i = 0; i < tlen; i++) {
        tdWidths[i] = parseInt(tdWidths[i], 10)
        oldWidth += tdWidths[i]
      }
    }
    // 重新计算宽度
    if (oldWidth !== newWidth) {
      var ce = newWidth / oldWidth
      var nColSum = 0
      var len = tdWidths.length
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < len; i++) {
        tdWidths[i] = parseInt(tdWidths[i] * ce, 10)
        nColSum += tdWidths[i]
      }
      ce = newWidth - nColSum
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < len && ce !== 0; i++) {
        if (ce > 0) {
          tdWidths[i]++
          ce--
        } else {
          tdWidths[i]--
          ce++
        }
      }
    }
    return tdWidths
  },
  /**
   * 添加表格.
   * @param {number} top 表格顶点
   * @param {number} left 表格左点
   * @param {string} id
   */
  addTable: function (option) {
    if (option == null) {
      option = {}
    }
    var tmpNode = this.PageNode.addNode('Table', undefined, this.getJsonValue(option.id, option.Id))
    var headCount = this.getJsonValue(option.headCount, option.HeadCount, 0)
    var heads = []
    if (headCount > 0) {
      for (var i = 0; i < headCount; i++) {
        heads.push(i)
      }
    }
    var tdWidths = this.getJsonValue(option.tdWidths, option.TdWidths, [])
    var width = this.getJsonValue(option.width, option.Width)
    var left = this.getJsonValue(option.left, option.Left, 0)
    if (typeof width === 'string') {
      var index = width.indexOf('%')
      if (index >= 0) {
        width = width.substr(0, index)
        if (width !== '') {
          width = this.maxWidth * parseInt(width, 10) / 100 - left
        }
        tdWidths = this.cacTableWidth(tdWidths, width)
      }
    }
    tmpNode.setAttrib({'X': this.getJsonValue(option.left, option.Left, 0),
      'Y': this.getJsonValue(option.top, option.Top, 0),
      'IsTD': this.getJsonValue(option.border, option.Border, 1) === 0,
      'TdWidths': tdWidths,
      'Lock': this.getJsonValue(option.lock, option.Lock, 'Center'),
      'headRowCount': headCount,
      'HeaderRows': heads.join(','),
      'lessRows': this.getJsonValue(option.lessRows, option.LessRows, 0)
    })
    return tmpNode
  },
  /**
   * 添加整个表格.
   * @param {JSON}  option 数据包
   * @param {number} option.top 表格顶点
   * @param {number} option.left 表格左点
   * @param {string} option.id 表格id
   * @param {ARRAY}  option.rows 行数据包
   * @param {number} option.rows[n].height 行高
   * @param {string} option.rows[n].dataFields 表数据项
   * @param {ARRAY}  option.rows[n].cells 明细数据
   * @param {number} option.rows[n].cells[n].text 文本内容
   * @param {string} option.rows[n].cells[n].dataField 单元数据项
   * @param {number} option.rows[n].cells[n].colSpan 占用列数
   * @param {number} option.rows[n].cells[n].rowSpan 占用行数
   * @param {number} option.rows[n].cells[n].fontSize 字体大小
   * @param {string} option.rows[n].cells[n].align 横对齐 Left, Center, Right
   * @param {string} option.rows[n].cells[n].lineAlign 列对齐 Top, Center, Bottom
   */
  addTables: function (option) {
    if (option == null) {
      return
    }
    var tab = this.addTable(option)
    var rows = this.getJsonValue(option.rows, option.Rows, [])
    this.addRows(tab, rows)
  },
  /**
   * 添加行.
   * @param {node} table 表格节点.
   * @param {number} height 高度
   */
  addRow: function (table, option) {
    if (option == null) {
      option = {}
    }
    var tr = table.addNode('Tr')
    tr.setAttrib('Height', this.getJsonValue(option.height, option.Height, 42))
    var dfs = this.getJsonValue(option.dataFields, option.DataFields)
    if (dfs != null) {
      this.setDataFields(tr, dfs)
    }
    return tr
  },
  /**
   * 添加行明细对象.
   * @param {NODE}   tabNode 表格对象,
   * @param {JSON}   datas 数据包
   * @param {number} datas.height 行高
   * @param {string} datas.dataFields 表数据项
   * @param {ARRAY}  datas.cells 明细数据
   * @param {number} datas.cells[n].text 文本内容
   * @param {string} datas.cells[n].dataField 单元数据项
   * @param {number} datas.cells[n].colSpan 占用列数
   * @param {number} datas.cells[n].rowSpan 占用行数
   * @param {number} datas.cells[n].fontSize 字体大小
   * @param {string} datas.cells[n].align 横对齐 Left, Center, Right
   * @param {string} datas.cells[n].lineAlign 列对齐 Top, Center, Bottom
   */
  addRows: function (table, datas) {
    if (datas == null) {
      return
    }
    var rlen = datas.length
    for (var i = 0; i < rlen; i++) {
      var data = datas[i]
      var trOption = {}
      trOption.height = this.getJsonValue(data.height, data.Height, 25)
      var dataFields = this.getJsonValue(data.dataFields, data.DataFields)
      if (dataFields != null) {
        trOption.dataFields = dataFields
      }
      var tr = this.addRow(table, trOption)
      var cells = this.getJsonValue(data.cells, data.Cells, [])
      var clen = cells.length
      for (var j = 0; j < clen; j++) {
        var cell = cells[j]
        this.addCell(tr, cell)
      }
    }
  },
  /**
   * 添加单元格.
   * @param {node} row 行节点
   * @param {string} text 内容
   * @param {JSON} option 属性
   * @param {string} option.dataField 单元数据项
   * @param {number} option.colSpan 占用列数
   * @param {number} option.rowSpan 占用行数
   * @param {number} option.fontSize 字体大小
   * @param {string} option.align 横对齐 Left, Center, Right
   * @param {string} option.B 加粗 Boolean
   * @param {string} option.U 下划线 Boolean
   * @param {string} option.I 斜体 Boolean
   */
  addCell: function (row, text, option) {
    if (typeof text === 'object') {
      option = text
      text = this.getJsonValue(option.text, option.Text, '')
    }
    var cellNode = row.addNode('Td', text)
    if (option == null) {
      option = {}
    }
    cellNode.setAttrib({'ColSpan': this.getJsonValue(option.colSpan, option.ColSpan, 1),
      'RowSpan': this.getJsonValue(option.rowSpan, option.RowSpan, 1),
      'Alignment': this.getJsonValue(option.align, option.Align, 'Left'),
      'LineAlignment': this.getJsonValue(option.lineAlign, option.LineAlign, 'Center'),
      'FontSize': this.getJsonValue(option.fontSize, option.FontSize, 11),
      'B': this.getJsonValue(option.B, option.b, ''),
      'U': this.getJsonValue(option.U, option.u, ''),
      'I': this.getJsonValue(option.I, option.i, '')})
    var dataField = this.getJsonValue(option.dataField, option.DataField)
    if (dataField != null) {
      var dfs = null
      if (cellNode.pNode != null) {
        dfs = cellNode.pNode.dataFields
      }
      this.setDataField(cellNode, dataField, dfs)
    }
    return cellNode
  },
  setCellWidths: function (table, widths) {
    table.setAttrib('TdWidths', widths)
  },
  setHeadCount: function (table, rowIndexs, count) {
    table.setAttrib('HeaderRows', rowIndexs)
    table.setAttrib('headRowCount', count)
  },
  setFixColumn: function (table, count) {
    table.setAttrib('FixColumnCount', count)
  },
  setDataField: function (obj, value, dfNode) {
    obj.setAttrib('dataField', value, dfNode)
  },
  setDataFields: function (obj, value) {
    return obj.setAttrib('dataFields', value)
  },
  getTableById: function (id) {
    return this.xmlDoc.getNode('Report/Page/Table&' + id)
  },
  getTextById: function (id) {
    return this.xmlDoc.getNode('Report/Page/Text&' + id)
  },
  setTop: function (node, top) {
    node.setAttrib('Y', top)
  },
  setLeft: function (node, left) {
    node.setAttrib('X', left)
  },
  getTop: function (node) {
    return node.getAttrib('Y')
  },
  getLeft: function (node) {
    return node.getAttrib('X')
  },
  getHeadCount: function (tabNode) {
    return tabNode.getAttrib('headRowCount')
  },
  getDataField: function (dataField) {
    if (dataField == null) {
      return this.xmlDoc.dataField
    } else {
      return this.xmlDoc.dataField[dataField]
    }
  },
  updateDataField: function (dataField, value) {
    this.xmlDoc.setDataField(dataField, value)
  },
  updateDataFields: function (dataFields, dataJson, pnode) {
    this.xmlDoc.setDataFields(dataFields, dataJson, pnode)
  },
  appendDataFields: function (dataFields) {
    return this.xmlDoc.appendDataFields(dataFields)
  },
  getDataFields: function () {
    var dfs = []
    var dfjson = this.xmlDoc.dataFields
    for (var key in dfjson) {
      dfs.push(dfjson[key])
    }
    return dfs
  },
  hasDataFields: function (dataFields) {
    var dfs = this.xmlDoc.getDataFields(dataFields)
    return (dfs != null)
  },
  /**
   * 设置页眉.
   * @param {string} value 值
   * @param {JSON} option 属性
   * @param {boolean} option.isShowLine:显示下画线,
   * @param {string} option.LineAlignment:纵对齐,
   * @param {string} option.fontName:字体名称,
   * @param {number} option.fontSize:字体大小,
   * @param {boolean} option.I:I斜体
   * @param {boolean} option.B:B粗体
   * @param {boolean} option.U:U底线
   * @param {boolean} option.S:S删除线
   */
  setHeader: function (value, option) {
    if (!(value instanceof Array) && typeof value === 'object') {
      option = value
      value = this.getJsonValue(option.text, option.Text, '')
    }
    if (value != null && ((value instanceof Array && value.length > 0) || value !== '')) {
      var ftNode = this.ReportNode.addNode('Header')
      // 设置各样式属性
      if (typeof option === 'object') {
        for (var key in option) {
          if (option[key] != null) {
            ftNode.setAttrib(key, option[key])
          }
        }
      }
      if (value instanceof Array) {
        if (value[0] != null && value[0] !== '') {
          ftNode.addNode('LeftValue', value[0])
        }
        if (value[1] != null && value[1] !== '') {
          ftNode.addNode('CenterValue', value[1])
        }
        if (value[2] != null && value[2] !== '') {
          ftNode.addNode('RightValue', value[2])
        }
      } else {
        var align = this.getJsonValue(option.align, option.Align, 'Center')
        if (align === 'Center' || align === 'center') {
          ftNode.addNode('CenterValue', value)
        } else if (align === 'Right' || align === 'right') {
          ftNode.addNode('RightValue', value)
        } else {
          ftNode.addNode('LeftValue', value)
        }
      }
    }
  },
  /**
   * 设置页脚.
   * @param {string} value 值
   * @param {JSON} option 属性
   * @param {boolean} option.isShowLine:显示下画线,
   * @param {string} option.LineAlignment:纵对齐,
   * @param {string} option.fontName:字体名称,
   * @param {number} option.fontSize:字体大小,
   * @param {boolean} option.I:I斜体
   * @param {boolean} option.B:B粗体
   * @param {boolean} option.U:U底线
   * @param {boolean} option.S:S删除线
   */
  setFooter: function (value, option) {
    if (!(value instanceof Array) && typeof value === 'object') {
      option = value
      value = this.getJsonValue(option.text, option.Text, '')
    }
    if (value != null && ((value instanceof Array && value.length > 0) || value !== '')) {
      var ftNode = this.ReportNode.addNode('Footer')
      // 设置各样式属性
      if (typeof option === 'object') {
        for (var key in option) {
          if (key !== 'text' && key !== 'Text' && option[key] != null) {
            ftNode.setAttrib(key, option[key])
          }
        }
      }
      if (value instanceof Array) {
        if (value[0] != null && value[0] !== '') {
          ftNode.addNode('LeftValue', value[0])
        }
        if (value[1] != null && value[1] !== '') {
          ftNode.addNode('CenterValue', value[1])
        }
        if (value[2] != null && value[2] !== '') {
          ftNode.addNode('RightValue', value[2])
        }
      } else {
        var align = this.getJsonValue(option.align, option.Align, 'Center')
        if (align === 'Center' || align === 'center') {
          ftNode.addNode('CenterValue', value)
        } else if (align === 'Right' || align === 'right') {
          ftNode.addNode('RightValue', value)
        } else {
          ftNode.addNode('LeftValue', value)
        }
      }
    }
  },
  setPrinter: function (value) {
    if (value != null) {
      var pn = this.ReportNode.addNode('Printer')
      pn.setAttrib('Name', value)
      pn = null
    }
  },
  getPrinter: function () {
    var pn = this.ReportNode.getNode('Printer')
    if (pn == null) {
      return ''
    } else {
      return pn.getAttrib('Name')
    }
  },
  setZoomValue: function (value) {
    if (value != null) {
      this.ReportNode.setAttrib('Scale', value)
    }
  },
  setDocumentName: function (value) {
    if (value != null) {
      this.ReportNode.setAttrib('DocumentName', value)
    }
  },
  setRecordAPage: function (value) {
    if (value != null) {
      this.ReportNode.setAttrib('RowCountPerPage', value)
    }
  },
  setRowCountPerPage: function (tab, value) {
    tab.setAttrib('RowCountPerPage', value)
  },
  setNoBorder: function (tab, value) {
    tab.setAttrib('IsTD', value)
  },
  setPrintAllTable: function (value) {
    this.printAllTable = value
  },
  getPrintAllTable: function () {
    return this.printAllTable
  },
  /**
   * 获取打印机列表.
   */
  getSysPrinter: function (callBack) {
    var prs = this.getPrinters()
    var dpr = this.getDefPrinter()
    var _this = this
    // 通过插件获取不到.
    if (prs === 'null') {
      this.utils.activeInvoke('PdfPrint.printer', 'getPrinterList', [], function (state, res) {
        if (state) {
          // eslint-disable-next-line no-useless-escape
          prs = res.replace(/\"/g, '').split(',')
          _this.utils.activeInvoke('PdfPrint.printer', 'getDefPrinter', [], function (cst, cres) {
            if (cst) {
              dpr = cres
              var len = prs.length
              var prms = []
              for (var i = 0; i < len; i++) {
                prms.push({id: prs[i], text: prs[i]})
              }
              if (typeof callBack === 'function') {
                callBack(prms, dpr)
              }
            } else {
              if (typeof callBack === 'function') {
                callBack([], '')
              }
            }
            _this = null
          })
        } else {
          if (typeof callBack === 'function') {
            callBack([], '')
          }
        }
      })
    } else {
      if (typeof callBack === 'function') {
        callBack(prs, dpr)
      }
    }
  },
  getPrinters: function () {
    if (this.printers == null) {
      var reData = []
      if (this.getBrowser('msie')) {
        try {
          // eslint-disable-next-line no-undef
          var WshNetwork = new ActiveXObject('WScript.Network')
          var oPrinters = WshNetwork.EnumPrinterConnections()
          for (var i = 0, j = 0; i < oPrinters.length; i += 2, j++) {
            reData[j] = {}
            reData[j].id = oPrinters.Item(i + 1)
            reData[j].text = oPrinters.Item(i + 1)
          }
          WshNetwork = null
          oPrinters = null
        } catch (e) {
          reData = 'null'
        }
      } else {
        var obj = this.getPrintObj()
        try {
          var result = obj.printerList()
          if (result !== '') {
            var prAry = result.split('&@')
            if (prAry.length > 1) {
              this.defPrinter = prAry[1]
            }
            prAry = prAry[0].split('&#')
            // eslint-disable-next-line no-redeclare
            for (var i = 0; i < prAry.length; i++) {
              reData[i] = {}
              reData[i].id = prAry[i]
              reData[i].text = prAry[i]
            }
          }
        } catch (e) {
          reData = 'null'
        }
      }
      this.printers = reData
    }
    return this.printers
  },
  getDefPrinter: function () {
    if (this.defPrinter == null) {
      var bKey = ''
      try {
        if (this.getBrowser('msie')) {
          // eslint-disable-next-line no-undef
          var shell = new ActiveXObject('WScript.Shell')
          bKey = shell.RegRead('HKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Windows\\Device')
          var Key = bKey.split(',')
          bKey = Key[0]
        } else {
          bKey = this.defPrinter
        }
      } catch (e) {
        bKey = ''
      }
      this.defPrinter = bKey
    }
    return this.defPrinter
  },
  getPrintObj: function () {
    if (this.printObj == null) {
      try {
        if (this.getBrowser('msie')) {
          // eslint-disable-next-line no-undef
          this.printObj = new ActiveXObject('YGSoft.Finance.Printing.InvoicePrint')
        } else {
          var oprt = document.createElement('embed')
          oprt.id = 'dlltool1'
          oprt.type = 'application/rpygtooljs'
          oprt.width = 1
          oprt.height = 1
          oprt.style.position = 'absolute'
          oprt.style.top = '0px'
          oprt.style.left = '0px'
          document.body.appendChild(oprt)
          if (typeof oprt.caller === 'function') {
            this.printObj = oprt
            this.useTool = true
          } else {
            var nprt = document.createElement('embed')
            nprt.id = 'dlltool2'
            nprt.type = 'application/rpygecprtjs'
            nprt.width = 1
            nprt.height = 1
            nprt.style.position = 'absolute'
            nprt.style.top = '0px'
            nprt.style.left = '0px'
            this.useTool = false
            document.body.appendChild(nprt)
            if (typeof nprt.caller === 'function') {
              this.printObj = nprt
            } else {
              this.printObj = null
            }
          }
        }
      } catch (e) {
        this.printObj = null
      }
    }
    return this.printObj
  },
  /**
   * 获得行最大值
   */
  _getItemMaxHeight: function (df) {
    var mh = parseInt(df.node.getAttrib('Height') || 24, 10)
    for (var key in df.cnode) {
      var cn = df.cnode[key]
      if (cn.value != null) {
        // 大小写处理
        var numupper = cn.getAttrib('numUpper') || cn.getAttrib('NumUpper')
        if (numupper != null && numupper !== '') {
          cn.value = this.numUpper(cn.value, numupper)
        }
        // 加密处理
        var fstyle = cn.getAttrib('formatStyle')
        if (fstyle != null && fstyle !== '') {
          cn.value = this._getFormatStr(cn.value, fstyle)
        }
        var ch = this._getTextHeight(cn.value,
          this._getTdWidth(cn),
          parseInt(cn.getAttrib('FontSize') || 9, 10))

        if (ch > mh) {
          mh = ch
        }
      }
    }
    return mh
  },
  // 分组排序.
  groupSort: function (datas, fieldName, sumdf) {
    var i
    var len = datas.length
    // var emtyVal = []
    var valJson = {}
    var sumgroups = {}
    for (i = 0; i < len; i++) {
      var cdata = datas[i]
      var keyVal = cdata[fieldName]
      if (keyVal == null || keyVal === undefined || keyVal === '') {
        keyVal = '_NULL'
      }
      if (valJson[keyVal] === undefined) {
        valJson[keyVal] = [cdata]
      } else {
        valJson[keyVal].push(cdata)
      }
      // 计算合计
      if (sumdf != null) {
        if (sumgroups[keyVal] == null) {
          sumgroups[keyVal] = {}
        }
        for (var key in sumdf.cnode) {
          var cv = cdata[key] || 0
          if (isNaN(cv) === true) {
            cv = 0
          } else if (typeof cv === 'string') {
            cv = parseFloat(cv, 10)
          }
          if (sumgroups[keyVal][key] == null) {
            sumgroups[keyVal][key] = 0
          }
          sumgroups[keyVal][key] = sumgroups[keyVal][key] + cv
        }
      }
    }
    var re = []
    var sumre = []
    // 把分组的再连在一起
    // eslint-disable-next-line no-redeclare
    for (var keyVal in valJson) {
      re.push(valJson[keyVal])
      sumre.push(sumgroups[keyVal])
    }
    return {'datas': re, 'sums': sumre}
  },
  // 生成合并数据.
  mergeGridData: function (formatXml, items, sums, dataField, sumDataField) {
    var rowNode = dataField.node
    var defHeight = 25
    // 非分组打印的时候.
    var j = 0
    var len = items.length
    for (; j < len; j++) {
      if (j > 0) {
        rowNode = formatXml.appendDataFields(dataField)
        rowNode.setAttrib('Height', defHeight)
      } else {
        defHeight = rowNode.getAttrib('Height')
        if (defHeight == null || defHeight === '') {
          defHeight = 25
        }
      }
      var item = items[j]
      // 添加序号显示
      if (item != null && item.rn == null) {
        item.rn = j + 1
      }
      // var rh = this._getItemMaxHeight(dataField);
      formatXml.setDataFields(dataField, item)
      var rh = this._getItemMaxHeight(dataField)
      rowNode.setAttrib('Height', rh)
    }
    // 打印空白行.
    var tab = rowNode.pNode
    if (tab != null) {
      var lessRows = tab.getAttrib('lessRows')
      if (lessRows == null) {
        lessRows = 1
      }
      for (; j < lessRows; j++) {
        if (j > 0) {
          rowNode = formatXml.appendDataFields(dataField)
          rowNode.setAttrib('Height', defHeight)
        } else {
          defHeight = rowNode.getAttrib('Height')
          if (defHeight == null || defHeight === '') {
            defHeight = 25
          }
        }
        // eslint-disable-next-line no-redeclare
        var item = {}
        formatXml.setDataFields(dataField, item)
        rowNode.setAttrib('Height', defHeight)
      }
    } // if tab

    // 更新合计行
    if (sums != null && sumDataField != null) {
      formatXml.setDataFields(sumDataField, sums)
      rowNode = sumDataField.node
      // eslint-disable-next-line no-redeclare
      var rh = this._getItemMaxHeight(sumDataField)
      if (rh < defHeight) {
        rh = defHeight
      }
      rowNode.setAttrib('Height', rh)
    }
  },
  // 模板 + 数据包合并
  getPrintXmlData: function (formatXml, datas, callBack) {
    if (typeof formatXml === 'string') {
      if (formatXml.indexOf('<?xml') < 0) {
        // formatXml = $.ecp.des.decodeBase64(formatXml, true); //encodeBase64
      }
      var fxo = new PrintXmlDoc()
      fxo.setXml(formatXml)
      formatXml = fxo
      fxo = null
    }
    if (typeof datas !== 'object') {
      return formatXml
    }
    var dfs = formatXml.dataField
    // 更新所有dataFields
    for (var dataField in dfs) {
      if (datas[dataField] == null) {
        datas[dataField] = ''
      }
      // 流程岗位信息.
      if (dataField === '_postflow' || dataField === '_POSTFLOW') {
        var dataList = datas[dataField]
        if (dataList == null) {
          dataList = datas[dataField.toUpperCase()]
        }
        if (dataList instanceof Array && dataList.length > 0) {
          var td = dfs[dataField]
          var tab = td.pNode.pNode
          var k = 0
          var dlen = dataList.length

          for (var i = 0, rlen = tab.nodeAry.length; i < rlen && k < dlen; i++) {
            var tr = tab.nodeAry[i]
            for (var j = 0, clen = tr.nodeAry.length; j < clen && k < dlen; j++) {
              td = tr.nodeAry[j]
              var postName = dataList[k].postName || dataList[k].POSTNAME
              var userName = dataList[k].userName || dataList[k].USERNAME || ''
              var val = postName + ':' + userName
              td.value = val
              k++
            }
            tr = null
          }
          td = null
          tab = null
        }
      } else {
        var cn = dfs[dataField]
        var cvl = datas[dataField]
        if (cvl == null || cvl === '') {
          cvl = datas[dataField.toUpperCase()]
          if (cvl == null) {
            cvl = ''
          }
        }
        cn.value = cvl
        var numupper = cn.getAttrib('NumUpper')
        if (numupper != null && numupper !== '') {
          cn.value = this.numUpper(cn.value, numupper)
        }
        var fstyle = cn.getAttrib('formatStyle')
        if (fstyle != null && fstyle !== '') {
          cn.value = this._getFormatStr(cn.value, fstyle)
        }
        if (cn.name === 'Td') {
          var mh = this._getTextHeight(cn.value,
            this._getTdWidth(cn),
            parseInt(cn.getAttrib('FontSize') || 9, 10))
          var ch = parseInt(cn.pNode.getAttrib('Height'), 10)
          if (mh > ch) {
            ch = mh
          }
          cn.pNode.setAttrib('Height', ch)
        }
        var cdf = cn.childDataField
        if (cdf != null) {
          // eslint-disable-next-line no-redeclare
          for (var i = 0, len = cdf.length; i < len; i++) {
            var ccn = cdf[i]
            ccn.value = cvl
            // eslint-disable-next-line no-redeclare
            var numupper = ccn.getAttrib('NumUpper')
            if (numupper != null && numupper !== '') {
              ccn.value = this.numUpper(ccn.value, numupper)
            }
            // eslint-disable-next-line no-redeclare
            var fstyle = ccn.getAttrib('formatStyle')
            if (fstyle != null && fstyle !== '') {
              ccn.value = this._getFormatStr(ccn.value, fstyle)
            }
            if (ccn.name === 'Td') {
              // eslint-disable-next-line no-redeclare
              var mh = this._getTextHeight(ccn.value,
                this._getTdWidth(ccn),
                parseInt(ccn.getAttrib('FontSize') || 9, 10))
              // eslint-disable-next-line no-redeclare
              var ch = parseInt(ccn.pNode.getAttrib('Height'), 10)
              if (mh > ch) {
                ch = mh
              }
              ccn.pNode.setAttrib('Height', ch)
            }
            ccn = null
          }
        }
        var aw = cn.getAttrib('AutoWidth')
        if (aw === true || aw === 'true') {
          var cnval = cn.value
          if (cnval == null || cnval === '') {
            cn.setAttrib('Width', 1)
          } else {
            var fs = cn.getAttrib('FontSize')
            if (fs == null || fs === '') {
              fs = 12
            } else {
              fs = parseInt(fs, 10)
            }
            var cnw = this._getTextWidthExt(cnval, fs) + 16
            cn.setAttrib('Width', cnw)
          }
        }
        var lw = cn.getAttrib('AfterLeft')
        if (lw != null && lw !== '') {
          var lcn = cn.pNode.getNode('Text&' + lw)
          if (lcn != null) {
            var lcnl = lcn.getAttrib('X')
            if (lcnl == null || lcnl === '') {
              lcnl = 0
            } else {
              lcnl = parseInt(lcnl, 10)
            }
            var lcnw = lcn.getAttrib('Width')
            if (lcnw == null || lcnw === '') {
              lcnw = 0
            } else {
              lcnw = parseInt(lcnw, 10)
            }
            var ocnw = cn.getAttrib('Width')
            if (ocnw == null || ocnw === '') {
              ocnw = 0
            } else {
              ocnw = parseInt(ocnw, 10)
            }
            cn.setAttrib('X', lcnl + lcnw + 8)
            cn.setAttrib('Width', ocnw * 2 - lcnw)
          }
        }
      } // else
    }
    // 更新所有子表数据
    // eslint-disable-next-line no-redeclare
    var dfs = formatXml.dataFields
    var defHeight = 25
    if (dfs != null && dfs.length > 0) {
      dfs = []
      // eslint-disable-next-line no-redeclare
      for (var i = 0, ilen = formatXml.dataFields.length; i < ilen; i++) {
        dfs.push(formatXml.dataFields[i])
      }
      var tmp = null
      // eslint-disable-next-line no-redeclare
      var k = 0
      var rowNode = dfs[0].node
      var count = dfs.length
      var groupField = this.option.subgroupField
      // 循环所有dataField
      // eslint-disable-next-line no-redeclare
      for (var i = 0; i < count; i++) {
        var df = dfs[i]
        if (df.cnode == null) continue
        rowNode = df.node
        // tmp 为空， 或name不一样，或不是同一张表
        if (tmp == null || tmp.name !== df.name || tmp.node.pNode.index != df.node.pNode.index) {
          // 更新普通行
          // eslint-disable-next-line no-redeclare
          var dataField = df.name
          var items = datas[dataField]
          if (items == null) {
            items = datas[dataField.toUpperCase()]
          }

          if (items != null) {
            var isgroup = false
            if (groupField != null && groupField.indexOf(dataField) != -1) {
              var cdataFields = df.cnode
              for (var key in cdataFields) {
                if (groupField.indexOf(key) >= 0) {
                  isgroup = true
                  break
                }
              }
            }
            if (isgroup === true) {
              // 获取合计行
              var sumdf = null
              if (i + 1 < count) {
                sumdf = dfs[i + 1]
                if (sumdf.name !== df.name) {
                  sumdf = null
                } else {
                  i++
                }
              }
              // 分组处理
              var gfields = groupField.split('.')
              var groupary = this.groupSort(items, gfields[1], sumdf)
              for (var g = 0, glen = groupary.datas.length; g < glen; g++) {
                this.mergeGridData(formatXml, groupary.datas[g], groupary.sums[g], df, sumdf)
                // 克隆一个全新的表格，然后继续合并数据
                var ndfs = this.xmlDoc.cloneTableNode(df)
                // 默认在下一页打印.
                df = ndfs[0]
                df.node.pNode.setAttrib('PrintInNewPage', 'true')
                if (ndfs.length > 1) {
                  sumdf = ndfs[1]
                }
              }
            } else {
              // 非分组打印的时候.
              // eslint-disable-next-line no-redeclare
              var j = 0
              // eslint-disable-next-line no-redeclare
              var len = items.length
              var ccdf = df
              for (; j < len; j++) {
                if (j > 0) {
                  rowNode = formatXml.appendDataFields(df)
                  rowNode.setAttrib('Height', defHeight)
                  ccdf = rowNode._dataFields
                } else {
                  defHeight = rowNode.getAttrib('Height')
                  if (defHeight == null || defHeight === '') {
                    defHeight = 25
                  }
                }
                var item = items[j]
                // 添加序号显示
                if (item != null && item.rn == null) {
                  item.rn = j + 1
                }
                // var rh = this._getItemMaxHeight(df);
                formatXml.setDataFields(ccdf, item)
                var rh = this._getItemMaxHeight(ccdf)
                rowNode.setAttrib('Height', rh)
              }
              // 打印空白行.
              // eslint-disable-next-line no-redeclare
              var tab = rowNode.pNode
              if (tab != null) {
                var lessRows = tab.getAttrib('lessRows')
                if (lessRows == null) {
                  lessRows = 1
                }
                // eslint-disable-next-line no-redeclare
                var ccdf = df
                for (; j < lessRows; j++) {
                  if (j > 0) {
                    rowNode = formatXml.appendDataFields(df)
                    rowNode.setAttrib('Height', defHeight)
                    ccdf = rowNode._dataFields
                  } else {
                    defHeight = rowNode.getAttrib('Height')
                    if (defHeight == null || defHeight === '') {
                      defHeight = 25
                    }
                  }
                  // eslint-disable-next-line no-redeclare
                  var item = {}
                  // 添加序号显示
                  formatXml.setDataFields(ccdf, item)
                  rowNode.setAttrib('Height', defHeight)
                }
              } // if tab
            }// if isgroup
          } // if items
          k = 0
        } else {
          // 更新合计行
          // eslint-disable-next-line no-redeclare
          var dataField = df.name
          // eslint-disable-next-line no-redeclare
          var items = datas[dataField + '_sum']
          if (items == null) {
            items = datas[dataField.toUpperCase() + '_sum']
          }
          if (items != null) {
            formatXml.setDataFields(df, items[k])
          }
          rowNode = df.node
          // eslint-disable-next-line no-redeclare
          var rh = this._getItemMaxHeight(df)
          if (rh < defHeight) {
            rh = defHeight
          }
          rowNode.setAttrib('Height', rh)
          k++
        }
        tmp = df
      } // for i
    }
    return formatXml
  },
  setPrintCounts: function () {
    // todo
  },
  getContextPath: function () {
    var cp = window._ecp_remote_context_path
    if (cp != null && cp !== '') {
      var res = cp
      return res
    }
    var baseStr = '/mapp/'
    var assertsStr = '/assets/'
    var baseUrl = window.location.pathname
    var bi = baseUrl.indexOf(baseStr)

    // eslint-disable-next-line no-redeclare
    var res = ''
    if (bi >= 0) {
      baseUrl = baseUrl.substr(0, bi)
      res = baseUrl.replace(/\/[^\/]+$/, '')
    } else {
      bi = baseUrl.indexOf(assertsStr)
      if (bi >= 0) {
        res = baseUrl.substr(0, bi)
      }
    }
    if (window.console) {
      window.console.log('context path is:' + res)
    }
    return res
  },
  /**
   * 预览显示输出的pdf.
   * @param params 参数集
   * @param disEncode 不进行编码
   * @return true 返回状态.
   */
  previewToPdf: function (params, hasEncode) {
    var form = document.createElement('form')
    form.setAttribute('style', 'display:none;position:absolute;top:0px;left:0px;')
    var download = params.download === true || params.download === 'true'
    if (download) {
      form.setAttribute('target', '')
    } else {
      form.setAttribute('target', '_blank')
    }
    form.setAttribute('accept-charset', 'UTF-8')
    // form.attr("enctype","text/plain");
    form.setAttribute('enctype', 'multipart/form-data')
    form.setAttribute('method', 'post')
    var vipAddress = params.vipAddress
    if (vipAddress == null) {
      vipAddress = ''
    }
    vipAddress = decodeURIComponent(vipAddress)
    form.setAttribute('action', this.getContextPath() + vipAddress + servletName)
    document.body.appendChild(form)
    for (var key in params) {
      if (typeof params[key] === 'object') {
        params[key] = JSON.stringify(params[key])
      }
      if (params[key] != null && params[key] !== '') {
        var vals = params[key]
        if (typeof vals === 'string') {
          // eslint-disable-next-line no-useless-escape
          vals = vals.replace(/\-\-/g, '—')
        }
        var input = document.createElement('input')
        input.setAttribute('type', 'hidden')
        input.setAttribute('name', key)
        if (hasEncode !== true) {
          vals = encodeURIComponent(vals)
        }
        input.setAttribute('value', vals)
        form.appendChild(input)
      }
    }
    form.submit()
  },
  /**
   * 调用3.0版本的接口，打印成pdf，
   *  @param printType 调用类型 Print|Preview
   *  @param {json}params 调用参数json对象
   *         {string}params.i18n 国际化语言
   *         {json} params.context 上下文对象
   *         {string}params.result 导出类型 值包括：空、html， 默认：空
   *         {boolean}params.mergefield 是否需要合并数据项目
   *         {string}params.formatid 通用单据的格式id 可选
   *         {string}params.classid 通用单据的分类id 可选
   *         {string}params.typeid 通用单据的类型id 可选
   *         {string}params.watermark 通用单据的分类id 可选
   *         {string}params.beanId 数据源bean 可选, 默认：
   *                      com.ygsoft.ecp.component.pdf.adapter.BillPdfDataSource
   *         {string}params.templateType 模板类型 可选 file、string 默认：file
   *         {string}params.template 模板文件或者字符串 可选 默认：pdf_def_temp,
   *             使用其它bundle中的模板时传入的格式是  bundleName#templatePaths
   *         {json}params.fieldJson 数据项目数据包 可选
   *         {json}params.data 数据包
   *         {json}params.pageOption 页面配置包 可选
   *         {json}params.hideItems 隐藏项目 可选
   *         {json}params.groupTitle 分组标题 可选
   */
  printToPdfExt: function (printType, params, printer, callBack) {
    if (typeof printer === 'function') {
      callBack = printer
      printer = ''
    }
    if (params != null) {
      // 获取语言类型
      params.i18n = this.utils.getLanguage()
      // eslint-disable-next-line one-var
      var printState = 'ERROR', hasEncode = false
      if (printType === 'Print') {
        var lh = this._getLocation()
        params['encoding'] = 'GBK'
        for (var key in params) {
          if (typeof params[key] === 'object') {
            params[key] = JSON.stringify(params[key])
          }
          if (params[key] != null && params[key] !== '') {
            params[key] = encodeURIComponent(params[key])
          }
        }
        hasEncode = true
        printState = 'INFO'
        var _this = this
        if (window.console) {
          window.console.info('print to pdf.')
        }
        var vipAddress = params.vipAddress
        if (vipAddress == null) {
          vipAddress = ''
        }
        vipAddress = decodeURIComponent(vipAddress)
        // 调用插件打印
        this.utils.activeInvoke('PdfPrint.printer', 'Print',
          [lh + this.getContextPath() + vipAddress + servletName, JSON.stringify(params), printer],
          function (state, result) {
            if (state === false) {
              params['encoding'] = ''
              // 打印失败
              _this.previewToPdf(params, hasEncode)
              _this = null
            }
            if (typeof callBack === 'function') {
              callBack(result)
            }
          })
      }
      // 打印失败的时候，只能预览.
      if (printState === 'ERROR') {
        this.previewToPdf(params, hasEncode)
        if (typeof callBack === 'function') {
          callBack('')
        }
      } // 输出显示
    } else {
      if (typeof callBack === 'function') {
        callBack('')
      }
    }
  },
  /**
   * 2.0格式打印到pdf.
   */
  printToPdf: function (printType, params, printer, callBack) {
    if (typeof printer === 'function') {
      callBack = printer
      printer = ''
    }
    this.printToPdfExt(printType, params, printer, callBack)
  },

  /**
   * 初始化数据包.
   */
  initData: function (params, callBack) {
    if (params != null) {
      if (params.xmlStr != null && typeof params.xmlStr === 'string') {
        this.xmlDoc.setXml(params.xmlStr)
      }
      this.xmlDoc = this.getPrintXmlData(this.xmlDoc, params.data)
    }
    // do init data
    if (typeof (callBack) === 'function') {
      callBack(params)
    }
  },
  /**
   * @param params 全局的参数,
   * @param prms 当前initData的参数
   * @param callBack 回调函数
   */
  afterPrint: function (params, prms, printState, callBack) {
    // 处理回调函数
    if (params != null && params.printScheme != null && typeof params.printScheme.callBack === 'function') {
      params.printScheme.callBack(params)
    } else if (prms != null && typeof prms.callBack === 'function') {
      prms.callBack(prms)
    }
    if (typeof callBack === 'function') {
      callBack(this.xmlDoc.toString(true))
    }
    // 设置打印次数.
    if (printState === 'true') {
      this.setPrintCounts()
    }
  },
  /**
   * 执行打印数据.
   * @param {String} printType 打印方式 Preview|Print
   * @param {JSON} params 参数列表
   */
  printData: function (printType, params, callBack) {
    var _this = this
    return new Promise(function (resolve, reject) {
      _this.initData(params, function (prms, msg) {
        if (params != null && params.keepurl === true) {
          _this.ReportNode.setAttrib('keepurl', true)
        }
        // 处理打印失败的分支
        if (prms === false) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(false, msg)
          if (typeof callBack === 'function') {
            callBack(false, msg)
          }
        } else if (params != null && params.printScheme != null &&
          params.printScheme.notPrint === true) {
          resolve(_this.xmlDoc.toString(true))
          if (typeof callBack === 'function') {
            callBack(_this.xmlDoc.toString(true))
          }
        } else {
          // eslint-disable-next-line one-var
          var printState = 'false', printer = ''

          if (prms != null && prms.printType === 'printPdf') {
            // 调用3.0的pdf打印接口.
            _this.printToPdfExt(printType, prms, printer, function (res) {
              _this.afterPrint(params, prms, 'true', callBack)
              resolve(_this.xmlDoc.toString(true))
            })
          } else {
            // 给字符串添加结束符，因为chrome会自动增加乱码在字符串后面.
            _this.xmlStr = _this.xmlDoc.toString()
            // 替换IP地址
            var lh = _this._getLocation() + '/'
            if (lh !== '' && params != null && params.keepurl !== true) {
              _this.xmlStr = _this.xmlStr.replace(/[hH][tT][tT][pP]:\/\/[0-9]+.[0-9]+.[0-9]+.[0-9]+:[0-9]+\//g, lh)
            }
            // 浏览器统一调用这个接口.
            try {
              // eslint-disable-next-line no-unused-vars
              var pcount = 1
              if (window.console) {
                window.console.info('use YGSoft.Finance.Printing.InvoicePrint to print!')
              }
              _this.utils.activeInvoke('YGSoft.Finance.Printing.InvoicePrint', printType, [encodeURIComponent(_this.xmlStr), 1, 1, 0, ''])
                .then(function (state, res) {
                  _this.afterPrint(params, prms, 'true', callBack)
                  resolve(_this.xmlDoc.toString(true))
                })
                .catch(function (state, res) {
                  printState = res
                  try {
                    // 获取xml中的打印机名称.
                    var pr = _this.getPrinter()
                    if (pr != null && pr !== '') {
                      printer = pr
                    }
                    var cprms = {download: params.download, xmlStr: _this.xmlStr, vipAddress: params.vipAddress}
                    _this.printToPdf(printType, cprms, printer, function () {
                      _this.afterPrint(params, prms, 'true', callBack)
                      resolve(_this.xmlDoc.toString(true))
                    })
                  } catch (e) {
                    // 提示插件注册
                    if (_this.xmlStr != null) {
                      _this.logInfo(_this.xmlStr)
                    }
                    printState = 'false'
                    _this.afterPrint(params, prms, printState, callBack)
                    reject(_this.xmlDoc.toString(true))
                  }
                })
            } catch (e) {
              if (_this.xmlStr != null) {
                _this.logInfo(_this.xmlStr)
              }
              printState = 'false'
              _this.afterPrint(params, prms, printState, callBack)
              reject(_this.xmlDoc.toString(true))
            } // catch
          } // else
        }// else
      }) // initData
    })
  }
})
if (window.$) {
  // eslint-disable-next-line no-undef
  $.getPrintInstance = function () {
    // eslint-disable-next-line new-cap
    return new PrintBean()
  }
}
export default PrintBean
