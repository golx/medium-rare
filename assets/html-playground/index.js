console.log('Hello JS')

function f () {
  setTimeout(() => { console.log('a')})
  console.log('b')
  console.log(this)
}

f()