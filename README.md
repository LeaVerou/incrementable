<header>

# Incrementable

Increment length values in textfields, like dev tools!

</header>

### 2022 Rewrite

* ESM
* Now preserves undo history!
* Now selects the token that is being (in|de)cremented to make what is happening obvious

### Usage

```js
import Incrementable from "https://incrementable.verou.me/incrementable.js";

let editor = document.querySelector("textarea");
new Incrementable(editor);
```