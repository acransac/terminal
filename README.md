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
The rendering engine is initialized with `renderer`. The latter returns function handles to render a display and terminate the engine. An atomic display is created with `atom` and passed to the render handle. Then, the engine is terminated:
* `renderer:: Maybe<Stream.Writable> -> (Display -> IO (), () -> IO ())`
  | Parameter / Returned | Type                            | Description             |
  |----------------------|---------------------------------|-------------------------|
  | output               | Maybe\<Stream.Writable>         | A writable Node.js stream to which the displayed characters and escape sequences are written. Default: `process.stdout` |
  | _returned_           | (Display -> IO (), () -> IO ()) | An array of two functions. The first renders on the output the display passed as argument. The second tears down the rendering system |
* `atom:: String -> Display`
  | Parameter | Type   | Description                           |
  |-----------|--------|---------------------------------------|
  | content   | String | The text to print within the atom box |

Example:

```javascript
    const { atom, renderer } = require('@acransac/terminal');

    const [render, terminate] = renderer();

    render(atom("abc"));

    setTimeout(terminate, 2000);
```

```shell
    $ node example.js
```
(SCREENSHOT)

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
(SCREENSHOT)

Note: The last example display looks the same as the previous one, except that it is a list and not an atom.

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
(SCREENSHOT)

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
(SCREENSHOT)

## Size And Position Displays
`sizeWidth` and `sizeHeight` are used to size atoms. `indent` and `vindent` position displays. They allow to make list displays with several atoms or lists visible:
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
(SCREENSHOT)

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
(SCREENSHOT)

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
(SCREENSHOT)
