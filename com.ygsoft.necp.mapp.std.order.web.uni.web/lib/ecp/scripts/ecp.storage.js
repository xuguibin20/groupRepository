/**
 * 缓存工具类
 * H5端为localStorage，浏览器限制5M大小，是缓存概念，可能会被清理
 * App端为原生的plus.storage，无大小限制，不是缓存，是持久化的
 */

function Storage() {

}

Storage.prototype = {
	/**
	 * 同步设置缓存
	 */
	setSync: function(key, data) {
		uni.setStorageSync(key, data)
		console.log('setStorageSync Success');
	},
	/**
	 * 异步设置缓存
	 * @param {Object} key
	 * @param {Object} data
	 */
	set: function(key, data) {
		return new Promise(function(resolve, reject) {
			uni.setStorage({
				key: key,
				data: data,
				success: (result) => {
					resolve(result)
					console.log('setStorage success')
				},
				fail: function(err) {
					reject(err)
					console.log('setStorage fail')
				}
			})
		})
	},
	/**
	 * 同步获取缓存
	 * @param {Object} key
	 */
	getSync: function(key) {
		const data = uni.getStorageSync(key);
		console.log('getStorageSync Success');
		return data
	},
	/**
	 * 异步获取缓存
	 * @param {Object} key
	 */
	get: function(key) {
		return new Promise(function(resolve, reject) {
			uni.getStorage({
				key: key,
				success: (result) => {
					resolve(result)
					console.log('getStorage success')
				},
				fail: () => {
					reject()
					console.log('getStorage fail')
				}
			})
		})
	},
	/**
	 * 异步获取所有缓存
	 */
	getInfo: function() {
		return new Promise(function(resolve, reject) {
			uni.getStorageInfo({
				success: (result) => {
					resolve(result)
					console.log('getStorageInfo success')
				},
				fail: () => {
					reject()
					console.log('getStorageInfo fail')
				}
			})
		})
	},
	/**
	 * 同步删除缓存
	 * @param {Object} key
	 */
	removeSync: function(key) {
		uni.removeStorageSync(key);
		console.log('removeStorageSync Success');
	},
	/**
	 * 异步删除缓存
	 * @param {Object} key
	 */
	remove: function(key) {
		return new Promise(function(resolve, reject) {
			uni.removeStorage({
				key: key,
				success: (result) => {
					resolve(result)
					console.log('removeStorage success')
				},
				fail: () => {
					reject()
					console.log('removeStorage fail')
				}
			})
		})
	},
	/**
	 * 设置缓存统一API
	 * @param {Object} key
	 * @param {Object} data
	 * @param {Object} sync 是否同步 true:同步 false:异步 可不填
	 * @return {同步：成功不返回，失败抛出对象；异步：返回promise对象}
	 */
	setStorage: function(key, data, sync) {
		var setData = ''
		if (sync == null || sync === '') {
			sync = false;
		}
		if (sync !== false) {
			// setData = () => this.setSync(key, data);
			//为了调用方便，不以promise对象返回
			try {
				uni.setStorageSync(key, data)
				console.log('setStorageSync Success');
			} catch (e) {
				throw e
			}
		} else {
			setData = () => this.set(key, data);
			return (async () => setData())();
			// return Promise.try(setData)
		}
	},
	/**
	 * 获取缓存统一API
	 * @param {Object} key
	 * @param {Object} sync 是否同步 true:同步 false:异步 可不填
	 * @return {同步：成功返回缓存信息，失败抛出异常；异步：返回promise对象}
	 */
	getStorage: function(key, sync) {
		var getData = ''
		if (sync == null || sync === '') {
			sync = false;
		}
		if (sync !== false) {
			// getData = () => this.getSync(key);
			//为了调用方便，不以promise对象返回
			let data = ''
			try {
				data = uni.getStorageSync(key);
				console.log('getStorageSync Success');
			} catch (e) {
				throw e
			}
			return data
		} else {
			getData = () => this.get(key);
			return (async () => getData())();
			// return Promise.try(getData)
		}
	},
	/**
	 * 获取所有缓存统一API
	 * @param {Object} sync 是否同步 true:同步 false:异步 可不填
	 * @return {同步：成功返回所有缓存信息，失败抛出异常；异步：返回promise对象}
	 */
	getStorageInfo: function(sync) {
		var getInfoData = ''
		if (sync == null || sync === '') {
			sync = false;
		}
		if (sync !== false) {
			//为了调用方便，不以promise对象返回
			let data = ''
			try {
				data = uni.getStorageInfoSync();
				console.log('getStorageInfoSync Success');
			} catch (e) {
				throw e
			}
			return data
		} else {
			getInfoData = () => this.getInfo();
			return (async () => getInfoData())();
			// return Promise.try(getInfoData)
		}
	},
	/**
	 * 删除缓存统一API
	 * @param {Object} key
	 * @param {Object} sync 是否同步 true:同步 false:异步 可不填
	 * @return {同步：成功不返回，失败抛出异常；异步：返回promise对象}
	 */
	removeStorage: function(key, sync) {
		var removeData = ''
		if (sync == null || sync === '') {
			sync = false;
		}
		if (sync !== false) {
			// removeData = () => this.removeSync(key);
			try {
				uni.removeStorageSync(key);
				console.log('removeStorageSync Success');
			} catch (e) {
				throw e
			}
		} else {
			removeData = () => this.remove(key);
			return (async () => removeData())();
			// return Promise.try(removeData)
		}
	},
	/**
	 * 清空缓存统一API
	 * @param {Object} sync 是否同步 true:同步 false:异步 可不填
	 * @return {成功不返回，失败抛出异常}
	 * @return {同步：成功不返回，失败抛出异常；异步：不返回}
	 */
	clearStorage: function(sync) {
		if (sync == null || sync === '') {
			sync = false;
		}
		if (sync !== false) {
			try {
				uni.clearStorageSync();
				console.log('clearStorageSync Success');
			} catch (e) {
				throw e
			}
		} else {
			uni.clearStorage();
			console.log('clearStorage Success');
		}
	}
}

// window.Storage = new Storage()

export default new Storage()
