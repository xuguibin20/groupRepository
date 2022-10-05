<template>
	<view class="page-container lrwzsj1fb2-0" candrop="ecp-rect" catchtouchmove="false">
		<view class="verticalTop col-12 lrwzsj1fb2-1" candrop="ecp-col">
			<view ref="sdk_uni_segmentedControl_cwaj" style="width: 100%;">
				<view class="fixTab">
						<view id="todoTaskTab" @click="onTabChange" :class="[isTodoTask ? 'taskTab taskTab_default' : 'taskTab']">我的待办
						<view  class = 'tab_badge' v-if='total> 0'>	<uni-badge id='todoTaskCountTab' :text="total" type="error" style="margin-left:10px"></uni-badge></view>
						</view>

					<view id="doneTaskTab" @click="onTabChange" :class="[isTodoTask ? 'taskTab' : 'taskTab taskTab_default']">我的已办</view>
				</view>

				<view>
					<view candrop="ecp-rect" class="mainContainer childernCls lrwzsj1fb2-2">
						<todo-task v-if='isTodoTask' ref="todoTask" @getTotalCount='getTodoTaskTotal' :extVariables='extVariables'></todo-task>
						<done-task v-if='!isTodoTask' ref="doneTask" :extVariables='extVariables'></done-task>
						</view>
					<view candrop="ecp-rect" class="mainContainer childernCls lrwzsj1fb2-39"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import Index from './js/index.js';
export default Index;
</script>

<style scoped>
	uni-page-body {
		overflow: hidden;
	}
.taskTab {
	width: 50%;
	display: inline-block;
	text-align: center;
	height: 40px;
	line-height: 40px;
	color: #888888;
	font-size: 16px;
}

.taskTab_default {
	color: #108ee9;
	border-bottom: 2px solid #108ee9;
}
.taskTab_unselect {
	border-bottom: none;
}
.lrwzsj1fb2-2 {
	min-height: 0px;
	overflow: visible;
	position: relative;
	padding: 10px 0px 0px;
	margin: 0px;
	border-width: 0px;
	height: 600px;
	background-color: rgb(239, 239, 244);
	border-color: rgb(0, 0, 0);
	margin-top: 44px;
}

.lrwzsj1fb2-3 {
	border-width: 0px;
	min-height: 34px;
	margin: 0px;
	height: 43px;
	padding-left: 5px;
}
.fixTab {
	width: 100%;
	height: 40px;
	position: fixed;
	z-index: 1999;
	background-color: #ffffff;
}
#todoTaskTab  .tab_badge {
	display: inline-block;
} 
</style>
