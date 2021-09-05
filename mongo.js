const mongoose = require('mongoose')

// 判断命令行所提供的参数是否小于3个，如果小于3个，退出并在控制台上显示响应的提示
if (process.argv.length < 3){
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

// 定义访问数据库的URL
const url = 
    `mongodb+srv://phonebook:${password}@cluster0.tw8bn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

// 连接数据库
mongoose.connect(url)

// 定义电话簿中存储数据的模式
const phoneSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// 定义用于创建电话簿的构造函数
const Phone = mongoose.model('Phone', phoneSchema)

// 根据命令行中传入的参数的个数不同进行处理，如果是3个参数则添加联系人，如果是一个参数则显示数据库中所有联系人的信息
if(process.argv.length > 3){
    // 构建联系人
    const newPerson = new Phone({
        name: process.argv[3],
        number: process.argv[4],
    })
    // 将联系人的信息存储到数据库中
    newPerson.save().then(result => {
        console.log('new contact saved')
        // 关闭与数据库的连接
        mongoose.connection.close()
    })
} else {
    // 从数据库中获取所有联系人的信息
    Phone.find({}).then(result => {
        console.log(`phonebook:`)
        result.forEach(value => {
            console.log(`${value.name} ${value.number} ${value.id} sad`)
        })
        mongoose.connection.close()
    })
}
