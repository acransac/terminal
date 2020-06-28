# Introduction
**terminal** provides a model to make terminal user interfaces. The user sees a _display_ which is either an _atom_ or a _list_ of displays. An atomic element of a display is a possibly labelled bordered box with textual content. Using streamer(LINK), a display can react to events generated by the user or the environment.

**terminal** benefits from the high-level modelling of terminal graphics as a tree introduced by Blessed(LINK). It also borrows its tools and terminology from the Lisp family of programming languages.

# How To Use Terminal
Add **terminal** to a project with:

```shell
    $ npm install @acransac/terminal
```

and import the needed functionalities:

```javascript
    const { atom, column, compose, cons, emptyList, indent, inline, label, renderer, row, show, sizeHeight, sizeWidth, TerminalTest, vindent } = require('@acransac/streamer');
```

## Make An Inert Atomic Display
The rendering engine is initialized with `renderer`. The latter returns functions to render a display and terminate the engine. An atomic display is created with `atom` and passed to the render function. Then, the engine is terminated. An atom's box can be labelled with `label`:
* `renderer:: Maybe<Stream.Writable> -> (Display -> IO (), () -> IO ())`
  | Parameter / Returned | Type                            | Description             |
  |----------------------|---------------------------------|-------------------------|
  | output               | Maybe\<Stream.Writable>         | A writable Node.js stream to which the displayed characters and escape sequences are written. Default: `process.stdout` |
  | _returned_           | (Display -> IO (), () -> IO ()) | An array of two functions. The first renders on the output the display passed as argument. The second tears down the rendering system |
* `atom:: String -> Display`
  | Parameter | Type   | Description                           |
  |-----------|--------|---------------------------------------|
  | content   | String | The text to print within the atom box |

* `label:: (Atom<Display>, String) -> Atom<Display>`
  | Parameter | Type           | Description       |
  |-----------|----------------|-------------------|
  | atom      | Atom\<Display> | The atom to label |
  | title     | String         | The label's text  |

Examples:
1.

```javascript
    const { atom, renderer } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(atom("abc"));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_1.png?raw=true)

2.

```javascript
    const { atom, label, renderer } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(label(atom("abc"), "example"));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_2.png?raw=true)

## Make An Inert List Display
As mentioned before, **terminal**'s tooling inherits the fundamental notions of the Lisp dialects. A display is a recursive structure expressed as nested lists of displays. It is built by `cons`'ing displays onto lists, ending such ramified chains with the `emptyList`. The latter can be dimensioned in height or in width with `row` or `column`:
* `cons:: (Display, List<Display>) -> List<Display>`
  | Parameter | Type           | Description                           |
  |-----------|----------------|---------------------------------------|
  | display   | Display        | The display, atom or list, to prepend |
  | list      | List\<Display> | The list of displays to prepend to    |

* `emptyList:: () -> List<Display>`
  | Returned  | Type           | Description                                                                                |
  |-----------|----------------|--------------------------------------------------------------------------------------------|
  | _returned_| List\<Display> | A list display printing nothing. The starting point to which useful displays are prepended |

* `row:: Number -> List<Display>`
  | Parameter | Type   | Description |
  |-----------|--------|-------------|
  | height    | Number | The empty list's height proportionally to the underlying list's height if any. Otherwise, it is proportional to the screen's height. Expressed in percentage |

* `column:: Number -> List<Display>`
  | Parameter | Type   | Description |
  |-----------|--------|-------------|
  | width     | Number | The empty list's width proportionally to the underlying list's width if any. Otherwise, it is proportional to the screen's width. Expressed in percentage |

Examples:
1.

```javascript
    const { atom, cons, emptyList, renderer } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(cons(atom("abc"), emptyList()));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_1.png?raw=true)

Note: The last example display looks the same as the first one, except that it is a list and not an atom.

2.

```javascript
    const { atom, cons, renderer, row } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(cons(atom("abc"), row(50)));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_3.png?raw=true)

3.

