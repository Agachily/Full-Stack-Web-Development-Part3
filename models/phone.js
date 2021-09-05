// 本文件用于存储Mongoose中特定的代码
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const url = process.env.MONGODB_URI
console.log('connecting to', url)

// 在连接到数据库后显示连接成功的信息，或者显示错误信息
mongoose.connect(url).then(result => {
    console.log('connected to MongoDB')
}).catch((error) => {
    console.log('error connecting to MongoDB:', error.massage)
})

// 定义电话簿中存储数据的模式
const phoneSchema = new mongoose.Schema({
    name: {type: String, minlength: 3,required: true,unique:true},
    number: {type:String, minlength:8, required:true},
})

// 对Schema的toJSON方法进行修改，从而去除掉获取到的数据的__id字段和__v字段
phoneSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})
phoneSchema.plugin(uniqueValidator, { message: '{VALUE} is already on the list.' })
module.exports = mongoose.model('Phone', phoneSchema)