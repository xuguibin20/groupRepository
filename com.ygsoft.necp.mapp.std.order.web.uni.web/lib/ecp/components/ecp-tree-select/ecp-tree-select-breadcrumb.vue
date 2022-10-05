<template>
	<view class="breadcrumb" v-if="list.length || showHome">
		<scroll-view scroll-x :scroll-left="scrollLeft" class="breadcrumb-scroll" ref="scroll">
			<view class="breadcrumb-list">
				<view v-if="showHome" class="breadcrumb-item breadcrumb-home" @click="$emit('click')">
					<uni-icons type="home-filled" size="14" :color="list.length ? '#333' : '#32a7fc'"></uni-icons>
				</view>
				<template v-for="(v, k) in list">
					<template v-if="showDot && k === 1">
						<view :key="`dotarrow${k}`" class="breadcrumb-item breadcrumb-arrow">></view>
						<view :key="`dot${k}`" class="breadcrumb-item breadcrumb-dot">&bull;&bull;</view>
					</template>
					<view v-if="k || showHome" :key="`arrow${k}`" class="breadcrumb-item breadcrumb-arrow">></view>
					<view
						:key="`node${k}`"
						class="breadcrumb-item breadcrumb-node"
						:class="[k === list.length - 1 ? 'breadcrumb-cur' : '']"
						:id="`node${k}`"
						@click="$emit('click', v)"
					>
						{{ v.text }}
					</view>
				</template>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import uniIcons from '@/components/uni-icons/uni-icons.vue';

export default {
	components: {
		uniIcons
	},
	name: 'EcpTreeSelectBreadcrumb',
	props: {
		// 父节点列表
		value: Array,
		// 显示根节点
		showHome: Boolean
	},
	data() {
		return {
			scrollLeft: 0
		};
	},
	computed: {
		showDot() {
			return Array.isArray(this.value) && this.value.length > 3;
		},
		list() {
			if (!Array.isArray(this.value)) {
				return [];
			}
			if (this.value.length < 4) {
				return this.value;
			}
			return this.value.slice(0, 1).concat(this.value.slice(-2));
		}
	},
	watch: {
		value() {
			if (!this.list.length) {
				this.scrollLeft = 0;
				return;
			}
			this.$nextTick(function() {
				uni.createSelectorQuery()
					.in(this)
					.select(`#node${this.list.length - 1}`)
					.boundingClientRect()
					.select('.breadcrumb-scroll')
					.fields({
						rect: true,
						scrollOffset: true
					})
					.exec(([{ left: nodeLeft }, { left, scrollLeft }]) => {
						this.scrollLeft = nodeLeft + scrollLeft - left - 30;
					});
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.breadcrumb {
	margin-bottom: 5px;
	border-bottom: 1px solid #ccc;
	background-color: #fff;
}
.breadcrumb-list {
	display: flex;
	padding: 0 10px;
}
.breadcrumb-item {
	flex: none;
	padding: 0 5px;
	white-space: nowrap;
	font-size: 14px;
	line-height: 32px;
	height: 32px;
	color: #333;
}
.breadcrumb-dot {
	padding: 0;
}
.breadcrumb-cur {
	color: #32a7fc;
	border-bottom: 1px solid #32a7fc;
	height: 31px;
	line-height: 31px;
}
</style>
