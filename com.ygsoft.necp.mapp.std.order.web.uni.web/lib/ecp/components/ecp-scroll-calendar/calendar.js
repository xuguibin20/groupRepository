import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'
import * as dateFns from 'date-fns'

// i18n
const lang = {
	before: '早于',
	after: '晚于',
	start: '可选开始时间',
	end: '可选结束时间',
	value: '选中时间',
	startValue: '选中开始时间',
	endValue: '选中结束时间',
	'func is undefined': '方法未定义',
	'date is invalid': '{0} 不是合法的日期格式',
	'compare': '{0} {1} {2}',
	'only endValue': '仅有选中结束时间，无选中开始时间',
	'range min': '可选区间最少2天',
	year: '年',
	month: '月',
	today: '今天',
	startTxt: '开始',
	endTxt: '结束',
	selected: '选中',
	weekday: '日,一,二,三,四,五,六',
	'mode is undefined': '无此模式',
	'class is not extends from iPickerMode': '当前模式未继承自 iPickerMode',
}

// 抽象类，各模式继承该类
class ICalendar {};

// 预定义的接口函数，直接调用抛出错误提示定义该接口
const defaultFunc = () => {
	throw new Error(lang['func is undefined'])
};

// 需要定义的类公用方法
const funcNames = ['setData', 'getRowNum', 'getData', 'setSelected', 'getSelected', 'findIndex', 'getChosenDays'];
// 需要定义的类静态方法
const staticFuncNames = ['check'];


[funcNames, staticFuncNames].forEach((names, i) => names.forEach(k => (i ? ICalendar : ICalendar.prototype)[k] = defaultFunc));

// 用于后续日期赋值的变量
const today = dateFns.startOfDay(new Date())

// 目前仅定义了日期模式
class DayCalendar extends ICalendar {
	// 初始化，参数请参阅setData
	constructor(props) {
	    super();
		this.setData(props);
		this.cols = lang.weekday.split(',')
	}
	
	/**
	 * 校验日期格式
	 * @param {String|Date} v 需要校验的日期
	 * @return {Boolean} 合法与否
	 */
	static validator(v) {
		return !v || v instanceof Date || ecpUtils.isEcpDate(v) || (/^\d{4}-\d{2}-\d{2}$/.test(v) && dateFns.isValid(dateFns.parse(v, 'yyyy-MM-dd', today)))
	}
	
	/**
	 * 解析日期
	 * @param {Stirng|Date} v 需要解析的日期
	 * @return {Date} 日期对象
	 */
	static parse(v) {
		if (v instanceof Date) {
			return dateFns.startOfDay(v)
		}
		return dateFns.parse(ecpUtils.isEcpDate(v) ? ecpUtils.ecpDateToDate(v) : v, 'yyyy-MM-dd', today)
	}
	
	/**
	 * 校验参数
	 * @param {Object} [props] 初始化参数
	 * @param {Boolean} props.range 是否是范围选择
	 * @param {String} props.start 可选范围开始日期
	 * @param {String} props.end 可选范围结束日期
	 * @param {String} props.value 单选默认日期
	 * @param {String} props.startValue 范围选择默认选中开始日期
	 * @param {String} props.endValue 范围选择默认选中结束日期
	 * @return {Array[String]} 错误信息数组，为空时表明参数合法
	 */
	static check(props) {
		// 可以无参数
		if (!props) {
			return [];
		}
		// 需校验的默认值
		// 范围选择校验选中开始结束日期
		// 单选校验默认日期
		let valueNames = props.range ? ['startValue', 'endValue'] : ['value'];
		
		// 对参数进行校验，错误返回错误信息
		let errs = ['start', 'end'].concat(valueNames)
			// 过滤出非法参数
			.filter(k => !this.validator(props[k]))
			// 生成错误信息
			.map(k => ecpUtils.format(lang['date is invalid'], k))
		
		// 校验不通过，返回错误信息
		if (errs.length) {
			return errs;
		}
		
		// 如果可选开始日期存在，结束日期，默认值均不能早于可选开始日期
		if (props.start) {
			errs.push(...['end'].concat(valueNames)
				// 不为空则与可选开始日期比较，过滤出非法参数
				.filter(k => props[k] && props[k] < props.start)
				.map(k => ecpUtils.format(lang['compare'], lang[k], lang['before'], lang['start'])));
		}
		
		// 如果可选结束日期存在，默认值不能晚于可选结束日期
		if (props.end) {
			errs.push(...valueNames
				// 不为空则与可选结束日期比较，过滤出非法参数
				.filter(k => props[k] && props[k] > props.end)
				.map(k => ecpUtils.format(lang['compare'], lang[k], lang['after'], lang['end'])));
		}
		
		// 如果范围选择且可选开始结束日期都存在，开始结束不能是同一天
		if (
			// 范围选择，可选开始日，可选结束日期
			props.range && props.start && props.end &&
			// 结束日期与开始日期是同一天
			props.end === props.start
		) {
			errs.push(lang['range min']);
		}
		
		// 范围选择时，有默认选中结束日期时，不能没有默认选中开始日期
		if (props.range && !props.startValue && props.endValue) {
			errs.push(lang['only endValue']);
		}
		
		// 范围选择时，有默认选中开始和结束日期，结束日期不能早于或等于开始日期
		if (props.range && props.startValue && props.endValue && props.endValue <= props.startValue) {
			errs.push(ecpUtils.format(lang['compare'], lang['endValue'], lang['before'], lang['startValue']));
		}
		
		return errs
	}
	
