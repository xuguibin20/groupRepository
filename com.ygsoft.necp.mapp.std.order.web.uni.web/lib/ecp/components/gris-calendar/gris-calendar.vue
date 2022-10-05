<template>
	<view class="calendar-panel">
		<view class="top-bar">
			<view class="top-bar-body">选择日期</view>
			<view class="top-bar-close" @click="$emit('close')" v-if="closeBtn"><uni-icons type="closeempty" color="#999" :size="iconSize"></uni-icons></view>
		</view>
		<!-- 错误信息 -->
		<uni-notice-bar class="err-msg" v-for="(v, i) in errMsgs" :key="i" background-color="#f1dbda" color="#dd524d" :text="v"></uni-notice-bar>
		<template v-if="!errMsgs.length">
			<view class="calc-height">
				<view class="calendar-month"><view class="calendar-month-title"></view></view>
				<view class="calendar-day">
					<view class="calendar-day-header"></view>
					<view class="calendar-day-body"></view>
					<view class="calendar-day-footer"></view>
				</view>
			</view>
			<view class="calendar-header">
				<view class="calendar-head-item" :class="{ 'calendar-head-item-weekend': i === 0 || i === 6 }" v-for="(v, i) in weekDaysCn" :key="v">{{ v }}</view>
			</view>
			<view class="calendar-month-list">
				<!-- #ifdef H5 -->
				<!-- 在某些浏览器，如firefox 59.0.1中，使用scroll-view监听滚动事件会报错 -->
				<view class="calendar-month-scroll calendar-month-scroll-h5" @scroll="onScroll">
					<!-- #endif -->
					<!-- #ifndef H5 -->
					<scroll-view scroll-y :scroll-top="scrollTop" @scroll="onScroll" class="calendar-month-scroll">
						<!-- #endif -->
						<view class="calendar-placehold" :style="{ height: `${monthsHeight}px` }">
							<view class="calendar-viewbox" :style="{ transform: `translateY(${viewTop}px)` }">
								<view class="calendar-month" v-for="(m, mi) in viewMonths" :key="mi">
									<view class="calendar-month-title">{{ m.dateCn }}</view>
									<view class="calendar-week" v-for="(w, wi) in m.weeks" :key="wi">
										<view class="calendar-day-placehold" v-if="!wi"></view>
										<view
											class="calendar-day"
											:class="{
												'calendar-day-weekend': d.isWeekend,
												'calendar-day-lg': d.isToday || d.isTomorrow,
												'calendar-day-disable': date2Status[d.date2].disabled,
												'calendar-day-start': date2Status[d.date2].isSelectedStart,
												'calendar-day-end': date2Status[d.date2].isSelectedEnd,
												'calendar-day-selected': date2Status[d.date2].isSelected,
												'calendar-day-hasend': date2Status[d.date2].isSelectedStart && selectedEnd
											}"
											v-for="(d, di) in w.days"
											:key="di"
											@click="onClick(d)"
										>
											<view class="calendar-day-header" :class="{ 'calendar-day-header-jcr': d.isRestDay || d.isWorkDay }">
												<view class="calendar-day-header-body">{{ d.festival || d.lunarFestival || d.Term || '' }}</view>
												<view class="calendar-day-header-footer" v-if="d.isRestDay || d.isWorkDay">{{ d.isRestDay ? '休' : '班' }}</view>
											</view>
											<view class="calendar-day-body">{{ d.isToday ? '今天' : d.isTomorrow ? '明天' : d.cDay }}</view>
											<view class="calendar-day-footer">
												{{ date2Status[d.date2].isSelectedStart ? (range ? '入住' : selectedTip || '') : date2Status[d.date2].isSelectedEnd ? '离店' : '' }}
											</view>
										</view>
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
				<view class="calendar-month-title calendar-month-bar">{{ curMonthDateCn }}</view>
				<view class="notice-bar" v-show="range && !selectedEnd">请选择离店日期</view>
				<view class="calendar-loading" v-show="!ready">
					<!-- #ifndef MP-ALIPAY -->
					<uni-icons class="icon-loading" type="refresh" color="#ccc"></uni-icons>
					<!-- #endif -->
					<!-- #ifdef MP-ALIPAY -->
					<!-- 支付宝小程序不支持css3动画 -->
					<view class="icon-loading" :animation="animationData"><uni-icons type="refresh" color="#ccc"></uni-icons></view>
					<!-- #endif -->
				</view>
			</view>
		</template>
	</view>
