/**
 * Base command class for creating interactive cli programs
 * @module module:seeli/lib/command
 * @author Eric Satterwhite
 */
declare class Command extends Map<any, any> {
  /**
   * Constructs and returns the final command usage
   */
  get usage(): string;

  /**
   * The description of the command
   */
  get description(): string;

  /**
   * The final parsed out command line input as key/value pairs
   */
  get argv(): any;

  /**
   * Constructs and returns an object of flags and their types for consumption by the command
   */
  get conf(): any;

  /**
   * Maps and returns any shorthand switches to their parent flags for consumption by the command
   */
  get shorthands(): any;

  /**
   * Merges passing in object as configuration overrides
   * @param options Configuration overrides to set
   */
  setOptions(...opts: any[]): Command;

  /**
   * Dispatches an event for each flag that has the event flag enabled
   */
  dispatch(): Command;

  /**
   * Method used to setup and execute the commands interactive mode
   * @param cmd Optional argument for your command specific usage
   * @param callback An optional callback to be executed when the command is complete.
   */
  interactive(cmd?: any): Promise<any>;

  /**
   * Resets the internal command cache to its internal state
   * @chainable
   * @return Command
   */
  reset(): Command;

  /**
   * Executes the command as defined
   * @param cmd Optional argument for your command specific usage
   * @param callback An optional callback to be executed when the command is complete.
   * Will be passed the contents return by the command
   * @return String|undefined Will return the result from the command specific run directive if there is any.
   */
  run(cmd?: any, depth?: number): Promise<any>;

  /**
   * Validates the current data set before running the command
   * @param command The name of the command being executed
   */
  validate(command?: string): void;

  /**
   * Pass through function to inquirer for prompting input at the terminal
   * @param options Inquirer prompt options
   * @returns Promise object representing the end user input from the question
   */
  prompt(options: any): Promise<any>;

  /**
   * Colorizes a text blob
   * @param color The color to use. can be one of `red`, `blue`,`green`, `yellow`,`bold`, `grey`, `dim`, `black`, `magenta`, `cyan`
   * @param text text to colorize
   * @returns colorized version of the text
   */
  colorize(color: string, text: string): string;

  /**
   * Registers a new sub command
   * @param command The command to register
   */
  use(command: Command): Command;

  /**
   * Convert all registered flags to inquierer compatible prompt objects
   * @returns array of inquirer prompt objects
   */
  toPrompt(): any[];

  /**
   * Get all available flags for this command
   */
  get flags(): string[];

  /**
   * Get the command tree structure
   */
  get tree(): any;

  /**
   * Run a command directly
   * @param args Arguments to pass to the command
   */
  static run(...args: any[]): Promise<any>;

  /**
   * Constructor for Command class
   * @param options instance configuration
   */
  constructor(...options: any[]);
}

export = Command;

