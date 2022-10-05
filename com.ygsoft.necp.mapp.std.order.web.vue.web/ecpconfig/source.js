'use strict'
var resolve = require('./resolve')

var libPath = resolve('lib')
var srcPath = resolve('src')
var staticPath = resolve('static')
module.exports = {
  unload: true,
  printServlet: {
    'ecp': '/grm/pdf/PdfServlet',
    'necp': '/pdf/PdfServlet/'
  },
  // 远程资源目录, 注意：此属性是平台属性，不可配置或修改
  serverPath: {
    'necp': 'src/main/resources/META-INF/resources/assets/necp',
    'ecp': 'webcontent',
    'ecp-webCtxPath': 'ecp/vueweb'
  },
  source: {
    'ecp.state': {
      export: '_ecp_remote_state',
      path: 'scripts/security'
    },
    'ecp.service': {
      export: '_ecp_remote_service',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.service'
    },
    'ecp.utils': {
      export: '_ecp_remote_utils',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.utils'
    },
	'ecp.hz2py': {
      export: '_ecp_utils_hz2py',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.hz2py'
    },
    'ecp.des': {
      export: '_ecp_remote_des',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.des'
    },
    'ecp.ext': {
      export: 'window',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.ext'
    },
    'ecp.cryp': {
      export: 'ecpsecurity.cryptoapi',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.cryp'
    },
    'ecp.datacontext': {
      export: '_ecp_remote_datacontext',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.datacontext'
    },
    'ecp.login': {
      export: '_ecp_remote_login',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.login'
    },
    'ecp.interceptor': {
      export: '_ecp_interceptor',
      path: 'scripts',
      localPath: libPath + '/ecp/scripts/ecp.interceptor'
    },
    'ecp.language': {
      name: 'ecp.web.locale',
      export: '_ecp_language_json',
      path: 'scripts/i18n/common',
      localPath: srcPath + '/assets/i18n/common/language'
    },
    'ecp.qzz.style': {
      name: 'ecp.qzz',
      export: 'window.qzz',
      path: 'themes/qzz',
      type: 'css',
      localPath: libPath + '/ecp/themes/qzz/ecp.qzz.css'
    },
    'ecp.qzz.grid': {
      name: 'vue.qzz.all',
      export: 'qzz.ui.grid',
      path: 'components',
      localPath: staticPath + '/lib/ecp/components/qzz/vue.qzz.all'
    },
    'ecp.common.style': {
      name: 'common',
      export: 'window',
      path: 'themes/common/styles',
      type: 'css',
      localPath: libPath + '/ecp/themes/common/styles/common.css'
    },
    'ecp.themes.style': {
      name: 'themesstyle',
      export: 'window',
      path: 'themes/common/themes',
      type: 'css',
      localPath: libPath + '/ecp/themes/common/themes/themesstyle.css'
    },
    'ecp.index.style': {
      name: 'index',
      export: 'window',
      path: 'themes/common/themes',
      type: 'css',
      localPath: libPath + '/ecp/themes/common/themes/index.css'
    }
  },
  alias: {
    'devstate': libPath + '/ecp/scripts/ecp.dev.state',
    'mock.function': libPath + '/ecp/scripts/ecp.mock.fun',
    'mock.server': libPath + '/ecp/scripts/ecp.mock',
    'qzz.grid': libPath + '/ecp/components/qzz/ecp.qzz.grid',
    'qzz.querygrid': libPath + '/ecp/components/qzz/ecp.qzz.querygrid',
    'qzz.combotree': libPath + '/ecp/components/qzz/ecp.qzz.combotree',
    'qzz.combobox': libPath + '/ecp/components/qzz/ecp.qzz.combobox',
    'qzz.datepicker': libPath + '/ecp/components/qzz/ecp.qzz.datepicker',
    'qzz.bubble': libPath + '/ecp/components/qzz/ecp.qzz.bubble',
    'ecp.select': libPath + '/ecp/components/select/ecp.component.select',
    'ecp.entityselect': libPath + '/ecp/components/select/ecp.component.entityselect',
    'ecp.popentity': libPath + '/ecp/components/select/ecp.component.popentity',
    'ecp.tree': libPath + '/ecp/components/tree/ecp.component.tree',
    'ecp.table': libPath + '/ecp/components/table/ecp.component.table',
    'ecp.tableColumn': libPath + '/ecp/components/table/ecp.component.tableColumn',
    'ecp.datepicker': libPath + '/ecp/components/datepicker/ecp.component.datepicker',
    'ecp.import': libPath + '/ecp/components/import',
    'ecp.export': libPath + '/ecp/components/export',
    'ecp.upload': libPath + '/ecp/components/upload',
    'ecp.uploadPanel': libPath + '/ecp/components/upload/src/upload-panel',
    'ecp.uploadTable': libPath + '/ecp/components/upload/src/upload-table',
    'ecp.uploadInput': libPath + '/ecp/components/upload/src/upload-input',
    'css.loader': libPath + '/ecp/scripts/ecp.css.loader',
    'suit.height': libPath + '/ecp/scripts/ecp.height',
    'i18n': srcPath + '/assets/i18n',
    'ecp.print': libPath + '/ecp/components/print/ecp.print.bean',
    'ecp.pdf.export': libPath + '/ecp/components/print/ecp.pdf.export',
    'spreadjs.license': libPath + '/ecp/components/spreadjs/ecp.component.spreadjs.license'
  }
}
