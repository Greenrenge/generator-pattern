const createFanIn = (...asyncIterators) => {
  const valuePool = []
  const generatorPool = []
  const pool = new Set()
  let totalLive = asyncIterators.length

  const addSource = async function(iterator) {
    const promise = iterator.next()
    pool.add(promise)
    promise
      .then(({ value, done }) => {
        valuePool.push(value)
        if (!done) generatorPool.push(iterator)
        pool.delete(promise)
      })
      .catch(() => {
        pool.delete(promise)
      })
  }

  return {
    async *fanInGenerator() {
      asyncIterators.forEach(a => addSource(a))
      while (true) {
        try {
          await Promise.race([...pool])
          yield valuePool.shift()
          await addSource(generatorPool.shift())
        } catch (error) {
          console.log("Iterator has error occurs",error) // eslint-disable-line
          totalLive--
          if (totalLive <= 0) break
        }
      }
    },
  }
}

module.exports = {
  createFanIn,
}
