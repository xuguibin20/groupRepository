<template>
	<view class="ecp-picker-wrap" :class="{'ecp-picker-indicator': !errMsgs.length}">
		<view
			class="ecp-picker-err-msgs"
			v-if="errMsgs.length">
			<uni-notice-bar
				v-for="(v, i) in errMsgs"
				:key="i"
				:text="v">
			</uni-notice-bar>
		</view>
		
		<picker-view
			class="ecp-picker-view"
			:style="{ width: cols.length * 80 + 'px'}"
			:value="idx"
			indicator-class="ecp-picker-view-indicator"
			@change="onChange"
			v-else>
			<picker-view-column
				v-for="(col, i) in cols"
				:key="i">
				<view
					class="ecp-picker-item"
					v-for="(v, j) in col"
					:key="j">
					{{v}}
				</view>
			</picker-view-column>
		</picker-view>
	</view>
</template>

<script>
	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue'
	import {
		checkCls,
		getCls
	} from './picker-mode.js'

	import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
	
	const validator = {
		type: v => !v || ['ecpDate', 'string', 'date'].indexOf(v) > -1,
		ecpDate: v => ecpUtils.isEcpDate(v),
		date: v => v instanceof Date
	}
	
	const lang = {
		errType: 'type 错误',
		errValue: 'value 格式错误'
	}

	export default {
		components: {
			uniNoticeBar
		},
		props: {
			type: {
				type: String,
				validator: validator.type
			},
			mode: {
				type: [String, Function],
				default: () => 'day'
			},
			start: [String, Date],
			end: [String, Date],
			value: [String, Date]
		},
		data() {
			return {
				idx: [],
				cols: [],
				comValue: ''
			}
		},
		computed: {
			errMsgs() {
				let isCls = typeof this.mode !== 'string';
				let errMsgs = checkCls(this.mode)
				if (!validator.type(this.type)) {
					// 输入值格式参数校验
					errMsgs.push(lang.errType);
				}
				// 统一参数校验
				if ((this.type === 'date' || this.type === 'ecpDate') && this.value && !validator[this.type](this.value)) {
					errMsgs.push(lang.errValue)
				}
				if (errMsgs.length) {
					return errMsgs
				}
				this.PickerMode = isCls ? this.mode : getCls(this.mode)
				return this.PickerMode.checkData(this.value, this.start, this.end);
			},
			propValue() {
				if (this.errMsgs.length || !this.value) {
					return ''
				}
				return +this.PickerMode.parse(this.value)
			},
			fmtValue() {
				if (this.errMsgs.length || this.comValue === '') {
					return ''
				}
				
				let v = new Date(this.comValue)
				
				if (this.type === 'ecpDate') {
					v = '/Date(' + (+v) + '+0800)/'
				}
				
				if (!this.type || this.type === 'string') {
					v = this.PickerMode.format(v)
				}
				
				return v
			}
		},
		methods: {
			init() {
				if (this.errMsgs.length) {
					return;
				}
				if (this.pickerData) {
					this.pickerData.setData(this.value, this.start, this.end)
				} else {
					this.pickerData = new this.PickerMode(this.value, this.start, this.end)
				}
				this.updateValue()
				this.updateCols()
				this.updateIdx()
			},
			updateCols() {
				this.cols.splice(0, this.cols.length, ...this.pickerData.getCols())
			},
			updateIdx() {
				this.idx.splice(0, this.idx.length, ...this.pickerData.getIdx());
			},
			onChange(e) {
				this.pickerData.setIdx(e.detail.value);
				this.updateValue()
				this.updateCols()
				this.updateIdx()
			},
			updateValue() {
				this.comValue = this.pickerData.value ? +this.pickerData.value : '';
				if (this.propValue !== this.comValue) {
					this.$emit('change', this.fmtValue)
					this.$emit('update:value', this.fmtValue)
				}
			}
		},
		watch: {
			// 该部分代码会造成年份元素在每次滑动时都会重新渲染DOM,导致滑动抖动问题,因此注释掉
			// 但注释后会导致切换组件参数时无法生效,因此需要在父组件中打开关闭时间弹窗时重新渲染整个组件
			
			// ...['mode', 'propValue', 'start', 'end'].reduce((a, k) => {
			// 	a[k] = function(v) {
			// 		if (k === 'mode') {
			// 			this.pickerData = null;
			// 		}
			// 		this.init();
			// 	};
			// 	return a
			// }, {}),
			fmtValue(v) {
				if (typeof v !== typeof this.value || typeof v === 'string' && v !== this.value) {
					this.$emit('change', v)
					this.$emit('update:value', v);
				}
			}
		},
		created() {
			this.init()
		}
	}
</script>

<style>
	.ecp-picker-wrap {
		background-color: #fff;
		height: 100%;
	}
	
	.ecp-picker-indicator {
		position: relative;
		touch-action: none;
	}
	
	.ecp-picker-indicator:before {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		margin-top: -17px;
		height: 32px;
		border: solid #ddd;
		border-width: 1px 0;
	}

	.ecp-picker-err-msg {
		height: 100%;
		overflow: hidden auto;
	}
	
	.ecp-picker-view {
		margin: 0 auto;
		height: 100%;
		box-sizing: border-box;
		padding: 0 15px;
		max-width: 100%;
	}
	
	.ecp-picker-item {
		line-height: 34px;
		font-size: 14px;
		text-align: center;
		color: #333;
	}
	
	>>>.uni-picker-view-wrapper {
		justify-content: space-between;
	}
	
	>>> uni-picker-view-column {
		flex: none;
	}
	
	>>> .ecp-picker-view-indicator:before, >>> .ecp-picker-view-indicator:after {
		border: none;
	}
	
	>>> .uni-picker-view-content {
		position: relative;
		width: auto;
		white-space: nowrap;
	}
</style>
