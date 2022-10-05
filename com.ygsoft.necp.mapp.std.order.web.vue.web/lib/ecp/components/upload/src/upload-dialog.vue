<template>
  <el-dialog
    :title="title"
    :before-close="close"
    :append-to-body="appendToBody"
    :visible="visible"
    :width="width"
  >
    <upload-panel ref="uploadPanel" v-bind="$props" v-if="uploadType === 'panel'"></upload-panel>
    <upload-table ref="uploadTable" v-bind="$props" v-else></upload-table>
    <div slot="footer">
      <el-button @click="close">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from 'ecp.service'
import UploadTable from './upload-table'
import UploadPanel from './upload-panel'

export default {
  name: 'EcpUpload',
  components: { UploadPanel, UploadTable },
  props: {
    // 上传的类型
    uploadType: {
      type: String,
      default: 'panel'
    },
    // dialog的标题
    title: {
      type: String,
      default: '上传附件'
    },
    // 宽度
    width: {
      type: String,
      default: '1000px'
    },
    // 关闭事件
    onClose: Function,
    // 是否插入根节点
    appendToBody: Boolean,
    ...UploadPanel.props
  },
  data () {
    return {
      // 显示控制
      visible: true,
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.close)
  },
  methods: {
    close () {
      this.visible = false
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        // 关闭回调，根据类型回传数据
        if (typeof this.onClose === 'function'){
          let uploader
          if (this.uploadType === 'panel') {
            uploader = this.$refs.uploadPanel
          } else {
            uploader = this.$refs.uploadTable
          }
          this.onClose(uploader.$data.uploadList)
        }
        this.$emit('on-close')
      }
    }
  },
}
</script>
