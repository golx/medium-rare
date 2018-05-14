import * as R from 'ramda'
import uuidV4 from 'uuid/v4'

import { Maybe, Either } from './types'
import * as util from '../util'


const nonEmptyStringValidation = R.ifElse(
  util.nonEmptyString,
  R.always(Maybe.None),
  R.always(Maybe.Some('The string is empty'))
)

const stringValidation = R.ifElse(
  R.is(String),
  R.always(Maybe.None),
  R.always(Maybe.Some('The string is empty'))
)

const validate = R.curry((validations, obj) => R.pipe(
    R.toPairs,
    R.map(([prop, validator]) => [prop, validator(obj[prop])]),
    R.filter(([, validation]) => validation.isSome()),
    R.map(([prop, error]) => error.map(v => [prop, v])),
    R.ifElse(
      errors => errors.length > 0,
      R.sequence(Maybe.of),
      R.always(Maybe.None)
    )
  )(validations)
)

const userSchema = {
  username: nonEmptyStringValidation,
  password: nonEmptyStringValidation,
}

const validateUser = validate(userSchema)

const postSchema = {
  userId: nonEmptyStringValidation,
  title: nonEmptyStringValidation,
  hero: stringValidation,
  description: stringValidation,
  body: nonEmptyStringValidation,
}

export const postUpdateWhitelist = ['title', 'body']

const validatePost = validate(postSchema)

const commentSchema = {
  userId: nonEmptyStringValidation,
  postId: nonEmptyStringValidation,
  message: nonEmptyStringValidation,
}

const validateComment = validate(commentSchema)

const tokenSchema = {
  userId: nonEmptyStringValidation
}

const validateToken = validate(tokenSchema)

const tryCreateEntity = R.curry((validator, schema, obj) => (
  validator(obj).cata({
    Some: (errors) => Either.Left(errors),
    None: () => Either.Right({
      id: uuidV4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...R.pick(R.keys(schema), obj)
    })
  })
))

const tryUpdateEntity = R.curry((validator, schema, whitelist, obj, update) => {
  const toValidate = { ...obj, ...R.pick(whitelist, update) }

  return validator(toValidate).cata({
    Some: errors => Either.Left(errors),
    None: () => Either.Right({
      ...toValidate,
      updatedAt: Date.now(),
    })
  })
})

export const User = tryCreateEntity(validateUser, userSchema)

export const Post = tryCreateEntity(validatePost, postSchema)

export const updatePost = tryUpdateEntity(validatePost, postSchema, postUpdateWhitelist)

export const Comment = tryCreateEntity(validateComment, commentSchema)

export const Token = tryCreateEntity(validateToken, tokenSchema)