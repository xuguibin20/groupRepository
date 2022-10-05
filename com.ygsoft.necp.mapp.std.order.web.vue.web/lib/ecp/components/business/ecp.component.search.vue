<template>
  <div class="ecpsearchcontent">
    <div :style="{height:height}">
      <div v-if="searchType" :style="{height:height}">
        <el-tooltip
          :disabled="isfocus || input1.length < 10"
          class="item"
          effect="light"
          :content="input1"
          placement="bottom"
        >
          <el-input
            v-model="input1"
            @focus="handlefocus"
            :placeholder="placeholder"
            clearable
            @
            class="ecpsearch"
            :class="isfocus ? 'action' : ''"
            @clear="handlefocus"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </el-tooltip>
      </div>

      <div v-else :style="{height:height}">
        <el-tooltip
          :disabled="isfocus || input2.length < 10"
          class="item"
          effect="light"
          :content="input2"
          placement="bottom"
        >
          <el-input
            :class="isfocus ? 'action' : ''"
            v-model="input2"
            @focus="handlefocus"
            :placeholder="placeholder"
            clearable
            class="ecpsearch"
            @clear="handlefocus"
            @keyup.enter.native="handlesearch"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handlesearch"
            ></el-button>
          </el-input>
        </el-tooltip>
      </div>
    </div>
    <ul v-if="isfocus" class="ecpsearch-history-list">
      <li class="active">
        历史搜索
      </li>
      <li v-for="(item,index) in historylist" v-if="index < 5">
        <span @click="handlechose(item)" class="historylist-text">{{
          item
        }}</span
        ><i class="el-icon-close" @click="handledelete(index)"></i>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'ecpsearch',
    props: {
      // 搜索类型 ： false即时搜索 ，true 非即时搜索
      searchType: {
        default: true,
        type: Boolean
      },
      // 输入框高度
      height: {
        default: '28px',
        type: String
      },
      // 输入框提示
      placeholder: {
        default: '请输入',
        type: String
      },
      // 历史记录
      history: {
        default: [],
        type: Array
      }
    },
    data() {
      return {
        value: '',
        input1: '',
        input2: '',
        isfocus: false, // 是否获取焦点
        historylist: []
      }
    },
    created() {},
    mounted() {
      this.historylist = new Set(this.history)
    },
    methods: {
      handlefocus() {
        this.isfocus = true
        document.addEventListener('click', e => {
          if (
            e.srcElement._prevClass != 'el-input__inner' &&
            e.srcElement._prevClass != 'historylist-text' &&
            e.srcElement.className !=
              'el-input__icon el-icon-circle-close el-input__clear'
          ) {
            this.isfocus = false
            document.removeEventListener('click', v => {})
          }
        })
      },
      handledelete(index) {
        let historylist = [...this.historylist]
        historylist.splice(index, 1)
        this.historylist = historylist
      },
      handlechose(text) {
        if (this.searchType) {
          this.input1 = text
        } else {
          this.input2 = text
        }
        this.isfocus = false
      },
      handlesearch() {
        this.$emit('handlesearchinput', this.input2)
      }
    },
    watch: {
      input1(n, o) {
        if (n != '') {
          this.isfocus = false
        }
        this.$emit('handlesearchinput', n)
      },
      input2(n, o) {
        if (n != '') {
          this.isfocus = false
        }
        // this.$emit('handlesearchinput', n)
      },
      history(n, o) {
        this.historylist = new Set(n)
      }
    }
  }
</script>

<style lang="less">
  .ecpsearchcontent {
    width: 100%;
    position: relative;
    .action {
      border: 1px solid #66afe9 !important;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px #66afe9;
    }
    .ecpsearch {
      height: 100%;
      overflow: hidden;
      border: 1px solid #e4e4e4;
      box-sizing: border-box;
      .el-input__inner {
        border: none;
        height: 100%;
        padding-right: 25px;
      }
      ::-webkit-input-placeholder {
        color: #c0c0c0;
        font-family: '微软雅黑';
        font-size: 14px;
      }
      .el-input-group__append {
        height: 100%;
        background: #e9eaed;
        border: none;
        padding: 0 7px;
        border-radius: 0px;
      }
      .el-input__prefix {
        font-size: 16px;
        left: 0px !important;
        padding: 0px 7px;
        display: flex;
        justify-content: center;
        align-items: center;
        .el-input__icon {
          width: 16px;
          height: 16px;
          line-height: 16px;
        }
      }
      .el-button {
        background: none !important;
        border: none !important;
        overflow: hidden;
        font-size: 16px;
      }
      .el-button:hover {
        background: none !important;
        border: none !important;
        color: #999;
      }
    }
    .ecpsearch-history-list {
      width: 100%;
      list-style: none;
      margin: 0px;
      padding: 0px;
      border: 1px solid #ccc;
      border-top: 0;
      box-sizing: border-box;
      position: absolute;
      background: #fff;
      z-index: 9;
      > li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 25px;
        padding: 0 5px 0 10px;
        cursor: pointer;
        > i {
          font-size: 18px;
        }
        > span {
          display: inline-block;
          height: 100%;
          font-size: 16px;
          line-height: 25px;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin-right: 10px;
        }
      }
      > li:hover {
        background: #f2f2f2;
      }
      .active {
        background: #f2f2f2;
        color: #999;
        font-size: 14px !important;
      }
    }
  }
</style>
