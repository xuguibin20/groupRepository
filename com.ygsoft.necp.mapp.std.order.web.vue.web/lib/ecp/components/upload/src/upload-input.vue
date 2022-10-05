<template>
  <div class="ecp-upload-input">
    <el-input
      v-model="currentValue"
      v-bind="$props"
      readonly
      :title="currentValue"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    ></el-input>
    <el-button @click="handleMore" :size="size" :disabled="disabled" class="el-icon-more"></el-button>
  </div>
</template>

<script>
import utils from "ecp.utils"
import request from 'ecp.service'
import EcpUpload from 'ecp.upload'
import UploadDialog from './upload-dialog'
import { Input } from 'element-ui'

export default {
  name: 'EcpUploadInput',
  props: {
    ...UploadDialog.props,
    ...Input.props,
    init: {
      type: Boolean,
      default: true
    },
    onClose: Function,
    onMore: Function,
    onInput: Function,
    onChange: Function,
    onBlur: Function,
    onBlur: Function,
  },
  data () {
    return {
      tempYwkey: null,
      // 真实value
      currentValue: this.value,
      // contextPath
      contextPath: utils.getContextPath()
    }
  },
  mounted () {
    if (this.init) {
      this.getData()
    }
  },
  methods: {
    // 获取ywkey如果传进来的是空的则重新生成
    getYwkey () {
      if (!this.ywkey) {
        if (!this.tempYwkey) {
          this.tempYwkey = Math.uuid()
          this.$emit('created-ywkey', this.tempYwkey)
          if (typeof this.createdYwkey === 'function') this.createdYwkey(this.tempYwkey)
        }
        return this.tempYwkey
      }
      return this.ywkey
    },
    // 根据ywkey获取已上传列表
    getData () {
      request.doGet(this.contextPath + this.vipAddress + "/fileupload/attachment/getSummariesByYwkey?ywkey=" + this.getYwkey())
        .then(res => {
          let data = res.data;
          if (Object.prototype.toString.call(data) === "[object Array]") {
            this.setData(data)
          }
        })
    },
    setData (data) {
      let strArr = []
      data.reverse().forEach(item => {
        strArr.push(`${item.title}.${item.btype.toLowerCase()}`)
      })
      this.currentValue = strArr.join(',')
    },
    // 点击更多
    handleMore () {
      EcpUpload({
        ...this.$props,
        ywkey: this.getYwkey(),
        onClose: (uploadData, ywkey) => {
          this.setData(uploadData)
          if (typeof this.onClose === 'function') this.onClose(uploadData, ywkey)
        }
      })
      if (typeof this.onMore === 'function') this.onMore()
      this.$emit('more')
    },
    // input事件
    handleInput () {
      if (typeof this.onInput === 'function') this.onInput(this.currentValue)
      this.$emit('input', this.currentValue)
    },
    // change 事件
    handleChange () {
      if (typeof this.onChange === 'function') this.onChange(this.currentValue)
      this.$emit('change', this.currentValue)
    },
    // blur 事件
    handleBlur (e) {
      if (typeof this.onBlur === 'function') this.onBlur(e)
      this.$emit('blur', e)
    },
    // focus 事件
    handleFocus (e) {
      if (typeof this.onBlur === 'function') this.onBlur(e)
      this.$emit('focus', e)
    }
  },
  watch: {
    ywkey () {
      if (this.init) {
        this.getData()
      }
    }
  },
}
</script>

<style>
.ecp-upload-input {
  position: relative;
}
.ecp-upload-input .el-input__icon {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ecp-upload-input .el-input {
  width: 100%;
  /* height: 100%; */
}
.ecp-upload-input .el-button {
  position: absolute;
  top: 1px;
  right: 1px;
  border: 0px;
  padding-left: 10px !important;
  padding-right: 10px !important;
  background: #fff;
}

.ecp-upload-input .el-button--mini,
.ecp-upload-input .el-button--small {
  top: 2px;
}

.app-scss .ecp-upload-input .el-button--mini,
.app-scss .ecp-upload-input .el-button--small {
  top: 1px;
  padding: 6px 20px;
  border-radius: 0;
}

.ecp-upload__cell {
  height: 100%;
}

.ecp-upload__cell .ecp-upload-input,
.ecp-upload__cell .el-input,
.el-input__inner .el-input__inner {
  height: 100%;
}

.ecp-upload-input .el-button {
  top: 0;
  padding: 0;
  height: 100%;
}
</style>