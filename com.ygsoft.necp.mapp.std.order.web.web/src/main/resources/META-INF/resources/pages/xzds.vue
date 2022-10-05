<template>
   <div class="page-container xzds-0" candrop="ecp-rect">    <table class="gridLayout xzds-1" candrop="grid-layout"><tbody><tr></tr></tbody></table><div class="col-12 xzds-2" candrop="ecp-col"><div class="mainContainer xzds-3" candrop="ecp-rect"><div class="col-12 xzds-4" candrop="ecp-flex-vertical"><div candrop="ecp-flex-col" class=" xzds-5"><div class="col-12 xzds-6" candrop="ecp-rect"><div class="col-3 xzds-7" candrop="ecp-col"><div class="ellipsis xzds-8">  标签：销售订单（新增）</div>    </div></div></div><div candrop="ecp-flex-col" class=" xzds-9"></div></div><div class="col-12 xzds-10" candrop="ecp-flex-vertical"><div candrop="ecp-flex-col" class=" xzds-11"><table class="gridLayout xzds-12" candrop="grid-layout"><tbody><tr><td candrop="grid-layout-col" class=" xzds-13"><div class="ellipsis xzds-8">收货人：  </div>        </td><td candrop="grid-layout-col" class=" xzds-14"><div class="ellipsis xzds-8">订单备注：  </div>        </td><td candrop="grid-layout-col" class=" xzds-14"><div class="ellipsis xzds-8">订单id：  </div>        </td></tr><tr><td candrop="grid-layout-col"><div class="ellipsis xzds-8">收货地址：  </div>        </td><td candrop="grid-layout-col"><div class="ellipsis xzds-8">联系方式：  </div>        </td><td candrop="grid-layout-col"></td></tr></tbody></table></div>      <el-button com="el-button" size="mini" ref="el_button_urx6" class=" xzds-15">新增行</el-button><div candrop="ecp-flex-col" class=" xzds-16"><div class="col-1 xzds-17" candrop="ecp-col"><el-button com="el-button" size="mini" ref="el_button_xnlv" class=" xzds-18">删除行</el-button>    </div></div></div><div class="col-12 xzds-19" candrop="ecp-flex-vertical"><div candrop="ecp-flex-col" class=" xzds-20"><div class="col-12 xzds-21" candrop="ecp-col"><qzz-grid com="qzz-grid" ref="qzzgrid_9719" :option="{'colModels.caption':' ','colModels.selectAll':false,'colModels.backgroundColor':' ','colModels.align':'left','colModels.color':' ','colModels.titleFit':'false','colModels.contentFit':'false','colModels.multiSelect':'false','colModels.editable':'true','titleFit':false,'autoFitHeightOffset':' ','colModels.sum':'false','suitToFit':false,'initSort':false,'colModels.groups':'false','cellEdit':true,'colModels.groupsEmpty':'false','colModels.showTime':'false','sumAllLevel':false,'isExpanded':true,'multiSelect':false,'colModels.numUnit':'1','colModels.required':'false','multiFirst':true,'filter':true,'colModels.ellipsis':'true','colModels.disInput':'false','sort':true,'pager':true,'colModels.showHint':'false','pageSize':'10','rowHeight':'36','colModels.maxValue':' ','subtotal':false,'total':false,'treeGrid':false,'shrinkToFit':true,'rownumbers':true,'colModels.length':'15','colModels.unCheck':'false','Align':'alTop','id':'qzzgrid_9719','colModels':[{'name':'field1','hint':false,'caption':'商品名单','lockWidth':false},{'name':'field2','hint':false,'caption':'商品单价','lockWidth':false},{'name':'field3','hint':false,'caption':'数量','lockWidth':false},{'name':'field4','hint':false,'caption':'金额','lockWidth':false}],'colNames':['商品名单','商品单价','数量','金额'],'height':300}" v-model="qzzgrid_9719.data" class=" xzds-22"></qzz-grid>    <div class="col-12 xzds-23" candrop="ecp-rect"><div class="col-12 xzds-24" candrop="ecp-col"></div></div></div><div class="mainContainer xzds-25" candrop="ecp-rect"></div></div><div candrop="ecp-flex-col" class=" xzds-9"></div></div><div class="col-12 xzds-19" candrop="ecp-flex-vertical"><div candrop="ecp-flex-col" class=" xzds-26"></div><div candrop="ecp-flex-col" class=" xzds-26"></div></div></div></div></div>
</template>

<script>
  import ctl from './js/xzds'
  export default ctl
