import axios from 'axios'

export const token = (username, password) => axios.post('/api/token', { username, password}).then(r => r.data)
export const signUp = (username, password) => axios.post('/api/user', { username, password}).then(r => r.data)
export const posts = () =>
  axios.get('/api/posts').then(r => r.data)
export const post = (postId) =>
  axios.get(`/api/post/${postId}`).then(r => r.data)
export const user = (token) =>
  axios.get('/api/user', { headers: { Authorization: `Bearer ${token}`}}).then(r => r.data)
