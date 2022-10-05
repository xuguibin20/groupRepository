<template>
	<view id="scrollList" class="ts-list index" v-bind:style="[{'min-height': secondHeight + 'px' }]">
		<!-- 筛选组件调用 -->
		<!-- <search :mode="2" button="inside" @search="search($event)"></search> -->
		<!-- 数据列表 -->
		<view class="list-box">
			<!-- <view style="margin-top: 90upx;"></view> -->
			<view class="container_of_slide" v-for="(item,index) in list" :key="index">
				<!--  -->
				<view class="slide_list" @click="getDetail(item)" hover-class="uni-list-cell-hover" 
				 @tap="recover(index)" @touchstart="touchStart($event,index)" @touchend="touchEnd($event,index)" @touchmove="touchMove($event,index)">
					<view class="now-message-info" :style="{width:Screen_width+'px'}" @click="getDetail(item)">
						<!-- <view class="icon-circle">{{item.surname}}</view> -->
						<view class="list-right">
							<view class="list-title">{{item.xtywbillVO.deptname || '-'}}<text style="font-size: 18px;color:#CCCCCC">(部门)</text></view>
							<view class="list-detail">{{item.xtywbillVO.ttime}}</view>
						</view>
						<view class="list-right-1">
							{{item.xtywbillVO.summoney}}
						</view>
					</view>
					<view class="bottom-message-info" :style="{width:Screen_width+'px'}">
						<view class="bottom-list-right">
							单号：{{item.xtywbillVO.billid}}
						</view>
						<view class="bottom-list-right-1">
							报销人：-
						</view>
					</view>
					<!-- <view class="group-btn">
						<view class="top btn-div" @tap="top(item.id)" v-if="item.isShare">
							分享
						</view>
						<view class="removeM btn-div" @tap="removeM(index, item.id)">
							删除
						</view>
					</view>
					<view style="clear:both"></view> -->
				</view>
			</view>
		</view>
		<!-- 分享弹窗 -->
		<!-- <view mode="top-right" class="scan-box" v-if="visible">
			<view class="scan-item">
				<view class="scan-content">
					<view class="scan-icon">
						<image src="../../static/slide-list/icon-scan.png" class="scan-icon-img"></image>
					</view>
					<image src="../../static/slide-list/fork.png" class="scan-btn" @click="cancelEvent"></image>
					<image :src="img" class="scan-img"></image>
					<view class="scan-text">
						扫一扫查看分享信息
					</view>
				</view>
			</view>
		</view> -->
		<!-- 浮动添加按钮 -->
		<!--<view class="btn-plusempty" hover-class="bottom-btn-hover" @click="addCustomer">
			<image src="../../static/slide-list/jiahao.png" class="plusempty-img"></image>
		</view> -->
	</view>
</template>

