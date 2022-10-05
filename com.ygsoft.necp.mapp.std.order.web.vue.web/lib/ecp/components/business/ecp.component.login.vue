<template>
  <el-form
    id="ecpLogin"
    ref="form"
    size="small"
    :label-width="showtitle ? labelwidth : '0px'"
  >
    <el-form-item
      v-for="(item,index) in form"
      :key="index"
      :label="showtitle ? item.label : ''"
    >
      <el-input
        v-model="item.value"
        :placeholder="item.label"
        :prefix-icon="!showtitle ? item.icon : ''"
        :show-password="item.showpassword"
        clearable
      ></el-input>
    </el-form-item>
    <el-form-item
      v-if="organization"
      :label="showtitle ? organizationlabel : ''"
    >
      <el-cascader
        placeholder="- - 请选择部门 - -"
        style="width:100%;"
        v-model="value"
        :options="options"
        :props="{ expandTrigger: 'hover', value: 'dh',label: 'mc', children:'children'}"
        @change="handleChange"
      ></el-cascader>
    </el-form-item>
    <el-form-item style="text-align: left" label=""
      ><el-checkbox v-model="checked">记住密码</el-checkbox></el-form-item
    >
    <el-button
      type="primary"
      size="small"
      style="width: 100%;"
      @click="onSubmit"
      >登录</el-button
    >
  </el-form>
</template>

<script>
import {
  logintools
} from '../../scripts/4alogintools'
import des from 'ecp.des'
import {
  portaltools
} from '../../scripts/portaltools'
  import NRS from 'ecp.service'
  import json from './json.json'
  export default {
    name: 'ecpLogin',
    props: {
      showtitle: {
        // 类型 entitySelect/treeSelect/popEntity 树表/树/表
        default: true,
        type: Boolean
      }, // 是否显示标题
      form: [Array, Object], // 表单数组
      labelwidth: String, // 标题宽度
      active: String, // 后台接口地址
      path: String, // 请求成功跳转地址
      organizationlabel: String, //组织名称
      organization: {
        // 类型 entitySelect/treeSelect/popEntity 树表/树/表
        default: true,
        type: Boolean
      }, //是否显示组织
      organizationkey: String, // 组织key
      remberkey: String // 记住密码key
    },
    data() {
      return {
        value: [],
        options: [],
        checked: true
      }
    },
    mounted() {
      this.options = this.mapTreeData(json)
    },
    methods: {
      mapTreeData(data) {
        let list = []
        data.map(val => {
          if (!val.pdwdh) {
            list.push(val)
          }
        })
        return this.mapData(data, list)
      },
      mapData(data, list) {
        list.map(val => {
          val.children = this.mapChildren(data, val.dh)
          if (val.children.length > 0) {
            this.mapData(data, val.children)
          } else {
            delete val.children
          }
        })
        return list
      },
      mapChildren(data, dh) {
        let children = []
        data.map(val => {
          if (dh == val.pdwdh) {
            children.push(val)
          }
        })
        return children
      },
      handleChange(value) {
        console.log(value)
      },
      async onSubmit() {
        let form = this.form
        let params = {}
        params[this.remberkey] = this.checked
        for (let i = 0; i < form.length; i++) {
          if (form[i].reg && !form[i].reg.test(form[i].value)) {
            this.$notify.error({
              title: '错误',
              message: form[i].tips
            })
            return
          }
          params[form[i].key] = form[i].value
        }
        if (this.organization) {
          params[this.organizationkey] = this.value[this.value.length - 1]
        }
        // let res = await NRS.doPost(this.active, [this.$route.query.typeGid])
        // if (res) {
        //   if (this.path) {
        //     this.$router.replace(this.path)
        //   }
        // } else {
        //   this.$notify.error({
        //     title: '错误',
        //     message: '请求失败'
        //   })
        // }
        this.btnLoginbtnLogin()
      },
      btnLoginbtnLogin () {
        var me = this
        // 检查用户名和密码的输入格式是否正确,若为false则return
        me.userName = this.form[0]['value'];
        me.passWord = this.form[1]['value'];
        logintools.checkUserLogin(this.userName, this.passWord, {}, function (res) {
          me.loginStatus = false
          if (res.data.error === '') {
            // 登录后记录最后一次登录成功的用户名
            me.remember(me.userName)
            // var tokenId = Cookies.get('ecpDataContext.tokenId')
            // window.location.href = res.data.url
            // ecpService.doPost('/marketsale/necp/mapp/4a/thirdlogin/login', {
            //   'jcls': 'com.ygsoft.necp.mapp.security.integrate.service.domain.model.bo.ThirdLoginConfigInfoBO',
            //   'systemId': 'ecp', // 固定值
            //   'ip': 'http://gris.ygsoft.com', // 管控ip+端口
            //   'token': tokenId // tokenid
            // }
            // )
            me.$router.push('/index')
          } else {
            me.$message({
              type: 'warning',
              message: res.data.error,
              duration: 1000
            })
          }
        })
      },
      btnLogout () {
        var me = this
        portaltools.logout(function () {
          me.$message({
            type: 'success',
            message: '退出成功',
            duration: 1000
          })
          me.$router.push('/login')
        })
      },
      // 记住用户名.
      remember () {
        const self = this
        // 判断复选框是否被勾选 勾选则调用配置cookie方法
        if (self.checked === true) {
          console.log('checked == true')
          // 传入账号名，和保存天数2个参数
          self.setCookie(des.doEncrypt(self.userName), 7)
        } else {
          self.clearCookie()
        }
      },
      // 设置cookie
      setCookie (uName, exdays) {
        var exdate = new Date() // 获取时间
        exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays) // 保存的天数
        // 字符串拼接cookie
        window.document.cookie = 'userName' + '=' + uName + ';path=/;expires=' + exdate.toGMTString()
      },
      // 读取cookie
      getCookie () {
        if (document.cookie.length > 0) {
          var arr = document.cookie.split('; ') // 这里显示的格式需要切割一下自己可输出看下
          for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i].split('=') // 再次切割
            // 判断查找相对应的值
            if (arr2[0] === 'userName') {
              this.userName = des.doDecrypt(arr2[1]) // 保存到保存数据的地方
              // 如果username不为空则勾选记住用户名
              if (this.userName) {
                this.checked = true
              }
            }
          }
        }
      },
      // 清除cookie
      clearCookie: function () {
        this.setCookie('', -1) // 修改2值都为空，天数为负1天就好了
      }
    },
    watch: {}
  }
</script>

<style lang="less">
  #ecpselect {
    .el-button + .el-button {
      margin-left: 0px;
    }
  }
  .el-cascader-node__prefix {
    position: absolute;
    left: 10px;
    top: 10px;
  }
  .el-cascader-node__postfix {
    position: relative;
    right: 0;
  }
</style>
