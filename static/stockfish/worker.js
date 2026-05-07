/**
 * Stockfish WASM Web Worker
 *
 * Loads stockfish.js WASM engine and handles UCI protocol communication.
 * Messages from main thread: { id, type, data }
 * Messages to main thread: { id?, type, data }
 */

var engine = null;
var ready = false;
var queue = [];

function resolvePath(file) {
	var base = self.location.href.replace(/\/[^/]*$/, '');
	return `${base}/${file}`;
}

function send(data) {
	self.postMessage(data);
}

function sendReady() {
	send({ type: 'ready' });
}

function onEngineOutput(line) {
	if (typeof line !== 'string') return;

	if (line === 'uciok') {
		engine.sendCommand('isready');
		return;
	}

	if (line === 'readyok') {
		ready = true;
		sendReady();
		for (var i = 0; i < queue.length; i++) {
			engine.sendCommand(queue[i]);
		}
		queue = [];
		return;
	}

	if (line.startsWith('bestmove')) {
		send({ type: 'bestmove', data: line });
		return;
	}

	if (line.startsWith('info')) {
		send({ type: 'info', data: line });
		return;
	}
}

function initEngine() {
	try {
		var wasmPath = resolvePath('stockfish.wasm');

		var locateFile = (path) => {
			if (path.indexOf('.wasm') > -1) {
				if (path.indexOf('.wasm.map') > -1) {
					return `${wasmPath}.map`;
				}
				return wasmPath;
			}
			return resolvePath(path);
		};

		if (typeof Stockfish === 'function') {
			Stockfish({ locateFile: locateFile }).then((sf) => {
				engine = sf;
				engine.listen = onEngineOutput;
				engine.sendCommand('uci');
			});
		} else {
			send({ type: 'error', data: 'Stockfish function not found after loading script.' });
		}
	} catch (e) {
		send({ type: 'error', data: `Failed to initialize engine: ${e.message}` });
	}
}

try {
	importScripts(resolvePath('stockfish.js'));
	initEngine();
} catch (e) {
	send({ type: 'error', data: `Failed to load stockfish.js: ${e.message}` });
}

self.onmessage = (e) => {
	var msg = e.data;

	if (msg.type === 'command') {
		var cmd = msg.data;
		if (ready && engine) {
			engine.sendCommand(cmd);
		} else {
			queue.push(cmd);
		}
	}

	if (msg.type === 'stop' && engine) {
		engine.sendCommand('stop');
	}

	if (msg.type === 'quit' && engine) {
		engine.sendCommand('quit');
		engine = null;
		ready = false;
		self.close();
	}
};
