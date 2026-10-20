const express = require('express')
const Blog = require('./models/blog')

const app = express()

app.use(express.json())

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

app.post('/api/blogs', async (request, response) => {
  const { title, url } = request.body

  if (!title || !url) {
    return response.status(400).json({
      error: 'title and url are required'
    })
  }

  const blog = new Blog(request.body)
  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

module.exports = app