	/**
	 * 初始化相关数据
	 * @param {Object} [props] 初始化参数
	 * @param {Boolean} props.range 是否是范围选择
	 * @param {String} props.start 可选范围开始日期
	 * @param {String} props.end 可选范围结束日期
	 * @param {String} props.value 单选默认日期
	 * @param {String} props.startValue 范围选择默认选中开始日期
	 * @param {String} props.endValue 范围选择默认选中结束日期
	 */
	setData(props) {
		// 校验不通过
		if (DayCalendar.check(props).length) {
			return;
		}
		
		// 无参数默认空对象
		props = props || {};
		
		// 根据范围选择与否，设置需要初始化的默认值
		let valueNames = props.range ? ['startValue', 'endValue'] : ['value'];
		
		// 范围选择与否
		this.range = props.range;
		
		// 初始化相关参数，不为空时转为日期对象，为空时空字符串
		['start', 'end'].concat(valueNames).forEach(k => this[k] = props[k] ? DayCalendar.parse(props[k]) : '');
		
		// 对为空的属性设置默认值
		
		// 根据范围选择与否，设置选中开始日期或单项默认日期
		let value = props.range ? this.startValue : this.value;
		
		// 无则默认当天
		if (!value) {
			value = today
		}
		
		// 以下均是无默认值后设置默认值为当天，对默认值的调整
		
		// 有可选范围开始及结束，默认值不在可选范围内，则默认值设置为可选范围开始日期
		if (this.start && this.end && !dateFns.isWithinInterval(value, {
			start: this.start,
			end: this.end
		}) || this.start && dateFns.isBefore(value, this.start)) {
			value = this.start
		}
		
		// 有可选范围结束日期，默认值在可选结束之后，默认值设为可选结束日期
		if (this.end) {
			// 范围选择时，默认开始日期最大应该在可选结束的前一天
			let maxSelectedEnd = props.range ? dateFns.subDays(this.end, 1) : this.end;
			if (dateFns.isAfter(value, maxSelectedEnd)) {
				value = maxSelectedEnd
			}
		}
		
		// 无可选开始日期，默认为默认日期的前50年
		if (!this.start) {
			this.start = dateFns.startOfYear(dateFns.subYears(value, 50))
		}
		
		// 无可选结束日期，默认为默认日期的后50年
		if (!this.end) {
			this.end = dateFns.endOfYear(dateFns.addYears(value, 50))
		}
		
		// 根据范围与否，设置默认值
		if (this.range) {
			this.startValue = value
		} else {
			this.value = value
		}
		
		// 清空原数据
		this.data = null
	}
	
	/**
	 * 初始化日期数据列表，返回每组行数，当前模式，每组就是每个月，行数就是星期数，用于计算每组高度
	 * @return {Array[Number]} 每组行数数组
	 */
	getRowNum() {
		// 如果当前对象已有数据列表，返回结果
		if (this.data) {
			return this.rowNum;
		}
		
		// 初始化数据列表，当前模式就是可选范围内的所有月份
		
		/**
		 * 月份数组结构
		 * @property {Array[Object]} data 月份数组
		 * @property {Date} date 该月第一天日期对象
		 * @property {Number} rowNum 该月星期数 
		 */
		this.data = dateFns.eachMonthOfInterval({
			start: this.start,
			end: this.end
		}).map(m => ({
			date: m,
			rowNum: dateFns.getWeeksInMonth(m)
		}))
		
		// 每个月星期数
		this.rowNum = this.data.map(v => v.rowNum);
		return this.rowNum;
	}
	
