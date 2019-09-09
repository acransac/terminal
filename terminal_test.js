const { inline, sizeWidth, row } = require('./components.js');
const EventEmitter = require('events');
const Readline = require('readline');
const { Source, now, later, value, continuation, floatOn, commit, forget, IO } = require('streamer');
const { renderer, compose, show, cons, emptyList, atom } = require('./terminal.js');

class dummyEventEmitter extends EventEmitter {
  constructor() {
    super();

    this.onevent = undefined;

    this.on('event', (event) => this.onevent(event));
  }
};

display();

function display() {
  const repl = Readline.createInterface({ input: process.stdin });

  const events = new dummyEventEmitter();

  repl.on('line', (line) => events.emit('event', line));

  setTimeout(() => events.emit('event', 'a'), 3000);

  //const render = renderer();

  Source.from(events, "onevent")
	.withDownstream(async (stream) => loop(await IO(show, console.log)(compose(twoAtomsInline, A, B))(stream)));
}

function twoAtomsInline(f, g) {
  return cons(atom(f), cons(atom(g), emptyList()));
}

function A(predecessor) {
  return (stream) => {
    if (value(now(stream)) === 'a') {
      return () => 'a';
    }
    else if (value(now(stream)) === 'A') {
      return () => 'A';
    }
    else {
      return predecessor;
    }
  }
}

function B(predecessor) {
  return (stream) => {
    if (value(now(stream)) === 'b') {
      return () => 'b';
    }
    else {
      return predecessor;
    }
  }
}

async function loop(stream) {
  return loop(await continuation(now(stream))(forget(await later(stream))));
}
