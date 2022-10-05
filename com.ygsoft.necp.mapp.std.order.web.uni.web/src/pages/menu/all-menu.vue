<template>
	<view class="all-menu">
		<ts-all-menu :option="option"></ts-all-menu>
		
	</view>
</template>

<script>
	var components= require('necp.tswan.mobile.components');
    var TsAllMenu = components.TsAllMenu;
	export default {
	    'name': 'all-menu',
		components: {
			"ts-all-menu": TsAllMenu
		},
		data() {
			return {
				option: {
							   appId: "b14bd2f894c2bd13e2d7c3aa9d14fc13",
							   contextPath: "/order",
							   vipAddress: "/necp/mapp/order"
				}
			}
		},
		onReady() {
		},
		computed: {
			
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
