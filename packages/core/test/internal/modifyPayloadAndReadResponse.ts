import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

test('fetch: can mutate payload & read response (config in global magnetar instance)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance({
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  try {
    let payloadInSuccessEvent: any
    const result = await magnetar.collection('pokedex').fetch(undefined, {
      on: {
        success: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
    t.deepEqual(result.get('136'), { ...pokedex(136), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(magnetar.collection('pokedex').data.get('136'), { ...pokedex(136), seen: true })
})

test('stream: can mutate payload & read response (config in global magnetar instance)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { magnetar } = createMagnetarInstance({
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  let payloadInSuccessEvent: any
  magnetar.collection('pokedex').stream(
    {},
    {
      on: {
        before: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    }
  )
  await waitMs(600)
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  t.deepEqual(magnetar.collection('pokedex').data.get('2'), { ...pokedex(2), seen: true })
})

test('insert: can mutate payload (config in global magnetar instance)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance({
    modifyPayloadOn: { write: addSeen },
  })
  try {
    const resultA = await magnetar.collection('pokedex').insert(pokedex(7))
    const resultB = await magnetar.collection('pokedex').doc('10').insert(pokedex(10))
    const resultC = await magnetar.doc('pokedex/25').insert(pokedex(25))
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(resultA.data, { ...pokedex(7), seen: true })
    t.deepEqual(resultB.data, { ...pokedex(10), seen: true })
    t.deepEqual(resultC.data, { ...pokedex(25), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(magnetar.collection('pokedex').data.get('7'), { ...pokedex(7), seen: true })
  t.deepEqual(magnetar.collection('pokedex').data.get('10'), { ...pokedex(10), seen: true })
  t.deepEqual(magnetar.collection('pokedex').data.get('25'), { ...pokedex(25), seen: true })
})

test('fetch: can mutate payload & read response (config in module)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  try {
    let payloadInSuccessEvent: any
    const result = await pokedexModule.fetch(undefined, {
      on: {
        success: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
    t.deepEqual(result.get('136'), { ...pokedex(136), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('136'), { ...pokedex(136), seen: true })
})

test('stream: can mutate payload & read response (config in module)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { read: addToken },
    modifyReadResponseOn: { added: addSeen },
  })
  let payloadInSuccessEvent: any
  pokedexModule.stream(
    {},
    {
      on: {
        before: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    }
  )
  await waitMs(600)
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  t.deepEqual(pokedexModule.data.get('2'), { ...pokedex(2), seen: true })
})

test('insert: can mutate payload (config in module)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { write: addSeen },
  })
  try {
    const payload = pokedex(7)
    const result = await pokedexModule.insert(payload)
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data, { ...pokedex(7), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('7'), { ...pokedex(7), seen: true })
})

test('fetch: can mutate payload & read response (config in action)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    let payloadInSuccessEvent: any
    const result = await pokedexModule.fetch(
      {},
      {
        modifyPayloadOn: { read: addToken },
        modifyReadResponseOn: { added: addSeen },
        on: {
          success: ({ payload }) => {
            payloadInSuccessEvent = payload
          },
        },
      }
    )
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.get('1'), { ...pokedex(1), seen: true })
    t.deepEqual(result.get('136'), { ...pokedex(136), seen: true })
    t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), seen: true })
  t.deepEqual(pokedexModule.data.get('136'), { ...pokedex(136), seen: true })
})

test('stream: can mutate payload & read response (config in action)', async (t) => {
  function addSeen(payload: any) {
    return { ...payload, seen: true }
  }
  function addToken(payload: any = {}) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  let payloadInSuccessEvent: any
  pokedexModule.stream(
    {},
    {
      modifyPayloadOn: { read: addToken },
      modifyReadResponseOn: { added: addSeen },
      on: {
        before: ({ payload }) => {
          payloadInSuccessEvent = payload
        },
      },
    }
  )
  await waitMs(600)
  t.deepEqual(payloadInSuccessEvent, { auth: 'Bearer 123123' })
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), seen: true })
  t.deepEqual(pokedexModule.data.get('2'), { ...pokedex(2), seen: true })
})

test('insert: can mutate payload (config in action)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    const payload = pokedex(7)
    const result = await pokedexModule.insert(payload, {
      modifyPayloadOn: { write: addSeen },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data, { ...pokedex(7), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1) })
  t.deepEqual(pokedexModule.data.get('7'), { ...pokedex(7), seen: true })
})

test('insert: can mutate payload (config in module - action from doc)', async (t) => {
  function addSeen(payload: any) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { magnetar } = createMagnetarInstance()
  const pokedexModule = magnetar.collection('pokedex', {
    modifyPayloadOn: { write: addSeen },
  })
  try {
    const resultWithoutSeen = await magnetar.collection('pokedex').doc('10').insert(pokedex(10))
    const resultWithSeen = await pokedexModule.doc('7').insert(pokedex(7))
    // the remote result not from pokedexModule SHOULD NOT HAVE the applied defaults
    t.deepEqual(resultWithoutSeen.data, { ...pokedex(10) })
    t.falsy('seen' in resultWithoutSeen)
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(resultWithSeen.data, { ...pokedex(7), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store result not from pokedexModule SHOULD NOT HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('7'), { ...pokedex(7), seen: true })
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('10'), { ...pokedex(10) })
})
