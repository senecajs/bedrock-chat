"use strict";
/* Copyright © 2024 Seneca Project Contributors, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
function BedrockChat(options) {
    const seneca = this;
    seneca
        .fix('sys:chat,chat:bedrock')
        .message('submit:query', msgSubmitQuery);
    async function msgSubmitQuery(msg) {
        const seneca = this;
        return {
            ok: true,
        };
    }
}
// Default options.
const defaults = {
    // TODO: Enable debug logging
    debug: false,
};
Object.assign(BedrockChat, { defaults });
exports.default = BedrockChat;
if ('undefined' !== typeof module) {
    module.exports = BedrockChat;
}
//# sourceMappingURL=BedrockChat.js.map