<template>
	<view class="login-forget-register">
		<view class="input_wrapper">
			<!-- 用户名,只有账户密码登录才需要 -->
			<view class="inputItem" v-if="modelType==='PASSWORD'">
				<view class="inputContent">
					<view class="input-icon">
						<text class="iconfont iconzhucedengluyonghuming" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<input type="text" @focus="focus('username')" @blur="blur('username')" :placeholder="optionUse.usernameTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="username.inputInfo">
					<view class="inputItem-bottom" :class="{'focus':username.isFocus}" :style="{background:optionUse.iconInputColor}"></view>
				</view>
				<view class="error-message"></view>
			</view>

			<!-- 手机,除了密码登录 -->
			<view class="inputItem" v-if="modelType!=='PASSWORD'">
				<view class="inputContent">
					<view class="input-icon">
						<text class="iconfont iconzhucedengluyonghuming" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<input type="text" @focus="focus('phoneNumber')" @blur="blur('phoneNumber')" :placeholder="optionUse.phoneNumberTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="phoneNumber.inputInfo">
					<view class="inputItem-bottom" :class="{'focus':phoneNumber.isFocus}" :style="{background:optionUse.iconInputColor}"></view>
				</view>
				<view class="error-message"></view>
			</view>

			<!-- 验证码,只要密码登录切不需要验证码的时候 -->
			<view class="inputItem" v-if="!(!showValidate && modelType==='PASSWORD')">
				<view class="inputContent">
					<view class="input-icon">
						<text class="iconfont iconzhucedengluyanzhengma" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<input type="text" @focus="focus('validate')" @blur="blur('validate')" :placeholder="optionUse.validateTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="validate.inputInfo">
					<view :style="{color:optionUse.iconInputColor}" @click="getValidate()">
						{{validateBtValue}}
					</view>
					<view class="inputItem-bottom" :class="{'focus':validate.isFocus}" :style="{background:optionUse.iconInputColor}"></view>
				</view>
				<view class="error-message"></view>
			</view>

			<!-- 密码,除了手机登录 -->
			<view class="inputItem" v-if="modelType!=='PHONE'">
				<view class="inputContent">
					<view class="input-icon">
						<text class="iconfont icondenglumima" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<!-- 显示 -->
					<input v-if="showPassword" type="text" @focus="focus('password')" @blur="blur('password')" :placeholder="optionUse.passwordTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="password.inputInfo">
					<!-- 不显示 -->
					<input v-else type="password" @focus="focus('password')" @blur="blur('password')" :placeholder="optionUse.passwordTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="password.inputInfo">
					<view class="input-icon" @click="changeShowPassword()">
						<text v-if="showPassword" class="iconfont iconmimakejian" :style="{color:optionUse.iconInputColor}"></text>
						<text v-else class="iconfont icondenglu-mimabukejian" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<view class="inputItem-bottom" :class="{'focus':password.isFocus}" :style="{background:optionUse.iconInputColor}"></view>
				</view>
				<view class="error-message"></view>
			</view>

			<!-- 再次输入密码 ,根绝showPasswordAgain设置是否需要再次输入密码-->
			<view class="inputItem" v-if="showPasswordAgain && (modelType=='REGISTER' || modelType=='FORGET')">
				<view class="inputContent">
					<view class="input-icon">
						<text class="iconfont icondenglumima" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<!-- 显示 -->
					<input v-if="showPassword" type="text" @focus="focus('passwordAgain')" @blur="blur('passwordAgain')" :placeholder="optionUse.passwordAgainTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="passwordAgain.inputInfo">
					<!-- 不显示 -->
					<input v-else type="password" @focus="focus('passwordAgain')" @blur="blur('passwordAgain')" :placeholder="optionUse.passwordAgainTips"
					 :placeholderStyle="'color:'+ optionUse.tipsColor" :style="{color:optionUse.iconInputColor}" v-model="passwordAgain.inputInfo">
					<view class="input-icon" @click="changeShowPassword()">
						<text v-if="showPassword" class="iconfont iconmimakejian" :style="{color:optionUse.iconInputColor}"></text>
						<text v-else class="iconfont icondenglu-mimabukejian" :style="{color:optionUse.iconInputColor}"></text>
					</view>
					<view class="inputItem-bottom" :class="{'focus':passwordAgain.isFocus}" :style="{background:optionUse.iconInputColor}"></view>
				</view>
				<view class="error-message"></view>
			</view>
		</view>
		<view>
			<button class="submitBt" @click="submitClick()" :style="{'box-shadow':buttonBoxShadow,'color':optionUse.buttonColor,'background':optionUse.buttonBg}">
				{{optionUse.buttonValue}}
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		name: "login-forget-register",
		props: {
			// 密码登录PASSWORD, 手机PHONE,忘记密码FORGET,注册REGISTER,默认密码登录PASSWORD
			modelType: {
				type: String,
				default: 'PASSWORD'
			},
			// 注册和忘记密码是否需要再次输入密码
			showPasswordAgain: {
				type: Boolean,
				default: false
			},
			// 是否显示验证码，只有在密码登录modelType为PASSWORD时才会用到此变量，true为显示
			showValidate: {
				type: Boolean,
				default: false
			},
			// 输入静态配置，默认请查看optionUse 属性
			option: {
				type: Object,
				default: () => {
					return {}
				}
			}

		},
		data() {
			return {
				// 显示密码
				showPassword: false,
				// 获取验证码按钮字样，倒计时也是通过该变量显示，不倒计时时显示optionUse中配置validateBtValue值
				validateBtValue: '',
				// 禁用获取验证码按钮
				validateBtDisable: false,
				// 倒计时对象
				validateSetInterval: null,
				// 用户名称
				username: {
					// 输入值
					inputInfo: '',
					// 获取焦点
					isFocus: false,
					// 是否错误，true为有错
					errorFlag: false
				},
				// 密码
				password: {
					inputInfo: '',
					isFocus: false,
					errorFlag: false
				},
				// 手机号
				phoneNumber: {
					inputInfo: '',
					isFocus: false,
					errorFlag: false
				},
				// 验证码
				validate: {
					inputInfo: '',
					isFocus: false,
					errorFlag: false
				},
				// 再次输入密码
				passwordAgain: {
					inputInfo: '',
					isFocus: false,
					errorFlag: false
				},
			}
		},
		created() {
			// 初始化validateBtValue，使用optionUse中的配置值
			this.validateBtValue = this.optionUse.validateBtValue;
		},
		computed: {
			// 按钮阴影
			buttonBoxShadow() {
				return '0px 6px 32px ' + this.optionUse.buttonBoxShadow;
			},
			// 静态配置整合
			optionUse() {
				// 默认值
				var use = {
					// 用户名正则表达式
					usernameRule: /\S/,
					// 密码正则表达式
					passwordRule: /\S/,
					// 手机号码正则表达式
					phoneNumberRule: /^1[3456789]\d{9}$/,
					// 验证码正则表达式
					validateRule: /\S/,

					// 用户名输入框占位符
					usernameTips: '手机号/用户名/邮箱',
					// 密码输入框占位符
					passwordTips: '请输入密码',
					// 再次输入密码框占位符
					passwordAgainTips: '再次输入密码',
					// 手机号码输入框占位符
					phoneNumberTips: '手机号',
					// 验证码输入框占位符
					validateTips: '短信动态码',

					// 用户名输错提示信息 
					usernameMsg: '用户名不能为空',
					// 密码输错提示信息 
					passwordMsg: '密码不能为空',
					// 密码不一致提示信息 
					passwordAgainMsg: '密码不一致',
					// 手机号码输错提示信息 
					phoneNumberMsg: '手机号码输入不正确',
					// 验证码输错提示信息 
					validateMsg: '动态码不能为空',

					// 获取验证码按钮显示
					validateBtValue: '发送动态码',
					// 输入框输入时字体颜色,包括前后图标颜色
					iconInputColor: '#FFFFFF',
					// 输入框占位符字体颜色
					tipsColor: 'rgba(255, 255, 255, 0.5)',
					// 按钮背景色，可以设置渐变色
					buttonBg: '#FFFFFF',
					// 按钮字体颜色
					buttonColor: '#1E87F0',
					// 确认按钮字眼
					buttonValue: '登录',
					// 按钮阴影
					buttonBoxShadow: 'rgba(21,65,233,0.45)',
					// 倒计时时间 
					countdown: 60
				}

				// 对象合并，优先使用传入option
				return Object.assign(use, this.option)
			}
		},

		destroyed() {
			// 清除定时器
			this.endCountdown();
		},
		methods: {
			/**
			 * 输入框获取焦点时，设置为获取焦点状态，取消错误状态
			 * @param {string} type 传入输入框对应变量的属性名称
			 **/
			focus(type) {
				// 设置获取焦点状态
				this[type].isFocus = true;
				// 临时取消错误显示,失去焦点时会再次验证
				this[type].errorFlag = false;
			},
			/**
			 * 输入框失去焦点时，设置为失去焦点状态，验证输入正确性并设置errorFlag状态
			 * @param {string} type 传入输入框对应变量的属性名称
			 **/
			blur(type) {
				switch (type) {
					case 'username':
						// 账号输入框
						// 设置为失去焦点
						this.username.isFocus = false;
						// 判断输入正确性
						this.username.errorFlag = !this.optionUse.usernameRule.test(this.username.inputInfo);
						break;
					case 'phoneNumber':
						// 手机号码输入框
						this.phoneNumber.isFocus = false;
						this.phoneNumber.errorFlag = !this.optionUse.phoneNumberRule.test(this.phoneNumber.inputInfo);
						break;
					case 'password':
						// 密码输入框
						this.password.isFocus = false;
						this.password.errorFlag = !this.optionUse.passwordRule.test(this.password.inputInfo);
						// 需要再次输入密码时判断两次输入是否一样
						if (this.showPasswordAgain) {
							this.passwordAgain.errorFlag = this.password.inputInfo !== this.passwordAgain.inputInfo;
						}
						break;
					case 'passwordAgain':
						// 再次输入密码输入框
						this.passwordAgain.isFocus = false;
						// 需要再次输入密码时判断两次输入是否一样
						this.passwordAgain.errorFlag = this.password.inputInfo !== this.passwordAgain.inputInfo;
						break;
					case 'validate':
						// 验证码输入框
						this.validate.isFocus = false;
						this.validate.errorFlag = !this.optionUse.validateRule.test(this.validate.inputInfo);
						break;
					default:
						// 全部验证
						this.username.errorFlag = !this.optionUse.usernameRule.test(this.username.inputInfo);
						this.phoneNumber.errorFlag = !this.optionUse.phoneNumberRule.test(this.phoneNumber.inputInfo);
						this.password.errorFlag = !this.optionUse.passwordRule.test(this.password.inputInfo);
						this.passwordAgain.errorFlag = this.password.inputInfo !== this.passwordAgain.inputInfo;
						this.validate.errorFlag = !this.optionUse.validateRule.test(this.validate.inputInfo);
						break;
				}
			},
			/**
			 * 封装Toast
			 * @param {string} msg 提示信息
			 **/
			showTips(msg) {
				uni.showToast({
					title: msg,
					icon: 'none',
					duration: 2500
				});
			},
			/**
			 * 密码可见和隐藏
			 **/
			changeShowPassword() {
				this.showPassword = !this.showPassword;
			},
			/**
			 *  获取验证码按钮，点击后触发事件
			 **/
			getValidate() {
				this.$emit('getValidateClick', true);
			},
			/**
			 *  登录按钮点击，验证后触发事件，传递输入框信息对象
			 **/
			submitClick() {
				// 执行blur验证，验证全部输入框
				this.blur('');
				// 报错信息
				var msg = 'modelType设置有误';
				// 总体输入验证结果，是否有错误，true是有错，false无错
				var isErr = true;
				// 外传（抛）数据
				var emitData = {};
				// 根据modelType对应验证并报错，最后生成输出数据
				switch (this.modelType) {
					case 'PASSWORD':
						// 密码登录情况
						// 用户名是否有错
						if (this.username.errorFlag) {
							msg = this.optionUse.usernameMsg;
						} else if (this.password.errorFlag) {
							msg = this.optionUse.passwordMsg;
						} else if (this.validate.errorFlag && this.showValidate) {
							// 在需要验证码的时候验证验证码
							msg = this.optionUse.validateMsg;
						} else {
							// 总体输入验证结果设为false无错
							isErr = false;
						}

						// 生成输出信息
						emitData = this.createEmitData(['username', 'password', 'validate']);
						// 外传总体提输入验证结果
						emitData.isErr = isErr;
						break;
					case 'PHONE':
						// 手机号码登录情况
						if (this.phoneNumber.errorFlag) {
							msg = this.optionUse.phoneNumberMsg;
						} else if (this.validate.errorFlag) {
							msg = this.optionUse.validateMsg;
						} else {
							// 总体输入验证结果设为false无错
							isErr = false;
						}
						emitData = this.createEmitData(['phoneNumber', 'validate']);
						emitData.isErr = isErr;
						break;
					default:
						// 注册输入情况和忘记密码输入情况，相同的验证方法写到一起
						if (this.modelType === 'REGISTER' || this.modelType === 'FORGET') {
							if (this.phoneNumber.errorFlag) {
								msg = this.optionUse.phoneNumberMsg;
							} else if (this.password.errorFlag) {
								msg = this.optionUse.passwordMsg;
							} else if (this.showPasswordAgain && this.passwordAgain.errorFlag) {
								msg = this.optionUse.passwordAgainMsg;
							} else if (this.validate.errorFlag) {
								msg = this.optionUse.validateMsg;
							} else {
								// 总体输入验证结果设为false无错
								isErr = false;
							}

							// 需要再次输入密码情况，和不需要再次输入密码情况
							var arr = this.showPasswordAgain ? ['password', 'passwordAgain', 'phoneNumber', 'validate'] : ['password',
								'phoneNumber', 'validate'
							];
							emitData = this.createEmitData(arr);
							emitData.isErr = isErr;
						} else {
							// 都不是时设置为错误true
							isErr = true;
						}
						break;
				}

				if (isErr) {
					// 输出报错
					this.showTips(msg);
					return false;
				} else {
					// 触发事件，外传数据
					this.$emit('submitClick', emitData);
				}

			},

			/**
			 *  生成返回数据
			 * @param {string[]} arr  需要生成的属性信息，
			 **/
			createEmitData(arr) {
				var createData = {};
				arr.forEach(element => {
					// 获取输入值
					createData[element] = this[element].inputInfo;
					// 获取该输入值的验证情况
					createData[`${element}Err`] = this[element].errorFlag;
				});
				return createData;
			},
			/**
			 *  验证码按钮开始倒计时
			 **/
			startCountdown() {
				// 判断是否禁用，防止多次触发
				if (this.validateBtDisable) {
					return;
				}
				// 触发一次启动禁用，防止多次触发
				this.validateBtDisable = true;
				// 清除上一次,防止程序出错
				this.endCountdown();
				// 使用配置信息中的倒计时设置
				var count = this.optionUse.countdown;
				this.validateSetInterval = setInterval(() => {
					count--;
					if (count < 0) {
						this.endCountdown();
					} else {
						this.validateBtValue = count + 's';
					}
				}, 1000);

			},
			/**
			 *  验证码按钮结束倒计时，清除倒计时，并初始化
			 **/
			endCountdown() {
				// 清除倒计时
				clearInterval(this.validateSetInterval);
				// 还原按钮字样
				this.validateBtValue = this.optionUse.validateBtValue;
				// 设置可点击状态
				this.validateBtDisable = false;

			}
		}
	}
</script>

<style src="./lib/iconfont/iconfont.css" scoped>
</style>
<style lang="scss" scoped>
	.login-forget-register {
		margin: 0 auto;

		//用户名、密码输入框
		.input_wrapper {

			.inputItem {
				font-size: 32upx;

				.inputContent {
					padding: 0upx;
					height: 80upx;
					display: flex;
					flex-direction: row;
					justify-content: start;
					align-items: center;
					position: relative;

					.input-icon {
						text {
							font-size: 42upx;
							padding: 0upx 10upx;
						}
					}

					input {
						margin-left: 0upx;
						font-size: 32upx;
						border: none;
						outline: none;
						width: 100%;
						flex: 1;
						letter-spacing: 4upx;
					}

					.inputItem-bottom {
						width: 100%;
						height: 2upx;
						position: absolute;
						bottom: 0px;
						border-radius: 4upx;
					}

					.focus {
						height: 2upx !important;
					}
				}

				.error-message {
					width: 100%;
					height: 80upx;
					text-align: right;
				}
			}

		}

		.submitBt {
			font-size: 36upx;
			height: 80upx;
			border-radius: 40upx;
			text-align: center;
			line-height: 80upx;
			letter-spacing: 6upx;
			font-weight: 500;
		}

	}
</style>
