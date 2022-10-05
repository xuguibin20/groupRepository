<template>
	<view>
		<view class="img-list-wrap">
			<view class="img-list">
				<view class="img-item" v-for="(v, i) in tempFilePaths" :key="i" :style="{ width: `${1 / col * 100}%` }">
					<view class="img-wrap">
						<image class="img" :src="v" mode="aspectFill" @tap="previewImg(v)"></image>
						<view class="btn-del">
							<uni-icons class="btn-del-icon" type="closeempty" size="24" color="#ffffff" @tap="delImg(i)"></uni-icons>
						</view>
					</view>
				</view>
				<view class="img-item" :style="{ width: `${1 / col * 100}%` }" v-show="remain > 0">
					<view class="btn-add" @click="openPopup">
						<uni-icons type="plus" size="48" color="#999"></uni-icons>
					</view>
				</view>
			</view>
		</view>
		<uni-popup ref="popup" type="bottom">
			<view class="action-list">
				<view class="action-item" @click="chooseImg('camera')" v-if="sourceType.camera">
					<view class="body">拍照</view>
					<uni-icons type="camera" class="icon" size="32" color="#007AFF"></uni-icons>
				</view>
				<view class="action-item" @click="chooseImg('album')" v-if="sourceType.album">
					<view class="body">照片图库</view>
					<uni-icons type="images" class="icon" size="32" color="#007AFF"></uni-icons>
				</view>
			</view>
			<view class="action-list">
				<view class="action-item btn-close" @click="closePopup">取消</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	export default {
		components: {
			uniPopup,
			uniIcons
		},
		props: {
			opts: {
				type: Object,
				default: () => ({})
			},
			col: {
				type: [Number, String],
				default: 3
			}
		},
		data() {
			return {
				tempFiles: []
			};
		},
		computed: {
			sourceType() {
				let isArray = Array.isArray(this.opts.sourceType)
				return ['album', 'camera'].reduce((a, k) => {
					a[k] = !isArray || isArray && ~this.opts.sourceType.indexOf(k)
					return a;
				}, {})
			},
			sizeType() {
				return this.opts.sizeType || ['original', 'compress']
			},
			count() {
				return this.opts.count || 2
			},
			remain() {
				return this.count - this.tempFiles.length
			},
			tempFilePaths() {
				return this.tempFiles.map(v => v.path)
			}
		},
		methods: {
			chooseImg(sourceType) {
				this.$refs.popup.close()
				if (!this.sourceType[sourceType]) {
					uni.showToast({
						title: `非法操作`,
						icon: 'none',
						position: 'center'
					})
					return;
				}
				if (this.remain <= 0) {
					uni.showToast({
						title: `仅可选${this.count}张`,
						icon: 'none',
						position: 'center'
					})
					return;
				}
				uni.chooseImage({
					count: this.remain,
					sizeType: this.sizeType,
					sourceType: [sourceType],
				}).then(args => {
					this.$emit('chooseimg', args)
					const [err, res] = args
					if (err) {
						return;
					}
					if (res.tempFiles.length > this.remain) {
						uni.showToast({
							title: `仅可选${this.count}张`,
							icon: 'none',
							position: 'center'
						})
					}
					this.tempFiles.push(...res.tempFiles.slice(0, this.remain))
					this.$emit('changeimg', this.tempFilePaths)
				}).catch(err => {
					this.$emit('chooseimg', [err])
				})
			},
			delImg(idx) {
				const f = this.tempFiles.splice(idx, 1);
				this.$emit('delimg', f)
				this.$emit('changeimg', this.tempFilePaths)
			},
			previewImg(imgUrl) {
				uni.previewImage({
					urls: [imgUrl]
				})
			},
			openPopup() {
				this.$refs.popup.open()
			},
			closePopup() {
				this.$refs.popup.close()
			}
		}
	}
</script>

<style src="./ecp-upload.css"></style>
