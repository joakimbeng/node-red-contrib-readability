# node-red-contrib-readability

[![Build status][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![XO code style][codestyle-image]][codestyle-url]

> A Node-RED readability node

A node that runs [`readability-js`](https://www.npmjs.com/package/readability-js) on the input payload.

## Installation

Install `node-red-contrib-readability` using [npm](https://www.npmjs.com/):

```bash
npm install --save node-red-contrib-readability
```

## Usage

To use the node, launch Node-RED (see [running Node-RED](http://nodered.org/docs/getting-started/running.html) for help getting started).

The input payload should be the HTML to run readability on.

The output message will be the same as the input but with the following properties attached (if an article was found in the HTML):

* `title` - the article title
* `content` - the article content HTML
* `text` - the article content text
* `length` - length of article, in characters

## Icon credit

The node icon is the [readability](https://materialdesignicons.com/icon/readability) icon from [Material Design Icons](https://materialdesignicons.com) by Austin Andrews [@Templarian](http://twitter.com/Templarian).

## License

MIT © [Joakim Carlstein](http://joakim.beng.se)

[npm-url]: https://npmjs.org/package/node-red-contrib-readability
[npm-image]: https://badge.fury.io/js/node-red-contrib-readability.svg
[travis-url]: https://travis-ci.org/joakimbeng/node-red-contrib-readability
[travis-image]: https://travis-ci.org/joakimbeng/node-red-contrib-readability.svg?branch=master
[codestyle-url]: https://github.com/sindresorhus/xo
[codestyle-image]: https://img.shields.io/badge/code%20style-XO-5ed9c7.svg?style=flat
