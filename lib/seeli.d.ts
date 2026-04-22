import Command = require('./command')

/**
 * Seeli Entrypoint used for registering and managing commands
 * @module module:seeli/lib/seeli
 * @author Eric Satterwhite
 */
declare class Seeli extends Command {
  static get(...args: any[]): any;
  static set(...args: any[]): any;
  static colorize(txt: string, color: string): string;
  static get Command(): typeof Command;
  get Command(): typeof Command;
  constructor(...args: any[]);
  colorize(txt: string, color: string): string;
  config(...args: any[]): any;
  run(...args: any[]): Promise<any> | undefined;
  reset(): Seeli;
  plugin(...args: any[]): Seeli;
}

export = Seeli
