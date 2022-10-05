<template>
	<view>
		<ecp-expense-list :title="comOpts.title" :btn="comOpts.btn" @btn-click="addItem">
			<ecp-expense-collapse v-for="(item, i) in comData" :title="comOpts.item.title(item, i, comData)" :subTitle="comOpts.item.subTitle(item, i, comData)"
			 :amount="comOpts.item.amount(item, i, comData)" :swipeActionOpts="comOpts.item.swipeActionOpts(item, i, comData)" open @swipe-action-click="onActionClick(i, $event)"
			 @swipe-action-cancel="$emit('swipe-action-cancel', item, i, $event)" :key="i">
				<template v-slot:icon>
					<slot :item="item" :idx="i" :data="comData"></slot>
				</template>
				<ecp-expense-list-item v-for="(value, name, j) in item" :key="j" :title="name2metaData[name].label || name2metaData[name].caption || name2metaData[name].name"
				 :star="name2metaData[name].required" :arrow="name2metaData[name].arrow">
					<ecp-expense-ext-input :value="value" @input="onInput(item, name, $event)" @blur="onBlur(item, name)" v-if="comOpts.inputer[name]" :option="comOpts.inputer[name]" :placeholder="name2metaData[name].placeholder"></ecp-expense-ext-input>
					<template v-else>
						<input class="right-input" type="text" :value="value" :placeholder="name2metaData[name].placeholder" v-if="name2metaData[name].editType === 'text'" @input="onInput(item, name, $event)" placeholder-class="placeholder" @blur="onBlur(item, name)" />
						<picker v-if="name2metaData[name].uniPickerMode" :mode="name2metaData[name].uniPickerMode" :range="name2metaData[name].option.range"
						 :range-key="name2metaData[name].option['range-key']" :start="name2metaData[name].option.start" :end="name2metaData[name].option.end"
						 :fields="name2metaData[name].option.fields" :value="parseUniPickerValue(value, name)" @change="pickerChange(item, name, $event)"
						 @cancel="onBlur(item, name)">
							<view class="right-text" :class="{ placeholder: !value }">{{ value || name2metaData[name].placeholder }}</view>
						</picker>
						<view v-if="name2metaData[name].editType === 'region' || name2metaData[name].editType === 'editButton'" class="right-text" :class="{ placeholder: !value }" @click="open(item, name)">{{ value || name2metaData[name].placeholder }}</view>
					</template>
				</ecp-expense-list-item>
			</ecp-expense-collapse>
		</ecp-expense-list>
		<simple-address v-if="hasRegion" ref="simpleAddress" :animation="simpleAddressOpt.animation" :maskClick="simpleAddressOpt.maskClick" :maskBgColor="simpleAddressOpt.maskBgColor" :themeColor="simpleAddressOpt.themeColor" :cancelColor="simpleAddressOpt.cancelColor" :confirmColor="simpleAddressOpt.confirmColor" :pickerValueDefault="simpleAddressDefault" @onConfirm="regionChange" @onCancel="onBlur(simpleAddressData.item, simpleAddressData.name)"></simple-address>
		<ecp-popentity v-if="hasEditButton" ref="popentity" :value="popentity.multiple ? popentity.multiValue : popentity.value" :title="popentity.title" :data="popentity.data" :idField="popentity.idField" :textField="popentity.textField" :multiple="popentity.multiple" @input="editButtonChange"></ecp-popentity>
	</view>
</template>

