// 时间辅助
import * as dateFns from './node_modules/date-fns'
// 农历辅助
import { calendar as lunar } from './lunar/calendar.js'

// 工作日
const workDays = new Set()
// 休息日
const restDays = new Set()
// 阳历节日
const festival = lunar.getFestival();
// 农历节日
const lFestival = lunar.getLunarFestival();
// 月份列表
const months = new Map();
// 日期列表
const days = new Map();

// 单列模式实例
let instance;

class Calendar {
	constructor() {
		if (instance === undefined) {
			instance = this
			this.lunar = lunar
			this.dateFns = dateFns
		}
		return instance
	}
	/**
	 * 获取单月信息
	 * @param {Date} date	该月内的日期
	 * @return {Object} month 返回该月对象
	 * @property {Date} month.fstD 该月首日
	 * @property {String} month.date 该月日期，2020-5
	 * @property {String} month.dateCn 该月中文日期，2020年5月
	 * @property {Array[Object]} weeks 该月周列表，对象详情请参考 eachWeeksOfMonth
	 */
	getMonth(date) {
		let fstD = dateFns.startOfMonth(date)
		let mDate = dateFns.format(fstD, 'yyyy-M')
		// 如果月份列表中已有该月，直接返回
		let month = months.get(mDate)
		if (month) {
			return month
		}
		month = {
			// 首日
			fstD,
			// 日期
			date: mDate,
			// 中文日期
			dateCn: dateFns.format(fstD, 'yyyy年M月')
		}
		// 获取周列表
		this.eachWeeksOfMonth(month)
		// 存入月份列表
		months.set(mDate, month)
		return month;
	}
	/**
	 * 获取一段日期内的所有月信息
	 * @param {Object} opts 日期参数
	 * @property {Date} opts.start 开始日期
	 * @property {Date} opts.end 结束日期
	 * @return {Array[Object]} months 月份列表，单月对象详情请参考 getMonth
	 */
	eachMonthOfInterval(opts) {
		return dateFns.eachMonthOfInterval({
			start: opts.start,
			end: opts.end
		}).map(m => this.getMonth(m))
	}
	/**
	 * 获取单月周列表，该月对象将添加周列表 weeks 属性
	 * @param {Object} month 要获取的月份对象，对象详情请参考 getMonth
	 * @return {Array[Object]} weeks[week] 周列表
	 * @property {Date} week.fstD 周在该月内的首日日期
	 * @property {String} week.date 周日期，2020-5-5
	 */
	eachWeeksOfMonth(month) {
		if (month.weeks) {
			return month.weeks
		}
		let startOfMonthD = month.fstD
		let endOfMonthD = dateFns.endOfMonth(month.fstD)
		let weeks = dateFns.eachWeekOfInterval({
			start: startOfMonthD,
			end: endOfMonthD
		}).map((w, i) => {
			let week = {
				// 本月内的首日日期
				fstD: i ? w : startOfMonthD
			}
			week.date = dateFns.format(week.fstD, 'yyyy-M-d')
			return week;
		})
		month.weeks = weeks;
		return weeks;
	}
	/**
	 * 获取单周日期列表，该周对象将添加日期列表 days 属性
	 * @param {Object} week	要获取日期列表的周对象，详情请参考 eachWeeksOfMonth
	 * @return {Array[Object]} days[day] 日期列表
	 * @property {Date} day.fstD 日期对象
	 * @property {Boolean} day.isWeekend 是否是周末
	 * @property {Boolean} day.isTomorrow 是否是明天
	 * @property {Boolean} day.isRestDay 是否是休息日
	 * @property {Boolean} day.isWorkDay 是否是工作日
	 * 日期的其他属性请参考 lunar/calendar.js
	 */
	eachDaysOfWeek(week) {
		if (week.days) {
			return week.days
		}
		let startOfWeekD = week.fstD
		let endOfWeekD = dateFns.endOfWeek(week.fstD)
		let endOfMonthD = dateFns.endOfMonth(week.fstD)
		if (dateFns.isBefore(endOfMonthD, endOfWeekD)) {
			endOfWeekD = endOfMonthD
		}
		let dayArr = dateFns.eachDayOfInterval({
			start: startOfWeekD,
			end: endOfWeekD
		}).map(date => {
			let y = date.getFullYear()
			let m = date.getMonth() + 1
			let d = date.getDate()
			let day = days.get(`${y}-${m}-${d}`)
			if (day) {
				return day
			}
			let l = lunar.solar2lunar(y, m, d)
			if (l === -1) {
				l = {
					nWeek: dateFns.getDay(date) + 1,
					date: `${y}-${m}-${d}`,
					cYear: y,
					cMonth: m,
					cDay: d
				}
			}
			day = {
				...l,
				fstD: date,
				// 是否周末
				isWeekend: l.nWeek === 6 || l.nWeek === 7,
				// 该天是否是明天
				isTomorrow: dateFns.isTomorrow(date),
				// 是否调休
				isRestDay: restDays.has(l.date),
				isWorkDay: workDays.has(l.date)
			}
			days.set(day.date, day)
			return day
		})
		week.days = dayArr;
		return dayArr;
	}
	/**
	 * 获取单月日期列表，该月周列表中的周对象将添加日期列表 days 属性
	 * @param {Object} month 需获取日期列表的月份对象，详情请参考 getMonth
	 * @return {Array[Object]} 日期列表，详情请参考 eachDaysOfWeek
	 */
	eachDaysOfMonth(month) {
		return month.weeks.reduce((a, w) => {
			a.push(...this.eachDaysOfWeek(w))
			return a
		}, [])
	}
	// 下列方法均是特殊日期的获取和设置函数
	getWorkDays() {
		return [...workDays]
	}
	setWorkDays(arr) {
		workDays.clear()
		arr.forEach(v => {
			workDays.add(v)
		})
		days.forEach((v, k) => {
			v.isWorkDay = workDays.has(v.date)
		})
	}
	getRestDays() {
		return [...restDays]
	}
	setRestDays(arr) {
		restDays.clear()
		arr.forEach(v => {
			restDays.add(v)
		})
		days.forEach((v, k) => {
			v.isRestDay = restDays.has(v.date)
		})
	}
	getFestval() {
		return festival
	}
	setFestval(obj) {
		festival = obj
		let lObj = {}
		for (let k of obj) {
			lObj[k] = {
				title: obj[k]
			}
		}
		lunar.setFestival(lObj)
		days.forEach((k, v) => {
			let festivalDate = v.cMonth + '-' + v.cDay
			v.festival = festival[festivalDate] ? festival[festivalDate].title : null
		})
	}
	getLFestival() {
		return lFestival
	}
	setLFestval(obj) {
		lFestival = obj
		let lObj = {}
		for (let k of obj) {
			lObj[k] = {
				title: obj[k]
			}
		}
		lunar.setLunarFestival(lObj)
		days.forEach((k, v) => {
			let lunarFestivalDate = v.lMonth + '-' + v.lDay
			v.lunarFestival = lfestival[lunarFestivalDate] ? lfestival[lunarFestivalDate].title : null
		})
	}
}

Calendar.lunar = lunar
Calendar.dateFns = dateFns
export default Calendar;
