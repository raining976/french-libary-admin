<template>
	<view class="bookPage">
		<el-form :inline="true" :model="bookFormData" class="demo-form-inline" @keydown.native.enter='onSubmit'>
		  <el-form-item label="查询">
		    <el-input v-model="bookFormData.keyword" placeholder="书名,作者,出版社" clearable></el-input>
		  </el-form-item>
		  <el-form-item label="分类">
		    <el-select v-model="bookFormData.category" placeholder="选择分类" clearable>
		      <el-option :label="cate"  :value="cate" v-for="(cate,index) in categories" :key='index'></el-option>
		    </el-select>
		  </el-form-item>
		  <el-form-item>
		    <el-button type="primary" @click="onSubmit">查询</el-button>
		  </el-form-item>
		</el-form>
		<view class="content" v-show='!isLoading'>
			<el-table :data="books" style="width: 100%" stripe height="450">
				<el-table-column label="序号"  type="index" fixed="left" ></el-table-column>
				<!-- <el-table-column label="id" width="80" prop="_id"></el-table-column> -->
				<el-table-column  label="图书名称" width="280" prop="BName"></el-table-column>
				<el-table-column sortable label="编号" width="100" prop="BNo"></el-table-column>
				<el-table-column label="作者" width="150" prop="Author"></el-table-column>
				<el-table-column label="出版社" width="180" prop="Publisher"></el-table-column>
				<el-table-column label="出版时间" width="80" prop="PublishYear"></el-table-column>
				<el-table-column label="当前剩余" width="80" prop="BCount"></el-table-column>
				<el-table-column label="总数"  prop="BSum"></el-table-column>
				<!-- <el-table-column label="操作" fixed="right" >
					<template slot-scope="scope">
						<el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
						<el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
					</template>
				</el-table-column> -->
			</el-table>
			<div class="block">
				<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
					:current-page="currentPage" :page-sizes="[10, 20, 50]" :page-size="pageSize"
					layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</view>
		<el-skeleton :rows="12" animated :loading='isLoading'/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: "",
				category: "",
				tableData: [{
					BNo: "1-1-001",
					BName: '王小虎',
					Author: "作者",
					BCount: 1,
					BSum: 1,
					Category: "分类",
					PublishYear: 2010,
					Publisher: "出版社"
				}],
				books: [],
				total: 0,
				pageSize: 10,
				currentPage: 1,
				bookFormData:{
					keyword:"",
					category:""
				},
				categories:["中文教辅","法文教辅","法语文史哲","字典","英语书籍","杂项书籍",'中法对照读物'],
				isLoading:true, // 是否正在加载
			};
		},
		onShow() {
			this.getBooksData()
		},
		methods: {
			handleEdit(index, row) {
				console.log(index, row);
			},
			handleDelete(index, row) {
				console.log(index, row);
			},
			getBooksData(pageNum = 1, pageSize = 10) {
				const data = {
					keyword: this.bookFormData.keyword,
					Category: this.bookFormData.category,
					skipCount: (pageNum - 1) * pageSize,
					pageSize:pageSize
				}
				this.isLoading = true
				this.$api.searchBooks(data).then(res => {
					// console.log(res)
					this.books = res.data.data
					this.total = res.data.total
					this.isLoading = false
				})
			},
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
				this.getBooksData(this.currentPage, val)
				this.pageSize = val

			},
			handleCurrentChange(val) {
				console.log(`当前页: ${val}`);
				this.currentPage = val
				this.getBooksData(val, this.pageSize)

			},
			// 提交表单
			onSubmit(){
				this.getBooksData(1,this.pageSize)
			}
		}
	}
</script>

<style lang="scss">
.bookPage{
	padding: 20px;
}
</style>