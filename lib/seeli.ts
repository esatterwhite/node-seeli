
import { default as chalk } from 'chalk';
import toArray from 'mout/lang/toArray.js';
import kindOf from 'mout/lang/kindOf.js';
import Command from './command/index.js';
import config from './conf.js';
import colorize from './colorize.js';
import { PluginException } from './exceptions.js';

export class Seeli extends Command {
  static get(...args: any[]) { return config.get(...args); }
  static set(...args: any[]) { return config.set(...args); }
  static colorize(txt: string, color: string) { return colorize(txt, color); }
  static get Command() { return Command; }
  get Command() { return Command; }

  constructor(options?: any) {
    super({
      color: 'green',
      name: 'seeli',
      plugins: toArray(config.get('plugins')),
      flags: {
        help: { type: Boolean, shorthand: 'h' },
        traceback: { type: Boolean },
      },
      ...options
    });
    this.plugin();
  }

  colorize(txt: string, color: string): string { return colorize(txt, color); }
  config(...args: any[]) {
    const [key] = args;
    if (args.length > 1) return config.set(...args);
    if (typeof key === 'object') return config.set(key);
    return config.get(...args);
  }

  async run(): Promise<any> {
    const parsed = this.argv;
    let cmd = parsed.argv.remain.shift();
    const help = !!parsed.help;
    if (help || cmd === 'help' || cmd === null || cmd === undefined) {
      if (!this.has('help')) {
        console.error('unknown command %s', cmd);
        process.exitCode = 1;
        return;
      }
      cmd = (cmd === 'help' || cmd === null || cmd === undefined) ? parsed.argv.remain.shift() : cmd;
      return this.get('help').run(cmd).then(onComplete.bind(this)).catch(onError.bind(this));
    }
    if (this.has(cmd)) {
      return this.get(cmd).run(parsed.argv.remain.length ? parsed.argv.remain[0] : null).then(onComplete.bind(this)).catch(onError.bind(this));
    }
    console.error('unknown command %s', cmd);
    process.exitCode = 1;
  }

  reset(): this {
    super.reset();
    for (const key of this.names) { this.unregister(key); }
    this.clear();
    return this;
  }

  plugin(...args: any[]): this {
    const plugins = args.length ? args : (this.options.plugins as any[]);
    for (const path of plugins) {
      const type = kindOf(path).toLowerCase();
      let plugin: any = null;
      if (type === 'string') {
        plugin = path;
      } else if (type === 'function') {
        plugin = path;
      } else {
        throw new PluginException(`Invalid plugin. Got ${type}`);
      }
      if (typeof plugin === 'function') plugin.call(null, this);
    }
    return this;
  }
}

export default Seeli;

function onError(err: any) {
  console.error(`${chalk.red(err.name)}: ${err.message}`);
  process.exitCode = err.code || 1;
}

function onComplete(content: any) {
  if (typeof content === 'string') console.log(content);
}
