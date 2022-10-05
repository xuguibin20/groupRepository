<template>
	<view v-if="popClosing">
		<!--h5自定义header start -->
		<!-- #ifdef H5 -->
		<!-- #endif -->
		<!-- 自定义header end -->

		<!-- 弹出框内容 start -->
		<view class="upload-panel">
			<view class="upload-title">附件上传</view>
			<view class="file-list">
				<!-- 上传区域start -->
				<view class="file-box" :style="squareStyle">
					<view class="file-wrap" @click="clickPlusIcon" ref="input">
						<uni-icons type="plus" :size="btnPlusSize" color="#999"></uni-icons>
						<!-- #ifdef H5 -->
<!-- 						<view class="h5-input" ref="input"></view> -->
						<!-- #endif -->
					</view>
				</view>
				<!-- 上传区域end -->
				<!-- 已上传的文件列表start -->
				<view v-for="(file,index) in uploadList" :key="index" class="file-box" :style="squareStyle">
					<view class="file-wrap" v-if="index < count">
						<div class="file-wrap-img" @click="doPreviewFile(file)">
							<image :src="`${downloadFile}?resId=${file.resId}`" v-if="file.isPicture" />
							<image src="../../../../static/doc.png" :style="fileLogoStyle" v-else>
						</div>
						<view class="btn-delete" :style="btnDeleteStyle" @click="doDeleteFile(file)">
							<uni-icons type="closeempty" :size="btnDeleSize" color="white"></uni-icons>
						</view>
						<div class="file-info">
							<view class="file-info-name">
								<view class="file-info-name-text" :style="fontStyle">{{file.title}}</view>
								<view :style="[{flex: 'none'}, fontStyle]">.{{file.btypeLower}}</view>
							</view>
							<view class="file-info-size" :style="fontStyle">{{file.kbSize}}kb</view>
						</div>
					</view>
				</view>
				<!-- 已上传的文件列表end -->
			</view>
		</view>

		<!-- 弹出框内容 end -->
	</view>
</template>

