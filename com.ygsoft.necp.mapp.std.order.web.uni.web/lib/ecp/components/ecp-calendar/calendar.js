import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
import * as dateFns from 'date-fns'

const lang = {
	colNames: Array(7).fill().map((v, k) => k ? ecpUtils.transferNumToChLower(k) : '日'),
	today: '今天',
	year: '年',
	month: '月',
	'func not defined': '{0} 方法未定义',
	'class is not extends from ICalendar': '当前模式未继承自 ICalendar',
	'mode is undefined': '无此模式'
}

const funcs = [];
const staticFuncs = ['validator', 'parse', 'format', 'getData', 'isSame'];
const defaultFunc = name => {
	return () => {throw new Error(ecpUtils.format(lang['func not defined'], name))}
}

class ICalendar {}

;[funcs, staticFuncs].forEach((funcNames, k) => funcNames.forEach(name => (k ? ICalendar : ICalendar.prototype)[name] = defaultFunc(name)));

const today = dateFns.startOfDay(new Date())

/**
 * 将一维数组转为指定列数的二位数组，并且符合行数据结构要求
 * @param {Array} arr 待转数组
 * @param {Number} colNum 列数
 * @return {Array} 二维数组
 */
const list2matrix = (arr, colNum, offset) => arr.reduce((a, m, i) => {
	let rowIdx = i / colNum | 0;
	if (i % colNum === 0) {
		a[rowIdx] = {
			offset: 0,
			cols: []
		};
	}
	a[rowIdx].cols.push(m)
	return a
}, [])

class DayCalendar extends ICalendar {
	/**
	 * 校验非ecpDate格式的字符串类型日期，用于默认，可选开始和可选结束的校验
	 * @param {Object} v 待校验字符串
	 * @return {Boolean} 返回是否合法
	 */
	static validator(v) {
		return /^\d{4}-\d{2}-\d{2}$/.test(v) && dateFns.isValid(dateFns.parse(v, 'yyyy-MM-dd', today))
	}
	
	/**
	 * 解析日期
	 * @param {Date|String} d 输入日期/ecpDate/字符串
	 * @return {Date} 解析后的日期 
	 */
	static parse(v) {
		if (ecpUtils.isEcpDate(v)) {
			v = new Date(ecpUtils.ecpDateToDate(v))
		}
		
		if (typeof v === 'string') {
			return dateFns.parse(v, 'yyyy-MM-dd', today)
		}
		
		return dateFns.startOfDay(v)
	}
	
	/**
	 * 格式化日期，用于返回日期是字符串的
	 * @param {Date} v 日期
	 * @return {String} 格式化后的日期字符串
	 */
	static format(v) {
		return dateFns.format(v, 'yyyy-MM-dd')
	}
	
	/**
	 * 返回数据
	 * @param {Date} d 参照日期
	 * @param {Number} level 当前层级，0表示最底层
	 * @return {Object} data 返回数据
	 * @property {String} data.title 顶部标题
	 * @property {Array[String]} data.colNames 列表头，可以为空，不显示表头
	 * @property {Number} data.colNum 列数
	 * @property {Date} data.prev 前进按钮输入日期
	 * @property {Date} data.next 后退按钮输入日期
	 * @property {Date} data.upper 返回上层输入日期，可以为空，表示最顶层
	 * @property {Array[Object]} data.rows 行数据
	 * @property {Number} data.rows[].offset 当前行偏移量
	 * @property {Array[Object]} data.rows[].cols 列数据
	 * @property {String} data.rows[].cols[].text 列数据中间文本
	 * @property {Date} data.rows[].cols[].value 列数据日期
	 * @property {String} data.rows[].cols[].btm 列数据底部文本
	 * @property {Boolean} data.rows[].cols[].highlight 列数据是否高亮，用于非最底层
	 */
	static getData(d, level = 0) {
		return this[['getDays', 'getMonths', 'getYears'][level]](d)
	}
	
