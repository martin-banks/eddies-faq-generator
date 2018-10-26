const fs = require('fs')

const manifest = `${__dirname}/../_docs/manifest.json`

exports.readManifest = async (req, res, next) => {
  res.locals.manifest = require(manifest)
  next()
}

exports.addToManifest = async (req, res, next) => {
  const { id, title, embed, preview } = req.body
  try {
    const content = require(manifest)
    content.docs[id] = {
      id,
      title,
      embed,
      added: Date.now(),
      updated: Date.now(),
      status: 'created',
      preview, // req.preview,
      url: null,
    }

    await fs.writeFileSync(manifest, JSON.stringify(content, 'utf-8', 2)) 
  } catch (err) {
    throw err
  }
  next()
}

exports.getFaq = async (req, res, next) => {
  const faq = require(manifest)
  const { id } = req.params
  console.log('faq', faq.docs[id])
  res.locals.faq = faq.docs[id]
  next()
}

