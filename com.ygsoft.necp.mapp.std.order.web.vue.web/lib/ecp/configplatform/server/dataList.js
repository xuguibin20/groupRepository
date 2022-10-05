export default {
  '/aaa': {data: 'aaaa'},
  '/bbb': {res: 'bbbb'},
  '/ccc': {data: [{id: 1, text: '一'}, {id: 2, text: '二'}], count: 100},
  '/ddd': function (params) {
    var res = {data: []}
    if (params === 1) {
      res = {data: [{id: 11, text: '十一'}, {id: 12, text: '十二'}, {id: 12, text: '十三'}]}
    } else if (params === 2) {
      res = {data: [{id: 21, text: '二十一'}, {id: 22, text: '二十二'}, {id: 23, text: '二十三'}]}
    }
    return res
  }
}
