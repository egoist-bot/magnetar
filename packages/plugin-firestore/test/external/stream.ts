import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

{
  const testName = 'stream (collection)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    t.deepEqual(pokedexModule.doc('136').data, undefined)
    t.is(pokedexModule.data.size, 1)

    // do not await, because it only resolves when the stream is closed
    pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    pokedexModule.closeStream()

    t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
    t.deepEqual(pokedexModule.data.get('2'), pokedex(2))
    t.deepEqual(pokedexModule.data.get('3'), pokedex(3))
    t.is(pokedexModule.data.size, 151)
  })
}
{
  const testName = 'stream (doc)'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance('read')
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    // do not await, because it only resolves when the stream is closed
    trainerModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    trainerModule.closeStream()

    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'stream (collection) where-filter'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    // the original state has 1 Pokemon already
    t.is(pokedexModule.data.size, 1)
    // let's get some more
    const pokedexModuleWithQuery = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
    // → Charizard 6, Ninetales 38, Rapidash 78

    // do not await, because it only resolves when the stream is closed
    pokedexModuleWithQuery.stream().catch((e: any) => t.fail(e.message))

    await waitMs(3500)

    pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
      .closeStream()

    // the queried instance only has these 3 Pokemon
    t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(6), pokedex(38), pokedex(78)])
    // the main instance has one Pokemon from the beginning
    t.is(pokedexModule.data.size, 4)
  })
}
{
  const testName = 'stream: errors are thrown'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read-no-access')

    let error
    try {
      const a = await pokedexModule.stream()
    } catch (_error) {
      error = _error
    }

    t.truthy(error)
  })
}
