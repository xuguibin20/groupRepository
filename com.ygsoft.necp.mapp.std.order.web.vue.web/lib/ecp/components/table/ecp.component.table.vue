<template>
  <div class="ecp-table">
    <el-table
      ref="table"
      v-bind="$props"
      :data="tableData"
      :class="{ 'is-page': page }"
      stripe
      highlight-current-row
      @select="handleSelect"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      @cell-mouse-enter="handleCellMouseEnter"
      @cell-mouse-leave="handleCellMouseLeave"
      @cell-click="handleCellClick"
      @cell-dblclick="handleCellDbclick"
      @row-click="handleRowClick"
      @row-contextmenu="handleRowContextmenu"
      @row-dblclick="handleRowDbclick"
      @header-click="handleHeaderClick"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
      @current-change="handleRowChange"
      @header-dragend="handleHeaderDragend"
      @expand-change="handleExpandChange"
    >
      <slot></slot>
    </el-table>
    <div class="ecp-table-page">
      <el-pagination
        background
        :page-size="pageSize"
        :current-page="pageNumber"
        layout="total, prev, pager, next, jumper"
        :total="currentTotal"
        @current-change="handlePageChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { Table } from 'element-ui'

export default {
  name: 'ecpTable',
  props: {
    changeSetModel: Boolean, // 是否为ecp模式
    idField: { // 主键字段
      type: String,
      default: 'gid'
    },
    page: Boolean, // 分页字段，如果有传入则进行表格分页
    total: Number, // 总条数
    ...Table.props
  },
  data () {
    return {
      table: null, // 表格对象
      tableData: this.data, // 内部表格data
      selection: {}, // 当前选中行
      pageNumber: 1, // 当前页数
      rowTemp: null, // 缓存变更行
      dataLengthTemp: 0, // 缓存变更前行数
      changeSet: [] // 变更集
    }
  },
  mounted () {
    this.table = this.$refs.table
  },
  methods: {
    // 获取分页数据
    initData () {
      if (this.page) {
        // 分页
        let dataLen = this.data.length // 数据长度
        let pageBegin = (this.pageNumber - 1) * this.pageSize // 每页起始位置
        let pageEnd = this.pageNumber * this.pageSize - 1 // 每页结束位置
        let len = pageEnd > dataLen - 1 ? dataLen - 1 : pageEnd // 循环长度
        this.tableData = []
        for (let i = pageBegin; i <= len; i++) {
          if (!this.changeSetModel || this.data[i].modelState !== 8) {
            this.data[i].index = i - pageBegin
            this.tableData.push(this.data[i])
          } else {
            len++
          }
        }
      }
      // 如果是ecp模式，则载入变更集
      if (this.changeSetModel) {
        this.tableData.forEach((item, index) => {
          this.changeSet.forEach((val, key) => {
            // 如果变更集内存在该数据则替换
            if (item[this.idField] === val[this.idField]) {
              this.tableData[index] = val
              return false
            }
          })
        })
      }
    },
    getSelection () {
      return {
        row: this.rowTemp,
        index: ((this.pageNumber - 1) * this.pageSize) + this.rowTemp.index
      }
    },
    // 获取变更集
    getChangeSet () {
      this.$refs.table.setCurrentRow()
      return this.changeSet
    },
    // 消除变更集
    mergeChangeLog () {
      this.changeSet = []
    },
    // 添加变更进入变更集
    addChangeSet (val) {
      let exist = false // 变更数据是否已存在于变更集内
      this.changeSet.forEach((item, index) => {
        // 如果存在则替换
        if (item[this.idField] === val[this.idField]) {
          this.changeSet[index] = val
          exist = true
          return false
        }
      })
      // 不存在则添加
      if (!exist) {
        this.changeSet.push(val)
      }
    },
    // 设置行值方法
    setRow (row, val) {
      this.$set(this.tableData, row, val)
      this.tableData[row].modelState = 8
      this.addChangeSet(this.tableData[row])
    },
    // 设置单元格值方法
    setCell (row, key, val) {
      this.$set(this.tableData[row], key, val)
      this.tableData[row].modelState = 8
      this.addChangeSet(this.tableData[row])
    },
    // 删除方法
    delete (key) {
      this.tableData[key].modelState = 2
      this.addChangeSet(this.tableData[key])
      this.$delete(this.tableData, key)
      this.rowTemp = null
    },
    // 暴露出element table内部的事件
    handleSelect (selection, row) { this.$emit('select', selection, row) },
    handleSelectAll (selection) { this.$emit('select-all', selection) },
    handleSelectionChange (selection) { this.$emit('select-all', selection) },
    handleCellMouseEnter (row, column, cell, event) { this.$emit('cell-mouse-enter', row, column, cell, event) },
    handleCellMouseLeave (row, column, cell, event) { this.$emit('cell-mouse-leave', row, column, cell, event) },
    // 选择当前点击行
    handleCellClick (row, column, cell, event) {
      this.$refs.table.setCurrentRow(row)
      this.$emit('cell-click', row, column, cell, event)
    },
    handleCellDbclick (row, column, cell, event) { this.$emit('cell-dblclick', row, column, cell, event) },
    handleRowClick (row, column, event) { this.$emit('row-click', row, column, event) },
    handleRowContextmenu (row, column, event) { this.$emit('row-contextmenu', row, column, event) },
    handleRowDbclick (row, column, event) { this.$emit('row-dblclick', row, column, event) },
    handleHeaderClick (column, event) { this.$emit('header-click', column, event) },
    handleSortChange (column, event) { this.$emit('header-contextmenu', column, event) },
    handleFilterChange (filters) { this.$emit('filter-change', filters) },
    // 当切换焦点行时进行保存变更
    handleRowChange (newRow, oldRow) {
      // 之前是否有选中过，有则判断是否有变更
      if (oldRow) {
        let keys = Object.keys(oldRow) // object的key集合
        let isChange = false // 是否有变更
        keys.forEach((val, key) => {
          if (key !== 'modelState' && oldRow[val] !== this.rowTemp[val]) {
            isChange = true
            return false
          }
        })
        // 如果有变更则加入变更集中
        if (isChange) {
          oldRow.modelState = 8
          this.addChangeSet(oldRow)
        }
      }
      // 缓存新选择行
      this.rowTemp = {
        ...newRow
      }
      this.$emit('row-change', newRow, oldRow)
    },
    handleHeaderDragend (newWidth, oldWidth, column, event) { this.$emit('header-dragend', newWidth, oldWidth, column, event) },
    handleExpandChange (row, expandedRows) { this.$emit('expand-change', row, expandedRows) },
    // 获取分页信息
    getPageInfo () {
      return {
        page: this.pageNumber,
        size: this.pageSize,
        totle: totle || this.data.length
      }
    },
    // 分页事件
    handlePageChange (currentPage) {
      this.pageNumber = currentPage
      this.$emit('page-change', currentPage, this.pageSize)
    }
  },
  computed: {
    // 每页条数
    pageSize () {
      return parseInt(this.height / 29) - 1
    },
    // 总条数
    currentTotal () {
      return this.total || this.data.length
    }
  },
  watch: {
    // 根据表格高度分页
    height (val) {
      this.initData()
    },
    pageNumber () {
      this.initData()
    },
    data (val) {
      // 如果不是第一次载入且为内部分页模式，则新增或删除时变更当前页
      if (this.dataLengthTemp != 0 && this.page) {
        let page = Math.ceil(this.data.length / this.pageSize)
        // 删除数据
        if (this.dataLengthTemp > val.length) {
          if (this.pageNumber > page) this.pageNumber = page
          this.rowTemp = null
        } else {
          // 新增数据
          this.pageNumber = page
        }
      }
      // 缓存当前数据条数
      this.dataLengthTemp = val.length
      this.initData()
    }
  }
}
</script>

<style>
.ecp-table {
  width: 100%;
  font-size: 14px !important;
}
.ecp-table-page {
  text-align: right;
  margin-top: 10px;
}
.ecp-table tbody td,
.ecp-table tbody .cell {
  height: auto;
  padding: 0 !important;
}
.ecp-table tbody .cell {
  padding-left: 10px !important;
}
.ecp-table tbody .is-center > .cell {
  padding-left: 0 !important;
}
.ecp-table tbody .el-input {
  width: calc(100% + 10px);
  margin-left: -10px;
}
.ecp-table tbody .is-center .el-input {
  width: 100%;
  margin-left: 0;
}
.ecp-table input {
  border-radius: 0px;
  border-color: transparent;
  background: transparent !important;
}
.app-scss .ecp-table .el-input__inner {
  border-color: transparent;
}
.ecp-table .is-page .el-table__body-wrapper {
  overflow-y: hidden;
}
</style>
