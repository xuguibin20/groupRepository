<template>
  <div
    class="ecpSidebar"
    :id="id"
    :class="!isCollapse ? '' : 'sider-active'"
    :style="{
      background:getStyle('backgroundColor'),
      border:getStyle('siderBorder'),
      width:getStyle('width'),
      opacity:getStyle('opacity')
    }"
    @mouseleave="closeSider"
    @mouseenter="openSider"
  >
    <div class="Sidebar-menu" v-if="showBtn">
      <i v-if="isCollapse == false && flag == 0" @click="flag = 2"
        ><img src="../../../../src/assets/image/pin1.png" alt=""
      /></i>
      <i
        v-if="isCollapse == false && (flag == 1 || flag == 2)"
        @click="flag = 0"
        ><img src="../../../../src/assets/image/pin2.png" alt=""
      /></i>
      <i v-if="isCollapse == true"
        ><img src="../../../../src/assets/image/i-bars.png" alt=""
      /></i>
    </div>
    <div v-if="isCollapse && showSearch" class="Sidebar-menu">
      <i style="font-size:14px;" class="el-icon-search"></i>
    </div>
    <div v-if="!isCollapse && showSearch" class="Sidebar-Search-icon">
      <i class="el-icon-search"></i>
      <el-select
        v-model="value"
        @change="changeval"
        @blur="changblur"
        @focus="changfocus"
        filterable
        clearable
        placeholder="搜索..."
        popper-class="menu-select"
      >
        <el-option
          :style="{
            background:getStyle('backgroundColor'),
          }"
          v-for="(item,index) in options"
          :label="item[lable]"
          :key="item[lable]"
          :value="index"
          :disabled="item.path == ''"
        >
        </el-option>
      </el-select>
    </div>
    <el-menu
      class="ecp-menu"
      :default-active="defaultactive"
      :collapse-transition="transition"
      :background-color="getStyle('backgroundColor')"
      :text-color="getStyle('color')"
      :active-text-color="getStyle('color')"
      unique-opened
      :collapse="isCollapse"
      @select="selectmenu"
      :style="{
        border:getStyle('nodeBorder')
      }"
    >
      <template v-for="(items, index) in list">
        <el-menu-item
          v-if="!items.children"
          :index="`${index}`"
          :key="`${index}`"
        >
          <i
            v-if="items.icontype != 'svg' && items.icon"
            class="element-icons"
            :class="items.icon"
            :style="{
                fontSize:getStyle('imgSize'),
                color:getStyle('imgColor'),
                paddingTop:getStyle('imgPaddingTop'),
                paddingLeft:getStyle('imgPaddingLeft'),
                paddingRight:getStyle('imgPaddingRight'),
                paddingBottom:getStyle('imgPaddingBottom'),
                marginTop:getStyle('imgMarginTop'),
                marginRight:getStyle('imgMarginRight'),
                marginBottom:getStyle('imgMarginBottom'),
                marginLeft:getStyle('imgMarginLeft'),
                width:getStyle('imgWidth')
              }"
          ></i>
          <svg
            v-if="items.icontype == 'svg' && items.icon"
            :style="{
                      fill:getStyle('imgColor', '#fff'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth', '25px'),
                      height:getStyle('imgWidth', '25px')
                    }"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            v-html="items.icon"
          ></svg>
          <span
            slot="title"
            :style="{
                fontSize:getStyle('fontsize'),
                marginLeft: items.icon != '' ? '4px' : ''
            }"
            >{{ items[lable] }}</span
          >
        </el-menu-item>

        <el-submenu
          popper-class="hiddenpopper"
          v-else
          :index="`${index}`"
          :key="`${index}`"
        >
          <template slot="title">
            <i
              v-if="items.icontype != 'svg' && items.icon"
              class="element-icons"
              :class="items.icon"
              :style="{
                fontSize:getStyle('imgSize'),
                color:getStyle('imgColor'),
                paddingTop:getStyle('imgPaddingTop'),
                paddingLeft:getStyle('imgPaddingLeft'),
                paddingRight:getStyle('imgPaddingRight'),
                paddingBottom:getStyle('imgPaddingBottom'),
                marginTop:getStyle('imgMarginTop'),
                marginRight:getStyle('imgMarginRight'),
                marginBottom:getStyle('imgMarginBottom'),
                marginLeft:getStyle('imgMarginLeft'),
                width:getStyle('imgWidth')
              }"
            ></i>
            <svg
              v-if="items.icontype == 'svg' && items.icon"
              :style="{
                      fill:getStyle('imgColor', '#fff'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth'),
                      height:getStyle('imgWidth', '25px')
                    }"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              v-html="items.icon"
            ></svg>
            <span
              slot="title"
              :style="{
              fontSize:getStyle('fontsize'),
              marginLeft: items.icon != '' ? '4px' : ''
            }"
              >{{ items[lable] }}</span
            >
          </template>

          <template v-for="(item, inde) in items.children">
            <el-menu-item
              v-if="!item.children"
              :index="`${index}-${inde}`"
              :key="`${index}-${inde}`"
            >
              <i
                v-if="item.icontype != 'svg' && item.icon"
                class="element-icons"
                :class="item.icon"
                :style="{
                  fontSize:getStyle('imgSize'),
                  color:getStyle('imgColor'),
                  paddingTop:getStyle('imgPaddingTop'),
                  paddingLeft:getStyle('imgPaddingLeft'),
                  paddingRight:getStyle('imgPaddingRight'),
                  paddingBottom:getStyle('imgPaddingBottom'),
                  marginTop:getStyle('imgMarginTop'),
                  marginRight:getStyle('imgMarginRight'),
                  marginBottom:getStyle('imgMarginBottom'),
                  marginLeft:getStyle('imgMarginLeft'),
                  width:getStyle('imgWidth')
                }"
              ></i>
              <svg
                v-if="item.icontype == 'svg' && item.icon"
                :style="{
                      fill:getStyle('imgColor', '#fff'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth','25px'),
                      height:getStyle('imgWidth','25px')
                    }"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                v-html="item.icon"
              ></svg>
              <span
                slot="title"
                :style="{
                fontSize:getStyle('fontsize'),
                marginLeft: item.icon != '' ? '4px' : ''
              }"
                >{{ item[lable] }}</span
              >
            </el-menu-item>
            <el-submenu
              v-if="item.children"
              :index="`${index}-${inde}`"
              :key="`${index}-${inde}`"
            >
              <span
                slot="title"
                :style="{
                fontSize:getStyle('fontsize'),
              }"
                ><b
                  v-if="item.icontype != 'svg' && item.icon"
                  style="margin-right:5px; color:#909399"
                  :style="{
                    fontSize:getStyle('imgSize'),
                    color:getStyle('imgColor'),
                    paddingTop:getStyle('imgPaddingTop'),
                    paddingLeft:getStyle('imgPaddingLeft'),
                    paddingRight:getStyle('imgPaddingRight'),
                    paddingBottom:getStyle('imgPaddingBottom'),
                    marginTop:getStyle('imgMarginTop'),
                    marginRight:getStyle('imgMarginRight'),
                    marginBottom:getStyle('imgMarginBottom'),
                    marginLeft:getStyle('imgMarginLeft'),
                    width:getStyle('imgWidth')
                  }"
                  class="element-icons"
                  :class="item.icon"
                ></b>
                <svg
                  v-if="item.icontype == 'svg' && item.icon"
                  :style="{
                      fill:getStyle('imgColor', '#fff'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth','25px'),
                      height:getStyle('imgWidth','25px')
                    }"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  v-html="item.icon"
                ></svg>
                {{ item[lable] }}</span
              >
              <el-menu-item
                v-for="(ite, ind) in item.children"
                :index="`${index}-${inde}-${ind}`"
                :key="`${index}-${inde}-${ind}`"
                :style="{
                    fontSize:getStyle('fontsize'),
                  }"
              >
                <i
                  v-if="ite.icontype != 'svg' && ite.icon"
                  style="margin-right:5px;"
                  :style="{
                      fontSize:getStyle('imgSize'),
                      color:getStyle('imgColor'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth')
                    }"
                  class="element-icons"
                  :class="ite.icon"
                ></i>
                <svg
                  v-if="ite.icontype == 'svg' && ite.icon"
                  :style="{
                      fill:getStyle('imgColor', '#fff'),
                      paddingTop:getStyle('imgPaddingTop'),
                      paddingLeft:getStyle('imgPaddingLeft'),
                      paddingRight:getStyle('imgPaddingRight'),
                      paddingBottom:getStyle('imgPaddingBottom'),
                      marginTop:getStyle('imgMarginTop'),
                      marginRight:getStyle('imgMarginRight'),
                      marginBottom:getStyle('imgMarginBottom'),
                      marginLeft:getStyle('imgMarginLeft'),
                      width:getStyle('imgWidth','25px'),
                      height:getStyle('imgWidth','25px')
                    }"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  v-html="ite.icon"
                ></svg>
                <span
                  v-if="ite.icontype == 'svg' && ite.icon"
                  :style="{width:ite.icon != '' ? '4px' : '', display:'inline-block'}"
                >
                </span>
                {{ ite[lable] }}
              </el-menu-item>
            </el-submenu>
          </template>
        </el-submenu>
      </template>
    </el-menu>
  </div>
