# 费用面板

## 基本信息

- 组件名称：ecp-expense-panel
- 组件作者：徐志鹏
- 业务领域：天峰
- 发布时间：2020-04-30
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介

通过绑定数据模型及元数据模型，生成通用费用面板。

## 使用

引入组件
```javascript
import ecpExpensePanel from '../../lib/ecp/components/ecp-expense-panel/ecp-expense-panel.vue'
// ...
export default {
	// ...
	components: {
		// ...
		ecpExpensePanel
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<ecp-expense-panel ref="panel" v-model="data" :metaData="metaData" :options="options"></ecp-expense-panel>
```

**具体使用可参考样例**
git仓库：git@git.ygsoft.com:ecp/tphone.git
分支：dev
路径：/doc/src/ecp-expense-panel/ecp-expense-panel

## 组件详情

### ecp-expense-panel

#### 属性
属性|类型|默认值|说明
-|-|-|-
data|Array[Object]|-|数据模型，可以使用v-model绑定
metaData|Array[Object]|-|元数据模型，数组内对象详情见下文
options|Object|-|组件参数，详情见下文

#### 元数据模型数组内对象
属性|类型|默认值|说明
-|-|-|-
name|字段|-|项目字段，与数据模型数组对象的键一一对应
caption|字段说明|-|字段显示名称，为空则显示字段`name`
editType|输入
options|Object|-|组件参数，详情见下文

#### 事件
事件|说明|回调变量
-|-|-|-
input|数据更新|更新后的数据模型

#### 插槽 slot
插槽|说明
-|-
default|面板项目图标，插槽变量见下文

#### default 插槽变量 slotProps
属性|类型|说明
-|-|-
item|Object|当前项目
idx|Number|当前项目在数据模型中的索引
data|Array[Object]|数据模型

### ecp-expense-collapse

#### 属性
属性|类型|默认值|说明
-|-|-|-
title|String|明细|折叠头部标题
subTitle|Stirng|-|折叠头部副标题
amount|Number,String|-|折叠头部右侧内容
open|Boolean|false|是否展开折叠
size|Number,String|16|折叠头部图标大小，会根据屏幕宽度自动缩放
swipeActionOpts|Object|-|折叠头部传入滑动组件`uni-swipe-action-item`的属性，结构与滑动组件属性相同

##### swipeActionOpts 参数说明
属性|类型|默认值|说明
-|-|-|-
show|Boolean|false|是否显示滑动按钮
autoClose|Boolean|true|是否自动关闭滑动组件
disabled|Boolean|false|是否禁用滑动组件
options|Array[Object]|[{ text: '复制', style: { backgroundColor: '#1e87f0' }}, { text: '删除', style: { backgroundColor: '#f65c09' }}]|滑动组件按钮内容及样式

##### swipeActionOpts.options[] 参数说明
属性|类型|默认值|说明
-|-|-|-
text|String|-|按钮内容
style|Object|-|按钮样式
style.backgroundColor|Stirng|#C7C6CD|按钮背景颜色
style.color|Stirng|#FFFFFF|按钮字体颜色
style.fontSize|Stirng|14px|按钮字体大小

#### 事件
事件|说明|回调变量
-|-|-|-
swipe-action-click|点击滑动组件选项按钮时触发事件|(event: {content, index})，content（点击内容）、index（下标）
swipe-action-change|滑动组件打开或关闭时触发|(event)，event === true：开启状态；event === false：关闭状态

#### 插槽 slot
插槽|说明
-|-
default|折叠内容
icon|折叠头部左侧图标

### ecp-expense-list-item

#### 属性
属性|类型|默认值|说明
-|-|-|-
star|Boolean|false|是否显示列表左侧红`*`
title|Stirng|-|列表左侧标题
arrow|Boolean|false|是否显示列表右侧箭头图标`>`
size|String,Number|16|右侧箭头图标大小，会根据屏幕宽度自动缩放

#### 插槽 slot
插槽|说明
-|-
default|列表右侧内容