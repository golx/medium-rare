import * as R from 'ramda'
import * as model from '../models'
import { Either, Maybe } from '../models/types'

const userJdoeEither = model.User({
  username: 'jdoe',
  password: 'awesome'
})

const jdoePost1Either = model.Post({
  userId: userJdoeEither.data.id,
  title: 'Use these three tips to become better photographer',
  hero: 'https://images.pexels.com/photos/736414/pexels-photo-736414.jpeg',
  description: 'Compositional techniques that will take your creative thinking to the next level',
  body: 'Photography is the science, art, application and practice of creating durable images by recording light or other electromagnetic radiation, either electronically by means of an image sensor, or chemically by means of a light-sensitive material such as photographic film.[1]'
})

const jdoePost2Either = model.Post({
  userId: userJdoeEither.data.id,
  title: 'Popular mistakes in aerial photography',
  hero: 'https://images.pexels.com/photos/753865/pexels-photo-753865.jpeg',
  description: 'Drones are everywhere. Find out how to make most out of them',
  body: 'Aerial photography is the taking of photographs from an aircraft or other flying object.[1] Platforms for aerial photography include fixed-wing aircraft, helicopters, unmanned aerial vehicles (UAVs or "drones"), balloons, blimps and dirigibles, rockets, pigeons, kites, parachutes, stand-alone telescoping and vehicle-mounted poles. Mounted cameras may be triggered remotely or automatically; hand-held photographs may be taken by a photographer.'
})

const jdoePost3Either = model.Post({
  userId: userJdoeEither.data.id,
  title: 'Lambda calculus made simple',
  hero: 'https://i.stack.imgur.com/vA4pU.png',
  description: 'You dont need to be mathematician to understand these',
  body: 'Lambda calculus (also written as λ-calculus) is a formal system in mathematical logic for expressing computation based on function abstraction and application using variable binding and substitution. It is a universal model of computation that can be used to simulate any Turing machine.'
})

let collections = {
  users: [
    userJdoeEither.data
  ],
  posts: [
    jdoePost1Either.data,
    jdoePost2Either.data,
    jdoePost3Either.data,
  ],
  tokens: {},
  comments:[]
}


export const createUser = ({ username, password } = {}) => {
  const foundIndex = R.findIndex(u => u.username === username, collections.users)

  if (foundIndex > -1)
    return Either.Left('Such user already exist')

  return model.User({ username, password }).forEach((u) => {
    collections = R.over(R.lensProp('users'), R.append(u), collections)
  })
}

export const findUser = (userId = '') => R.pipe(
  R.find(u => u.id === userId),
  Maybe.ofNullable,
)(collections.users)


export const getToken = ({ username, password} = {}) => {
  const foundIndex = R.findIndex(u => u.username === username && u.password === password, collections.users)

  if (foundIndex === -1) {
    return Either.Left('Could not find such user')
  }

  return model.Token({ userId: collections.users[foundIndex].id }).forEach((t) => {
    collections = R.over(R.lensProp('tokens'), R.assoc(collections.users[foundIndex].id, t.id), collections)
  })
}

export const checkToken = (token = '') => (
  R.pipe(
    R.toPairs,
    R.find(([userId, userToken]) => userToken === token),
    Maybe.ofNullable,
    R.map(R.head)
  )(collections.tokens)
)

export const getAllPosts = () => {
  return collections.posts
}

export const createPost = ({ userId, title, body } = {}) => {
  const foundIndex = R.findIndex(u => u.id === userId, collections.users)

  if (foundIndex === -1) {
    return Either.Left('Could not find such user')
  }

  return model.Post({ userId, title, body }).forEach((p) => {
    collections = R.over(R.lensProp('posts'), R.append(p), collections)
  })
}

export const findPost = (postId = '') => R.pipe(
  R.find(u => u.id === postId),
  Maybe.ofNullable,
)(collections.posts)

export const updatePost = (postId = '', newData) => {
  const foundPostIndex = R.findIndex(p => p.id === postId, collections.posts)

  if (foundPostIndex === -1) {
    return Either.Left('Could not find such post')
  }

  return model.updatePost(collections.posts[foundPostIndex], newData).forEach((p) => {
    collections = R.over(R.lensProp('posts'), R.adjust(R.always(p)), collections)
  })
}

export const createComment = (userId = '', postId = '', { message = '' } = {}) => (
  R.sequence(Maybe.of, [findUser(userId), findPost(postId)]).cata({
    Some:([user, post]) => (
      model.Comment({ userId: user.id, postId: post.id, message }).forEach(c => {
        collections = R.over(R.lensProp('comments'), R.append(c), collections)
      })
    ),
    None: () => Either.Left('Could not find user or post')
  })
)

export const findComment = (commentId = '') => R.pipe(
  R.find(c => c.id === commentId),
  Maybe.ofNullable,
)(collections.comments)

export const findPostComments = (postId = '') => R.filter(c => c.postId === postId, collections.comments)

export const deleteComment = (userId = '', commentId = '') => (
  R.sequence(Maybe.of, [findUser(userId), findComment(commentId)]).cata({
    Some: ([user, comment]) => {
      if (comment.userId !== user.id)
        return Either.Left('Only author can delete his comments')

      collections = R.over(R.lensProp('comments'), R.without(comment), collections)

      return Either.Right(null)
    },
    None: () => Either.Left('Could not find user or post')
  })
)