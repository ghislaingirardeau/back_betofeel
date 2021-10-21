const express = require('express')
const cors = require('cors')
const users = require('./routes/user')
const feelings = require('./routes/feeling')
const share = require('./routes/share')

const app = express()

/* var whitelist = ['http://localhost:8000', 'https://betofeel.netlify.app']

const corsOptions ={
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  origin: "https://betofeel.netlify.app",
  credentials:true,            
  optionSuccessStatus:200,
}

app.use(cors(corsOptions)) */

/* Configuration du header */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://betofeel.netlify.app/')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  next()
})    

app.use(express.json())

app.get('/', (req, res) => res.send('Success!!!'));
app.use('/api/', users)
app.use('/api/feeling', feelings)
app.use('/api/share', share)

module.exports = app