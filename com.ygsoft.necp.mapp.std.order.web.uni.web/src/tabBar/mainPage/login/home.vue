<template>
	<view class="login">
		<view><button class="" @click="loginContextClick()" :style="{}">获取上下文</button></view>
		<view><button class="" @click="sessionClick()" :style="{}">校验会话超时</button></view>
		<view><button class="" @click="menuClick()" :style="{}">根据模块获取菜单</button></view>
		<view><button class="" @click="submitClick()" :style="{}">退出</button></view>
	</view>
</template>

<script>
import { portaltools } from '@/src/assets/js/portaltools.js';
import NRS from '../../../../lib/ecp/scripts/ecp.service.js';

export default {
	name: 'home',
	components: {
		portaltools
	},
	data() {
		return {};
	},
	methods: {
		menuClick(event) {
			NRS.doPost('necp/mapp/4a/portalmdm/getmenutree', 
				{
					datacontext:"",
					moduleCode:"XT",
					specialParam:{}
				}
			)
			  .then(res => {
			    if (res.data != null) {
					console.info(res.data);
			    }
			  })
			  .catch(err => {
			    if (window.console) {
			      window.console.log(err)
			    }
			  })
		},
		submitClick(event) {
			portaltools.logout(res => {
				uni.navigateTo({url:"login"});  
			});
		},
		sessionClick(event) {
			portaltools.validSession('',res => {
				console.info(res.data);
			})
		},
		loginContextClick(event) {
			portaltools.requestDataContext('',res => {
				console.info(res.data);
			})
		}
	}
};
</script>

<style lang="scss" scoped>
.login {
	height: 100%;
	width: 100%;
	padding-top: 1upx;
	background-image: url(../../../../static/tabBar/mainPage/login/login_bg.png);
	background-size: 750upx 100%;
	background-repeat: no-repeat;

	.login-demo-img {
		width: 328upx;
		height: 58upx;
		margin: 220upx auto 160upx auto;

		image {
			width: 100%;
			height: 100%;
		}
	}

	.login-demo-box {
		margin: 0px 40upx;
	}

	.login-footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin-top: 80upx;
		margin: 80upx 60upx 0upx 60upx;
	}
}
</style>
