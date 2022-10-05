/**
 * 处理upload的相关操作
 * 是index.vue的分离逻辑层
 */
let ywkey = undefined;
const FileUtil = {
	// 获取fileList
	getFileList(ywkeyValue, getFileListUrl) {
		ywkey = ywkeyValue;
		const promise = new Promise((resolve, reject) => {
			uni.request({
				url: getFileListUrl,
				method: 'GET',
				data: {
					ywkey: ywkey
				},
				success: (successRes) => {
					const result = successRes.data || [];
					if(result instanceof Array) {
						resolve(result.reverse());
					} else {
						resolve([]);
					}
				},
				fail: (failRes) => {
					this.toast(this.toast(`获取文件列表失败，${failRes.errMsg}`));
					reject();
				}
			})
		});
		return promise;
	},
	/**
	 * upload
	 * 分手机端和H5端两种情况
	 */
	upload(param = {}) {
		if(!param.url) {
			this.toast('地址为空！');
			return;
		}
		// #ifdef H5
		return this.uploadFileInH5(param.file, this.jointFormData(param.file), param.url);
		// #endif
		// #ifdef APP-PLUS
		return this.appChooseFileInApp(param);
		// #endif

	},
	/**
	 * H5端,采用XMLHttpRequest上传
	 * file: 选择本地路径文件后返回的file类型数据
	 * url: 上传的服务器地址
	 */
	uploadFileInH5(file, formData,url) {
		if(!ywkey) {
			this.toast('请传入ywkey');
			return;
		}
		const promise = new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(event) {
				uni.showLoading({
					title: `努力上传中...`
				})
				if(event.lengthComputable){
					let percent = Math.ceil(event.loaded * 100 / event.total) + "%";
					if(percent === '100%') {
						uni.hideLoading();
					}
				}
			}, false);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4 && xhr.status === 200) {
					this.toast('上传成功');
					resolve();
				} else {
					this.toast('上传失败');
				}
			};
			xhr.open("POST", url);
			xhr.send(formData);
		})
		return promise;
	},
	/**
	 * 打开app资源管理器：
	 * @currentWebview: 当前窗口webview对象
	 * @url：上传接口地址
	 * @name：上传文件key值
	 * @header: 上传接口请求头
	 * @...：body内其他参数
	*/
	appChooseFileInApp({currentWebview,url,name = 'file',header,...formData} = {}) {
		// #ifndef APP-PLUS
		return;
		// #endif
		return new Promise((resolve, reject) => {
			// 引用h5上传插件，插件由于是h5类型，必须放在hybrid目录下
			const webUrl = '/hybrid/html/h5-uploader/h5-uploader.html';
			formaData = this.jointFormData(formaData);
			// const webUrl = 'lib/ecp/components/ecp-upload-panel/upload-panel.html';
			const webView = plus.webview.create('', webUrl, {
				'uni-app': 'none', //不加载uni-app渲染层框架，避免样式冲突
				top: 0,
				height: '100%',
				background: 'transparent'
			},{
				url,
				header,
				formData,
				key: name,
			});
			webView.loadURL(webUrl);
			currentWebview.append(webView);
			webView.overrideUrlLoading(
			{
				mode: 'reject',
			},
			e => {
				let {status, fileName, response} = this.getRequest(e.url);
				status = unescape(status);
				fileName = unescape(fileName);
				response = unescape(response);
				resolve({
					status: status,
					fileName: fileName,
					data: response
				})
			});
		});
	},
	/**
	 * 返回上传的结果
	 * {"fileName":"screenshot_20200811_102346.png","id":"{\"error\":1,\"message\":\"请选择文件。\"}"} 
	 */
	getRequest(url) {
		let theRequest = new Object(); 
		let index = url.indexOf("?");
		if (index != -1) {  
			let str = url.substring(index+1);  
			let strs = str.split("&");  
			for(let i = 0; i < strs.length; i ++) {  
				theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);  
			} 
		}
		return theRequest;  
	},
	/**
	 * 预览文件
	 * 如果是图片类型，直接调用uni.previewImage
	 * 如果是文件类型，uni.downloadFile后调用uni.openDocument
	 * uni.openDocument 支持格式：doc, xls, ppt, pdf, docx, xlsx, pptx
	 */
	previewFile(file, previewUrl) {
		if(file.isPicture) {
			uni.previewImage({
				urls: [previewUrl],
				current: 0
			})
		} else {
			// 新开页面打开文档，支持格式：doc, xls, ppt, pdf, docx, xlsx, pptx
			uni.downloadFile({
				url: previewUrl,
				success: res => {
					// 文件路径，可通过 downFile 获得
					const filePath = res.tempFilePath;
					uni.openDocument({
						filePath: filePath,
						fail: res => {
							this.toast('暂不支持打开此文件');
						}
					})
				},
				fail: res => {
					this.toast('暂不支持打开此文件');
				}
			})
		}

	},
	deleteFile(file, deleteUrl) {
		const promise = new Promise((resolve, reject) => {
			uni.request({
				url: deleteUrl,
				method: 'POST',
				success: res => {
					this.toast('删除成功');
					resolve();
				},
				fail: failRes => {
					this.toast(`删除失败${failRes.errMsg}`);
					reject();
				}
			})
		});
		return promise;
	},
	// 拼接参数到上传的formData
	jointFormData(file) {
		// 额外需要组装的传参
		const extData = {
			name: file.name,
			size: file.size,
			type: file.type,
			idkey: this.getUUID(),
			resId: this.getUUID(),
			ywkey: ywkey
		};
		// 拼接需要上传的参数
		let formData = new FormData();
		formData.append("file", file);
		for (let keys in extData) {
			formData.append(keys, extData[keys]);
		}
		return formData;
	},
	// 统一处理弹框
	toast(title = '',{ duration = 2000, icon = 'none', size = '20rpx'} = {}) {
		uni.showToast({title,duration,icon});
	},
	// 是一种由算法生成的唯一标识，通常表示成32个16进制数字（0－9，A－F）组成的字符串
	getUUID() {
		return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		)
	}
}
export default FileUtil

