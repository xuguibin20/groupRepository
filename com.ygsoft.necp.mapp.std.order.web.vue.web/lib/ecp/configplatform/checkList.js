export default {
  'notempty': function (obj) {
    if (obj) {
      var res = obj.getValue()
      return res !== null && res !== ''
    } else {
      return false
    }
  },
  'empty': function (obj) {
    if (obj) {
      var res = obj.getValue()
      return res == null || res === ''
    } else {
      return true
    }
  }
}
