const blessed = require('neo-blessed');
const { atomFrom, car, cdr, cons, isAtom, isNull, listFrom } = require('./terminal.js');

function row(height) {
  return blessed.Box({width: "100%", height: `${height}%`});
}

function column(width) {
  return blessed.Box({width: `${width}%`, height: "100%"});
}

function indent(offset, display) {
  if (isAtom(display)) {
    return atomFrom(display, option => option[0] === "left" ? ["left", `${offset}%`] : option);
  }
  else {
    return listFrom(display, option => option[0] === "left" ? ["left", `${offset}%`] : option);
  }
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
  const inlineImpl = (lat, offset) => {
    if (isAtom(lat) || (!isNull(lat) && !isAtom(car(lat)))) {
      throw "Cannot inline an atom or a list of non atomic elements";
    }

    if (isNull(lat)) {
      return listFrom(lat);
    }
    else {
      return cons(indent(offset, car(lat)), inlineImpl(cdr(lat), offset + width(car(lat))));
    }
  };

  return inlineImpl(lat, 0);
}

function label(atom, title) {
  if (!isAtom(atom)) {
    throw "Cannot label a list"
  }

  return blessed.Box(Object.fromEntries([...Object.entries(atom), ["label", title]]));
}

module.exports = { column, indent, inline, label, row, sizeHeight, sizeWidth, vindent };
