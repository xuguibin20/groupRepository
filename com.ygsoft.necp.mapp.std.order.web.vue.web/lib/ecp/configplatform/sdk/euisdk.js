import {Sdkbase, sdks} from './sdkbase'
import Vue from 'vue'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import EcpSearch from '../../components/business/ecp.component.search'
import EcpMenu from '../../components/business/ecp.component.tree'
import router from '../../../../src/router'
// import PinyinMatch from 'pinyin-match'

Vue.use(elementUI, { size: 'mini' })

class Search extends Sdkbase {
  create () {
    this.data = {
      searchType: true,
      history: [],
      value: '',
      items: []
    }
    this.watch = {}
    this.tagName = 'search'
    this.template = '<div>' +
                    ' <ecpsearch height="35px" placeholder="请检索" :history="history" ' +
                    '   :searchType="searchType" ' +
                    '   @handlesearchinput="handlesearchinput"/> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        that.data.searchType = option.searchType !== false
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          components: {
            'ecpsearch': EcpSearch
          },
          methods: {
            handlesearchinput: function (data) {
              if (typeof that.onsearch === 'function') {
                that.onsearch.apply(that, data)
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  setValueByIndex (index) {
    if (index != null && index !== '') {
      var cval = this.getData()
      if (index < 0) {
        index = 0
      }
      if (index >= cval.length) {
        index = cval.length - 1
      }
      if (cval.length > 0 && cval[index]) {
        var key = 'id'
        this.setValue(cval[index][key])
      }
    }
  }
  loadData (datas) {
    if (this.data) {
      this.data.items = datas
      this.data.value = ''
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
  getData () {
    return this.data.items
  }
}

/**
 * 下拉框组件.
 */
class Combobox extends Sdkbase {
  create () {
    this.data = {
      value: '',
      items: []
    }
    this.watch = {}
    this.tagName = 'combobox'
    this.template = '<div>' +
                    '  <el-select v-model="value" placeholder="请选择">' +
                    '    <el-option ' +
                    '      v-for="item in items"' +
                    '      :key="item.value" ' +
                    '      :label="item.text"' +
                    '      :value="item.id">' +
                    '    </el-option>' +
                    '  </el-select>' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  setValueByIndex (index) {
    if (index != null && index !== '') {
      var cval = this.getData()
      if (index < 0) {
        index = 0
      }
      if (index >= cval.length) {
        index = cval.length - 1
      }
      if (cval.length > 0 && cval[index]) {
        var key = 'id'
        this.setValue(cval[index][key])
      }
    }
  }
  loadData (datas) {
    if (this.data) {
      this.data.items = datas
      this.data.value = ''
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
  getData () {
    return this.data.items
  }
}

/**
 * 数值微调框.
 */
class Updown extends Sdkbase {
  create () {
    this.data = {
      value: '',
      max: 9999999999999998,
      min: -10000000000000000,
      step: 1
    }
    this.watch = {}
    this.tagName = 'updown'
    this.template = '<div>' +
                    '<el-input-number v-model="value" controls-position="right" style="width:100%;"' +
                    '   @change="handleChange" :min="min" :max="max"></el-input-number> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          methods: {
            handleChange () {
              if (typeof this.$attrs.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 输入框.
 */
class Edit extends Sdkbase {
  create () {
    this.data = {
      value: ''
    }
    this.watch = {}
    this.tagName = 'edit'
    this.template = '<div>' +
                    ' <el-input v-model="value" placeholder="请输入内容"></el-input> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}
/**
 * 开关组件.
 */
class Switch extends Sdkbase {
  create () {
    this.data = {
      value: false
    }
    this.watch = {}
    this.tagName = 'switch'
    this.template = '<div style="text-align:left">' +
                    ' <el-switch ' +
                    '  v-model="value"' +
                    '  active-color="#13ce66"' +
                    '  inactive-color="#DDDDDD">' +
                    '  </el-switch>' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 单选择组件.
 */
class Radios extends Sdkbase {
  create () {
    this.data = {
      value: 0,
      items: [],
      inline: 'padding-right:8px; display: inline-block;'
    }
    this.watch = {}
    this.tagName = 'radios'
    this.template = '<div style="text-align:left">' +
                    '<div v-for="(item, index) in items" :key="index" :style="inline">' +
                    ' <el-radio' +
                    '  v-model="value"' +
                    '  :label="item.index">{{item.caption}}' +
                    '  </el-radio>' +
                    '</div></div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.inline === false) {
          that.data.inline = ''
        }
        if (option.items) {
          that.data.items = []
          for (var i = 0, ilen = option.items.length; i < ilen; i++) {
            var citem = option.items[i]
            var nitem = {index: citem[option.idkey || 'index'], caption: citem[option.capkey || 'caption']}
            that.data.items.push(nitem)
          }
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  loadData (datas) {
    if (this.data) {
      this.data.items = []
      for (var i = 0, ilen = datas.length; i < ilen; i++) {
        var citem = datas[i]
        var nitem = {index: citem[this.option.idkey || 'index'], caption: citem[this.option.capkey || 'caption']}
        this.data.items.push(nitem)
      }
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 多选择组件.
 */
class Checkboxs extends Sdkbase {
  create () {
    this.data = {
      isIndeterminate: false,
      showSelectAll: false,
      checkAll: false,
      min: 1,
      max: 2,
      values: [],
      items: [],
      inline: 'padding-right:8px; display: inline-block;'
    }
    this.watch = {}
    this.tagName = 'checkboxs'
    this.template = '<div style="text-align:left;">' +
                    '  <div><el-checkbox v-if="showSelectAll" @change="selall" v-model="checkAll"' +
                    '    :indeterminate="isIndeterminate"' +
                    '  >全选</el-checkbox></div>' +
                    '  <el-checkbox-group v-model="values">' +
                    '    <div v-for="(item, index) in items" :key="index" :style="inline">' +
                    '      <el-checkbox' +
                    '      :label="item.index" @change="sel">{{item.caption}}' +
                    '      </el-checkbox>' +
                    '    </div>' +
                    '  </el-checkbox-group>' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.inline === false) {
          that.data.inline = ''
        }
        that.data.showSelectAll = option.selectAll === true
        if (option.items) {
          that.loadData(option.items)
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          },
          methods: {
            selall: function (state) {
              that.data.values = []
              if (state === true) {
                for (var i = 0, ilen = that.data.items.length; i < ilen; i++) {
                  var citem = that.data.items[i]
                  that.data.values.push(citem.index)
                }
              }
              that.data.isIndeterminate = false
            },
            sel: function (state) {
              that._refreshSelectAll()
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  _refreshSelectAll () {
    var checkcount = this.data.values.length
    this.data.isIndeterminate = false
    if (checkcount > 0 && checkcount < this.data.items.length) {
      this.data.isIndeterminate = true
    } else if (checkcount === 0) {
      this.data.checkAll = false
    } else {
      this.data.checkAll = true
    }
  }
  getValue () {
    var res = []
    if (this.data) {
      res = this.data.values
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      var i = 0
      var ilen = 0
      if (typeof val !== 'object') {
        this.data.values.push(val)
      } else if (val instanceof Array) {
        this.data.values = []
        for (i = 0, ilen = val.length; i < ilen; i++) {
          this.data.values.push(val[i])
        }
      }
      this._refreshSelectAll()
    }
  }
  loadData (datas) {
    if (this.data) {
      this.data.items = []
      for (var i = 0, ilen = datas.length; i < ilen; i++) {
        var citem = datas[i]
        var nitem = {index: citem[this.option.idkey || 'index'],
          caption: citem[this.option.capkey || 'caption'],
          checked: false
        }
        this.data.items.push(nitem)
      }
      if (this.option.min != null) {
        this.data.min = this.option.min
      } else {
        this.data.min = 0
      }
      if (this.option.max != null) {
        this.data.max = this.option.max
      } else {
        this.data.max = this.data.items.length
      }
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}
/**
 * 输入框.
 */
class Datepicker extends Sdkbase {
  create () {
    this.data = {
      value: ''
    }
    this.watch = {}
    this.tagName = 'datepicker'
    this.template = '<div>' +
                    ' <el-date-picker v-model="value" ' +
                    '  align="right" ' +
                    '  type="date" ' +
                    '  placeholder="选择日期"' +
                    // '  :picker-options="pickerOptions">' +
                    ' ></el-date-picker> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.value
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.value = val
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 输入框.
 */
class Tree extends Sdkbase {
  create () {
    this.data = {
      items: [],
      multiSelect: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      selects: []
    }
    this.watch = {}
    this.tagName = 'tree'
    this.template = ' <el-tree :data="items" ' +
                    '  :props="defaultProps" ' +
                    '  :show-checkbox="multiSelect" ' +
                    '  :default-checked-keys="selects"' +
                    '  @node-click="handleNodeClick" ' +
                    ' ></el-tree> '
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.idkey) {
          that.data.idkey = option.idkey
        }
        if (option.pidkey) {
          that.data.pidkey = option.pidkey
        }
        if (option.capkey) {
          that.data.defaultProps.label = option.capkey
        }
        that.data.multiSelect = option.multiSelect === true

        if (option.data) {
          this.loadData(option.data)
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          methods: {
            handleNodeClick (data) {
              console.log(data)
              if (that.data.multiSelect === true) {
                that.data.selects.push(data[that.data.idkey])
              } else {
                that.data.selects = [data[that.data.idkey]]
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      if (this.multiSelect === true) {
        res = this.data.selects
      } else {
        res = this.data.selects[0]
      }
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      if (val instanceof Array) {
        this.data.selects = val
      } else {
        this.data.selects = [val]
      }
    }
  }
  listToTree (datas) {
    var pids = {}
    var tops = []
    var pnode = null
    for (var i = 0, ilen = datas.length; i < ilen; i++) {
      var cdata = datas[i]
      var pid = cdata[this.data.pidkey]
      var id = cdata[this.data.idkey]
      if (pid != null && pid !== '') {
        pnode = pids[pid]
        if (pnode == null) {
          pnode = {children: []}
          pids[pid] = pnode
        }
        pnode.children.push(cdata)
        if (pnode.data != null) {
          pnode.data.children = pnode.children
        }
      } else {
        tops.push(cdata)
      }
      if (id != null && id !== '') {
        pnode = pids[pid]
        if (pids[id] == null) {
          pnode = {children: []}
          pids[id] = pnode
        }
        pnode.data = cdata
        if (pnode.children.length > 0) {
          pnode.data.children = pnode.children
        }
      }
    }
    for (var key in pids) {
      var node = pids[key]
      if (node.data == null) {
        for (i = 0, ilen = node.children.length; i < ilen; i++) {
          var ccdata = node.children[i]
          tops.push(ccdata)
        }
      }
    }
    // this.data.items = tops
    return tops
  }
  loadData (datas) {
    if (this.data.pidkey != null && this.data.pidkey !== '') {
      this.data.items = this.listToTree(datas)
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 输入框.
 */

class Grid extends Sdkbase {
  create () {
    this.data = {
      value: '',
      height: 100,
      datas: [],
      multiple: true,
      colData: []
    }
    this.watch = {}
    this.tagName = 'grid'
    this.template = '<div>' +
                    ' <el-table highlight-current-row border stripe ' +
                    '  :height="height"' +
                    '  :expand="multiple"' +
                    '  :data="datas"' +
                    ' >' +
                    '   <el-table-column v-if="multiple"' +
                    '    type="selection" ' +
                    '    align="center" ' +
                    // '    :selectable="unSelectable ? handleSelectable: null"' +
                    '   </el-table-column>' +
                    '   <el-table-column v-for="(item, index) in colData" :key="index" v-bind="item">' +
                    '     <template slot-scope="scope">' +
                    // '       <span ' +
                    // '         v-if="typeof item.format===\\"function\\"">' +
                    // '         {{item.format(scope.row[item.prop])}}</span> ' +
                    '       <span>{{item.data?item.data[scope.row[item.prop]]:scope.row[item.prop]}}</span>' +
                    '     </template>' +
                    '   </el-table-column>' +
                    '</el-table> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        that.height = option.height
        var colNames = option.colNames
        var colModels = option.colModels
        if (colNames != null) {
          for (var i = 0, ilen = colNames.length; i < ilen; i++) {
            var ccn = colNames[i]
            var cap = ccn
            if (typeof cap === 'object') {
              cap = cap.caption
            }
            var ccm = colModels[i]
            var cds = {
              label: cap,
              prop: ccm.name
            }
            that.data.colData.push(cds)
          }
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          watch: {
            value () {
              if (typeof that.onchange === 'function') {
                that.onchange()
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  getValue () {
    var res = null
    if (this.data) {
      res = this.data.datas
    }
    return res
  }
  setValue (val) {
    if (this.data) {
      this.data.datas = val
    }
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onchange') {
        var that = this
        that.onchange = func
      }
    }
  }
}

/**
 * 按钮组件.
 */
class Button extends Sdkbase {
  create () {
    this.data = {
      type: '',
      buttonType: {
        round: false,
        plain: false,
        icon: ''
      },
      inline: 'padding-right:8px; display: inline-block;'
    }
    this.watch = {}
    this.tagName = 'button'
    this.template = '<div style="text-align:left">' +
                    '  <el-button :type="type" @click="btnclick" v-bind="buttonType"><inner/></el-button> ' +
                    '</div>'
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.inline === false) {
          that.data.inline = ''
        }
        that.data.type = option.type || ''
        var btt = that.data.buttonType
        if (option.round === true) {
          btt.round = true
          btt.plain = false
        } else if (option.plain === true) {
          btt.round = false
          btt.plain = true
        }
        if (option.icon != null) {
          btt.icon = 'el-icon-' + option.icon
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          methods: {
            btnclick: function (ev) {
              if (typeof that.onclick === 'function') {
                that.onclick.apply(that, arguments)
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onclick' || cevent === 'click') {
        var that = this
        that.onclick = func
      }
    }
  }
}

/**
 * 按钮组件.
 */
class Icon extends Sdkbase {
  create () {
    this.data = {
      types: {
        class: ''
      }
    }
    this.watch = {}
    this.tagName = 'icon'
    this.template = '<i v-bind="types"><inner/></i> '
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.icon != null) {
          that.data.types.class = 'el-icon-' + option.icon
        }
        var ctype = dom.getAttribute('type')
        if (ctype != null && ctype !== '') {
          that.data.types.class = 'el-icon-' + ctype
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          methods: {
            btnclick: function (ev) {
              if (typeof that.onclick === 'function') {
                that.onclick.apply(that, arguments)
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'onclick' || cevent === 'click') {
        var that = this
        that.onclick = func
      }
    }
  }
}

/**
 * 行组件.
 */
class Row extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'row'
    this.template = '<el-row><inner></inner></el-row>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          }
        })
      }
    } // class
    this.clazz = EVue
  }
}

/**
 * 行组件.
 */
class Cols extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'cols'
    this.template = '<el-col><inner></inner></el-col>'
    // var that = this
    class EVue {
      constructor (dom, option) {
        var span = dom.getAttribute('span')
        if (span != null && span !== '') {
          dom.setAttribute(':span', span)
          dom.removeAttribute('span')
        }
      }
    } // class
    this.clazz = EVue
  }
}

/**
 * 布局容器组件.
 */
class Container extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'container'
    this.template = '<el-container><inner></inner></el-container>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          }
        })
      }
    } // class
    this.clazz = EVue
  }
}

/**
 * 布局容器组件.
 */
class CHeader extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'header'
    this.template = '<el-header><inner></inner></el-header>'
    this.clazz = null
  }
}

/**
 * 布局容器组件.
 */
class CAside extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'aside'
    this.template = '<el-aside><inner></inner></el-aside>'
    this.clazz = null
  }
}

/**
 * 布局容器组件.
 */
class CMain extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'main'
    this.template = '<el-main><inner></inner></el-main>'
    this.clazz = null
  }
}

/**
 * 布局容器组件.
 */
class CFooter extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'footer'
    this.template = '<el-footer><inner></inner></el-footer>'
    this.clazz = null
  }
}

/**
 * tabpane容器组件.
 */
class TabPane extends Sdkbase {
  create () {
    this.data = {
    }
    this.watch = {}
    this.tagName = 'tabpane'
    this.template = '<el-tab-pane><inner></inner></el-tab-pane>'
    this.clazz = null
  }
}

/**
 * 布局容器组件.
 */
class Tabs extends Sdkbase {
  create () {
    this.data = {
      position: 'top'
    }
    this.watch = {}
    this.tagName = 'tabs'
    this.template = '<el-tabs :tab-position="position" @tab-click="tabChanged"><inner></inner></el-tabs>'
    var that = this
    class EVue {
      constructor (dom, option) {
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          methods: {
            tabChanged: function (tab, event) {
              if (typeof that.ontabchanged === 'function') {
                that.apply(that, [tab, event])
              }
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  addEvent (cevent, func) {
    if (this.com) {
      if (cevent === 'tabchanged' || cevent === 'ontabchanged') {
        var that = this
        that.ontabchanged = func
      }
    }
  }
}

/**
 * 布局容器组件.
 */
class Dropmenu extends Sdkbase {
  create () {
    this.data = {
      idkey: 'id',
      capkey: 'text',
      splitbutton: false,
      caption: '',
      type: '',
      items: []
    }
    this.watch = {}
    this.tagName = 'dropmenu'
    this.template = '<el-dropdown :split-button="splitbutton">' +
                    '  <span>{{caption}}<i v-if="hasSplitButton" class="el-icon-arrow-down el-icon--right"></i></span>' +
                    '  <el-dropdown-menu slot="dropdown">' +
                    '    <el-dropdown-item v-for="(item, index) in items" ' +
                    '     :key="index" ' +
                    '     :disabled="item.disabled"' +
                    '     :divided="item.divided"' +
                    '     :icon="\'el-icon-\'+item.icon" ' +
                    '    >{{item.text}}</el-dropdown-item>' +
                    '  </el-dropdown-menu> ' +
                    '</el-dropdown>'
    var that = this
    class EVue {
      constructor (dom, option) {
        that.data.caption = option.caption
        if (option.items && option.items.length > 0) {
          // that.data.items = option.items
          that.setValue(option.items)
        }
        that.data.splitbutton = option.splitbutton === true
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          },
          computed: {
            hasSplitButton: function () {
              return that.data.splitbutton !== true
            }
          },
          methods: {
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  setValue (datas) {
    if (this.data) {
      this.data.items = []
      for (var i = 0, ilen = datas.length; i < ilen; i++) {
        var cdata = datas[i]
        var ndata = {
          id: cdata[this.idkey || 'id'],
          text: cdata[this.capkey || 'text']
        }
        this.data.items.push(ndata)
      }
    }
  }
}

/**
 * 布局容器组件.
 */
class Steps extends Sdkbase {
  create () {
    this.data = {
      idkey: 'id',
      capkey: 'text',
      active: 0,
      steps: []
    }
    this.watch = {}
    this.tagName = 'steps'
    this.template = '<el-steps :active="active" finish-status="success">' +
                    '  <el-step v-for="(step, index) in steps" :key="index" :title="step.text"></el-step>' +
                    '</el-steps>'
    var that = this
    class EVue {
      constructor (dom, option) {
        that.data.caption = option.caption
        if (option.items && option.items.length > 0) {
          that.setValue(option.items)
        }
        // eslint-disable-next-line no-new
        new Vue({
          el: dom,
          data () {
            return that.data
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  setValue (datas) {
    if (this.data) {
      this.data.steps = []
      for (var i = 0, ilen = datas.length; i < ilen; i++) {
        var cdata = datas[i]
        var ndata = {
          id: cdata[this.idkey || 'id'],
          text: cdata[this.capkey || 'text']
        }
        this.data.steps.push(ndata)
      }
    }
  }
  next () {
    if (this.data.active < this.data.steps.length) {
      this.data.active++
    }
  }
}

/**
 * 布局容器组件.
 */
class Menu extends Sdkbase {
  create () {
    this.data = {
      idkey: 'id',
      parentkey: 'pid',
      capkey: 'text',
      filterkey: 'text',
      mrefresh: 0,
      menuData: [],
      jumpdata: {
        jumptype: 0,
        url: ''
      },
      styleOption:
        {
          backgroundColor: '#384e61', // 背景颜色
          selectColor: '#fff', // 点击之后的颜色
          opacity: 1, // 菜单透明度
          width: '270px', // 菜单宽度
          color: '#fff', // 文字颜色
          hoverColor: '#ff0000', // 鼠标经过的背景颜色
          fontsize: '14px', // 是否显示钉住按钮
          siderBorder: '0px solid #ff0000', // 菜单边框
          imgSize: '14px', // 图标大小
          imgColor: '#fff', // 图标颜色
          imgPaddingTop: '0px',
          imgPaddingLeft: '0px',
          imgPaddingRight: '0px',
          imgPaddingBottom: '0px',
          imgMarginTop: '0px',
          imgMarginRight: '0px',
          imgMarginBottom: '0px',
          imgMarginLeft: '0px',
          imgWidth: '20px',
          nodeHeight: '40px',
          nodeTopBorderWidth: '1px',
          nodeBottomBorderWidth: '1px',
          nodeLeftBorderWidth: '1px',
          nodeRightBorderWidth: '1px',
          nodeBorderStyle: 'solid',
          nodeBorderColor: '#000'
        }
    }
    this.watch = {}
    this.tagName = 'menu'
    this.template = '<ecpmenu' +
      '    parentvalue="#"' +
      '    :mrefresh="mrefresh" ' +
      '    :ssearch="true"' +
      '    :sbtn="true"' +
      '    :soption="styleOption"' +
      '    :parentkey="parentkey"' +
      '    :idkey="idkey"' +
      '    :lable="capkey"' +
      '    :filterkey="filterkey"' +
      '    :options="menuData"' +
      '    @handle-jump="handlejump"' +
      '></ecpmenu>'
    var that = this
    class EVue {
      constructor (dom, option) {
        if (option.items && option.items.length > 0) {
          that.setValue(option.items)
        }
        if (option.idkey) {
          that.data.idkey = option.idkey
        }
        if (option.capkey) {
          that.data.capkey = option.capkey
        }
        if (option.filterkey) {
          that.data.filterkey = option.filterkey
        }
        if (option.parentkey) {
          that.data.parentkey = option.parentkey
        }
        // eslint-disable-next-line no-new
        that.vcom = new Vue({
          el: dom,
          data () {
            return that.data
          },
          router,
          components: {'ecpmenu': EcpMenu},
          methods: {
            handlejump: function (data) {
              that.data.jumpdata = data
            },
            refresh: function () {
              that.data.mrefresh++
            }
          }
        })
      }
    } // class
    this.clazz = EVue
  }
  setValue (datas) {
    if (this.data) {
      this.data.menuData = datas
      if (this.vcom) {
        this.vcom.refresh()
      }
    }
  }
}
var csdks = sdks
// 表单组件
sdks.search = Search
sdks.combobox = Combobox
sdks.updown = Updown
sdks.edit = Edit
sdks.radios = Radios
sdks.checkboxs = Checkboxs
sdks.switch = Switch
sdks.datepicker = Datepicker
sdks.tree = Tree
sdks.grid = Grid
sdks.button = Button
sdks.icon = Icon
// 布局组件
sdks.row = Row
sdks.cols = Cols
sdks.container = Container
sdks.header = CHeader
sdks.aside = CAside
sdks.main = CMain
sdks.footer = CFooter
sdks.tabpane = TabPane
sdks.tabs = Tabs
sdks.menu = Menu
sdks.dropmenu = Dropmenu
sdks.steps = Steps
// sdks.comselect = ComSelect

export default csdks
