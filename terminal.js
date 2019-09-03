const blessed = require('neo-blessed');

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

module.exports = { emptyList, cons, car, cdr, isAtom, isNull, atom, atomFrom, listFrom, renderer };
