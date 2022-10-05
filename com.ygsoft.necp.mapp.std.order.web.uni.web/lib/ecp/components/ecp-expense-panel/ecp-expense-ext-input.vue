<template>
	<view>
		<input :style="option.style" class="input" type="text" :value="formatValue" :placeholder="option.placeholder || '请输入'" @focus="onFocus" @input="onInput" @blur="onBlur" placeholder-class="placeholder">
	</view>
</template>

<script>
	export default {
		props: {
			value: String,
			placeholder: {
				type: String,
				default: '请输入'
			},
			option: {
				type: Object,
				required: true,
				validator: opt => !['validator', 'format'].some(k => typeof opt[k] !== 'function')
			}
		},
		data() {
			return {
				inputValue: '',
				formatValue: ''
			}
		},
		methods: {
			onFocus(e) {
				this.formatValue = this.inputValue
				this.$emit('focus')
			},
			onInput(e) {
				let newVal = e.detail.value;
				let oldVal = this.formatValue;
				if (newVal === oldVal) {
					return;
				}
				if (!newVal) {
					this.formatValue = this.inputValu = newVal
					this.$emit('input', newVal)
					return;
				}
				this.formatValue = newVal;
				let err = this.option.validator(newVal)
				if (err) {
					uni.showToast({
						title: err,
						icon: 'none',
						position: 'center'
					});
					setTimeout(() => {
						this.formatValue = this.inputValue;
					}, 0);
				} else {
					this.inputValue = newVal;
					this.$emit('input', newVal)
				}
				return newVal
			},
			onBlur(e) {
				this.inputValue = e.target.value
				this.formatValue = this.option.format(this.inputValue)
				this.$emit('blur')
			}
		},
		created() {
			this.inputValue = this.value
			this.formatValue = this.option.format(this.value)
		}
	}
</script>

<style>
	.input {
		text-align: right;
		color: #333;
		font-size: 32rpx;
	}
	
	.placeholder {
		color: #999;
	}
</style>
