const blessed = require('neo-blessed');
const { isNull, isAtom, cons, car, cdr, atomFrom, listFrom } = require('./terminal.js');

function row(height) {
  return blessed.Box({width: "100%", height: `${height}%`});
}

function indent(offset, atom) {
  return atomFrom(atom, option => option[0] === "left" ? ["left", `${offset}%`] : option);
}

function vindent(offset, display) {
  if (isAtom(display)) {
    return atomFrom(display, option => option[0] === "top" ? ["top", `${offset}%`] : option);
  }
  else {
    return listFrom(display, option => option[0] === "top" ? ["top", `${offset}%`] : option);
  }
}

function sizeWidth(size, atom) {
  return atomFrom(atom, option => option[0] === "width" ? ["width", `${size}%`] : option);
}

function sizeHeight(size, atom) {
  return atomFrom(atom, option => option[0] === "height" ? ["height", `${size}%`] : option);
}

function width(atom) {
  return Number(atom.position.width.match(/[0-9]+/)[0]);
}

function inline(lat) {
  return inlineImpl(lat, 0);
}

function inlineImpl(lat, offset) {
  if (isNull(lat)) {
    return listFrom(lat);
  }
  else {
    return cons(indent(offset, car(lat)), inlineImpl(cdr(lat), offset + width(car(lat))));
  }
}

module.exports = { row, indent, vindent, sizeWidth, sizeHeight, width, inline };
