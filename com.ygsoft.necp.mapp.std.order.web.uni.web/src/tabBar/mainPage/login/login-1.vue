<template>
	<view class="login">
		<view class="login-head">
			<view class="login-demo-img">
				<image src="../../../../static/tabBar/mainPage/login/login_logo.png" mode=""></image>
			</view>
			<view class="head-select-box">
				<view :class="{ select: isActive }" @click="changeType(1)">
					登录
				</view>
				<view :class="{ select: !isActive }" @click="changeType(2)">
					注册
				</view>
			</view>
		</view>

		<login-forget-register class="login-demo-box" :modelType="modelType" :showValidate="showValidate" ref="child" :option="option"
		 @getValidateClick="getValidateClick()" @submitClick="submitClick($event)"></login-forget-register>
		<view class="login-footer">
			<view class="">
				<view v-if="modelType==='PHONE'" @click="changeType(3)">密码登录</view>
				<view v-if="modelType==='PASSWORD'" @click="changeType(4)">短信验证码登录</view>
			</view>
			<view class="">
				<view v-if="modelType==='PHONE' || modelType==='PASSWORD'" @click="changeType(5)">忘记密码？</view>
			</view>
		</view>
		<view class="version">
			Version 1.0.0
		</view>
	</view>
</template>

<script>
	import loginForgetRegister from '@/src/components/login/login-forget-register.vue'

	export default {
		name: "login1",
		components: {
			loginForgetRegister
		},
		data() {
			return {
				// 头部登录按钮和注册按钮切换，true为登录，false注册
				isActive: true,
				// 密码登录PASSWORD, 手机PHONE,忘记密码FORGET,注册REGISTER, 默认值为PASSWORD
				modelType: 'PASSWORD',
				// 登录组件,是否显示验证码
				showValidate: false,
				// 实际使用中只需配置所需，不需要全部配置，下列是默认配置
				option: {
					// 用户名输入框占位符
					usernameTips: '请输入用户名',
					// 手机号码输入框占位符
					phoneNumberTips: '邮箱/手机号',
					// 验证码输入框占位符
					validateTips: '验证码',
					// 密码输入框占位符
					passwordTips: '请输入密码',

					// 用户名输错提示信息 
					usernameMsg: '用户名不能为空',
					// 密码输错提示信息 
					passwordMsg: '密码不能为空',
					// 手机号码输错提示信息 
					phoneNumberMsg: '手机号码输入不正确',
					// 验证码输错提示信息 
					validateMsg: '验证码不能为空',

					// 获取验证码按钮显示
					validateBtValue: '获取验证码',
					// 字体颜色,不包括按钮
					iconInputColor: '#999999',
					// 字体颜色,不包括按钮
					tipsColor: '#C6C6C6',
					// 按钮背景色
					buttonBg: 'linear-gradient(to right , #00aaf0,#0081e1)',
					// 按钮字体颜色
					buttonColor: '#FFFFFF',
					// 按钮阴影
					buttonBoxShadow: '#FFFFFF',
					// 倒计时时间，默认60
					countdown: 60,
					// 按钮显示字样
					buttonValue: '登录'
				}
			}
		},

		methods: {
			/**
			 * 更改组件类型，modelType
			 * @param {number} type 点击按钮编号
			 **/
			changeType(type) {
				switch (type) {
					case 1:
						// 密码登录
						this.isActive = true;
						this.modelType = 'PASSWORD';
						this.option.buttonValue = '登录';
						break;
					case 2:
						// 注册
						this.isActive = false;
						this.modelType = 'REGISTER';
						// 按钮字样修改
						this.option.buttonValue = '确定';
						break;
					case 3:
						// 密码登录
						this.isActive = true;
						this.modelType = 'PASSWORD';
						this.option.buttonValue = '登录';
						break;
					case 4:
						// 手机登录
						this.isActive = true;
						this.modelType = 'PHONE';
						this.option.buttonValue = '登录';
						break;
					case 5:
						// 跳转到修改密码页面
						uni.navigateTo({
							url: 'forget-password-1'
						})
						break;
					default:
						break;
				}
			},
			/**
			 * 验证码按钮点击事件执行函数
			 **/
			getValidateClick() {
				// 获取验证码
				// 请求数据后
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
				console.log(event);
				var msg = '';
				if (event.isErr) {
					// isErr为true时，说明总体输入有误，不符合设置或者默认设置的正则规则
					console.log('输入错误');
					return false;
				} else {
					// 对应处理数据，对接api等
					switch (this.modelType) {
						case 'PASSWORD':
							msg = '登录成功';
							break;
						case 'PHONE':
							msg = '登录成功';
							break;
						case 'REGISTER':
							msg = '注册成功';
							break;
						default:
							break;
					}
				}
				uni.showToast({
					title: msg,
					icon: 'none',
					duration: 2500
				});
			}
		}
	}
</script>


<style lang="scss" scoped>
	.login {
		height: 100%;
		width: 100%;
		background-color: #FFFFFF;
		position: relative;

		.login-head {
			height: 440upx;
			width: 750upx;
			padding-top: 0.1px;
			background-image: url(../../../../static/tabBar/mainPage/login/login_bg_1.png);
			background-repeat: no-repeat;
			background-size: 750upx 440upx;
			margin-bottom: 140upx;
			position: relative;

			.login-demo-img {
				width: 320upx;
				height: 60upx;
				margin: 210upx auto 0upx auto;

				image {
					width: 100%;
					height: 100%;
				}
			}

			.head-select-box {
				height: 80upx;
				position: absolute;
				bottom: -40upx;
				width: 510upx;
				margin-left: 120upx;
				background-color: #FFFFFF;
				border-radius: 40upx;
				box-shadow: 0px 16upx 79upx rgba(0, 0, 0, 0.19);
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;

				view {
					width: 45%;
					height: 80upx;
					line-height: 80upx;
					font-size: 32upx;
					color: #808080;
					text-align: center;
					border-radius: 40upx;
					letter-spacing: 6upx;
				}

				.select {
					background: linear-gradient(to right, #00aaf0, #0081e1);
					width: 55%;
					color: #FFFFFF;
				}
			}
		}

		.login-demo-box {
			margin: 0px 120upx;
		}

		.login-footer {
			font-size: 24upx;
			color: #A8C8F8;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			margin: 40upx 120upx 120upx;
			padding: 0px 30upx;

		}

		.version {
			width: 100%;
			position: absolute;
			bottom: 50upx;
			display: flex;
			flex-direction: row;
			justify-content: center;
			color: #C6C6C6;
			font-size: 24upx;
		}
	}
</style>
