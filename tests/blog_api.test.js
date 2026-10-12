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