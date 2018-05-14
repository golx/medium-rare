import * as R from 'ramda'
import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import './app.scss'

import Header from './components/Header'
import TopPosts from './components/TopPosts'
import Login from './components/Login'
import Post from './components/Post'

class App extends React.Component {
  state = {
    user: {},
    token: {},
  }

  componentWillMount() {
    const userInfo = localStorage.getItem('mediumRareUserInfo')
    if (userInfo)
      this.setState(() => JSON.parse(userInfo))
  }

  setUserInfo = ({ user, token }) => {
    this.setState(() => ({ user, token }))
    localStorage.setItem('mediumRareUserInfo', JSON.stringify({ user, token }))
  }

  clearUserInfo = () => {
    this.setState(() => ({ user: {}, token: {}, }))
    localStorage.removeItem('mediumRareUserInfo')
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Header
            username={R.path(['user', 'username'], this.state)}
            onLogout={this.clearUserInfo}
          />
          <Switch>
            <Route path="/" exact component={TopPosts} />
            <Route path="/login">
              {
                (props) => <Login onReceiveUserInfo={this.setUserInfo} {...props} />
              }
            </Route>
            <Route path="/post/:postId" component={Post} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

const node = document.createElement('div')

document.body.appendChild(node)

ReactDOM.render(<App />, node)