const quxx = 123
function func (a, b, c) {
  // const foo = 'bar'
  // console.log(this)
  return {
    foo (){ 
      console.log(a, b, c, JSON.stringify(arguments[0]))
    },
    bar () {
      return this.foo.bind(null, {a, quxx})
    }
  }
}


func('adsfg').bar()()

// const dog = { 
//   sound: 'woof',
//   talk () {
//     console.log(this.sound)
//   }
// }

// function talk (word) {
//   console.log(this.sound, word)
// }

// dog.talk()
// const person = {
//   sound: 'Hello'
// }
// const cat = {
//   sound: 'meow',
//   talk: talk
// }
// talk.bind(cat)('kitty')
// talk.bind(person)('world')
// cat.talk()