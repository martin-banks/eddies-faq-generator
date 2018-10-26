import React from 'react'
import Main from '../layouts/main'

export default class Edit extends React.Component {
  static async getInitialProps (context) {
    const output = {
      locals: context.res && context.res.locals,
      url: context.url,
    }
    return output
  }

  render () {
    return (<>
      <Main>
        <h1>Edit</h1>
        <pre>{ JSON.stringify(this.props.locals, 'utf-8', 2) }</pre>
      </Main>
    </>
    )
  }
}