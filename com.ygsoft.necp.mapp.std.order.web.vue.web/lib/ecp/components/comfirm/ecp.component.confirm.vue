<template>
  <transition name="el-fade-in">
    <div id="Ecpcontent" class="EcpConfirm" v-if="visible">
      <div class="EcpConfirmBox">
        <div class="title">
          <span class="rept_modal_title">提示</span>
          <span class="el-icon-close" @click="close"></span>
        </div>
        <div class="content" v-html="ConfirmDes"></div>
        <div class="foot footer" v-if="type == false">
          <div @click="cancel" class="rept_confirm_btn" v-if="showCancel">
            {{ cancelText }}
          </div>
          <div @click="success" class="el-button--primary">
            {{ successText }}
          </div>
        </div>
        <div class="foot" v-if="type == true">
          <span v-if="showMore == false" @click="showMore = true"
            ><i class="el-icon-arrow-down"></i>展开详细</span
          >
          <span v-else @click="showMore = false"
            ><i class="el-icon-arrow-up"></i>隐藏详细</span
          >
          <div @click="success" class="el-button--primary">
            {{ successText }}
          </div>
        </div>
        <div v-if="showMore == true && type == true" class="contenttext">
          <div v-html="ConfirmDetail"></div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
  export default {
    name: 'Ecpcontent',
    props: {
      ConfirmDetail: {
        default: '',
        type: String
      },
      ConfirmDes: {
        default: '提示',
        type: String
      },
      type: {
        default: true,
        type: Boolean
      },
      visible: {
        default: false,
        type: Boolean
      },
      // 关闭按钮文字
      cancelText: {
        default: '取消',
        type: String
      },
      // 确定按钮文字
      successText: {
        default: '确定',
        type: String
      },
      // 是否显示关闭按钮 ：true 显示，false 不显示
      showCancel: {
        default: true,
        type: Boolean
      }
    },
    data() {
      return {
        showMore: false
      }
    },
    mounted() {},
    methods: {
      close() {
        this.$emit('close')
      },
      cancel() {
        this.$emit('cancel')
      },
      success() {
        this.$emit('success')
      }
    },
    computed: {},
    watch: {}
  }
</script>

<style scoped lang="less">
  .EcpConfirm {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 9999;
    .EcpConfirmBox {
      background: #fff;
      border: 1px solid #e4e4e4;
      border-radius: 5px;
      width: 400px;
      .title {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e4e4e4;
        padding: 0px 10px;
        font-size: 16px;
        > span:first-child {
          color: #000;
          font-size: 14px;
        }
        > span:last-child {
          cursor: pointer;
        }
      }
      .content {
        padding: 20px 15px 30px;
        border-bottom: 1px solid #e4e4e4;
        word-wrap: break-word;
      }

      .foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        > span {
          cursor: pointer;
          font-size: 12px;
          > i {
            margin-right: 3px;
          }
        }
        > div {
          padding: 5px 15px;
          border: 1px solid #e4e4e4;
          margin-left: 10px;
          border-radius: 3px;
          cursor: pointer;
        }
        > div:last-child {
          background: #2d85d4;
          color: #fff;
        }
        > div:last-child:hover {
          background: #2d85d4;
          color: #fff;
        }
      }
      .footer {
        justify-content: flex-end;
      }
      .contenttext {
        width: 100%;
        padding: 10px 15px 20px;
        box-sizing: border-box;

        > div {
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #e4e4e4;
          line-height: 30px;
          max-height: 200px;
          overflow-y: auto;
        }
      }
    }
  }
</style>
