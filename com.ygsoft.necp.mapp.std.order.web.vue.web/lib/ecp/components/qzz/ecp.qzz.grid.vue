<template>
  <table :id='cid+idhash' ref='griddom'>
      <tr><td></td></tr>
  </table>
</template>

<script>
import 'ecp.qzz.style'
import 'ecp.qzz.grid'

export default {
  name: 'QzzGrid',
  props: [
    'id',
    'option',
    'data'
  ],
  model: {
    prop: 'data',
    event: 'onChange'
  },
  data () {
    return {
      cid: this.id || 'qzzgrid',
      idhash: (+new Date()) + parseInt(Math.random() * 10, 10),
      cdata: this.data,
      coption: this.option
    }
  },
  created () { },
  watch: {
    option (opt) {
      // window.console.log(opt)
      this.coption = opt
    },
    data (val) {
      // window.console.log(val)
      this.cdata = val
    },
    // 胡乱激活，导致表头不稳定.
    // coption (val) {
    //   if (this.ui && this.ui._send !== true) {
    //     this.ui.refreshTitle(val)
    //   }
    // },
    cdata (val) {
      if (this.ui && this.ui._send !== true) {
        var index = this.ui.getScrollIndex()
        var scrindex = this.ui.dataSet.getIndex()
        this.ui.value(val, function() {
          this.scrollToIndex(index)
          this.locate('@INDEX', scrindex)
        })
      }
      var _this = this
      setTimeout(function() {
        _this.ui._send = false
        _this = null
      }, 100);      
    }
  },
  mounted () {
    window.console.log('grid mounted.' + this.cid + this.idhash)
    var griddom = this.$refs.griddom	
	this.coption.inVue = true
    if (this.ui == null) {
      // eslint-disable-next-line new-cap
      this.ui = new window.qzz.ui.grid(griddom, this.coption)
      this.$emit('onAfterRender', this.ui)
      if(typeof this.$root.onAfterRender === 'function') {
        this.$root.onAfterRender.apply(this, [this.ui])
      }
    } else {
      this.ui.refreshTitle(this.coption)
    }
    if (this.option && this.option.data != null && this.option.data.length > 0 && this.cdata.length === 0) {

    } else {
      this.ui.value(this.cdata)
    }
    var me = this
    this.ui.bind('onChanged', function () {
      me.cdata = me.ui.value()
      me.ui._send = true;
      me.$emit('onChange', me.cdata)
    })
  },
  destroyed() {
    window.console.info('destroy grid')
    if (this.ui != null && typeof this.ui.destroy == 'function') {
      this.ui.destroy()
    }
  }
}
</script>

<style>
</style>
