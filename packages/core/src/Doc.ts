import { O } from 'ts-toolbelt'
import {
  MagnetarWriteAction,
  MagnetarFetchAction,
  MagnetarStreamAction,
  MagnetarDeleteAction,
  MagnetarDeletePropAction,
  MagnetarInsertAction,
  OpenStreams,
  FindStream,
  OpenStreamPromises,
  FindStreamPromise,
} from './types/actions'
import { actionNameTypeMap } from './types/actionsInternal'
import { handleActionPerStore } from './moduleActions/handleActionPerStore'
import { handleStreamPerStore } from './moduleActions/handleStreamPerStore'
import { ModuleConfig, GlobalConfig } from './types/config'
import { CollectionFn, DocFn } from './Magnetar'
import { executeSetupModulePerStore, getDataProxyHandler } from './helpers/moduleHelpers'

export type DocInstance<DocDataType extends Record<string, any> = Record<string, any>> = {
  /**
   * The cached data that was written or read so far
   */
  data: DocDataType
  /**
   * `collection` is available on every document for chaining
   * @example doc('001').collection('items')
   */
  collection: CollectionFn
  /**
   * The id of the document. When this is a nested document, it will not include the full path, only the final part
   * @example '001'
   */
  id: string
  /**
   * The full path of the document
   * @example 'pokedex/001'
   */
  path: string
  openStreams: OpenStreams
  findStream: FindStream
  openStreamPromises: OpenStreamPromises
  findStreamPromise: FindStreamPromise

  // actions
  fetch: MagnetarFetchAction<DocDataType, 'doc'>
  stream: MagnetarStreamAction
  insert: MagnetarInsertAction<DocDataType>
  merge: MagnetarWriteAction<DocDataType>
  assign: MagnetarWriteAction<DocDataType>
  replace: MagnetarWriteAction<DocDataType>
  deleteProp: MagnetarDeletePropAction<DocDataType>
  /**
   * @type {MagnetarDeleteAction} Documentation copied from `MagnetarDeleteAction`
   * @param {*} [payload] The delete action doesn't need any payload. In some cases, a Store Plugin you use might accept a payload.
   * @param {ActionConfig} [actionConfig]
   */
  delete: MagnetarDeleteAction<DocDataType>
}

export function createDocWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn,
  streams: {
    openStreams: OpenStreams
    findStream: FindStream
    openStreamPromises: OpenStreamPromises
    findStreamPromise: FindStreamPromise
  }
): DocInstance<DocDataType> {
  const { openStreams, findStream, openStreamPromises, findStreamPromise } = streams
  const id = docId
  const path = [collectionPath, docId].join('/')

  const collection: CollectionFn = (collectionId, _moduleConfig = {}) => {
    return collectionFn(`${path}/${collectionId}`, _moduleConfig)
  }

  const actions = {
    insert: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'insert', actionNameTypeMap.insert,  docFn) as MagnetarInsertAction<DocDataType>), // prettier-ignore
    merge: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'merge', actionNameTypeMap.merge, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    assign: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'assign', actionNameTypeMap.assign, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    replace: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'replace', actionNameTypeMap.replace, docFn) as MagnetarWriteAction<DocDataType>), // prettier-ignore
    deleteProp: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'deleteProp', actionNameTypeMap.deleteProp, docFn) as MagnetarDeletePropAction<DocDataType>), // prettier-ignore
    delete: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'delete', actionNameTypeMap.delete, docFn) as MagnetarDeleteAction<DocDataType>), // prettier-ignore
    fetch: (handleActionPerStore([collectionPath, docId], moduleConfig, globalConfig, 'fetch', actionNameTypeMap.fetch, docFn) as MagnetarFetchAction<DocDataType, 'doc'>), // prettier-ignore
    stream: handleStreamPerStore([collectionPath, docId], moduleConfig, globalConfig, actionNameTypeMap.stream, streams), // prettier-ignore
  }

  // Every store will have its 'setupModule' function executed
  executeSetupModulePerStore(globalConfig.stores, [collectionPath, docId], moduleConfig)

  const moduleInstance: Omit<DocInstance<DocDataType>, 'data'> = {
    collection,
    id: id as string,
    path,
    openStreams,
    findStream,
    openStreamPromises,
    findStreamPromise,
    ...actions,
  }

  /**
   * The data returned by the store specified as 'localStoreName'
   */
  const dataProxyHandler = getDataProxyHandler<'doc', DocDataType>(
    [collectionPath, docId],
    moduleConfig,
    globalConfig
  )

  return new Proxy(moduleInstance, dataProxyHandler)
}
