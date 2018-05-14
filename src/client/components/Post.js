import React from 'react'

import * as API from '../api'

class Post extends React.Component {
  componentDidMount() {
    console.log(this.props)
    API.post(this.props.match.params.postId).then(console.log).catch(console.log)
  }

  render () {
    return null
  }
}

export default Post