<template>
	<view class="ecp-picker-wrap">
		<view class="ecp-picker-err-msgs" v-if="errMsgs.length">
			<uni-notice-bar v-for="(v, i) in errMsgs" :key="i" :text="v"></uni-notice-bar>
		</view>
		<template v-else>
			<view class="range-bar">
				<view class="range-col" :class="{cur: !switchEnd}" @click="switchEnd = false">
					<view class="range-tit">{{rangeStartTxt}}</view>
					<view class="range-value">{{ startValueFmt }}</view>
				</view>
				<view class="range-gap">{{rangeGap}}</view>
				<view class="range-col" :class="{cur: switchEnd}" @click="switchEnd = true">
					<view class="range-tit">{{rangeEndTxt}}</view>
					<view class="range-value">{{ endValueFmt }}</view>
				</view>
			</view>
			
			<ecp-datetime-picker-view 
				:type="type" 
				:mode="mode" 
				:start="rangeStart"
				:end="end"
				:value.sync="value"
				:key="updateKey">
			</ecp-datetime-picker-view>
		</template>
	</view>
</template>

<script>
	import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue'
	import ecpDatetimePickerView from '@/lib/ecp/components/ecp-datetime-picker/ecp-datetime-picker-view.vue'
	
	import { addDays, addHours } from 'date-fns'
	
	import { checkCls, getCls } from './picker-mode.js'
		
	const lang = {
		dayStart: '日期开始',
		dayEnd: '日期结束',
		timeMinuteStart: '时间开始',
		timeMinuteEnd: '时间结束',
		minuteStart: '日期时间开始',
		minuteEnd: '日期时间结束',
		rangeGap: '至',
		startTxt: '范围开始',
		endTxt: '范围结束',
		'txt required': '{0} 需要自定义文本',
		'endValue is before startValue': '选中结束日期在选中开始日期之前',
		errType: 'type 错误',
		errDate: '{0} 格式错误',
	}
	
	const validator = {
		type: v => !v || ['ecpDate', 'string', 'date'].indexOf(v) > -1,
		ecpDate: v => ecpUtils.isEcpDate(v),
		date: v => v instanceof Date
	}
	
	const toUpperCase = k => k.slice(0, 1).toUpperCase() + k.slice(1)
	
	export default {
		components: {
			uniNoticeBar,
			ecpDatetimePickerView
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
			startValue: [String, Date],
			endValue: [String, Date],
			startTxt: String,
			endTxt: String
		},
		data() {
			return {
				rangeStartValue: '',
				rangeEndValue: '',
				rangeGap: lang.rangeGap,
				value: '',
				switchEnd: false,
				updateKey: 0,
			}
		},
		computed: {
			errMsgs() {
				let errMsgs = []
				
				if (typeof this.mode === 'function') {
					errMsgs.push(...['start', 'end'].filter(k => !this[k]).map(k => ecpUtils.format(lang['txt required'], lang[k + 'Txt'])))
				}
				
				if (!validator.type(this.type)) {
					errMsgs.push(lang.errType)
				}
				
				errMsgs.push(...checkCls(this.mode))
				
				if (errMsgs.length) {
					return errMsgs;
				}
				
				// 统一参数校验
				if (this.type === 'date' || this.type === 'ecpDate') {
					errMsgs.push(...['startValue', 'endValue'].filter(k => this[k] && !validator[this.type](this[k])).map(k => ecpUtils.format(lang.errDate, k)))
				}
				
				if (errMsgs.length) {
					return errMsgs;
				}
				
				this.pickMode = typeof this.mode !== 'string' ? this.mode : getCls(this.mode);
				
				let { validator: pvalidator, parse } = this.pickMode
				
				if (this.startValue && this.endValue && !errMsgs.length) {
					if (pvalidator(this.startValue) && pvalidator(this.endValue) && parse(this.startValue) > parse(this.endValue)) {
						errMsgs.push(lang['endValue is before startValue']);
					}
				}
				return errMsgs
			},
			...['start', 'end'].reduce((a, k, i) => {
				let upperCase = toUpperCase(k)
				
				a['range' + upperCase + 'Txt'] = function() {
					return !this[k + 'Txt'] && typeof this.mode === 'string' ? lang[this.mode + upperCase] : this[k + 'Txt']
				};
				
				a[k + 'ValueFmt'] = function() {
					if (this.errMsgs.length || !this['range' + upperCase + 'Value']) {
						return '';
					}
					
					let {parse, format} = this.pickMode
					
					return format(parse(this['range' + upperCase + 'Value']))
				}
				
				return a
			}, {}),
			rangeStart() {
				this.updateKey ++;
				return this.switchEnd ? this.rangeStartValue : this.start;
			}
		},
		watch: {
			...['start', 'end'].reduce((a, k) => {
				let propName = 'range' + toUpperCase(k) + 'Value';
				a[k + 'Value'] = function(v) {
					if (this[propName] !== v) {
						this[propName] = v;
						if (this.switchEnd && k === 'end' || !this.switchEnd && k === 'start') {
							this.value = v
						}
					}
				}
				
				a[propName] = function(v) {
					
					if (this.type === 'date' ? +this[k + 'Value'] !== +v : this[k + 'Value'] !== v) {
						this.$emit('update:' + k + 'Value', v)
					}
					
					let { parse, format } = this.pickMode
					
					if (k === 'start' && v && (!this.rangeEndValue || parse(v) > parse(this.rangeEndValue))) {
						// v = this.mode === 'timeMinute' ? addHours(parse(v), 1) : addDays(parse(v), 1);
						
						if (this.mode === 'timeMinute' && this.type !== 'date' && v.split(':')[0] < 23){
							v = addHours(parse(v), 1);
						} else {
							v = addDays(parse(v), 1);
						}
						
						if (this.type === 'date') {
							this.rangeEndValue = v;
							return;
						}
						if (this.type === 'ecpDate') {
							this.rangeEndValue = '/Date(' + (+v) + '+0800)/';
							return;
						}
						
						this.rangeEndValue = format(v)
					}
					
					this.$emit('change', {
						start: this.rangeStartValue,
						end: this.rangeEndValue
					})
				}
				return a
			}, {}),
			switchEnd(v) {
				this.value = v ? this.rangeEndValue : this.rangeStartValue;
			},
			value(v) {
				if (this.errMsgs.length) {
					return;
				}
				let propName = 'range' + (this.switchEnd ? 'End' : 'Start') + 'Value'
				
				this[propName] = v
			}
		},
		created() {
			if (this.errMsgs.length) {
				return
			}
			['start', 'end'].forEach(k => {
				let propName = 'range' + toUpperCase(k) + 'Value'
				this[propName] = this[k + 'Value'];
			})
			this.value = this.rangeStartValue
		}
	}
</script>

<style>
	.ecp-picker-wrap {
		background-color: #fff;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.ecp-picker-err-msg {
		height: 100%;
		overflow: hidden auto;
		flex: none;
	}
	
	.ecp-picker-view {
		height: 100%;
		flex: auto;
	}
	
	.range-bar {
		flex: none;
		display: flex;
		align-items: flex-end;
		border-bottom: 1px solid #ddd;
		padding-top: 8px;
	}
	
	.range-col {
		flex: auto;
		padding: 0 12px;
	}
	
	.range-col.cur {
		margin-bottom: -1px;
		border-bottom: 2px solid #00A9F0;
	}
	
	.range-tit {
		font-size: 10px;
		line-height: 12px;
		color: #999;
	}
	
	.range-value {
		height: 30px;
		line-height: 30px;
		font-size: 14px;
		color: #333;
	}
	
	.range-col.cur .range-value {
		padding-top: 1px;
		line-height: 28px;
	}
	
	.range-gap {
		padding: 0 10px;
		flex: none;
		line-height: 30px;
		font-size: 10px;
		color: #999;
	}
</style>