</template>
<script>
  export default {
    // options:{
    //   id: 3, id
    //   parent: '1', 父级id
    //   text: '1-1', lable
    //   path: 'https://www.baidu.com', 跳转路劲  必须以http开头或者https开头
    //   icontype:"font", 'font'图标，'svg'图标
    //   icon: 'el-icon-menu', 图标内容
    //   jumptype:1, 0 路由跳转，1
    // }
    props: {
      id: String,
      showSearch: {
        default: true, // true 显示 false不显示
        type: Boolean
      },
      ssearch: {
        default: true,
        type: Boolean
      },
      // 固定按钮
      showBtn: {
        default: true, // true 显示 false不显示
        type: Boolean
      },
      sbtn: {
        default: true,
        type: Boolean
      },
      // styleOption: Object,
      soption: Object,
      parentvalue: String, // 判断父节点的值
      lable: String, // 需要展示的字段
      parentkey: String, // 标识上一级的字段
      idkey: String, // 当前的唯一标识的字段
      filterkey: String, // 需要过滤的字段
      options: Array, // 菜单数据
      mrefresh: Number
    },
    data() {
      return {
        defaultactive: null,
        value: '',
        isCollapse: false,
        flag: 0, // 0 钉住，1鼠标移入，2鼠标移除
        list: [],
        transition: false,
        style: {
          backgroundColor: '#384e61', // 背景颜色
          opacity: 1, // 菜单透明度
          width: '270px', // 菜单宽度
          color: '#fff', // 文字颜色
          fontsize: '18px', // 是否显示钉住按钮
          siderBorder: '0px solid #384e61', // 菜单边框
          imgSize: '18px',
          imgColor: '#fff',
          imgPaddingTop: '0px',
          imgPaddingLeft: '0px',
          imgPaddingRight: '0px',
          imgPaddingBottom: '0px',
          imgMarginTop: '0px',
          imgMarginRight: '10px',
          imgMarginBottom: '0px',
          imgMarginLeft: '3px',
          imgWidth: '20px',
          nodeHeight: '40px',
          selectColor: '#fff', // 点击之后的颜色
          hoverColor: '#ff0000', // 鼠标经过的背景颜色
          nodeTopBorderWidth: '1px',
          nodeBottomBorderWidth: '1px',
          nodeLeftBorderWidth: '1px',
          nodeRightBorderWidth: '1px',
          nodeBorderStyle: 'solid',
          nodeBorderColor: '#fff'
        },
        isFocus: false // 是否获取焦点
      }
    },
    created() {
      if (this.ssearch != null) {
        this.showSearch = this.ssearch
      }
      if(this.sbtn != null) {
        this.showBtn = this.sbtn
      }
    },
    mounted() {
      // 一维数组转换成多维数组
      this.refreshMenu()
      //this.list = this.mapTreeData(this.options)

      // if(window.localStorage.getItem('defaultactive')){
      //   this.list.map((value,index)=>{
      //     if(value.text == window.localStorage.getItem('defaultactive')){
      //       this.defaultactive = index 
      //     }else{
      //       if(value.children){
      //         value.children.map((valu,inde) => {
      //           if(valu.text == window.localStorage.getItem('defaultactive')){
      //             this.defaultactive = index +'-'+ inde 
      //           }else{
      //             if(valu.children){
      //               valu.children.map( (val,ind ) => {
      //                 if(val.text == window.localStorage.getItem('defaultactive')){
      //                   this.defaultactive = index +'-'+ inde +'-'+ ind
      //                 }
      //               })
      //             }
      //           }
      //         })
      //       }
      //     }
      //   })
      // }
    },
    computed: {
      iconName() {
        return `#icon-${this.name}`
      },
      svgClass() {
        if (this.className) {
          return 'svg-icon ' + this.className
        } else {
          return 'svg-icon'
        }
      }
    },
    watch: {
      mrefresh (val) {
        this.refreshMenu()
      }
    },
    methods: {
      refreshMenu() {
        this.list = this.mapTreeData(this.options)
      },
      mapTreeData(data) {
        let list = []
        data.map(val => {
          val.isOpen = 'close'
          if (val[this.parentkey] == this.parentvalue) {
            list.push(val)
          }
        })
        return this.mapData(data, list)
      },
      mapData(data, list) {
        list.map(val => {
          val.children = this.mapChildren(data, val[this.idkey])
          if (val.children.length > 0) {
            this.mapData(data, val.children)
          } else {
            delete val.children
          }
        })
        return list
      },
      mapChildren(data, id) {
        let children = []
        data.map(val => {
          if (id == val[this.parentkey]) {
            children.push(val)
          }
        })
        return children
      },
      changeval(index) {
        if (index) {
          if (this.options[index].jumptype == 0) {
            this.$router.push(this.options[index].path)
          }
          let data = {
            jumptype: 1,
            url: this.options[index].path
          }
          this.$emit('handle-jump', data)
        }
      },
      changfocus() {
        // 0 钉住，1鼠标移入，2鼠标移除
        if (this.flag != 0) {
          this.isFocus = true
        }
        if (this.isFocus) {
          if (this.flag == 0) {
            this.flag = 0
          } else {
            this.flag = 1
          }
          this.isCollapse = false
        }
      },
      changblur() {
        if (this.isFocus) {
          if (this.flag == 0) {
            this.flag = 0
          } else {
            this.flag = 1
          }
          this.isCollapse = false
        }
      },
      openSider() {
        if (this.flag == 1) {
          this.isCollapse = false
          this.flag = 2
        }
      },
      closeSider() {
        if (this.flag == 2) {
          this.isCollapse = true
          this.flag = 1
        }
      },
      jumplink(url, index) {
        this.defaultactive = index
        let data = {
          jumptype: 1,
          url
        }
        this.$emit('handle-jump', data)
      },
      selectmenu(url, index) {
        // window.localStorage.setItem('defaultactive',null)
        let arr = index[index.length - 1]
        this.defaultactive = arr
        let len = arr.split('-')
        let _data = {}
        if (len.length == 1) {
          _data = this.list[len[0]]
        } else if (len.length == 2) {
          _data = this.list[len[0]].children[len[1]]
        } else if (len.length == 3) {
          _data = this.list[len[0]].children[len[1]].children[len[2]]
        }
        let data = {
          jumptype: _data.jumptype,
          url: _data.path
        }
        if (_data.jumptype == 0) {
          this.$router.replace(_data.path)
        }
        this.$emit('handle-jump', data)
      },      
      getStyle(key, defValue) {
        var res = ''
        if (this.styleOption) {
          res = this.styleOption[key]
        }
        if(res == null || res === '') {
          if(this.soption) {
            res = this.soption[key]
          }
        }
        if(res == null || res === '') {
          if (defValue != null && defValue !== '') {
            res = defValue
          } else {
            res = this.style[key]
          }
        }
        return res
      },
    }
  }
