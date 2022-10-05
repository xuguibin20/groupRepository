<template>
	<view class="expense-list">
		<view class="expense-list-header">{{ title }}</view>
		<view class="expense-list-body">
			<slot></slot>
		</view>
		<view class="expense-list-footer" @click="$emit('btn-click')">{{ btn }}</view>
	</view>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: '费用'
			},
			btn: {
				type: String,
				default: '增加'
			}
		}
	}
</script>

<style>
	.expense-list {
		background-color: #fff;
	}
	
	.expense-list-header {
		padding: 0 40rpx;
		background-color: #f5f5f5;
		color: #666;
		font-size: 24rpx;
		height: 80rpx;
		line-height: 80rpx;
		letter-spacing: 2rpx;
	}
	
	.expense-list-footer {
		border-top: 1px solid #E5E5E5;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 32rpx;
		color: #009deb;
		text-align: center;
		letter-spacing: 2rpx;
	}
</style>
