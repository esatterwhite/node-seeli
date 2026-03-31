/**
 * Seeli Entrypoint used for registering and managing commands
 * @module module:seeli/lib/seeli
 * @author Eric Satterwhite
 */
declare class Seeli extends Command {
  /**
   * Get configuration value
   * @param args Arguments to pass to config.get
   */
  static get(...args: any[]): any;

  /**
   * Set configuration value
   * @param args Arguments to pass to config.set
   */
  static set(...args: any[]): any;

  /**
   * Colorize text with a specific color
   * @param txt Text to colorize
   * @param color Color to use
   */
  static colorize(txt: string, color: string): string;

  /**
   * Get the Command class
   */
  static get Command(): typeof Command;

  /**
   * Get the Command class
   */
  get Command(): typeof Command;

  /**
   * Constructor for Seeli class
   * @param args Arguments to pass to the constructor
   */
  constructor(...args: any[]);

  /**
   * Colorize text with a specific color
   * @param txt Text to colorize
   * @param color Color to use
   */
  colorize(txt: string, color: string): string;

  /**
   * Get or set configuration values
   * @param args Arguments to pass to config
   */
  config(...args: any[]): any;

  /**
   * Run the Seeli application
   */
  run(): void;

  /**
   * Reset the Seeli instance
   */
  reset(): Seeli;

  /**
   * Load plugins
   * @param args Plugin arguments
   */
  plugin(...args: any[]): Seeli;
}

export = Seeli;

