var fs = require('fs')
var path = require('path')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

var mkdirs = function (path) {
  // eslint-disable-next-line no-useless-escape
  var pathAry = path.split(/[\\\/]/g)
  var needMk = []
  while (pathAry.length > 0 && !fs.existsSync(pathAry.join('/'))) {
    needMk.push(pathAry.pop())
  }
  var cpath = pathAry.join('/')
  while (needMk.length > 0) {
    var cnm = needMk.pop()
    cpath = cpath + '/' + cnm
    fs.mkdirSync(cpath)
    console.log('create dir ' + cpath)
  }
}

var copy = function (src, dst) {
  mkdirs(dst)
  // 同步读取当前目录
  var paths = fs.readdirSync(src)
  paths.forEach(function (path) {
    var _src = src + '/' + path
    var _dst = dst + '/' + path
    // stats 该对象包含文件属性
    fs.stat(_src, function (err, stats) {
      if (err) throw err
      if (stats.isFile()) {
        // 创建读取流
        var readable = fs.createReadStream(_src)
        var writable = fs.createWriteStream(_dst)
        readable.pipe(writable)
        console.log('copy ' + _src + ' to ' + _dst)
      } else if (stats.isDirectory()) {
        checkDirectory(_src, _dst, copy)
      }
    })
  })
}

var checkDirectory = function (src, dst, callback) {
  fs.access(dst, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdirSync(dst)
      console.log('create dir ' + dst)
      callback(src, dst)
    } else {
      callback(src, dst)
    }
  })
}

var delDir = function (path) {
  var files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

var eachPath = function (path, eachFunc) {
  if (fs != null && fs.readdirSync) {
    var domainpath = resolve(path)
    var paths = fs.readdirSync(domainpath)
    paths.forEach(function (cpath) {
      if (typeof eachFunc === 'function') {
        eachFunc(cpath)
      }
    })
  }
}

var getEntryJs = function () {
  var resjs = {
    'js': {},
    'html': {}
  }
  eachPath('src/domain', function (cpath) {
    eachPath('src/domain/' + cpath, function (ccpath) {
      var pre = './src/domain/' + cpath + '/'
      if (/.js$/ig.test(ccpath)) {        
        resjs.js[ccpath.replace(/.js$/i, '')] = pre + ccpath
      } else if (/.html$/ig.test(ccpath)) {
        resjs.html[ccpath.replace(/.html$/i, '')] = pre + ccpath
      }
    })
  })
  console.log(JSON.stringify(resjs))
  return resjs
}

module.exports = {
  'copy': copy,
  'del': delDir,
  'mkdir': mkdirs,
  'eachPath': eachPath,
  'getEntryJs': getEntryJs
}
