<template>
	<view class="calendar">
		<!-- 有错误，显示错误信息 -->
		<view class="err-list" v-if="err.length">
			<uni-notice-bar v-for="(v, i) in err" :key="i" :text="v"></uni-notice-bar>
		</view>
		<!-- 无错误，显示内容 -->
		<template v-else>
			<view class="calendar-header">
				<view class="calendar-header-col" v-for="(v, i) in cols" :key="i">{{ v }}</view>
			</view>
			<!-- #ifdef H5 -->
			<!-- 在某些浏览器，如firefox 59.0.1中，使用scroll-view监听滚动事件会报错 -->
			<view class="calendar-list" @scroll="onScroll">
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<scroll-view scroll-y :scroll-top="scrollTop" @scroll="onScroll" class="calendar-list">
					<!-- #endif -->
					<view class="calendar-height" :style="{height: `${height}px`}">
						<view class="calendar-viewbox" :style="{transform: `translateY(${viewTop}px)`}">
							<!-- 渲染分组 -->
							<view class="calendar-item" v-for="(v, i) in viewData" :key="i">
								<!-- 分组标题 -->
								<view class="calendar-tit">{{ v.text }}</view>
								<!-- 行 -->
								<view class="calendar-row" v-for="(row, j) in v.rows"  :key="j">
									<!-- 列偏移 -->
									<view class="calendar-col" v-for="col in row.prefix" :key="'prefix' + col"></view>
									<!-- 列 -->
									<view class="calendar-col" :class="{'calendar-col-selected': col.selected, 'calendar-col-range': col.range, 'calendar-col-disabled': col.disabled }" v-for="(col, k) in row.cols" :key="k" @click="onClick(col)">
										<view class="calendar-col-content">{{ col.text }}</view>
										<view class="calendar-col-btm">{{ col.btm }}</view>
									</view>
									<!-- 列偏移 -->
									<view class="calendar-col" v-for="col in row.suffix" :key="'suffix' + col"></view>
								</view>
							</view>
						</view>
					</view>
					<!-- #ifndef H5 -->
				</scroll-view>
				<!-- #endif -->
				<!-- #ifdef H5 -->
			</view>
			<!-- #endif -->
		</template>
	</view>
</template>

