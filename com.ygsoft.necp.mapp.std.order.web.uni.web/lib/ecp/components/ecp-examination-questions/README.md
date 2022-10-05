# 试题组件

## 基本信息

- 组件名称：ecp-examination-questions
- 组件作者：张李雄
- 业务领域：天蜂
- 发布时间：2021-9-18
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介
## 
移动端考试试题组件

## 使用

引入组件
```javascript
import EcpExaminationQuestions from '@/lib/ecp/components/ecp-examination-questions/ecp-examination-questions.vue'

// ...
export default {
	// ...
	components: {
		// ...
		EcpExaminationQuestions,
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<template>
	<view>
		<ecp-examination-questions 
			:list="questionList"
			v-model="currentIndex"
			@back="backHandel"
			@submit="submitHandel">
		</ecp-examination-questions>
	</view>
</template>
```

## 属性
属性 | 值类型 | 默认值 | 可选值 | 说明
:-: | :-: | :-: | :-: | :-:
list | Array | [] | -- | 试题数组
config | Object | -- | -- | 元数据对象设置
v-model | Number/String | -- | -- | 当前题目下标值

### config元数据模型
属性 | 值类型 | 默认值 | 可选值 | 说明
:-: | :-: | :-: | :-: | :-:
title  | String | -- | -- | 题目
type | Number | -- | 1:单选、2:多选、3:判断 | 题目类型
option | Array | -- | -- | 题目选项数组

### option对象元数据模型
属性 | 值类型 | 默认值 | 可选值 | 说明
:-: | :-: | :-: | :-: | :-:
optionName  | String | -- | -- | 选项
optionChecked | Boolean | -- | -- | 是否已选

## 事件
事件名 | 说明 | 回调参数 |
:-: | :-: | :-: | :-: | :-:
back | 返回事件，退出考试 |   -- 
submit | 交卷事件，返回选择答案后的list数组 |  listNew 


## 详细参考样例
git仓库：`git@git.ygsoft.com:ecp/tphone.git`  
分支：`dev`  
路径：`/doc/src/tabBar/mainPage/ecp-examination-questions`