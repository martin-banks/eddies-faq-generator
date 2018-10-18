const fs = require('fs')

const manifest = `${__dirname}/../_docs/manifest.json`

exports.readManifest = async (req, res, next) => {
  res.locals.manifest = require(manifest)
  next()
}

exports.addToManifest = async (req, res, next) => {
  const { id, title } = req.body
  try {
    const content = require(manifest)
    content.docs[id] = {
      title,
      added: Date.now(),
      updated: Date.now(),
      status: 'created',
      preview: null, // req.preview,
      url: null,
    }

    await fs.writeFileSync(manifest, JSON.stringify(content, 'utf-8', 2)) 
  } catch (err) {
    throw err
  }
  next()
}

