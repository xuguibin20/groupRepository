<template>
	<view class="logs">
		<button style="margin-top:10px ;" type="primary" @click="setClipboardData()">{{buttonValue}}</button>
		<view class="log" v-for="(item,index) in logs" :key="index" :style="{ 'background-color': item.type==='error' ? '#dd524d' : item.type==='warn'  ? '#f0ad4e' : '#0066CC' }">
			<view>{{item.type}}：{{item.date}}</view>
			<view>{{item.message}}</view>
		</view>
	</view>
</template>

<script>
	import logUtis from './log-utis.js'
	// #ifdef  H5
	import h5Copy from './junyi-h5-copy.js'
	// #endif
	export default {
		data() {
			return {
				buttonValue: '复制',
				logs: Array
			};
		},
		created() {
			// 获取log
			this.getlog();
			// 改写logChange回调
			logUtis.logChange = () => {
				// 每次触发，重新获取log达到更新效果
				this.getlog();
			}
		},
		methods: {
			/**
			 * 获取全部log 
			 **/
			getlog() {
				this.logs = logUtis.getLog();
			},
			/**
			 * 复制
			 **/
			setClipboardData() {

				// #ifndef H5
				// 非H5复制方法
				uni.setClipboardData({
					data: this.logs,
					success: function() {
						console.log('success');
					}
				});
				// #endif

				// #ifdef H5
				// H5复制方法
				// 复制内容，必须字符串，数字需要转换为字符串
				let content = JSON.stringify(this.logs);
				const result = h5Copy(content);
				if (result === false) {
					uni.showToast({
						title: '不支持',
					})
				} else {
					uni.showToast({
						title: '复制成功',
						icon: 'none'
					})
				}
				// #endif
			}
		},

	};
</script>

<style scoped>
	.log {
		margin: 10px;
		padding: 10px;
		color: white;
	}
</style>
