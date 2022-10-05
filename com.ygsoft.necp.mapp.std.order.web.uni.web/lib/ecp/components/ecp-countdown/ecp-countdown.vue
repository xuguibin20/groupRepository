<template>
	<view>
		<view :style="{backgroundColor: backgroundColor}" class="poc-countdown-flex">
			<view class="poc-countdown-flex-left">
				<view :style="{ color: color ,fontSize: fontSize *2 +'rpx'}">{{title}}</view>
				<view  class="poc-countdown-flex-lable" :style="{ color: color ,fontSize: fontSizeNum *2 +'rpx'}">倒计时</view>
			</view>
			<view class="poc-countdown-flex-right">
				<view :style="{ color: color ,fontSize: fontSizeNum *2 +'rpx'}">总题数：{{allNum}}</view>
				<view class="timer">
					<view class="uni-countdown">
						<text  v-if="showHouser" :style="{ color: color ,fontSize: fontSize *2 +'rpx'}" class="uni-countdown__number">{{ h }}</text>
						<text  v-if="showHouser" :style="{ color: color ,fontSize: fontSize *2 +'rpx'}" class="uni-countdown__splitor">{{ showColon ? ':' : '时' }}</text>
						<text :style="{ color: color, fontSize: fontSize*2 +'rpx'}" class="uni-countdown__number">{{ i }}</text>
						<text :style="{ color: color ,fontSize: fontSize*2 +'rpx'}" class="uni-countdown__splitor">{{ showColon ? ':' : '分' }}</text>
						<text :style="{ color: color ,fontSize: fontSize*2 +'rpx'}" class="uni-countdown__number">{{ s }}</text>
						<text v-if="!showColon" :style="{ color: color ,fontSize: fontSize*2 +'rpx' }" class="uni-countdown__splitor">秒</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	/**
	 * Countdown 考试倒计时
	 * @description 考试倒计时组件
	 * @property {String} backgroundColor 背景色
	 * @property {String} color 文字颜色
	 * @property {String} fontSizeNum 试题数文字大小
	 * @property {String} fontSize 时间和标题文字大小
	 * @property {Number} hour 小时
	 * @property {Number} minute 分钟
	 * @property {Number} second 秒
	 * @property {String} title 标题
	 * @property {Number} currentNum 当前题数
	 * @property {Number} allNum 总题数
	 * @property {Boolean} showHouser = [true|false] 是否显示时
	 * @property {Boolean} showColon = [true|false] 是否以冒号为分隔符
	 * @event {Function} timeup 倒计时时间到触发事件
	 * @example <ecp-countdown :hour="1" :minute="12" :second="40"></ecp-countdown>
	 */
	export default {
		name: 'ecpCountdown',
		props: {
			title: {
				type: String,
				default: '华夏保险合规考试'
			},
			// currentNum: {
			// 	type: Number,
			// 	default: 1
			// },
			allNum: {
				type: Number,
				default: 10
			},
			showHouser: {
				type: Boolean,
				default: true
			},
			showColon: {
				type: Boolean,
				default: true
			},
			backgroundColor: {
				type: String,
				default: '#FFFFFF'
			},
			color: {
				type: String,
				default: '#000000'
			},
			fontSize: {
				type: Number,
				default: 30
			},
			fontSizeNum: {
				type: Number,
				default: 30
			},
			hour: {
				type: Number,
				default: 0
			},
			minute: {
				type: Number,
				default: 0
			},
			second: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				timer: null,
				syncFlag: false,
				h: '00',
				i: '00',
				s: '00',
				leftTime: 0,
				seconds: 0
			}
		},
		watch: {
			hour(val) {
				this.changeFlag()
			},
			minute(val) {
				this.changeFlag()
			},
			second(val) {
				this.changeFlag()
			}
		},
		created: function(e) {
			this.startData();
		},
		beforeDestroy() {
			clearInterval(this.timer)
		},
		methods: {
			toSeconds(hours, minutes, seconds) {
				return  parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds)
			},
			timeUp() {
				clearInterval(this.timer)
				uni.showModal({
					title: '提示',
					content: '考试结束自动提交考卷',
					showCancel: false,
					success(res) {
					}
				})
				this.$emit('timeup')
			},
			countDown() {
				let seconds = this.seconds
				let [hour, minute, second] = [0, 0, 0]
				if (seconds > 0) {
					hour = Math.floor(seconds / (60 * 60)) 
					minute = Math.floor(seconds / 60)  - (hour * 60)
					second = Math.floor(seconds) - (hour * 60 * 60) - (minute * 60)
				} else {
					this.timeUp()
				}
				if (hour < 10) {
					hour = '0' + hour
				}
				if (minute < 10) {
					minute = '0' + minute
				}
				if (second < 10) {
					second = '0' + second
				}
				this.h = hour
				this.i = minute
				this.s = second
			},
			startData() {
				
				this.seconds = this.toSeconds(this.hour, this.minute, this.second)
				if (this.seconds <= 0) {
					return
				}
				this.countDown()
				this.timer = setInterval(() => {
					this.seconds--
					if (this.seconds < 0) {
						this.timeUp()
						return
					}
					this.countDown()
				}, 1000)
			},
			changeFlag() {
				if (!this.syncFlag) {
					this.seconds = this.toSeconds( this.hour, this.minute, this.second)
					this.startData();
					this.syncFlag = true;
				}
			}
		}
	}
</script>
<style scoped>
	.uni-countdown {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: flex-start;
		padding: 2rpx 0;
	}

	.uni-countdown__splitor {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: center;
		line-height: 48rpx;
		padding: 5rpx;
		/* font-size: 24rpx; */
	}

	.uni-countdown__number {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		justify-content: center;
		align-items: center;
		width: 52rpx;
		height: 48rpx;
		line-height: 48rpx;
		margin: 5rpx;
		text-align: center;
		/* font-size: 24rpx; */
	}
	.poc-countdown-flex{
		padding: 20rpx;
		line-height: 1;
		border-radius: 10rpx;
	}
	.poc-countdown-flex-right,.poc-countdown-flex-left{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.poc-countdown-flex-lable{
		 flex-shrink: 0;
	}
</style>