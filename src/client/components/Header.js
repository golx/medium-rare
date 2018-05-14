import React from 'react'
import { Link } from 'react-router-dom'

import './Header.scss'
import * as API from '../api'


const Header = (props) => {
  return (
    <div className="app-header">
      <Link to="/"><img src="/steak.png" className="app-icon" /></Link>
      <h2 className="app-name">Medium Rare</h2>
      <div className="app-buttons">
        {
          props.username
          ? (
            <div className="greeting">
              Hello, <strong>{props.username} </strong>
              <button className="button button-primary">Brag</button>
              <button className="button" onClick={props.onLogout}>Log out</button>
            </div>
          )
          : ( [
            <Link to="/login" className="button">
              Log In
            </Link>,
            <button className="button button-primary" onClick={() => API.signUp('alexx', 'query')}>
              Sign up
            </button>
          ])
        }
      </div>
    </div>
  )
}

export default Header