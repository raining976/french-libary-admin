<template>
	<view class="left-window">
		<el-menu default-active="1">
			<el-menu-item v-for="(item,index) in menuList" :key='index' @click='goPage(item)'>
				<i :class="item.iconClass"></i>
				<span>{{item.title}}</span>
			</el-menu-item>
		</el-menu>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menuList: [{
						title: "主页",
						url: '/pages/index/index',
						iconClass: 'el-icon-s-home',
					},
					{
						title: "图书管理",
						url: '/pages/books/books',
						iconClass: 'el-icon-s-management'
					},
					{
						title: "借书管理",
						url: '/pages/borrow-list/borrow-list',
						iconClass: 'el-icon-s-order'
					},
					{
						title: "用户管理",
						url: '/pages/users/users',
						iconClass: 'el-icon-user-solid'
					},
				],
				curIndex: 0,
			};
		},

		watch: {
			// '$route.path'(val) {
			// 	console.log(val)
			// 	if (val.includes('users')) this.curIndex = 3
			// 	else if (val.includes('borrow-list')) this.curIndex = 2
			// 	else if (val.includes('books')) this.curIndex = 1
			// 	else this.curIndex = 0

			// }
		},
		mounted() {

		},
		methods: {
			goPage(item) {
				uni.navigateTo({
					url: item.url
				})
			},

		}
	}
</script>

<style lang="scss">
	.left-window {
		width: 200px;

		ul {
			height: calc(100vh - 44px);
		}
	}
</style>