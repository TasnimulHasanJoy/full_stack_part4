const express = require('express')
const bcrypt = require('bcryptjs')
const Blog = require('./models/blog')
const User = require('./models/user')

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

app.delete('/api/blogs/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

app.put('/api/blogs/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )

  response.json(updatedBlog)
})

app.get('/api/users', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

app.post('/api/users', async (request, response) => {
  const { username, password, name } = request.body

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length === 0 ||
    password.length === 0
  ) {
    return response.status(400).json({
      error: 'username and password are required'
    })
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'username and password must be at least 3 characters long'
    })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      name,
      passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({
        error: 'username must be unique'
      })
    }

    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }

    throw error
  }
})

module.exports = app