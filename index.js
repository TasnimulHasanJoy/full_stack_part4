require('dotenv').config()

const dns = require('dns')
dns.setServers(['8.8.8.8'])

const express = require('express')
const mongoose = require('mongoose')

const app = express()

app.use(express.json())

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl, { family: 4 })
  .then(() => {
    console.log('Connected to MongoDB')

    app.listen(3003, () => {
      console.log('Server running on port 3003')
    })
  })
  .catch(error => {
    console.log('MongoDB connection error:', error.message)
  })

app.get('/api/blogs', (request, response) => {
  Blog.find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save()
    .then(result => {
      response.status(201).json(result)
    })
})