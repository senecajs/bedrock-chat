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
  })
})



async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    // .test('print')
    .test()
    .use('promisify')
    .use('entity')
    .use(BedrockChat)
  await seneca.ready()

  return seneca
}

