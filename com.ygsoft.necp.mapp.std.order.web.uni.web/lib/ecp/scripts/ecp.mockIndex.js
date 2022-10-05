import SN from './ecp.service.js'
import ecpMock from './ecp.mock.js'
// import {
// 	data
// } from './user.js'
/*
import axios from 'axios'
import mockAdapter from 'axios-mock-adapter'
*/

export default {
	init() {
		// ecp 接口的mock对象
		// eslint-disable-next-line new-cap
		let ecpmock = new ecpMock(SN)
		ecpmock.doPost('/success').reply(200, {
			msg: 'success'
		})
		// 天擎需要用相对路径，
		var url = 'ecp/mapp/demo/query/education/findListWithPage'
		ecpmock.doPost(url).reply({
			'a': '通过mock返回的数据',
			'b': '2'
		})

		url = '/ecp/mapp/demo/service/employee/addData'
		ecpmock.doPost(url).reply({
			'数据': '7f4d3arb56734576545fda80c2bb51ff',
			'结果': 'PUT成功'
		})

		url = '/ecp/mapp/demo/service/employee/addDataSync'
		ecpmock.doPost(url).reply({
			'sync': 'true',
			'data': 'PUT同步上传成功'
		})

		url = '/ecp/mapp/demo/service/employee/deleteData'
		ecpmock.doPost(url).reply({
			'result': 'true',
			'结果': '删除成功'
		})

		url = '/ecp/mapp/demo/service/employee/deleteDataSync'
		ecpmock.doPost(url).reply({
			'sync': 'true',
			'data': '同步删除成功'
		})

		url = '/aaa'
		ecpmock.doPost(url).reply(200, {
			data: 'aaa'
		})

		url = '/bbb'
		ecpmock.doPost(url).reply(200, {
			res: 'bbb'
		})

		url = 'ecp/mapp/province'
		ecpmock.doPost(url).reply(200, {
			data: ''
		})

		url = 'ecp/mapp/city'
		ecpmock.doPost(url).reply(200, function(params) {
			var id = params[0]
			if (id === 1) {
				return {
					data: ''
				}
			} else if (id === 2) {
				return {
					data: ''
				}
			} else {
				return {
					data: ''
				}
			}
		})

		url = 'ecp/mapp/menus'
		ecpmock.doPost(url).reply(200, {
			data: ''
		})

		var serverName = 'com.ygsoft.ecp.app.operator.system.service.context.IXtdyfaContext'
		var methods = 'findUserList'
		ecpmock.doPost(serverName, methods).reply(200, {
			'data': '成功'
		})
		/*
		// 标准axios 的mock
		// eslint-disable-next-line new-cap
		var mock = new mockAdapter(axios)
		mock.onGet('/users').reply(200, {
		  users: [
		    {id: 1, name: 'sys'}
		  ]
		})
		*/
	}
}
