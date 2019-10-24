const fs = require('fs');
const { Writable } = require('stream');
const { emptyList, renderer } = require('./terminal.js');
const Test = require('tester');

function defer(action) {
  return setImmediate(action);
}

function writeDisplayControl(display, testName) {
  const control = fs.createWriteStream(`./control_${testName.replace(/ /g, "")}`);

  control.on('open', fd => {
    renderer(control)(display());

    defer(() => fs.closeSync(fd));
  });
}

function showDisplay(display, testName) {
  console.log("\033[2J\033[HYou will see the display of " + testName);

  setTimeout(() => {
    renderer()(display());
		  
    setTimeout(() => {}, 2000);
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
 
    renderer(renderBuffer)(display());

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

function runReview(testableDisplays, commandLineArguments) {
  if (commandLineArguments.length === 2 || commandLineArguments[2] === "control") {
    Test.run(testableDisplays.map(testableDisplay => makeDisplayTest(...testableDisplay)));
  }
  else if (commandLineArguments[2] === "save") {
    testableDisplays.forEach(testableDisplay => writeDisplayControl(...testableDisplay));
  }
  else if (commandLineArguments[2] === "look") {
    testableDisplays.forEach(testableDisplay => showDisplay(...testableDisplay));
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
]);
