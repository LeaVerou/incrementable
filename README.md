<header>

# Incrementable

Increment length values in textfields, like dev tools!

</header>

### 2022 Rewrite (v2)

* ESM
* Now preserves undo history!
* Now selects the token that is being (in|de)cremented to make what is happening obvious

### Usage

ESM-only:

```js
import Incrementable from "https://incrementable.verou.me/incrementable.mjs";

let editor = document.querySelector("textarea");
new Incrementable(editor);
```

`incrementable.js` is identical to `incrementable.mjs` with the only difference that it also creates a global, so you can also use it like this:

```html
<script type="module" src="https://incrementable.verou.me/incrementable.js"></script>
<script>
let editor = document.querySelector("textarea");
new Incrementable(editor);
</script>
```

This is useful for older scripts that check if Incrementable is available by checking if it's present on `window`.