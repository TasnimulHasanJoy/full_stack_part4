const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('dummy', () => {
  test('returns one', () => {
    const result = listHelper.dummy([])

    assert.strictEqual(result, 1)
  })
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])

    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const blogs = [{ title: 'A blog', likes: 5 }]
    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      { title: 'First blog', likes: 5 },
      { title: 'Second blog', likes: 7 },
      { title: 'Third blog', likes: 3 }
    ]
    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 15)
  })
})

describe('favorite blog', () => {
  test('returns the blog with the most likes', () => {
    const blogs = [
      { title: 'First blog', author: 'Author One', likes: 5 },
      { title: 'Favorite blog', author: 'Author Two', likes: 12 },
      { title: 'Third blog', author: 'Author Three', likes: 3 }
    ]
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, blogs[1])
  })
})

describe('most blogs', () => {
  test('returns the author with the most blogs', () => {
    const blogs = [
      { author: 'Robert C. Martin', title: 'First blog' },
      { author: 'Robert C. Martin', title: 'Second blog' },
      { author: 'Robert C. Martin', title: 'Third blog' },
      { author: 'Other Author', title: 'Another blog' }
    ]
    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })

  test('returns zero blogs for an empty list', () => {
    const result = listHelper.mostBlogs([])

    assert.deepStrictEqual(result, {
      author: undefined,
      blogs: 0
    })
  })
})