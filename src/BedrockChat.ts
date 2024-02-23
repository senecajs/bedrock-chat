/* Copyright © 2024 Seneca Project Contributors, MIT License. */


type BedrockChatOptions = {
  debug?: boolean
}


function BedrockChat(this: any, options: BedrockChatOptions) {
  const seneca: any = this


  seneca
    .fix('sys:chat,chat:bedrock')
    .message('submit:query', msgSubmitQuery)


  async function msgSubmitQuery(this: any, msg: any) {
    const seneca = this

    return {
      ok: true,
    }
  }
}


// Default options.
const defaults: BedrockChatOptions = {
  // TODO: Enable debug logging
  debug: false,
}


Object.assign(BedrockChat, { defaults })

export default BedrockChat

if ('undefined' !== typeof module) {
  module.exports = BedrockChat
}
