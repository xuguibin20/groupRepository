<template>
	<view class="tree-select">
		<select-breadcrumb class="breadcrumb" :value="pNodes" @click="onClick" :show-home="showHome" />
		<uni-load-more v-if="loading" status="loading"></uni-load-more>
		<view class="node-list" v-else>
			<view class="list-item" :class="[v.selected ? 'item-selected' : '', (v.disabled || readonly) && !v.children.length && (!lazyload || v.isLeaf) ? 'item-disabled' : '']" v-for="(v, k) in list" :key="k" @click="onClick(v)">
				<view class="item-title">{{ v.text }}</view>
				<view class="item-act">
					<uni-icons v-if="v.loading" type="spinner-cycle" class="item-icon item-loading" size="20" color="#ccc"></uni-icons>
					<template v-else>
						<uni-icons v-if="v.children.length || lazyload && !v.isLeaf" class="item-icon item-arrow" type="arrowright" size="16" color="#ccc"></uni-icons>
						<template v-else>
							<uni-icons v-if="multiple" :type="v.selected ? 'checkbox-filled' : 'circle'" class="item-icon item-checkbox" size="24" :color="v.selected ? ((v.disabled || readonly) && !v.children.length && (!lazyload || v.isLeaf) ?'#ccc' : '#32a7fc') : '#ccc'"></uni-icons>
							<uni-icons v-if="!multiple && v.selected" class="item-icon item-radio" type="checkmarkempty" size="24" :color="(v.disabled || readonly) && !v.children.length && (!lazyload || v.isLeaf) ? '#ccc' : '#32a7fc'"></uni-icons>
						</template>
					</template>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// 组件
	import selectBreadcrumb from './ecp-tree-select-breadcrumb.vue'
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
	
	// lodash
	import loFromPairs from 'lodash/fromPairs'
	import loPick from 'lodash/pick'
	import loXor from 'lodash/xor'

	// 节点属性名称默认值
	const defaultProps = {
		labelKey: 'text',
		treeKey(v) {
			return v || this._idKey
		},
		radius(v) {
			return v > 0 && Number.isInteger(v) ? v : 0
		}
	}

	export default {
		name: 'EcpTreeSelect',
		components: {
			selectBreadcrumb,
			uniIcons,
			uniLoadMore
		},
		props: {
			// 主键
			idKey: String,
			// 标签
			labelKey: String,
			// 编码
			treeKey: String,
			// 父建，父建与圆角值不能全为空
			pidKey: String,
			// 圆角值，用于划分编码层级，父建与圆角值不能全为空
			radius: Number,
			// 只读
			readonly: Boolean,
			// 多选
			multiple: Boolean,
			// 懒加载函数，也表明是否采取懒加载方式
			lazyload: Function,
			// 节点列表
			data: Array,
			// 选中节点
			value: [String, Number, Array]
		},
		data() {
			return {
				// 节点列表
				nodeList: [],
				// 当前子树，null表示当前为根
				curNode: null,
				// 选中节点id
				selectedIds: [],
				// 初始加载
				loading: false
			}
		},
		computed: {
			// 节点属性名称合法化
			...loFromPairs(['idKey', 'labelKey', 'treeKey', 'pidKey', 'radius'].map(k => {
				// 默认返回
				let func = function() {
					return this[k] || k.slice(0, -3)
				}
				if (typeof defaultProps[k] === 'function') {
					func = function() {
						return defaultProps[k].call(this, this[k])
					}
				} else if (Object.hasOwnProperty.call(defaultProps, k)) {
					func = function() {
						return this[k] || defaultProps[k]
					}
				}
				return [`_${k}`, func]
			})),
			// id映射
			id2Node() {
				return loFromPairs(this.nodeList.map(node => [node.id, node]))
			},
			// 编码映射
			treeCode2Node() {
				if (!this._radius) {
					return {}
				}
				return loFromPairs(this.nodeList.map(node => [node.treeCode, node]))
			},
			// 当前子树的父节点列表，包含当前子树
			pNodes() {
				// 无当前子树节点
				return this.curNode ? this.getPNodes(this.curNode).concat(this.curNode) : []
			},
			// 无父节点的节点列表
			roots() {
				return this.nodeList.filter(node => !node.pNode)
			},
			// 当前节点列表
			list() {
				return this.curNode ? this.curNode.children : this.roots
			},
			// 导航栏是否显示home图标
			showHome() {
				if (this.roots.length < 2) {
					// 无多个根节点，不显示
					return false
				}
				// 存在一个根节点，可能有子节点的，就要显示home图标
				return this.roots.some(
					node =>
						// 有子节点
						node.children.length ||
						// 或者有懒加载
						this.lazyload &&
						// 且不是叶子
						!node.isLeaf
				)
			}
		},
		methods: {
			// 初始化数据
			async init() {
				// 清空数据
				this.nodeList.splice(0, this.nodeList.length)
				this.curNode = null
				// 初始化组件选中节点id
				this.initValue()
				// 添加初始节点
				this.addNodes(this.data)
				if (!this.nodeList.length && this.lazyload) {
					// 无初始数据，异步请求数据
					await this.getCNodes()
				}
				if (this.list.length !== 1) {
					return
				}
				// 若当前列表仅有一个根节点
				const node = this.list[0]
				if (!node.children.length && !node.isLeaf && this.lazyload) {
					await this.getCNodes(node)
				}
				if (node.children.length) {
					this.curNode = node
				}
			},
			/**
			 * 添加节点
			 * @param {Object[]} nodes 节点数组
			 */
			addNodes(nodes) {
				if (!Array.isArray(nodes) || !nodes.length) {
					return []
				}
				// 初始化节点
				let treeNodes = nodes.map(this.initNode)
				// 向列表添加节点
				this.nodeList.push(...treeNodes)
				// 建立节点父子关系
				treeNodes.map(this.initTree)
				return treeNodes
			},
			/**
			 * 初始化节点
			 * @param {Object} node 节点数据
			 * @return 返回格式化后的节点
			 */
			initNode(node) {
				// 当前节点的父键
				let pid = this._radius ?
					(
						// 有圆角值
						node[this._treeKey].length > this._radius ?
						// 编码长度大于圆角值，有父节点
						node[this._treeKey].slice(0, -this._radius) :
						// 无父节点
						null
					) :
					// 无圆角值，直接返回父键
					node[this._pidKey]
				
				// 构造节点
				const treeNode = {
					id: node[this._idKey],
					text: node[this._labelKey],
					pid,
					pNode: null,
					isLeaf: node.isLeaf,
					disabled: node.disabled,
					selected: false,
					loading: false,
					children: [],
					data: node
				}
				if (this._radius) {
					treeNode.treeCode = node[this._treeKey]
				}
				return treeNode
			},
			/**
			 * 初始化节点父子节点
			 * @param {Object} node 节点
			 */
			initTree(node) {
				// 映射关系
				const id2Node = this[this._radius ? 'treeCode2Node' : 'id2Node']
				if (node.pid && id2Node[node.pid]) {
					// 当前节点有父节点
					node.pNode = id2Node[node.pid]
					// 父节点的子节点列表存入当前节点
					node.pNode.children.push(node)
				}
			},
			/**
			 * 初始化选中节点 
			 */
			initValue() {
				this.selectedIds.splice(0, this.selectedIds.length)
				if (!this.value) {
					this.syncValue()
					return
				}
				if (this.multiple && Array.isArray(this.value)) {
					this.selectedIds.push(...this.value)
					return
				}
				if (Array.isArray(this.value)) {
					this.syncValue()
					return
				}
				this.selectedIds = [this.value]
			},
			/**
			 * 根据组件值触发选中节点变更事件
			 */
			syncValue() {
				let value = [...this.selectedIds]
				if (!this.multiple) {
					value = this.selectedIds.length ? this.selectedIds[0] : null
				}
				if (
					this.multiple && (
						!Array.isArray(this.value) ||
						loXor(value, this.value).length
					) ||
					!this.multiple && this.value !== value
				) {
					
					this.$emit('input', value)
					this.$emit('update:value', value)
					this.$emit('change', value)
				}
			},
			/**
			 * 获取父节点列表
			 * @param {Object} node 节点
			 */
			getPNodes(node) {
				// 有父节点，递归返回父节点，无返回空数组
				return node.pNode ?
					this.getPNodes(node.pNode).concat(node.pNode) :
					[]
			},
			/**
			 * 节点点击事件
			 * @param {Object} node 节点
			 */
			async onClick(node) {
				if (!node) {
					// 无节点表明返回根节点
					this.curNode = null
					return
				}
				if (node.children.length) {
					this.curNode = node
					return
				}
				if (node.loading) {
					return
				}
				if (this.lazyload && !node.isLeaf) {
					await this.getCNodes(node)
					this.onClick(node)
					return
				}
				if (node.disabled || this.readonly) {
					return
				}
				let idx = this.selectedIds.indexOf(node.id)
				let id2nodeKey = this._radius ? 'treeCode' : 'id'
				node.selected = !~idx
				if (this.multiple) {
					if (node.selected) {
						this.selectedIds.push(node.id)
					} else {
						this.selectedIds.splice(idx, 1)
					}
					return
				}
				this.selectedIds.splice(0, this.selectedIds.length).map(id => {
					this.id2Node[id].selected = false
				})
				if (node.selected) {
					this.selectedIds.push(node.id)
				}
			},
			/**
			 * 异步获取及添加子节点
			 * @param {Object|null} node 节点
			 */
			async getCNodes(node) {
				if (node && (node.children.length || node.isLeaf) || !this.lazyload) {
					return []
				}
				if (node) {
					node.loading = true
				} else {
					this.loading = true
				}
				const nodes = await new Promise(res => {
					this.lazyload(node && node.data || null, res)
				}).catch(err => console.error(err))
				if (node) {
					node.loading = false
				} else {
					this.loading = false
				}
				if (!Array.isArray(nodes) || !nodes.length) {
					if (node) {
						node.isLeaf = true
						node.selected = ~this.selectedIds.indexOf(node.id)
					}
					return []
				}
				return this.addNodes(nodes)
			}
		},
		watch: {
			value() {
				this.initValue()
			},
			selectedIds() {
				this.syncValue()
			},
			list(newList) {
				newList.forEach(node => {
					node.selected = ~this.selectedIds.indexOf(node.id) && !node.children.length && (!this.lazyload || node.isLeaf)
				})
			},
			...loFromPairs(['idKey', 'labelKey', 'treeKey', 'pidKey', 'radius', 'data', 'multiple'].map(k => [k, function() {
				this.init()
			}]))
		},
		created() {
			this.init()
		}
	}
</script>

<style lang="scss" scoped>
	.tree-select {
		background-color: #fafafa;
		display: flex;
		flex-direction: column;
	}
	
	.breadcrumb {
		flex: none;
	}
	
	.node-list {
		flex: auto;
		overflow: hidden;
		background-color: #fff;
	}
	
	.list-item {
		display: flex;
		padding-left: 20px;
		padding-bottom: 2px;
		overflow: hidden;
		height: 44px;
		align-items: center;
		
		& + .list-item {
			border-top: 1px solid #f5f5f5;
		}
	}
	
	.item-title {
		flex: auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 16px;
		color: #333;
		
		.item-selected & {
			color: #32a7fc;
		}
		
		.item-disabled & {
			color: #999;
		}
	}
	
	.item-act {
		padding-left: 20px;
		flex: none;
		display: flex;
		align-items: center;
	}
	
	.item-icon {
		margin-right: 20px;
	}
	
	.item-arrow {
		margin-right: 13px;
	}
</style>
