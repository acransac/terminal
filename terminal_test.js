const { renderer, cons, emptyList, atom } = require('./terminal.js');
const { inline, sizeWidth, row } = require('./components.js');

display();

function display() {
  const render = renderer();

  const C = atom("C");

  render(inline(cons(sizeWidth(50, atom("A")), cons(sizeWidth(50, atom("B")), row(80)))));

  setTimeout(() => render(cons(C, emptyList())), 3000);
}
