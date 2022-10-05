# 费用面板

## 基本信息

- 组件名称：ecp-number-box
- 组件作者：徐志鹏
- 业务领域：天峰
- 发布时间：2020-05-26
- git仓库：[git.ygsoft.com/ecp/tphone.git](http://git.ygsoft.com/ecp/tphone.git)

## 简介

通用数字输入组件，是在`input`组件上扩展，支持必填、最小、最大限制，千分位、中文大小写、大写金额及自定义格式化显示。

## 使用

引入组件
```javascript
import ecpNumberBox from '../../lib/ecp/components/ecp-number-box/ecp-number-box.vue'
// ...
export default {
	// ...
	components: {
		// ...
		ecpNumberBox
		// ...
	},
	// ...
}
// ...
```

编写页面
```html
<ecp-number-box v-model="value" :max="max" :min="min" :disabled="disabled" :required="required" :chinese-format="chineseFormat" :thousand-separator="thousandSeparator" :mask="mask" :placeholder="placeholder" :show-toast="showToast" :format="format" :com-opts="comOpts" @input="onInput" @error="inputError"></ecp-number-box>
```

**具体使用可参考样例**

git仓库：`git@git.ygsoft.com:ecp/tphone.git`
分支：`dev`
路径：`/doc/src/tabBar/mainPage/ecp-number-box`

## 组件详情

#### 属性
属性|类型|默认值|说明
-|-|-|-
value|String,Number|-|初始值
max|String,Number|-|最大值
min|String,Number|-|最小值
disabled|Boolean|false|是否禁用
required|Boolean|false|是否必填
chineseFormat|String|-|显示格式：`upper`中文大写，`lower`中文小写，`money`中文大写金额；该设置会使千分位设置失效
thousandSeparator|Boolean|false|是否显示千分位
mask|String|-|数字格式，如：`*#.##`，`###.###`，将直接截断超出部分
placeholder|String|请输入|占位符内容
showToast|Boolean|false|是否使用`uni.showToast`提示校验错误
format|Function|-|自定义格式化函数，组件传入`fmt, val`，`fmt`组件格式化后的值，`val`组件值，需要返回格式化后的字符串
comOpts|Object|-|传入`input`组件的参数，具体传入值与默认值见下文，

#### 传入`input`组件的参数
属性**具体说明**请参考：[uni-app官方input文档](https://uniapp.dcloud.io/component/input)

属性|默认值|说明
-|-|-
maxlength|-1|
password|-|
placeholder|-|`ecpNumberBox`组件属性`placeholder`会覆盖此属性
cursor-spacing|-|
focus|-|
confirm-type|-|
confirm-hold|-|
cursor|-|
selection-start|-|
selection-end|-|
adjust-position|-|
hold-keyboard|-|

#### 事件
事件|说明|回调变量
-|-|-
input|数据更新|`val`更新值
update:value|数据更新|`val`更新值
error|校验错误|`msg`错误信息