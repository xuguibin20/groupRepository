<template>
	<view class="login"><!-- <image src="../../../../static/tabBar/mainPage/login/login_logo.png" mode=""></image> -->
		<view class="login-demo-img"><text class="login-demo-title">移动门户</text></view>
		<login-forget-register
			class="login-demo-box"
			:modelType="modelType"
			:showValidate="showValidate"
			ref="child"
			:option="option"
			@getValidateClick="getValidateClick()"
			@submitClick="submitClick($event)"
		></login-forget-register>
		<view class="login-footer" :style="{ color: option.tipsColor }">
			<view class=""><view v-if="modelType === 'PHONE'" @click="modelType = 'PASSWORD'">账号密码登录</view></view>
		</view>
	</view>
</template>

<script>
import { logintools } from '@/src/assets/js/4alogintools.js';
import loginForgetRegister from '@/lib/ecp/components/login/login-forget-register.vue'

export default {
	name: 'login',
	components: {
		"loginForgetRegister":loginForgetRegister,
		logintools
	},
	data() {
		return {
			// 密码登录PASSWORD, 手机PHONE,忘记密码FORGET,注册REGISTER, 默认值为PASSWORD
			modelType: 'PASSWORD',
			// 登录组件,是否显示验证码
			showValidate: false,
			// 实际使用中只需配置所需，不需要全部配置，下列是默认配置
			option: {
				// 字体颜色,不包括按钮
				tipsColor: 'rgba(255, 255, 255, 0.5)',
				// 倒计时时间，默认为60
				countdown: 90,
				// 按钮显示字样
				buttonValue: '登录'
			}
		};
	},
	methods: {
		/**
		 * 验证码按钮点击事件执行函数
		 **/
		getValidateClick() {
			// 获取验证码
			// 请求数据后
			console.log('点击');
			this.$refs.child.startCountdown();
			uni.showToast({
				title: '验证码已经发送',
				duration: 2000
			});
		},
		/**
		 *  登录，具体登录api对接时，需要判断输入合法性
		 **/
		submitClick(event) {
			// 登录，具体登录api对接时，需要判断输入合法性
			console.log(event);
			var msg = '';
			if (event.isErr) {
				// isErr为true时，说明总体输入有误，不符合设置或者默认设置的正则规则，正常isErr为true时不会触发该事件
				console.log('输入错误');
				return false;
			} else {
				// 对应处理数据，对接api等
				msg = '登录成功';
			}

			var userName = event.username;
			var passWord = event.password;

			logintools.checkUserLogin(userName, passWord, { TENANTID: '${tenantId}', preurl: "/order" }, res => {
				if (res.data.error === null || res.data.error === '') {
					// 登录后记录最后一次登录成功的用户名
					//this.remember();
					uni.switchTab({url :"/src/pages/main/main"}); 
				} else {
					if (window.console && window.console.error) {
						
						window.console.error(res.data.error);
						uni.showToast({
							title: res.data.error,
							duration: 3000,
							icon:'none'
						})
					}
				}
				// else if (res.data.error === '初始登录，请修改密码。' || res.data.error === '密码过期，请修改。') {
				// 	this.$message({
				// 		type: 'warning',
				// 		message: res.data.error,
				// 		duration: 2000
				// 	});
				// 	this.userFirstLogin = true;
				// } else {
				// 	this.$message.closeAll();
				// 	if (res.data.error.indexOf('不允许重复登录') >= 0) {
				// 		this.$message({
				// 			type: 'warning',
				// 			message: '此用户已在其他机器登录，不允许重复登录',
				// 			duration: 2000
				// 		});
				// 	} else {
				// 		this.$message({
				// 			type: 'warning',
				// 			message: res.data.error,
				// 			duration: 2000
				// 		});
				// 	}
				// }
			});

			// uni.showToast({
			// 	title: msg,
			// 	icon: 'none',
			// 	duration: 2500
			// });
		},
		/**
		 * 前往忘记密码页面
		 **/
		toForgetPassword() {
			uni.navigateTo({
				url: 'forget-password'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
uni-page-body {
    background-color: #F4F5F6;
    height: 100%;
    font-size: 13px;
    line-height: 1.8;
}
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
			float: left;
		}
	}
	
	.login-demo-title {
		    color: #ffffff;
		    float: left;
		    font-size: 37px;
		    font-family: 黑体;
		    width: 100%;
		    text-align: center;
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
