
import TFLOW from 'necp.tflow.components'
import 'necp.tflow.components/dist/tflow/css/tflow.css'
import Vue from 'vue'
Vue.use(TFLOW)


var Tswan = require('necp.tswan.components')
var Controller = Tswan.SinglePageController

var option = {}
option.webPath = '/orderweb/necp/mapp/orderweb'
option.classId = 'aa1'
option.typeId = 'sellorder1'
option.sceneId = 'd6f367e5200c81ab305d772768ebd82b'
var controller = Controller.create(option)

export default {
	mixins: [ controller.createVueMixins() ],
	data () {
		var vueModel = controller.createVueModel()
		return vueModel
	}
}