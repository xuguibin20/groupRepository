# 日期选择器

## 基本信息

- 组件名称：gris-calendar
- 组件作者：徐志鹏
- 业务领域：GRIS
- 发布时间：2020-05-06
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介
日期范围选择器，使用上下滑动的方式切换月份

## 使用

引入组件
```javascript
import grisCalendar from '@/lib/ecp/components/gris-calendar/gris-calendar.vue'
// ...
export default {
	// ...
	components: {
		// ...
		grisCalendar
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<gris-calendar
	:start-month="startMonth"
	:end-month="endMonth"
	:start-date="startDate"
	:end-date="endDate"
	:selectedStartDate="selectedStartDate"
	:days="days"
	@change="change"
	:range="range"
	:selectedTip="selectedTip"
	close-btn
></gris-calendar>
```

**具体使用可参考样例**
git仓库：git@git.ygsoft.com:ecp/tphone.git
分支：dev
路径：/doc/src/gris-calendar/gris-calendar

## 组件详情

### ecp-expense-panel

#### 属性
属性|类型|默认值|说明
-|-|-|-
startMonth|String|本月|日历显示范围，开始月份，格式`yyyy-M`，例：`2020-5`
endMonth|String|下月|日历显示范围，结束月份，格式`yyyy-M`，例：`2020-6`；结束月份不能早于开始月份
startDate|String|当天|日期可选范围，开始日期，格式`yyyy-M-d`，例：`2020-5-6`；开始日期不早于开始月份
endDate|String|当天的一个月后|日期可选范围，结束日期，格式`yyyy-M-d`，例：`2020-6-6`；结束日期晚于开始日期，早于结束月份，比如结束月份是`2020-6`，那么结束日期可以是`2020-6-30`，但不能是`2020-7-1`
selectedStartDate|String|-|默认选中开始日期，格式`yyyy-M-d`，例：`2020-5-8`；默认是开始日期`startDate`的后天；必须在可选范围内
selectedTip|String|-|单选选中日期底部提示
range|Boolean|false|是否范围选择
closeBtn|Boolean|false|是否显示关闭按钮
days|Object|-|特殊日期设置，详情请见下文

#### days 特殊日期设置
属性|类型|默认值|说明
-|-|-|-
workDays|Array[String]|-|工作日数组，格式`['2020-5-9']`
restDays|Array[String]|-|休息日数组，格式`['2020-5-1']`
festival|Object|`{'1-1': '元旦节','2-14': '情人节','5-1': '劳动节','5-4': '青年节','6-1': '儿童节','9-10': '教师节','10-1': '国庆节','12-25': '圣诞节','3-8': '妇女节','3-12': '植树节','4-1': '愚人节','5-12': '护士节','7-1': '建党节','8-1': '建军节','12-24': '平安夜'}`|公历节日
lFestival|Object|`{'12-30': '除夕','1-1': '春节','1-15': '元宵节','5-5': '端午节','8-15': '中秋节','9-9': '重阳节'}`|农历节日

#### 事件
事件|说明|回调变量
-|-|-
close|点击关闭按钮|-
change|选中日期变化|`(days)`；`days`在单选时是选中日期，如`'2020-5-6`；范围选择时是日期数组，如`['2020-5-6','2020-5-7']`；空数组表示未选择结束日期；

## 注意事项

- 节气等农历信息范围：1900-12至2100-12
- 头条小程序中，日历组件不能放在uni-popup组件中；因为scroll-view不能在该组件中滚动，在github中也已经有人提出该问题，详情可查看链接 https://github.com/dcloudio/uni-ui/issues/147