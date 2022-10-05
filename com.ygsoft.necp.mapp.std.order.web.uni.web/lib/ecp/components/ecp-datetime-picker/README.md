# 日期时间选择器

## 基本信息

- 组件名称：ecp-datetime-picker
- 组件作者：徐志鹏
- 业务领域：ECP
- 发布时间：2020-06-19
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介
滚动和日历两种方式，支持范围选择，支持Date对象、ecp日期和日期字符串绑定。

## 使用

引入组件
```javascript
import ecpDatetimePicker from '@/lib/ecp/components/ecp-datetime-picker/ecp-datetime-picker.vue'
// ...
export default {
	// ...
	components: {
		// ...
		ecpDatetimePicker
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<ecp-datetime-picker
 :type="type"
 :mode="mode"
 :startValue.sync="startValue"
 :endValue.sync="endValue"
 :start="start"
 v-model="value"
 :end="end"
 @change="onChange"
 @cancel="onCancel"
 :range="range"
 :calendar="calendar"
>
	<!-- slot, 需要一个标签点击触发弹出事件，比如<button> -->
	<button type="default">打开选择器</button>
</ecp-datetime-picker>
```

**具体使用可参考样例**
git仓库：git@git.ygsoft.com:ecp/tphone.git
分支：dev
路径：/doc/src/ecp-datetime-picker/ecp-datetime-picker.vue

## 组件详情

### ecp-expense-panel

#### 属性
属性|类型|默认值|说明
-|-|-|-
type|String|-|绑定时间类型，可选项：string, ecpDate, date
mode|String,Function|day|日期模式，滚动的可选：day（日期）, minute（日期时间到分钟）, timeMinute（时间到分钟）；日历仅有：day（日期）；可以自定义模式，需要继承接口类及实现相关方法，详情请参阅下文：扩展模式
range|Boolean|false|范围选择与否
calendar|Boolean|false|日历选择与否
start|String,Date|-|可选开始时间，可以是Date对象、ecp日期和日期字符串；日期字符串格式根据`mode`不同而不同，day`yyyy-MM-dd`，minute`yyyy-MM-dd hh:mm`，timeMinute`hh:mm`
end|String,Date|-|可选结束时间，格式同`start`
value|String,Date|-|初始单选时间，格式同`start`；如果明确了时间类型`type`，将仅能输入时间类型规定的类型；
startValue|String,Date|-|初始范围选中开始时间，格式要求同`value`
endValue|String,Date|-|初始范围选中结束时间，格式要求同`value`
startTxt|String|-|滚动范围选择选中开始时间的标签提示，当自定义日期模式`mode`时，此处为必填
endTxt|String|-|滚动范围选择选中结束时间的标签提示，当自定义日期模式`mode`时，此处为必填
disabled|Boolean|false|是否禁用

#### 方法
方法名|参数|返回|说明
open|-|-|打开选择器
close|-|-|关闭选择器
onCancel|-|-|关闭选择器，重置选择器选中时间，触发cancel事件

#### 事件
事件|说明|回调变量
-|-|-
change|选中日期变化|`(days)`；`days`在单选时是选中日期，如`'2020-5-6`；范围选择时是包含开始与结束的对象，如`{start:'2020-5-6',end:'2020-5-7'}`；日期格式与属性绑定时间类型`type`相同，无类型同日期字符串`string`
input,update:value|单选日期变化|`(day)`；`day`单选选中日期，格式同上
update:startValue,update:endValue|范围日期变化|`(day)`；`day`对应值发生变化，格式同上

#### 插槽
插槽名称|说明
default|用于点击触发打开组件

#### 自定义模式
自定义模式需要继承相关接口类及实现要求的方法，具体如下
组件模式|属性range|属性calendar|接口类|接口类路径
滚动|-|false|IPickerMode|@/lib/ecp/components/ecp-datetime-picker/picker-mode.js
日历单选|false|true|ICalendar|@/lib/ecp/components/ecp-calendar/calendar.js
日历多选|true|true|ICalendar|@/lib/ecp/components/ecp-scroll-calendar/calendar.js