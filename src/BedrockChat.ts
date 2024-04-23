/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

import { Gubu } from 'gubu'


const { Open, Default, One } = Gubu


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

    let { model, modelSettings } = config
    modelSettings = Object
      .entries(modelSettings)
      .filter(n => null != n[1])
      .reduce((a: any, n) => (a[n[0]] = n[1], a), {})
    // console.log('MS', modelSettings)

    const { maxTokens, temperature, topP } = modelSettings

    const invokeParams = {
      modelId: model,
      body: JSON.stringify({
        maxTokens,
        temperature,
        prompt,
        topP,
      }),
      accept: 'application/json',
      contentType: 'application/json'
    }

    const response = await client.send(new InvokeModelCommand(invokeParams))

    const result = JSON.parse(Buffer.from(response.body).toString())
    // console.log('RES', result)

    let answer =
      result.generation ?
        result.generation :
        result.completions ?
          result.completions[0].data.text :
          'Unable to answer.'

    answer = answer.replace(/\<\|.*/s, '')

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
      temperature: One(Default(0.7), null),
      region: One(Default('us-east-1'), null),
      maxTokens: One(Default(1525), null),
      topP: One(Default(1.0), null),
    }),
  }),
}


Object.assign(BedrockChat, { defaults })

export default BedrockChat

if ('undefined' !== typeof module) {
  module.exports = BedrockChat
}
