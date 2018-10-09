import React from 'react'
import Main from '../layouts/main'

export default class AddPage extends React.Component {
  render () {
    return (<>
      <Main>
        <h1>Add page</h1>
        <form action="addpage" method="post">
          <label htmlFor="id" name="id">Google Doc ID</label>
          <input type="text" id="id" name="id" />

          <input type="submit" />
        </form>

      </Main>
    </>
    )
  }
}