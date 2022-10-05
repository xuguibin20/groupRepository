# 树选择组件

## 基本信息

- 组件名称：ecp-popup-tree-select，ecp-tree-select
- 组件作者：徐志鹏
- 业务领域：天峰
- 发布时间：2020-08-18
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介

通过特定结构的节点列表，生成选择组件。结构上具有树的特性，支持单选/多选，只读，禁用节点等功能。

## 使用

引入组件
```javascript
import ecpPopupTreeSelect from 'ecp-tree-select/ecp-popup-tree-select.vue'
import ecpTreeSelect from 'ecp-tree-select/ecp-tree-select.vue'
// ...
export default {
	// ...
	components: {
		// ...
		ecpPopupTreeSelect，
		ecpTreeSelect
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<button style="margin: 15px;" type="default" @click="$refs.popup.open()">弹出树选择组件</button>
<ecp-popup-tree-select ref="popup" :title="title" :data="data" v-model="value" :lazyload="isLazy ? lazyload: null" :multiple="multiple" :readonly="readonly" :idKey="idKey" :labelKey="labelKey" :treeKey="treeKey" :pidKey="pidKey" :radius="radius"></ecp-popup-tree-select>
<ecp-tree-select :data="data" v-model="value" :lazyload="isLazy ? lazyload: null" :multiple="multiple" :readonly="readonly" :idKey="idKey" :labelKey="labelKey" :treeKey="treeKey" :pidKey="pidKey" :radius="radius"></ecp-tree-select>
```

数据结构示例
```javascript
// 父键数据示例
[
  {
    "id": 1,
    "pid": 0,
    "text": "节点1"
  },
  {
    "id": 2,
    "pid": 0,
    "text": "节点2，叶子节点"
  },
  {
    "id": 3,
    "pid": 0,
    "text": "节点3，禁用叶子节点",
    "disabled": true
  },
  {
    "id": 4,
    "pid": 1,
    "text": "节点4"
  },
  {
    "id": 5,
    "pid": 1,
    "text": "节点5，叶子节点"
  },
  {
    "id": 6,
    "pid": 1,
    "text": "节点6，禁用叶子节点",
    "disabled": true
  }
]
// 编码数据示例
[
  {
    "id": "0001",
    "text": "节点0001"
  },
  {
    "id": "0002",
    "text": "节点0002，叶子节点"
  },
  {
    "id": "0003",
    "text": "节点0003，禁用叶子节点",
    "disabled": true
  },
  {
    "id": "00010001",
    "text": "节点00010001"
  },
  {
    "id": "00010002",
    "text": "节点00010002，叶子节点"
  },
  {
    "id": "00010003",
    "text": "节点00010003，禁用叶子节点",
    "disabled": true
  }
]
```

**具体使用可参考样例**

git仓库：`git@git.ygsoft.com:ecp/tphone.git`

分支：`dev`

路径：`/doc/src/tabBar/mainPage/ecp-tree-select`

## 组件详情

### ecpTreeSelect

#### 属性
属性|类型|默认值|说明
-|-|-|-
idKey|String|id|主键
labelKey|String|text|标签
treeKey|String|id|编码，用于确定节点上级，与`radius`属性配合使用
pidKey|String|pid|父建，`pidKey`与`radius`属性不能全为空
radius|Number|-|圆角值，用于划分编码层级，`pidKey`与`radius`属性不能全为空
readonly|Boolean|false|只读
multiple|Boolean|false|多选
lazyload|Function(node, resolve)|-|懒加载函数，也表明是否采取懒加载方式，传入节点与回调，返回子节点数组
data|Node[]|-|初始化节点列表
value|String, Number, Array|false|选中节点的id

#### 事件
事件|说明|参数
-|-|-
input|数据更新|`(value)`，根据是否多选，返回选中节点id或节点id数组
update:value|数据更新|`(value)`，根据是否多选，返回选中节点id或节点id数组
change|数据更新|`(value)`，根据是否多选，返回选中节点id或节点id数组

### ecpPopTreeSelect
属性和事件与`ecpTreeSelect`组件相同，并添加了几个其他属性

#### 额外属性
属性|类型|默认值|说明
-|-|-|-
title|String|-|弹出顶部工具栏中间标题

#### 方法
方法名|说明|参数
-|-|-
open|弹出组件|-
close|关闭组件|-
confirm|确认选中，触发上述变更事件|-

#### 事件
事件|说明|参数
-|-|-
show|弹出框状态|`(value)`，是否显示弹出框