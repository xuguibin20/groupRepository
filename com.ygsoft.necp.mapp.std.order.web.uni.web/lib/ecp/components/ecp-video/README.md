# 视频播放组件

## 基本信息

- 组件名称：ecp-video
- 组件作者：古伟君
- 业务领域：天峰
- 发布时间：2021-09-18
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介

视频播放组件，支持播放在线视频、本地视频。可控制是否允许拖动；可控制播放速度，支持0.5、0.8、1.0、1.25、1.5倍速，默认是1.0；可获取视频播放进度。

## 基本用法
## 
_html_
```html
<ecp-video 
    :videoSrc="videoPath" 
	:startLimit="limit" 
	:palyBackRate="playbackRate" 
	@getPlayProgress="getPlayProgress" 
	ref="video" />
```
_js_
```javascript
// 引用组件
import ecpVideo from '@/lib/ecp/components/ecp-video/ecp-video.vue'
// ...
export default {
	// ...
	components: {
		// ...
		ecpVideo
		// ...
	},
	data() {
		return {
			//视频地址
			videoPath: "https视频地址",
			//视频播放限制
			limit: false,
			//播放速度控制
			playbackRate: 1,
		}
	},
	methods: {
		/**
		 * 播放速度控制
		 * @param {Object} e
		 */
		palyRateChange(e) {
			this.playbackRate = parseFloat(e.detail.value);
			//调用父组件方法，设置当前播放速度
			this.$refs.video.setPlayBackRate(this.playbackRate);
		},
		/**
		 * 获取当前播放进度
		 * @param {Object} playProgress 当前进度
		 */
		getPlayProgress(playProgress) {
			// ....
		}
	},
	// ...
}
// ...
```

## 属性
| 属性                 | 类型          | 默认值  | 说明                                                                                                                                                                |
| -------------------- | ------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
videoSrc               | String        | --      | 视频播放地址
startLimit             | Boolean       | false   | 视频播放开启限制（快进）
palyBackRate           | Number        | 1       | 视频播放速度

## 事件
|事件名                | 说明                | 回调参数                 
|setPlayBackRate       | 设置播放速度        | 
|videoPause            | 视频暂停播放时触发   | 触发父组件的setPlayBackRate，以获取视频播放进度


## 详细参考样例
git仓库：`git@git.ygsoft.com:ecp/tphone.git`  
分支：`dev`  
组件路径：`/tphone/lib/ecp/components/ecp-video/ecp-video.vue`
样例路径：`/tphone/src/tabBar/mainPage/ecp-video.vue`