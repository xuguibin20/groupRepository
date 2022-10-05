# 带图片展示面板的弹出式附件上传组件

## 基本信息

- 组件名称：ecp-upload-panel
- 组件作者：韩志敏
- 业务领域：ECP
- 发布时间：2020-08-13
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介

支持图片，excel，pdf等非图片文件的上传

## 使用


安装插件
需要将hybrid/html/h5-uploader插件文件夹复制到使用者项目的hybrid/html下，否则插件将不会起作用

引入组件
```javascript
import EcpUploadPanel from '@/lib/ecp/components/ecp-upload-panel/index.vue'
// ...
export default {
	// ...
	components: {
		// ...
		EcpUploadPanel
		// ...
	},
	data() {
		return {
			/**
			 * @popupShowing 是否弹出了上传的组件
			 * 在点击弹出上传组件之后，将popupShowing设置为true
			 * 利用onBackPress()钩子函数，点击返回的时候关闭弹出的模态框，并将popupShowing设置为false
			 */
			popupShowing: false
			// ...
		}
	},
	methods: {
		toUpload() {
			this.popupShowing = true;
		},
		doCloseDialog() { // 关闭的回调事件
			this.popupShowing = false;
		}
		/**
		 * 自定义返回按钮事件
		 * return true 表示不启用默认的返回事件
		 * return false 表示启用默认的返回事件
		 */
		onBackPress(e) { // 将返回按钮改成关闭模态窗
			if(this.popupShowing) {
				this.popupShowing = false;
				return true;
			}
			return false;
		}
	}
	
	// ...
}
// ...
```

编写页面
```html
<ecp-upload-panel :popping="popupShowing" @closeDialog="doCloseDialog">
</ecp-upload-panel>
```

**具体参考src/tabBar/mainPage/ecp-upload-panel.vue的使用案例**

git仓库：`git@git.ygsoft.com:ecp/tphone.git`
分支：`dev`
路径：`/doc/src/tabBar/mainPage/ecp-upload-panel.vue`

## 使用注意点
1.由于ios端读取手机文件夹的限制性，所以需要导入hybrid/html/h5-uploader插件
  
2.采用弹出式上传页面，需要设置上级view高度100vh

## 组件详情

#### 传入`ecp-tabbar`组件的参数
具体参考：`@/lib/ecp/components/ecp-upload-panel/index.vue`里的`props`注释部分
