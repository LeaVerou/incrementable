import Incrementable from "./incrementable.mjs";

if (typeof globalThis !== "undefined") {
	globalThis.Incrementable = Incrementable;
}

export default Incrementable;