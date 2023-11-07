<template>
	<view class="userListPage">
		<el-form :inline="true" :model="formData" class="demo-form-inline" @keydown.native.enter='onSubmit'>
			<el-form-item label="查询">
				<el-input v-model="formData.keyword" placeholder="姓名,学号" clearable></el-input>
			</el-form-item>
			<el-form-item label="认证状态">
				<el-select v-model="formData.stuAuthStatus" placeholder="请选择" clearable>
					<el-option :label="item.label" :value="item.value" v-for="(item,index) in options"
						:key='index'></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit">查询</el-button>
			</el-form-item>
		</el-form>
		<view class="content" v-show='!isLoading'>
			<el-table :data="usersData" stripe style="width: 100%" height="480">
				<el-table-column type="index" label="序号"></el-table-column>
				<el-table-column prop="userInfo.avatarUrl" label="头像" width="100">
					<template v-slot="{row}">
						<el-avatar size="medium" :src="row.userInfo.avatarUrl"></el-avatar>
					</template>
				</el-table-column>
				<el-table-column prop="userInfo.nickName" label="昵称" width="120"></el-table-column>
				<el-table-column prop="userInfo.gender" label="性别" width="80">
					<template v-slot="{row}">
						<view>{{genderTxt[row.userInfo.gender]}}</view>
					</template>
				</el-table-column>
				<el-table-column prop="Sname" label="姓名" width="80"></el-table-column>
				<el-table-column prop="SNo" label="学号"></el-table-column>
				<el-table-column prop="userInfo.stuAuthStatus" label="认证状态">
					<template v-slot="{ row }">
						<el-select v-model="row.userInfo.stuAuthStatus" placeholder="请选择" @change='selectChange(row)'>
							<el-option v-for="item in options" :key="item.value" :label="item.label"
								:value="item.value">
								<template v-slot="{ option }">
									<el-tag :type="tagTypeList[item.value]">{{ item.label }}</el-tag>
								</template>
							</el-option>
						</el-select>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="curPageNum" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
			<el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
				<view class="dialogContent">
					确定要将<text class="dialogText">{{selectedItem.Sname}}</text>同学的学生状态设置为<el-tag
						:type="tagTypeList[selectedItem.userInfo.stuAuthStatus]">{{options[selectedItem.userInfo.stuAuthStatus].label}}</el-tag>
				</view>
				<span slot="footer" class="dialog-footer">
					<el-button @click="cancelChangeStatus">取 消</el-button>
					<el-button type="primary" @click="confimChangeStatus">确 定</el-button>
				</span>
			</el-dialog>
		</view>
		<el-skeleton :rows="12" animated :loading='isLoading' />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				genderTxt: ["男", '女'],
				formData: {
					keyword: "",
					stuAuthStatus: "",
				},
				usersData: [], // 用户列表数据,
				pageSize: 10, // 每页的条数
				curPageNum: 1, // 当前页码数
				total: 0, // 总数
				tagTypeList: ['warning', 'success', 'info', 'danger'],
				options: [{
					label: '未认证',
					value: 0,
				}, {
					label: '认证成功',
					value: 1,
				}, {
					label: '正在审核',
					value: 2,
				}, {
					label: '认证失败',
					value: 3,
				}], // 认证状态选择
				isLoading: true,
				selectedItem: {
					Sname: '',
					SNo: '',
					userInfo: {
						stuAuthStatus: 0
					}
				},
				dialogVisible: false, // 模态框可见性

			};
		},
		onShow() {
			this.getUsersData()
		},
		methods: {
			// 获取用户列表信息
			getUsersData() {
				this.formData.pageSize = this.pageSize
				this.formData.skipCount = this.pageSize * (this.curPageNum - 1)
				this.isLoading = true
				this.$api.searchUsers(this.formData).then(res => {
					// console.log(res)
					this.usersData = res.data.data
					this.total = res.data.total
					this.isLoading = false
				})
			},

			// 改变用户状态
			async changeUserAuthStatus(data) {
				await this.$api.changeUserAuthStatus(data)
				const tipMsg =
					`您已经将${this.selectedItem.Sname}同学的认证状态修改为:${this.options[this.selectedItem.userInfo.stuAuthStatus].label}!`
				this.operateSuccessTip(tipMsg)
				this.getUsersData()
			},
			operateSuccessTip(tipMsg) {
				const h = this.$createElement;
				this.$notify({
					title: '操作成功',
					message: h('i', {
						style: 'color: teal'
					}, tipMsg)
				});
			},
			onSubmit() {
				this.getUsersData()
			},

			// select改变
			selectChange(e) {
				this.selectedItem = e
				this.dialogVisible = true
			},

			// 当前页大小改变
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
				this.pageSize = val
				this.curPageNum = 1
				this.getUsersData()

			},

			// 当前页数改变
			handleCurrentChange(val) {
				this.curPageNum = val
				console.log(`当前页: ${val}`);
				this.getUsersData()
			},

			// 取消改变状态
			cancelChangeStatus() {
				this.dialogVisible = false
				this.getUsersData()
			},

			// 确定改变状态
			confimChangeStatus() {
				this.dialogVisible = false
				const formData = {
					user_id:this.selectedItem.user_id,
					stuAuthStatus:this.selectedItem.userInfo.stuAuthStatus
				}
				this.changeUserAuthStatus(formData)
			}
		}
	}
</script>

<style lang="scss">
	.userListPage {
		padding: 20px;

		.avatarImg {
			width: 40px;
			height: 40px;
		}
	}
</style>