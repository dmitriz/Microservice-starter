// functions.test.js
const test = require("ava")
const fn = require("./fn.js")

// Testing for success
test(" ", (t) => {
  fn({})((res) => {
    t.deepEqual(res, {})
  })
})

// Testing for error
test(" ", (t) => {
  fn({})(() => {
    console.log("Success callback")
  }, (err) => {
    
  })
})