<script>
	import FileUtil from './index.js'
	export default {
		props: {
			// 是否显示弹出框
			popping: {
				type: Boolean,
				default: false
			},
			// 上传服务的接口
			uploadUrl: {
				type: String,
				default: 'http://10.52.12.22:8090/uapdemoweb/ecp/mapp/demo/fileupload/attachment/uploadSinglefile'
			},
			// 获取已上传的文件的接口
			getFileListUrl: {
				type: String,
				default: 'http://10.52.12.22:8090/uapdemoweb/ecp/mapp/demo/fileupload/attachment/getSummariesByYwkey'
			},
			// 文件的下载接口,后面跟上对应的文件id
			downloadFile: {
				type: String,
				default: 'http://10.52.12.22:8090/uapdemoweb/ecp/mapp/demo/fileupload/attachment/downloadFile'
			},
			// 文件的删除接口,后面跟上对应的文件id
			deleteUrl: {
				type: String,
				default: 'http://10.52.12.22:8090/uapdemoweb/ecp/mapp/demo/fileupload/attachment/deleteSummaryAndDetailByResId'
			},
			// 上传的参数ywkey
			ywkey: {
				type: String,
				default: 'cfcc9e58e9f8f6c580292c84a6444'
			},
			// 每列展示的文件数
			column: {
				type: Number,
				default: 3
			},
			// 最多可展示的图片数
			count: {
				type: Number,
				default: 12
			}
		},
		data() {
			return {
				fileList: [],
				popClosing: this.popping
			}
		},
		watch: {
			popping(newVal) {
				this.popClosing = newVal;
				if(newVal) {
					this.getfileList();
				}	
			}
		},
		methods: {
			getfileList() {
				FileUtil.getFileList(this.ywkey, this.getFileListUrl).then(res => {
					this.fileList = res;
				})
			},
			// 点击加号按钮
			clickPlusIcon() {
				if (this.remainCount <= 0) {
					FileUtil.toast(`上传文件数量不能超过${this.count}个`);
					return;
				}
				// #ifdef H5
				this.creatH5UploadBtn();
				return;
				// #endif
				// #ifndef APP-PLUS
				this.doUploadInApp();
				// #endif
			},
			/**
			 * 利用js创建一个<input type="file"/>,用于上传图片的点击按钮
			 * uni-app不支持直接<input type="file"/>，采取覆盖的方式
			 */
			creatH5UploadBtn() {
				let input = document.getElementById("upload-input");
				if(input) {
					input = document.getElementById("upload-input")
				} else {
					input = document.createElement('input')
					input.setAttribute('id', 'upload-input');
				}
				input.type = 'file';
				input.onchange = (event) => {
					this.doUploadInH5(event.target.files[0]);
				};
				input.style.opacity = 0;
				input.style.height = 0;
				if (this.$refs.input) {
					this.$refs.input.$el.appendChild(input);
					input.click();
				}
			},
			// 在H5环境下上传文件
			doUploadInH5(file) {
				// #ifndef H5
				return;
				// #endif
				if (this.remainCount <= 0) {
					return;
				}
				FileUtil.upload({
					url: this.uploadUrl,
					file: file
				}).then(successRes => {
					this.getfileList();
					// #ifdef H5
					// 解决input上传文件时，第二次上传同名文件不触发change事件
					if (this.$refs.input) {
						this.$refs.input.$el.firstChild.value = '';
					}
					// #endif
				});
			},
			// 在App环境下上传文件
			doUploadInApp() {
				FileUtil.upload({
					// #ifdef APP-PLUS
					// 获取当前webview的对象实例
					currentWebview: this.$mp.page.$getAppWebview(),
					// #endif
					//调试时ios有跨域，需要后端开启跨域并且接口地址不要使用http://localhost/
					url: this.uploadUrl
					//...其他参数
				}).then(res => {
					this.getfileList();
				});
			},
			// 预览文件
			doPreviewFile(file) {
				FileUtil.previewFile(file, `${this.downloadFile}?resId=${file.resId}`);
			},
			// 删除文件
			doDeleteFile(file) {
				uni.showModal({
					title: '提示',
					content: '此操作将永久删除该文件, 是否继续?',
					success: res => {
						if (res.confirm) {
							FileUtil.deleteFile(file, `${this.deleteUrl}?resId=${file.resId}`).then(res => {
								const deleteIndex = this.fileList.findIndex(item => item.resId === file.resId);
								this.fileList.splice(deleteIndex, 1);
							});
						}
					}
				})
			},
			// 关闭模态框
			closeDialog() {
				this.popClosing = false;
				this.$emit('closeDialog')
			}
		},
		computed: {
			// 宽高相等的Style
			squareStyle() {
				return {
					'width': `${1 / this.column * 90}vw`,
					'height': `${1 / this.column * 90}vw`
				}
			},
			// 加号图标的大小
			btnPlusSize() {
				return (1.8 / this.column * 100);
			},
			// 图片和文件logo的大小
			fileLogoStyle() {
				return {
					'width': `${(1.8 / this.column * 100)}px`,
					'height': `${(1.8 / this.column * 100)}px`
				}
			},
			// 字体图标大小
			fontStyle() {
				return {
					'font-size': `${ 18 * 2 / this.column }rpx`,
				}
			},
			// 删除按钮图标的大小
			btnDeleSize() {
				return (0.6 / this.column * 100);
			},
			// 删除按钮外面红色背景层的样式
			/**
			 * 根据删除按钮图标的大小微调大一点
			 * border-radius为宽度的一半
			 */
			btnDeleteStyle() {
				return {
					'width': `${0.8 / this.column * 100}px`,
					'height': `${0.8 / this.column * 100}px`,
					'border-radius': `${0.4 / this.column * 100}px`
				}
			},
			// 还剩多少张的容量可以上传
			remainCount() {
				return this.count - this.fileList.length;
			},
			// 对fileList做一些属性修改和组装
			uploadList() {
				return this.fileList.map((file, index) => {
					return {
						...file,
						btypeLower: file.btype.toLowerCase(),
						isPicture: ['jpg', 'jepg', 'gif', 'png'].indexOf(file.btype.toLowerCase()) !== -1,
						// 如果大于1kb保留整数，否则保留两位
						kbSize: (file.bsize / 1024).toFixed(file.bsize / 1024 > 1 ? 0 : 2)
					}
				})
			}
		}
	}
</script>

<style scoped>
	// dialog的class
	.dialog {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fff;
		z-index: 100;
	}

	.dialog-header {
		width: 100%;
		height: 44px;
		background-color: #007AFF;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.back-row {
		position: absolute;
		left: 18px;
		top: 17px;
		content: "";
		display: inline-block;
		height: 10px;
		width: 10px;
		border-width: 0 0 2px 2px;
		border-color: #fff;
		border-style: solid;
		transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
		-webkit-transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
	}

	.dialog-title {
		font-size: 16px;
		color: #fff;
	}

	.upload-title {
		margin: 5vw;
		word-wrap: break-word;
	}

	.file-list {
		display: flex;
		flex-wrap: wrap;
		padding: 0 5vw;
	}

	// 最外层平分宽度的class
	.file-box {
		box-sizing: border-box;
		padding: 5rpx;
	}

	.file-wrap {
		position: relative;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		border: 1px solid #C8C7CC;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: none;
		overflow: hidden;
	}

	.file-wrap-img {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-end;
	}

	.file-wrap-img>image {
		cursor: pointer;
		width: 100%;
		height: 100%;
	}

	.file-info {
		width: 100%;
		display: flex;
		flex-direction: column;
		flex: none;
	}

	.file-info-name {
		display: flex;
		justify-content: center;
		color: #333333;
		margin-bottom: -10rpx;
		width: 100%;
	}

	.file-info-name-text {
		/* 		flex: auto; */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-info-size {
		display: flex;
		justify-content: center;
		color: #999999;
	}

	.btn-delete {
		position: absolute;
		right: 10rpx;
		top: 8rpx;
		background-color: #DD524D;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.h5-input {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border: 1px solid red;
	}
</style>
