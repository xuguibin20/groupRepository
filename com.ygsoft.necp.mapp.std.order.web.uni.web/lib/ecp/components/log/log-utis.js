export default {
	// 存储log名称
	logName: 'tplog',
	// 最大存储数量,默认100
	maxCount: 100,

	/**
	 * log打印函数
	 * @param err 打印内容 
	 **/
	log: function(err) {
		this.setLog(err, 'log')
	},
	/**
	 * error打印函数
	 * @param err 打印内容 
	 **/
	error: function(err) {
		this.setLog(err, 'error')
	},
	/**
	 * warn打印函数
	 * @param err 打印内容 
	 **/
	warn: function(err) {
		this.setLog(err, 'warn')
	},

	/**
	 * 写入log 、error、warn,存在在Storage中
	 * @param err 打印内容 
	 * @param type 打印类型 log 、error、warn
	 **/
	setLog: function(err, type) {
		// 不是log 、error、warn不写入
		if (type !== 'error' && type !== 'log' && type !== 'warn') {
			return
		}
		var errList = uni.getStorageSync(this.logName) || [],
			// 打印时间
			date = new Date();
		// 如果数量到达最大值,删除最后一个,为这次写入腾出位置
		if (errList.length >= this.maxCount) {
			errList.pop();
		}
		// 每个新打印都会添加到,数组第一个元素
		errList.unshift({
			date: date,
			type: type,
			message: err
		})
		// 写入到本地storage
		uni.setStorageSync(this.logName, errList);
		// 每次改变都会触发logChange事件
		this.logChange();
	},

	/**
	 * 获取全部log 
	 **/
	getLog: function() {
		return uni.getStorageSync(this.logName);
	},

	/**
	 * 清除全部log 
	 **/
	clearAllLog: function() {
		uni.removeStorageSync(this.logName);
		this.logChange();
	},

	/**
	 * logChange事件回调,用于监听更新,只在Log.vue组件中使用,不建议使用在其他地方
	 * 可以在使用的时候进行改写回调
	 **/
	logChange: function() {

	},

	// 设置存储log的名称
	// setLogName: function(name) {
	// 	this.logName = name;
	// },

	// 重置
	// resetLog: function() {
	// 	uni.removeStorageSync(this.logName);
	// 	this.logName = 'tplog';
	// 	this.maxCount = 50;
	// 	this.logChange();
	// },

}
