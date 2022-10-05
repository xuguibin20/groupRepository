var isPro = process.env.NODE_ENV === 'production'
var ecp = require('../../../ecpconfig')
if (isPro !== true) {
  window._ecp_remote_context_path = ecp.ecp.config.contextPath
  if (window.console) {
    window.console.log('dev context path: ' + window._ecp_remote_context_path)
  }
}

export default ecp.ecp.config.contextPath
