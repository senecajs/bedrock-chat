/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws'
import { Client } from '@opensearch-project/opensearch'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

import { Gubu } from 'gubu'


const { Open } = Gubu


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
    .message('submit:query', msgSubmitQuery)
    .message('build:prompt', msgBuildPrompt)
    .message('invoke:model', msgInvokeModel)

  seneca.prepare(prepare)

  if (options.global) {
    seneca.translate('sys:chat', 'sys:chat,chat:bedrock')
  }


  async function msgSubmitQuery(this: any, msg: any) {
    const seneca = this

    const chat = msg.chat
    const query = msg.query


    // TODO: move to own plugin
    const contextRes = await seneca.post('sys:embed,embed:opensearch', {
      query,
      config: options.opensearch,
    })

    if (!contextRes.ok) {
      return contextRes
    }

    const context = contextRes.context
    const hits = contextRes.hits


    const promptRes = await seneca.post('sys:chat,build:prompt', {
      chat,
      query,
      context,
    })

    if (!promptRes.ok) {
      return promptRes
    }

    const prompt = promptRes.prompt


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
      context,
      hits,
    }
  }


  async function msgBuildPrompt(this: any, msg: any) {
    // const seneca = this

    const query = msg.query
    const context = msg.context

    const clipped = context.substring(0, 8000)

    const prompt = `
Use the CONTEXT to help answer the QUESTION. You are an experienced developer advocate talking to another developer who speaks english as a second language. Answer in the third person, never refer to yourself, do not use casual language. The subject matter is developer relations. The context is taken from devrel podcast conversations. IMPORTANT: YOU MUST ALWAYS ANSWER. MAKE UP AN ANSWER. Do not refer to the existence of the CONTEXT.

CONTEXT:\n\n"""${clipped}"""

QUESTION:\n\n"""${query}"""
`

    return { ok: true, prompt }
  }


  async function msgInvokeModel(this: any, msg: any) {
    // const seneca = this

    const prompt = msg.prompt
    const config = msg.config

    const { model, modelSettings } = config
    const { maxTokens, temperature } = modelSettings

    const response = await client.send(
      new InvokeModelCommand({
        modelId: model,
        body: JSON.stringify({
          maxTokens,
          temperature,
          prompt,
          topP: 1.0
        }),
        accept: 'application/json',
        contentType: 'application/json'
      })
    )

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




  // TODO: mnove to own plugin

  seneca.message('sys:embed,embed:opensearch', async function(this: any, msg: any) {
    // const seneca = this

    const query = msg.query

    const config = msg.config
    const { region, node, index } = config

    const client = getOpenSearchClient(region, node)
    const questionEmbeddings = await getEmbeddings(query, { region })
    const { context, hits } = await getContext(client, index, questionEmbeddings)

    return {
      ok: true,
      context,
      hits,
    }
  })


  async function getContext(openSearchClient: Client, index: string, questionEmbeddings: number[][]) {
    const contextData = await openSearchClient
      .search(createSearchQuery(index, questionEmbeddings))
    // console.log('Full context response:', JSON.stringify(contextData))

    const hits = contextData?.body?.hits?.hits || []
    // console.log('Search hits:', hits)

    const context = hits.map((item: Record<string, any>) => item._source.text).join(';;')
    // console.log('Context: ', context)

    return { context, hits }
  }



  function createSearchQuery(index: string, vector: number[][]) {
    return {
      index,
      body: {
        size: 15,
        _source: { excludes: ['document_vector'] },
        query: {
          knn: {
            document_vector: {
              vector,
              k: 15
            }
          }
        }
      }
    }
  }


  function getOpenSearchClient(region: string, node: string) {
    return new Client({
      ...AwsSigv4Signer({
        region,
        service: 'aoss',
        getCredentials: () => {
          const credentialsProvider = defaultProvider()
          return credentialsProvider()
        }
      }),
      node
    })
  }



  async function getEmbeddings(input: string, config: any): Promise<number[][]> {
    const { region } = config

    const client = new BedrockRuntimeClient({ region })

    const response = await client.send(
      new InvokeModelCommand({
        modelId: 'amazon.titan-embed-text-v1',
        body: JSON.stringify({
          inputText: input
        }),
        accept: 'application/json',
        contentType: 'application/json'
      })
    )

    const result = JSON.parse(Buffer.from(response.body).toString())
    return result.embedding
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

  // TODO: move to own plugin
  opensearch: {
    region: 'REGION',
    node: 'NODE',
    index: 'INDEX',
  }
}


Object.assign(BedrockChat, { defaults })

export default BedrockChat

if ('undefined' !== typeof module) {
  module.exports = BedrockChat
}
