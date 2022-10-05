'use strict'
const resolve = require('../../../ecpconfig/resolve')

const libPath = resolve('lib')
// const srcPath = resolve('src')

module.exports = {
  serverPath: {
    'necp': '/assets'
  },
  // 可以从其它*.jar包中引入
  source: {
    'jquery': {
      name: 'jquery.min',
      export: '$',
      path: 'std/plugins/jquery',
      localPath: libPath + '/domain'
    },
    'jstorage': {
      name: 'jstorage',
      export: '',
      path: 'std/plugins',
      localPath: libPath + '/domain'
    },
    'bpmjs.viewer': {
      name: 'bpmn-viewer.development',
      export: 'BpmnJS',
      path: 'components/bpm/bpmnjs/viewer/scripts',
      localPath: libPath + '/domain/bpm/components/js/bpmn-viewer.development'
    },
    'vue': {
      name: 'vue.min',
      export: 'Vue',
      path: 'std/plugins/vue',
      localPath: libPath + '/'
    },
    'element-ui': {
      name: 'element-ui@2.13.0',
      export: 'ELEMENT',
      path: 'components/bpm/vue/element-ui@2.13.0',
      localPath: libPath + '/'
    },
    'element-ui.style': {
      name: 'element-ui@2.13.0',
      export: 'window',
      type: 'css',
      path: 'components/bpm/vue/element-ui@2.13.0',
      localPath: libPath + '/'
    },
    'tflow': {
      export: 'TFLOW',
      path: 'components/bpm/vue/tflow/js',
      localPath: libPath + '/domain/bpm/components/js/tflow'
    },
    'tflow.style': {
      name: 'tflow',
      export: 'window',
      type: 'css',
      path: 'components/bpm/vue/tflow/css',
      localPath: libPath + '/domain/bpm/components/css/tflow.css'
    }
  }
}
