// functions.test.js
const test = require("ava")
const fn = require("./functions.js")

// Testing for success with empty params
test("Should process empty params successfully", (t) => {
  fn({})((res) => {
    t.truthy(res.processed)
    t.truthy(res.timestamp)
    t.deepEqual(res.params, {})
    t.is(res.message, "Request processed successfully")
  })
})

// Testing addition operation
test("Should add two numbers correctly", (t) => {
  fn({ operation: "add", a: 5, b: 3 })((res) => {
    t.is(res.result, 8)
    t.truthy(res.processed)
  })
})

// Testing multiply operation
test("Should multiply two numbers correctly", (t) => {
  fn({ operation: "multiply", a: 5, b: 3 })((res) => {
    t.is(res.result, 15)
    t.truthy(res.processed)
  })
})

// Testing greeting with name
test("Should create greeting with name", (t) => {
  fn({ name: "John" })((res) => {
    t.is(res.greeting, "Hello, John!")
    t.truthy(res.processed)
  })
})

// Testing for error with null params
test("Should handle null params with error", (t) => {
  fn(null)(() => {
    t.fail("Success callback should not be called")
  }, (err) => {
    t.is(err.error, "Missing parameters")
    t.is(err.status, 400)
  })
})
