const blessed = require('neo-blessed');
const { Source, now, later, value, continuation, floatOn, commit, forget, IO } = require('streamer');

// The display is a recursive structure: it is either an atom (a box with border) or a list of displays
// A list is practically a placeholder box without border, the empty list is a box without children or border
//
// Note that Blessed structures the screen in a tree of nodes like a DOM, and everything is a node. Boxes
// are elements (which are nodes) but the screen (a node) is not an element. It can't be created twice
// so that displays to render are always built on top of a placeholder box then attached to the screen
function emptyList() {
  return blessed.Box({width: "100%", height: "100%"});
}

function cons(display, list) {
  const newList = list.children.reduce((list, display) => {
    list.append(display);
	
    return list;
  }, listFrom(list));

  newList.append(display);

  return newList;
}

function car(list) {
  const firstDisplay = list.children[list.children.length - 1];

  if (isAtom(firstDisplay)) {
    return atomFrom(firstDisplay);
  }
  else {
    return firstDisplay.children.reduce((list, display) => cons(display, list), listFrom(firstDisplay));
  }
}

function cdr(list) {
  return [...list.children.slice(0, -1)].reduce((list, display) => cons(display, list), listFrom(list));
}

function isAtom(display) {
  return display.border ? true : false;
}

function isNull(list) {
  return !isAtom(list) && list.children.length === 0;
}

function atom(content) {
  return blessed.Box({
    content: content,
    border: {type: "line"}
  });
}

function atomFrom(other, transform) {
  transform = transform ? transform : option => option;

  return blessed.Box(Object.fromEntries(Object.entries({
    content: other.content,
    width: other.position.width,
    height: other.position.height,
    left: other.position.left,
    top: other.position.top,
    border: {type: "line"},
  }).map(transform)));
}

function listFrom(other, transform) {
  transform = transform ? transform : option => option;

  return blessed.Box(Object.fromEntries(Object.entries({
    width: other.position.width,
    height: other.position.height,
    left: other.position.left,
    top: other.position.top,
  }).map(transform)));
}

function renderer() {
  const screen = blessed.screen({ smartCSR: true });

  screen.append(emptyList());

  return display => {
    screen.children[0].detach();

    screen.append(display);

    screen.render();
  };
}

function compose(template, ...reactiveComponents) {
  const composer = (...predecessors) => selector => stream => {
    return selector(() => template(...reactiveComponents.map((component, index) => component(predecessors[index])(stream)())))
	           (composer(...reactiveComponents.map((component, index) => component(predecessors[index])(stream))));
  };

  return composer(...reactiveComponents.map(_ => undefined));
}

function show(render) {
  const first = f => g => f;

  const second = f => g => g;

  const print = async (stream) => {
    render(value(now(stream))());

    return stream;
  };

  const shower = component => async (stream) => print(await commit(floatOn(stream, component(first)(stream)), shower(component(second)(stream))));

  return shower;
}

module.exports = { emptyList, cons, car, cdr, isAtom, isNull, atom, atomFrom, listFrom, renderer, compose, show };
