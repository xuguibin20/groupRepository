<template>
  <div :id='cid+idhash' ref='dom'>
  </div>
</template>

<script>
import 'ecp.qzz.style'
import 'ecp.qzz.grid'

export default {
  name: 'QzzCombobox',
  props: [
    'id',
    'option',
    'data',
    'value'
  ],
  model: {
      prop: 'value',
      event: 'onChange'
  },
  data () {
    return {
      cid: this.id || 'qzzcombobox',
      idhash: (+new Date()) + parseInt(Math.random() * 10, 10),
      cdata: this.data,
      coption: this.option,
      cvalue: this.value
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
    coption (val) {
      if (this.ui) {
        // this.ui.refreshTitle(val)
      }
    },
    cdata (val) {
      if (this.ui) {
        this.ui.loadData(val)
      }
    },
    cvalue (val) {
      if (this.ui) {
        this.ui.setValue(val)
      }
    }
  },
  mounted () {
    window.console.log('combotree mounted.' + this.cid + this.idhash)
    var dom = this.$refs.dom
    if (this.ui == null) {
      // eslint-disable-next-line new-cap
      this.ui = new window.qzz.ui.input.combotree(dom, this.coption)
      this.$emit('onAfterRender', this.ui)
      if(typeof this.$root.onAfterRender === 'function') {
        this.$root.onAfterRender.apply(this, [this.ui])
      }
    } else {
      //this.ui.refreshTitle(this.coption)
    }
    if (this.option && this.option.data != null && this.option.data.length > 0 && this.cdata.length === 0) {

    } else {
      this.ui.loadData(this.data)
    }
    this.ui.setValue(this.value)
    var me = this;
    this.ui.bind('onClearValue', function() {
        var res = this.getValue()
        if(res.push) {
            res = res.join(',')
        }
        me.cvalue = res;
        //把值传回给父组件
        me.$emit('onChange', me.cvalue)
    })
    this.ui.bind('onSelect', function(item) {
        var res = this.getValue()
        if(res.push) {
            res = res.join(',')
        }
        me.cvalue = res;
        //把值传回给父组件
        me.$emit('onChange', me.cvalue)
    });
  },
  destroyed() {
    window.console.info('destroy combotree')
    if (this.ui != null && typeof this.ui.destroy == 'function') {
      this.ui.destroy()
    }
  }
}
</script>

<style>
</style>
