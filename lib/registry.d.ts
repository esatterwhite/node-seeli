/**
 * Command registry for seeli
 * @module index.js
 * @author Eric Satterwhite
 * @since 9.0.0
 */
declare class Registry extends Map<any, any> {
  /**
   * Constructor for Registry class
   */
  constructor();

  /**
   * Resolve a command from a shallow key lookup
   * @param key The key to resolve
   * @returns The resolved command or undefined
   */
  resolveShallow(key: any): any;

  /**
   * Resolve a command from a full key lookup
   * @param key The key to resolve
   * @returns The resolved command or undefined
   */
  resolve(key: any): any;

  /**
   * Register a command
   * @param name The name of the command
   * @param cmd The command to register
   */
  register(name: string, cmd: any): void;

  /**
   * Unregister a command
   * @param name The name of the command to unregister
   * @returns The registry instance
   */
  unregister(name: string): Registry;

  /**
   * Get a list of all registered commands
   * @returns Array of command names
   */
  list(): string[];

  /**
   * Clear all registered commands
   * @returns The registry instance
   */
  clear(): Registry;

  /**
   * Get the set of all command names
   */
  get names(): Set<any>;
}

export = Registry;

