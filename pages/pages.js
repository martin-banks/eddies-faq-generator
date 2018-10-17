import React from 'react'
import Main from '../layouts/main'

const embedCode = `<div>
  <style href="https://server.com/stylesheet.css"></style>
  <script src="https://server.com/project_id"></script>
  <div class="app"></div>
</div>`

const faqPage = doc => <li>
  <h3>{ doc.title }</h3>
  <p>{ doc.id }</p>
  <p>Embed code:</p>
  <pre>
    { embedCode }
  </pre>
  <button>
    <a href="corrections/index.html">Preview</a>
  </button>
  <button>Update</button>
  <button>Delete</button>
  <hr />
</li>

export default class Pages extends React.Component {
  static async getInitialProps (context) {
    const output = {
      locals: context.res && context.res.locals,
      url: context.url,
    }
    return output
  }

  render () {
    return (
      <div>
        <Main>
          <h1>Pages</h1>
          <ul>
            {
              Object.values(this.props.locals.manifest.docs)
                .map(faqPage)
            }
          </ul>
          <pre>{ JSON.stringify(this.props.locals.manifest, 'utf-8', 2) }</pre>
        </Main>
      </div>
    )
  }
}