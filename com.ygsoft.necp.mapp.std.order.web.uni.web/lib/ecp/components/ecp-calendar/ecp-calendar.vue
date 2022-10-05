<template>
	<view class="ecp-calendar">
		<!-- 有错误，显示错误信息 -->
		<view class="err-list" v-if="errs.length">
			<uni-notice-bar v-for="(v, i) in errs" :key="i" :text="v"></uni-notice-bar>
		</view>
		<template v-else>
			<view class="toolbar">
				<view class="btn" @click="goPrev">
					<view class="btn-prev"></view>
				</view>
				<view class="title" @click="goUpper">{{ title }}</view>
				<view class="btn" @click="goNext">
					<view class="btn-next"></view>
				</view>
				<view class="btn-today" @click="back2today">{{ lang.back2today }}</view>
			</view>
			<view class="coltit-list" v-if="colNames.length">
				<view class="coltit-item" v-for="(v, k) in colNames" :key="k">{{v}}</view>
			</view>
			<view class="row-wrap">
				<view class="row" v-for="(row, i) in rows" :key="i">
					<view class="spacer" v-if="row.offset"></view>
					<view class="col" :class="{'col-selected': col.selected, 'col-disabled': col.disabled}" v-for="(col, j) in row.cols" :key="j" @click="onClick(col)" :style="{width: `${1 / colNum * 100}%`}">
						<view class="col-txt">{{ col.text }}</view>
						<view class="col-btm">{{ col.btm }}</view>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue'
	import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
	import * as dateFns from 'date-fns'
	
	import { modes, chkCls } from './calendar.js'
	
	const lang = {
		back2today: '回到今天',
		errType: 'type 错误',
		errDate: '{0} 格式错误',
		errCompare: Array(5).fill().map((v, k) => `{${k}}`).join(' '),
		start: '可选开始',
		end: '可选结束',
		value: '默认值',
		gt: '大于',
		lt: '小于',
		year: '年',
		month: '月',
		today: '今天'
	}
	
	const validator = {
		type: v => !v || ['ecpDate', 'string', 'date'].indexOf(v) > -1,
		ecpDate: v => ecpUtils.isEcpDate(v),
		date: v => v instanceof Date
	}
	
	const date2ecpDate = v => '/Date(' + (+v) + '+0800)/'
	const valueNames = ['value', 'start', 'end'];
	const today = dateFns.startOfDay(new Date())
	
	export default {
		components: {
			uniNoticeBar
		},
		props: {
			mode: {
				type: [String, Function],
				default: 'day',
				validator: v => !v || !chkCls(v).length
			},
			type: {
				type: String,
				validator: validator.type
			},
			...valueNames.reduce((a, k) => {
				a[k] = [String, Date]
				return a
			}, {})
		},
		data() {
			return {
				lang,
				cls: null,
				comValue: null,
				level: 0,
				title: '',
				colNum: 0,
				prev: null,
				next: null,
				upper: null,
				colNames: [],
				rows: []
			};
		},
		computed: {
			...valueNames.reduce((a, k) => {
				let name = 'prop' + k.slice(0, 1).toUpperCase() + k.slice(1)
				a[name] = function() {
					return this[k] && this.cls ? this.cls.parse(this[k]) : null;
				}
				return a
			}, {}),
			errs() {
				let errs = chkCls(this.mode);
				if (!validator.type(this.type)) {
					errs.push(lang.errType)
				}
				if (errs.length) {
					return errs;
				}
				this.cls = typeof this.mode === 'string' ? modes[this.mode] : this.mode;
				errs = valueNames.filter((k, i) => {
					if (!this[k]) {
						return false
					}
					if (!i && this.type) {
						if (this.type === 'date' || this.type === 'ecpDate') {
							return !validator[this.type](this[k])
						}
						return !this.cls.validator(this[k])
					}
					return !validator.date(this[k]) && !validator.ecpDate(this[k]) && !this.cls.validator(this[k])
				}).map(k => ecpUtils.format(lang.errDate, k))
				if (errs.length) {
					return errs;
				}
				if (this.propStart && this.propEnd && this.propStart > this.propEnd) {
					errs.push(ecpUtils.format(lang.errCompare, lang.start, lang.gt, lang.end))
				}
				if (this.propStart && this.propValue && this.propStart > this.propValue) {
					errs.push(ecpUtils.format(lang.errCompare, lang.start, lang.gt, lang.value))
				}
				if (this.propEnd && this.propValue && this.propValue > this.propEnd) {
					errs.push(ecpUtils.format(lang.errCompare, lang.value, lang.gt, lang.end))
				}
				return errs;
			},
			fmtValue() {
				if (!this.comValue) {
					return this.value
				}
				if (this.type === 'date') {
					return this.comValue
				}
				if (this.type === 'ecpDate') {
					return date2ecpDate(this.comValue)
				}
				return this.cls.format(this.comValue)
			}
		},
		created() {
			this.init()
		},
		methods: {
			init() {
				if (this.errs.length) {
					return;
				}
				let value = this.propValue || today
				if (this.propStart && value < this.propStart) {
					value = this.propStart
				}
				if (this.propEnd && value > this.propEnd) {
					value = this.propEnd
				}
				this.comValue = value;
				this.level = 0;
				this.getData(value)
			},
			back2today() {
				this.level = 0;
				this.getData(today)
			},
			goUpper() {
				if (this.upper) {
					this.level++
					this.getData(this.upper)
				}
			},
			goPrev() {
				if (this.prev) {
					this.getData(this.prev)
				}
			},
			goNext() {
				if (this.next) {
					this.getData(this.next)
				}
			},
			onClick(v) {
				if (v.disabled) {
					return;
				}
				if (this.level) {
					this.level--
					this.getData(v.value)
					return;
				}
				this.comValue = v.value
			},
			getData(v) {
				if (!this.cls) {
					return;
				}
				let data = this.cls.getData(v, this.level)
				;['title', 'colNum', 'prev', 'next', 'upper'].forEach(k => this[k] = data[k])
				this.colNames.splice(0, this.colNames.length, ...(data.colNames || []));
				this.rows.splice(0, this.rows.length, ...data.rows.map(row => ({
					offset: row.offset,
					cols: row.cols.map(col => {
						col.selected = this.cls.isSame(this.comValue, col.value, this.level)
						col.disabled = !this.level && (this.propStart && +col.value < +this.propStart || this.propEnd && +col.value > +this.propEnd)
						return col
					})
				})))
			}
		},
		watch: {
			...['mode', 'start', 'end', 'value'].reduce((a, k) => {
				a[k] = function(v) {
					this.init();
				}
				return a
			}, {}),
			fmtValue(v) {
				if (this.type === 'date' ? +v !== +this.value : v !== this.value) {
					['update:value', 'input', 'change'].forEach(k => this.$emit(k, v))
				}
			}
		}
	}
</script>

<style src="./ecp-calendar.css"></style>