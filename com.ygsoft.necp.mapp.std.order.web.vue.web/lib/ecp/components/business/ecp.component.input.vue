<template>
  <el-tooltip
    :disabled="focus || !input"
    class="item"
    effect="light"
    :content="input"
    placement="bottom"
  >
    <el-input
      v-model="input"
      @focus="focus = true"
      @blur="focus = false"
      placeholder="请输入内容"
      clearable
    ></el-input>
  </el-tooltip>
</template>
<script>
  export default {
    props: {
      value: {
        // 父组件传过来的值
        type: String,
        default: ''
      },
      lable: {
        // 字段名称
        type: String,
        default: ''
      }
    },
    data() {
      return {
        focus: false, // 是否获取焦点
        input: this.value
      }
    },
    mounted() {},
    watch: {
      input(n, o) {
        let lable = this.lable.split('.')
        if (lable.length <= 1) {
          this.$parent[lable[0]] = n
        } else {
          this.$parent[lable[0]][lable[1]] = n
        }
      }
    }
  }
</script>
<style lang="less"></style>
