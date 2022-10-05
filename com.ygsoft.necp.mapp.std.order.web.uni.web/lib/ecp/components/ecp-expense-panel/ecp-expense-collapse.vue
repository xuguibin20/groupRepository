<template>
	<view class="ecp-expense-collapse" :class="{ 'ecp-expense-collapse--hide': !isOpen }">
		<uni-swipe-action>
			<uni-swipe-action-item :disabled="swipeOpts.disabled" :autoClose="swipeOpts.autoClose" :show="swipeOpts.show"
			 :options="swipeOpts.options" @click="$emit('swipe-action-click', $event)" @change="$emit('swipe-action-change', $event)">
				<view class="ecp-expense-collapse__header" @click="toggleOpen">
					<view class="ecp-expense-collapse__header-icon" v-show="titleIcon">
						<slot name="icon"></slot>
					</view>
					<view class="ecp-expense-collapse__header-content">
						<view class="ecp-expense-collapse__header-title">{{ title }}</view>
						<view class="ecp-expense-collapse__header-subtitle" v-if="subTitle">{{ subTitle }}</view>
					</view>
					<view class="ecp-expense-collapse__header-amount" v-if="amount">{{ amount }}</view>
					<uni-icons class="ecp-expense-collapse__header-arrow" :type="isOpen ? 'arrowup' : 'arrowdown'" :size="iconSize" color="#ccc"></uni-icons>
				</view>
			</uni-swipe-action-item>
		</uni-swipe-action>
		<view class="ecp-expense-collapse__content">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	export default {
		components: {
			uniIcons,
			uniSwipeAction,
			uniSwipeActionItem
		},
		props: {
			title: {
				type: String,
				default: '明细'
			},
			subTitle: String,
			amount: {
				type: [Number, String]
			},
			open: Boolean,
			size: {
				type: [String, Number],
				default: 16
			},
			swipeActionOpts: Object
		},
		data() {
			return {
				iconSize: 16,
				titleIcon: false,
				scrollLeft: 0,
				isOpen: false
			}
		},
		computed: {
			swipeOpts() {
				let prop = this.swipeActionOpts
				let opts = {
					show: false,
					autoClose: true,
					disabled: false,
					options: [{
						text: '复制',
						style: {
							backgroundColor: '#1e87f0'
						}
					}, {
						text: '删除',
						style: {
							backgroundColor: '#f65c09'
						}
					}]
				};

				['show', 'autoClose', 'disabled'].filter(k => prop && prop.hasOwnProperty(k) && prop[k] !== opts[k]).forEach(k => opts[k] = prop[k]);
				
				if (prop && Array.isArray(prop.options)) {
					opts.options = prop.options.filter(v => v.text)
				}

				return opts
			}
		},
		methods: {
			toggleOpen() {
				this.isOpen = !this.isOpen
				this.$emit(this.isOpen ? 'open' : 'close')
				this.$emit('update:open', this.isOpen)
			}
		},
		watch: {
			open(v) {
				this.isOpen = v
				this.$emit(this.isOpen ? 'open' : 'close')
			}
		},
		created() {
			this.iconSize = uni.getSystemInfoSync().safeArea.width / 375 * this.size
			this.isOpen = this.open
		},
		mounted() {
			this.$nextTick(() => {
				if (this.$slots.icon) {
					this.titleIcon = true
				}
			})
		}
	}
</script>

<style>
	.ecp-expense-collapse {
		overflow: hidden;
	}

	.ecp-expense-collapse--hide {
		height: 120rpx;
	}

	.ecp-expense-collapse+.ecp-expense-collapse {
		border-top: 1px solid #E5E5E5;
	}

	.ecp-expense-collapse__header {
		flex: 1;
		height: 120rpx;
		display: flex;
		padding: 0 40rpx;
		align-items: center;
		background-color: #f1fbff;
	}

	.ecp-expense-collapse--hide .ecp-expense-collapse__header {
		background-color: #fff;
	}

	.ecp-expense-collapse__header-icon,
	.ecp-expense-collapse__header-arrow {
		flex: none;
	}

	.ecp-expense-collapse__header-icon {
		display: flex;
		margin-right: 20rpx;
	}

	.ecp-expense-collapse__header-arrow {
		margin-left: 20rpx;
	}

	.ecp-expense-collapse__header-content {
		flex: auto;
		display: flex;
		flex-direction: column;
	}

	.ecp-expense-collapse__header-title {
		font-size: 32rpx;
		color: #333;
	}

	.ecp-expense-collapse__header-subtitle {
		font-size: 28rpx;
		color: #525252;
	}

	.ecp-expense-collapse__header-amount {
		flex: none;
		color: #fd861e;
		font-size: 32rpx;
	}

	.ecp-expense-collapse__content {
		border-top: 1px solid #E5E5E5;
	}
</style>
