import React from 'react'
import { Link } from 'react-router-dom'

import * as API from '../api'
import './TopPosts.scss'

const PostItem = (props) => {
  return (
    <div className="post-item">
      <div className="post-item-picture">
        <img src={props.post.hero} />
      </div>
      <h4 className="post-item-headline">
        {props.post.title}
      </h4>
      <div className="post-item-short-description">
        {props.post.description}
      </div>
      <div className="post-item-link">
        <Link className="link" to={`/post/${props.post.id}`}>Flip the steak</Link>
      </div>
    </div>
  )
}

class TopPosts extends React.Component {
  state = {
    posts: []
  }

  componentDidMount() {
    API.posts()
      .then(posts => {
        this.setState(() => ({ posts }))
      })
      .catch(console.log)
  }

  render() {
    return (
      <div className="post-items-container">
        <h3>What's hot</h3>
        <div className="post-items">
          {
            this.state.posts.map(p => <PostItem key={p.id} post={p} />)
          }
        </div>
      </div>
    )
  }
}

export default TopPosts