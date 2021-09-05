// 使用env中定义的环境变量
require('dotenv').config()

// 导入express
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// 创建一个存储在app变量中的express应用
const app = express()
// 定义用于创建电话簿的构造函数
const Phone = require('./models/phone')
const { connection } = require('mongoose')

// 创建morgan token
morgan.token('body', function (req) {return JSON.stringify(req.body)})

// 激活json-parser并实现一个处理http post请求的初始处理程序
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))
app.use(cors())

// 响应浏览器请求，并返回电话簿数据
app.get('/api/persons', (repuest, response, next) => {
   Phone.find({}).then(result => {
     response.json(result)
   })
})

// 返回电话簿中的整体数据
app.get('/info', (request,response) => {
  Phone.find().then(persons => {
    const result = `
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>
            `
    response.send(result)
  })
})

// 获取单个联系人的信息
app.get('/api/persons/:id',(request, response, next) => {
  Phone.findById(request.params.id).then(result => {
    if(result){
      response.json(result)
    }else{
      response.status(404).end()
    }
  }).catch(error => {error => next(error)})
})

// 对某一联系人的信息进行更新
app.put('/api/persons/:id', (request, response, next) => {
  const sendPerson = request.body

  const contact = {
    name: sendPerson.name,
    number: sendPerson.number,
  }

  Phone.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

// 删除某个联系人的信息
app.delete('/api/persons/:id', (request, response) => {
  Phone.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

// 向服务端写入数据
app.post('/api/persons', (request, response) => {
  //为新添加的联系人创建ID
  const sendPerson = request.body
  const newContact = new Phone({
    name: sendPerson.name,
    number: sendPerson.number,
  })

  // 如果联系人的姓名和电话号码都不为空，则存储联系人
  if (!sendPerson.name){
    return response.status(400).json({error:'Name Missing'})
  } else if(!sendPerson.number){
    return response.status(400).json({error:'Number Missing'})
  }else{
    newContact.save().then(savedPerson => {
      response.json(savedPerson)
    }).catch(error => next(error))
  }  
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
    return response.status(400).json({error: error.message})
  }
  next(error)
}

// 这是最后加载的中间件
app.use(errorHandler)

// 在3001端口对浏览器的请求进行监听
const PORT = process.env.PORT
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`)
})