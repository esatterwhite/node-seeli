import Command = require('./lib/command');
import Seeli = require('./lib/seeli');

declare const seeli: Seeli & {
  Seeli: typeof Seeli;
  Command: typeof Command;
  list: string[];
  [key: string]: unknown;
};

declare const commands: typeof seeli;
declare const list: string[];

export {
  commands,
  Seeli,
  Command,
  list
};

export default seeli;