```javascript
    const { atom, column, cons, renderer } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(cons(atom("abc"), column(50)));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_4.png?raw=true)

## Size And Position Displays
`sizeWidth` and `sizeHeight` are used to size atoms. `indent` and `vindent` position displays. They allow to make list displays with several atoms or lists visible. Also, `inline` places a list of atoms in a row:
* `sizeWidth:: (Number, Atom<Display>) -> Atom<Display>`
  | Parameter | Type           | Description        |
  |-----------|----------------|--------------------|
  | size      | Number         | The atom's width proportionally to the underlying list's width if any. Otherwise, it is proportional to the screen's width. Expressed in percentage |
  | atom      | Atom\<Display> | The atom to resize |

* `sizeHeight:: (Number, Atom<Display>) -> Atom<Display>`
  | Parameter | Type           | Description        |
  |-----------|----------------|--------------------|
  | size      | Number         | The atom's height proportionally to the underlying list's height if any. Otherwise, it is proportional to the screen's height. Expressed in percentage |
  | atom      | Atom\<Display> | The atom to resize |

* `indent:: (Number, Display) -> Display`
  | Parameter | Type    | Description         |
  |-----------|---------|---------------------|
  | offset    | Number  | The display's offset from the underlying list's left edge if any. Otherwise, it is from the screen's left edge. Expressed in percentage of the underlier's width |
  | display   | Display | The display to move |

* `vindent:: (Number, Display) -> Display`
  | Parameter | Type    | Description         |
  |-----------|---------|---------------------|
  | offset    | Number  | The display's offset from the underlying list's top edge if any. Otherwise, it is from the screen's top edge. Expressed in percentage of the underlier's height |
  | display   | Display | The display to move |

* `inline:: List<Atom<Display>> -> Display`
  | Parameter | Type                  | Description |
  |-----------|-----------------------|-------------|
  | lat       | List\<Atom\<Display>> | A display that is a list of atoms with specified widths that are to be indented so that they show in a row |

Examples:
1.

```javascript
    const { atom, indent, renderer, sizeHeight, sizeWidth, vindent } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(vindent(25, indent(25, sizeHeight(50, sizeWidth(50, atom("abc"))))));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_5.png?raw=true)

2.

```javascript
    const { atom, cons, emptyList, indent, renderer, vindent } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(vindent(10, indent(10, cons(atom("abc"), emptyList()))));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_6.png?raw=true)

3.

```javascript
    const { atom, cons, emptyList, indent, renderer, sizeWidth } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(cons(sizeWidth(50, atom("abc")),
                cons(indent(50, sizeWidth(50, atom("def"))),
                     emptyList())));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_7.png?raw=true)

4.

```javascript
    const { atom, cons, emptyList, inline, renderer, sizeWidth } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(inline(cons(sizeWidth(50, atom("abc")),
                       cons(sizeWidth(50, atom("def")),
                            emptyList()))));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_7.png?raw=true)

## Make A Reactive Display
A reactive display changes as the user interacts with the application or network messages are received, for example. **terminal** uses the **streamer**(LINK) framework to listen to events and a reactive display is integrated into the process attached to the source. This integration is borne by `compose` which distributes the stream to a series of _components_ and injects their output into a _template_. `compose` is immediately chained with the function generated by passing the render function to `show` and that executes the rendering of the injected template:
* `Component:: Any... -> Any -> Stream -> ComposerHandle`
  | Parameter / Returned | Type                     | Description                                             |
  |----------------------|--------------------------|---------------------------------------------------------|
  | _parameters_         | Any...                   | The state of the component                              |
  | _predecessor_        | Any                      | The output of the component on the last event processed |
  | _returned_           | Stream -> ComposerHandle | The logic of the component which processes the stream and returns to `compose` a handle to the parameters and output of the form `f => f(updatedParameters)(output)`. Using this handle, `compose` can provide the parameters and predecessor to the component on the next event, and inject the ouput into the template |

* `Template:: Component... -> Display`
  | Parameter   | Type         | Description                                                                        |
  |-------------|--------------|------------------------------------------------------------------------------------|
  | _components_| Component... | A series of components whose output values are passed as arguments to the template |

* `compose:: (Template, Component...) -> Composer`
  | Parameter          | Type         | Description                                          |
  |--------------------|--------------|------------------------------------------------------|
  | template           | Template     | The template organizing the display                  |
  | reactiveComponents | Component... | A sequence of components parameterizing the template |

* `show:: Display -> IO () -> Composer -> Process`
  | Parameter | Type             | Description                                |
  |-----------|------------------|--------------------------------------------|
  | render    | Display -> IO () | The render function returned by `renderer` |

Example:

```javascript
    const { continuation, forget, later, now, Source, StreamerTest, value } = require('@acransac/streamer');
    const { atom, compose, renderer, show } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    const loop = async (stream) => {
      if (value(now(stream)) === "end") {
        return terminate();
      }
      else {
        return loop(await continuation(now(stream))(forget(await later(stream))));
      }
    };

    const template = component => atom(component);

    const component = noParameters => predecessor => stream => {
      const processed = predecessor ? predecessor : "";

      if (value(now(stream)) === "end") {
        return f => f(noParameters)(processed);
      }
      else {
        return f => f(noParameters)(`${processed}${value(now(stream))}`);
      }
    };

    Source.from(StreamerTest.emitSequence(["a", "b", "c", "end"], 1000), "onevent").withDownstream(async (stream) => {
      return loop(await show(render)(compose(template, component))(stream));
    });
```

```shell
    $ node example.js
