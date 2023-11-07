'use strict';
const db = uniCloud.database()
const _ = db.command
const bookDB = db.collection("books")
const borrow_list = db.collection("borrow_book_list")
const usersDB = db.collection('users')
const stuAuthDB = db.collection('stu_auth_list')
exports.main = async (event, context) => {
	const {
		action,
		data
	} = event
	const res = {}
	switch (action) {
		case "searchBooks":
			res.data = await searchBooks(data)
			break;
		case 'searchBorrowList':
			res.data = await searchBorrowList(data)
			break
		case 'changeBorrowedBookStatus':
			res.data = await changeBorrowedBookStatus(data)
			break;
		case 'searchUsers':
			res.data = await searchUsers(data)
			break;
		case 'changeUserAuthStatus':
			res.data = await changeUserAuthStatus(data)
			break
		default:
			break
	}
	res.msg = '成功'
	res.code = 1
	return res
};

// 查询图书
async function searchBooks(data) {
	let keyword = data.keyword
	let Category = data.Category
	let skipCount = data.skipCount
	let pageSize = data.pageSize
	// 两个匹配模糊查询的字段：BName和Author，用正则匹配
	var query = [{
			BName: new RegExp(keyword)
		},
		{
			Author: new RegExp(keyword)
		},
		{
			Publisher: new RegExp(keyword)
		}
	]
	var cateQuery = {}
	// 如果分类字段不为空则添加分类字段的匹配
	if (Category) cateQuery.Category = Category
	let all = await bookDB.where(_.or(query).and(cateQuery)).count()
	let res = await bookDB.where(_.or(query).and(cateQuery)).skip(skipCount).limit(pageSize).get()
	let result = {
		total: all.total,
		data: res.data,
	}
	return result

}

async function searchBorrowList(data) {
	let keyword = data.keyword
	let status = data.status
	let skipCount = data.skipCount
	let pageSize = data.pageSize
	const matchCondition = {}
	if (keyword.length != 0) {
		console.log('keyword', keyword)
		const regexStr = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义关键词中的特殊字符
		const regex = new RegExp(regexStr, 'i'); // 'i' 表示不区分大小写
		matchCondition.$or = [{
				'bookInfo.BName': {
					$regex: regex.source
				}
			},
			{
				'bookInfo.Author': {
					$regex: regex.source
				}
			},
			{
				'stuInfo.SName': {
					$regex: regex.source
				}
			}
		];

	}
	if (status.length != 0) {
		matchCondition.status = status
	}
	const pipline = await borrow_list.aggregate()
		.lookup({
			from: 'books',
			localField: 'book_id',
			foreignField: '_id',
			as: 'bookInfo'
		})
		.lookup({
			from: 'stu_auth_list',
			localField: 'user_id',
			foreignField: 'user_id',
			as: 'stuInfo'
		})
		.unwind('$bookInfo')
		.unwind('$stuInfo')
		.project({
			_id: 1,
			book_id: 1,
			status: 1,
			borrowTime: 1,
			returnBookTime: 1,
			bookInfo: {
				BName: '$bookInfo.BName',
				Author: '$bookInfo.Author',
				BNo: '$bookInfo.BNo'
			},
			stuInfo: {
				SName: "$stuInfo.Sname",
				SNo: '$stuInfo.SNo'
			}
		}).match(matchCondition)
	let resPipline = pipline // 返回结果管道
	let countPipline = pipline // 计数管道
	let res_borrow_list = await resPipline
		.skip(skipCount)
		.limit(pageSize)
		.end();
	let countResult = await countPipline.end();
	console.log(countResult)
	let totalCount = countResult.data.length // 这里没法用count函数直接拿 所以要先全拿到然后求数组长度
	return {
		data: res_borrow_list.data,
		total: totalCount
	}
}


// 修改已经借的书的状态
async function changeBorrowedBookStatus(data) {
	const _id = data._id
	const status = data.status
	let borrowRes = await borrow_list.doc(_id).get()
	let oldStatus = borrowRes.data[0].status
	let result = await borrow_list.doc(_id).update({
		status
	})
	if (status == 2) {
		await changeBookCount(_id, +1)
	} else if (oldStatus == 2) {
		await changeBookCount(_id, -1)
	}
	// 如果新的status是2 也就是已经归还 那么就要让库存的书的数量 BCount++

	return {}
}

// 将某本书的数量++
async function changeBookCount(_id, changeNum) {
	let borrowBookRes = await borrow_list.doc(_id).get()
	let book_id = borrowBookRes.data[0].book_id
	let bookRes = await bookDB.doc(book_id).get()
	let oldCount = bookRes.data[0].BCount
	await bookDB.doc(book_id).update({
		BCount: oldCount + changeNum
	})

}

// 搜索用户信息
async function searchUsers(data) {
	let keyword = data.keyword
	let stuAuthStatus = data.stuAuthStatus
	let skipCount = data.skipCount
	let pageSize = data.pageSize
	const matchCondition = {}
	if (keyword.length != 0) {
		const regexStr = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义关键词中的特殊字符
		const regex = new RegExp(regexStr, 'i'); // 'i' 表示不区分大小写
		matchCondition.$or = [{
				Sname: {
					$regex: regex.source
				}
			},
			{
				SNo: {
					$regex: regex.source
				}
			}
		];
	}
	if (stuAuthStatus.length != 0) {
		matchCondition.$and = [{
			'userInfo.stuAuthStatus': stuAuthStatus
		}]
	}

	const pipline = await stuAuthDB.aggregate()
		.lookup({
			from: 'users',
			localField: 'user_id',
			foreignField: '_id',
			as: 'userInfo'
		})
		.unwind('$userInfo')
		.project({
			_id: 1,
			Sname: 1,
			SNo: 1,
			user_id: 1,
			userInfo: {
				avatarUrl: "$userInfo.avatarUrl",
				nickName: "$userInfo.nickName",
				gender: '$userInfo.gender',
				stuAuthStatus: '$userInfo.stuAuthStatus',
				registerDate: '$userInfo.registerDate',
			},
		}).match(matchCondition)
	let countRes = await pipline.end()
	let total = countRes.data.length
	let usersRes = await pipline.skip(skipCount).limit(pageSize).end()
	console.log(usersRes.data)
	return {
		total,
		data: usersRes.data
	}


}


// 修改用户状态
async function changeUserAuthStatus(data){
	let user_id = data.user_id
	let stuAuthStatus = data.stuAuthStatus
	await usersDB.doc(user_id).update({stuAuthStatus})
	return {}
}
