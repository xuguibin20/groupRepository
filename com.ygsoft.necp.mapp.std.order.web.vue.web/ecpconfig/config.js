'use strict'
module.exports = {
  // 配置类型名称；天擎为 necp, 旧的ecp为 ecp
  name: 'necp',
  // 功能标题
  title: 'ygsoft.ecp.app',
  // 如果是天擎项目则需要配置这个
  // 域名称: 天擎项目中Main.java文件的注解
  // @EmbeddedServer(contextPath="/demo", port=9099) 中的contextPath一致
  contextPath: '/order',
  // bundle路径
  bundlePath: 'D:/code/tianqing/ecp.demo/com.ygsoft.ecp.mapp.demo.web',
  // 功能目录,用于自动复制源码到bundle中, 注意：此路径开头和结尾不要有"/"
  path: 'src/main/resources/META-INF/resources/necp/mapp/demo/page/dist',
  // 是否引入外部服务的资源， 如果为false则引用本地资源
  importFromServer: {
    'ecp.state': true,
    'ecp.service': false,
    'ecp.utils': false,
    'ecp.des': false,
    'ecp.ext': false,
    'ecp.cryp': false,
    'ecp.datacontext': false,
    'ecp.login': false,
    'ecp.interceptor': false,
    'ecp.language': false,
    'ecp.qzz.style': false,
    'ecp.qzz.grid': false,
    'ecp.common.style': false,
    'ecp.themes.style': false,
    'ecp.index.style': false
  },
  // 是否自动复制到bundle中，必须配置bundlePath和path两个属性
  autoCopyToBandle: false,
  // 使用mock
  usemock: false,
  // 复制到bundle时，是否清除旧的文件
  delOldFiles: true
}
