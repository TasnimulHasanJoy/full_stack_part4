const dns = require('dns')
dns.setServers(['8.8.8.8'])

process.env.NODE_ENV = 'test'
require('dotenv').config()

const { test, before, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blog')
const config = require('../utils/config')

const api = supertest(app)

before(async () => {
  await mongoose.connect(config.MONGODB_URI)
})

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany([
    {
      title: 'First test blog',
      author: 'Test Author',
      url: 'https://example.com/first',
      likes: 5
    },
    {
      title: 'Second test blog',
      author: 'Another Author',
      url: 'https://example.com/second',
      likes: 3
    }
  ])
})

after(async () => {
  await mongoose.connection.close()
})

test('blogs are returned as JSON', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, 2)
})

test('blogs have id property instead of _id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]

  assert.strictEqual(typeof blog.id, 'string')
  assert.strictEqual(blog._id, undefined)
})

test('a new blog can be created with a POST request', async () => {
  const newBlog = {
    title: 'A blog created by a test',
    author: 'Test Author',
    url: 'https://example.com/new',
    likes: 10
  }

  const blogsAtStart = await Blog.find({})

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
  assert.strictEqual(response.body.title, newBlog.title)
  assert.strictEqual(response.body.author, newBlog.author)
  assert.strictEqual(response.body.url, newBlog.url)
  assert.strictEqual(response.body.likes, newBlog.likes)
  assert.strictEqual(typeof response.body.id, 'string')
})

test('a blog without likes defaults to zero', async () => {
  const newBlog = {
    title: 'A blog without likes',
    author: 'Test Author',
    url: 'https://example.com/no-likes'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes, 0)
})

test('a blog without a title is rejected', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'https://example.com/no-title'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog without a URL is rejected', async () => {
  const newBlog = {
    title: 'A blog without a URL',
    author: 'Test Author'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete._id}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const remainingBlogIds = blogsAtEnd.map(blog => blog._id.toString())

  assert.strictEqual(
    remainingBlogIds.includes(blogToDelete._id.toString()),
    false
  )
})