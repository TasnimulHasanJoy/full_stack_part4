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

const mostLikes = (blogs) => {
  const authorLikes = blogs.reduce((totals, blog) => {
    totals[blog.author] = (totals[blog.author] || 0) + blog.likes
    return totals
  }, {})

  const authors = Object.keys(authorLikes)

  if (authors.length === 0) {
    return { author: undefined, likes: 0 }
  }

  const topAuthor = authors.reduce((currentTop, author) => {
    return authorLikes[author] > authorLikes[currentTop]
      ? author
      : currentTop
  })

  return {
    author: topAuthor,
    likes: authorLikes[topAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}