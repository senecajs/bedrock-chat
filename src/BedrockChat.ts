/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

import { Gubu } from 'gubu'


const { Open, Default } = Gubu


type BedrockChatOptions = {
  debug?: boolean,
  global?: boolean,

  bedrock?: any,
  config?: any

  opensearch?: any
}


function BedrockChat(this: any, options: BedrockChatOptions) {
  const seneca: any = this

  let client: any

  seneca
    .fix({
      sys: 'chat',
      chat: 'bedrock',
    })
    .message('submit:query', { query: String, chat: Default('') }, msgSubmitQuery)
    .message('invoke:model', { prompt: String, config: Object }, msgInvokeModel)

  seneca.prepare(prepare)

  if (options.global) {
    seneca.translate('sys:chat', 'sys:chat,chat:bedrock')
  }


  async function msgSubmitQuery(this: any, msg: any) {
    const seneca = this

    const chat = msg.chat
    const query = msg.query

    const prompt = query

    const invokeRes = await seneca.post('sys:chat,invoke:model', {
      chat,
      query,
      prompt,
      config: options.config
    })

    if (!invokeRes.ok) {
      return invokeRes
    }

    const answer = invokeRes.answer


    return {
      ok: true,
      answer,
    }
  }



  async function msgInvokeModel(this: any, msg: any) {
    const prompt = msg.prompt
    const config = msg.config

    const { model, modelSettings } = config
    const { maxTokens, temperature } = modelSettings

    const invokeParams = {
      modelId: model,
      body: JSON.stringify({
        maxTokens,
        temperature,
        prompt,
        topP: 1.0
      }),
      accept: 'application/json',
      contentType: 'application/json'
    }

    const response = await client.send(new InvokeModelCommand(invokeParams))

    const result = JSON.parse(Buffer.from(response.body).toString())
    const answer = result.completions[0].data.text

    return {
      ok: true,
      result,
      answer,
    }
  }


  async function prepare() {
    client = new BedrockRuntimeClient(options.bedrock)
  }
}



// Default options.
const defaults: BedrockChatOptions = {
  // TODO: Enable debug logging
  debug: false,

  // If true, translate sys:chat messages to sys:chat,chat:bedrock
  global: true,

  bedrock: Open({
    region: 'us-east-1'
  }),


  config: Open({
    model: 'ai21.j2-ultra-v1',
    modelSettings: Open({
      maxTokens: 1525,
      temperature: 0.7,
      region: 'us-east-1'
    }),
  }),
}


Object.assign(BedrockChat, { defaults })

export default BedrockChat

if ('undefined' !== typeof module) {
  module.exports = BedrockChat
}
