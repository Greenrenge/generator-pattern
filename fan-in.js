const createFanIn = (...asyncGenerator) => {
  const valuePool = []
  const generatorPool = []
  const pool = new Set()

  const addSource = async function(iterator) {
    const promise = iterator.next()
    promise
      .then(({ value, done }) => {
        // TODO: handle error and done is true
        valuePool.push(value)
        if (!done) generatorPool.push(iterator)
        pool.delete(promise)
        return done
      })
      .catch(() => {
        return true
      })
    pool.add(promise)
  }

  return {
    async *fanInGenerator() {
      asyncGenerator.forEach(a => addSource(a))
      while (true) {
        const isDone = await Promise.race([...pool])
        yield valuePool.shift()
        if (!isDone) addSource(generatorPool.shift())
      }
    },
  }
}

module.exports = {
  createFanIn,
}
