<template>
  <div class="ecp-upload-table">
    <el-upload
      ref="upload"
      :action="`${ contextPath + vipAddress }/fileupload/attachment/uploadSinglefile`"
      :limit="1"
      :data="uploadData"
      :disabled="disabled || disabledUpload"
      :show-file-list="false"
      :before-upload="handleBeforUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
    >
      <el-button type="primary">上传</el-button>
    </el-upload>
    <el-table border :height="300" :data="uploadList" style="margin-top: 10px;">
      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="文件名"></el-table-column>
      <el-table-column prop="btype" label="文件类型"></el-table-column>
      <el-table-column prop="bsize" label="文件大小(kb)">
        <template slot-scope="scope">
          <font v-if="(scope.row.bsize / 1024) > 1">{{(scope.row.bsize / 1024).toFixed(0)}}</font>
          <font v-else>{{(scope.row.bsize / 1024).toFixed(2)}}</font>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left">
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-download"
            :disabled="disabled || disabledDownload"
            @click="handleDownload(scope.row)"
          >下载</el-button>
          <el-button
            v-if="['jpg', 'jpeg', 'gif', 'png', 'pdf', 'txt'].indexOf(scope.row.btype.toLowerCase()) >= 0"
            type="text"
            size="mini"
            icon="el-icon-view"
            :disabled="disabled"
            @click="handlePreview(scope.row)"
          >预览</el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            :disabled="disabled || disabledDelete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="预览" :visible.sync="previewVisible" top="50px" width="1000px" append-to-body>
      <el-input
        type="textarea"
        :rows="10"
        v-if="previewUrl && previewType == 'txt'"
        v-model="previewUrl"
        readonly
      ></el-input>
      <iframe
        v-if="previewUrl && previewType == 'pdf'"
        :src="`static/plugins/pdfjs/web/viewer.html?file=${previewUrl}`"
        frameborder="0"
        style="width: 100%;height: 500px;"
      ></iframe>
      <img
        v-if="previewUrl && ['jpg', 'jpeg', 'gif', 'png'].indexOf(previewType) >= 0"
        :src="previewUrl"
        style="width: 100%;"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="previewVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import 'ecp.ext'
import utils from 'ecp.utils'
import request from 'ecp.service'

export default {
  name: 'EcpUploadTable',
  props: {
    ywkey: String, // ywkey
    vipAddress: '', // vipAddress
    beforeUpload: Function, // 上传前回调
    onSuccess: Function, // 成功回调
    onError: Function, // 上传失败回调
    onClose: Function, // 关闭后回调
    onDelete: Function, // 删除回调
    disabled: Boolean, // 禁用全部功能
    disabledUpload: Boolean, // 禁用上传
    disabledDownload: Boolean, // 禁用下载
    disabledDelete: Boolean // 禁用删除
  },
  data () {
    return {
      uploadData: {}, // uploadData上传附带的data
      uploadList: [], // 表格数据
      contextPath: utils.getContextPath(), // contextPath
      previewVisible: false, // 预览dialog
      previewUrl: null // 预览文件链接
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取ywkey如果传进来的是空的则重新生成
    getYwkey () {
      if (!this.ywkey) {
        if (!this.tempYwkey) {
          this.tempYwkey = Math.uuid()
          this.$emit('created-ywkey', this.tempYwkey)
          if (typeof this.onCreatedYwkey === 'function') this.onCreatedYwkey(this.tempYwkey)
        }
        return this.tempYwkey
      }
      return this.ywkey
    },
    // 根据ywkey获取已上传列表
    getData () {
      request.doGet(this.contextPath + this.vipAddress + '/fileupload/attachment/getSummariesByYwkey?ywkey=' + this.getYwkey())
        .then(res => {
          let data = res.data;
          if (Object.prototype.toString.call(data) === '[object Array]') {
            this.uploadList = data.reverse()
            this.loading = false
          }
        })
    },
    // 上传前事件
    handleBeforUpload (file) {
      // 拼接上传参数
      this.uploadData.name = file.name
      this.uploadData.size = file.size
      this.uploadData.type = file.type
      this.uploadData.idkey = Math.uuid()
      this.uploadData.resId = Math.uuid()
      this.uploadData.ywkey = this.getYwkey()
      if (typeof this.beforeUpload === 'function') {
        return this.beforeUpload(file, this.uploadList, this.getYwkey())
      }
    },
    // 上传完成后
    handleSuccess (res, file, fileList) {
      this.$refs.upload.clearFiles()
      if (typeof this.onSuccess === 'function') this.onSuccess(res, file, this.uploadList, this.getYwkey())
      // 上传成功回调
      this.getData()
    },
    handleDownload (row) {
      request.doGet(this.contextPath + this.vipAddress + '/fileupload/attachment/downloadFile?resId=' + row.resId, {}, 'blob').then(exportRes => {
        // 创建下载
        let url = window.URL.createObjectURL(new Blob([exportRes.data]))
        let dom = document.createElement('a')
        dom.style.display = 'none'
        dom.href = url
        dom.setAttribute('download', row.title + '.' + row.btype.toLowerCase())
        dom = document.body.appendChild(dom)
        dom.click()
        document.body.removeChild(dom)
      })
    },
    // 预览
    handlePreview (row) {
      let resType = row.btype === 'TXT' ? 'text' : 'blob'
      request.doGet(this.contextPath + this.vipAddress + '/fileupload/attachment/downloadFile?resId=' + row.resId, {}, resType).then(exportRes => {
        // 创建预览
        if (row.btype === 'TXT') {
          this.previewUrl = exportRes.data
        } else {
          this.previewUrl = window.URL.createObjectURL(new Blob([exportRes.data]))
        }
        this.previewType = row.btype.toLowerCase()
        this.previewVisible = true
      })
    },
    // 删除缓存文件
    handleDelete (row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.doPost(this.contextPath + this.vipAddress + '/fileupload/attachment/deleteSummaryAndDetailByResId?resId=' + row.resId, {}).then(res => {
          this.getData()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          if (typeof this.onDelete === 'function') this.onDelete(row, index, this.getYwkey())
        })
      })

    },
    // 上传失败回调函数
    handleError (err, file) {
      if (typeof this.onError === 'function') this.onError(err, file, this.getYwkey())
    },
    // change事件回调
    handleChange (file) {
      if (typeof this.onChange === 'function') this.onChange(file, this.getYwkey())
    }
  }
}
</script>
