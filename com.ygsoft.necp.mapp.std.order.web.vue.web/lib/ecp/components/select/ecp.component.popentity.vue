<template>
  <el-dialog
    v-if="visible"
    ref="dialog"
    class="ecp-popentity"
    v-bind="$props"
    destroy-on-close
    :width="bodyWidth"
    :top="top"
    :visible.sync="visible"
    :before-close="close"
  >
    <el-row :gutter="10">
      <el-col v-if="type != 'table'" :span="type == 'treeTable' ? 8 : 24">
        <el-row>
          <el-input v-model="treeFilterText" prefix-icon="el-icon-search" placeholder="搜索..."></el-input>
        </el-row>
        <el-row style="margin-top: 10px;">
          <el-scrollbar class="ecp-popentity-body">
            <el-tree
              ref="tree"
              :show-checkbox="multiple && type != 'treeTable'"
              default-expand-all
              highlight-current
              :load="treeLoadMethod"
              :lazy="treeLoadMethod"
              :data="currentTreeData"
              :node-key="treeIdField || idField"
              :filter-node-method="handleTreeFilter"
              :props="{ label: treeTextField || textField }"
              :expand-on-click-node="false"
              @current-change="handleTreeCurrentChange"
            ></el-tree>
          </el-scrollbar>
        </el-row>
        <div>已选中 {{ currentValue.length }} 条</div>
      </el-col>
      <el-col
        class="ecp-popentity-search"
        v-if="type != 'tree'"
        :span="type == 'treeTable' ? 16 : 24"
      >
        <el-row :gutter="10">
          <el-col :span="6">
            <el-select v-model="tableFilterForm.name" placeholder="请选择搜索列">
              <el-option
                v-for="(val, index) in colData"
                v-if="val.filter !== false"
                :label="val.label"
                :value="val.prop"
                :key="index"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="tableFilterForm.type">
              <el-option label="包含" :value="1"></el-option>
              <el-option label="等于" :value="0"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="tableFilterForm.text"
              @keydown.enter.native="handleSearch"
              placeholder="请输入关键字"
            ></el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-col>
        </el-row>
        <el-row style="margin-top: 10px;">
          <div class="ecp-popentity-body">
            <el-row>
              <el-table
                ref="table"
                :height="363"
                highlight-current-row
                border
                stripe
                :expand="multiple"
                :data="currentTableData"
                @select="handleTableSelect"
                @select-all="handleTableSelectAll"
                @cell-dblclick="handleCellDbclick"
                @current-change="handleTableCurrentChange"
              >
                <el-table-column
                  v-if="multiple"
                  type="selection"
                  align="center"
                  :selectable="unSelectable ? handleSelectable : null"
                  :width="40"
                ></el-table-column>
                <el-table-column v-for="(item, index) in colData" :key="index" v-bind="item">
                  <template slot-scope="scope">
                    <span
                      v-if="typeof item.format === 'function'"
                    >{{ item.format(scope.row[item.prop]) }}</span>
                    <span
                      v-else
                    >{{ item.data ? item.data[scope.row[item.prop]] : scope.row[item.prop] }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-show="!currentTableData.length" class="ecp-popentity-table-modal"></div>
            </el-row>
            <el-row style="margin-top: 10px;">
              <el-col v-if="multiple" :span="4" align="left">
                <div>已选中 {{ currentValue.length }} 条</div>
              </el-col>
              <el-col :span="multiple ? 20 : 24" align="right">
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                  small
                  background
                  layout="total, sizes, prev, pager, next, jumper"
                  :current-page="pageNumber"
                  :page-sizes="pageSizes"
                  :page-size="currentPageSize"
                  :total="currentTotal"
                ></el-pagination>
              </el-col>
            </el-row>
          </div>
        </el-row>
      </el-col>
    </el-row>
    <div slot="title" class="ecp-popentity-header">
      <slot name="header">实体选择</slot>
    </div>
    <div slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
      <slot name="footer"></slot>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog } from 'element-ui'

