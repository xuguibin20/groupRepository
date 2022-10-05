import * as dateFns from 'date-fns'

import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'

// i18n
const lang = {
	'mode is undefined': '无此模式',
	'class is not extends from iPickerMode': '当前模式未继承自 iPickerMode',
	'func is undefined': '{0} 方法未定义',
	'date is invalid': '{0} 不是合法的日期格式',
	'end is before start': '可选结束时间早于可选开始时间',
	'value is before start': '选中时间早于可选开始时间',
	'value is after end': '选中时间晚于可选结束时间',
	year: '年',
	month: '月',
	day: '日',
	hour: '时',
	minute: '分',
	second: '秒'
};

// 抽象接口类
class IPickerMode {}

// 抽象类方法和静态方法
const funcNames = ['setData', 'getCols', 'getIdx', 'setIdx'];
const staticFuncNames = ['checkData', 'validator', 'parse', 'format'];

// 抽象类默认方法定义
const IPickerFunc = function() {
	throw new Error(ecpUtils.format(lang['func is undefined'], 'func'));
};

// 定义抽象类方法与静态方法
[funcNames, staticFuncNames].forEach((names, i) => names.forEach(k => (i ? IPickerMode : IPickerMode.prototype)[k] = IPickerFunc))

const IPickerModeFactory = function({init, validator, parse, format, initValue, initStart, initEnd, ...funcs}) {
	class TmpPickerMode extends IPickerMode {
		constructor(value, start, end) {
			super()
			this.setData(value, start, end)
		}

		static checkData(value, start, end) {
			if (!value && !start && !end) {
				// 均无值，不校验
				return [];
			}

			let data = { value, start, end },
				dataNames = ['value', 'start', 'end'];

			// 格式校验
			let errMsgs = dataNames.filter(k => !this.validator(data[k])).map(k => ecpUtils.format(lang['date is invalid'], k))
		
			if (errMsgs.length) {
				// 格式校验不通过，返回错误信息
				return errMsgs
			}

			// 将参数转为日期对象
			dataNames.forEach(k => data[k] = data[k] ? parse(data[k]) : data[k]);
			({ value, start, end } = data)
			
			if (start && end && dateFns.isBefore(end, start)) {
				// 结束时间早于开始时间
				errMsgs.push(ecpUtils.format(lang['end is before start']));
			}
			
			if (start && value && dateFns.isBefore(value, start)) {
				// 默认时间早于开始时间
				errMsgs.push(ecpUtils.format(lang['value is before start']));
			}
			
			if (end && value && dateFns.isAfter(value, end)) {
				// 默认时间晚于结束时间
				errMsgs.push(ecpUtils.format(lang['value is before start']));
			}
			return errMsgs;
		}
		
		setData(value, start, end) {
			let data = { value, start, end },
				dataNames = ['value', 'start', 'end'];
							
			if (TmpPickerMode.checkData(value, start, end).length) {
				dataNames.forEach(k => data[k] = '');
			}
			
			dataNames.forEach(k => data[k] = data[k] ? TmpPickerMode.parse(data[k]) : data[k]);
			({value, start, end} = data)
						
			if (!value) {
				value = data.value = initValue
			}
			
			if (start && end && !dateFns.isWithinInterval(value, {
				start,
				end
			}) || start && dateFns.isBefore(value, start)) {
				data.value = start
			}
			
			if (end && dateFns.isAfter(value, end)) {
				data.value = end
			}
			
			if (start && dateFns.isBefore(value, start)) {
				data.value = start
			}
			
			if (end && dateFns.isAfter(value, end)) {
				data.value = end
			}
			
			if (!start) {
				data.start = initStart(data.value)
			}
			
			if (!end) {
				data.end = initEnd(data.value)
			}
			
			dataNames.forEach(k => this[k] = data[k]);
			
			init.call(this, value, start, end)
		}
	}
		
	Object.assign(TmpPickerMode.prototype, funcs)
	
	TmpPickerMode.parse = parse
	TmpPickerMode.format = v => dateFns.format(v, format)
	
	// 合法要求：空 或者 Date 或者 ecpDate 或者 符合自定义校验
	TmpPickerMode.validator = v => !v || v instanceof Date || ecpUtils.isEcpDate(v) || validator(v)
	
	return TmpPickerMode
}

const cur = new Date();
const today = dateFns.startOfDay(cur)

