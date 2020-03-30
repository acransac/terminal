const fs = require('fs');
const { Writable } = require('stream');
const { renderer } = require('./terminal.js');
const Test = require('tester');

function defer(action) {
  return setImmediate(action);
}

function writeDisplayControl(produceDisplay, testName, continuation) {
  const control = fs.createWriteStream(`./control_${testName.replace(/ /g, "")}`);

  control.on('open', fd => {
    const [render, close] = renderer(control);

    produceDisplay(render, () => {
      close();

      defer(() => {
        fs.closeSync(fd);

        continuation();
      });
    });
  });
}

function showDisplay(produceDisplay, testName, continuation) {
  console.log("\033[2J\033[HYou will see the display of " + testName);

  setTimeout(() => {
    const [render, close] = renderer();

    produceDisplay(render, () => {
      setTimeout(() => {
        close();
              
        continuation();
      }, 2000);
    });
  }, 2000);
}

function verifyDisplay(produceDisplay, testName) {
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

    produceDisplay(render, () => {
      close();

      defer(() => {
        let control = "";
        fs.createReadStream(`./control_${testName.replace(/ /g, "")}`, {encoding: "utf8"})
          .on('data', chunk => control = control + chunk)
          .on('end', () => finish(check(control === renderBuffer.content)));
      });
    });
  };

  return verifier;
}

function makeDisplayTest(produceDisplay, testName) {
  return Test.makeTest(verifyDisplay(produceDisplay, testName), testName);
}

function makeTestableInertDisplay(display, testName) {
  return [
    (render, finish) => {
      render(display());
	    
      finish();
    },
    testName
  ];
}

function makeTestableReactiveDisplay(produceDisplay, testName) {
  return [produceDisplay, testName];
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

module.exports = {
  makeTestableInertDisplay: makeTestableInertDisplay,
  makeTestableReactiveDisplay: makeTestableReactiveDisplay,
  reviewDisplays: reviewDisplays
};
