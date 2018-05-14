import * as R from 'ramda'
import fl from 'fantasy-land'
import daggy from 'daggy'

export const Either = daggy.taggedSum('Either', {
  Left: ['error'],
  Right: ['data'],
})

Either.prototype[fl.map] = Either.prototype.map = function (f) {
  return this.cata({
    Left: () => this,
    Right: (value) => Either.Right(f(value))
  })
}

Either.prototype.forEach = function (f) {
  this.cata({
    Left: () => {},
    Right: data => f(data)
  })

  return this
}

const MaybeInt = daggy.taggedSum('Maybe', {
  None: [],
  Some: ['data'],
})

MaybeInt.prototype[fl.map] = MaybeInt.prototype.map = function (f) {
  return this.cata({
    None: () => this,
    Some: data => MaybeInt.Some(f(data)),
  })
}

MaybeInt.prototype[fl.ap] = MaybeInt.prototype.ap = function (that) {
  return this.cata({
    None: () => this,
    Some: data => that.map(f => f(data)),
  })
}

MaybeInt.prototype[fl.alt] = MaybeInt.prototype.alt = function (that) {
  return this.cata({
    None: () => that,
    Some: () => this,
  })
}

MaybeInt.prototype[fl.reduce] = MaybeInt.prototype.reduce = function (f, d) {
  return this.cata({
    None: () => d,
    Some: data => f(d, data),
  })
}

MaybeInt.prototype.forEach = function (f) {
  this.reduce((acc, curr) => f(curr), null)
}

MaybeInt.prototype.getOrElse = function (d) {
  return this.reduce((acc, curr) => curr, d)
}

MaybeInt.prototype.isSome = function () {
  return this.reduce(R.T, false)
}

MaybeInt.prototype.isNone = function () {
  return !this.isSome()
}

MaybeInt[fl.of] = MaybeInt.of = function (v) {
  return MaybeInt.Some(v)
}

MaybeInt.ofNullable = function (v) {
  if (v === null || v === undefined)
    return MaybeInt.None
  return MaybeInt.Some(v)
}

export const Maybe = MaybeInt