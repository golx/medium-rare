import * as R from 'ramda'
import restify from 'restify'
import errs from 'restify-errors'

import {
  createUser,
  getToken,
  checkToken,
  findUser,
  createPost,
  findPost,
  updatePost,
  createComment,
  deleteComment,
  findPostComments,
  getAllPosts
} from './db'
import * as util from './util'

const server = restify.createServer()

const enrichError = Constructor => (message = '', data = {}) => (
  new Constructor(
    {
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          data: data
        }
      }
    },
    message
  )
)

const BadRequestError = enrichError(errs.BadRequestError)
const UnauthorizedError = enrichError(errs.UnauthorizedError)
const NotFoundError = enrichError(errs.NotFoundError)

const authorizer = (req, res, next) => {
  const [bearer, token] = req.header('Authorization', '').split(' ')

  if (bearer !== 'Bearer' || !util.nonEmptyString(token)) {
    next(UnauthorizedError())
  }

  checkToken(token).cata({
    Some: userId => {
      req.userId = userId
      console.log(req.userId)
      next()
    },
    None: () => next(UnauthorizedError())
  })
}

server.get('/api/user', authorizer, (req, res, next) => {
  findUser(req.userId).cata({
    Some: user => {
      res.send(user)
      next()
    },
    None: () => next(BadRequestError('Unable to find user'))
  })
})

server.post('/api/user', (req, res, next) => {
  createUser(req.body).cata({
    Left: error => next(BadRequestError('Unable to create user', error)),
    Right: data => {
      res.send(data)
      next()
    }
  })
})

server.post('/api/token', (req, res, next) => {
  getToken(req.body).cata({
    Left: error => next(UnauthorizedError('Unable to get token', error)),
    Right: data => {
      res.send(data)
      next()
    }
  })
})

server.get('/api/posts', (req, res, next) => {
  res.send(getAllPosts())
  next()
})

server.post('/api/post', authorizer, (req, res, next) => {
  createPost({ userId: req.userId, ...req.body }).cata({
    Left: (error) => next(BadRequestError('Unable to create post', error)),
    Right: post => {
      res.send(post)
      next()
    }
  })
})

server.get('/api/post/:id', (req, res, next) => {
  findPost(req.params.id).cata({
    Some: post => {
      res.send(post)
      next()
    },
    None: () => next(NotFoundError())
  })
})

server.patch('/api/post/:id', authorizer, (req, res, next) => {
  updatePost(req.params.id, req.body).cata({
    Left: (error) => next(BadRequestError('Unable to update post', error)),
    Right: post => {
      res.send(post)
      next()
    },
  })
})

server.post('/api/post/:postId/comment', authorizer, (req, res, next) => {
  createComment(req.userId, req.params.postId, req.body).cata({
    Left: (error) => next(BadRequestError('Unable to create comment', error)),
    Right: post => {
      res.send(post)
      next()
    },
  })
})

server.get('/api/post/:postId/comments', authorizer, (req, res, next) => {
  res.send(findPostComments(req.params.postId))
  next()
})

server.del('/api/post/:postId/comment/:commentId', authorizer, (req, res, next) => {
  deleteComment(req.userId, req.params.commentId).cata({
    Left: (error) => next(BadRequestError('Unable to delete comment', error)),
    Right: (data) => {
      res.send('ok')
      next()
    },
  })
})

server.use(restify.plugins.bodyParser())


server.listen(3002, function() {
  console.log('%s listening at %s', server.name, server.url);
})