class Event {
  constructor(client, info) {
    Object.defineProperty(this, 'client', { value: client })
    this.info = info
  }

  async execute(...args) {
    try {
      console.info(`[EVENT] ${this.info.name} event executed`)
      await this.run(...args)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = Event