<script>
	// import search from '../search/search.vue'
	var entityUtil = require('../../../node_modules/necp.tswan.mobile.components/packages/utils/necp.genentity.vue.util');

	export default {
		components: {
			// search
		},
		name: 'ts-list',
		computed: {
			Screen_width() {
				return uni.getSystemInfoSync().windowWidth;
			}
		},
		props:{
			pageNum: {
				type: Number,
				default: 1
			},
			pageSize: {
				type: Number,
				default: 5
			},
			url: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				img: '../../static/slide-list/qr_code.png',
				visible: false,
				start_slide_x: 0,
				btnWidth: 0,
				startX: 0,
				LastX: 0,
				startTime: 0,
				screenName: '',
				list : [],
				btuBottom: '0',
				secondHeight: '',
				classId: "",
				typeId: "",
				noData: false,
				pageNums: this.pageNum,  // 页码
				pageSizes: this.pageSize,  // 每页数量
				dataCount: 0,  // 数据总数
				screenHeight: 0, // 屏幕高度
				isLoading: false,  // 防止频繁触发
				bottomDistinct: 200 // 距离底部多少像素时触发
				
			};
		},
		mounted() {
			// 页面加载时取得屏幕高度
			this.screenHeight = uni.getSystemInfoSync().screenHeight
			// 测试数据（初始化） gris.ywdj 1002163
			
			this.refreshData()
		},
		onLoad(option) {
			this.classId = option.classId
			this.typeId = option.typeId
		},
		onShow() {
			const res = uni.getSystemInfoSync();
			// 计算主体部分高度,单位为px
			this.secondHeight = res.windowHeight
		},
		methods: {
			refreshData() {
				var self = this
				var url = "/necp/mapp/order/service/dem/component/query/entityproxy/findPageByConditions"
				url = url + "?classId=" + this.classId
				url = url + "&typeId=" + this.typeId
				url = url + "&page=" + this.pageNums
				url = url + "&pageSize=" + this.pageSizes
				var conditions = []
				entityUtil.doPost(url, conditions, function(data) {
					if(data) {
						// 如果有数据返回
						
						self.list = self.list.concat(data)
						if(data.length > 0) {
							self.dataCount = self.dataCount + data.length
						} else {
							self.noData = true
						}
						
					} else {
						self.noData = true
					}
				});
			},
			cancelEvent(){
				this.visible = false
			},
			search(e, val) {
				this.screenName = e
				// console.log('点击搜索')
			},
			addCustomer(){
				// console.log('点击添加按钮')
			},
			getDetail(item){
				// console.log('查看详情')
			},
			// 滑动开始
			touchStart(e, index) {
				//记录手指放上去的时间
				this.startTime = e.timeStamp;
				//记录滑块的初始位置
				this.start_slide_x = this.list[index].slide_x;
				// 按钮宽度
				uni.createSelectorQuery()
					.selectAll('.group-btn')
					.boundingClientRect()
					.exec(res => {
						if (res[0] != null && res[0][index] != null) {
							this.btnWidth = res[0][index].width * -1;
						}
					});
				// 记录上一次开始时手指所处位置
				this.startX = e.touches[0].pageX;
				// 记录上一次手指位置
				this.lastX = this.startX;
				//初始化非当前滑动消息列的位置
				this.list.forEach((item, eq) => {
					if (eq !== index) {
						item.slide_x = 0;
					}
				});
			},
			// 滑动中
			touchMove(e, index) {
				const endX = e.touches[0].pageX;
				const distance = endX - this.lastX;
				// 预测滑块所处位置
				const duang = this.list[index].slide_x + distance;
				// 如果在可行区域内
				if (duang <= 0 && duang >= this.btnWidth) {
					this.list[index].slide_x = duang;
				}
				// 此处手指所处位置将成为下次手指移动时的上一次位置
				this.lastX = endX;
			},
			// 滑动结束
			touchEnd(e, index) {
				let distance = 10;
				const endTime = e.timeStamp;
				const x_end_distance = this.startX - this.lastX;
				if (Math.abs(endTime - this.startTime) > 200) {
					distance = this.btnWidth / -2;
				}
				// 判断手指最终位置与手指开始位置的位置差距
				if (x_end_distance > distance) {
					this.list[index].slide_x = this.btnWidth;
				} else if (x_end_distance < distance * -1) {
					this.list[index].slide_x = 0;
				} else {
					this.list[index].slide_x = this.start_slide_x;
				}
				// 获取SelectorQuery 对象实例
				const query = uni.createSelectorQuery().in(this)
				query.select('#scrollList').boundingClientRect(data => {
					let {
						height // scrollList节点高度
					} = data
					}).exec()
				
			},
			// 点击回复原状
			recover(index) {
				this.list[index].slide_x = 0;
			},
			
			/**
			 * 页面滑动事件
			 */
			onPageScroll: function(e) {
				var self = this
				const {
					scrollTop  // 滚动条距离页面顶部的像素
				} = e
				
				// 防止重复触发
				if(this.isLoading) {
					return;
				}
				// 获取SelectorQuery 对象实例
				const query = uni.createSelectorQuery().in(this)
				
				// 为listArea节点绑定查询请求
				query.select('#scrollList').boundingClientRect(data => {
					let {
						height // scrollList节点高度
					} = data
					// 如果设置的事件触发距离 大于等于 （节点高度 - 屏幕高度 - 滚动条到顶部的距离）
					if(!self.noData && this.bottomDistinct >= height - this.screenHeight - scrollTop) {
						// 阻止事件重复触发
						self.isLoading = true
						// 模拟异步请求加载数据
						uni.showToast({
							title: "获取新数据"
						})
						setTimeout(() => {
							if(!self.noData) {
								this.pageNums = this.pageNums + 1
								this.isLoading = false
								this.refreshData()
							}
						}, 500)
					}
				}).exec()
			}
		}
	};
</script>

