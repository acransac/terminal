// Copyright (c) Adrien Cransac
// License: MIT

const { column, indent, inline, label, row, sizeHeight, sizeWidth, vindent } = require('../src/components.js');
const { continuation, forget, later, now, Source, StreamerTest, value } = require('@acransac/streamer');
const { atom, compose, cons, emptyList, show } = require('../src/terminal.js');
const Test = require('../src/testutils.js');

function test_reactiveDisplay(render, finish) {
  const again = async (stream) => {
    if (value(now(stream)) === "end") {
      return finish();
    }
    else {
      return again(await continuation(now(stream))(forget(await later(stream))));
    }
  };

  const showNumbers = maybeShow => noParameters => predecessor => stream => {
    if (value(now(stream)).hasOwnProperty("number") && maybeShow(value(now(stream)).number)) {
      const previousNumbers = predecessor ? predecessor : "";

      return f => f(noParameters)(`${previousNumbers}${value(now(stream)).number}\n`);
    }
    else {
      return predecessor ? f => f(noParameters)(predecessor) : f => f(noParameters)("");
    }
  };

  const template = (oddNumbers, evenNumbers) => {
    return inline(cons(
                    sizeWidth(50, atom(`Odd:\n${oddNumbers}`)),
                    cons(
                      sizeWidth(50, atom(`Even:\n${evenNumbers}`)),
                      emptyList())));
  };

  Source.from(StreamerTest.emitSequence([{number: 1},
                                         {number: 2},
                                         {number: 3},
                                         {number: 4},
                                         {number: 5},
                                         {number: 6},
                                         {number: 7},
                                         {number: 8},
                                         "end"
                                        ]), "onevent")
        .withDownstream(async (stream) => {
    return again(
      await show(render)(
        compose(template, showNumbers(n => n % 2 === 1), showNumbers(n => n % 2 === 0)))(stream));
  });
}

Test.reviewDisplays([
  Test.makeTestableInertDisplay(emptyList, "Empty List"),
  Test.makeTestableInertDisplay(atom, "Atom"),
  Test.makeTestableInertDisplay(() => label(atom(), "Label"), "Atom With Label"),
  Test.makeTestableInertDisplay(() => cons(atom(), emptyList()), "List Of One Atom"),
  Test.makeTestableInertDisplay(() => sizeWidth(50, atom()), "Atom With Width"),
  Test.makeTestableInertDisplay(() => sizeHeight(50, atom()), "Atom With Height"),
  Test.makeTestableInertDisplay(() => indent(50, sizeWidth(50, atom())), "Atom With Horizontal Indent"),
  Test.makeTestableInertDisplay(() => vindent(50, sizeHeight(50, atom())), "Atom With Vertical Indent"),
  Test.makeTestableInertDisplay(() => {
    return cons(sizeWidth(50, atom()), cons(indent(50, sizeWidth(50, atom())), emptyList()));
  }, "List Of Two Atoms"),
  Test.makeTestableInertDisplay(() => cons(emptyList(), emptyList()), "Nested Empty List"),
  Test.makeTestableInertDisplay(() => {
    return cons(cons(sizeWidth(50, atom()), cons(indent(50, sizeWidth(50, atom())), emptyList())), emptyList());
  }, "Nested List Of Two Atoms"),
  Test.makeTestableInertDisplay(() => cons(atom(), row(50)), "Row Of One Atom"),
  Test.makeTestableInertDisplay(() => cons(atom(), column(50)), "Column Of One Atom"),
  Test.makeTestableInertDisplay(() => cons(atom(), vindent(30, row(40))), "Row Of One Atom With Vertical Indent"),
  Test.makeTestableInertDisplay(() => cons(atom(), indent(30, column(40))), "Column Of One Atom With Horizontal Indent"),
  Test.makeTestableInertDisplay(() => {
    return inline(cons(
                    sizeWidth(20, atom()),
                    cons(
                      sizeWidth(30, atom()),
                      cons(
                        sizeWidth(50, atom()),
                        emptyList()))));
  }, "List of Three Atoms Inlined"),
  Test.makeTestableReactiveDisplay(test_reactiveDisplay, "Reactive Display"),
]);
