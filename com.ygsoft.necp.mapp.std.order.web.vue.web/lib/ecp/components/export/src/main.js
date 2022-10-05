import utils from 'ecp.utils'
import request from 'ecp.service'

// 单元格样式
var STYLE = {
  STYLE_DEFAULT: "d",  //default
  STYLE_HEAD: "h",  //head
  STYLE_TITLE: "t", //title
  STYLE_BOLD_CENTER: "b|c", //bold|center
  STYLE_BOLD_LEFT: "b|l",	//bold|left
  STYLE_BOLD_RIGHT: "b|r", //bold|right
  STYLE_BOLD: "b",  //bold
  STYLE_LEFT: "l",	//left
  STYLE_RIGHT: "r",	//right
  STYLE_CENTER: "c"	//center
};

/**
 *	定义合并类Region对象，用于创建excel对应的单元格Cell.
 *  为了节省字节流量，属性名用短名称。
 *  （偶然发现excel中的属性基本都是短名称,反思我们的数据模型，元模型那么肥胖，汗颜。by yangwenyi)
 * @class Region
 * @property {number} rowFrom  行起始位置
 * @property {number} colFrom  行结束位置
 * @property {number} rowTo  列起始位置
 * @property {number} colTo  列结束位置
 * @property {number} d  文本信息text
 * @property {number} s  样式style
 * @property {number} dt  类型dataType
 * @property {number} df  字段项目datafield
 * 
 * @author yangwenyi@ygsoft.com
 * @date 2015-1-4
 */

function Region (rowFrom, colFrom, rowTo, colTo, d, s, dt, df, opt) {

  this.rc = [rowFrom, rowTo, colFrom, colTo].join(','),
    this.d = d;
  this.s = s;
  this.dt = dt;
  if (df) { this.df = df; }
  if (opt) {
    if (opt.length) this.length = opt.length;
    if (opt.scale) this.scale = opt.scale;
    if (opt.map) this.map = opt.map;
    if (opt.fmt) this.fmt = opt.fmt;
    if (opt.fml) this.fml = opt.fml;
    if (opt.colStyle) this.colStyle = opt.colStyle;
  }
}

/**
 * 矩阵对象
 * @class Matrix
 * @property {Number} row  行数
 * 
 */
function Matrix (row) {
  this.matrix = [];
  for (var i = 0; i < row; i++) {
    this.matrix.push([]);
  }
}
/**
 * 矩阵：辅助构建单元格
 *
 */
