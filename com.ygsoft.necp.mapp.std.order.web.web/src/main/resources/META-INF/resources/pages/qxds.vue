<template>
   <div class="page-container qxds-0" candrop="ecp-rect">    <div class="col-12 qxds-1" candrop="ecp-rect"><div class="col-3 qxds-2" candrop="ecp-col"><div class="ellipsis qxds-3"> 标签：销售订单（新增）</div></div></div><div class="col-12 qxds-4" candrop="ecp-col"><div candrop="ecp-flex-col" class=" qxds-5"><table class="gridLayout qxds-6" candrop="grid-layout"><tbody><tr><td candrop="grid-layout-col" class=" qxds-7"><div class="ellipsis qxds-3">收货人：</div></td><td candrop="grid-layout-col" class=" qxds-8"><div class="ellipsis qxds-3">订单备注：</div></td><td candrop="grid-layout-col" class=" qxds-8"><div class="ellipsis qxds-3">订单id：</div></td></tr><tr><td candrop="grid-layout-col"><div class="ellipsis qxds-3">收货地址：</div></td><td candrop="grid-layout-col"><div class="ellipsis qxds-3">联系方式：</div></td><td candrop="grid-layout-col"></td></tr></tbody></table></div></div><div class="col-12 qxds-9" candrop="ecp-col"><div candrop="ecp-flex-col" class=" qxds-10"><div class="col-1 qxds-4" candrop="ecp-col"><el-button com="el-button" size="mini" ref="el_button_0pu2" class=" qxds-11">新增行</el-button></div></div></div><div class="col-12 qxds-4" candrop="ecp-col"><div candrop="ecp-flex-col" class=" qxds-10"><div class="col-1 qxds-4" candrop="ecp-col"><el-button com="el-button" size="mini" ref="el_button_h3wu" class=" qxds-11">删除行</el-button></div></div></div><div class="col-12 qxds-12" candrop="ecp-col"><qzz-grid com="qzz-grid" ref="id_9668" :option="{'colModels.caption':' ','colModels.selectAll':false,'colModels.backgroundColor':' ','colModels.align':'left','colModels.color':' ','colModels.titleFit':'false','colModels.contentFit':'false','colModels.multiSelect':'false','colModels.editable':'true','titleFit':false,'autoFitHeightOffset':' ','colModels.sum':'false','suitToFit':false,'initSort':false,'colModels.groups':'false','cellEdit':true,'colModels.groupsEmpty':'false','colModels.showTime':'false','sumAllLevel':false,'isExpanded':true,'multiSelect':false,'colModels.numUnit':'1','colModels.required':'false','multiFirst':true,'filter':true,'colModels.ellipsis':'true','colModels.disInput':'false','sort':true,'pager':true,'colModels.showHint':'false','pageSize':'10','rowHeight':'36','colModels.maxValue':' ','subtotal':false,'total':false,'treeGrid':false,'shrinkToFit':true,'rownumbers':true,'colModels.length':'15','colModels.unCheck':'false','Align':'alTop','id':'qzzgrid_9719','colModels':[{'name':'field1','hint':false,'caption':'商品名单','lockWidth':false},{'name':'field2','hint':false,'caption':'商品单价','lockWidth':false},{'name':'field3','hint':false,'caption':'数量','lockWidth':false},{'name':'field4','hint':false,'caption':'金额','lockWidth':false}],'colNames':['商品名单','商品单价','数量','金额'],'height':300}" v-model="id_9668.data" class=" qxds-13"></qzz-grid><div class="col-12 qxds-14" candrop="ecp-rect"><div class="col-12 qxds-15" candrop="ecp-col"></div></div></div></div>
</template>

<script>
  import ctl from './js/qxds'
  export default ctl
</script>
<style lang="less">
.page-container {


#id_8493{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(221, 221, 221);font-size:14px;
}

#id_3210{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(221, 221, 221);font-size:14px;
}

#id_9229{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(221, 221, 221);font-size:14px;
}

#id_3928{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(221, 221, 221);font-size:14px;
}width:  100%;
 height:  100%;
  position:  relative;
  min-width:  1024px;
  min-height:  720px;

        .qxds-0 {
            width:  100%;
		 height:  100%;
		  position:  relative;
		  min-width:  1024px;
		  min-height:  720px;
		
        }
        

        .qxds-1 {
             height:  auto;
		  width:  100%;
		  outline:  none;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		  background-repeat:  repeat;
		  background-size:  100% 100%;
		
        }
        

        .qxds-2 {
            border-color:  rgb(51, 51, 51);
		  min-height:  0px;
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		  display:  block;
		  justify-content:  center;
		  align-items:  center;
		  background-repeat:  no-repeat;
		  background-size:  cover;
		  background-position:  center 0px;
		  position:  relative;
		  height:  150px;
		
        }
        

        .qxds-3 {
            text-overflow:  ellipsis;
		  line-height:  28px;
		  font-size:  14px;
		  color:  rgb(68, 68, 68);
		  border-color:  rgb(68, 68, 68);
		  border-style:  none;
		  border-width:  0px;
		  border-radius:  0px;
		  padding:  0px;
		  margin:  0px;
		  text-align:  start;
		  font-family:  微软雅黑;
		  font-weight:  400;
		  font-style:  normal;
		
        }
        

        .qxds-4 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		  position:  relative;
		
        }
        

        .qxds-5 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  border-color:  rgb(68, 68, 68);
		  border-width:  0px;
		  padding:  0px;
		  margin:  0px;
		  position:  relative;
		
        }
        

        .qxds-6 {
            width:  100%;
		  float:  left;
		  border-color:  rgb(128, 128, 128);
		  padding:  0px;
		  margin-left:  0px;
		  margin-right:  0px;
		  margin-bottom:  0px;
		
        }
        

        .qxds-7 {
            width:  100px;
		  min-width:  40px;
		  border-color:  rgb(68, 68, 68);
		  padding:  1px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		
        }
        

        .qxds-8 {
            width:  100px;
		  position:  relative;
		
        }
        

        .qxds-9 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		  position:  relative;
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .qxds-10 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .qxds-11 {
            width:  100px;
		  height:  28px;
		  border-width:  1px;
		  border-style:  solid;
		  border-color:  rgb(221, 221, 221);
		  font-size:  14px;
		
        }
        

        .qxds-12 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		  position:  relative;
		  height:  300px;
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .qxds-13 {
            overflow:  hidden;
		  top:  0px;
		  left:  0px;
		  width:  1359px;
		  height:  300px;
		  font-size:  14px;
		  position:  absolute;
		
        }
        

        .qxds-14 {
            min-height:  20px;
		  height:  auto;
		  width:  100%;
		  outline:  none;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .qxds-15 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		
        }
        
}
</style>