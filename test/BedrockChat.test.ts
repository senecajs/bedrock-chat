/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import Seneca from 'seneca'
// import SenecaMsgTest from 'seneca-msg-test'
// import { Maintain } from '@seneca/maintain'

import BedrockChatDoc from '../src/BedrockChatDoc'
import BedrockChat from '../src/BedrockChat'

// NOTE: requires valid AWS_PROFILE environment variable
const LOCAL = !!process.env.AWS_PROFILE


describe('BedrockChat', () => {

  test('happy', async () => {
    expect(BedrockChat).toBeDefined()
    expect(BedrockChatDoc).toBeDefined()
    const seneca = await makeSeneca()
    expect(seneca).toBeDefined()
  })


  test('basic-query', async () => {
    if (!LOCAL) return;

    const seneca = await makeSeneca()
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: 'what is devrel?',
    })

    // console.log('res1', res1)

    expect(res1).toMatchObject({ ok: true })
  }, 9999)


  test('model-query', async () => {
    if (!LOCAL) return;

    const seneca = await makeSeneca({
      /*
      config: {
        model: 'meta.llama3-8b-instruct-v1:0',
        modelSettings: {
          maxTokens: null,
          topP: null,
          top_p: 0.9,
          max_gen_len: 555,
        }
        }
        */
    })
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: `
<| begin_of_text |> <| start_header_id |>user<| end_header_id |>
what is devrel?
<| eot_id |>
<| begin_of_text |><| start_header_id |>assistant<| end_header_id |>
`,
    })

    expect(res1).toMatchObject({ ok: true })
  }, 9999)


  test('model-json-query', async () => {
    if (!LOCAL) return;

    const seneca = await makeSeneca({
      config: {
        model: 'meta.llama3-8b-instruct-v1:0',
        modelSettings: {
          maxTokens: null,
          topP: null,
          top_p: 0.9,
          max_gen_len: 1111,
        }
      }
    })
    let res1 = await seneca.post('sys:chat,submit:query', {
      query: `
<| begin_of_text |>
<| start_header_id |>system<| end_header_id |>
Provide one answer only. DO NOT GENERATE A CONVERSATION.
<| eot_id |>
<| begin_of_text |>
<| start_header_id |>user<| end_header_id |>
Generate a JSON document describing the solar system in the format {"planets":{...}}. GENERATE ONLY JSON.
<| eot_id |>
<| begin_of_text |><| start_header_id |>assistant<| end_header_id |>
`,
    })

    expect(res1).toMatchObject({ ok: true })

    const json = JSON.parse(res1.answer)
    expect(json).toMatchObject({ planets: {} })

  }, 9999)

})



async function makeSeneca(opts?: any) {
  const seneca = Seneca({ legacy: false })
    // .test('print')
    .test()
    .use('promisify')
    .use('entity')
    .use(BedrockChat, opts)
  await seneca.ready()

  return seneca
}