<script>
	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue'
	import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
	import { getCls, checkCls } from './calendar.js'
	
	const validator = {
		type: v => !v || ['ecpDate', 'string', 'date'].indexOf(v) > -1,
		ecpDate: v => ecpUtils.isEcpDate(v),
		date: v => v instanceof Date
	}
	
	const lang = {
		'errType': 'type 错误',
		'errDate': '{0} 格式错误',
	}
	
	export default {
		components: {
			uniNoticeBar
		},
		props: {
			// 输入值格式
			type: {
				type: String,
				validator: validator.type
			},
			// 模式，可以是预定义的，也可以自行扩展，扩展要继承ICalendar抽象类，实现抽象类方法
			mode: {
				type: [String, Function],
				default: () => 'day',
				validator: v => !checkCls(v).length
			},
			// 可选开始时间
			start: [String, Date],
			// 可选结束时间
			end: [String, Date],
			// 范围选择与否
			range: Boolean,
			// 单选时间
			value: [String, Date],
			// 范围选中开始时间
			startValue: [String, Date],
			// 范围选中结束时间
			endValue: [String, Date]
		},
		data() {
			return {
				// 渲染数量
				viewNum: 5,
				// 整体高度
				height: 0,
				// 当前索引
				curIdx: 0,
				// 滚动偏移
				scrollTop: 0,
				// 渲染数据
				viewData: [],
				// 表头内容
				cols: [],
				// 错误信息
				err: []
			}
		},
		computed: {
			// 可视区域在数据列表中的索引
			viewIdx() {
				let itemList = this.itemList || [];
				// 默认可视区域为当前卡片前2个卡片
				// 当前卡片距数据列表开始不足3个
				if (this.curIdx < 3) {
					return 0;
				}
				let viewIdx = this.curIdx - 2;
				if (viewIdx + this.viewNum > itemList.length) {
					// 根据显示卡片数量向后取结束卡片索引，如果结束卡片索引超过了数据列表长度，则通过结尾卡片索引反推开始卡片索引
					viewIdx = Math.max(itemList.length - this.viewNum, 0);
				}
				return viewIdx;
			},
			// 可视区域偏移量
			viewTop() {
				let itemList = this.itemList || [];
				return itemList[this.viewIdx] && itemList[this.viewIdx].scrollTop || 0
			}
		},
		methods: {
			// 校验数据
			check() {
				this.err.splice(0, this.err.length);
				
				if (!validator.type(this.type)) {
					// 输入值类型校验
					this.err.push(lang.errType);
				}
				
				// 模式校验
				this.err.push(...checkCls(this.mode));
				
				// 统一参数校验
				if (this.type === 'date' || this.type === 'ecpDate') {
					this.err.push(...(this.range ? ['startValue', 'endValue'] : ['value']).filter(k => this[k] && !validator[this.type](this[k])).map(k => ecpUtils.format(lang.errDate, k)))
				}
				
				if (this.err.length) {
					return false
				}
								
				// 设置数据类
				this.Calendar = typeof this.mode === 'string' ? getCls(this.mode) : this.mode;
				// 参数校验
				this.err = this.Calendar.check(this.$props);
				return this.err.length === 0
			},
			// 初始化日历数据
			init() {
				// 校验数据
				if (!this.check()) {
					return
				}
				
				// 有数据对象，则设置值，无则新建数据对象
				if (this.calendar) {
					this.calendar.setData(this.$props)
				} else {
					this.calendar = new this.Calendar(this.$props)
				}
				
				// 表头文本
				this.cols.splice(0, this.cols.length, ...this.calendar.cols);
				
				// 触发数据更新事件
				this.updateValue();
				
				// 计算数据列表高度和每组数据的偏移量
				this.height = 0
				
				this.itemList = this.calendar.getRowNum().map(rowNum => {
					let height = 72 + rowNum * 48
					let scrollTop = this.height
					this.height += height
					return {
						height,
						scrollTop
					}
				})
				
				// 初始化列表偏移及可视区域
				this.initScrollTop();
			},
			// 滚动监听
			onScroll(e) {
				let scrollTop;
				// 非H5使用scroll-view组件本身监听方法
				// #ifndef H5
				scrollTop = e.detail.scrollTop;
				// #endif
				// H5使用dom获取
				// #ifdef H5
				scrollTop = this.$el.querySelector('.calendar-list').scrollTop;
				// #endif

				// 更新当前分组索引
				this.curIdx = this.findIndex(scrollTop);
			},
			// 更新可视区域数据
			updateViewData() {
				this.viewData.splice(0, this.viewData.length, ...this.calendar.getData(this.viewIdx, this.viewIdx + this.viewNum))
			},
			// 根据偏移量获取当前索引
			findIndex(scrollTop) {
				return this.itemList.findIndex(v => v.scrollTop <= scrollTop && v.scrollTop + v.height > scrollTop)
			},
			// 点击列数据
			onClick(v) {
				if (v.disabled) {
					// 不在可选范围内
					return;
				}
				
				// 设置选中
				this.calendar.setSelected(v.value);
				
				// 更新数据
				this.updateValue();
				
				// 更新可视区域
				this.updateViewData();
			},
			// 触发数据更新事件
			updateValue() {
				let selected = this.calendar.getSelected();
				let emitList = this.range ? [{
					name: 'startValue',
					value: selected.start
				}, {
					name: 'endValue',
					value: selected.end
				}] : [{
					name: 'value',
					value: selected
				}];
				let change = emitList.reduce((a, {name, value}, i) => {
					if (value) {
						let date = this.Calendar.parse(value);
												
						if (this.type === 'date') {
							value = date
						}
						if (this.type === 'ecpDate') {
							value = '/Date(' + (+date) + '+0800)/'
						}
						if (this.range) {
							selected[i ? 'end' : 'start'] = value
						} else {
							selected = value
						}
					}
										
					if (this.type === 'date' ? +this[name] !== +value : this[name] !== value) {
						this.$emit('update:' + name, value);
						a = true;
					}
					
					return a
				}, false);
				if (change) {
					this.$emit('change', selected)
				}
			},
			// 初始化列表偏移及可视区域
			initScrollTop() {
				// 获取选中日期
				let selected = this.calendar.getSelected();
				
				// 获取当前日期索引
				this.curIdx = this.calendar.findIndex(this.range ? selected.start : selected);
				
				// 设置当前偏移量
				this.scrollTop = this.itemList[this.curIdx].scrollTop;
				
				// #ifdef H5
				this.$nextTick(function(){
					this.$el.querySelector('.calendar-list').scrollTo(0, this.scrollTop);
				})
				// #endif
				
				// 更新可视区域数据
				this.updateViewData();
			},
			getChosenDays() {
				if (this.err.length) {
					return 0;
				}
				return this.calendar.getChosenDays();
			}
		},
		watch: {
			// 可视区域索引变化更新可视区域数据
			viewIdx() {
				this.updateViewData();
			},
			// 父组件参数发生变化更新当前组件数据
			...['start', 'end', 'range'].reduce((a, k) => {
				a[k] = function(v) {
					this.init()
				}
				return a
			}, {}),
			// 父组件参数发生变化更新当前组件数据
			...['value', 'startValue', 'endValue'].reduce((a, k) => {
				a[k] = function(v) {
					if (
						// 参数校验错误
						!this.check() ||
						// 范围选择，不处理单选
						this.range && k === 'value' ||
						// 非范围选择，仅处理单选
						!this.range && k !== 'value' ||
						// 无变化
						+this.Calendar.parse(v) === +this.calendar[k]
					) {
						return;
					}
					this.calendar.setSelected(v, k === 'startValue');
					// 更新数据
					this.updateValue();
					// 初始化列表偏移及可视区域
					this.initScrollTop();
				}
				return a
			}, {}),
			type(v) {
				this.updateValue()
			}
		},
		created() {
			this.init()
		}
	}
</script>

<style src="./ecp-scroll-calendar.css"></style>
