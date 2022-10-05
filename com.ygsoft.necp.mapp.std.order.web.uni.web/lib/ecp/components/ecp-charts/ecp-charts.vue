<template>
	<VUniCanvas 
		class="charts" 
		style="background-color: #fff;" 
		:style="{'width':cWidth+'px','height':cHeight+'px'}"  
		:id="id" 
		:canvas-id="id" 
		:width="cWidth" 
		:height="cHeight" 
		@touchstart="touchColumn"></VUniCanvas>
</template>
<script>
	import uCharts from '@/components/u-charts/u-charts.js';
	
	const ID_NUM = 7;
	// var _selfcharts; 	
	// let canvas = null;
	
	export default {
		name: 'ecpCharts',
		props: {
			// id: {
			// 	type: String,
			// 	default: 'uchartscanvas'
			// },
			type: {
				type: String,
				default: 'arcbar'
			},
			width: {
				type: [Number, String],
				default: 375
			},
			height: {
				type: [Number, String],
				default: 500
			},
			chartData: {
				type: Object,
				default: v => {
					return {
						"series": [{
							"name": "完成率",
							"data": 0.85,
							"color": "#335fff"
						}]
					}
				}
			},
			config: {
				type: Object,
				default: v => {
					return {
						categories: 'categories',
						series: 'series',
						seriesName: 'name',
						seriesData: 'data',
						seriesColor: 'color'
					}
				}
			}
		},
		data() {
			return {
				id: '',
				cWidth: '',
				cHeight: '',
				pixelRatio: 1,
				canvas:{}
			};
		},
		mounted() {
			// _selfcharts = this;

			this.cWidth = uni.upx2px(this.width);
			this.cHeight = uni.upx2px(this.height);

			this.id = this.random(ID_NUM);
			this.showColumn();
		},
		methods: {
			// 生成图表
			showColumn() {
				console.log('生成图表 start');
				let series = [];
				if(!this.chartData[this.config.series][0]){
					return;
				}
				this.chartData[this.config.series].forEach(item => {
					series.push({
						name: item[this.config.seriesName],
						data: item[this.config.seriesData],
						color: item[this.config.seriesColor],
					})
				})
				var _selfcharts = this,
					seriesData = _selfcharts.config.seriesData;
				this.canvas = new uCharts({
					$this: _selfcharts,
					canvasId: _selfcharts.id,
					type: _selfcharts.type,
					fontSize: 12,
					background: '#EEEEEE',
					pixelRatio: _selfcharts.pixelRatio,
					animation: true,
					categories: _selfcharts.chartData[_selfcharts.config.categories],
					series: series,
					colors: ['#f04864', '#1890ff', '#facc14', '#0b974e', '#8543e0', '#2fc25b'],
					xAxis: {
						disableGrid: true
					},
					yAxis: {
						min: 0,
						format: val => {
							return val.toFixed(0);
						},
						titleFontColor: '#ff0000',
						title: ''
					},
					legend: {
						show: true,
						position: 'top',
						float: 'center',
						itemGap: 10,
						padding: 5,
						lineHeight: 26,
						margin: 5,
						borderWidth: 1
					},
					padding: [5, 35, 5, 5],
					dataLabel: true,
					width: _selfcharts.cWidth,
					height: _selfcharts.cHeight,
					title: {
						name: (_selfcharts.chartData[_selfcharts.config.series][0]['data'] * 100).toFixed(2) + '%',
						color: '#7cb5ec',
						fontSize: 25 * _selfcharts.pixelRatio,
					},
					subtitle: {
						name: _selfcharts.chartData[_selfcharts.config.series][0]['name'],
						color: '#666666',
						fontSize: 15 * _selfcharts.pixelRatio,
					},
					extra: {
						column: {
							type: 'group',
							width: (_selfcharts.cWidth * _selfcharts.pixelRatio * 0.5) / series.length
						},
						pie: {
							labelWidth: 15
						}
					}
				});
				console.log('生成图表 end', this.canvas);

			},
			//
			// 点击图表显示tooltip
			touchColumn(e) {
				if (this.type != 'pie') {
					this.canvas.showToolTip(e, {
						textList: [{
							text: '日期:'
						}, {
							text: 'OEE:'
						}],
						format: function(item, category) {
							this.textList = [{
									text: item.name + ': ' + item.data.value + (item.name == 'OEE' ? '%' : '')
								},
								{
									text: '日期 : ' + item.data.day
								}
							];
						}
					});
				} else {
					this.canvas.showToolTip(e, {
						textList: [],
						format: function(item, category) {
							let p = Math.round(item._proportion_ * 10000) / 100;
							this.textList = [{
								text: item.name + ' : ' + item.data + '分钟'
							}, {
								text: '占比 : ' + p + '%'
							}];
						}
					});
				}
			},
			random(num) {
				let idString = '';
				for(var i = 0; i < num; i++){
					idString += Math.floor(Math.random()*10);
				}
				return idString;
			}
		},
		watch: {
			'chartData': {
				// 监听数据变化后重新生成图表
				handler(newName, oldName) {
					console.log('----------------------------');
					console.log(newName);
					console.log(oldName);
					console.log('----------------------------');
					setTimeout(() => {
						this.showColumn();
					}, 100);
				},
				immediate: true,
				deep: true
			}
		}
	};
</script>
<style scoped>
</style>
