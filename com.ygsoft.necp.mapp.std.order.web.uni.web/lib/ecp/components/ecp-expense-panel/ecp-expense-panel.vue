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

	// ????????????
	const filterChars = ['#', '$', '%', '^', '&', '*', '(', ')'];
	// editType ??? uniapp picker ?????? mode ????????????
	const uniPickerModes = {
		datepicker: 'date',
		timepicker: 'time',
		comboBox: 'selector',
		// #ifndef MP-ALIPAY
		comboBoxMulti: 'multiSelector'
		// #endif
	};
	// simpleAddress ??????????????????
	const simpleAddressOpt = {
		animation: true,
		maskClick: true,
		maskBgColor: 'rgba(0, 0, 0, 0.4)',
		cancelColor: '#888',
		confirmColor: '#007aff'
	};
	// popentity ??????????????????
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
			// ????????????
			value: {
				type: Array,
				required: true
			},
			/**
			 * @property {Array[Object]} metaData ???????????????
			 * @property {String} metaData[].name ????????????
			 * @property {String} metaData[].caption ??????????????????
			 * @property {String} metaData[].editType ?????????????????????text ????????????datepicker ??????????????????timepicker ??????????????????comboBox ???????????????comboBoxMulti ???????????????region ???????????????entity ??????????????????
			 * @property {String} metaData[].dataType ???????????????
			 * @property {Boolean} metaData[].required ??????????????????
			 * @property {Boolean} metaData[].arrow ??????????????????????????????
			 * @property {Object} metaData[].option ??????????????????????????????????????????
			 */	
			metaData: {
				type: Array,
				required: true
			},
			/**
			 * ????????????
			 * @property {String} title ????????????
			 * @property {String} btn ????????????????????????
			 * @property {Object} item ????????????
			 * @property {Function} item.title/item.subTitle/item.amount ????????????/?????????/????????????????????????????????????item ?????????????????????idx ??????????????????????????????????????????data ???????????????????????????????????????
			 * @property {Function} item.swipeActionOpts ?????????????????? uni-app uni-swipe-action-item ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
			 * @property {Object} inputer ?????????????????????????????????????????????
			 * @property {Object} inputer[name] name????????????
			 * @property {Function} inputer[name].validator ???????????????????????????????????????????????????????????????????????????value ????????????????????????????????????????????????????????????
			 * @property {Function} inputer[name].format ??????????????????????????????????????????????????????????????????????????????????????????????????????
			 * @property {Object} inputer[name].style ???????????????
			 */
			options: Object
		},
		data() {
			return {
				// ????????????
				comData: [],
				// ?????????????????????
				hasRegion: false,
				// ?????????????????????
				hasEditButton: false,
				// ??????????????????
				simpleAddressOpt: { ...simpleAddressOpt },
				// ?????????????????????
				simpleAddressDefault: [0, 0, 0],
				// ?????????????????????????????????
				simpleAddressData: {
					item: null,
					name: ''
				},
				// ??????????????????????????????????????????
				popentity: {
					...popentityOpt,
					item: null,
					name: ''
				}
			}
		},
		computed: {
			// ????????????????????????????????????
			name2metaData() {
				let names = new Set()
				// ????????????????????????????????????
				this.comData.forEach(v => Object.keys(v).forEach(k => names.add(k)));
				// ???????????????????????????????????????????????????????????????
				let name2metaData = this.metaData.reduce((a, v) => {
					if (v.name) {
						// ?????????????????????????????????????????????
						names.add(v.name)
						// ???????????????????????????????????????????????????
						a[v.name] = v
					}
					return a
				}, {});
				// ??????????????????????????????????????????????????????
				return [...names].reduce((a, k) => {
					// ???????????????????????????
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
					// ???????????????????????????????????????????????????????????????
					if (name2metaData[k]) {
						Object.assign(metaData, name2metaData[k])
					}
					
					// ???????????????picker
					if (uniPickerModes[metaData.editType]) {
						metaData.uniPickerMode = uniPickerModes[metaData.editType]
					}
					
					// ?????????????????????????????????????????????
					if (metaData.editType === 'text' && !metaData.placeholder) {
						metaData.placeholder = '?????????'
					}

					// ?????????????????????????????????????????????
					if ((uniPickerModes[metaData.editType] || ['region', 'editButton'].indexOf(metaData.editType) > -1) && !metaData
						.placeholder) {
						metaData.placeholder = '?????????'
					}
					
					// ???????????????????????????????????????
					if (metaData.editType === 'region') {
						this.hasRegion = true
					}
					
					// ?????????????????????????????????????????????
					if (metaData.editType === 'editButton') {
						this.hasEditButton = true
					}

					a[k] = metaData
					return a
				}, {})
			},
			// ????????????
			comOpts() {
				// ????????????
				let opts = {
					title: '??????',
					btn: '??????',
					/**
					 * @property {Object} inputer[name] ???????????????????????????????????????????????????????????? name ??????????????????
					 * @property {Function} inputer[name].validator	?????????????????????????????????????????????????????????
					 * @property {Function} inputer[name].format ????????????????????????????????????????????????
					 * @property {Object} inputer[name].style ???????????????
					 */
					inputer: {}
				}

				// ??????????????????????????????
				Object.assign(opts, this.options)
				
				// ?????????????????????????????????
				opts.item = Object.assign({
					/**
					 * ????????????/?????????/??????????????????
					 * @param {Object} item ??????????????????
					 * @param {Number} idx ???????????????????????????????????????
					 * @param {Array[Object]} data ????????????
					 * @return {String} ??????????????????
					 */
					title: () => '??????',
					subTitle: () => '',
					amount: () => '',
					/**
					 * ?????????????????? uni-app uni-swipe-action-item ???????????????????????????????????????????????????????????????
					 * @param {Object} item ??????????????????
					 * @param {Number} idx ???????????????????????????????????????
					 * @param {Array[Object]} data ????????????
					 * @return {Object|null} ???????????????null
					 */
					swipeActionOpts: () => null
				}, this.options.item)
				
				console.log(opts.item)

				return opts
			}
		},
		methods: {
			// ??????????????????
			init() {
				this.hasRegion = false
				this.hasEditButton = false
				this.comData.splice(0, this.comData.length, ...this.value.map(item => ({ ...item
				})))
			},
			// ????????????
			addItem() {
				this.comData.push(this.metaData.reduce((a, v) => {
					a[v.name] = ''
					return a
				}, {}))
				this.emitData()
			},
			// ??????????????????????????????
			onActionClick(itemIdx, e) {
				let btnIdx = e.index
				let item = this.comData[itemIdx];
				if (!this.comOpts.item.swipeActionOpts(this.comData[itemIdx], itemIdx, this.comData)) {
					if (btnIdx === 0) {
						// ??????
						let item = this.comData[itemIdx]
						this.comData.push({
							...item
						})
					}
					if (btnIdx === 1) {
						// ??????
						this.comData.splice(itemIdx, 1)
					}
					this.emitData()
				}
				this.$emit('swipe-action-click', item, itemIdx, e)
			},
			// ?????????????????????
			onInput(item, name, e) {
				// ????????????????????????????????????
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
						title: '???????????????????????????',
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
			// ???????????????????????????
			onBlur(item, name) {
				if (!item[name] && this.name2metaData[name].required) {
					uni.showToast({
						title: '????????????????????????',
						icon: 'none',
						position: 'center'
					});
				}
			},
			// ??????????????????????????????
			emitData() {
				this.$emit('input', [...this.comData].map(item => ({ ...item
				})))
			},
			/**
			 * ?????????????????????picker?????????
			 * @param {String} value ?????????
			 * @param {String} name ????????????
			 */
			parseUniPickerValue(value, name) {
				// ???????????????
				let metaData = this.name2metaData[name]
				if (metaData.uniPickerMode === 'selector') {
					// ??????
					let idx = metaData.option.range.findIndex(v => typeof v === 'string' ? v === value : v[metaData.option['range-key']] ===
						value)
					return idx > -1 ? idx : 0
				}
				if (metaData.uniPickerMode === 'multiSelector') {
					// ??????
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
			 * picker?????????????????????????????????
			 * @param {Object} item ????????????
			 * @param {String} name ????????????
			 * @param {Object} e picker??????????????????
			 */
			pickerChange(item, name, e) {
				// ???????????????
				let metaData = this.name2metaData[name]
				// picker?????????
				let value = e.detail.value
				if (metaData.uniPickerMode === 'selector') {
					// ??????
					value = metaData.option.range[value]
				}
				if (metaData.uniPickerMode === 'multiSelector') {
					// ??????
					value = metaData.option.range.map((col, i) => col[value[i]]).join(',')
				}
				if (item[name] !== value) {
					// ??????????????????
					item[name] = value
					this.emitData()
				}
			},
			/**
			 * ??????????????????
			 * @param {Object} item ????????????
			 * @param {String} name ????????????
			 */
			open(item, name) {
				// ????????????
				let editType = this.name2metaData[name].editType
				// ???????????????????????????????????????
				let methods = {
					region: this.openSimpleAddress,
					editButton: this.openPopentity
				};
				// ??????????????????
				methods[editType](item, name)
			},
			/**
			 * ??????????????????
			 * @param {Object} item ????????????
			 * @param {String} name ????????????
			 */
			openSimpleAddress(item, name) {
				// ???????????????????????????
				Object.assign(this.simpleAddressData, {
					item,
					name
				})
				// ??????????????????
				Object.assign(this.simpleAddressOpt, {...simpleAddressOpt}, this.name2metaData[name].option)
				if (item[name]) {
					// ?????????????????????????????????????????????????????????
					let { index } = this.$refs.simpleAddress.queryIndex(item[name].split('-'), 'label')
					this.simpleAddressDefault.splice(0, this.simpleAddressDefault.length, ...index)
				} else {
					// ?????????????????????????????????????????????
					this.simpleAddressDefault.splice(0, this.simpleAddressDefault.length, ...Array(3).fill(0))
				}
				// ????????????
				this.$refs.simpleAddress.open()
			},
			/**
			 * ????????????????????????
			 * @param {Object} item ????????????
			 * @param {String} name ????????????
			 */
			openPopentity(item, name) {
				// ??????????????????????????????????????????????????????
				Object.assign(this.popentity, { ...popentityOpt }, this.name2metaData[name].option, { item, name })
				// ???????????????
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
			// ???????????????????????????
			regionChange(e) {
				if (this.simpleAddressData.item[this.simpleAddressData.name] !== e.label) {
					this.simpleAddressData.item[this.simpleAddressData.name] = e.label
					this.emitData()
				}
			},
			// ?????????????????????????????????
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
			 * ???????????????????????????????????????????????????
			 * @return {Array[Object]} errMsgs ??????????????????
			 * @property {Object} errMsgs[].item  ????????????
			 * @property {String} errMsgs[].name ????????????
			 * @property {Number} errMsgs[].idx ?????????????????????????????????
			 * @property {String} errMsgs[].msg ????????????
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
								msg: '????????????'
							})
						}
					}
				})
				return errMsgs;
			}
		},
		watch: {
			// ??????????????????
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
