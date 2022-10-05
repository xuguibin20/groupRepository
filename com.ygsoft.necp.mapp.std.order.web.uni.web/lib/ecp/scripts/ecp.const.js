var constants = {
  /**
     * 数据模型状态常量
     */
  ModelState: {
    DEFAULT: 1, // 默认: 模型从服务端下载，或者使用cleanState()方法后的状态
    NEW: 4, // 新增: 模型节点被新增后处于该状态
    MODIFY: 8, // 修改: 模型节点被修改后处于该状态
    DELETE: 2, // 删除: 此状态暂时只有占位作用，删除的内容已移动至模型删除集中,模型节点被删除后处于该状态
    SELECTED: 16, // 选中: 在表格、树等集合控件中，被单选、复选中的节点处于该状态，此状态仅在客户端赋值
    ACTIVE: 32, // 选中列: 在表格列处于该状态,此状态仅在客户端赋值
    CHILD_MODIFY: 64, // 子对象被修改
    EMPTY: 128 ,// 凭证空行
	isDefault:function(curState) {
		return (curState & this.DEFAULT) == this.DEFAULT;
	},
	isNew:function(curState) {
		return (curState & this.NEW) == this.NEW;
	},
	isModify:function(curState) {
		return (curState & this.MODIFY) == this.MODIFY;
	},
	isDelete:function(curState) {
		return (curState & this.DELETE) == this.DELETE;
	},
	isSelected:function(curState) {
		return (curState & this.SELECTED) == this.SELECTED;
	},
	isChildModify:function(curState) {
		return (curState & this.CHILD_MODIFY) == this.CHILD_MODIFY;
	},
	isChange:function(curState) {
		return this.isNew(curState) || this.isModify(curState) || this.isDelete(curState);
	},
	isTrue:function(curState,constState) {
		return (curState & constState) == constState;
	}
  },
  EcpClass: {
    COMBOBOX: 'ecp.component.comboBox',
    NUMBERBOX: 'ecp.component.numberBox'
  },
  THOURSAND: 1000,
  ALL: 'all',
  CURRENT: 'current',
  /**
     * dom元素相关宽度样式
     */
  ELEM_WIDTH_STYLE: ['border-left-width', 'border-right-width', 'padding-left', 'padding-right', 'margin-left', 'margin-right'],

  /**
     * dom元素相关宽度样式
     */
  ELEM_HEIGHT_STYLE: ['border-top-height', 'border-bottom-height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'],

  /**
     * IE下dom元素相关宽度样式
     */
  IE_ELEM_WIDTH_STYLE: ['borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight', 'marginLeft', 'marginRight'],

  /**
     * IE下dom元素相关宽度样式
     */
  IE_ELEM_HEIGHT_STYLE: ['borderTopHeight', 'borderBottomHeight', 'paddingTop', 'paddingBottom', 'marginTop', 'marginBottom'],

  /**
     * A-Z英文字母数组
     */
  LETTER: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

  /**
     * 表格单元格置灰样式
     */
  TABLE_CELL_STYLE: ['td.tfg-grid-select-border-all'],
  /**
     * 门户常量
     */
  Portal: {
    SETTING_VIEW_NAME: 'portal_setting_view_name',
    CACHE_VIEW: 'portal_cache_view'
  },

  /**
     * 输入关键字
     */
  INPUT_KEYWORD: '输入关键字',

  /**
     * 默认登录名称
     */
  DEFAULT_USERCODE: '-0000',

  /**
     * 默认登录单位
     */
  DEFAULT_LOGINORGID: '-9999',

  /**
     * 定位
     */
  GO_TO: '定位',

  /**
     * 判断旧平台的URL标志
     */
  OLD_PLATFORM_URL: 'YGFMISWeb',

  /**
     * 通用场景编号常量定义
     */
  COMMONSCENEBH: '10001',

  /**
     * 组织权限扩展点
     */
  CTRL_UNUSABLE_EXTENDID: 'authority.subfunc',

  /**
     * 组织和角色权限扩展点
     */
  CTRL_PRINCIPAL_TYPE: 'all',

  /**
     * 行高拖拽
     */
  RowHeight: {
    ROWHEIGHT_MAX: 161,
    ROWHEIGHT_MIN: 23,
    ROWHEIGHT_TOPBOTTON_MIN: 26,
    ROWHEIGHT_MARK: 10,
    ROWHEIGHT_PADDING: 5
  },
  /**
     * ECP表格编辑单元格时绑定失去焦点保存单元格的控件类型
     */
  CellOfBlurECPType: [
    'ecp.ui.datafield.NumberBox',
    'ecp.ui.datafield.ValidateBox'
  ],
  PRIMARY_KEY: '__Gid',
  CHI_ALL: '全部',
  TEN_MILLION: 10000000,

  /**
     * 控件格式处理器模块名称.
     */
  PROCESSOR_FORMAT: 'ecp-component-processor-format-',

  Print: {
    SETPRINT: 2,
    PRINT: 1
  },
  NumUnit: {
    PERTHOURSAND: 0.001,
    PERCENT: 0.01,
    TEN: 10,
    HUNDRED: 100,
    THOURSAND: 1000, // thousand
    TEN_THOURSAND: 10000,
    HUNDRED_THOURSAND: 100000,
    MILLION: 1000000,
    TEN_MILLION: 10000000,
    HUNDRED_MILLION: 100000000,
    BILLION: 1000000000
  },

  AMOUNT: {
    hundred: 100,
    thousand: 1000,
    wanyuan: 10000,
    shiwanyuan: 100000,
    million: 1000000,
    qianwanyuan: 10000000,
    billion: 100000000
  },

  CHINESE_L_NUMBER: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿', '万亿', '亿亿'],

  CHINESE_U_NUMBER: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '佰', '仟', '萬', '億', '萬億', '億億'],

  CHINESE_CURRENCY: ['圆', '元', '角', '分', '厘'],

  CHINESE_DATETIME: ['年', '月', '日', '时', '分', '秒'],

  PrintOrPreview: {
    PRINT: 1,
    PREVIEW: 2
  },
  Punctuation: {
    'DEFAULT': {
      COMMA: '，',
      SEMICOLON: '；',
      EXCALMATORY: '！'
    }
  },
  ExportStyle: {
    STYLE_DEFAULT: 'd', // default
    STYLE_HEAD: 'h', // head
    STYLE_TITLE: 't', // title
    STYLE_BOLD_CENTER: 'b|c', // bold|center
    STYLE_BOLD_LEFT: 'b|l',	// bold|left
    STYLE_BOLD_RIGHT: 'b|r', // bold|right
    STYLE_BOLD: 'b', // bold
    STYLE_LEFT: 'l',	// left
    STYLE_RIGHT: 'r',	// right
    STYLE_CENTER: 'c'	// center
  },

  /**
     * JQuery 常用功能键码值
     */
  KeyCode: {
    ENTER: 13, // 回车
    TAB: 9, // Tab
    UP: 38, // 向上
    DOWN: 40, // 向下
    Left: 37, // 向左
    Right: 39, // 向右
    LEFT: 37, // 向左
    RIGHT: 39, // 向右
    BACKSPACE: 8, // 回退
    ESC: 27, // Escape
    DEL: 46, // 删除
    PAGEUP: 33, // 上一页
    PAGEDOWN: 34, // 下一页
    F1: 112, // F1
    F2: 113, // F2
    F3: 114, // F3
    F4: 115, // F4
    F5: 116, // F5
    F6: 117, // F6
    F7: 118, // F7
    F8: 119, // F8
    F9: 120, // F9
    F10: 121, // F10
    F11: 122, // F11
    F12: 123, // F12
    C: 67,
    D: 68,
    N: 78,
    F: 84,
    O: 79,
    P: 80,
    LArrow: 188,
    RArrow: 190
  },

  QuickKey: {
    HELP: 81// Q键
  },
  /**
     * 滚动条尺寸.
     */
  ScrollBarSize: 17,
  OLD_VALUE: '_oldValue'
}

// if (window._ecp_remote_constants == null) {
//   window._ecp_remote_constants = constants
// }

export default constants
