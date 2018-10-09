const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')

const dev = process.env.NODE_ENV !== 'production'
const app = next ({ dev })
const handle = app.getRequestHandler()
const port = 3000


app.prepare()
  .then(() => {
    const server = express()

    server.use(
      bodyParser.json({ limit: '10mb', extended: true })
    )
    server.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

    server.get('/test', (req ,res) => {
      res.send('test route working')
    })

    
    server.post('/addpage', (req, res, next) => {
      res.send('id recieved')
      const { body } = req
      console.log({ body })
    })
    
    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, err => {
      if (err) throw err
      console.log(`server running on port ${port}`)
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })
