const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
describe('most likes', () => {
  test('returns the author whose blogs have the most total likes', () => {
    const blogs = [
      { author: 'Edsger W. Dijkstra', title: 'First blog', likes: 5 },
      { author: 'Robert C. Martin', title: 'Another blog', likes: 10 },
      { author: 'Edsger W. Dijkstra', title: 'Second blog', likes: 12 }
    ]

    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })

  test('returns zero likes for an empty list', () => {
    const result = listHelper.mostLikes([])

    assert.deepStrictEqual(result, {
      author: undefined,
      likes: 0
    })
  })
})