	/**
	 * 截取数据列表中的一段，返回显示所需的所有数据，当前模式，就是每个月内的每个星期及每日的相关信息对象
	 * @param {Number} sidx 数据列表截取开始索引
	 * @param {Number} eidx 数据列表截取结束索引
	 * @return {Array[Object]} viewData[months] 显示数据数组
	 * 月份信息结构
	 * @property {String} months.text 月份显示文本，如：2020年5月
	 * @property {Array[Object]} months.rows[week] 星期数组
	 * 星期信息结构
	 * @property {Number} week.prefix 星期在该月内第一天是该星期的第几天，从星期天开始计算，从0开始
	 * @property {Number} week.suffix 星期在该月内最后一天是该星期的第几天
	 * @property {Array[Object]} week.cols[day] 日期数组
	 * 日期信息结构
	 * @property {String} day.text 日期显示文本，如：11
	 * @property {String} day.value 日期值，此处使用格式化日期：2020-05-11
	 * @property {String} day.btm 日期显示在底部的额外信息，如：选中，开始，结束，今天
	 * @property {Boolean} day.selected 日期是否选中
	 * @property {Boolean} day.range 范围选择时，日期是否处于已选范围内，包括开始与结束日期
	 */
	getData(sidx, eidx) {
		// 无数据列表，初始化数据列表
		if (!this.data) {
			this.getRowNum()
		}
		
		// 返回月份数组
		return this.data.slice(sidx, eidx).map(({date: m, rowNum}) => {
			let endOfMonth = dateFns.endOfMonth(m)
			return {
				// 月份显示文本
				text: dateFns.format(m, 'yyyy' + lang['year'] + 'M' + lang['month']),
				// 星期数组
				rows: dateFns.eachWeekOfInterval({
					start: m,
					end: endOfMonth
				}).map((w, i) => ({
					// 第一天是第几天，仅月份第一个星期可能不是星期天
					prefix: !i ? dateFns.getDay(m) : 0,
					// 最后一天是第几天，仅月份最后一个星期可能不是星期六
					suffix: i === rowNum - 1 ? 6 - dateFns.getDay(endOfMonth) : 0,
					// 日期数组，星期在该月内的日期
					cols: dateFns.eachDayOfInterval({
						// 第一个星期取月初
						start: i ? w : m,
						// 最后一个星期取月尾
						end: i === rowNum - 1 ? endOfMonth : dateFns.endOfWeek(w)
					}).map(d => {
						// 日期对象
						let day = {
							// 显示文本
							text: d.getDate(),
							// 数据值
							value: dateFns.format(d, 'yyyy-MM-dd'),
							// 底部额外信息
							btm: '',
							// 是否选中
							selected: false,
							// 范围选择时，是否在选中范围内
							range: false,
							// 是否在可选范围内,
							disabled: !dateFns.isWithinInterval(d, {
								start: this.start,
								end: this.end
							})
						};
						if (this.range) {
							// 范围选择
							if (this.startValue && dateFns.isSameDay(this.startValue, d)) {
								// 当前日期是选中开始
								day.btm = lang.startTxt
								day.selected = true
							} else if (this.endValue && dateFns.isSameDay(this.endValue, d)) {
								// 当前日期是选中结束
								day.btm = lang.endTxt
								day.selected = true
							}
							if (this.startValue && this.endValue && dateFns.isWithinInterval(d, {
								start: this.startValue,
								end: this.endValue
							})) {
								// 当前日期在选中范围内
								day.range = true
							}
						} else if (!this.range && this.value && dateFns.isSameDay(this.value, d)) {
							// 非范围选择，当前日期为选中
							day.btm = lang.selected
							day.selected = true
						}
						
						if (!day.btm && dateFns.isSameDay(today, d)) {
							// 当前日期是当天
							day.btm = lang.today
						}
						return day
					})
				}))
			}
		})
	}
	
