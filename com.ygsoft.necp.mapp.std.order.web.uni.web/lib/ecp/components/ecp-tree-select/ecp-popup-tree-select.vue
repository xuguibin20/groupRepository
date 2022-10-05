<template>
	<uni-popup type="bottom" ref="popup" @change="$emit('show', $event.show)">
		<view class="tree-select-wrap">
			<view class="popup-topbar">
				<uni-icons type="closeempty" size="12" color="#333" class="btn-close" @click="close"></uni-icons>
				<view class="popup-topbar-title">{{ title }}</view>
				<view class="btn-confirm" @click="confirm">{{ lang.confrim }}{{ multiple && seletedIds.length ? `(${seletedIds.length})` : '' }}</view>
			</view>
			<ecp-tree-select
				class="tree-select"
				:data="data"
				v-model="treeSelectValue"
				:lazyload="lazyload"
				:multiple="multiple"
				:readonly="readonly"
				:idKey="idKey"
				:labelKey="labelKey"
				:treeKey="treeKey"
				:pidKey="pidKey"
				:radius="radius"
			></ecp-tree-select>
		</view>
	</uni-popup>
</template>

<script>
import ecpTreeSelect from './ecp-tree-select.vue';
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import uniIcons from '@/components/uni-icons/uni-icons.vue';

const lang = {
	confrim: '完成'
};

export default {
	name: 'EcpPopupTreeSelect',
	mixins: [ecpTreeSelect],
	components: {
		ecpTreeSelect,
		uniPopup,
		uniIcons
	},
	props: {
		title: String
	},
	data() {
		return {
			lang,
			seletedIds: [],
			treeSelectValue: null
		};
	},
	computed: {
		selectValue() {
			if (this.multiple) {
				return this.seletedIds;
			}
			return this.seletedIds.length ? this.seletedIds[0] : null;
		}
	},
	methods: {
		open() {
			this.seletedIds.splice(0, this.seletedIds.length);
			if (this.multiple && Array.isArray(this.value)) {
				this.seletedIds.push(...this.value);
			}
			if (!this.multiple && this.value) {
				this.seletedIds.push(this.value);
			}
			this.treeSelectValue = this.multiple ? [...this.seletedIds] : this.value;
			this.$refs.popup.open();
		},
		close() {
			this.$refs.popup.close();
		},
		confirm() {
			this.$emit('input', this.selectValue);
			this.$emit('update:value', this.selectValue);
			this.$emit('change', this.selectValue);
			this.close();
		}
	},
	watch: {
		treeSelectValue(newVal) {
			this.seletedIds.splice(0, this.seletedIds.length);
			if (this.multiple) {
				this.seletedIds.push(...newVal);
			} else if (newVal) {
				this.seletedIds.push(newVal);
			}
		}
	}
};
</script>

<style scoped>
.tree-select-wrap {
	height: calc(100vh - var(--window-top) - var(--window-bottom));
	background-color: #fafafa;
}

.tree-select {
	height: 100%;
}

.popup-topbar {
	flex: none;
	display: flex;
	align-items: center;
	padding: 0 20px;
	border-bottom: 1px solid #f5f5f5;
}

.popup-topbar-title {
	flex: auto;
	font-size: 14px;
	color: #333;
	text-align: center;
	height: 32px;
	line-height: 32px;
	color: #;
}

.btn-confirm {
	color: #32a7fc;
	font-size: 14px;
}
</style>
