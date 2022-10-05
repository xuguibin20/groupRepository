<template>
  <div :id='cid+idhash' ref='dom'>
  </div>
</template>

<script>
import 'ecp.qzz.style'
import 'ecp.qzz.grid'

export default {
  name: 'QzzBubble',
  props: [
    'id',
    'option',
    'text'
  ],
  data () {
    return {
      cid: this.id || 'qzzbubble',
      idhash: (+new Date()) + parseInt(Math.random() * 10, 10),
    }
  },
  created () { },
  watch: {
    option (opt) {
      this.coption = opt
    },
    text (val) {
      if (this.ui) {
        this.ui.setText(val)
      }
    }
  },
  mounted () {
    window.console.log('bubble mounted.' + this.cid + this.idhash)
    var dom = this.$refs.dom
    if (this.ui == null) {
      // eslint-disable-next-line new-cap
      this.ui = new window.qzz.ui.drop.popbubble(dom, this.option)
      this.$emit('onAfterRender', this.ui)
      if(typeof this.$root.onAfterRender === 'function') {
        this.$root.onAfterRender.apply(this, [this.ui])
      }
    } else {
        
    }
    this.ui.setText(this.text)
  },
  methods: {

  },
  destroyed() {
    window.console.info('destroy bubble')
    if (this.ui != null && typeof this.ui.destroy == 'function') {
      this.ui.destroy()
    }
  }
}
</script>

<style>
</style>
