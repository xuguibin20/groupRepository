<template>
	<view class="ecp-sidebar" :class="{'ecp-sidebar-show': show, 'ecp-sidebar-touch': touch, 'ecp-sidebar-right': right}">
		<!-- 页面主体开始 -->
		<view class="ecp-sidebar-body" :style="{transform: bodyTransform}">
			<slot></slot>
		</view>
		<!-- 触控打开监听区域 -->
		<view class="ecp-sidebar-touch-area" v-show="touchShow" @touchstart="touchstart" @touchmove.stop="touchmove" @touchend="touchend" @touchcancel="touchcancel"></view>
		<!-- 侧边栏遮罩层 -->
		<view class="ecp-sidebar-mask" :style="{opacity: maskOpacity, visibility: translateX > 0 ? 'visible' : 'hidden' }" @tap="show2translateX(false)" @touchstart="touchstart" @touchmove.stop="touchmove" @touchend="touchend" @touchcancel="touchcancel"></view>
		<!-- 侧边栏内容 -->
		<view class="ecp-sidebar-content" :class="{}" :style="{width: `${sidebarWidth}px`, transform: conTransform, visibility: translateX > 0 ? 'visible' : 'hidden'}" @touchstart="touchstart" @touchmove.stop="touchmove" @touchend="touchend" @touchcancel="touchcancel">
			<slot name="sidebar"></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'ecp-sidebar',
		props: {
			// 展开状态
			show: Boolean,
			// 侧边栏宽度
			sidebarWidth: {
				type: [Number, String],
				default: 200
			},
			// 侧边栏在右侧
			right: Boolean,
			// 侧边栏显示方式：浮动，推动
			push: Boolean,
			// 手势打开
			touchShow: Boolean,
			// 手势关闭
			touchHide: Boolean
		},
		data() {
			return {
				// 打开程度，用于手势控制
				translateX: 0,
				// 手势进行中
				touch: false,
				// 手势控制上次横向位置，用于计算打开程度
				lastPageX: 0,
				// 手势控制当前横向位置
				pageX: 0
			};
		},
		computed: {
			// 页面主体偏移量
			bodyTransform() {
				// 无偏移或侧边栏浮动，主体不偏移
				if (!this.translateX || !this.push) {
					return 'translateX(0px)'
				}
				// 侧边栏在右侧，主体向左偏移
				if (this.right) {
					return `translateX(-${this.translateX}px)`
				}
				// 侧边栏在左侧，主体向右偏移
				return `translate(${this.translateX}px)`
			},
			// 侧边栏偏移量
			conTransform() {
				// 按照百分比偏移
				let percent = (1 - this.maskOpacity) * 100;
				return `translateX(${percent && !this.right ? '-' : ''}${percent}%)`
			},
			maskOpacity() {
				// 遮罩层透明度
				return this.translateX / this.sidebarWidth
			},
			touchOffset() {
				// 触控偏移量，用于控制打开程度
				return this.pageX - this.lastPageX
			}
		},
		watch: {
			// 监控是否显示，处理相关变量
			show(v) {
				this.show2translateX(v);
			},
			// 根据触控偏移量控制打开程度
			touchOffset(v) {
				// 无偏移
				if (!v) {
					return;
				}
				// 侧边栏位置
				if (this.right) {
					this.translateX -= v
				} else {
					this.translateX += v
				}
				// 控制偏移量上下限
				if (this.translateX > this.sidebarWidth) {
					this.translateX = this.sidebarWidth
				}
				if (this.translateX < 0) {
					this.translateX = 0
				}
			},
			touch(v) {
				// 触控过程控制下拉刷新
				this.setRef(!v)
			}
		},
		methods: {
			/**
			 * 根据输入设置相关变量，控制侧边栏显示及触发相关事件
			 * @param {Boolean} show 是否显示
			 */
			show2translateX(show) {
				if (show && this.translateX !== this.sidebarWidth) {
					this.translateX = this.sidebarWidth
					this.$emit('hide')
				}
				if (!show && this.translateX !== 0) {
					this.translateX = 0
					this.$emit('open')
				}
				if (this.show !== show) {
					this.$emit('update:show', show)
				}
				// 设置下拉刷新
				this.setRef(show)
			},
			touchstart(e) {
				// 手势过程中
				if (this.touch) {
					return;
				}
				// 触控点不是一个
				if (e.touches.length !== 1) {
					return;
				}
				// 关闭状态下不使用手势打开
				if (!this.show && !this.touchShow) {
					return;
				}
				// 打开状态下不使用手势关闭
				if (this.show && !this.touchHide) {
					return;
				}
				this.touch = true
				this.lastPageX = this.pageX = e.touches[0].pageX
			},
			touchmove(e) {
				// 不在手势过程中
				if (!this.touch) {
					return;
				}
				this.lastPageX = this.pageX
				this.pageX = e.changedTouches[0].pageX
			},
			touchend(e) {
				// 不在手势过程中
				if (!this.touch) {
					return;
				}
				this.lastPageX = this.pageX
				this.pageX = e.changedTouches[0].pageX
				this.touch = false
				this.$nextTick(() => {
					// 仅1/3就可以打开
					if (!this.show) {
						this.show2translateX(3 * this.translateX >= this.sidebarWidth)
						return
					}
					// 仅1/3就可以关闭
					this.show2translateX(1.5 * this.translateX > this.sidebarWidth)
				})
			},
			touchcancel() {
				this.touch = false
				this.show2translateX(this.show)
			},
			// 控制下拉刷新，目前仅H5，支付宝和app支持控制
			setRef(v) {
				// H5通过事件修饰符stop控制下拉刷新
				// #ifdef MP-ALIPAY
				my.setCanPullDown({
				  canPullDown: v
				})
				// #endif
				// #ifdef APP-PLUS
				const pages = getCurrentPages();  
				const page = pages[pages.length - 1];  
				const currentWebview = page.$getAppWebview();
				currentWebview.setStyle({  
				  pullToRefresh: {  
				    support: v,  
				    style: plus.os.name === 'Android' ? 'circle' : 'default'  
				  }  
				}); 
				// #endif
			}
		},
		created() {
			// 初始化侧边栏显示
			if (this.show && this.translateX !== this.sidebarWidth) {
				this.translateX = this.sidebarWidth
			}
		}
	}
</script>

<style src="./ecp-sidebar.css"></style>