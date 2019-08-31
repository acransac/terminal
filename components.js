const blessed = require('neo-blessed');
const { isNull, cons, car, cdr, atomFrom, listFrom } = require('./terminal.js');

function row(height) {
  return blessed.Box({width: "100%", height: `${height}%`});
}

function indent(atom, offset) {
  return atomFrom(atom, option => option[0] === "left" ? ["left", `${offset}%`] : option);
}

function vindent(offset, atom) {
  return atomFrom(atom, option => option[0] === "top" ? ["top", `${offset}%`] : option);
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
    return cons(indent(car(lat), offset), inlineImpl(cdr(lat), offset + width(car(lat))));
  }
}

module.exports = { row, indent, vindent, sizeWidth, sizeHeight, width, inline };
