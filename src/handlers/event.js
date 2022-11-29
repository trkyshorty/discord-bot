class Event {
  constructor(client, info) {
    Object.defineProperty(this, 'client', { value: client })
    this.info = info
    this.logger = client.logger
  }

  async execute(...args) {
    try {
      this.logger.info(`[EVENT] Execute ${this.info.name}`)
      await this.run(...args)
    } catch (err) {
      this.logger.error(err)
    }
  }
}

module.exports = Event
