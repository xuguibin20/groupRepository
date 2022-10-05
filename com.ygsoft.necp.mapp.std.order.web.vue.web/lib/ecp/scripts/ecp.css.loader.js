import ecp from '../../../ecpconfig'
function loadcss (url) {
  var source = ecp.source.source
  if (source[url] != null) {
    // require (url)
  }
  try {
    var heads = document.getElementsByTagName('head')
    if (heads.length > 0) {
      var head = heads[0]
      var link = document.createElement('link')
      head.appendChild(link)
      link.rel = 'stylesheet'
      link.href = url
    }
  } catch (e) {
    if (window.console) {
      window.console.error(e)
    }
  }
}
window.loadcss = loadcss
export default window.loadcss
