'use strict';
const readabilityFromString = require('readability-from-string');

module.exports = exports = function (RED) {
	function ReadabilityNode(config) {
		RED.nodes.createNode(this, config);
		this.on('input', msg => {
			const html = msg.payload;
			const href = msg.href;
			try {
				const result = readabilityFromString(html, {href}) || {};
				this.send(Object.assign({}, msg, {
					title: result.title,
					content: result.content,
					length: result.length,
					excerpt: result.excerpt,
					byline: result.byline,
					dir: result.dir
				}));
			} catch (err) {
				this.error(err, msg);
			}
		});
	}
	RED.nodes.registerType('readability', ReadabilityNode);
};