```
![Alt text](doc/screen_capture_8.gif?raw=true)

## Test The Display
`TerminalTest.reviewDisplays` introduces testing a sequence of displays. A display test is created with `makeTestableInertDisplay` or `makeTestableReactiveDisplay`. When run, a script executing this review accepts one command line option: `look` shows the displays in turn so that they can be visually checked. `save` writes the characters and escape sequences of the displays to files so that they can be programmatically verified. `control` runs the actual test, comparing the generated displays to the control files and logging the successes and failures. It is the default option:
* `TerminalTest.reviewDisplays:: ([TestableDisplay], Maybe<String>) -> IO ()`
  | Parameter        | Type              | Description                                                          |
  |------------------|-------------------|----------------------------------------------------------------------|
  | testableDisplays | [TestableDisplay] | An array of testable displays, whether inert or reactive             |
  | testSuiteName    | Maybe\<String>    | The name of the test suite that appears in logs. Default: Test Suite |

* `TerminalTest.makeTestableInertDisplay:: (() -> Display, String) -> TestableDisplay`
  | Parameter | Type          | Description                         |
  |-----------|---------------|-------------------------------------|
  | display   | () -> Display | A deferred inert display            |
  | testName  | String  | The name of the test that appears in logs |

* `TerminalTest.makeTestableReactiveDisplay:: (ReactiveDisplayTest, String, Maybe<TestInitializer>) -> TestableDisplay`
  | Parameter      | Type                    | Description                                                         |
  |----------------|-------------------------|---------------------------------------------------------------------|
  | produceDisplay | ReactiveDisplayTest     | The test function displaying what is to be checked. Its signature depends on the setup done by the initializer. By default, it should provide a placeholder for the render function as first argument, and then a placeholder for the continuation of the test suite. The test runner provides the actual functions when executing |
  | testName       | String                  | The name of the test that appears in logs                           |
  | init           | Maybe\<TestInitializer> | Logic to execute before running the test. Default: calls `renderer` |

* `TestInitializer:: (Stream.Writable, ReactiveDisplayTest, () -> IO ()) -> IO ()`
  | Parameter     | Type                   | Description                                                               |
  |---------------|------------------------|---------------------------------------------------------------------------|
  | displayTarget | Stream.Writable        | A reference to the target for writing the characters and escape sequences of the display. It could be a file or the standard output depending on the mode of the test runner |
  | test          | ReactiveDisplayTest    | A reference to the test function to call once the initialization is done  |
  | finish        | () -> IO ()            | A reference to the continuation of the test to call once the test is done |

Examples:
1.

```javascript
    const { continuation, forget, later, now, Source, StreamerTest, value } = require('@acransac/streamer');
    const { atom, compose, show, TerminalTest } = require('@acransac/terminal');

    function reactiveDisplayTest(render, finish) {
      const loop = async (stream) => {
        if (value(now(stream)) === "end") {
          return finish();
        }
        else {
          return loop(await continuation(now(stream))(forget(await later(stream))));
        }
      };

      const template = component => atom(component);

      const component = noParameters => predecessor => stream => {
        const processed = predecessor ? predecessor : "";

        if (value(now(stream)) === "end") {
          return f => f(noParameters)(processed);
        }
        else {
          return f => f(noParameters)(`${processed}${value(now(stream))}`);
        }
      };

      Source.from(StreamerTest.emitSequence(["a", "b", "c", "end"], 1000), "onevent").withDownstream(async (stream) => {
        return loop(await show(render)(compose(template, component))(stream));
      });
    }

    TerminalTest.reviewDisplays([
      TerminalTest.makeTestableInertDisplay(() => atom("abc"), "Inert Display"),
      TerminalTest.makeTestableReactiveDisplay(reactiveDisplayTest, "Reactive Display")
    ], "Example Tests");
```

```shell
    $ node example.js look
```
![Alt text](doc/screen_capture_9.gif?raw=true)

```shell
    $ node example.js save
    $ node example.js control
    --------------------
    Example Tests:

        2 / 2 test(s) passed
    --------------------
```

2.

```javascript
    const { continuation, forget, later, now, Source, StreamerTest, value } = require('@acransac/streamer');
    const { atom, compose, renderer, show, TerminalTest } = require('@acransac/terminal');

    function reactiveDisplayTest(render, finish) {
      const loop = async (stream) => {
        if (value(now(stream)) === "end") {
          return finish();
        }
        else {
          return loop(await continuation(now(stream))(forget(await later(stream))));
        }
      };

      const template = component => atom(component);

      const component = noParameters => predecessor => stream => {
        const processed = predecessor ? predecessor : "";

        if (value(now(stream)) === "end") {
          return f => f(noParameters)(processed);
        }
        else {
          return f => f(noParameters)(`${processed}${value(now(stream))}`);
        }
      };

      return async (stream) => loop(await show(render)(compose(template, component))(stream));
    }

    function testInitializer(displayTarget, test, finish) {
      const [render, terminate] = renderer(displayTarget);

      const conclude = () => {
        terminate();

        return finish();
      }

      Source.from(StreamerTest.emitSequence(["a", "b", "c", "end"], 1000), "onevent")
                              .withDownstream(async (stream) => test(render, conclude)(stream));
    }

    TerminalTest.reviewDisplays([
      TerminalTest.makeTestableReactiveDisplay(reactiveDisplayTest, "Reactive Display With Initializer", testInitializer)
    ], "Example Tests");
```

```shell
    $ node example.js look
```
(GIF)

```shell
    $ node example.js save
    $ node example.js control
    --------------------
    Example Tests:

        1 / 1 test(s) passed
    --------------------
```
