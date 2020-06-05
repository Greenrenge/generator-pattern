const createFanIn = (...asyncGenerator) => {
  const valuePool = []
  const generatorPool = []
  const pool = new Set()

  const addSource = async function (iterator) {
    const promise = iterator.next()
    pool.add(promise)
    promise.then(({ value, done }) => {
      valuePool.push(value)
      generatorPool.push(iterator)
      pool.delete(promise)
    })
  }

  return {
    fanInGenerator: async function* () {
      asyncGenerator.forEach((a) => addSource(a()))
      while (true) {
        await Promise.race([...pool])
        yield valuePool.shift()
        addSource(generatorPool.shift())
      }
    },
  }
}

module.exports = {
  createFanIn,
}