Matrix.prototype = {
  /**
   * 第row行新增cell单元格对象
   * @param {Number} row 行数
   * @param {Object} cell 单元格对象 
   */
  push: function (row, cell) {
    var rowspan, colspan;
    if (cell.rc) {
      var rcs = cell.rc.split(',');
      rowspan = rcs[1] - rcs[0] + 1;
      colspan = rcs[3] - rcs[2] + 1;
    } else {
      rowspan = cell.rowspan ? +cell.rowspan : 1;
      colspan = cell.colspan ? +cell.colspan : 1;
    }
    cell.rowspan = rowspan;
    cell.colspan = colspan;
    // 定位坐标
    var y = row, x = (function (matrix) {
      var rowData = matrix[row];
      if (!rowData || !rowData.length) return 0;
      for (var i = 0, j = rowData.length; i < j; i++) {
        if (typeof rowData[i] === 'undefined') return i;
      }
      return rowData.length;
    })(this.matrix);
    for (var i = y; i < y + rowspan; i++) {
      // 获取当前行
      var rowData = this.matrix[i];
      if (!rowData) {
        this.matrix[i] = rowData = [];
      }
      for (var j = x; j < x + colspan; j++) {
        rowData[j] = i === y && j === x ? cell : 'flag';
      }
    }
  },
  /** 
   * 将矩阵转换成范围对象数组
   *  return  {Array} regions 对象数组
   **/
  toRegion: function () {
    var rowNum = this.matrix.length, regions = [];
    for (var i = 0; i < rowNum; i++) {
      var row = [];
      regions.push(row);
      // 当前行
      var rowData = this.matrix[i];
      for (var j = 0, len = rowData.length; j < len; j++) {
        // 当前单元格
        var cell = rowData[j];
        // 如果当前cell为FLAG，说明只做占位用途，无需处理
        if (cell === 'flag') {
          continue
        }
        //兼容值为0时不能用非判断modified fuxiaopan
        var d = cell.d != undefined ? cell.d : cell.text,
          s = cell.s || cell.style,
          dt = cell.dt || cell.datatype;
        s = s ? s : '';
        dt = dt ? dt : '';

        // 将当前单元格绘制范围放入数组 rowFrom,colFrom,rowTo,colTo
        row.push(new Region(cell.rowFrom || i, cell.colFrom || j, cell.rowTo || cell.rowspan + i - 1, cell.colTo || (cell.colspan + j - 1), d, s, dt, cell.df,
          {
            length: cell.length, scale: cell.scale,
            map: cell.map, fmt: cell.fmt, fml: cell.fml,
            colStyle: cell.colStyle
          }));
      }
    }
    return regions;
  }
}
/**
* 将二维数据生成对象数据格式适用于导出使用
* 
* @param {Array} userData 需转换数据二维数组
* @param {Array} dataTypes 数据类型集合
* @ignore
*/
function _transDataToRegion (userData) {
  var matrix = new Matrix(userData.length);
  for (var i = 0, j = userData.length; i < j; i++) {
    var row = userData[i];
    for (var x = 0, y = row.length; x < y; x++) {
      var cell = row[x];
      if (typeof (cell) === "object" || cell instanceof Region) {
        matrix.push(i, cell);
      } else {
        matrix.push(i, { d: cell });
      }
    }
  }
  return matrix.toRegion();
}
function _handleCustom (workbookJSON, data) {
  var header = data.header,
    userData = data.userData,
    sheet = { data: [] };
  if (header) {//通过自定义数据 构造表头
    var matrix = new Matrix(1);
    for (var i = 0, j = header.length; i < j; i++) {
      matrix.push(0, { d: header[i], s: STYLE.STYLE_HEAD });
    }
    sheet.data.push(matrix.toRegion());
  }

  if (userData) {// 表体
    let _body = _transDataToRegion(userData);
    sheet.data.push(_body);
  }
  if (data.serverDataConfig) {// 服务端配置信息。
    sheet.data.push([[data.serverDataConfig]])
  }
  // 表格前数据
  data.beforeData && sheet.data.unshift(_transDataToRegion(data.beforeData));
  // 表格后数据
  data.afterData && sheet.data.push(_transDataToRegion(data.afterData));
  // 将数据放入工作薄
  sheet.name = data.tabName || "";
  sheet.isForm = data.isForm || false;
  workbookJSON.sheets.push(sheet);
}

const EcpExport = options => {
  options = options || {}
  let fileName = options.fileName || '未命名', // 文件名
    fileType = options.fileType || 'xls', // 文件类型
    vipAddress = options.vipAddress || '', // vipaddress
    wbJSON = { sheets: [], single: false }, // 表格主体
    data = [] // 表格数据
  if (fileName.length > 200) {
    console.error('文件名参数过长，不得超过200字符')
    return
  }
  let isRepeat = false
  options.data.forEach((value, key) => {
    data[key] = {}
    data[key].tabName = value.sheetName
    data[key].userData = value.sheetData
    options.data.forEach((val, k) => {
      if (val.sheetName === value.sheetName && key !== k) {
        isRepeat = true
        return
      }
    })
    if (isRepeat) return
    _handleCustom(wbJSON, data[key])
  });
  if (isRepeat) {
    console.error('sheetName不可重复')
    return
  }
  // 传入数据
  let exportData = {
    content: JSON.stringify({
      chooseType: true,
      showExportFormat: false,
      type: fileType,
      fileName: fileName,
      vipAddress: vipAddress,
      dataList: [data],
      sheets: wbJSON.sheets,
      single: wbJSON.single
    }),
    isTmpFile: true,
    beanId: 'com.ygsoft.ecp.web.service.context.IExportContext',
    methodName: 'createWookbookByParamFile(contentPath,userId,progressKey)',
    contentType: "text",
    sno: '-1',
    path: '',
    params: {
      userId: null,
      progressKey: null
    }
  }
  // 上传数据获取path
  request.doPost(utils.getContextPath() + vipAddress + '/ecp/exportSerivce/export?sno=-1&isTmpFile=true', exportData, 'text').then(exportRes => {
    if (exportRes.data) {
      // 下载
      window.open(utils.getContextPath() + vipAddress + `/ecp/exportSerivce/download?path=${exportRes.data}&fileName=${fileName}&fileType=${fileType}&inline=false&isTmpFile=true`);
    }
  });
}

export default EcpExport