export default {
  name: 'ecpPopentity',
  props: {
    value: [Object, Array, String, Number], // 绑定的值
    type: {
      type: String,
      default: 'treeTable',
      validator: (val) => { // 类型 treetable/tree/table 树表/树/表
        return ['treeTable', 'tree', 'table'].indexOf(val) >= 0
      }
    },
    multiple: Boolean, // 是否多选
    search: {
      type: Boolean,
      default: true
    },
    idField: String, // id标识
    treeIdField: String, // 树的id标识
    textField: String, // 显示文字标识
    treeTextField: String, // 树的显示文字标识
    codeField: String, // 树结构化标识
    treeCodeField: String, // 树结构化标识
    codePolicy: String, // 树结构化编码 例： 4-4-4-4-4-4-4
    treeCodePolicy: String, // 树结构化编码 例： 4-4-4-4-4-4-4
    treeField: Object, // 构建树表关联时使用 格式： {parent: 'id', children: 'gid'}
    returnType: String, // 返回数据类型
    colData: Array, // 列数据
    tableData: Array, // 表数据
    treeData: Array, // 树数据
    treeLoadMethod: Function,
    selectParent: {
      type: Boolean,
      default: true
    }, // 树是否可以选父节点
    unSelectable: Array,
    pageSizes: {
      type: Array,
      default: () => {
        return [100, 200, 300, 400]
      }
    },
    pageSize: {
      type: Number,
      default: 100
    },
    total: Number,
    ...Dialog.props
  },
  data () {
    return {
      visible: false, // 控制显示
      treeDbClick: false,
      treeSelectValue: null, // 树选中的值
      tableSelectValue: null, // 表格选中的值
      currentValue: [], // 内部值
      pageNumber: 1, // 表格页数
      currentPageSize: this.pageSize, // 分页长度
      treeFilterText: '', // 树筛选文字
      tableFilterName: '', // 表格筛选列名
      tableFilterType: 1, // 表格筛选类型
      tableFilterText: '', // 表格筛选文字
      tableFilterForm: {
        name: '',
        type: 1,
        text: ''
      }
    }
  },
  methods: {
    // 显示
    show () {
      // 打开时重置参数
      this.visible = true
      this.pageNumber = 1
      this.currentPageSize = this.pageSize
      this.treeFilterText = ''
      // 选中传入selected的值
      if (this.colData) {
        let prop = ''
        this.colData.forEach(item => {
          if (item.selected) {
            prop = item.prop
            return
          }
        })
        this.tableFilterName = prop
      }
      this.tableFilterText = ''
      this.tableFilterType = 1
      this.treeSelectValue = null
      this.tableSelectValue = null
      this.tableFilterForm = {
        name: this.tableFilterName,
        type: this.tableFilterType,
        text: this.tableFilterText
      }
      // 如果是多选则选中已选择节点
      if (this.multiple) {
        if (Object.prototype.toString.call(this.value) === '[object Array]') {
          this.$nextTick(() => {
            // 树
            if (this.type === 'tree') {
              this.value.forEach(item => {
                let id = typeof item === 'object' ? item[this.treeIdField || this.idField] : item
                this.$refs.tree.setChecked(id, true, true)
              })
            } else {
              this.handleSelectCheck(this.value)
            }
          })
        }
      }
    },
    // 关闭
    close () {
      this.visible = false
    },
    // 清楚选择
    clearSelection () {
      if (this.multiple) {
        this.currentValue = []
        this.$refs.table.clearSelection()
      }
    },
    // table是否可选
    handleSelectable (row, index) {
      if (this.unSelectable) {
        return this.unSelectable.indexOf(row[this.idField]) < 0
      } else {
        return true
      }
    },
    // 树筛选
    handleTreeFilter (value, data) {
      if (!value) return true
      return data[this.treeTextField || this.textField].indexOf(value) !== -1
    },
    // 树选择
    handleTreeCurrentChange (val) {
      // 如果是双击则直接返回值
      if (!this.multiple) {
        if (!this.treeDbClick) {
          this.treeDbClick = true
          setTimeout(() => {
            this.treeDbClick = false
          }, 300)
        } else {
          this.handleConfirm()
        }
      }
      this.treeSelectValue = val
      this.$emit('tree-select', val, this.tableFilter, this.pageInfo)
    },
    // 如果是多选，则缓存已选过的数据
    handleTableSelect (selection, row) {
      let exist = false
      let id = row[this.idField]
      selection.forEach(item => {
        // 判断当前选中列是否存在已选中，存在则加入
        if (item[this.idField] === id) {
          exist = true
          // 判断选中的是否存在于currentValue中
          if (this.returnType === 'object' || this.returnType === 'Object') {
            let res = this.currentValue.filter(el => el[this.idField] === id)
            if (res.length > 0) {
              return
            }
          } else {
            if (this.currentValue.indexOf(id) >= 0) {
              return
            }
          }
          this.currentValue.push(this.returnType === 'object' ? row : id)
          return
        }
      })
      // 不存在则添加，因为初始化的时候会触发该事件，所以要做两次循环
      if (!exist) {
        this.currentValue.forEach((item, index) => {
          if (item[this.idField] === id || item === id) {
            this.currentValue.splice(index, 1)
            return
          }
        })
      }
    },
    // 全选
    handleTableSelectAll (selecttion) {
      if (selecttion.length > 0) {
        let data = [] // 需要添加的集合
        selecttion.forEach(item => {
          let exist = false
          this.currentValue.forEach(el => {
            let itemId = typeof item === 'object' ? item[this.idField] : item // 当前数据的id
            let elId = typeof el === 'object' ? el[this.idField] : el // 当前数据的id
            // 如果数据存在，则添加进去
            if (itemId == elId) {
              exist = true
              return
            }
          })
          // 如果存在则添加进集合
          if (!exist) {
            data.push(this.returnType ? item : item[this.idField])
          }
        })
        // 合并数组
        if (data.length > 0) {
          this.currentValue.push.apply(this.currentValue, data)
        }
      } else {
        let keys = [] // 需要删除的key的集合
        this.currentValue.forEach((item, index) => {
          this.currentTableData.forEach(el => {
            let itemId = typeof item === 'object' ? item[this.idField] : item // 当前数据的id
            let elId = typeof el === 'object' ? el[this.idField] : el // 当前数据的id
            // 如果数据存在，则移除
            if (itemId == elId) {
              keys.push(index)
              return
            }
          })
        })
        // 删除当前页取消全选的选项
        keys.forEach((item, index) => {
          this.currentValue.splice(item - index, 1)
        })
      }
    },
    // 表格单选
    handleTableCurrentChange (val) {
      this.tableSelectValue = val
    },
    // 搜索
    handleSearch () {
      this.tableFilterName = this.tableFilterForm.name
      this.tableFilterType = this.tableFilterForm.type
      this.tableFilterText = this.tableFilterForm.text
      this.$emit('popentity-search', this.treeSelectValue, this.tableFilter, this.pageInfo)
    },
    // 点击确认后返回值
    handleConfirm () {
      let data = null
      // 根据类型获取数据
      if (this.type == 'tree') {
        // 如果为多选则不选中父节点
        data = this.multiple ? this.$refs.tree.getCheckedNodes().filter(item => { return !item.children }) : this.$refs.tree.getCurrentNode()
      } else {
        data = this.multiple ? this.currentValue : this.tableSelectValue
      }
      // 如果设置selectParent，则parent节点不可选
      if (!this.selectParent && this.type == 'tree' && data.children) {
        return false
      }
      let res // 返回值
      // 判断是否已选择数据
      if ((this.multiple && data.length > 0) || (!this.multiple && data)) {
        // 根据传入的value类型，返回相应的处理数据
        if (this.returnType === 'object' || this.returnType === 'Object') {
          res = data
        } else {
          // 根据是否多选返回参数
          if (this.multiple) {
            res = []
            data.forEach(item => {
              res.push(item[this.idField] || item)
            })
          } else {
            res = data[this.idField]
          }
        }
        this.$emit('input', res)
        this.$emit('change', res)
        this.$emit('popentity-confirm', res)
      } else {
        this.$emit('input', null)
        this.$emit('change', null)
        this.$emit('popentity-confirm', null)
      }
      this.visible = false
    },
    // 表格双击，如果为单选，则返回值
    handleCellDbclick (val) {
      if (!this.multiple) {
        let data = this.returnType === 'object' ? val : val[this.idField]
        this.$emit('input', data)
        this.$emit('change', data)
        this.$emit('popentity-confirm', data)
        this.visible = false
      }
    },
    // 表格分页size变更事件
    handleSizeChange (size) {
      this.currentPageSize = size
      this.$emit('size-change', this.treeSelectValue, this.tableFilter, this.pageInfo)
    },
    // 表格分页变更事件
    handlePageChange (page) {
      this.pageNumber = page
      this.$emit('page-change', this.treeSelectValue, this.tableFilter, this.pageInfo)
    },
    // 选中当前value内的节点（初始化使用）
    handleSelectCheck (val) {
      this.$nextTick(() => {
        val.forEach(item => {
          this.currentTableData.forEach(el => {
            let itemId = typeof item === 'object' ? item[this.idField] : item // 当前数据的id
            let elId = typeof el === 'object' ? el[this.idField] : el // 当前数据的id
            // 如果数据存在，则通过触发表格的select事件，将value的数据添加进currentValue内
            if (itemId == elId) {
              this.$refs.table.toggleRowSelection(el, true)
              return
            }
          })
        })
      })
    },
    /**
     * 构建jstree 能识别的json。
     */
    getJsTreeJson (data, treeOpt) {
      if (!data || !data.length) return []
      var node, pNode, jsTreeData = [],
        me = this,
        treeCodeField = treeOpt.treeCodeField,
        treeParentField = treeOpt.treeParentField
      //按itemcode排序.
      data.sort(function (a, b) {
        return a[treeCodeField].localeCompare(b[treeCodeField])
      })
      if (treeParentField) {
        let datas = this.doParentData(data, treeOpt)
        for (let i = 0, j = datas.length; i < j; i++) {
          node = me.createParentNode(datas[i], treeParentField, treeOpt)
          jsTreeData.push(node)
        }
      } else {
        for (let i = 0, j = data.length; i < j; i++) {
          node = me.createNode(data[i], treeOpt)
          pNode = me.getpNode(node, jsTreeData)
          if (pNode) {
            pNode.children.push(node)
          } else {
            jsTreeData.push(node)
          }
        }
      }
      return jsTreeData
    },
    /**
     * 处理父节点.
     */
    doParentData (data, treeOpt) {
      let len = data.length,
        treeCodeField = treeOpt.treeCodeField,
        treeParentField = treeOpt.treeParentField
      for (let i = 0; i < len; i++) {
        let pv = data[i][treeParentField]
        let bool = false
        for (let j = 0; j < len; j++) {
          if (data[j][treeCodeField] == pv) {
            bool = true
            break
          }
        }
        if (!bool) {
          data[i].parent = "#"
        }
      }
      return data
    },
    /**
     * 创建parent字段节点.
     * 构建id和parent结构的数据
     * @param {Object} data 数据对象
     * @param {String} treeParentField 父节点字段
     */
    createParentNode (data, treeParentField, treeOpt) {
      let node = data,
        treeCodeField = treeOpt.treeCodeField,
        treeTextField = treeOpt.treeTextField,
        treeCodePolicy = treeOpt.treeCodePolicy
      node.id = data[treeCodeField]
      node.text = data[treeTextField]
      if (node.parent != "#") {
        node.parent = data[treeParentField]
      }
      let nodelen = treeCodePolicy.split("-")
      let treelen = 0
      for (let i = 0, j = nodelen.length; i < j; i++) {
        if (node[treeCodeField].length == treelen + parseInt(nodelen[i])) {
          break
        } else {
          treelen = treelen + parseInt(nodelen[i])
        }
      }
      node.pid = data[treeCodeField].substr(0, treelen)
      return node
    },
    /**
     * 创建节点.
     * 构建id和children结构的数据
     * @param {Object} data 树节点数据对象
     */
    createNode (data, treeOpt) {
      let node = data,
        treeCodeField = treeOpt.treeCodeField,
        treeTextField = treeOpt.treeTextField,
        treeIdField = treeOpt.treeIdField,
        treeCodePolicy = treeOpt.treeCodePolicy,
        nodelen = treeCodePolicy.split("-"),
        treelen = 0
      node.id = data[treeCodeField]
      node.text = data[treeTextField]
      for (let i = 0, j = nodelen.length; i < j; i++) {
        if (node[treeCodeField].length == treelen + parseInt(nodelen[i])) {
          break
        } else {
          treelen = treelen + parseInt(nodelen[i])
        }
      }
      node.pid = data[treeCodeField].substr(0, treelen)
      node.children = []
      return node
    },
    /**
     * 获取上级节点.
     */
    getpNode (node, jsTreeData) {
      let pNode
      for (let i = 0, j = jsTreeData.length; i < j; i++) {
        pNode = jsTreeData[i]
        if (!node.pid) {
          return null
        } else if (node.pid == pNode.id) {
          return pNode
        } else if (pNode.children.length) {
          pNode = this.getpNode(node, pNode.children)
        }
      }
      return pNode
    }
  },
  computed: {
    // dialog宽度，如果未传入宽度则根据类型设置默认值
    bodyWidth () {
      if (this.width) return this.width
      if (this.type == 'treeTable') {
        return '1200px'
      } else if (this.type == 'tree') {
        return '500px'
      } else {
        return '800px'
      }
    },
    // 表格筛选条件
    tableFilter () {
      return {
        name: this.tableFilterName, // 表格筛选列名
        type: this.tableFilterType, // 表格筛选类型
        text: this.tableFilterText // 表格筛选文字
      }
    },
    // page信息
    pageInfo () {
      return {
        pageNumber: this.pageNumber,
        pageSizes: this.pageSizes,
        pageSize: this.currentPageSize,
        total: this.currentTotal
      }
    },
    // 如果传入的树data使用一维数组，则进行格式化
    currentTreeData () {
      let treeCodeField = this.treeCodeField || this.codeField
      let treeCodePolicy = this.treeCodePolicy || this.codePolicy
      if (treeCodeField && treeCodePolicy) {
        return this.getJsTreeJson(this.treeData, {
          treeIdField: this.treeIdField || this.idField,
          treeTextField: this.treeTextField || this.textField,
          treeCodeField,
          treeCodePolicy
        })
      } else {
        return this.treeData
      }
    },
    // 经过树和搜索筛选过后的data
    filterTableData () {
      if (this.type === 'tree') return []
      if (!this.search) return this.tableData
      if (this.tableData) {
        let data = [] // 返回数据
        let treeNode = this.treeSelectValue // 选中树节点
        // 如果搜索或选中树节点
        if ((this.tableFilterName && this.tableFilterText) || treeNode) {
          data = this.tableData.filter(item => {
            // 通过搜索筛选
            if (this.tableFilterName && this.tableFilterText) {
              // 是包含还是等于
              if (this.tableFilterType === 1) {
                if (String(item[this.tableFilterName]).indexOf(this.tableFilterText) == -1) {
                  return
                }
              } else {
                if (String(item[this.tableFilterName]) !== this.tableFilterText) {
                  return
                }
              }
            }
            // 树筛选
            if (this.treeField && this.treeField.parent && this.treeField.children) {
              if (treeNode) {
                if (this.treeCodeField || this.treeCodePolicy) {
                  if (String(item[this.treeField.children]).indexOf(String(treeNode[this.treeField.parent])) == -1) {
                    return
                  }
                } else {
                  if (!treeNode[this.treeField.parent] === item[this.treeField.children]) {
                    return
                  }
                }

              }
            }
            return true
          })
        } else {
          return this.tableData
        }
        return data
      } else {
        return []
      }
    },
    // 内部使用表格data，主要用于分页
    currentTableData () {
      // 如果用户传入total则使用用户自己分页
      if (this.total) {
        return this.filterTableData
      } else {
        // 内部分页
        let dataLen = this.filterTableData.length // data长度
        if (dataLen > this.pageSize) {
          let data = [] // data
          let pageBegin = (this.pageNumber - 1) * this.currentPageSize // 每页起始位置
          let pageEnd = this.pageNumber * this.currentPageSize - 1 // 每页结束位置
          let len = pageEnd > dataLen - 1 ? dataLen - 1 : pageEnd // 循环长度
          for (let i = pageBegin; i <= len; i++) {
            data.push(this.filterTableData[i])
          }
          return data
        } else {
          return this.filterTableData
        }
      }
    },
    // 计算总条数，如果用户自行分页则使用用户传入的，否则根据数据长度
    currentTotal () {
      return this.total || this.filterTableData.length
    }
  },
  watch: {
    // 监听传入的value，将其付给新的value
    value (val) {
      if (Object.prototype.toString.call(this.value) === '[object Array]' && this.multiple && this.visible) {
        if (val.length === 0) {
          this.currentValue = []
        } else {
          this.handleSelectCheck(val)
        }
      }
    },
    // 如果col是异步传入，则重新选中第一条
    colData (val) {
      this.tableFilterName = this.colData ? this.colData[0].prop : ''
      this.tableFilterForm.name = this.tableFilterName
    },
    // 获取pageSize
    pageSize (val) {
      this.currentPageSize = val
    },
    // 筛选
    treeFilterText (val) {
      this.$refs.tree.filter(val)
    },
    // data发生变化选中已选的数据
    currentTableData (val) {
      if (this.multiple && this.visible) {
        this.handleSelectCheck(this.currentValue)
      }
    }
  }
}
</script>

<style>
.ecp-popentity-body {
  width: 100%;
  height: 400px;
}
.ecp-popentity-body.el-scrollbar {
  box-sizing: border-box;
  border: #dcdfe6 1px solid;
}
.ecp-popentity-body .el-scrollbar__wrap {
  overflow: auto;
}
.ecp-popentity-table-modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 41px;
  height: 35px;
  z-index: 2;
}
.app-scss .ecp-popentity .el-pagination,
.app-scss .ecp-popentity .el-pagination .el-input__inner {
  height: 22px;
  line-height: 22px;
}
.ecp-popentity-header {
  text-align: left;
}
.app-scss .ecp-popentity-search .el-button--mini {
  padding: 6px 20px;
}
.app-scss .ecp-popentity-body .el-pagination .el-input--mini .el-input__icon {
  line-height: 20px;
}
</style>
