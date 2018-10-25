const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')

const faqController = require('./controllers/faqs')
const driveController = require('./controllers/exportDoc')

const dev = process.env.NODE_ENV !== 'production'
const app = next ({ dev })
const handle = app.getRequestHandler()
const port = 3339


app.prepare()
  .then(() => {
    const server = express()

    server.use(bodyParser.json({ limit: '1mb', extended: true }))
    server.use(bodyParser.urlencoded({ limit: '1mb', extended: true }))

    server.use('static', express.static('static'))

    // server.use(async (req, res, next) => {
    //   // res.locals.flashes = req.flash()
    // })

    server.get('/test',
      faqController.addToManifest,
      (req, res) => {
        res.send('test route working')
      }
    )

    server.post('/addpage',
      driveController.exportDoc,
      faqController.addToManifest,
      (req, res, next) => {
        // res.json(req.body)
        // const { body } = req
        // console.log({ body })
        res.redirect('/pages')
      }
    )

    server.get('/pages',
      faqController.readManifest,
      (req, res, next) => app.render(req, res, '/pages')
    )

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
