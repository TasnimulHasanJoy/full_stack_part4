const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((favorite, blog) => {
    return blog.likes > favorite.likes ? blog : favorite
  }, blogs[0])
}

const mostBlogs = (blogs) => {
  const authorCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})

  const authors = Object.keys(authorCounts)

  if (authors.length === 0) {
    return { author: undefined, blogs: 0 }
  }

  const topAuthor = authors.reduce((currentTop, author) => {
    return authorCounts[author] > authorCounts[currentTop]
      ? author
      : currentTop
  })

  return {
    author: topAuthor,
    blogs: authorCounts[topAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}