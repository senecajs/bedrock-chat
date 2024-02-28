require('dotenv').config({path:'.env.local'})
console.log(process.env) // remove this

const Seneca = require('seneca')
const BedrockChatDoc = require('../dist/BedrockChatDoc')
const BedrockChat = require('../dist/BedrockChat')


run()

async function run() {
  const seneca = Seneca({ legacy: false })
        .test('print')
        .use('promisify')
        .use('entity')
        .use(BedrockChat)
  await seneca.ready()


  let res1 = await seneca.post('sys:chat,submit:query',{
    query:'what is devrel?',
  })

  console.log('res1', res1)

}
