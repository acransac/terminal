const { inline, indent, vindent, sizeHeight, sizeWidth, column, row } = require('./components.js');
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

  //setTimeout(() => events.emit('event', 'z'), 3000);

  const render = renderer();

  render(test());

  //Source.from(events, "onevent")
	//.withDownstream(async (stream) => loop(await IO(show, render)(compose(twoAtomsInline, A, B))(stream)));
}

function twoAtomsInline(f, g) {
  return inline(cons(sizeWidth(50, atom(f)), cons(sizeWidth(50, atom(g)), emptyList())));
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
      return predecessor ? predecessor : () => "start";
    }
  }
}

function B(predecessor) {
  return (stream) => {
    if (value(now(stream)) === 'b') {
      return () => 'b';
    }
    else {
      return predecessor ? predecessor : () => "start";
    }
  }
}

async function loop(stream) {
  return loop(await continuation(now(stream))(forget(await later(stream))));
}

function test() {
  return cons(cons(sizeWidth(50, atom("A")), cons(cons(sizeHeight(50, atom("B")), cons(vindent(50, sizeHeight(50, atom("C"))), indent(50, column(50)))), row(90))), cons(cons(atom("D"), vindent(90, row(10))), emptyList()));
}