<style scoped>
	.index{
		background: #F8F8F8;
	}
	.list-box{
		padding: 20upx 0;
	}
	.container_of_slide {
		overflow: hidden;
		margin-bottom: 20px;
	}

	.slide_list {
		background: #FFFFFF;
		transition: all 100ms;
		transition-timing-function: ease-out;
		min-width: 200%;
		border: 1px solid #eeeeee;
		box-shadow: 0px 2px 1px 0px #cacaca;
	}

	.now-message-info {
		position: relative;
		box-sizing:border-box;
		display: flex;
		align-items: center;
		/* justify-content: space-between; */
		font-size: 16px;
		clear:both;
		height: 160upx;
		padding: 0 30upx;
	}
	
	.bottom-message-info {
		position: relative;
		height: 60px;
		font-size: 16px;
		overflow: hidden;
		align-items: center;
		display: flex;
		border-top: 1px solid #eeeeee;
		padding: 0 16px;
	}
	
	.bottom-list-right{
		font-size: 18px;
		width: 193px;
		float: left;
		color: #666666;
		margin-left: 25upx;
		margin-right: 30upx;
	}
	.bottom-list-right-1{
		font-size: 18px;
		position: absolute;
		right: 30px;
		float: right;
		color: #666666;
	}
		
	.group-btn {
		float: left;
	}

	.group-btn {
		display: flex;
		flex-direction: row;
		height: 160upx;
		min-width: 100upx;
		align-items: center;

	}

	.group-btn .btn-div {
		height: 160upx;
		color: #fff;
		text-align: center;
		padding: 0 50upx;
		font-size: 34upx;
		line-height: 160upx;
	}

	.group-btn .top {
		background-color: #c4c7cd;
	}

	.group-btn .removeM {
		background-color: #ff3b32;
	}
	
	
	.icon-circle{
		background: #3396fb;
		border-radius: 100%;
		width:100upx;
		height: 100upx;
		line-height:100upx;
		text-align:center;
		color: #FFFFFF;
		font-weight: bold;
		font-size: 20px;
		float: left;
	}
	.list-right{
		float: left;
		margin-left: 25upx;
		margin-right: 30upx;
		padding-top: 10px;
	}
	.list-right-1{
		position: absolute;
		font-size: 20px;
		right: 30px;
		float: right;
		color: #FF6000;
	}
	.list-title{
		font-size: 20px;
		width: 350upx;
		line-height:1.5;
		overflow:hidden;
		margin-bottom: 10upx;
		color:#333333;
		display:-webkit-box;
		-webkit-box-orient:vertical;
		-webkit-line-clamp:1;
		overflow:hidden;
	}
	.list-detail{
		width: 350upx;
		font-size: 18px;
		color: #666666;
		display:-webkit-box;
		-webkit-box-orient:vertical;
		-webkit-line-clamp:1;
		overflow:hidden;
	}
	.button-box{
		box-sizing: border-box;
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		z-index: 998;
		background: #F8F8F8;
	}
	.btn-sub{
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		-webkit-box-pack: center;
		-webkit-justify-content: center;
		justify-content: center;
		-webkit-box-align: center;
		-webkit-align-items: center;
		align-items: center;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		float: left;
		width: 100%;
		height: 100upx;
		background: #F8F8F8;
		color: #7fb2ff;
	}
	.btn-plusempty{
		width: 110upx;
		height: 110upx;
		background: #007bfa;
		position: fixed;
		bottom: 50upx;
		right: 20upx;
		border-radius: 100%;
		overflow: hidden;
		text-align: center;
		line-height: 110upx;
	}
	.empty{
		color: #999999;
	}
	.plusempty-img{
		width: 50upx;
		height: 50upx;
		margin-top: 30upx;
	}
	.scan-box{
		display:block;
		position:fixed;
		top:0;
		bottom:0;
		left:0;
		right:0;
		background-color:rgba(0, 0, 0, 0.3);
		z-index:99999;
	}
	.scan-item{
		display:-webkit-box;
		display:-webkit-flex;
		display:-ms-flexbox;
		display:flex;
		position:relative;
		margin:0 auto;
		width:80%;
		height:100%;
		-webkit-box-pack:center;
		-webkit-justify-content:center;
		-ms-flex-pack:center;
		justify-content:center;
		-webkit-box-align:center;
		-webkit-align-items:center;
		-ms-flex-align:center;
		align-items:center;
		-webkit-box-sizing:border-box;
		box-sizing:border-box;
		opacity:1;

	}
	.scan-content{
		position:relative;
		width: 400upx;
		height: 500upx;
		background: #FFFFFF;
		border-radius: 20upx;
	}
	.scan-icon{
		position: absolute;
		top: -50upx;
		left: 150upx;
		width: 100upx;
		height: 100upx;
		border-radius: 100%;
		box-sizing:border-box;
		background: #FFFFFF;
		padding: 20upx;
	}
	.scan-icon-img{
		width: 100%;
		height: 100%;
	}
	.scan-text{
		position: absolute;
		bottom: 40upx;
		left: 0;
		width: 100%;
		text-align: center;
		font-size: 14px;
	}
	.scan-share{
		width: 100%;
		height: 100%;
	}
	.scan-img{
		width: 300upx;
		height: 300upx;
		margin: auto;
		display: block;
		position: absolute;
		top: 80upx;
		left: 50upx;
		z-index: 99;
	}
	.scan-btn{
		top:-30upx;
		left:auto;
		right:-30upx;
		bottom:auto;
		position:absolute;
		width:64upx;
		height:64upx;
		border-radius:50%;
		z-index:99999;
		display: flex;
	}
	.uni-list-cell-hover {
		background-color: #eeeeee;
	}
	.bottom-btn-hover{
		background: #0564c7!important;
	}
</style>
