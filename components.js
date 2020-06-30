const blessed = require('neo-blessed');
const { atomFrom, car, cdr, cons, isAtom, isNull, listFrom } = require('./terminal.js');

/*
 * Make an empty list with defined width
 * @param {number} width - The width in percentage of the underlier's width (screen or list)
 * @return {List}
 */
function column(width) {
  return blessed.Box({width: `${width}%`, height: "100%"});
}

/*
 * Indent horizontally a display
 * @param {number} offset - The offset from the left of the underlying screen or list, in percentage of the latter's width
 * @param {Display} display - The display to offset
 * @return {Display}
 */
function indent(offset, display) {
  if (isAtom(display)) {
    return atomFrom(display, option => option[0] === "left" ? ["left", `${offset}%`] : option);
  }
  else {
    return listFrom(display, option => option[0] === "left" ? ["left", `${offset}%`] : option);
  }
}

/*
 * Place a list of atoms of predefined widths in a row
 * @param {List<Atom>} lat - The list of atoms to inline. They should all have a set width, totalling 100% of the underlier's width
 * @return {Display}
 */
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

/*
 * Add a title to an atom
 * @param {Atom} atom - The atom to label
 * @param {string} title - The label
 * @return {Atom}
 */
function label(atom, title) {
  return atomFrom(atom, option => option[0] === "label" ? ["label", title] : option);
}

/*
 * Make an empty list with defined height
 * @param {number} height - The height in percentage of the underlier's height (screen or list)
 * @return {List}
 */
function row(height) {
  return blessed.Box({width: "100%", height: `${height}%`});
}

/*
 * Set an atom's height
 * @param {number} size - The height in percentage of the underlier's height (screen or list)
 * @param {Atom} atom - The atom to size
 * @return {Atom}
 */
function sizeHeight(size, atom) {
  return atomFrom(atom, option => option[0] === "height" ? ["height", `${size}%`] : option);
}

/*
 * Set an atom's width
 * @param {number} size - The width in percentage of the underlier's width (screen or list)
 * @param {Atom} atom - The atom to size
 * @return {Atom}
 */
function sizeWidth(size, atom) {
  return atomFrom(atom, option => option[0] === "width" ? ["width", `${size}%`] : option);
}

/*
 * Indent vertically a display
 * @param {number} offset - The offset from the top of the underlying screen or list, in percentage of the latter's height
 * @param {Display} display - The display to offset
 * @return {Display}
 */
function vindent(offset, display) {
  if (isAtom(display)) {
    return atomFrom(display, option => option[0] === "top" ? ["top", `${offset}%`] : option);
  }
  else {
    return listFrom(display, option => option[0] === "top" ? ["top", `${offset}%`] : option);
  }
}

function width(atom) {
  return Number(atom.position.width.match(/[0-9]+/)[0]);
}

module.exports = { column, indent, inline, label, row, sizeHeight, sizeWidth, vindent };