	/**
	 * 设置选中
	 * @param {String} v 日期：2020-10-12
	 * @param {String} setStart 设置选中开始日期，清空选中结束日期
	 */
	setSelected(v, setStart = false) {
		// 参数不合法
		if (!v || !DayCalendar.validator(v)) {
			return;
		}
		
		// 解析成日期对象
		let date = DayCalendar.parse(v);
		
		// 日期不在可选范围内
		if (!dateFns.isWithinInterval(date, {
			start: this.start,
			end: this.end
		})) {
			return;
		}
		
		// 非范围选择，直接设置当前选中日期
		if (!this.range) {
			this.value = date;
			return;
		}
		
		// 如果无选中开始日期，设置为选中开始日期，清空选中结束日期
		if (!this.startValue || setStart) {
			this.startValue = date;
			this.endValue = '';
			return
		}
		
		// 已有选中开始及结束
		if (this.startValue && this.endValue) {
			if (dateFns.isSameDay(this.startValue, date)) {
				// 设置日期与开始日期相同，结束日期设置为开始日期，清空结束日期
				// 如：设置日期2020-05-10，开始日期：2020-05-10，结束日期：2020-05-20
				// 设置后变为：开始日期：2020-05-20，结束日期：空
				this.startValue = this.endValue
				this.endValue = ''
			} else if (dateFns.isSameDay(this.endValue, date)) {
				// 设置日期与结束日期相同，清空结束日期
				// 如：设置日期2020-05-20，开始日期：2020-05-10，结束日期：2020-05-20
				// 设置后变为：开始日期：2020-05-10，结束日期：空
				this.endValue = ''
			} else if (date < this.endValue) {
				// 设置日期小于结束日期，设置为开始日期
				// 如：设置日期2020-05-15，开始日期：2020-05-10，结束日期：2020-05-20
				// 设置后变为：开始日期：2020-05-15，结束日期：2020-05-20
				this.startValue = date
			} else {
				// 设置日期大于结束日期，开始日期设置为结束日期，结束日期设置为设置日期
				// 如：设置日期2020-05-30，开始日期：2020-05-10，结束日期：2020-05-20
				// 设置后变为：开始日期：2020-05-20，结束日期：2020-05-30
				this.startValue = this.endValue
				this.endValue = date
			}
			return;
		}
		
		// 已有选中开始，且开始日期不小于设置日期
		if (this.startValue && this.startValue >= date) {
			if (this.startValue > date) {
				// 开始日期大于设置日期，结束日期设置为开始日期，开始日期设置为设置日期
				// 如：设置日期2020-05-01，开始日期：2020-05-10，结束日期：空
				// 设置后变为：开始日期：2020-05-01，结束日期：2020-05-10
				this.endValue = this.startValue
				this.startValue = date
			}
			// 设置日期与开始日期相同，不做处理
			return;
		}
		
		// 设置结束日期
		// 如：设置日期2020-05-10，开始日期：2020-05-01，结束日期：空
		// 设置后变为：开始日期：2020-05-01，结束日期：2020-05-10
		this.endValue = date;
	}
	
	/**
	 * 返回选中日期
	 * @return {String|Object} date|dateObj 非范围选择返回选中日期，范围选择返回包含开始与结束日期的对象
	 * @property {String} dateObj.start 选中开始日期
	 * @property {String} dateObje.end 选中结束日期
	 */
	getSelected() {
		let values = this.range ? [this.value] : [this.startValue, this.endValue];
		if (!this.range) {
			// 非范围选择
			return this.value ? dateFns.format(this.value, 'yyyy-MM-dd') : ''
		}
		
		return {
			// 范围选择
			start: this.startValue ? dateFns.format(this.startValue, 'yyyy-MM-dd') : '',
			end: this.endValue ? dateFns.format(this.endValue, 'yyyy-MM-dd') : ''
		}
	}
	
	/**
	 * 根据日期返回所在数据列表索引，找不到返回-1
	 * @param {String} v 日期
	 * @return {Number} 索引
	 */
	findIndex(v) {
		// 非法参数
		if (!v || typeof v !== 'string' || !DayCalendar.validator(v)) {
			return -1;
		}
		
		let date = DayCalendar.parse(v);
		
		// 日期不在可选范围内
		if (!dateFns.isWithinInterval(date, {
			start: this.start,
			end: this.end
		})) {
			return -1;
		}
		
		// 无数据初始化数据列表
		if (!this.data) {
			this.getRowNum()
		}
		
		// 返回当前日期是在月份列表中的第几个月
		return this.data.findIndex(({date: m}) => dateFns.isWithinInterval(date, {
			start: m,
			end: dateFns.endOfMonth(m)
		}))
	}
	
	/**
	 * 获取已选天数
	 * @return {Number} 已选天数
	 */
	getChosenDays() {
		if (!this.range && !this.value || this.range && (!this.startValue || !this.endValue)) {
			return 0;
		}
		if (!this.range && this.value) {
			return 1;
		}
		return dateFns.differenceInCalendarDays(this.endValue, this.startValue) + 1
	}
}

const modes = {
	day: DayCalendar
};

const checkCls = cls => {
	if (typeof cls === 'string') {
		return !modes.hasOwnProperty(cls) ? [ecpUtils.format(lang['mode is undefined'])] : []
	}
	if (Object.getPrototypeOf(cls) !== ICalendar) {
		return [ecpUtils.format(lang['class is not extends from ICalendar'])]
	}
	let errMsgs = funcNames.filter(k => cls.prototype[k] === defaultFunc).concat(staticFuncNames.filter(k => cls[k] === defaultFunc)).map(k => ecpUtils.format(lang['func is undefined'], k))
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

export { ICalendar, checkCls, getCls };