	/**
	 * 比较两个日期在当前层级内是否相同，用于高亮判断，比如在列数据显示月份时，判断这两个日期是否在同一个月
	 * @param {Date} a 比较的日期
	 * @param {Date} b 比较的日期
	 * @param {Number} level 层级
	 * @return {Boolean} 是否相同
	 */
	static isSame(a, b, level = 0) {
		let func = 'isSame' + ['Day', 'Month', 'Year'][level];
		return dateFns[func](a, b)
	}
	
	/**
	 * 获取该月所有日期
	 * @param {Date} d 参照日期
	 * @return {Object} data 返回数据，参考getData
	 */
	static getDays(d) {
		// 月初月末
		let startOfMonth = dateFns.startOfMonth(d)
		let endOfMonth = dateFns.endOfMonth(d)
		// 行数据
		let rows = dateFns
			// 获取本月所有星期
			.eachWeekOfInterval({
				start: startOfMonth,
				end: endOfMonth
			})
			// 处理列数据
			.map((w, i, a) => ({
				// 计算偏移量，只有第一个星期需要计算，月初第一天是星期几
				offset: i ? 0 : dateFns.getDay(startOfMonth),
				cols: dateFns
					// 获取该星期本月内的日期
					.eachDayOfInterval({
						// 第一个星期用月初
						start: i ? w : startOfMonth,
						// 最后一个星期用月末
						end: i === a.length - 1 ? endOfMonth : dateFns.endOfWeek(w)
					}).map(d =>({
						text: d.getDate(),
						value: d,
						btm: dateFns.isSameDay(d, today) ? lang.today : null,
						highlight: false
					}))
			}))
		return {
			title: dateFns.format(d, 'yyyy' + lang.year + 'MM' + lang.month),
			colNames: lang.colNames,
			colNum: 7,
			prev: dateFns.subMonths(startOfMonth, 1),
			next: dateFns.addMonths(startOfMonth, 1),
			upper: startOfMonth,
			rows
		}
	}
	
	/**
	 * 获取该年所有月
	 * @param {Date} d 参照日期
	 * @return {Object} data 返回数据，参考getData
	 */
	static getMonths(d) {
		let year = d.getFullYear()
		// 列数据
		let cols = Array(12).fill().map((v, k) => ({
				text: ++k + lang.month,
				value: dateFns.parse(year + '-' + k, 'yyyy-M', today),
				btm: null,
				highlight: today.getFullYear() === year && today.getMonth() + 1 === k
			}))

		// 将列数据转为行数据，每行4个
		let rows = list2matrix(cols, 4)
		
		return {
			title: year + lang.year,
			colNames: null,
			colNum: 4,
			prev: dateFns.subYears(d, 1),
			next: dateFns.addYears(d, 1),
			upper: d,
			rows
		}
	}
	
	/**
	 * 获取当前十年
	 * @param {Date} d 参照日期
	 * @return {Object} data 返回数据，参考getData
	 */
	static getYears(d) {
		let prefix = d.getFullYear() / 10 | 0
		let startOfDecade = dateFns.startOfDecade(d)
		
		// 列数据
		let cols = Array(10).fill(prefix).map((v, k) => {
			let year = v + k.toString();
			return {
				text: year,
				value: dateFns.parse(year, 'yyyy', today),
				btm: null,
				highlight: today.getFullYear() === +year
			}
		})
		
		// 将列数据转为行数据，每行4个
		let rows = list2matrix(cols, 4)
		
		return {
			title: prefix + '0-' + prefix + '9',
			colNames: null,
			colNum: 4,
			prev: dateFns.subYears(startOfDecade, 10),
			next: dateFns.addYears(startOfDecade, 10),
			upper: null,
			rows
		}
	}
}

const chkCls = cls => {
	if (typeof cls === 'string') {
		return modes.hasOwnProperty(cls) ? [] : [lang['mode is undefined']]
	}
	if (!(cls instanceof ICalendar)) {
		return [lang['class is not extends from ICalendar']];
	}
	let errs = [funcs, staticFuncs].map((funcNames, k) => funcNames.filter(name => (k ? ICalendar : ICalendar.prototype)[name] === (k ? cls : cls.prototype)[name]).map(name => ecpUtils.format(lang['func not defined'], name)));
	return errs[0].concat(errs[1])
}

const modes = {
	day: DayCalendar
}

export {modes, chkCls}