</template>

<script>
import Calendar from './calendar.js';
import uniIcons from '@/components/uni-icons/uni-icons.vue';

// 日历数据
let calendar = new Calendar();
// 日期辅助函数
let dateFns = Calendar.dateFns;

// 当天0点，用于初始化
const todayD = dateFns.startOfDay(new Date()),
	// 当月首日0点，用于初始化
	monthFstD = dateFns.startOfMonth(todayD);
// 月份列表
let months = [],
	// 日期转月份
	date2Month = {},
	// 显示区域长度
	monthLen = 5;
export default {
	components: {
		uniIcons
	},
	props: {
		// 日历开始月份
		startMonth: {
			type: String,
			default: dateFns.format(todayD, 'yyyy-M'),
			validator: v => dateFns.isValid(dateFns.parse(v, 'yyyy-M', monthFstD))
		},
		// 日历结束月份
		endMonth: {
			type: String,
			default: dateFns.format(dateFns.addMonths(todayD, 1), 'yyyy-M'),
			validator: v => dateFns.isValid(dateFns.parse(v, 'yyyy-M', monthFstD))
		},
		// 可选开始日期
		startDate: {
			type: String,
			default: dateFns.format(todayD, 'yyyy-M-d'),
			validator: v => dateFns.isValid(dateFns.parse(v, 'yyyy-M-d', monthFstD))
		},
		// 可选结束日期
		endDate: {
			type: String,
			default: dateFns.format(dateFns.addMonths(todayD, 1), 'yyyy-M-d'),
			validator: v => dateFns.isValid(dateFns.parse(v, 'yyyy-M-d', monthFstD))
		},
		// 初始选中开始日期
		selectedStartDate: {
			type: String,
			default: '',
			validator: v => !v || dateFns.isValid(dateFns.parse(v, 'yyyy-M-d', monthFstD))
		},
		// 单选选中底部提示
		selectedTip: String,
		// 是否范围选择
		range: Boolean,
		// 是否显示关闭按钮
		closeBtn: Boolean,
		/**
		 * @property {Object} days 设置特殊日期
		 * @property {Array[String]} days.workDays 工作日数组，['2020-5-9']
		 * @property {Array[String]} days.restDays 休息日数组，['2020-5-1', '2020-5-2', '2020-5-3', '2020-5-4', '2020-5-5']
		 * @property {Object} days.festival 公历节日，{'1-1': '元旦节'}
		 * @property {Object} days.lFestival 农历节日，{'1-1': '春节'}
		 */
		days: Object
	},
	data() {
		return {
			/**
			 * 星期简写
			 * @type {String[]}
			 * @return ['日','一','二','三','四','五','六']
			 */
			weekDaysCn: calendar.lunar.nStr1.slice(0, 7),
			// 图标大小
			iconSize: 32,
			// 组件高度计算完成
			ready: false,
			// 月除周外的默认高度
			monthHeight: 100,
			// 周的默认高度
			monthWeekHeight: 120,
			// 月标题默认高度
			monthTitHeight: 60,
			// 日期整体高度
			monthsHeight: 0,
			// 滑动偏移量
			scrollTop: 0,
			// 可视区域首月日期索引
			curMonthIdx: 0,
			// 已选开始日期
			selectedStart: '',
			// 已选结束日期
			selectedEnd: '',
			// #ifdef MP-ALIPAY
			// 支付宝小程序不支持css3动画，使用动画api代替
			animationData: {},
			rotateDeg: 0
			// #endif
		};
	},
	computed: {
		// 开始月份日期实例
		startMonthD() {
			return dateFns.parse(this.startMonth, 'yyyy-M', monthFstD);
		},
		// 结束月份日期实例
		endMonthD() {
			return dateFns.parse(this.endMonth, 'yyyy-M', monthFstD);
		},
		// 开始日期实例
		startDateD() {
			return dateFns.parse(this.startDate, 'yyyy-M-d', monthFstD);
		},
		// 结束日期实例
		endDateD() {
			return dateFns.parse(this.endDate, 'yyyy-M-d', monthFstD);
		},
		// 结束月份是否合法
		endMonthValid() {
			return dateFns.isAfter(this.endMonthD, this.startMonthD) ? '' : '结束月份要晚于开始月份';
		},
		// 开始日期是否合法
		startDateValid() {
			return dateFns.isBefore(this.startDateD, this.startMonthD) || dateFns.isAfter(this.startDateD, dateFns.endOfMonth(this.endMonthD))
				? '开始日期要不早于开始月份且不晚于结束月份'
				: '';
		},
		// 结束日期是否合法
		endDateValid() {
			return dateFns.isAfter(this.endDateD, this.startDateD) && !dateFns.isAfter(this.endDateD, dateFns.endOfMonth(this.endMonthD))
				? ''
				: '结束日期要晚于开始日期且不晚于结束月份';
		},
		// 可选区间最少需要2天
		intervalValid() {
			return dateFns.differenceInCalendarDays(this.endDateD, this.startDateD) < 2 ? '可选区间小于2天' : '';
		},
		// 初始选中开始日期必须在可选区间内
		selectedStartDateValid() {
			return !this.selectedStartDate ||
				dateFns.isWithinInterval(dateFns.parse(this.selectedStartDate, 'yyyy-M-d', monthFstD), {
					start: this.startDateD,
					end: this.endDateD
				})
				? ''
				: '初始选中开始日期不在可选区间内';
		},
		// 警告信息
		errMsgs() {
			return ['endMonth', 'startDate', 'endDate', 'interval', 'selectedStartDate'].filter(k => this[`${k}Valid`]).map(k => this[`${k}Valid`]);
		},
		// 已选开始日期对象
		selectedStartD() {
			return (this.selectedStart && dateFns.parse(this.selectedStart, 'yyyy-M-d', this.startDateD)) || null;
		},
		// 已选结束日期对象
		selectedEndD() {
			return (this.selectedEnd && dateFns.parse(this.selectedEnd, 'yyyy-M-d', this.startDateD)) || null;
		},
		// 可是区域首月中文日期
		curMonthDateCn() {
			return (this.ready && months[this.curMonthIdx].dateCn) || '';
		},
		// 渲染开始月份索引
		viewStart() {
			// 日历长度小于等于可视区域期望长度
			if (this.ready && months.length <= monthLen) {
				return 0;
			}
			// 默认可视区域为当前月份前2个月
			// 当前月份离日历开始不足3个月
			if (this.curMonthIdx < 3) {
				return 0;
			}
			let viewStart = this.curMonthIdx - 2;
			if (viewStart + monthLen > months.length) {
				// 根据显示月份长度向后取结束月份，如果结束月份超过了月份列表长度，则通过结尾月份反推开始月份
				viewStart = Math.max(months.length - monthLen, 0);
			}
			return viewStart;
		},
		// 可视区域偏移量
		viewTop() {
			return (this.ready && months[this.viewStart].scrollTop) || 0;
		},
		// 可是区域月份列表
		viewMonths() {
			return (
				(this.ready &&
					months.slice(this.viewStart, this.viewStart + monthLen).map(m => {
						// 该月日期初始化
						calendar.eachDaysOfMonth(m);
						// 向日期添加date2属性，用于日期相关状态 date2Status
						let weeks = m.weeks.map(w => {
							return {
								...w,
								days: w.days.map(d => ({
									...d,
									date2: dateFns.format(d.fstD, 'yyyyMMdd')
								}))
							};
						});
						return {
							...m,
							weeks
						};
					})) ||
				[]
			);
		},
		// 日期禁用、选中等状态
		date2Status() {
			return this.viewMonths.reduce((a, m) => {
				m.weeks.forEach(w =>
					w.days.forEach(d => {
						let status = {
							// 是否禁选
							disabled: dateFns.isBefore(d.fstD, this.startDateD) || dateFns.isAfter(d.fstD, this.endDateD),
							// 是否选中开始
							isSelectedStart: this.selectedStart === d.date,
							// 是否选中结束
							isSelectedEnd: this.selectedEnd === d.date,
							// 是否选中
							isSelected:
								this.selectedStart &&
								this.selectedEnd &&
								dateFns.isWithinInterval(d.fstD, {
									start: this.selectedStartD,
									end: this.selectedEndD
								})
						};
						a[d.date2] = status;
					})
				);
				return a;
			}, {});
		}
	},
	methods: {
		// 初始化月份数据
		initMonthsData() {
			months = calendar
				.eachMonthOfInterval({
					start: this.startMonthD,
					end: this.endMonthD
				})
				.map((m, i) => {
					let month = {
						...m,
						// 用于 date2Month 对象
						date2: m.date.replace('-', '')
					};
					date2Month[month.date2] = month;
					return month;
				});
		},
		// 初始化月份高度和偏移量
		initMonthsHeight() {
			this.monthsHeight = 0;
			months.forEach((m, i) => {
				m.height = this.monthHeight + m.weeks.length * this.monthWeekHeight;
				m.scrollTop = i ? months[i - 1].scrollTop + months[i - 1].height : 0;
				this.monthsHeight += m.height;
			});
		},
		// 点击日期
		onClick(d) {
			// 禁选
			if (this.date2Status[d.date2].disabled) {
				uni.showToast({
					title: '当前日期不可选',
					icon: 'none',
					position: 'center'
				});
				return;
			}
			// 选择开始时间
			if (!this.selectedStart || !this.range || (this.selectedStart && this.selectedEnd) || dateFns.isBefore(d.fstD, this.selectedStartD)) {
				this.selectedStart = d.date;
				this.selectedEnd = '';
				return;
			}
			// 选择结束时间
			// 结束时间与开始时间相同
			if (d.date === this.selectedStart) {
				return;
			}
			this.selectedEnd = d.date;
		},
		// 日历滚动
		onScroll(e) {
			// 开始滚动说明日历高度已经初始化，开始显示日历
			this.ready = true;
			let scrollTop;
			// #ifndef H5
			scrollTop = e.detail.scrollTop;
			// #endif
			// #ifdef H5
			scrollTop = this.$el.querySelector('.calendar-month-scroll').scrollTop;
			// #endif
			if (
				scrollTop >= months[this.curMonthIdx].scrollTop - this.monthTitHeight &&
				scrollTop < months[this.curMonthIdx].scrollTop + months[this.curMonthIdx].height - this.monthTitHeight
			) {
				// 滑动范围未超出当前月份
				return;
			}
			let startIdx, endIdx, offset;
			if (scrollTop < months[this.curMonthIdx].scrollTop - this.monthTitHeight) {
				startIdx = 0;
				endIdx = this.curMonthIdx;
			} else {
				startIdx = this.curMonthIdx + 1;
				endIdx = months.length;
			}
			this.curMonthIdx =
				startIdx +
				months.slice(startIdx, endIdx).findIndex(m => {
					return scrollTop >= m.scrollTop - this.monthTitHeight && scrollTop < m.scrollTop + m.height - this.monthTitHeight;
				});
		},
		// #ifdef MP-ALIPAY
		startAnimate() {
			this.rotateDeg += 360;
			this.animation.rotate(this.rotateDeg).step();
			this.animationData = this.animation.export();
		}
		// #endif
	},
	watch: {
		selectedStart(v) {
			if (!this.range) {
				this.$emit('change', v);
			}
		},
		selectedEnd(v) {
			if (this.range) {
				// 触发change事件
				this.$emit(
					'change',
					(this.selectedEnd &&
						dateFns
							.eachDayOfInterval({
								start: this.selectedStartD,
								end: this.selectedEndD
							})
							.map(d => dateFns.format(d, 'yyyy-M-d'))) ||
						[]
				);
			}
		},
		range(v) {
			if (!v) {
				this.selectedEnd = '';
			}
		}
	},
	created() {
		// 确定图标大小比例和日历相关组件默认高度
		let rate = uni.getSystemInfoSync().windowWidth / 750;
		this.iconSize = (rate * this.iconSize) | 0;
		this.monthHeight = (this.monthHeight * rate) | 0;
		this.monthWeekHeight = (this.monthWeekHeight * rate) | 0;
		this.monthTitHeight = (this.monthTitHeight * rate) | 0;
		if (this.errMsgs.length) {
			return;
		}
		// 初始化已选开始日期
		if (this.selectedStartDate) {
			// 有初始值
			this.selectedStart = this.selectedStartDate;
		} else {
			// 无初始值
			// 后天
			let startD = dateFns.addDays(todayD, 2);
			if (
				dateFns.isWithinInterval(dateFns.addDays(todayD, 2), {
					start: this.startDateD,
					end: this.endDateD
				})
			) {
				// 后天在区间中，取后天和结束前1天中小的那一天
				// 结束前1天
				let endD = dateFns.subDays(this.endDateD, 1);
				this.selectedStart = dateFns.format(dateFns.isBefore(startD, endD) ? startD : endD, 'yyyy-M-d', todayD);
			} else {
				// 后天不在区间中，取开始那一天
				this.selectedStart = this.startDate;
			}
		}
		// 初始化特殊日期
		if (this.days) {
			['workDays', 'restDays', 'festival', 'lFestival'].forEach(k => {
				if (this.days[k]) {
					calendar[`set${k.slice(0, 1).toUpperCase()}${k.slice(1)}`](this.days[k]);
				}
			});
		}
		// 初始化日历数据
		this.initMonthsData();
	},
	mounted() {
		if (this.errMsgs.length) {
			return;
		}
		// #ifdef MP-ALIPAY
		// loading 动画
		this.animation = uni.createAnimation({
			duration: 2000
		});
		this.startAnimate();
		let handler = setInterval(() => {
			if (this.ready) {
				clearInterval(handler);
				return;
			}
			this.startAnimate();
		}, 2000);
		// #endif
		// 初始化高度
		// #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO || MP-BAIDU
		// 某些小程序中，使用弹出组件时，日历组件并不渲染到页面上，导致无法正确计算组件高度，所以设置监听器，监听日历是否出现在视口中
		this.observer = uni.createIntersectionObserver(
			// #ifndef MP-BAIDU
			this
			// #endif
		);
		this.observer.relativeToViewport().observe('.calendar-panel', res => {
			if (res.intersectionRatio) {
				// #ifdef  MP-BAIDU
				this.observer.disconnect();
				// #endif

				// #endif

				let calcHeightPromise = Promise.resolve();
				if (!this.ready) {
					// 未计算过日历高度
					let query = uni
						.createSelectorQuery()
						// #ifdef H5 || MP-WEIXIN || MP-TOUTIAO || MP-QQ || H5
						.in(this);
					// #endif
					calcHeightPromise = Promise.all([
						new Promise(res =>
							query
								.select('.calc-height .calendar-month')
								.boundingClientRect(data => {
									this.monthHeight = data.height;
									res(data);
								})
								.exec()
						),
						new Promise(res =>
							query
								.select('.calc-height .calendar-month-title')
								.boundingClientRect(data => {
									this.monthTitHeight = data.height;
									res(data);
								})
								.exec()
						),
						new Promise(res =>
							query
								.select('.calc-height .calendar-day')
								.boundingClientRect(data => {
									this.monthWeekHeight = data.height;
									res(data);
								})
								.exec()
						)
					]).then(args => {
						// 初始化日历高度及偏移量
						this.initMonthsHeight();
					});
				}

				calcHeightPromise
					.then(() => {
						// 计算滑动偏移量，默认滑动到当前选中日期所在的月份

						if (dateFns.isEqual(dateFns.startOfMonth(this.selectedStartD), this.startMonthD)) {
							// 当前月份就是第一个月，不滚动
							this.ready = true;
							return;
						}

						this.$nextTick(function() {
							// 滑动到当前选中日期所在的月份
							let scrollTop = date2Month[dateFns.format(this.selectedStartD, 'yyyyM')].scrollTop;
							// 滑动到当前选中日期所在的月份
							// #ifndef H5
							this.scrollTop = scrollTop;
							// #endif
							// #ifdef H5
							this.$el.querySelector('.calendar-month-scroll').scrollTo(0, scrollTop);
							// #endif
						});
					})
					.catch(err => {
						console.log(err);
						uni.showModal({
							title: '错误',
							content: '日历加载失败'
						});
					});

				// #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO || MP-BAIDU
			}
			// #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
			else {
				// 重置滑动，以便显示的时候滑动有效果
				this.scrollTop = 0;
			}
			// #endif
		});
		// #endif
	},
	// #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO
	beforeDestroy() {
		this.observer.disconnect();
	}
	// #endif
};
</script>

<style src="./gris-calendar.css"></style>
