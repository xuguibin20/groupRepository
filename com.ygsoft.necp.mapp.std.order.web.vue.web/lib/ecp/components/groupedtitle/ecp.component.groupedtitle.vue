<template>
  <div class="groupedtitle">
    <div class="title">{{title}}
      <span v-if="showMore == false && description " class="el-icon-arrow-down" @click="showMore = true"></span>
      <span v-if="showMore == true && description" class="el-icon-arrow-up" @click="showMore = false"></span>
    </div>
    <transition name="el-fade-in">
      <div class="detail" v-if="showMore && description">{{description}}</div>
    </transition>
  </div>
</template>
<script>
  export default {
    name: 'groupedtitle',
    props: {
      description: {
        default: "",
        type: String
      },
      title: {
        default: '分组色块',
        type: String
      }
    },
    data() {
      return {
        showMore: false
      }
    },
    mounted() { },
    methods: {},
    computed: {},
    watch: {}

  }
</script>

<style scoped lang="less">
  .groupedtitle {
    width: 100%;
    height: 32px;
    .title {
      width: 100%;
      height: 100%;
      line-height: 32px;
      font-family: '微软雅黑';
      font-size: 14px;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
      color: #2D54A6;
      text-align: left;
      position: relative;
      text-indent: 7px;
      user-select: none;
      >span {
        position: absolute;
        right: 0px;
        top: 50%;
        margin-top: -8px;
        cursor: pointer;

      }
    }
    .title::before {
      content: '';
      height: 14px;
      width: 4px;
      background: #2D54A6;
      position: absolute;
      top: 9px;
      left: 0px;
    }
    .detail {
      width: 100%;
      height: auto;
      overflow: hidden;
      font-size: 12px;
      color: #666;
      font-family: '微软雅黑';
      line-height: 20px;
      text-align: left;
      padding: 5px;
      box-sizing: border-box;
    }
  }
</style>