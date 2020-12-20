class Event {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client });
    this.logger = this.client.logger;
    this.name = null;
  }

  /**
   * Last run before event are executed
   *
   * @param {...any} args
   */
  async execute(...args) {
    this.client.logger.verbose(`Ran Event: ${this.name}`);
    this.run(...args);
  }
}

module.exports = Event;