const DayPickerMode = IPickerModeFactory({
	validator: v => /^\d{4}-\d{2}-\d{2}$/.test(v) && dateFns.isValid(dateFns.parse(v, 'yyyy-MM-dd', cur)),
	parse: v => {
		if (v instanceof Date) {
			return dateFns.startOfDay(v)
		}
		return dateFns.parse(ecpUtils.isEcpDate(v) ? ecpUtils.ecpDateToDate(v) : v, 'yyyy-MM-dd', today)
	},
	format: 'yyyy-MM-dd',
	initValue: today,
	...['initStart', 'initEnd'].reduce((a, k, i) => {
		a[k] = v => dateFns.addYears(v, i ? 50 : -50)
		return a
	}, {}),
	init() {},
	getDateCols(cache) {
		if (cache && this.cols) {
			return this.dataCols
		}
		
		let years = dateFns.eachYearOfInterval({
			start: this.start,
			end: this.end
		})
		
		let months = dateFns.eachMonthOfInterval({
			start: dateFns.isSameYear(this.start, this.value) ? this.start : dateFns.startOfYear(this.value),
			end: dateFns.isSameYear(this.end, this.value) ? this.end : dateFns.endOfYear(this.value)
		});
		
		let days = dateFns.eachDayOfInterval({
			start: dateFns.isSameMonth(this.start, this.value) ? this.start : dateFns.startOfMonth(this.value),
			end: dateFns.isSameMonth(this.end, this.value) ? this.end : dateFns.endOfMonth(this.value)
		});
		
		this.dataCols = [years, months, days];
		this.cols = null;
		this.idx = null;
		return this.dataCols;
	},
	getCols(cache) {
		let years, months, days;
		if (cache) {
			if (this.cols) {
				return this.cols
			}
			([years, months, days] = this.getDateCols(cache))
		} else {
			([years, months, days] = this.getDateCols())
		}
		this.cols = [years.map(v => dateFns.format(v, 'yyyy' + lang['year'])), months.map(v => dateFns.format(v, 'MM' + lang['month'])), days.map(v => dateFns.format(v, 'dd' + lang['day']))];
		return this.cols
	},
	getIdx(cache) {
		let cols;
		if (cache) {
			if (this.idx) {
				return this.idx
			}
			cols = this.getDateCols(cache)
		} else {
			cols = this.getDateCols()
		}
		this.idx = ['Year', 'Month', 'Day'].map((k, i) => dateFns[`differenceInCalendar${k}s`](this.value, cols[i][0]))
		return this.idx;
	},
	setIdx([yIdx, mIdx, dIdx]) {
		let cols = this.getDateCols(true)
		let year = cols[0][yIdx].getFullYear()
		let month = cols[1][mIdx].getMonth()
		let day = cols[2][dIdx].getDate()
		if (year === cols[0][0].getFullYear()) {
			let startMonth = this.start.getMonth()
			if (startMonth > month) {
				month = startMonth
			}
		}
		if (year === cols[0][cols[0].length - 1].getFullYear()) {
			let endMonth = this.end.getMonth()
			if (endMonth < month) {
				month = endMonth
			}
		}
		let baseDate = new Date(year, month);
		let daysInMonth = dateFns.getDaysInMonth(baseDate)
		if (daysInMonth < day) {
			day = daysInMonth
		}
		if (dateFns.isSameMonth(baseDate, this.start)) {
			let startDay = this.start.getDate()
			if (startDay > day) {
				day = startDay
			}
		}
		if (dateFns.isSameMonth(baseDate, this.end)) {
			let endDay = this.end.getDate()
			if (endDay < day) {
				day = endDay
			}
		}
		this.value = new Date(year, month, day)
		this.dataCols = null
		this.cols = null
		this.idx = null
	}
})

const TimeMinutePickerMode = IPickerModeFactory({
	validator: v => {
		if (!/^\d{2}:\d{2}$/.test(v)) {
			return false;
		}
		let [hour, min] = v.split(':')
		return hour >= 0 && hour < 24 && min >= 0 && min < 60
	},
	parse: v => {
		if (v instanceof Date) {
			return dateFns.set(today, {
				hours: v.getHours(),
				minutes: v.getMinutes(),
			})
		}
		if (ecpUtils.isEcpDate(v)) {
			v = ecpUtils.ecpDateToDate(v, true).split(' ')[1].slice(0, -3)
		}
		return dateFns.parse(v, 'HH:mm', today)
	},
	format: 'HH:mm',
	initValue: dateFns.startOfMinute(cur),
	...['initStart', 'initEnd'].reduce((a, k, i) => {
		a[k] = () => i ? dateFns.endOfDay(today) : today
		return a
	}, {}),
	init(value, start, end) {
		this.updateData()
	},
	updateData() {
		['value', 'start', 'end'].forEach(k => {
			this[k + 'Hour'] = this[k].getHours()
			this[k + 'Min'] = this[k].getMinutes()
		})
		let hours = Array.from(Array(this.endHour - this.startHour + 1), (v, k) => k + this.startHour)
		let startMin = this.valueHour === this.startHour ? this.startMin : 0
		let endMin = this.valueHour === this.endHour ? this.endMin : 59
		let mins = Array.from(Array(endMin - startMin + 1), (v, k) => k + startMin)
		this.dataCols = [hours, mins];
		this.cols = this.dataCols.map((col, k) => col.map(v => (v > 9 ? v : '0' + v) + lang[k ? 'minute' : 'hour']))
		this.idx = [this.valueHour - this.startHour, this.dataCols[1].indexOf(this.valueMin)]
	},
	...['cols', 'idx'].reduce((a, k) => {
		let funcName = 'get' + k.slice(0, 1).toUpperCase() + k.slice(1)
		a[funcName] = function () {
			return this[k]
		}
		return a;
	}, {}),
	setIdx(idx) {
		let [hour, min] = idx.map((k, i) => this.dataCols[i][k])
		if (hour === this.startHour && min < this.startMin) {
			min = this.startMin
		} 
		if (hour === this.endHour && min > this.endMin) {
			min = this.endMin
		}
		this.value = dateFns.set(this.value, { hours: hour, minutes: min })
		this.updateData()
	}
})

