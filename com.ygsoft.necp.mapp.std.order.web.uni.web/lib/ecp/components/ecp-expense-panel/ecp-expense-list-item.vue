<template>
	<view class="ecp-expense-list-item">
		<view class="ecp-expense-list-item__star">{{ star ? '*' : '' }}</view>
		<view class="ecp-expense-list-item__content">{{ title }}</view>
		<view class="ecp-expense-list-item__footer">
			<slot></slot>
		</view>
		<view class="ecp-expense-list-item__arrow">
			<uni-icons type="arrowright" :size="iconSize" color="#ccc" v-if="arrow"></uni-icons>
		</view>
	</view>
</template>

<script>
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	export default {
		components: {
			uniIcons
		},
		props: {
			star: Boolean,
			title: String,
			arrow: Boolean,
			size: {
				type: [String, Number],
				default: 16
			}
		},
		data() {
			return {
				iconSize: 16
			};
		},
		created() {
			this.iconSize = uni.getSystemInfoSync().safeArea.width / 375 * this.size
		}
	}
</script>

<style>
.ecp-expense-list-item {
	position: relative;
	padding-right: 40rpx;
	margin-left: 40rpx;
	display: flex;
	align-items: center;
	height: 90rpx;
}

.ecp-expense-list-item + .ecp-expense-list-item {
	border-top: 1px solid #E5E5E5;
}


.ecp-expense-list-item__star {
	color: #FB571E;
	font-size: 32rpx;
	width: 14rpx;
	margin-right: 10rpx;
	flex: none;
}

.ecp-expense-list-item__content {
	margin-right: 20rpx;
	font-size: 32rpx;
	color: #525252;
	flex: none;
}

.ecp-expense-list-item__arrow {
	margin-left: 16rpx;
	flex: none;
	width: 32rpx;
}

.ecp-expense-list-item__footer {
	flex: auto;
	font-size: 32rpx;
	color: #999;
	overflow: hidden;
}
</style>
