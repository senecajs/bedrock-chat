/* Copyright © 2024 Seneca Project Contributors, MIT License. */

import Seneca from 'seneca'
// import SenecaMsgTest from 'seneca-msg-test'
// import { Maintain } from '@seneca/maintain'

import BedrockChatDoc from '../src/BedrockChatDoc'
import BedrockChat from '../src/BedrockChat'



describe('BedrockChat', () => {
  test('happy', async () => {
    expect(BedrockChatDoc).toBeDefined()
    const seneca = Seneca({ legacy: false })
      .test()
      .use('promisify')
      .use('entity')
      .use(BedrockChat)
    await seneca.ready()
  })

})


/*
async function makeSeneca() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use('entity-util', { when: { active: true } })

  await makeBasicRules(seneca)

  seneca.use(BedrockChat)

  await makeMockActions(seneca)

  await seneca.ready()

  // print all message patterns
  // console.log(seneca.list())

  return seneca
}
*/
