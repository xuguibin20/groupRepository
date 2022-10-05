<template>
  <div
    :class="`ecp-select${showmore ? ' show-more' : ''}`"
    :style="{
      width: inputwidth ?  inputwidth + 'px' : '',
      height:inputheight ? inputheight + 'px' : ''
    }"
  >
    <el-select
      :class="inputborder"
      v-bind="$props"
      v-model="currentValue"
      ref="select"
      collapseTags
      :clearable="!multiple"
      placeholder="请输入..."
      @input="input"
      @visible-change="visibleChange"
      @remove-tag="removeTag"
      @change="change"
      @clear="clear"
      @blur="blur"
      @focus="focus"
    >
      <el-option
        v-for="item in data"
        :key="item[idField]"
        :label="item[textField]"
        :value="item[idField]"
      ></el-option>
    </el-select>
    <el-button
      :style="{
        height: inputheight? inputheight-2 + 'px' : ''
      }"
      v-if="showmore"
      :size="size"
      :disabled="disabled"
      @click="handleShowmore"
      class="el-icon-more"
    ></el-button>
  </div>
</template>

<script>
import { Select } from 'element-ui'

// handle-more   点击更多回调事件
// change  结果发生改变回调
// clear  清除回调
// blur   失去焦点回调（注：多选状态下，此回调事件不可用）
// focus  获得焦点回调（注：多选状态下，此回调事件不可用，同时触发change事件）
// visible-change 获取下拉菜单的状态（注：此回调事件在多选状态下可监听input失去获得焦点事件）
// options: {
//   searchKey: null, 搜索关键词
//   focus: false 焦点状态，多选状态下可使用，用于判断当前是不是第一次获取焦点
//   showmore: Boolean, 更多 true/false
// }
// disabled: Boolean, 是否禁用 true/false
// multiple: Boolean, 是否多选 true/false
// collapsetags: Boolean, 多选后合并为一段文字 true/false
// size: String, 按钮大小 medium/small/mini
// filterable: Boolean, 是否支持搜索 true/false
// options: Object, 接收参数
// remote: Boolean 是否远程搜索
// idField: 'dxid', 节点id
// textField: 'dxmc', 节点名称
// value: null, 选择结果
// data: [], 数组
export default {
  name: 'ecpSelect',
  props: {
    showmore: {
      // 类型 entitySelect/treeSelect/popEntity 树表/树/表
      default: false,
      type: Boolean
    }, // 更多 true/false
    value: [Object, Array, String, Number],
    textField: String,
    idField: String,
    data: {
      // select数据
      type: Array,
      require: true
    },
    returnType: String, // 返回数据类型
    ...Select.props
  },
  data () {
    return {
      inputheight: '',
      inputwidth: '',
      select: null,
      currentValue: this.getCurrentValue(),
      isFirst: false,
      inputborder: '',
      popstates: false
    }
  },
  mounted () {
    this.select = this.$refs.select
  },
  methods: {
    // 根据传入的类型解析真实的值
    getCurrentValue () {
      if (this.multiple) {
        let dataType = Object.prototype.toString.call(this.value)
        if (dataType !== '[object Array]' && dataType !== '[object Null]') {
          console.error('当通用选择为多选时，绑定值必须为数组！')
          return
        }
      }
      // 如果传入的为object则在进行处理
      if (typeof this.value === 'object') {
        let temp = null
        // 如果是对选则在进行处理
        if (this.multiple) {
          temp = []
          if (this.value) {
            this.value.forEach(item => {
              if (typeof item === 'object') {
                temp.push(item[this.idField])
              } else {
                temp.push(item)
              }
            })
          }
        } else {
          // 如果传入的是非object或array则直接返回
          temp = this.value ? this.value[this.idField] : null
        }
        return temp ? temp : null
      }
      return this.value
    },
    // 根据传入的类型，返回相应的值
    returnCurrentValue () {
      let temp = null
      // 如果传入的为object则在进行处理
      if (this.returnType === 'object' || this.returnType === 'Object') {
        temp = []
        this.data.forEach(item => {
          if (this.multiple) {
            // 如果传入的为多选则不进行处理
            if (
              Object.prototype.toString.call(this.value) === '[object Array]'
            ) {
              this.currentValue.forEach((el, index) => {
                if (item[this.idField] === el) {
                  temp.push(item)
                  return
                }
              })
            }
          } else {
            if (item[this.idField] === this.currentValue) {
              temp = item
              return
            }
          }
        })
      } else {
        temp = this.currentValue
      }
      return temp
    },
    handleShowmore () {
      this.$emit('handle-more', this.returnCurrentValue())
    },
    input () {
      this.$emit('input', this.returnCurrentValue())
    },
    change () {
      this.$emit('change', this.returnCurrentValue())
    },
    blur (e) {
      this.popstates = e.type
      this.$emit('blur', e)
    },
    focus (e) {
      this.popstates = e.type
      this.isFirst = true
      this.$emit('focus', e)
    },
    clear () {
      this.$emit('clear')
    },
    visibleChange (e) {
      this.$emit('visible-change', e)
    },
    removeTag (e) {
      this.$emit('remove-tag', e)
    }
  },
  watch: {
    // 监听传入的value，将其付给新的value
    value (val) {
      this.currentValue = this.getCurrentValue()
    }
  }
}
</script>

<style lang="less">
.ecp-select {
  position: relative;
  .inputborder {
    .el-input__inner {
      border: 0;
    }
  }
  .el-input__icon {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .el-select {
    width: 100%;
    height: 100%;
  }
  .el-button {
    position: absolute;
    top: 1px;
    right: 1px;
    border: 0px;
    padding-left: 10px !important;
    padding-right: 10px !important;
    background: #fff;
  }
  .el-button--mini,
  .el-button--small {
    top: 2px;
  }
  &.show-more {
    .el-select {
      .el-input__inner {
        padding-right: 60px;
      }
      .el-input__suffix {
        right: 35px;
      }
    }
  }
}
.app-scss {
  .ecp-select {
    .el-button--mini,
    .el-button--small {
      top: 1px;
      padding: 6px 20px;
      border-radius: 0;
    }
  }
}
.gridEditFocusCell {
  .ecp-select {
    .el-select__tags,
    .el-input,
    .el-input__inner {
      height: 100% !important;
    }
    > .el-button {
      padding: 0;
    }
  }
}
</style>
