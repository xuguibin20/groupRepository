<template>
	<view>
		<button @click="loginout()" style="margin-top: 10px;">退出登录</button>
	</view>
</template>

<script>
	import { portaltools } from '@/src/assets/js/portaltools.js';
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			loginout() {
				portaltools.logout(function() {
					uni.showToast({
						title: '成功退出登录',
						duration: 2000
					});
					uni.navigateTo({
						url: '/src/tabBar/mainPage/login/login'
					})
				})
			}
		}
	}
</script>

<style>

</style>
