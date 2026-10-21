require('dns').setServers(['8.8.8.8'])

const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const supertest = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const config = require('../utils/config')

const api = supertest(app)

let token

before(async () => {
  await mongoose.connect(config.MONGODB_URI)
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const testUser = await User.create({
    username: 'blogtestuser',
    name: 'Blog Test User',
    passwordHash: 'test-hash'
  })

  token = jwt.sign(
    { username: testUser.username, id: testUser._id },
    process.env.SECRET
  )

  const blogs = await Blog.insertMany([
    {
      title: 'First test blog',
      author: 'Test Author',
      url: 'https://example.com/first',
      likes: 5,
      user: testUser._id
    },
    {
      title: 'Second test blog',
      author: 'Another Author',
      url: 'https://example.com/second',
      likes: 3,
      user: testUser._id
    }
  ])

  testUser.blogs = blogs.map(blog => blog._id)
  await testUser.save()
})

test('blogs are returned as JSON', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.equal(response.body.length, 2)
})

test('blogs have id property instead of _id', async () => {
  const response = await api.get('/api/blogs')

  assert.ok(response.body[0].id)
  assert.equal(response.body[0]._id, undefined)
})

test('blogs show the creator information', async () => {
  const response = await api.get('/api/blogs')
  const creator = response.body[0].user

  assert.equal(creator.username, 'blogtestuser')
  assert.equal(creator.name, 'Blog Test User')
  assert.ok(creator.id)
})

test('a new blog can be created with a POST request', async () => {
  const newBlog = {
    title: 'A blog created in a test',
    author: 'Test Author',
    url: 'https://example.com/new',
    likes: 7
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const response = await api.get('/api/blogs')

  assert.equal(response.body.length, 3)
  assert.ok(response.body.some(blog => blog.title === newBlog.title))
})

test('a blog without likes defaults to zero', async () => {
  const newBlog = {
    title: 'A blog without likes',
    author: 'Test Author',
    url: 'https://example.com/no-likes'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  assert.equal(response.body.likes, 0)
})

test('a blog without a title is rejected', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'https://example.com/no-title'
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted by its creator', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blogs')
  assert.equal(blogsAtEnd.body.length, blogsAtStart.body.length - 1)
})

test('a blog cannot be deleted without a token', async () => {
  const blogs = await api.get('/api/blogs')
  const blogToKeep = blogs.body[0]

  await api.delete(`/api/blogs/${blogToKeep.id}`).expect(401)
})

test('a blog cannot be deleted by another user', async () => {
  const blogs = await api.get('/api/blogs')
  const blogToKeep = blogs.body[0]

  const anotherUser = await User.create({
    username: 'anotheruser',
    name: 'Another User',
    passwordHash: 'test-hash'
  })

  const anotherUsersToken = jwt.sign(
    { username: anotherUser.username, id: anotherUser._id },
    process.env.SECRET
  )

  await api
    .delete(`/api/blogs/${blogToKeep.id}`)
    .set('Authorization', `Bearer ${anotherUsersToken}`)
    .expect(403)
})

test('a blog can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: blogToUpdate.likes + 1 })
    .expect(200)

  assert.equal(response.body.likes, blogToUpdate.likes + 1)
})

test('users are returned with their blogs', async () => {
  const response = await api.get('/api/users').expect(200)

  assert.equal(response.body.length, 1)
  assert.equal(response.body[0].username, 'blogtestuser')
  assert.equal(response.body[0].blogs.length, 2)
  assert.equal(response.body[0].blogs[0].title, 'First test blog')
})

after(async () => {
  await mongoose.connection.close()
})