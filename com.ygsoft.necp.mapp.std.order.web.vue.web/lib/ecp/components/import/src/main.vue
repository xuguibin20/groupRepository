<template>
  <el-dialog
    :title="title"
    :before-close="close"
    :append-to-body="appendToBody"
    :close-on-click-modal="closeOnClickModal"
    :visible="visible"
    width="400px"
  >
    <el-form label-width="80px" width="100%">
      <el-form-item label="上传文件：">
        <el-upload
          ref="upload"
          name="importFile"
          :action="`${ contextPath + vipAddress }/import/uploadSinglefile`"
          :limit="1"
          :data="uploadData"
          :auto-upload="false"
          :show-file-list="false"
          :before-upload="handleBeforUpload"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-change="handleChange"
        >
          <div @click="handleInputClick">
            <el-input v-model="fileName" readonly>
              <el-button slot="append">浏览...</el-button>
            </el-input>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleSubmit">导入</el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from 'ecp.service'

export default {
  name: 'ecpImport',
  data () {
    return {
      visible: true,
      fileName: '',
      resId: Math.uuid(),
      ywkey: Math.uuid(),
      uploadData: {
        beanId: 'com.ygsoft.ecp.app.operator.system.service.context.IUnstructureTransferContext',
        method: 'saveFile'
      },
      title: '导入数据',
      contextPath: '',
      vipAddress: '',
      colData: '',
      appendToBody: null,
      closeOnClickModal: null,
      beforeUpload: null,
      onSuccess: null,
      onError: null,
      onChange: null,
      onClose: null
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.close)
  },
  methods: {
    // 导入
    handleSubmit () {
      if (!this.fileName) {
        this.$message({
          message: '请选择一个文件',
          type: 'warning'
        })
        return
      }
      this.$refs.upload.submit()
    },
    // 上传前事件
    handleBeforUpload (file) {
      if (!this.colData) console.error('缺少参数colData，请传入。')
      // 拼接上传参数
      this.uploadData.operParams = JSON.stringify({
        p1: {
          title: file.name,
          bsize: file.size,
          resId: this.resId,
          ywkey: this.ywkey,
          remark: '',
          modelState: 4,
          attachmentDetailVO: {}
        }
      })
      if (typeof this.beforeUpload === 'function') {
        return this.beforeUpload(file)
      }
    },
    // 上传完成后
    handleSuccess (res, file, fileList) {
      // 通过ywkey去取得表格数据
      request.doPost(this.contextPath + this.vipAddress + '/import/doImport?ywkey=' + this.ywkey, {}).then(importRes => {
        if (importRes.data.errCode) {
          this.$message({
            message: '上传文件失败，请重试。',
            type: 'warning'
          })
        } else {
          let data = importRes.data[0].sheetResults || ''
          if (data) {
            let resData = [] // 返回值
            let dataKeys = Object.keys(data) // 循环行，因为数据奇葩，返回的是object，不是数组，只能通过这种形式循环
            dataKeys.forEach(key => {
              let sheetData = data[key].validData // sheet的数据
              let sheetName = data[key].sheetName // sheet的名称
              let resSheetData = { // 缓存返回的数据
                sheetName,
                sheetData: []
              }
              let colIndex = null // 传入的colData内该sheet的位置
              // 计算该sheet的colData在传入的colData的位置
              this.colData.forEach((col, colKey) => {
                if (col.sheetName === sheetName) colIndex = colKey
              })

              let sheetDataKeys = Object.keys(sheetData) // 循环行，因为数据奇葩，返回的是object，不是数组，只能通过这种形式循环
              sheetDataKeys.forEach((item) => {
                // 循环列，同上
                let colKeys = Object.keys(sheetData[item]['valueMap'])
                // 循环行除了第一行，第一行为列名
                if (item !== '0') {
                  resSheetData['sheetData'][Number(item) - 1] = {}
                  colKeys.forEach((val, index) => {
                    let colName = sheetData['0']['valueMap'][val] // 列名
                    let colVal = sheetData[item]['valueMap'][val] // 列内容
                    if (colName) resSheetData['sheetData'][Number(item) - 1][this.colData[colIndex]['colName'][index]] = colVal
                  })
                }
              })
              resData.push(resSheetData) // 添加数据
            })
            if (typeof this.onSuccess === 'function') this.onSuccess(resData, file)
            this.delFileCache()
          }
        }
      })
    },
    // 删除缓存文件
    delFileCache () {
      request.doPost(this.contextPath + this.vipAddress + '/import/deleteSummaryAndDetailByResId?resId=' + this.resId, {})
      this.visible = false
    },
    // 上传失败回调函数
    handleError (err, file) {
      if (typeof this.onError === 'function') this.onError(err, file)
    },
    // change事件回调
    handleChange (file) {
      this.fileName = file.name
      if (typeof this.onChange === 'function') this.onChange(file)
    },
    // input点击后清除已选文件
    handleInputClick () {
      this.fileName = ''
      this.$refs.upload.clearFiles()
    },
    close () {
      this.visible = false
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        if (typeof this.onClose === 'function') this.onClose()
        this.$emit('on-close')
      }
    }
  },
}
</script>
