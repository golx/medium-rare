import * as R from 'ramda'

export const notNil = R.complement(R.isNil)

export const nonEmptyString = R.allPass([
  notNil,
  R.is(String),
  R.pipe(
    R.trim,
    R.length,
    R.gt(R.__, 0),
  )
])