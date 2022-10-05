<template>
	<input
	 class="input"
	 type="text"
	 :maxlength="comOpts.maxlength || -1"
	 :password="comOpts.password || undefined"
	 :placeholder="placeholder || comOpts.placeholder || '请输入'"
	 :placeholder-style="comOpts.placeholderStyle || undefined"
	 :placeholder-class="'placeholder ' + (comOpts.placeholderClass || '')"
	 :disabled="disabled"
	 :cursor-spacing="comOpts.cursorSpacing || undefined"
	 :focus="comOpts.focus || undefined"
	 :confirm-type="comOpts.confirmType || undefined"
	 :confirm-hold="comOpts.confirmHold || undefined"
	 :cursor="comOpts.cursor || undefined"
	 :selection-start="comOpts.selectionStart || undefined"
	 :selection-end="comOpts.selectionEnd || undefined"
	 :adjust-position="comOpts.adjustPosition || undefined"
	 :hold-keyboard="comOpts.holdKeyBoard || undefined"
	 :value="fmtValue"
	 @input="onInput"
	 @blur="onBlur"
	 @focus="onFocus"
	/>
</template>

<script>
	import ecpUtils from '@/lib/ecp/scripts/ecp.utils.js'

	const lang = {
		format: '请输入数字',
		required: '不能为空',
		max: '不能大于 {0}',
		min: '不能小于 {0}',
		intDigits: '整数最多 {0} 位',
		noDec: '仅能输入整数',
		decDigits: '小数最多 {0} 位',
		nagative: '负'
	}

	export default {
		props: {
			// 初始值，最大、最小值
			...['value', 'max', 'min'].reduce((a, k) => {
				a[k] = {
					type: [String, Number],
					validator: v => ecpUtils.isNumber(+v),
					default: ''
				}
				return a
			}, {}),
			// 是否禁用
			disabled: Boolean,
			// 是否必填
			required: Boolean,
			// 是否格式化中文大写，中文小写，大写金额，使千分位参数无效
			chineseFormat: {
				type: String,
				validator: v => !v || ['upper', 'lower', 'money'].indexOf(v) > -1
			},
			// 是否格式化千分位
			thousandSeparator: Boolean,
			// 数字格式
			mask: {
				type: String,
				validator: v => !v || /^([^-*,#.]+)?([*]?-?#{1,3})(,###)*(\.#+)?$/.test(v)
			},
			// 占位符
			placeholder: {
				type: String,
				default: '请输入'
			},
			// 是否显示提示和提示位置
			showToast: {
				type: [Boolean, String],
				validator: v => !v || typeof v === 'boolean' || ['center', 'top', 'bottom'].indexOf(v) > -1
			},
			// 自定义格式化函数，调用时将传入fmt已通过组件格式化后的数字，val实际值
			format: Function,
			// 传入input组件的参数
			comOpts: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				// 实际值
				comValue: '',
				// 格式化后的值，并且与input绑定
				fmtValue: '',
				// 记录上一次合法的值，用于重置错误的实际值
				validValue: '',
				// 是否处于焦点状态
				isFocus: false
			}
		},
		computed: {
			// 将max和min参数改为字符串，返回计算变量comMax和comMin
			...['max', 'min'].reduce((a, k) => {
				let name = 'com' + k.slice(0, 1).toUpperCase() + k.slice(1)
				a[name] = function() {
					return this.parseNum(this[k])
				}
				return a
			}, {}),
			// 整数部分最大位数，无限制返回null
			intDigits() {
				return (
					// 有mask参数
					this.mask &&
					// mask参数不限制整数部分位数
					this.mask.indexOf('*') < 0 &&
					// mask参数整数部分位数
					this.charTime(this.mask.split('.')[0], '#') ||
					null
				)
			},
			// 小数部分最大位数，无限制返回null
			decDigits() {
				if (!this.mask) {
					// 无mask参数
					return null
				}
				// 返回小数位数
				return this.charTime(this.mask.split('.')[1], '#') || 0
			},
			// 提示位置，也用于判断是否需要提示
			toastPosition() {
				return this.showToast ? (typeof this.showToast === 'string' ? this.showToast : 'center') : ''
			}
		},
		created() {
			// 初始化相关变量
			this.validValue = this.comValue = this.parseValue(this.value)
			this.fmtValue = this.formatValue(this.comValue)
		},
		methods: {
			// 将参数转为字符串
			parseNum(v) {
				return ecpUtils.isNotEmpty(v) ? (v + '').trim() : ''
			},

			// 将参数转为合法数字或空
			parseValue(v) {
				let value = this.parseNum(v);

				if (!ecpUtils.isNotEmpty(value)) {
					return '';
				}

				// 去掉符号，取出整数和小数部分
				let [int, dec] = value.replace('-', '').split('.')
				
				int = int || '0'
				
				if (int && !dec && int === '0') {
					// 如果是0，不用处理符号，直接返回
					return int
				}

				if (ecpUtils.isNotEmpty(this.intDigits) && int.length > this.intDigits) {
					// 整数有最大位数限制，且整数位数超过最大限制
					// 直接从后截取整数部分
					int = int.slice(-this.intDigits)

					// 触发错误提示
					this.emitError(ecpUtils.format(lang.intDigits, this.intDigits + ''))
				}

				if (dec && ecpUtils.isNotEmpty(this.decDigits) && dec.length > this.decDigits) {
					// 小数有最大位数限制，且小数位数超过最大限制
					// 直接从前截取小数部分
					dec = dec.slice(0, this.decDigits)

					// 触发错误提示，根据是否保留小数决定错误信息
					this.emitError(ecpUtils.format(this.decDigits ? lang.decDigits : lang.noDec, this.decDigits + ''))
				}

				// 符号
				let negative = value.indexOf('-') > -1

				return (negative ? '-' : '') + (dec ? `${int}.${dec}` : int)
			},
			
			// 格式化数字
			formatValue(v) {
				v = this.parseValue(v)

				// 是否有自定义格式化函数
				const format = typeof this.format === 'function' ? this.format : r => r

				if (!v) {
					return format(v, v);
				}

				// 根据参数调用对应的中文数字格式化函数
				if (this.chineseFormat) {
					let methods = {
						upper: 'transferNumToChUpper',
						lower: 'transferNumToChLower',
						money: 'transferNumToMoney'
					};
					let nagative = v.indexOf('-') > -1
					return format((nagative ? lang.nagative : '') + ecpUtils[methods[this.chineseFormat]](v.replace('-', '').replace(/0+$/, '')), v)
				}

				let [int, dec] = v.split('.')

				// 若有小数位数限制，补足小数位
				if (ecpUtils.isNotEmpty(this.decDigits) && (!dec || dec.length < this.decDigits)) {
					dec = dec || '';
					for (let i = dec.length; i < this.decDigits; i++) {
						dec += '0';
					}
				}

				if (this.thousandSeparator) {
					int = ecpUtils.formatNumber(int, 0)
				}

				return format(dec ? `${int}.${dec}` : int, v)
			},

			/**
			 * 字符串中出现指定字符的次数
			 * @param v 必选项，数字字符串
			 * @param c 必选项，单个字符
			 * @return res 获得字符c在v中出现的次数
			 */
			charTime: function(v, c) {

				if (!ecpUtils.isNotEmpty(v) || v.length === 0) return "";
				var res = 0;
				for (var i = 0, j = v.length; i < j; i++) {
					if (v.charAt(i) === c) {
						res++;
					}
				}
				(res === 0) && (res = "");
				return res;
			},

			// 获取焦点时，将输入改为实际值
			onFocus() {
				this.isFocus = true
				this.fmtValue = this.comValue
			},

			// 失去焦点时，校验数字，格式化输入
			onBlur(e) {
				let value = e.detail.value;

				if (value === '-') {
					// 仅有个负号，值改为0
					value = 0
				}

				value = this.parseValue(value)

				let isValid = true;

				if (this.required && !value) {
					// 必填，值为空，提示错误信息
					this.emitError(lang.required)
					isValid = false;
				}

				if (value && ecpUtils.isNotEmpty(this.comMax) && +value > +this.comMax) {
					// 有最大值，当前值大于最大值，提示错误信息
					this.emitError(ecpUtils.format(lang.max, this.comMax));
					isValid = false;
				}

				if (value && ecpUtils.isNotEmpty(this.comMin) && +value < +this.comMin) {
					// 有最小值，当前值小于最小值，提示错误信息
					this.emitError(ecpUtils.format(lang.min, this.comMin));
					isValid = false;
				}

				if (isValid) {
					// 校验通过，更新实际值和合法值
					this.validValue = this.comValue = value
				} else {
					// 校验不通过，实际值还原回上一次合法值
					this.comValue = this.validValue
				}

				// 格式化显示值
				this.fmtValue = this.formatValue(this.comValue)

				this.isFocus = false
			},

			// 输入时校验输入值
			onInput(e) {
				let value = e.detail.value
				let oldVal = this.fmtValue
				this.fmtValue = value

				if (!value) {
					// 值为空，直接返回
					if (value !== oldVal) {
						// 实际值不为空，更新实际值
						this.comValue = ''
					}
					return
				}

				if ((new RegExp(`^-(0${this.decDigits !== 0 ? '\\.?' : ''})?$`)).test(value)) {
					// 输入为“-”，“-0”，以及可以有小数时的“-0.”，不校验
					return;
				}
				
				if (this.decDigits === 0 && value.indexOf('.') > -1) {
					// 仅整数，不能输入“.”
					this.resetInput(oldVal)
					this.emitError(lang.noDec);
					return;
				}

				if (!/^-?((0|[1-9]\d*)(\.\d*)?)?$/.test(value)) {
					// 通不过校验，提示错误信息，重置为原值
					this.resetInput(oldVal);
					this.emitError(lang.format);
					return;
				}

				let [int, dec] = value.replace('-', '').split('.');
				let [validInt, validDec] = this.parseValue(value).replace('-', '').split('.')

				if (int !== validInt || dec && dec !== validDec) {
					// 整数部分或小数部分位数超出限制
					this.resetInput(oldVal)
					return;
				}

				this.comValue = value
			},
			
			// 重置绑定变量
			resetInput(v) {
				this.$nextTick(function() {
					this.fmtValue = v
				})
			},

			// 触发错误事件及显示提示信息，title为提示信息
			emitError(title) {
				if (this.toastPosition) {
					// 需要提示
					uni.showToast({
						title,
						icon: 'none',
						position: this.toastPosition
					})
				}

				this.$emit('error', title)
			}
		},
		watch: {
			// 根据实际值变动触发组件更新事件
			comValue(v) {
				if (v !== this.value + '') {
					this.$emit('input', v)
					this.$emit('change', v)
					this.$emit('update:value', v)
				}
			},
			// 根据传参变动，更新组件数据
			...['value', 'chineseFormat', 'mask', 'thousandSeparator', 'format', 'comMin', 'comMax'].reduce((a, k) => {
				a[k] = function(v) {
					if (!this.isFocus) {
						// 仅在失去焦点状态下更新
						if (['value', 'mask'].indexOf(k) > -1) {
							// 初始值或数字格式变化，更新实际值和合法值
							this.validValue = this.comValue = this.parseValue(k === 'value' ? v : this.value)
						}
						if (this.value && ['comMin', 'comMax'].indexOf(k) > -1 && ecpUtils.isNumber(+v)) {
							if (k === 'comMin' && +this.value < +v || k === 'comMax' && +this.value > +v) {
								this.validValue = this.comValue = ''
							}
						}
						// 更新显示值
						this.fmtValue = this.formatValue(this.comValue)
					}
				}
				return a
			}, {}),
		}
	}
</script>

<style>
	.input {
		font-size: 32rpx;
		color: #333;
	}

	.placeholder {
		color: #999;
	}
</style>
