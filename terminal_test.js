const { inline, sizeWidth, row } = require('./components.js');
const EventEmitter = require('events');
const Readline = require('readline');
const { Source, now, later, floatOn, IO } = require('streamer');
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
    render(now(stream)[0]);

    return floatOn(stream, [null, async (stream2) => {
      return continuation(await now(stream)[1](stream2));
    }]);
  }

  return continuation;
}

async function populate(stream) {
  //return floatOn(stream, [now(stream), populate]);
  return floatOn(stream, [cons(atom(now(stream)[0]), emptyList()), populate]);
}

async function loop(stream) {
  return loop(await now(stream)[1](await later(stream)));
}
