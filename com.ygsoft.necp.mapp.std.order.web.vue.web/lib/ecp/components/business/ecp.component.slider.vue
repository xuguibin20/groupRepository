<template>
  <el-slider
    id="ecpSlider"
    v-model="value"
    :step="step"
    :show-tooltip="showtooltip"
    :format-tooltip="formatTooltip"
    :input-size="inputsize"
    :vertical="vertical"
    :height="height"
    :disabled="disabled"
    :range="range"
    :show-stops="showstops"
    :show-input="showinput"
  >
  </el-slider>
</template>

<script>
  import NRS from 'ecp.service'
  export default {
    name: 'ecpSlider',
    props: {
      // :format-tooltip="formatTooltip",
      step: Number,
      showtooltip: Boolean,
      inputsize: String,
      vertical: Boolean, // 竖着显示
      height: String,
      disabled: Boolean, // 是否能拖动
      range: Boolean,
      showstops: Boolean,
      showinput: Boolean
    },
    data() {
      return {
        value: [20, 50]
      }
    },
    mounted() {},
    methods: {
      formatTooltip(val) {
        return val / 100
      }
    },
    watch: {}
  }
</script>

<style lang="less"></style>
