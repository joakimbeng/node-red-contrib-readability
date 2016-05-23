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
				const payload = {
					title,
					content,
					text,
					excerpt,
					length: text.length,
					meta: getMeta(result.document),
					icons: getIcons(result.document)
				};
				result = undefined;
				this.send(Object.assign({}, msg, {payload}));
			});
		});
	}
	RED.nodes.registerType('readability', ReadabilityNode);
};

function getMeta($) {
	const meta = {};
	$('meta').each(function () {
		const el = $(this);
		const name = el.attr('name') || el.attr('property');
		if (!name) {
			return;
		}
		setMeta(meta, name, el.attr('content'));
	});
	return meta;
}

function getIcons($) {
	const icons = [];
	$('link[rel]').each(function () {
		const el = $(this);
		const rel = el.attr('rel');
		if (!rel || rel.indexOf('icon') === -1) {
			return;
		}
		icons.push({
			href: el.attr('href'),
			rel: el.attr('rel'),
			type: el.attr('type') || null,
			sizes: el.attr('sizes') || null
		});
	});
	return icons;
}

function setMeta(meta, name, value) {
	if (typeof value !== 'string') {
		return;
	}
	const parts = getName(name).split(':');
	parts.reduce((obj, prop, i) => {
		if (i + 1 === parts.length) {
			obj[prop] = value.trim();
		} else {
			obj[prop] = obj[prop] || {};
		}
		return obj[prop];
	}, meta);
}

function getName(name) {
	name = name.toLowerCase().replace(/\s/g, '');
	if (name === 'og:image') {
		return 'og:image:url';
	} else if (name === 'og:video') {
		return 'og:video:url';
	} else if (name === 'og:audio') {
		return 'og:audio:url';
	}
	return name;
}
