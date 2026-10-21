const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

const userExtractor = async (request, response, next) => {
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

  request.user = user
  next()
}

module.exports = {
  tokenExtractor,
  userExtractor
}