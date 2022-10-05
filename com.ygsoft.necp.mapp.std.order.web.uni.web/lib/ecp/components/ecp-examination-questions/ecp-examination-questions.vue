<template>
	<view class="ecp-examination-questions">
		<!-- 试题列表 -->
		<view v-for="(item, index) in listNew" :key="index">
			<view class="ecp-examination-questions_item" v-if="index === currentIndex">
				<view class="ecp-examination-questions_type">{{questionType[item.type]}}</view>
				<view class="ecp-examination-questions_con">
					<!-- 题目 -->
					<view class="ecp-examination-questions_con_title">
						第{{index + 1}}题: {{item.title}}
					</view>
					
					<!-- 单选、多选、判断 -->
					<template v-if="item.type < 4">
						<view 
							class="ecp-examination-questions_con_option"
							v-for="(option, index2) in item.option"
							:key="index2"
							@click="selectAnswer(index2)">
							<radio class="ecp-examination-questions_con--radio" :checked="option.optionChecked" />
							<text>{{serileNumber[index2]}}. {{option.optionName}}</text>
						</view>
					</template>
					
				</view>
			</view>
		</view>
		
		<!-- 操作栏 -->
		<view class="ecp-examination-questions_toolbar">
			<template>
				<!-- <button v-if="currentIndex ===0" @click="provHandle" class="ecp-examination-questions_toolbar--btn" type="default" size="mini">返回</button> -->
				<button v-if="currentIndex > 0" @click="provHandle" class="ecp-examination-questions_toolbar--btn" type="primary" size="mini">上一题</button>
			</template>
			<template>
				<button v-if="currentIndex < listNew.length-1" @click="nextHandle" class="ecp-examination-questions_toolbar--btn" type="primary" size="mini">下一题</button>
				<button v-else @click="nextHandle" class="ecp-examination-questions_toolbar--btn" type="primary" size="mini">提交</button>
			</template>
		</view>
	</view>
</template>

<script>
	// 题目类型
	const TYPE = ['单选题', '多选题', '判断题'];
	// 题目选项序号
	const SERILE_NUMBER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
	
	export default {
		name: 'EcpExaminationQuestions',
		props: {
			// 试题列表
			list: {
				type: Array,
				default: []
			},
			//元数据对象设置
			config: {
				type: Object,
				default: function() {
					return {
						title: 'title',
						type: 'type',
						option: 'option',
						optionName: 'optionName',
						optionChecked: 'optionChecked'
					}
				}
			},
			// 当前试题
			value: {
				type: [Number, String],
				default: 0
			},
		},
		data() {
		    return {
				listNew: [],
				currentIndex: this.value, //当前试题
				questionType: TYPE, // 题目类型
				serileNumber: SERILE_NUMBER, //题目选项序号
		    };
		},
		created() {
			this.init();
		},
		methods: {
			// 初始化数据
			init() {
				let listNew = [];
				const config = this.config;
				
				this.list.forEach(item => {
					let optionList = [];
					item[config.option].forEach(option => {
						optionList.push({
							optionName: option[config.optionName],
							optionChecked: option[config.optionChecked]
						})
					})
					listNew.push({
						title: item[config.title],
						type: item[config.type],
						option: optionList
					})
				})
				this.listNew = listNew;
			},
			/**
			 * 选择答案
			 * @param {Number} index option选项下标
			 * */
			selectAnswer(index) {
				const item = this.listNew[this.currentIndex];
				const option = item.option;
				const type = item.type;
				
				// 单选或判断题
				if (type === 0 || type === 2) {
					option.forEach(item => {
						item.optionChecked = false
					})
					option[index].optionChecked = true;
					if (this.currentIndex !== this.listNew.length -1) this.nextHandle();
				} else if (type === 1) {
					option[index].optionChecked = !option[index].optionChecked;
				}
			},
			/**
			 * 上一题
			 * @param --
			 * */
			provHandle() {
				const currentIndex = this.currentIndex;
				const length = this.listNew.length;
				
				if (currentIndex === 0) { // 返回
					this.$emit('back');
				} else {
					this.currentIndex --;
				}
			},
			/**
			 * 下一题
			 * @param --
			 * */
			nextHandle() {
				const currentIndex = this.currentIndex;
				const length = this.listNew.length;
				
				if (currentIndex + 1 === length) { // 提交
					this.$emit('submit', this.listNew);
				} else {
					this.currentIndex ++;
				}
			},
		},
		watch: {
			currentIndex: function(val) {
				this.$emit('input', val)
			},
			list: function(val) {
				this.init();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ecp-examination-questions_item{
		position: relative;
		padding: 40rpx 20rpx;
	}
	.ecp-examination-questions_type{
		position: absolute;
		top: 40rpx;
		left: 20rpx;
		color: #b1b1b1;
		line-height: 50rpx;
	}
	.ecp-examination-questions_con{
		padding-left: 100rpx;
		font-size: 30rpx;
		&_option{
			margin-top: 20rpx;
		}
		&--radio{
			margin-right: 10rpx;
			vertical-align: text-top;
		}
	}
	.ecp-examination-questions_toolbar{
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 11;
		background-color: #fff;
		display: flex;
		padding-bottom: 20rpx;
		&--btn{
			width: 300rpx;
		}
	}
	
	/deep/ .uni-radio-wrapper{
		float: left;
	}
</style>
