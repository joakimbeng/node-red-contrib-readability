'use strict';
const readabilityJs = require('readability-js');

module.exports = exports = function (RED) {
	function ReadabilityNode(config) {
		RED.nodes.createNode(this, config);
		this.on('input', msg => {
			const html = msg.payload;
			readabilityJs(html, (err, result) => {
				if (err) {
					this.error(err, msg);
					return;
				}
				const title = result.title;
				const hasContent = Boolean(result.content);
				const text = hasContent && result.content.text();
				const content = hasContent && result.content.html();
				const excerpt = result.excerpt;
				result = undefined;
				this.send(Object.assign({}, msg, {
					title,
					content,
					text,
					excerpt,
					length: text.length
				}));
			});
		});
	}
	RED.nodes.registerType('readability', ReadabilityNode);
};