</script>
<style lang="less">
.page-container {


.xdeer-ecp-button1.ecpButton,.xdeer-ecp-button1.el-dropdown .el-button {color:#162b41;
}

.ecp-input-container.xdeer-x-input input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input1 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input2 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input4 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input5 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input7 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input6 input.el-input__inner{font-size:14px;
}

.ecp-input-container.xdeer-x-input8 input.el-input__inner{font-size:14px;
}

.el-select.xdeer-x-select2 input.el-input__inner{background-color:transparent;
}

.el-select.xdeer-x-select1 input.el-input__inner{background-color:transparent;
}

.el-select.xdeer-x-select input.el-input__inner{background-color:transparent;
}

#elbutton_3744{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(84, 157, 218);font-size:14px;
}

#elbutton_056{width:100px;height:28px;border-width:1px;border-style:solid;border-color:rgb(221, 221, 221);font-size:14px;
}width:  100%;
 height:  100%;
  position:  relative;
  background-color:  rgb(255, 255, 255);
  min-width:  1024px;
  min-height:  720px;

        .xzds-0 {
            width:  100%;
		 height:  100%;
		  position:  relative;
		  background-color:  rgb(255, 255, 255);
		  min-width:  1024px;
		  min-height:  720px;
		
        }
        

        .xzds-1 {
            width:  100%;
		  float:  left;
		  border-color:  rgb(128, 128, 128);
		  padding:  0px;
		  margin-left:  0px;
		  margin-right:  0px;
		  margin-bottom:  0px;
		  border-width:  0px;
		
        }
        

        .xzds-2 {
            border-color:  rgb(51, 51, 51);
		  min-height:  0px;
		  position:  relative;
		
        }
        

        .xzds-3 {
             height:  900px;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px 0px 50px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		
        }
        

        .xzds-4 {
            height:  200px;
		  display:  flex;
		  flex-flow:  column nowrap;
		  border-color:  rgb(68, 68, 68);
		  min-height:  1px;
		  padding:  0px;
		  margin:  0px;
		  position:  relative;
		
        }
        

        .xzds-5 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		
        }
        

        .xzds-6 {
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
        

        .xzds-7 {
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
        

        .xzds-8 {
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
        

        .xzds-9 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		
        }
        

        .xzds-10 {
            height:  200px;
		  display:  flex;
		  flex-flow:  column nowrap;
		  border-color:  rgb(68, 68, 68);
		  min-height:  1px;
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		
        }
        

        .xzds-11 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  border-color:  rgb(68, 68, 68);
		  border-width:  0px;
		  padding:  0px;
		  margin:  0px;
		  position:  relative;
		
        }
        

        .xzds-12 {
            width:  100%;
		  float:  left;
		  border-color:  rgb(128, 128, 128);
		  padding:  0px;
		  margin-left:  0px;
		  margin-right:  0px;
		  margin-bottom:  0px;
		
        }
        

        .xzds-13 {
            width:  100px;
		  min-width:  40px;
		  border-color:  rgb(68, 68, 68);
		  padding:  1px;
		  margin:  0px;
		  border-width:  0px;
		  position:  relative;
		
        }
        

        .xzds-14 {
            width:  100px;
		  position:  relative;
		
        }
        

        .xzds-15 {
            width:  100px;
		  height:  28px;
		  border-width:  1px;
		  border-style:  solid;
		  border-color:  rgb(84, 157, 218);
		  font-size:  14px;
		
        }
        

        .xzds-16 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		
        }
        

        .xzds-17 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		  position:  relative;
		
        }
        

        .xzds-18 {
            width:  100px;
		  height:  28px;
		  border-width:  1px;
		  border-style:  solid;
		  border-color:  rgb(221, 221, 221);
		  font-size:  14px;
		
        }
        

        .xzds-19 {
            height:  200px;
		  display:  flex;
		  flex-flow:  column nowrap;
		  border-color:  rgb(68, 68, 68);
		  min-height:  1px;
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .xzds-20 {
            display:  flex;
		  width:  100%;
		  flex:  1 1 auto;
		  position:  relative;
		
        }
        

        .xzds-21 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		  position:  relative;
		  height:  300px;
		  padding:  0px;
		  margin:  0px;
		
        }
        

        .xzds-22 {
            overflow:  hidden;
		  top:  0px;
		  left:  0px;
		  width:  1351px;
		  height:  300px;
		  font-size:  14px;
		  position:  absolute;
		
        }
        

        .xzds-23 {
            min-height:  20px;
		  height:  auto;
		  width:  100%;
		  outline:  none;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .xzds-24 {
            border-color:  rgb(51, 51, 51);
		  min-height:  28px;
		
        }
        

        .xzds-25 {
             height:  200px;
		  border-color:  rgb(68, 68, 68);
		  padding:  0px;
		  margin:  0px;
		  border-width:  0px;
		
        }
        

        .xzds-26 {
            display: flex;
		 width: 100%;
		 flex-basis: auto;
		 flex-grow:  1;
		  flex-shrink:  1;
		
        }
        
}
</style>