<template>
    <el-row class="tac" style="height: 100%;overflow:hidden;">
        <ts-header
        :headerTitle="headerTitle" :preUrl="preUrl">
        </ts-header>
        <el-col :span="1" style="height:1px">
          <ts-portal-menu :option="option" defaultIcon="el-icon-menu"></ts-portal-menu>
        </el-col>
        <el-col :span="23" style="padding-right: 10px;padding-left: 15px;height: 100%; overflow-y: auto; margin-top: 42px;">
          <!-- <div style="margin-top: 10px; background-color: #fff;">
            <el-tabs v-model="selectFirst">
              <el-tab-pane label="待办事项" name="todo-task">
                <todo-task></todo-task>
              </el-tab-pane>
              <el-tab-pane label="已办事项" name="done-task">
                <done-task></done-task>
              </el-tab-pane>
            </el-tabs>
          </div> -->
        </el-col>
    </el-row>
</template>

<script>
  
  let Tswan = require('necp.tswan.components')
  let tsPortalMenu = Tswan.TsMenu.default
  let tsHeader = Tswan.TsHeader.default

  // import TFLOW from 'necp.tflow.components'
  // import 'necp.tflow.components/dist/tflow/css/tflow.css'
  import Vue from 'vue'
  // Vue.use(TFLOW)

  export default {
    components: {
      tsPortalMenu,
      tsHeader
    },
    data() {
        var model = {}
        model.option = {
          appId: 'b14bd2f894c2bd13e2d7c3aa9d14fc13',
          contextPath: '/orderweb',
          vipAddress: '/necp/mapp/order'
        }
        model.selectFirst = 'todo-task'
        model.headerTitle = "com.ygsoft.necp.mapp.std.order.web"
        model.preUrl = '/orderweb/necp/mapp/order'
        return model
    }
  }
</script>

<style scoped>
  .el-tabs__nav.is-top {
    padding-left: 20px;
  }
  .el-tabs__active-bar.is-top {
    left: 20px;
  }
  .el-tabs__nav-wrap::after {
    left: 10px;
  }
  .el-tabs__item.is-top {
    font-size: 18px;
    color: #333;
  }
  .el-tabs__item.is-top.is-active {
    font-weight: bold;
    color: #555 !important;
  }
</style>