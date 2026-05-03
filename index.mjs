import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const seeli = require("./index.js");

const { Seeli, Command } = seeli;
const commands = seeli;
const list = seeli.list;

export { commands, Seeli, Command, list };

export default seeli;
