const { column, indent, row, sizeHeight, sizeWidth, vindent } = require('./components.js');
const fs = require('fs');
const { Writable } = require('stream');
const { atom, cons, emptyList, renderer } = require('./terminal.js');
const Test = require('tester');

function defer(action) {
  return setImmediate(action);
}

function writeDisplayControl(display, testName, continuation) {
  const control = fs.createWriteStream(`./control_${testName.replace(/ /g, "")}`);

  control.on('open', fd => {
    const [render, close] = renderer(control);

    render(display());

    close();

    defer(() => {
      fs.closeSync(fd);

      continuation();
    });
  });
}

function showDisplay(display, testName, continuation) {
  console.log("\033[2J\033[HYou will see the display of " + testName);

  setTimeout(() => {
    const [render, close] = renderer();

    render(display());
		  
    setTimeout(() => {
      close();
	    
      continuation();
    }, 2000);
  }, 2000);
}

function verifyDisplay(display, testName) {
  const verifier = (finish, check) => {
    class RenderBuffer extends Writable {
      constructor() {
        super();

        this.content = "";
      }

      write(chunk) {
        this.content = this.content + chunk;
      }
    };

    const renderBuffer = new RenderBuffer();
 
    const [render, close] = renderer(renderBuffer);

    render(display());

    close();

    defer(() => {
      let control = "";
      fs.createReadStream(`./control_${testName.replace(/ /g, "")}`, {encoding: "utf8"})
        .on('data', chunk => control = control + chunk)
	.on('end', () => finish(check(control === renderBuffer.content)));
    });
  };

  return verifier;
}

function makeDisplayTest(display, testName) {
  return Test.makeTest(verifyDisplay(display, testName), testName);
}

function makeTestableDisplay(display, testName) {
  return [display, testName];
}

function sequenceReview(review) {
  const sequencer = testableDisplays => {
    if (testableDisplays.length === 1) {
      review(...testableDisplays[0], () => {});
    }
    else {
      review(...testableDisplays[0], () => sequencer(testableDisplays.slice(1)));
    }
  };

  return sequencer;
}

function runReview(testableDisplays, commandLineArguments) {
  if (commandLineArguments.length === 2 || commandLineArguments[2] === "control") {
    Test.runInSequence(testableDisplays.map(testableDisplay => makeDisplayTest(...testableDisplay)));
  }
  else if (commandLineArguments[2] === "save") {
    sequenceReview(writeDisplayControl)(testableDisplays);
  }
  else if (commandLineArguments[2] === "look") {
    sequenceReview(showDisplay)(testableDisplays);
  }
  else {
    console.log("Help:");
    console.log("no option or \"control\": run tests and check against saved control displays");
    console.log("\"save\": write rendered displays to control files");
    console.log("\"look\": take a look at the rendered displays");

    return;
  }
}

function reviewDisplays(testableDisplays) {
  return runReview(testableDisplays, process.argv);
}
	
reviewDisplays([
  makeTestableDisplay(emptyList, "Empty List"),
  makeTestableDisplay(atom, "Atom"),
  makeTestableDisplay(() => cons(atom(), emptyList()), "List Of One Atom"),
  makeTestableDisplay(() => sizeWidth(50, atom()), "Atom With Width"),
  makeTestableDisplay(() => sizeHeight(50, atom()), "Atom With Height"),
  makeTestableDisplay(() => indent(50, sizeWidth(50, atom())), "Atom With Horizontal Indent"),
  makeTestableDisplay(() => vindent(50, sizeHeight(50, atom())), "Atom With Vertical Indent"),
  makeTestableDisplay(() => {
    return cons(sizeWidth(50, atom()), cons(indent(50, sizeWidth(50, atom())), emptyList()));
  }, "List Of Two Atoms"),
  makeTestableDisplay(() => cons(emptyList(), emptyList()), "Nested Empty List"),
  makeTestableDisplay(() => {
    return cons(cons(sizeWidth(50, atom()), cons(indent(50, sizeWidth(50, atom())), emptyList())), emptyList());
  }, "Nested List Of Two Atoms"),
  makeTestableDisplay(() => cons(atom(), row(50)), "Row Of One Atom"),
  makeTestableDisplay(() => cons(atom(), column(50)), "Column Of One Atom"),
  makeTestableDisplay(() => cons(atom(), vindent(30, row(40))), "Row Of One Atom With Vertical Indent"),
  makeTestableDisplay(() => cons(atom(), indent(30, column(40))), "Column Of One Atom With Horizontal Indent"),
]);