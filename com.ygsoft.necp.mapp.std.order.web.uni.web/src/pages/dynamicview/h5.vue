<script>
	import * as Tswan from 'necp.tswan.mobile.components';
	import Vue from 'vue'
	var H5DynamicView = Tswan.H5DynamicView;
	var option = getApp().$route.query;	
	var components = require('necp.tswan.mobile.components');
    var pageController = components.SinglePageController;
	var controller = pageController.create(option);

	export default {
		mixins: [H5DynamicView.createH5ProxyMixins(), controller.createVueMixins()],
		data() {
			var vueModel = controller.createVueModel()
			vueModel.current=0
			vueModel.isLast = 0
			return vueModel
		},
		onReady:function(e){
			if (this.$refs.content_tab && this.$refs.content_tab.values.length === 1) {
				this.isLast = 1;
			}
		},
	    methods: {
	        onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex;							
					if (this.$refs.content_tab && this.current == this.$refs.content_tab.values.length - 1) {					
						this.isLast = 1
					} else {
						this.isLast = 0
					}
				}
			},
			next() {
				this.current++;
				if (this.$refs.content_tab && this.current == this.$refs.content_tab.values.length - 1) {
					this.isLast = 1
				}
			}
	    },
	    mounted: function () {
    		controller.initSinglePage(this);
			var pageTitle = option._innerMenuTitle;
			if (pageTitle) {
				uni.setNavigationBarTitle({
					title: pageTitle
				});
			}
    	}
}
</script>
<style>
.col-5 {
	float: left;
	position: relative;
	min-height: 34px;
}
.col-5 {
	width: 50%;
}
.ellipsis {
	line-height: 28px;
}
.toolbar-next-btn {
	height: 50px;
	background: #fff;
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	display: -webkit-box;
	display: -webkit-flex;
	display: flex;
}
.btn_tool-bar-item {
	width: 50%;
	position: relative;
	display: block;
	margin-left: auto;
	margin-right: auto;
	padding: 0px;
	padding-right: 14px;
	box-sizing: border-box;
	font-size: 18px;
	text-align: center;
	text-decoration: none;
	line-height: 2.55555556;
	-webkit-tap-highlight-color: transparent;
	overflow: hidden;
	color: #666;

	cursor: pointer;
	border-top: 1px solid #e4e4e4;
}
.btn_next {
	border-left: 1px solid #e4e4e4;
}
.verticalMiddle {
	display: -webkit-box;
	display: flex;
	display: -webkit-flex;
	-webkit-align-items: center;
	-webkit-box-align: center;
	align-items: center;
}
.mainContainer {
	min-height: 200px;
	height: 100%;
	overflow: visible;
	position: relative;
	background-color: rgb(255, 255, 255);
	padding: 0px 0px;
	margin: 0px;
	border-width: 0px;
}
.childernCls {
	height: auto;
	width: 100%;
	outline: none;
	padding: 0px;
	margin: 0px;
	border-width: 0px;
	min-height: 34px;
	background-color: rgba(0, 0, 0, 0);
	border-color: rgb(0, 0, 0);
}
.item_lable_group {
	width: 100%;
	background-color: #f5f5f5;
	line-height: 45px;
	height: 45px;
	padding-left: 15px;
}
.item_lable_tag {
	width: 100%;
	background-color: #f5f5f5;
	line-height: 45px;
	height: 45px;
	padding-right: 15px;
}

.item_lable {
	text-align: start;
	min-height: 46px;
	height: 46px;
	background-color: rgba(0, 0, 0, 0);
	border-width: 0px 0px 1px;
	border-style: solid;
	border-color: rgb(229, 229, 229);
	padding: 0px;
	margin: 0px;
	padding-left: 15px;
}
.item_lable_text {
	text-overflow: ellipsis;
	line-height: 34px;
	font-size: 14px;
	color: rgb(51, 51, 51);
	padding: 0px;
	margin: 0px;
	text-align: start;
	font-family: 微软雅黑;
	background-color: rgba(0, 0, 0, 0);
	font-weight: 400;
	font-style: normal;
	text-decoration: none;
	white-space: nowrap;
}
.item_lable_tag  .item_lable_text{
	width: 100%;
	text-align: right;
}
.item_content {
	min-height: 46px;
	height: 46px;
	font-size: 14px;
	text-align: right;
	border-width: 0px 0px 1px;
	border-style: solid;
	border-color: rgb(229, 229, 229);
	padding: 0px;
	margin: 0px;
	float: right;
	padding-right: 15px;
}

.action-item {
	font-size: 14px;
}
>>> .uni-list-item__container {
	padding: 0rpx;
}
>>> .uni-list-item__extra-text,
>>> .uni-input-input {
	font-size: 14px;
}
>>> .uni-input-placeholder,
>>> .enum-select-placeholder {
	font-size: 14px;
	color: #999;
}

>>> .enum-select-input {
	float: right;
}

>>> .add-btn {
	position: relative;

	float: left;
	width: 100%;
	border-bottom: 1px solid #e4e4e4;
}

>>> .table-item-content {
	position: relative;
	float: left;
}
>>> .single-page-table {
	bottom: 0px;
	position: relative;
}
.col-12 {
	padding-bottom: 25px;
}

>>> .mobile-placeholder {
	font-size: 14px;
	color: #999;
}

>>> .mobile-value {
	font-size: 14px;
	color: #333;
}

.btn-save {
	background: #2c9ae6;
	color: white;
}

>>> .mobile-value .uni-list-item__extra-text {
	font-size: 14px;
	color: #333;
}

>>> .mobile-placeholder .uni-list-item__extra-text {
	font-size: 14px;
	color: #999;
}

>>> .popup-header .btn {
	font-size: 14px;
}

>>> .segmented-control__text {
	font-size: 14px;
}

.tab-position {
	position: fixed;
	width: 100%;
	background: white;
	z-index: 99;
}

.content-position {
	padding-top: 42px;
	background: #f5f5f5;
}

>>> ::-webkit-scrollbar {
	display: none;
	height: 0 !important;
	width: 0 !important;
	-webkit-appearance: none;
	background: transparent;
}
</style>