# @seneca/bedrock-chat

> _Seneca Bedrock Chat_ is a plugin for [Seneca](http://senecajs.org)

Expose AWS Bedrock LLM Chat API via standard `sys:chat` message patterns.

This plugin is part of a family of plugins that wrap LLM Chat APIs.


Production Example: [Voxgig Podmind](https://github.com/voxgig/podmind) 


[![npm version](https://img.shields.io/npm/v/@seneca/bedrock-chat.svg)](https://npmjs.com/package/@seneca/bedrock-chat)
[![build](https://github.com/senecajs/seneca-bedrock-chat/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-bedrock-chat/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/senecajs/seneca-bedrock-chat/badge.svg?branch=main)](https://coveralls.io/github/senecajs/seneca-bedrock-chat?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-bedrock-chat/badge.svg)](https://snyk.io/test/github/senecajs/seneca-bedrock-chat)
[![DeepScan grade](https://deepscan.io/api/teams/5016/projects/26559/branches/847621/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5016&pid=26559&bid=847621)
[![Maintainability](https://api.codeclimate.com/v1/badges/06a44ac68c7be4a46c67/maintainability)](https://codeclimate.com/github/senecajs/seneca-bedrock-chat/maintainability)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |


## Install

```sh
$ npm install @seneca/bedrock-chat
```


## Quick Example

```js
seneca.use('bedrock-chat')

let chatRes = await seneca.post('sys:chat,submit:query', {
  query: 'what is devrel?',
})
// ==== { ok: true, answer: 'DevRel stands for Developer Relations...' }
```

## More Examples

Review the [unit tests](test/BedrockChat.test.ts) for more examples.



<!--START:options-->


## Options

* `debug` : boolean
* `global` : boolean
* `bedrock` : object
* `config` : object
* `init$` : boolean


<!--END:options-->

<!--START:action-list-->


## Action Patterns

* [sys:chat](#-syschat-)
* [sys:chat,chat:bedrock,invoke:model](#-syschatchatbedrockinvokemodel-)
* [sys:chat,chat:bedrock,submit:query](#-syschatchatbedrocksubmitquery-)


<!--END:action-list-->

<!--START:action-desc-->


## Action Descriptions

### &laquo; `sys:chat` &raquo;

No description provided.



----------
### &laquo; `sys:chat,chat:bedrock,invoke:model` &raquo;

Invoke LLM with a prompt.


#### Parameters


* __prompt__ : _string_
* __config__ : _object_


----------
### &laquo; `sys:chat,chat:bedrock,submit:query` &raquo;

Submit a chat query, optionally specifying chat provider.


#### Parameters


* __query__ : _string_


----------


<!--END:action-desc-->

## Motivation

## Support

## API

## Contributing

## Background
