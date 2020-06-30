const fs = require('fs');
const { Writable } = require('stream');
const { renderer } = require('./terminal.js');
const Test = require('tester');

// # Test Runners
class RenderBuffer extends Writable {
  constructor() {
    super();

    this.content = "";
  }

  write(chunk) {
    this.content = this.content + chunk;
  }
};

function defer(action) {
  return setImmediate(action);
}

function showDisplay(produceDisplay, testName, init, continuation) {
  console.log("\033[2J\033[HYou will see the display of " + testName);

  setTimeout(() => {
    return init(process.stdout, (...restAndClose) => {
      return produceDisplay(...restAndClose.slice(0, -1), () => {
        setTimeout(() => {
          restAndClose[restAndClose.length - 1]();
        }, 2000);
      });
    }, continuation);
  }, 2000);
}

function verifyDisplay(produceDisplay, testName, init) {
  return (finish, check) => {
    const renderBuffer = new RenderBuffer();

    return init(renderBuffer, (...restAndClose) => {
      return produceDisplay(...restAndClose.slice(0, -1), () => {
        restAndClose[restAndClose.length - 1]();

        defer(() => {
          return check(fs.readFileSync(`./control_${testName.replace(/ /g, "")}`, {encoding: "utf8"}) === renderBuffer.content);
        });
      });
    }, finish);
  };
}

function writeDisplayControl(produceDisplay, testName, init, continuation) {
  const control = new RenderBuffer();

  return init(control, (...restAndClose) => {
    return produceDisplay(...restAndClose.slice(0, -1), () => {
      restAndClose[restAndClose.length - 1]();

      defer(() => {
        fs.writeFileSync(`./control_${testName.replace(/ /g, "")}`, control.content, {encoding: "utf8"});
      });
    });
  }, continuation);
}

// # Test Makers
function makeDisplayTest(produceDisplay, testName, init) {
  return Test.makeTest(verifyDisplay(produceDisplay, testName, init), testName);
}

function makeInit() {
  return (displayTarget, test, continuation) => {
    const [render, terminate] = renderer(displayTarget);

    return test(render, () => {
      terminate();

      return continuation();
    });
  };
}

/*
 * Make an inert display test
 * @param {function} display - A function returning the display test
 * @param {string} testName - The name of the test, used in logs
 * @return {TestableDisplay}
 */
function makeTestableInertDisplay(display, testName) {
  return [
    (render, finish) => {
      render(display());

      finish();
    },
    testName,
    makeInit()
  ];
}

/*
 * Make a reactive display test. See README
 * @param {function} produceDisplay - The display test
 * @param {string} testName - The name of the test, used in logs
 * @param {function} [init] - The setup of the test
 * @return {TestableDisplay}
 */
function makeTestableReactiveDisplay(produceDisplay, testName, init) {
  return [
    produceDisplay,
    testName,
    init ? init : makeInit()
  ];
}

// # Setup

/*
 * Make a test run
 * @param {TestableDisplay[]} testableDisplays - An array of testable displays to control
 * @param {string} [testSuiteName: Test Suite] - The name of the test suite, used in logs
 */
function reviewDisplays(testableDisplays, testSuiteName) {
  return runReview(testableDisplays, process.argv, testSuiteName);
}

function runReview(testableDisplays, commandLineArguments, testSuiteName) {
  if (commandLineArguments.length === 2 || commandLineArguments[2] === "control") {
    return Test.runInSequence(testableDisplays.map(testableDisplay => makeDisplayTest(...testableDisplay)), testSuiteName);
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

module.exports = {
  makeTestableInertDisplay: makeTestableInertDisplay,
  makeTestableReactiveDisplay: makeTestableReactiveDisplay,
  reviewDisplays: reviewDisplays
};
