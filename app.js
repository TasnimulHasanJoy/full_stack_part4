const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Blog = require('./models/blog')
const User = require('./models/user')

const app = express()

app.use(express.json())

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

app.use(tokenExtractor)

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })

  response.json(blogs)
})

app.post('/api/login', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })

  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response.status(200).json({
    token,
    username: user.username,
    name: user.name
  })
})

app.post('/api/blogs', async (request, response) => {
  const { title, url } = request.body

  if (!title || !url) {
    return response.status(400).json({
      error: 'title and url are required'
    })
  }

  if (!request.token) {
    return response.status(401).json({
      error: 'token missing'
    })
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(request.token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(401).json({
      error: 'user not found'
    })
  }

  const blog = new Blog({
    ...request.body,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

app.delete('/api/blogs/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog && blog.user) {
    await User.findByIdAndUpdate(blog.user, {
      $pull: { blogs: blog._id }
    })
  }

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
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
    likes: 1
  })

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