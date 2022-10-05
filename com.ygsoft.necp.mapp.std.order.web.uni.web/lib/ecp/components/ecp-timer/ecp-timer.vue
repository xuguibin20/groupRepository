<template>
	<view>
		<view class="timer" :style="{ visibility: isShowTimer }" >{{nums}}</view>
	</view>
</template>
<script>
	/**
	 * ecp-timer 计时
	 * @description 计时组件
	 * @example <ecp-timer ></ecp-timer>
	 */
	export default {
		name: 'ecpTimer',
		props: {
			beforeMin: {
				type: Number,
				default: 0
			},
			isShowTimer: {
				type: String,
				default: 'visible'
			},
		},
		data() {
			return {
				timer: null,
				nums: '',
				afterMin: this.beforeMin
			}
		},
		created: function(e) {
			this.startData();
		},
		beforeDestroy() {
			clearInterval(this.timer)
		},
		methods: {
			timeUp() {
				this.$emit('timeup',this.afterMin);
			},
			startData() {
				let hour, minute, second;
				let that = this;
				
				/时 分 秒/
				hour = minute = second = 0; //初始化
				if(that.beforeMin > 0){
					hour = Math.floor(that.beforeMin / 60);
					minute = Math.floor(that.beforeMin % 60);
				}
				var millisecond = 0; //毫秒
				that.timer = setInterval(() => {
					millisecond = millisecond + 50;
					if (millisecond >= 1000) {
						millisecond = 0;
						second = second + 1;
						if(!that.afterMin){
							that.afterMin = 0;
						}
						that.afterMin = new Number((that.afterMin + (1/60)).toFixed(2));
					}
					if (second >= 60) {
						second = 0;
						minute = minute + 1;
						that.afterMin++;
					}
					if (minute >= 60) {
						minute = 0;
						hour = hour + 1;
					}			
					that.nums = hour + ':' + minute + ':' + second;
					that.timeUp()
				}, 50)
			}
		}
	}
</script>
<style scoped>
	.timer {

	}
</style>
