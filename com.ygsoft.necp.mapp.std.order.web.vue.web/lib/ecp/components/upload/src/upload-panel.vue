<template>
  <div class="ecp-upload-panel">
    <div class="ecp-upload-board">
      <div class="ecp-upload-btn left">
        <el-button icon="el-icon-arrow-left"  size="mini" circle @click="handleScroll(0)"></el-button>
      </div>
      <div class="ecp-upload-dragger">
        <el-upload
        ref="upload"
        :action="`${ contextPath + vipAddress }/fileupload/attachment/uploadSinglefile`"
        :data="uploadData"
        :disabled="disabled || disabledUpload"
        :show-file-list="false"
        :before-upload="handleBeforUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-exceed="handleExceed"
        :limit="1"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
      </el-upload>
      </div>
      <el-scrollbar wrapClass="ecp-upload-wrap" ref="scrollbar">
        <div class="ecp-upload-item" v-if="loading" v-loading="true"></div>
        <div
          class="ecp-upload-item"
          v-for="(value, key) in uploadList"
          :key="key"
          :title="`${value.title}.${value.btype.toLowerCase()}`"
        >
          <img v-if="value.btype.toLowerCase() === 'txt'" src="./img/txt.png">
          <img v-else-if="value.btype.toLowerCase() === 'ppt'" src="./img/ppt.png">
          <img v-else-if="value.btype.toLowerCase() === 'pdf'" src="./img/pdf.png">
          <img v-else-if="['xls', 'xlsx'].indexOf(value.btype.toLowerCase()) >= 0" src="./img/xls.png">
          <img v-else-if="['doc', 'docx'].indexOf(value.btype.toLowerCase()) >= 0" src="./img/doc.png">
          <img v-else-if="['jpg', 'jpeg', 'gif', 'png'].indexOf(value.btype.toLowerCase()) >= 0" :src="contextPath + vipAddress + '/fileupload/attachment/downloadFile?resId=' + value.resId" style="width:auto;height:92px;margin-top:0;">
          <img v-else src="./img/file.png">
          <span class="ecp-upload-text">
            {{`${( value.title.length > 10 ? `${value.title.slice(0, 10)}...` : value.title )}.${value.btype.toLowerCase()}`}}
            <br />
            <font v-if="(value.bsize / 1024) > 1">{{(value.bsize / 1024).toFixed(0)}}kb</font>
            <font v-else>{{(value.bsize / 1024).toFixed(2)}}kb</font>
          </span>
          <div>
            <el-button
              type="text"
              size="mini"
              icon="iconfont iconxiazai1"
              :disabled="disabled || disabledDownload"
              @click="handleDownload(value)"
            >下载</el-button>
            <el-button
              v-if="['jpg', 'jpeg', 'gif', 'png', 'pdf', 'txt'].indexOf(value.btype.toLowerCase()) >= 0"
              type="text"
              size="mini"
              icon="el-icon-view"
              :disabled="disabled"
              @click="handlePreview(value)"
            >预览</el-button>
            <el-button
              type="text"
              size="mini"
              icon="iconfont iconquanqing"
              style="color: #F56C6C"
              :disabled="disabled || disabledDelete"
              @click="handleDelete(value)"
            >删除</el-button>
          </div>
        </div>
      </el-scrollbar>
      <div class="ecp-upload-btn right">
        <el-button icon="el-icon-arrow-right" size="mini" circle @click="handleScroll(1)"></el-button>
      </div>
    </div>
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
import utils from 'ecp.utils'
import request from 'ecp.service'

