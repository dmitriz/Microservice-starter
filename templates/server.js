// server.js
const express = require('express')
const app = express()
const fn = require('./functions') // Import your cloud function(s)

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root route to expose the cloud function
app.get('/', (req, res) => {
  // Extract parameters for your function from query, body, or headers
  const params = {
    query: req.query,
    body: req.body,
    headers: req.headers
  }

  // Execute your cloud function using the provided callbacks
  fn(params)(
    (result) => {
      // On success, send the result as JSON
      res.status(200).json(result)
    },
    (error) => {
      // On error, send a 500 status and the error message
      console.error('Function execution error:', error)
      res.status(500).send(error.message || 'Internal Server Error')
    }
  )
})

// Placeholder for WebSocket handling if needed (can be extended here)
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ server }); // 'server' would come from http.createServer(app)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
