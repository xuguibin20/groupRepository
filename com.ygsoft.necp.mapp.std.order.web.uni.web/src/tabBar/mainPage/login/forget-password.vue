<template>
	<view class="forget-password">
		<view class="title">
			<view class="to-back" @click="back">
				<!-- 图标 -->
				<svg t="1588819237270" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1812"
				 width="20" height="20">
					<path d="M744.336696 1018.434783c-8.147478 0-16.294957-2.960696-22.728348-8.926609L212.390957 536.464696C205.601391 530.142609 201.728 521.282783 201.728 512s3.85113-18.142609 10.662957-24.464696l509.217391-473.043478c13.445565-12.510609 34.637913-11.798261 47.170783 1.736348 12.55513 13.512348 11.776 34.637913-1.736348 47.193043L284.204522 512l482.860522 448.578783c13.512348 12.53287 14.313739 33.680696 1.736348 47.170783C762.234435 1014.850783 753.307826 1018.434783 744.336696 1018.434783z"
					 p-id="1813" fill="#FFFFFF"></path>
				</svg>
			</view>
			忘记密码
		</view>
		<login-forget-register class="login-demo-box" :modelType="modelType" ref="child" :option="option" @getValidateClick="getValidateClick()"
		 @submitClick="submitClick($event)">
		</login-forget-register>
	</view>

</template>

<script>
	import loginForgetRegister from '@/src/components/login/login-forget-register.vue'
	export default {
		name: "forget-password",
		components: {
			loginForgetRegister
		},
		data() {
			return {
				// 忘记密码FORGET
				modelType: 'FORGET',
				// 只需配置所需
				option: {
					// 倒计时时间，默认为60
					countdown: 90,
					// 密码输入框占位符
					passwordTips: '请输入新密码',
					// 按钮显示字样
					buttonValue: '确认'
				}
			}
		},
		methods: {
			/**
			 * 返回
			 **/
			back() {
				uni.navigateBack();
			},
			/**
			 * 获取验证码按钮点击事件执行函数
			 **/
			getValidateClick() {
				// 获取验证码
				// 请求数据后
				console.log('点击');
				// 开始倒计时
				this.$refs.child.startCountdown();
				uni.showToast({
					title: '动态码已经发送',
					duration: 2000
				});
			},
			/**
			 * 登录，具体登录api对接时，需要判断输入合法性
			 * @param  event 事件回调参数 
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
					msg = '修改密码成功';
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
	.forget-password {
		height: 100%;
		width: 100%;
		padding-top: 1upx;
		background: linear-gradient(#0081e1, #00aaf0);

		.title {
			height: 100upx;
			line-height: 100upx;
			text-align: center;
			font-size: 36upx;
			letter-spacing: 6upx;
			color: #FFFFFF;
			position: relative;
		}

		.to-back {
			position: absolute;
			top: 0px;
			left: 0px;
			width: 100upx;
			height: 100upx;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.login-demo-box {
			margin: 0px 40upx;
			margin-top: 100upx;
		}

	}
</style>
