import { pick } from 'filter-anything'
import {
  ActionName,
  PluginWriteAction,
  PluginDeleteAction,
  PluginStreamAction,
  MustExecuteOnRead,
  StreamResponse,
  DoOnStream,
  PluginGetAction,
  PluginRevertAction,
  PluginDeletePropAction,
  PluginInsertAction,
  DoOnGet,
  GetResponse,
  PlainObject,
} from '../../src/index'
import { StorePluginModuleConfig, StorePluginOptions } from './pluginMockRemote'
import { waitMs } from './wait'
import { pokedexMap } from './pokedex'
import { throwIfEmulatedError } from './throwFns'
import { generateRandomId } from './generateRandomId'
import { filterDataPerClauses } from './pluginMockLocal/helpers/dataHelpers'

export function writeActionFactory (
  storePluginOptions: StorePluginOptions,
  actionName: 'merge' | 'assign' | 'replace'
): PluginWriteAction {
  return async function (
    payload: PlainObject,
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    // any write action other than `insert` cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function insertActionFactory (storePluginOptions: StorePluginOptions): PluginInsertAction {
  return async function (
    payload: PlainObject,
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<string> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    if (!docId) {
      const id = generateRandomId()
      return id
    }
    return docId
  }
}

export function deletePropActionFactory (
  storePluginOptions: StorePluginOptions
): PluginDeletePropAction {
  return async function (
    payload: string | string[],
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)

    // `deleteProp` action cannot be executed on collections
    if (!docId) throw new Error('An non-existent action was triggered on a collection')
  }
}

export function deleteActionFactory (storePluginOptions: StorePluginOptions): PluginDeleteAction {
  return async function (
    payload: void,
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<void> {
    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
    // this mocks an error during execution
  }
}

function mockDataRetrieval (
  moduleType: 'collection' | 'doc',
  pluginModuleConfig: StorePluginModuleConfig
): PlainObject[] {
  if (moduleType === 'doc') return [{ name: 'Luca', age: 10, dream: 'job' }]
  const _pokedexMap = pokedexMap()
  const clauses = pick(pluginModuleConfig, ['where', 'orderBy', 'limit'])
  const filteredMap = filterDataPerClauses(_pokedexMap, clauses)
  return [...filteredMap.values()]
}

export function getActionFactory (storePluginOptions: StorePluginOptions): PluginGetAction {
  return async (
    payload: void | PlainObject = {},
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig
  ): Promise<DoOnGet | GetResponse> => {
    // this is custom logic to be implemented by the plugin author

    // this mocks an error during execution
    throwIfEmulatedError(payload, storePluginOptions)
    // fetch from cache/or from a remote store with logic you implement here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this mocks an error during execution
        const dataRetrieved = mockDataRetrieval(docId ? 'doc' : 'collection', pluginModuleConfig)
        // we must trigger `mustExecuteOnGet.added` for each document that was retrieved and return whatever that returns
        const results = dataRetrieved.map(_data => {
          const _metaData = { data: _data, exists: true, id: _data.id || docId }
          return _metaData
        })
        resolve({ docs: results })
      }, 1)
    })
  }
}

export function streamActionFactory (storePluginOptions: StorePluginOptions): PluginStreamAction {
  return (
    payload: void | PlainObject = {},
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig,
    mustExecuteOnRead: MustExecuteOnRead
  ): StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream> => {
    // this is custom logic to be implemented by the plugin author
    // we'll mock opening a stream

    const dataRetrieved = !docId
      ? mockDataRetrieval('collection', pluginModuleConfig)
      : [
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10 },
          { name: 'Luca', age: 10, dream: 'job' },
          { name: 'Luca', age: 10, dream: 'job', colour: 'blue' },
        ]
    const stopStreaming = {
      stopped: false,
      stop: () => {},
    }
    // this mocks actual data coming in at different intervals
    dataRetrieved.forEach((data, i) => {
      const waitTime = 10 + i * 200
      setTimeout(() => {
        // mock when the stream is already stopped
        if (stopStreaming.stopped) return
        // else go ahead and actually trigger the mustExecuteOnRead function
        const metaData = { data, id: data.id || docId, exists: true }
        mustExecuteOnRead.added(data, metaData)
      }, waitTime)
    })

    // this mocks the opening of the stream
    const streaming: Promise<void> = new Promise((resolve, reject): void => {
      stopStreaming.stop = resolve
      setTimeout(() => {
        // this mocks an error during execution
        throwIfEmulatedError(payload, storePluginOptions)
      }, 1)
    })
    function stop (): void {
      stopStreaming.stopped = true
      stopStreaming.stop()
    }
    return { streaming, stop }
  }
}

export function revertActionFactory (storePluginOptions: StorePluginOptions): PluginRevertAction {
  // this is a `PluginRevertAction`:
  return async function revert (
    payload: PlainObject | PlainObject[] | string | string[] | void,
    [collectionPath, docId]: [string, string | undefined],
    pluginModuleConfig: StorePluginModuleConfig,
    actionName: ActionName
  ): Promise<void> {
    // this is custom logic to be implemented by the plugin author
    await waitMs(1)
  }
}