export default {
  name: 'ecpUploadPanel',
  props: {
    ywkey: String, // ywkey
    title: {
      default: '上传附件',
      type: String
    }, // dialog的标题
    vipAddress: {
      default: '',
      type: String
    }, // vipAddress
    init: {
      type: Boolean,
      default: true
    },
    appendToBody: Boolean, // appendToBody
    beforeUpload: Function, // 上传前回调
    onSuccess: Function, // 成功回调
    onError: Function, // 上传失败回调
    disabled: Boolean, // 禁用全部功能
    disabledUpload: Boolean, // 禁用上传
    disabledDownload: Boolean, // 禁用下载
    disabledDelete: Boolean // 禁用删除
  },
  data () {
    return {
      loading: false,
      tempYwkey: null,
      uploadData: {}, // uploadData上传附带的data
      contextPath: utils.getContextPath(), // contextPath
      previewVisible: false, // 预览dialog
      previewUrl: null, // 预览文件链接
      uploadList: [] // 表格数据
    };
  },
  mounted () {
    // 获取数据
    if (this.init) {
      this.getData();
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
      request
        .doGet(
          this.contextPath +
          this.vipAddress +
          '/fileupload/attachment/getSummariesByYwkey?ywkey=' +
          this.getYwkey()
        )
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
      document.addEventListener('drop', e => {
        e.preventDefault()
      });
      document.addEventListener('dragover', e => {
        e.preventDefault()
      });
      if (!file.type || file.type === '') {
        this.$message({
          message: '不支持的文件类型',
          type: 'error'
        });
        return false
      }
      // 拼接上传参数
      this.uploadData.name = file.name
      this.uploadData.size = file.size
      this.uploadData.type = file.type
      this.uploadData.idkey = Math.uuid()
      this.uploadData.resId = Math.uuid()
      this.uploadData.ywkey = this.getYwkey()
      // this.loading = true;
      if (typeof this.beforeUpload === 'function') {
        return this.beforeUpload(file, this.uploadList, this.getYwkey())
      }
    },
    // 上传完成后
    handleSuccess (res, file, fileList) {
      this.loading = true;
      this.$refs.upload.clearFiles();
      // 上传成功回调
      if (res.errMsg) {
        this.loading = false;
        this.$message({
          message: '上传文件失败，请联系系统管理员',
          type: 'warning'
        });
        return
      }
      if (typeof this.onSuccess === 'function') this.onSuccess(res, file, this.uploadList, this.getYwkey())
      this.getData()
    },
    // 文件超出个数限制时的钩子
    handleExceed (file) {
      this.$message({
        message: '上传失败，只支持单文件上传',
        type: 'warning'
      })
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
    handleDelete (row, index) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request
          .doPost(
            this.contextPath +
            this.vipAddress +
            '/fileupload/attachment/deleteSummaryAndDetailByResId?resId=' +
            row.resId,
            {}
          )
          .then(res => {
            this.getData();
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
      this.loading = false;
      if (typeof this.onError === 'function') this.onError(err, file, this.getYwkey())
    },
    // change事件回调
    handleChange (file) {
      if (typeof this.onChange === 'function') this.onChange(file, this.getYwkey())
    },
    handleScroll (type) {
      let wrap = this.$refs.scrollbar.$el.childNodes[0]
      let left = wrap.scrollLeft;
      let scroll = 0
      if (type === 0) {
        if (left === 0) return
        if (left - 300 > 0) {
          scroll = left - 300
        }
      } else {
        scroll = left + 300
      }
      wrap.scrollTo({
        left: scroll,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<style scoped>
.ecp-upload-panel {
  width: 100%;
  text-align: left;
}
.ecp-upload-board {
  box-sizing: border-box;
  position: relative;
  margin-top: 10px;
  padding: 10px 50px;
  width: 100%;
  background: #fff;
  overflow: hidden;
}
.ecp-upload-btn {
  display: flex;
  display: -webkit-flex;
  float: left;
  position: absolute;
  top: 10px;
  width: 50px;
  height: 200px;
  align-items: center;
  justify-content: center;
  z-index: 999;
  background: #fff;
}
.ecp-upload-btn.left {
  left: 0;
}
.ecp-upload-btn.right {
  right: 0;
}
.ecp-upload-item {
  box-sizing: border-box;
  display: inline-block;
  margin-left: 8px;
  width: 200px;
  height: 200px;
  text-align: center;
  vertical-align: top;
  white-space: normal;
  background: #FFFFFF;
  box-shadow: 0px 5px 10px rgba(170, 180, 201, 0.16);
  overflow: hidden;
}
.ecp-upload-item > img {
  margin-top: 42px;
  width: 48px;
  height: 48px;
}
.ecp-upload-item:last-child {
  border: none;
}
.ecp-upload-item span {
  display: inline-block;
  margin-top: 32px;
  width: 200px;
  text-align: center;
  color: #333;
}
.ecp-upload-item font {
  font-size: 12px;
  color: #999;
}
</style>

<style>
.ecp-upload-wrap {
  padding-bottom: 20px;
  height: 200px;
  text-align: left;
  overflow: auto;
  white-space: nowrap;
}
.ecp-upload-wrap::-webkit-scrollbar {
  display: none;
}
.ecp-upload-btn .el-button {
  border-color: #3B9BEC !important;
  color: #3B9BEC !important;
}
.ecp-upload-dragger {
  float: left;
  height: 200px;
}
.ecp-upload-dragger>div {
  height: 0;
}
.ecp-upload-panel .el-upload-dragger {
  width: 200px;
  height: 200px;
  box-shadow: 0px 5px 10px rgba(170, 180, 201, 0.16);
  z-index: 999;
}

.ecp-upload-panel .el-upload-dragger .el-upload__text {
  font-size: 12px;
}
</style>