
##登录组件

### 引入组件如：
```javascript
import loginForgetRegister from '@/lib/ecp/components/login/login-forget-register.vue'
components: {
	loginForgetRegister
},
```
### html
 组件封装了登录、手机号码登录、忘记密码、注册4部分功能
 ```html
<login-forget-register  :modelType="modelType" :showValidate="showValidate" :showPasswordAgain="showPasswordAgain"
 ref="child" :option="option" @getValidateClick="getValidateClick()" @submitClick="submitClick($event)"></login-forget-register>
```


### 配置参数
option:Object  为主要配置，下面例子的值均为默认值，包括每个输入框正则验证、输入框提示、报错信息、字体颜色、按钮底色和字体样式、倒计时开始时间等
modelType:String  组件显示类型，默认值为PASSWORD，密码登录:PASSWORD, 手机：PHONE，忘记密码：FORGET，注册：REGISTER
showValidate:Boolean  密码登录(modelType='PASSWORD')时是否显示验证码，默认为false，显示为：true,不显示：false，用于三次或者多次输入时显示验证码输入
showPasswordAgain:Boolean  忘记密码和注册（modelType为FORGET或REGISTER）是否需要再次输入密码，默认为false不显示，显示为true，用于需要再次输入密码情况
```javascript
				// 密码登录PASSWORD, 手机PHONE,忘记密码FORGET,注册REGISTER, 默认值为PASSWORD
				modelType: 'PASSWORD', 
				// 登录组件,是否显示验证码,
				showValidate: false, 
				// 忘记密码和注册是否需要再次输入密码,
				showPasswordAgain: false, 
				 // option实际使用中只需配置所需，不需要全部配置，下列是默认配置
				option: {
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

```

### 组件实例方法，上面html 中通过ref="child" 把组件实例化后可调用下来方法
 this.$refs.child.startCountdown();  // 获取验证码按钮位置开始倒计时
 this.$refs.child.endCountdown(); // 获取验证码按钮位置结束倒计时

### 事件
 @getValidateClick="getValidateClick()"  // 获取验证码按钮点击调用，此方法执行后可调用startCountdown方法进行倒计时
 @submitClick="submitClick($event)"  // 点击下面登录或者确定按钮触发事件，event参数包括输入值，及值的正确性和全部验证结果isErr（true代表有错）

### 注意，如果验证条件不满足需求时，可以把正则规则设置为不能为空，点击时获取数据再自行进行验证