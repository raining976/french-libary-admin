<template>
	<view class="borrowListPage">
		<el-form :inline="true" :model="formData" class="demo-form-inline" @keydown.native.enter='onSubmit'>
			<el-form-item label="查询">
				<el-input v-model="formData.keyword" placeholder="书名,作者,借书者" clearable></el-input>
			</el-form-item>
			<el-form-item label="借书状态">
				<el-select v-model="formData.status" placeholder="借书状态" clearable>
					<el-option :label="item.label" :value="item.value" v-for="(item,index) in options"
						:key='index'></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit">查询</el-button>
			</el-form-item>
		</el-form>
		<view class="content" v-show="!isLoading">
			<el-table :data="borrowListData" stripe style="width: 100%" height="450">
				<el-table-column label="序号" type="index" fixed="left"></el-table-column>
				<el-table-column prop="bookInfo.BName" label="书名" width="180"></el-table-column>
				<el-table-column prop="bookInfo.BNo" label="编号" width="80"></el-table-column>
				<el-table-column prop="bookInfo.Author" label="作者" width="90"></el-table-column>
				<el-table-column prop="stuInfo.SName" label="借书人" width="80"></el-table-column>
				<el-table-column prop="stuInfo.SNo" label="学号" width="120"></el-table-column>
				<el-table-column sortable prop="borrowTime" label="借书时间" width="120"></el-table-column>
				<el-table-column prop="returnBookTime" label="预期还书时间" width="120"></el-table-column>
				<el-table-column label="借阅状态" fixed="right">
					<template v-slot="{ row }">
						<el-select v-model="row.status" placeholder="请选择" @change='selectChange(row)'>

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
					确定要将<text class="dialogText">{{selectedItem.stuInfo.SName}}</text>同学借的 <text
						class="dialogText">{{selectedItem.bookInfo.BName}}</text> 的状态设置为<el-tag
						:type="tagTypeList[selectedItem.status]">{{options[selectedItem.status].label}}</el-tag>
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
	import moment from 'moment';
	export default {
		data() {
			return {
				dialogVisible: false, // 是否显示模态框
				selectedItem: {
					stuInfo: {
						SName: ""
					},
					bookInfo: {
						BName: ""
					},
					status: 0
				},
				borrowListData: [], // 列表数据
				formData: {
					keyword: "",
					status: "",
				}, // 查询表单
				total: 0, // 当前查询总条数,
				tagTypeList: ['warning', 'success', 'info', 'danger'],
				options: [{
					label: "还未取",
					value: 0,
				}, {
					label: "已取到",
					value: 1,
				}, {
					label: "已归还",
					value: 2,
				}, {
					label: "逾期未还",
					value: 3,
				}, ], // 借书状态
				curPageNum: 1, // 当前页码
				total: 0, // 总页码
				pageSize: 10, // 当前页的大小(每页多少条),
				isLoading: false, // 是否正在加载
			};
		},
		onShow() {
			this.getBorrowList()
		},
		methods: {
			getBorrowList() {
				this.formData.skipCount = this.pageSize * (this.curPageNum - 1)
				this.formData.pageSize = this.pageSize
				this.isLoading = true
				this.$api.searchBorrowList(this.formData).then(res => {
					this.total = res.data.total
					this.borrowListData = res.data.data
					this.borrowListData.forEach((item) => {
						item.borrowTime = moment(item.borrowTime).format('YYYY-MM-DD');
						item.returnBookTime = moment(item.returnBookTime).format('YYYY-MM-DD');
					})
					this.isLoading = false
				})
			},

			// 修改书本的bookStatus
			async changeBorrowedBookStatus(data) {
				await this.$api.changeBorrowedBookStatus(data)
				const tipMsg = `您已经将${this.selectedItem.stuInfo.SName}同学借阅的${this.selectedItem.bookInfo.BName}的状态修改为${this.options[this.selectedItem.status].label}!`
				this.operateSuccessTip(tipMsg)
				this.getBorrowList()
			},

			// 查询操作
			onSubmit() {
				console.log(this.formData.status)
				this.getBorrowList()
			},
			// 当前页大小改变
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
				this.pageSize = val
				this.curPageNum = 1
				this.getBorrowList()

			},
			
			// 当前页数改变
			handleCurrentChange(val) {
				this.curPageNum = val
				console.log(`当前页: ${val}`);
				this.getBorrowList()
			},
			
			// 监听status的改变时
			selectChange(e) {
				this.selectedItem = e
				this.dialogVisible = true
			},
			
			// 确定修改该书的status
			confimChangeStatus() {
				this.dialogVisible = false
				const formData = {
					_id: this.selectedItem._id,
					status: this.selectedItem.status
				}
				this.changeBorrowedBookStatus(formData)
			},

			// 取消改变该书的status
			cancelChangeStatus() {
				this.dialogVisible = false
				this.getBorrowList()
				// 将修改后的status复原
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
		}
	}
</script>

<style lang="scss">
	.borrowListPage {
		padding: 20px;

		.dialogText {
			font-size: 18px;
			color: #409EFF;
		}

		.dialogContent {
			line-height: 35px;
		}
	}
</style>