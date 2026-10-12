const dns = require('dns')
dns.setServers(['8.8.8.8'])

const mongoose = require('mongoose')
const app = require('./app')
const config = require('./utils/config')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`)
    })
  })
  .catch(error => {
    console.log('MongoDB connection error:', error.message)
  })