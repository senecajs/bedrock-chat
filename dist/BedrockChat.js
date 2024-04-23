"use strict";
/* Copyright © 2024 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const gubu_1 = require("gubu");
const { Open, Default, One } = gubu_1.Gubu;
function BedrockChat(options) {
    const seneca = this;
    let client;
    seneca
        .fix({
        sys: 'chat',
        chat: 'bedrock',
    })
        .message('submit:query', { query: String, chat: Default('') }, msgSubmitQuery)
        .message('invoke:model', { prompt: String, config: Object }, msgInvokeModel);
    seneca.prepare(prepare);
    if (options.global) {
        seneca.translate('sys:chat', 'sys:chat,chat:bedrock');
    }
    async function msgSubmitQuery(msg) {
        const seneca = this;
        const chat = msg.chat;
        const query = msg.query;
        const prompt = query;
        const invokeRes = await seneca.post('sys:chat,invoke:model', {
            chat,
            query,
            prompt,
            config: options.config
        });
        if (!invokeRes.ok) {
            return invokeRes;
        }
        const answer = invokeRes.answer;
        return {
            ok: true,
            answer,
        };
    }
    async function msgInvokeModel(msg) {
        const prompt = msg.prompt;
        const config = msg.config;
        let { model, modelSettings } = config;
        modelSettings = Object
            .entries(modelSettings)
            .filter(n => null != n[1])
            .reduce((a, n) => (a[n[0]] = n[1], a), {});
        // console.log('MS', modelSettings)
        const { maxTokens, temperature, topP } = modelSettings;
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
        };
        const response = await client.send(new client_bedrock_runtime_1.InvokeModelCommand(invokeParams));
        const result = JSON.parse(Buffer.from(response.body).toString());
        // console.log('RES', result)
        let answer = result.generation ?
            result.generation :
            result.completions ?
                result.completions[0].data.text :
                'Unable to answer.';
        answer = answer.replace(/\<\|.*/s, '');
        return {
            ok: true,
            result,
            answer,
        };
    }
    async function prepare() {
        client = new client_bedrock_runtime_1.BedrockRuntimeClient(options.bedrock);
    }
}
// Default options.
const defaults = {
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
};
Object.assign(BedrockChat, { defaults });
exports.default = BedrockChat;
if ('undefined' !== typeof module) {
    module.exports = BedrockChat;
}
//# sourceMappingURL=BedrockChat.js.map