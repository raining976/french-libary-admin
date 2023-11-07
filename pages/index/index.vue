<template>
	<view class="indexPage">
		<view class="welcomeTxt">
			Hi~,这里是法语图书后台管理系统
		</view>
		<el-divider></el-divider>
		<view class="tips">
			tips:请使用电脑端浏览器打开后台链接哦
		</view>
		<view class="content">
			<view class="line title">目前实现的功能:</view>
			<view class="line">🔍 三个表的模糊搜索功能和按照分类搜索功能,空值表示搜索全部</view>
			<view class="line">🔧 用户表的学生认证状态修改和借书状态的修改功能</view>
			<view class="line">🌍 其余功能开发中……</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style scoped lang="scss">
	.indexPage {
		padding: 40px;

		.welcomeTxt {
			font-size: 30px;
			margin: 20px 0;
		}
		.tips{
			color: #e99f45;
			background-color: #fef6ed;
			line-height: 40px;
			padding: 0 20px;
			border-radius: 5px;
		}
		.line {
			line-height: 40px;
		}

		.title {
			font-size: 20px;
			margin: 10px 0;
		}
	}
</style>