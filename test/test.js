import test from 'ava';
import readabilityNode from '../src/readability';

const red = (config = {}) => {
	const _registered = new Map();
	const _listeners = new Map();
	const _receivers = [];
	return {
		nodes: {
			createNode(node) {
				node.on = (evt, cb) => {
					_listeners.set(evt, cb);
				};
				node.send = msg => {
					_receivers.forEach(cb => cb(msg));
					_receivers.length = 0;
				};
				node.error = err => {
					throw err;
				};
			},
			registerType(name, Node) {
				_registered.set(name, new Node(config));
			}
		},
		_registered,
		_listeners,
		_emit(evt, msg) {
			if (_listeners.has(evt)) {
				return _listeners.get(evt)(msg);
			}
		},
		_receive() {
			return new Promise(resolve => {
				_receivers.push(resolve);
			});
		}
	};
};

test('type is registered', t => {
	const RED = red();
	readabilityNode(RED);
	t.ok(RED._registered.has('readability'));
});

test('sends msg on input', async t => {
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: '<html>Lorem ipsum</html>'
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.is(typeof payload, 'object');
});

test('includes article content and title in output', async t => {
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: `
			<html>
				<head>
					<title>An article about something - A page</title>
				</head>
				<body>
					<main>
						<article>
							<h2>An article about something</h2>
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
						</article>
					</main>
				</body>
			</html>
		`
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.ok(payload.title);
	t.ok(payload.content);
});

test('includes article description as excerpt', async t => {
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: `
			<html>
				<head>
					<title>An article about something - A page</title>
					<meta name="description" content="A short description">
				</head>
				<body>
					<main>
						<article>
							<h2>An article about something</h2>
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
						</article>
					</main>
				</body>
			</html>
		`
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.is(payload.excerpt, 'A short description');
});

test('includes meta data', async t => {
	/* eslint camelcase: 0 */
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: `
			<html>
				<head>
					<title>An article with lots of meta - Example</title>
					<meta property="og:type" content="article" />
					<meta property="og:title" content="An article with lots of meta" />
					<meta property="og:url" content="http://example.com" />
					<meta property="og:description" content="A detailed description of the article..." />
					<meta property="og:site_name" content="Example" />
					<meta property="og:image" content="http://example.com/image.png" />
					<meta property="og:image:width" content="128" />
					<meta property="og:image:height" content="128" />
					<meta property="og:locale" content="en_US" />
					<meta name="twitter:site" content="@joakimbeng" />
					<meta name="twitter:image" content="http://example.com/joakimbeng.png" />
					<meta name="twitter:card" content="summary" />
					<meta name="twitter:creator" content="@joakimbeng" />
				</head>
				<body>
					<main>
						<article>
							<h2>An article about something</h2>
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
						</article>
					</main>
				</body>
			</html>
		`
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.is(typeof payload.meta, 'object');
	t.is(typeof payload.meta.og, 'object');
	t.is(typeof payload.meta.twitter, 'object');
	const expectedOg = {
		type: 'article',
		title: 'An article with lots of meta',
		url: 'http://example.com',
		description: 'A detailed description of the article...',
		site_name: 'Example',
		locale: 'en_US'
	};
	const expectedOgImage = {
		url: 'http://example.com/image.png',
		width: '128',
		height: '128'
	};
	const expectedTwitter = {
		site: '@joakimbeng',
		image: 'http://example.com/joakimbeng.png',
		card: 'summary',
		creator: '@joakimbeng'
	};
	Object.keys(expectedOg).forEach(key => {
		t.is(payload.meta.og[key], expectedOg[key]);
	});
	Object.keys(expectedOgImage).forEach(key => {
		t.is(payload.meta.og.image[key], expectedOgImage[key]);
	});
	Object.keys(expectedTwitter).forEach(key => {
		t.is(payload.meta.twitter[key], expectedTwitter[key]);
	});
});

test('ignores meta data without content', async t => {
	/* eslint camelcase: 0 */
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: `
			<html>
				<head>
					<title>An article with weird meta - Example</title>
					<meta property="a_prop" value="some val" />
				</head>
				<body>
					<main>
						<article>
							<h2>An article about something</h2>
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
						</article>
					</main>
				</body>
			</html>
		`
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.is(typeof payload.meta, 'object');
	t.is(typeof payload.meta.a_prop, 'undefined');
});

test('includes icon data', async t => {
	/* eslint camelcase: 0 */
	const RED = red();
	readabilityNode(RED);
	const msg = {
		url: 'http://example.com',
		payload: `
			<html>
				<head>
					<title>An article with icons - Example</title>
					<link rel="shortcut icon" type="image/x-icon" href="http://example.com/favicon.ico" sizes="16x16 24x24 32x32 48x48" />
					<link rel="icon" type="image/x-icon" href="http://example.com/favicon.ico" sizes="16x16 24x24 32x32 48x48" />
					<link rel="apple-touch-icon-precomposed" href="http://example.com/icon.png" />
				</head>
				<body>
					<main>
						<article>
							<h2>An article about something</h2>
							<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
						</article>
					</main>
				</body>
			</html>
		`
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const {payload} = await receiver;
	t.ok(Array.isArray(payload.icons));
	const expectedIcons = [
		{href: 'http://example.com/favicon.ico', type: 'image/x-icon', rel: 'shortcut icon', sizes: '16x16 24x24 32x32 48x48'},
		{href: 'http://example.com/favicon.ico', type: 'image/x-icon', rel: 'icon', sizes: '16x16 24x24 32x32 48x48'},
		{href: 'http://example.com/icon.png', type: null, rel: 'apple-touch-icon-precomposed', sizes: null}
	];
	t.is(payload.icons.length, expectedIcons.length);
	payload.icons.forEach((icon, i) => {
		Object.keys(icon).forEach(key => {
			t.is(icon[key], expectedIcons[i][key]);
		});
	});
});
