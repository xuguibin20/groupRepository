'use strict'
const resolve = require('../../../ecpconfig/resolve')

const libPath = resolve('lib')
// const srcPath = resolve('src')

module.exports = {
  serverPath: {
    'necp': 'src/main/resources/META-INF/resources/ywdj/necp',
    'ecp': 'webcontent',
    'ecp-webCtxPath': 'ecp/ywdj'
  },
  // 可以从其它*.jar包中引入
  source: {
    'ywdj.state': {
      export: '_ywdj_remote_state',
      path: 'scripts/ywdj',
      localPath: libPath + '/domain/components/ywdj.state'
    },
    'ywdj.style': {
      name: 'index',
      export: '',
      type: 'css',
      path: 'themes/common/themes',
      localPath: libPath + '/domain/themes/ywdj/index.css'
    }
  },
  // 单纯的重命名
  alias: {
    'test': libPath + '/domain/scripts/ecp.dev.test'
  }
}
