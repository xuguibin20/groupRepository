import uniBadge from "@/components/uni-badge/uni-badge.vue"
import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue'
import TodoTask from '../../../../node_modules/necp.tflow.mobile.components/packages/task-center/mobile/todo-task.vue'
import DoneTask from '../../../../node_modules/necp.tflow.mobile.components/packages/task-center/mobile/done-task.vue'

export default {
	data() {
		return {
			isTodoTask: true,
			loadData: true,
			total: 0,
			extVariables: [{
				variableName: 'summary',
				displayName: '摘要',
				extRegion: '1'
			}, 
			{
				variableName: 'summoney',
				displayName: '金额',
				extRegion: '2',
				dataType: 'number',
				scale: 2,
				prefix: '￥'
			}
		
			]
		}
	},
	components: {
		uniSearchBar,
		uniBadge,
		'todo-task': TodoTask,
		'done-task': DoneTask,
	},
	props: {},
	async mounted() {},

	onShow() {
		if (this.$refs.todoTask) this.$refs.todoTask.refesh()
	},
	onReachBottom() {
		//if (this.loadData) this.$refs.todoTask.$emit('loadNextPageData', true)
	},
	methods: {
		/**
		 * 页签点击事件
		 */
		onTabChange(event) {
			let target = event.target
			let viewId = target.id
			this.changeTabStyle(viewId)
		},

		/**
		 * 页签风格切换事件.
		 * @param {Object} viewId
		 */
		changeTabStyle(viewId) {
			if (viewId.includes('todo')) this.isTodoTask = true
			else this.isTodoTask = false
		},

		needLoadData(val) {
			console.log('需要加载数据吗?' + val)
			this.loadData = val
		},

		/**
		 * 获取待办任务数据回调.
		 * @param {Object} count
		 */
		getTodoTaskTotal(count) {
			if (count) this.total = count
		}
	}
}
