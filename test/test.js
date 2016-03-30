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
		href: 'http://example.com',
		payload: '<html>Lorem ipsum</html>'
	};
	const receiver = RED._receive();
	RED._emit('input', msg);
	const newMsg = await receiver;
	t.ok(newMsg);
	t.ok(newMsg.payload);
	t.is(newMsg.payload, msg.payload);
});

test('includes article content and title in output', async t => {
	const RED = red();
	readabilityNode(RED);
	const msg = {
		href: 'http://example.com',
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
	const newMsg = await receiver;
	t.ok(newMsg.title);
	t.ok(newMsg.content);
});
