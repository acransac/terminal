const { inline, sizeWidth, row } = require('./components.js');
const EventEmitter = require('events');
const Readline = require('readline');
const { Source, now, later, value, continuation, floatOn, commit, forget, IO } = require('streamer');
const { renderer, cons, emptyList, atom } = require('./terminal.js');

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

  //const render = makeDummy();
  const render = renderer();

  Source.from(events, "onevent").withDownstream(async (stream) => loop(await IO(sendToRender, render)(await populate(stream))));
}

function makeDummy() {
  return message => console.log(message);
}

function sendToRender(render) {
  const continuation = async (stream) => {
    render(value(now(stream)));

    return commit(stream, continuation);
  }

  return continuation;
}

async function populate(stream) {
  //return commit(floatOn(stream, value(now(stream))), populate);
  return commit(floatOn(stream, cons(atom(value(now(stream))), emptyList())), populate);
}

async function loop(stream) {
  return loop(await continuation(now(stream))(forget(await later(stream))));
}
