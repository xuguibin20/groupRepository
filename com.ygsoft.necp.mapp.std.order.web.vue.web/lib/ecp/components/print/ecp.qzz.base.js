
// 在继承时，不执行构造函数
var initializing = false
/**
 * 定义类
 * @baseClass 基类
 * @childClass 子类
 * @isBind 是否将方法绑定到当前类，将this关键字固定成当前类，就算apply、call方法都无法影响其this的值
 */
function Jclass (baseClass, childClass, isBind) {
  // 兼容jClass({}, true)的情况
  if (typeof childClass === 'boolean') {
    isBind = childClass
  }
  // 只接受一个参数的情况 - jClass(childClass)
  if (typeof (baseClass) === 'object') {
    childClass = baseClass
    baseClass = null
  }
  /**
   * 构造新的对象，本次调用所创建的类（构造函数）
   */
  function curClass () {
    // 如果当前处于实例化类的阶段，则调用init原型函数
    if (!initializing) {
      // 如果存在初始化方法才执行
      if (typeof this.init === 'function') {
        this.init.apply(this, arguments)
      }
    }
  }
  /**
   * 合并同名函数
   * 把两个对象的同名函数，并排起来，默认调用子类函数，
   * 并在执行时，把基类函数赋给this.base，拱子类函数可以调用，
   * 如此可以起到不改变结构的情况下，能灵活调用基类函数
   */
  function mergeFunc (funcName) {
    // 定义一个新函数体
    var func = function () {
      // 把原来的base先缓存起来
      var _base = this.base
      // 把当前的基类函数放到this.base对象，以便在子类的同名方法中调用。
      this.base = baseClass.prototype[funcName]
      // 执行子类的方法，并把结果返回
      var result = childClass[funcName].apply(this, arguments)
      // 还原基类的this.base函数
      this.base = _base
      // 返回执行结果
      return result
    }
    // 返回函数体
    return func
  }

  // 如果此类需要从其它类扩展
  if (baseClass) {
    initializing = true
    // 结构指向基类，在javascript结构上会形成类似继承的关系
    // eslint-disable-next-line new-cap
    curClass.prototype = new baseClass()
    curClass.prototype.constructor = curClass
    initializing = false
  }

  // 覆盖父类的同名函数 通过prototype定义的函数
  for (var name in childClass) {
    if (childClass.hasOwnProperty(name)) {
      // 如果此类继承自父类baseClass并且父类原型中存在同名函数name
      if (baseClass && typeof (childClass[name]) === 'function' &&
        typeof (curClass.prototype[name]) === 'function') {
        // 合并函数
        curClass.prototype[name] = mergeFunc(name)
      } else {
        curClass.prototype[name] = childClass[name]
      }
    }
  }

  // 复制静态方法 不通过prototype定义的函数
  // eslint-disable-next-line no-redeclare
  for (var name in baseClass) {
    if (typeof baseClass[name] !== 'function') continue
    curClass[name] = baseClass[name]
  }

  // 通过bind方法给每个方法的this绑定当前对象，避免丢失
  if (isBind) {
    // eslint-disable-next-line no-redeclare
    for (var name in curClass.prototype) {
      if (typeof curClass.prototype[name] === 'function') {
        curClass.prototype[name] = curClass.prototype[name].bind(this)
      }
    }
  }
  return curClass
}
export default Jclass
