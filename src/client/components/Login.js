import * as R from 'ramda'
import React from 'react'

import "./Login.scss"
import * as API from '../api'

class Login extends React.Component {
  state = {
    username: '',
    password: '',
    error: '',
  }

  handleFormChange = field => e => {
    const { value } = e.target
    this.setState(() => ({ [field]: value, error: '' }))
  }

  handleFormSubmit = (e) => {
    e.preventDefault()

    API.token(this.state.username, this.state.password)
      .then(token => {
        return Promise.all([Promise.resolve(token), API.user(token.id)])
      })
      .then(([token, user]) => {
        this.props.onReceiveUserInfo({ token, user })
        this.props.history.push('/')
      })
      .catch(e => {
        this.setState(() => ({ error: e.response.data.message }))
      })
  }

  render() {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={this.handleFormSubmit}>
          <h4 className="form-item form-header">Log in to brag about your grill successes</h4>
          <input className="input form-item" placeholder="Your username" value={this.state.username}
                 onChange={this.handleFormChange('username')} />
          <input className="input form-item" placeholder="Your password" value={this.state.password}
                 onChange={this.handleFormChange('password')} type="password" />
          {
            this.state.error
            ? <div className="login-form-error form-item">Login failed: {this.state.error}</div>
            : null
          }
          <button
            className="button button-primary form-item"
            type="submit"
            disabled={
              R.isEmpty(this.state.username)
              || R.isEmpty(this.state.password)
              || !R.isEmpty(this.state.error)
            }
          >
            Let me in
          </button>
        </form>
      </div>
    )
  }
}

export default Login