<template>
  <div class="tl-date-picker">
    <el-date-picker
      ref="datepicker"
      v-bind="$props"
      v-model="currentValue"
      :format="currentFormat"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    ></el-date-picker>
  </div>
</template>

<script>
import utils from 'ecp.utils'

export default {
  name: 'TlDatePicker',
  props: {
    type: String,
    size: String,
    format: [String, Object],
    valueFormat: String,
    readonly: Boolean,
    placeholder: String,
    startPlaceholder: String,
    endPlaceholder: String,
    prefixIcon: String,
    clearIcon: {
      type: String,
      default: 'el-icon-circle-close'
    },
    disabled: Boolean,
    clearable: {
      type: Boolean,
      default: true
    },
    popperClass: String,
    editable: {
      type: Boolean,
      default: true
    },
    align: {
      type: String,
      default: 'left'
    },
    value: {},
    defaultValue: {},
    defaultTime: {},
    rangeSeparator: {
      default: '-'
    },
    pickerOptions: {},
    unlinkPanels: Boolean,
    validateEvent: {
      type: Boolean,
      default: true
    },
    ecpDate: Boolean // 是否返回ecpdate类型数据
  },
  mounted () {
    this.datepicker = this.$refs.datepicker
  },
  data () {
    return {
      currentValue: this.getDate(this.value) // 内部使用value
    }
  },
  methods: {
    // 根据传入的日期转换
    getDate (val) {
      let res = val
      // 如果是X至X模式
      if (this.type === 'daterange' || this.type === 'datetimerange') {
        res = []
        if (typeof val === 'object') {
          val.forEach(item => {
            if (String(val).indexOf('/Date(') >= 0) {
              res.push(utils.ecpDateToDate(item, true))
            } else {
              res.push(item)
            }
          })
        }
      } else {
        if (String(val).indexOf('/Date(') >= 0) {
          res = utils.ecpDateToDate(val, true)
        }
      }
      return res
    },
    // 返回ecpDate格式的值
    returnDate (val) {
      if (val) {
        // 如果返回是ecpDate模式
        if (this.ecpDate) {
          // 如果是X至X模式
          if (this.type === 'daterange' || this.type === 'datetimerange') {
            let res = []
            val.forEach(item => {
              if (typeof item === 'string') {
                res.push(utils.dateToEcpDate(item))
              } else {
                res.push(utils.dateToEcpDate(utils.dateToStr(item), 'yyyy-MM-dd h:m:s'))
              }
            })
            return res
          } else {
            if (typeof val === 'string') {
              return utils.dateToEcpDate(val)
            } else {
              return utils.dateToEcpDate(utils.dateToStr(val, 'yyyy-MM-dd h:m:s'))
            }
          }
        } else {
          return val
        }
      } {
        return val
      }

    },
    handleInput (val) {
      this.$emit('input', this.returnDate(val))
    },
    handleChange (val) {
      // 当调用的是非elemenet原生的格式化，则使用utils的格式化
      this.$nextTick(() => {
        if (typeof this.format === 'object') {
          let el = this.$refs.datepicker.$el
          if (this.type === 'daterange' || this.type === 'datetimerange') {
            this.value.forEach((value, index) => {
              el.querySelectorAll('input')[index].value = utils.timeFormatting(value, this.format.string, this.format.option)
            })
          } else {
            el.querySelector('input').value = utils.timeFormatting(val, this.format.string, this.format.option)
          }
        }
      });
      this.$emit('change', this.returnDate(val))
    },
    handleBlur (e) {
      this.$emit('blur', e)
    },
    handleFocus (e) {
      this.$emit('focus', e)
    }
  },
  computed: {
    currentFormat() {
      if (typeof this.format === 'string') return this.format
      return ''
    }
  },
  watch: {
    value (val) {
      this.currentValue = this.getDate(val)
    }
  }
}
</script>