</script>
<style lang="less">
  .el-menu--collapse {
    width: 60px;
  }
  .hiddenpopper,
  .el-tooltip__popper {
    display: none !important;
  }
  .Sidebar-Search-icon {
    width: 100%;
    display: block;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    justify-content: center;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .Sidebar-Search-icon i {
    display: flex;
    width: 24px;
    align-items: center;
    color: #909399;
    font-size: 14px;
  }
  .Sidebar-Search-icon input {
    color: #ccc;
    border: 0px;
    border-bottom: 1px solid #ccc;
    border-radius: 0px;
    padding-left: 0px;
    background: transparent;
  }
  .Sidebar-Search-icon .el-select .el-icon-arrow-up {
    display: none;
  }
  .ecpSidebar {
    height: 100%;
    cursor: pointer;
    transition: width 0.2s;
    position: relative;
  }
  .sider-active {
    width: 60px !important;
    overflow: hidden;
  }
  .ecpSidebar .el-menu {
    border-right: 0px;
  }
  .Sidebar-menu {
    height: 40px;
    display: flex;
    justify-content: flex-end;
  }
  .Sidebar-menu i {
    color: #909399;
    width: 60px;
    display: flex;
    align-items: center;
    height: 40px;
    justify-content: center;
  }
  .menu-select {
    border: none !important;
    margin-top: 0px !important;
    ul {
      padding: 0px !important;
    }
    .popper__arrow {
      display: none;
    }
  }
  .ecp-menu i {
    display: inline-block;
    margin-left: 2px;
  }
  .ecpSidebar .is-active {
    background-color: #2db3ac !important;
  }
  .el-submenu__title,
  .el-submenu .el-menu-item,
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    border-top: 0px;
    border-left: 0px;
    border-bottom: 0px;
    border-right: 0px;
    border-color: #fff;
    border-style: dashed;
    position: relative;
    display: flex;
    align-items: center;
  }
  .el-submenu__title a,
  .el-submenu .el-menu-item a,
  .el-menu-item a {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .el-menu--collapse .el-menu-item,
  .el-menu--collapse .el-submenu__title,
  .el-menu--collapse .el-menu-item .el-tooltip {
    padding: 0 0 0 15px !important;
  }
</style>
