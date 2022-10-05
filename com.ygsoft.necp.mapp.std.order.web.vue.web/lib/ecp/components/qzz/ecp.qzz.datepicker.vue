<template>
  <div :id='cid+idhash' ref='dom'>
  </div>
</template>

<script>
import 'ecp.qzz.style'
import 'ecp.qzz.grid'

export default {
  name: 'QzzDatepicker',
  props: [
    'id',
    'option',
    'value'
  ],
  model: {
      prop: 'value',
      event: 'onChange'
  },
  data () {
    return {
      cid: this.id || 'qzzdatepicker',
      idhash: (+new Date()) + parseInt(Math.random() * 10, 10),
      coption: this.option,
      cvalue: this.value
    }
  },
  created () { },
  watch: {
    cvalue (val) {
      if (this.ui) {
        this.ui.setValue(val)
      }
    }
  },
  mounted () {
    window.console.log('datepicker mounted.' + this.cid + this.idhash)
    var dom = this.$refs.dom
    if (this.ui == null) {
      // eslint-disable-next-line new-cap
      this.ui = new window.qzz.ui.input.datepicker(dom, this.coption)
      this.$emit('onAfterRender', this.ui)
      if(typeof this.$root.onAfterRender === 'function') {
        this.$root.onAfterRender.apply(this, [this.ui])
      }
    } else {
      //this.ui.refreshTitle(this.coption)
    }
    this.ui.setValue(this.value)
    var me = this;
    this.ui.bind('onClearValue', function() {
        var res = this.getValue()
        //把值传回给父组件
        me.$emit('onChange', res)
    })
    this.ui.bind('onSelect', function(index, item) {
        var res = this.getValue()
        //把值传回给父组件
        me.$emit('onChange', res)
    });
  },
  methods: {
  },
  destroyed() {
    window.console.info('destroy datepicker')
    if (this.ui != null && typeof this.ui.destroy == 'function') {
      this.ui.destroy()
    }
  }
}
</script>

<style>
</style>
