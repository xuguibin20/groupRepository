<template>
   <ts-login :preurl="option.preurl" :tenantId="option.tenantId" :appName="option.appName"></ts-login>
</template>

<script>

	let Tswan = require('necp.tswan.components')
  let tsLogin = Tswan.TsLogin.default

export default {
	components: {
        tsLogin
    },
   data() {
       return {
		   option:{
			   preurl:'/com.ygsoft.necp.mapp.std.order.webweb/necp/mapp/order',
			   tenantId: '${tenantId}',
			   appName: 'com.ygsoft.necp.mapp.std.order.web'
		   }
	   }
   },
   props: {
        
      },
   mounted() {
    
   },
}
</script>
<style>
   
</style>