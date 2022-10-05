<template>
	<video id="ecpVideo" ref="ecpVideo" @timeupdate="timeUpdate" @error="videoErrorCallback" :src="videoSrc"
		@pause="videoPause" initial-time="initial_time" class="video-body"></video>
</template>

<script>
	export default {
		props: {
			//视频播放地址
			videoSrc: {
				type: String,
				default: ''
			},
			//视频播放开启限制（快进）
			startLimit: {
				type: Boolean,
				default: false
			},
			//播放速度
			palyBackRate: {
				type: Number,
				default: 1
			}
		},
		mounted() {
			//设置播放速度
			this.videoContext.playbackRate(this.palyBackRate);
		},
		data() {
			return {
				//指定视频播放位置
				initial_time: '',
				//视频当前播放位置
				video_real_time: 0,
				//视频实例
				videoContext: '',
				//播放总时长
				duration: 0,
				//播放进度
				playProgress: 0
			}
		},
		methods: {
			/**
			 * 视频播放出错时触发
			 * @param {Object} e 视频实例
			 */
			videoErrorCallback(e) {
				console.log('video error.....', e);
			},
			/**
			 * 视频暂停播放时触发
			 * @param {Object} e
			 */
			videoPause(e) {
				var durationNum = parseInt(this.duration);
				this.playProgress = durationNum <= 0 ? "0%" : (Math.round(this.video_real_time / durationNum * 10000) /
					100.00) + "%";
				// 触发父组件方法，让外部知道当前播放进度
				this.$emit('getPlayProgress', this.playProgress);
			},
			/**
			 * 播放进度变化时触发,触发频率 250ms 一次
			 * @param {Object} e 视频实例
			 */
			timeUpdate(e) {
				//跳转到指定播放位置 initial-time 时间为秒
				let that = this;
				//播放的总时长
				this.duration = e.detail.duration;
				//实时播放进度 秒数
				var currentTime = parseInt(e.detail.currentTime);

				var jump_time = 0;
				//当前视频进度
				// console.log("视频播放到第" + currentTime + "秒")//查看正在播放时间，以秒为单位
				if (that.video_real_time == 0) {
					jump_time = parseInt(that.initial_time) + parseInt(that.video_real_time);
				} else {
					jump_time = parseInt(that.video_real_time);
				}
				if (isNaN(jump_time)) {
					jump_time = 0;
				}
				// 开启限制
				if (this.startLimit) {
					if (currentTime > jump_time && currentTime - jump_time > 1) {
						// let videoContext = wx.createVideoContext('myVideo');
						this.videoContext.seek(that.video_real_time);
					}
				}
				//实时播放进度
				that.video_real_time = currentTime;
			},
			/**
			 * 动态设置播放速度
			 * @param {Object} rate 速度
			 */
			setPlayBackRate(rate) {
				this.videoContext.playbackRate(rate);
			}
		},
		//页面生成后生命函数
		created() {
			//初始化视频实例
			this.videoContext = uni.createVideoContext('ecpVideo', this);
		}
	}
</script>

<style>
	.video-body {
		width: 100%;
	}
</style>