const MinutePickerMode = IPickerModeFactory({
	validator: v => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v) && dateFns.isValid(dateFns.parse(v, 'yyyy-MM-dd HH:mm', cur)),
	parse: v => {
		if (v instanceof Date) {
			return dateFns.startOfMinute(v)
		}
		if (ecpUtils.isEcpDate(v)) {
			v = ecpUtils.ecpDateToDate(v, true).slice(0, -3)
		}
		return dateFns.parse(v, 'yyyy-MM-dd HH:mm', dateFns.startOfDay(cur))
	},
	format: 'yyyy-MM-dd HH:mm',
	initValue: dateFns.startOfMinute(cur),
	...['initStart', 'initEnd'].reduce((a, k, i) => {
		a[k] = v => i ? dateFns.endOfYear(dateFns.addYears(v, 50)) : dateFns.startOfYear(dateFns.subYears(v, 50))
		return a
	}, {}),
	init(value, start, end) {
		Object.assign(this, ['start', 'end'].reduce((a, v) => {
			a[v + 'Arr'] = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes'].map(k => this[v]['get' + k]())
			return a
		}, {}))
		
		this.updateData()
	},
	updateData() {
		let cur = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes'].map(k => this.value['get' + k]())
		
		let years = dateFns.eachYearOfInterval({
			start: this.start,
			end: this.end
		}).map(v => v.getFullYear());
		
		this.dataCols = [years, ...[12, dateFns.getDaysInMonth(this.value), 24, 60].map((colNum, i) => {
			let colStart = i === 1 ? 1 : 0;
			if (!this.endArr.slice(0, i + 1).some((end, j) => end !== cur[j])) {
				colNum = this.endArr[i + 1]
				if (!i) {
					colNum++;
				}
			}
			if (!this.startArr.slice(0, i + 1).some((start, j) => start !== cur[j])) {
				colNum -= this.startArr[i + 1] - 1
				colStart = this.startArr[i + 1]
			}
			
			return Array.from(Array(colNum), (v, k) => colStart + k)
		})]
		
		this.cols = ['year', 'month', 'day', 'hour', 'minute'].map((lng, i) => this.dataCols[i].map(v => {
			if (lng === 'month') {
				++v
			}
			return (v > 9 ? v : '0' + v) + lang[lng]
		}))
		
		this.idx = [cur[0] - this.startArr[0], ...Array.from(Array(4), (v, k) => this.dataCols[k + 1].indexOf(cur[k + 1]))]
	},
	...['cols', 'idx'].reduce((a, k) => {
		let funcName = 'get' + k.slice(0, 1).toUpperCase() + k.slice(1)
		a[funcName] = function () {
			return this[k]
		}
		return a;
	}, {}),
	setIdx(idx) {
		let cur = idx.map((idx, colIdx) => this.dataCols[colIdx][idx]);
		[12, 0, 24, 60].forEach((colNum, i) => {
			colNum = colNum || dateFns.getDaysInMonth(new Date(cur[0], cur[1]))
			let colStart = i === 1 ? 1 : 0
			if (!this.endArr.slice(0, i + 1).some((end, j) => end !== cur[j])) {
				colNum = this.endArr[i + 1]
				if (!i) {
					colNum++
				}
			}
			if (!this.startArr.slice(0, i + 1).some((start, j) => start !== cur[j])) {
				colNum -= this.startArr[i + 1] - 1
				colStart = this.startArr[i + 1]
			}
			if (cur[i + 1] < colStart) {
				cur[i + 1] = colStart
			}
			if (cur[i + 1] > colStart + colNum - 1) {
				cur[i + 1] = colStart + colNum - 1
			}
		})
		this.value = new Date(...cur)
		this.updateData()
	}
})

const modes = {
	day: DayPickerMode,
	minute: MinutePickerMode,
	timeMinute: TimeMinutePickerMode
};

const checkCls = cls => {
	if (typeof cls === 'string') {
		return !modes.hasOwnProperty(cls) ? [ecpUtils.format(lang['mode is undefined'])] : []
	}
	if (Object.getPrototypeOf(cls) !== IPickerMode) {
		return [ecpUtils.format(lang['class is not extends from iPickerMode'])]
	}
	let errMsgs = funcNames.filter(k => cls.prototype[k] === IPickerFunc).concat(staticFuncNames.filter(k => cls[k] === IPickerFunc)).map(k => ecpUtils.format(lang['func is undefined'], k))
	return errMsgs
}

const getCls = cls => {
	return modes[cls]
}

for (let k in modes) {
	let cls = modes[k]
	if (checkCls(cls).length) {
		delete modes[k]
	}
}

export { checkCls, getCls, IPickerMode, dateFns }