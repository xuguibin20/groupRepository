import App from './App'

import Vue from 'vue'

import store from './store'
Vue.prototype.$store = store

Vue.config.productionTip = false

App.mpType = 'app'

// 流程组件
import tflow from './node_modules/necp.tflow.mobile.components/src/index.js'
import ApprovalTimeline from './node_modules/necp.tflow.mobile.components/packages/process-timeline-mobile/src/approval-timeline.vue';
import ApprovalTimelinePopover from './node_modules/necp.tflow.mobile.components/packages/process-timeline-mobile/src/approval-timeline-popover.vue';
Vue.use(tflow)
Vue.use(ApprovalTimeline)
Vue.use(ApprovalTimelinePopover)

import './src/assets/static/uni.css'
import './src/assets/css/xdeer.css'

Vue.prototype._getTsServerInfo = function () {
  return {
    application: {
      name: '/necp/mapp/order'
    }
  };
};

const app = new Vue({
    ...App
})
app.$mount()
