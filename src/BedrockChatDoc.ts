/* Copyright © 2024 Seneca Project Contributors, MIT License. */

const docs = {
  messages: {
    msgSubmitQuery: {
      desc: 'Submit a chat query, optionally specifying chat provider.'
    },
    msgInvokeModel: {
      desc: 'Invoke LLM with a prompt.'
    },
  }
}

export default docs


if ('undefined' !== typeof module) {
  module.exports = docs
}
