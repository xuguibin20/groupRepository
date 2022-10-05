<template>
  <view class="ecp-popentity" v-show="visible">
    <view class="popentity-body">
      <view class="popentity-header">
        {{title}}
        <view class="popentity-close" @click="hide">
          <span></span>
          <span></span>
        </view>
      </view>
      <view class="popentity-warp">
        <view
          v-for="(value, key) in data"
          class="popentity-item"
          :class="{ choice: isCheck(value[idField])}"
          @click="handleChoice(value[idField])"
        >
          <view class="item-title">{{value[textField]}}</view>
          <view class="item-view">
            <span v-for="(val, key) in value" v-if="key != idField && key != textField">
              {{val}}
              <br />
            </span>
          </view>
          <checkbox v-if="multiple" :checked="isCheck(value[idField])" />
        </view>
      </view>
      <view class="popentity-footer">
        <view class="popentity-cancel" @click="hide">取消</view>
        <view class="popentity-confirm" @click="handleConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data () {
    return {
      visible: false, // 是否显示
      currentValue: null // 内部使用值
    }
  },
  props: {
    value: [Array, String, Number], // 值
    title: String, // 标题
    data: Array,  // 数据源
    idField: String, // id标识
    textField: String, // 文字标识
    multiple: Boolean // 是否多选
  },
  methods: {
    // 显示方法
    show () {
      // 根据是否多选初始化值
      if (this.multiple) {
        this.currentValue = [...this.value]
      } else {
        this.currentValue = this.value
      }
      this.visible = true
    },
    // 隐藏方法
    hide () {
      this.visible = false
    },
    // 选择处理
    handleChoice (id) {
      // 根据是否多选，是则添加到选择池里，不是则直接变为该选项
      if (this.multiple) {
        let index = this.currentValue.indexOf(id)
        if (index >= 0) {
          this.currentValue.splice(index, 1)
        } else {
          this.currentValue.push(id)
        }
      } else {
        if (this.currentValue == id) {
          this.currentValue = null
        } else {
          this.currentValue = id
        }
      }
    },
    // 点击确定
    handleConfirm () {
      this.$emit('input', this.currentValue)
      this.hide()
    }
  },
  computed: {
    // 计算是否选中
    isCheck () {
      return (id) => {
        if (this.multiple) {
          return this.currentValue && this.currentValue.indexOf(id) >= 0
        } else {
          return this.currentValue == id
        }
      }
    }
  },
}
</script>

<style>
.ecp-popentity {
  position: fixed;
  top: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.popentity-body {
  position: absolute;
  top: 15%;
  left: 10%;
  width: 80%;
  height: 70%;
  background: #ffffff;
  border-radius: 5px;
  overflow: hidden;
}
.popentity-header {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  color: #333;
  text-indent: 20px;
  font-weight: bold;
}
.popentity-close {
  position: absolute;
  right: 6px;
  top: 8px;
  width: 30px;
  height: 30px;
}
.popentity-close span {
  position: absolute;
  display: inline-block;
  left: 10px;
  top: 10px;
  height: 2px;
  width: 12px;
  background: #999;
  transform: rotate(315deg);
}
.popentity-close span:first-child {
  transform: rotate(45deg);
}
.popentity-warp {
  width: 100%;
  height: calc(100% - 80px);
  overflow: auto;
}
.popentity-item {
  position: relative;
  padding: 10px;
  border-bottom: 1rpx solid #f6f6f6;
}
.popentity-item:first-child {
  border-top: 1rpx solid #f6f6f6;
}
.popentity-item.choice {
  background: #d1e3f1;
}
.popentity-item checkbox {
  position: absolute;
  top: 10px;
  right: 5px;
  transform: scale(0.7);
}
.item-title {
  font-size: 14px;
}
.item-view {
  font-size: 12px;
  color: #666;
}
.popentity-footer {
  display: flex;
  width: 100%;
  height: 40px;
  border-top: 1px solid #ccc;
}
.popentity-footer > view {
  text-align: center;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}
.popentity-confirm {
  flex: 1;
  color: #5f8dd3;
  border-left: 1rpx solid #ccc;
}
.popentity-cancel {
  flex: 1;
}
</style>