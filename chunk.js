const Promise = require("bluebird")

const getChuck = size =>
  async function*(iterator) {
    while (true) {
      let i = 0
      const promises = []
      while (i < size) {
        promises.push(iterator.next())
        i++
      }
      const values = await Promise.allSettled(promises)
      const valid = values
        .filter(v => v.isFulfilled())
        .map(v => v.value().value)
        .filter(v => !!v)
      yield valid
      if (valid.length !== size) break
    }
  }

module.exports = {
  getChuck,
}
