// Copyright (c) Adrien Cransac
// License: MIT

const blessed = require('neo-blessed');
const { Readable } = require('stream');
const { commit } = require('@acransac/streamer');

// # List Processing
// A list is practically a placeholder box without border, the empty list is a box without children or border.
//
// Note that blessed structures the screen in a tree of nodes like a DOM, and everything is a node. Boxes
// are elements (which are nodes) but the screen (a node) is not an element. It can't be created twice
// so that displays to render are always built on top of a placeholder box then attached to the screen.

/*
 * Make an atom
 * @param {string} content - The text to display in the atom
 * @return {Atom}
 */
function atom(content) {
  return blessed.Box({
    content: content,
    border: {type: "line"}
  });
}

/*
 * Copy an atom, possibly transforming it
 * @param {Atom} other - The atom to copy
 * @param {function} [transform: option => option] - The transformation to apply on the options (content, width, height, left, top, label or border)
 * @return {Atom}
 */
function atomFrom(other, transform) {
  if (!isAtom(other)) {
    throw "Cannot create an atom by copying a list"
  }

  transform = transform ? transform : option => option;

  return blessed.Box(Object.fromEntries(Object.entries({
    content: other.content,
    width: other.position.width,
    height: other.position.height,
    left: other.position.left,
    top: other.position.top,
    label: other.options.label,
    border: {type: "line"},
  }).map(transform)));
}

/*
 * Get the head (first element) of a list
 * @param {List} list - The list to retrieve the head from
 * @return {Display}
 */
function car(list) {
  if (isAtom(list)) {
    throw "Cannot take the car of an atom";
  }
  else if (isNull(list)) {
    throw "Cannot take the car of an empty list";
  }

  const firstDisplay = list.children[list.children.length - 1];

  if (isAtom(firstDisplay)) {
    return atomFrom(firstDisplay);
  }
  else {
    return listFrom(firstDisplay);
  }
}

/*
 * Get the tail of a list (the list without the first element)
 * @param {List} list - The list to retrieve the tail from
 * @return {List}
 */
function cdr(list) {
  if (isAtom(list)) {
    throw "Cannot take the cdr of an atom";
  }
  else if (isNull(list)) {
    throw "Cannot take the cdr of an empty list";
  }

  return [...list.children.slice(0, -1)].reduce((list, display) => cons(display, list), newEmptyListFrom(list));
}

/*
 * Prepend a display to a list
 * @param {Display} display - The display to prepend
 * @param {List} list - The list to prepend to
 * @return {List}
 */
function cons(display, list) {
  if (isAtom(list)) {
    throw "Cannot cons onto an atom";
  }

  const newList = listFrom(list);

  newList.append(display);

  return newList;
}

/*
 * Make an emptyList
 * @return {List}
 */
function emptyList() {
  return blessed.Box({width: "100%", height: "100%"});
}

/*
 * Check if a display is an atom or a list
 * @param {Display} display - The display to control
 * @return {boolean}
 */
function isAtom(display) {
  return display.border ? true : false;
}

/*
 * Check if a list is empty
 * @param {List} list - The list to control
 * @return {boolean}
 */
function isNull(list) {
  return !isAtom(list) && list.children.length === 0;
}

/*
 * Copy a list, possibly transforming it
 * @param {List} other - The list to copy
 * @param {function} [transform: option => option] - The transformation to apply on the options (width, height, left or top)
 * @return {List}
 */
function listFrom(other, transform) {
  if (isAtom(other)) {
    throw "Cannot create a list by copying an atom"
  }

  return other.children.reduce((list, display) => {
    list.append(isAtom(display) ? atomFrom(display) : listFrom(display));

    return list;
  }, newEmptyListFrom(other, transform));
}

function newEmptyListFrom(other, transform) {
  transform = transform ? transform : option => option;

  return blessed.Box(Object.fromEntries(Object.entries({
    width: other.position.width,
    height: other.position.height,
    left: other.position.left,
    top: other.position.top,
  }).map(transform)));
}

// # Rendering

/*
 * Initialize the rendering engine
 * @param {Stream.Writable} [output: process.stdout] - The target to render to
 * @return {function[]} - An array of two functions. The first renders a display passed as argument. The second terminates the rendering engine
 */
function renderer(output) {
  // NoInput prevents Blessed screen from catching keyboard input
  class NoInput extends Readable {
    constructor() {
      super();
    }

    read() {
      return null;
    }
  };

  const screen = blessed.screen({ smartCSR: true, input: new NoInput(), output: output ? output : process.stdout });

  screen.append(emptyList());

  const render = display => {
    screen.children[0].detach();

    screen.append(display);

    screen.render();
  };

  const close = () => screen.destroy();

  return [render, close];
}

// # Integration into the streamer framework

/*
 * Make a reactive display. See README
 * @param {Template} template - The template organizing the display
 * @param {...Component} reactiveComponents - The components parameterizing the display
 * @return {Composer}
 */
function compose(template, ...reactiveComponents) {
  const composer = (...predecessors) => selector => stream => {
    return selector(() => template(...reactiveComponents.map((component, index) => predecessors[index](component)
                                                                                     (stream)
                                                                                       (parameters => value => value))))
                     (composer(...reactiveComponents.map((component, index) => predecessors[index](component)(stream))));
  };

  return composer(...reactiveComponents.map(() => f => f()()));
}

/*
 * The returned function renders a reactive display. See README
 * @param {function} render - The render function obtained from calling {@link renderer}
 * @return {Process} - The returned renderer is a streamer process
 */
function show(render) {
  const first = f => g => f;

  const second = f => g => g;

  const shower = component => async (stream) => {
    render(component(first)(stream)());

    return commit(stream, shower(component(second)(stream)));
  };

  return shower;
}

module.exports = { atom, atomFrom, car, cdr, compose, cons, emptyList, isAtom, isNull, listFrom, renderer, show };
