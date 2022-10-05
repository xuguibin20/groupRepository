import Vue from 'vue'
import Router from 'vue-router'
import suitheight from 'suit.height'
import {TreeNodeEntityEditor} from 'necp.tswan.components'

Vue.use( Router )
const router = new Router({
//  mode: 'history',
  routes: [
 	{
      path: '*',
      name: '登录',
      component: () => import( /* webpackChunkName: "TSLogin" */'@/pages/login/login' )
    },
  	{
      path: '/index',
      name: 'com.ygsoft.necp.mapp.std.order.web',
      component: () => import('@/pages/index'),
    },
  	{
      path: '/dynamicview/index',
      component: () => import('necp.tswan.components/packages/dynamicview/pages/single'),
    },
  	{
      path: '/dynamicview/list',
      component: () => import('necp.tswan.components/packages/dynamicview/pages/list'),
    },
    {
      path: '/TreeEntity/editor',
      name: '',
      component: TreeNodeEntityEditor.editor
    },
    {
      path: '/TreeEntity/detail',
      name: '',
      component: TreeNodeEntityEditor.detail
  	}
	,{
	    path: '/pages/xzds',
	    name: '新增订单',
	    component: () => import( '@/pages/xzds/xzds' )
	}
	,{
	    path: '/pages/qxds',
	    name: '取消订单',
	    component: () => import( '@/pages/qxds/qxds' )
	}
	,{
	    path: '/pages/dsxq',
	    name: '订单详情',
	    component: () => import( '@/pages/dsxq/dsxq' )
	}
  ]
})

// 处理title
router.afterEach((to, from, next) => {
  document.title = to.query.t ? decodeURIComponent(to.query.t) : to.name 
  suitheight.doResize()
})

router.onError(error => {
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  const targetPath = router.history.pending.fullPath
  if (isChunkLoadFailed) {
    router.replace(targetPath)
  }
})

export default router