<script>
	import ecpExpenseList from './ecp-expense-list.vue'
	import ecpExpenseListItem from './ecp-expense-list-item.vue'
	import ecpExpenseCollapse from './ecp-expense-collapse.vue'
	import simpleAddress from '../simple-address/simple-address.vue'
	import ecpPopentity from '../ecp-popentity/ecp-popentity.vue'
	import ecpExpenseExtInput from './ecp-expense-ext-input.vue'

	// 非法字符
	const filterChars = ['#', '$', '%', '^', '&', '*', '(', ')'];
	// editType 与 uniapp picker 组件 mode 对应关系
	const uniPickerModes = {
		datepicker: 'date',
		timepicker: 'time',
		comboBox: 'selector',
		// #ifndef MP-ALIPAY
		comboBoxMulti: 'multiSelector'
		// #endif
	};
	// simpleAddress 组件默认参数
	const simpleAddressOpt = {
		animation: true,
		maskClick: true,
		maskBgColor: 'rgba(0, 0, 0, 0.4)',
		cancelColor: '#888',
		confirmColor: '#007aff'
	};
	// popentity 组件默认参数
	const popentityOpt = {
		title: '',
		data: [],
		idField: 'id',
		textField: 'value',
		multiple: false,
		value: '',
		multiValue: []
	}

	export default {
		components: {
			ecpExpenseList,
			ecpExpenseListItem,
			ecpExpenseCollapse,
			simpleAddress,
			ecpPopentity,
			ecpExpenseExtInput
		},
		props: {
			// 数据模型
			value: {
				type: Array,
				required: true
			},
			/**
			 * @property {Array[Object]} metaData 元数据模型
			 * @property {String} metaData[].name 字段名称
			 * @property {String} metaData[].caption 字段显示名称
			 * @property {String} metaData[].editType 字段控件类型：text 输入框，datepicker 日期选择器，timepicker 时间选择器，comboBox 单列选择，comboBoxMulti 多列选择，region 地区选择，entity 通用实体选择
			 * @property {String} metaData[].dataType 字段值类型
			 * @property {Boolean} metaData[].required 字段是否必填
			 * @property {Boolean} metaData[].arrow 字段右侧是否显示箭头
			 * @property {Object} metaData[].option 字段组件参数，详情参考各组件
			 */	
			metaData: {
				type: Array,
				required: true
			},
			/**
			 * 组件参数
			 * @property {String} title 面板标题
			 * @property {String} btn 面板底部按钮内容
			 * @property {Object} item 项目参数
			 * @property {Function} item.title/item.subTitle/item.amount 项目标题/副标题/右侧显示内容，函数参数：item 当前项目数据，idx 当前项目在数据模型中的索引，data 数据模型，函数返回显示内容
			 * @property {Function} item.swipeActionOpts 设置当前项目 uni-app uni-swipe-action-item 组件参数，函数参数同上，函数返回组件参数对象或空值；返回值非空时，将不会触发默认操作，需要自行处理点击事件
			 * @property {Object} inputer 对特定字段使用自定义输入框组件
			 * @property {Object} inputer[name] name即字段名
			 * @property {Function} inputer[name].validator 校验输入值，返回错误信息，正确返回空值，函数参数：value 需要校验的输入值；函数返回错误信息或空值
			 * @property {Function} inputer[name].format 格式化输入值，每次失去焦点后调用，函数参数同上，函数返回格式化后的值
			 * @property {Object} inputer[name].style 输入框样式
			 */
			options: Object
		},
		data() {
			return {
				// 内部数据
				comData: [],
				// 是否有地区选择
				hasRegion: false,
				// 是否有实体选择
				hasEditButton: false,
				// 地区选择参数
				simpleAddressOpt: { ...simpleAddressOpt },
				// 地区选择默认值
				simpleAddressDefault: [0, 0, 0],
				// 地区选择对应项目及字段
				simpleAddressData: {
					item: null,
					name: ''
				},
				// 实体选择参数，对应项目及字段
				popentity: {
					...popentityOpt,
					item: null,
					name: ''
				}
			}
		},
		computed: {
			// 字段名称与元模型映射关系
			name2metaData() {
				let names = new Set()
				// 数据模型中出现的所有字段
				this.comData.forEach(v => Object.keys(v).forEach(k => names.add(k)));
				// 元数据模型参数中字段名称与元数据模型的映射
				let name2metaData = this.metaData.reduce((a, v) => {
					if (v.name) {
						// 将字段名称添加到字段名称集合中
						names.add(v.name)
						// 建立字段名称与元数据模型的映射关系
						a[v.name] = v
					}
					return a
				}, {});
				// 输出所有字段名称与元数据模型映射关系
				return [...names].reduce((a, k) => {
					// 字段默认元数据模型
					let metaData = {
						name: k,
						caption: k,
						editType: 'text',
						dataType: 'string',
						required: false,
						arrow: false,
						placeholder: '',
						option: {}
					}
					// 元数据模型参数中有此字段，将参数与默认合并
					if (name2metaData[k]) {
						Object.assign(metaData, name2metaData[k])
					}
					
					// 字段组件是picker
					if (uniPickerModes[metaData.editType]) {
						metaData.uniPickerMode = uniPickerModes[metaData.editType]
					}
					
					// 字段组件是文本，设置默认占位符
					if (metaData.editType === 'text' && !metaData.placeholder) {
						metaData.placeholder = '请输入'
					}

					// 字段组件是选择，设置默认占位符
					if ((uniPickerModes[metaData.editType] || ['region', 'editButton'].indexOf(metaData.editType) > -1) && !metaData
						.placeholder) {
						metaData.placeholder = '请选择'
					}
					
					// 字段组件是地区，设置标志位
					if (metaData.editType === 'region') {
						this.hasRegion = true
					}
					
					// 字段组件是实体选择，设置标志位
					if (metaData.editType === 'editButton') {
						this.hasEditButton = true
					}

					a[k] = metaData
					return a
				}, {})
			},
			// 组件参数
			comOpts() {
				// 默认参数
				let opts = {
					title: '费用',
					btn: '增加',
					/**
					 * @property {Object} inputer[name] 对某些元数据模型使用自定义输入框，属性名 name 就是字段名称
					 * @property {Function} inputer[name].validator	校验输入值，返回错误信息，正确返回空值
					 * @property {Function} inputer[name].format 格式化输入值，每次失去焦点后调用
					 * @property {Object} inputer[name].style 输入框样式
					 */
					inputer: {}
				}

				// 与传入的组件参数合并
				Object.assign(opts, this.options)
				
				// 项目参数与传入参数合并
				opts.item = Object.assign({
					/**
					 * 项目标题/副标题/右侧显示内容
					 * @param {Object} item 当前项目数据
					 * @param {Number} idx 当前项目在数据模型中的索引
					 * @param {Array[Object]} data 数据模型
					 * @return {String} 返回显示内容
					 */
					title: () => '明细',
					subTitle: () => '',
					amount: () => '',
					/**
					 * 返回当前项目 uni-app uni-swipe-action-item 组件参数，返回值非空时，将不会触发默认操作
					 * @param {Object} item 当前项目数据
					 * @param {Number} idx 当前项目在数据模型中的索引
					 * @param {Array[Object]} data 数据模型
					 * @return {Object|null} 组件参数或null
					 */
					swipeActionOpts: () => null
				}, this.options.item)
				
				console.log(opts.item)

				return opts
			}
		},
		methods: {
			// 初始相关数据
			init() {
				this.hasRegion = false
				this.hasEditButton = false
				this.comData.splice(0, this.comData.length, ...this.value.map(item => ({ ...item
				})))
			},
			// 添加项目
			addItem() {
				this.comData.push(this.metaData.reduce((a, v) => {
					a[v.name] = ''
					return a
				}, {}))
				this.emitData()
			},
			// 项目滑动按钮点击事件
			onActionClick(itemIdx, e) {
				let btnIdx = e.index
				let item = this.comData[itemIdx];
				if (!this.comOpts.item.swipeActionOpts(this.comData[itemIdx], itemIdx, this.comData)) {
					if (btnIdx === 0) {
						// 复制
						let item = this.comData[itemIdx]
						this.comData.push({
							...item
						})
					}
					if (btnIdx === 1) {
						// 删除
						this.comData.splice(itemIdx, 1)
					}
					this.emitData()
				}
				this.$emit('swipe-action-click', item, itemIdx, e)
			},
			// 输入框输入事件
			onInput(item, name, e) {
				// 自定义输入框直接更新数据
				if (this.comOpts.inputer[name]) {
					item[name] = e
					this.emitData()
					return;
				}
				let newVal = e.detail.value;
				let oldVal = item[name];
				if (newVal === oldVal) {
					return;
				}
				if (!newVal) {
					item[name] = newVal
					this.emitData()
					return;
				}
				item[name] = newVal;
				if (newVal.split('').some(v => filterChars.indexOf(v) >= 0)) {
					uni.showToast({
						title: '请不要输入特殊字符',
						icon: 'none',
						position: 'center'
					});
					setTimeout(() => {
						item[name] = oldVal;
					}, 0);
				} else {
					this.emitData()
				}
				return newVal
			},
			// 失去焦点并校验字段
			onBlur(item, name) {
				if (!item[name] && this.name2metaData[name].required) {
					uni.showToast({
						title: '当前字段不能为空',
						icon: 'none',
						position: 'center'
					});
				}
			},
			// 触发数据模型更新事件
			emitData() {
				this.$emit('input', [...this.comData].map(item => ({ ...item
				})))
			},
			/**
			 * 将字段值转换为picker组件值
			 * @param {String} value 字段值
			 * @param {String} name 字段名称
			 */
			parseUniPickerValue(value, name) {
				// 元数据模型
				let metaData = this.name2metaData[name]
				if (metaData.uniPickerMode === 'selector') {
					// 单选
					let idx = metaData.option.range.findIndex(v => typeof v === 'string' ? v === value : v[metaData.option['range-key']] ===
						value)
					return idx > -1 ? idx : 0
				}
				if (metaData.uniPickerMode === 'multiSelector') {
					// 多选
					value = value.split(',')
					return metaData.option.range.map((col, i) => {
						let idx = col.findIndex(v => typeof v === 'string' ? v === value[i] : v[metaData.option['range-key']] === value[
							i])
						return idx > -1 ? idx : 0
					})
				}
				return value
			},
			/**
			 * picker变动事件，更新相关字段
			 * @param {Object} item 项目数据
			 * @param {String} name 字段名称
			 * @param {Object} e picker变动事件对象
			 */
			pickerChange(item, name, e) {
				// 元数据模型
				let metaData = this.name2metaData[name]
				// picker组件值
				let value = e.detail.value
				if (metaData.uniPickerMode === 'selector') {
					// 单选
					value = metaData.option.range[value]
				}
				if (metaData.uniPickerMode === 'multiSelector') {
					// 多选
					value = metaData.option.range.map((col, i) => col[value[i]]).join(',')
				}
				if (item[name] !== value) {
					// 更新字段数据
					item[name] = value
					this.emitData()
				}
			},
			/**
			 * 调用相关组件
			 * @param {Object} item 项目数据
			 * @param {String} name 字段名称
			 */
			open(item, name) {
				// 组件类型
				let editType = this.name2metaData[name].editType
				// 组件类型与组件调用函数映射
				let methods = {
					region: this.openSimpleAddress,
					editButton: this.openPopentity
				};
				// 调用组件函数
				methods[editType](item, name)
			},
			/**
			 * 调用地址选择
			 * @param {Object} item 项目数据
			 * @param {String} name 字段名称
			 */
			openSimpleAddress(item, name) {
				// 绑定当前项目及字段
				Object.assign(this.simpleAddressData, {
					item,
					name
				})
				// 合并组件参数
				Object.assign(this.simpleAddressOpt, {...simpleAddressOpt}, this.name2metaData[name].option)
				if (item[name]) {
					// 字段值非空，根据字段值获取对应的初始值
					let { index } = this.$refs.simpleAddress.queryIndex(item[name].split('-'), 'label')
					this.simpleAddressDefault.splice(0, this.simpleAddressDefault.length, ...index)
				} else {
					// 字段值为空，组件值设置为初始值
					this.simpleAddressDefault.splice(0, this.simpleAddressDefault.length, ...Array(3).fill(0))
				}
				// 打开组件
				this.$refs.simpleAddress.open()
			},
			/**
			 * 调用通用实体选择
			 * @param {Object} item 项目数据
			 * @param {String} name 字段名称
			 */
			openPopentity(item, name) {
				// 合并组件相关参数及绑定当前项目及字段
				Object.assign(this.popentity, { ...popentityOpt }, this.name2metaData[name].option, { item, name })
				// 计算组件值
				let value = '', multiValue = [];
				if (item[name]) {
					let curVal = this.popentity.multiple ? item[name].split(',') : [item[name]];
					curVal.forEach(text => {
						let d = this.popentity.data.find(v => v[this.popentity.textField] === text)
						if (d) {
							multiValue.push(d[this.popentity.idField])
						}
					})
					
					if (multiValue.length && !this.popentity.multiple) {
						value = multiValue[0]
						multiValue = []
					}
				}
				this.popentity.value = value
				this.popentity.multiValue.splice(0, this.popentity.multiValue.length, ...multiValue)
				this.$nextTick(function(){
					this.$refs.popentity.show()
				})
			},
			// 地区变动更新字段值
			regionChange(e) {
				if (this.simpleAddressData.item[this.simpleAddressData.name] !== e.label) {
					this.simpleAddressData.item[this.simpleAddressData.name] = e.label
					this.emitData()
				}
			},
			// 通用实体变动更新字段值
			editButtonChange(value) {
				let {item, name, multiple, data, idField, textField} = this.popentity
				if (multiple) {
					value = value.map(v => {
						v = data.find(o => o[idField] === v)
						v = v ? v[textField] : ''
						return v
					}).filter(v => v).join(',')
				} else {
					value = data.find(v => v[idField] === value)
					value = value ? value[textField] : ''
				}
				if (item[name] !== value) {
					item[name] = value
					this.emitData()
				}
			},
			/**
			 * 校验项目字段，返回项目字段错误列表
			 * @return {Array[Object]} errMsgs 错误信息列表
			 * @property {Object} errMsgs[].item  当前项目
			 * @property {String} errMsgs[].name 项目字段
			 * @property {Number} errMsgs[].idx 项目在数据模型中的索引
			 * @property {String} errMsgs[].msg 错误信息
			 */
			validate() {
				let errMsgs = [];
				this.comData.forEach((item, idx) => {
					for (let name in item) {
						if (this.name2metaData[name].required && !item[name]) {
							errMsgs.push({
								item,
								name,
								idx,
								msg: '不能为空'
							})
						}
					}
				})
				return errMsgs;
			}
		},
		watch: {
			// 监听数据变动
			value: {
				handler() {
					this.init()
				},
				deep: true
			}
		},
		created() {
			this.init()
		}
	}
</script>

<style>
	.right-text {
		color: #333;
		font-size: 32rpx;
		text-align: right;
	}

	.right-input {
		text-align: right;
		color: #333;
		font-size: 32rpx;
	}

	.placeholder {
		color: #999;
	}
</style>
