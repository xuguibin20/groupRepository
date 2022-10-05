<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			platform: 'tphone',
			// 是否启动接口安全
			_ecp_remote_security: true,
			ecp_token: ''
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
