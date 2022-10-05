
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
option.sceneId = '9e19daa6ed54d0b712ee7d74744c15ef'
var controller = Controller.create(option)

export default {
	mixins: [ controller.createVueMixins() ],
	data () {
		var vueModel = controller.createVueModel()
		return vueModel
	}
}