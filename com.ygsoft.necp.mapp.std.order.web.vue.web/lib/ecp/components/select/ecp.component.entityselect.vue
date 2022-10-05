<template>
  <div class="ecp-entityselect">
    <ecp-select
      ref="select"
      showmore
      v-bind="$props"
      v-model="currentValue"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
      @clear="handleClear"
      @visible-change="handleVisibleChange"
      @remove-tag="handleRemoveTag"
      @handle-more="handleMore"
    />
    <ecp-popentity
      ref="popentity"
      :type="type"
      v-bind="$props"
      v-model="currentValue"
      @input="handleInput"
      @change="handleChange"
      @tree-select="handleTreeSelect"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
      @popentity-search="handlePopentitySearch"
      @popentity-confirm="handlePopentityConfirm"
      @popentity-close="handlePopentityClose"
    >
      <div slot="header">
        <slot name="header">实体选择</slot>
      </div>
    </ecp-popentity>
  </div>
</template>

<script>
import { Select } from 'element-ui'
import EcpSelect from './ecp.component.select'
import EcpPopentity from './ecp.component.popentity'

export default {
  name: 'ecpEntityselect',
  components: { EcpSelect, EcpPopentity },
  /**
 * 通用实体选择组件
 * 包含通用树选择、通用表选择、通用树+表选择
 * @param {value} value 绑定的值
 * @param {Array} data 下拉框option内数据
 * @param {Array} entityTreeData 实体选择的树的数据
 * @param {Array} entityGridData 实体选择的表格的数据
 * @param {String} type 实体选择的类型 entitySelect/treeSelect/popEntity 树表/树/表
 * @param {Object} options 属性
 */
  props: {
    value: { // 绑定的值
      require: true
    },
    data: { // select数据
      type: Array,
      require: true
    },
    ...EcpPopentity.props,
    ...Select.props
  },
  data () {
    return {
      select: null,
      currentValue: this.value // 内部使用value
    }
  },
  mounted () {
    this.select = this.$refs.select.select
  },
  methods: {
    // 点击更多回调事件
    handleMore (data) {
      this.$refs.popentity.show()
      this.$emit('handle-more', data)
    },
    // popentity树选择事件
    handleTreeSelect (treeNode, tableFilter, pageInfo) {
      this.$emit('tree-select', treeNode, tableFilter, pageInfo)
    },
    // popentity表格搜索事件
    handlePopentitySearch (treeNode, tableFilter, pageInfo) {
      this.$emit('popentity-search', treeNode, tableFilter, pageInfo)
    },
    // popentity分页条数事件
    handleSizeChange (treeNode, tableFilter, pageInfo) {
      this.$emit('size-change', treeNode, tableFilter, pageInfo)
    },
    // popentity分页变更事件
    handlePageChange (treeNode, tableFilter, pageInfo) {
      this.$emit('size-change', treeNode, tableFilter, pageInfo)
    },
    // popentity点击确认后事件
    handlePopentityConfirm (data) {
      this.$emit('popentity-confirm', data)
    },
    // popentity关闭后事件
    handlePopentityClose (data) {
      this.$emit('popentity-close', data)
    },
    // 失去焦点回调（注：多选状态下，此回调事件不可用）
    handleBlur (event) {
      this.$emit('blur', event)
    },
    // 获得焦点回调（注：多选状态下，此回调事件不可用，同时触发change事件）
    handleFocus (event) {
      this.$emit('focus', event)
    },
    // 结果发生改变回调，并触发v-model
    handleInput () {
      this.$emit('input', this.currentValue)
    },
    // 结果发生改变回调
    handleChange () {
      this.$emit('change', this.currentValue)
    },
    // 清除回调
    handleClear () {
      this.$emit('clear')
    },
    // 获取下拉菜单的状态（注：此回调事件在多选状态下可监听input失去获得焦点事件）
    handleVisibleChange (event) {
      this.$emit('visible-change', event)
    },
    handleRemoveTag (event) {
      this.$emit('remove-tag', event)
    }
  },
  watch: {
    // 监听传入的value，将其付给新的value
    value (val) {
      this.currentValue = val
    }
  }
}
</script>