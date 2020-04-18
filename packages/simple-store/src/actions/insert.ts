import {
  isCollectionModule,
  PlainObject,
  PluginInsertAction,
  getCollectionPathDocIdEntry,
} from '@vue-sync/core'
import { StorePluginModuleConfig, SimpleStoreConfig } from '..'
import { generateRandomId } from '../generateRandomId'

export function insertActionFactory (
  moduleData: PlainObject,
  simpleStoreConfig: SimpleStoreConfig,
  makeDataSnapshot?: any
): PluginInsertAction {
  return function (
    payload: PlainObject,
    modulePath: string,
    pluginModuleConfig: StorePluginModuleConfig
  ): string {
    // this is custom logic to be implemented by the plugin author

    const isCollection = isCollectionModule(modulePath)
    if (isCollection) {
      const id = payload.id || generateRandomId()
      const collectionPath = modulePath
      moduleData[collectionPath].set(id, payload)
      return id
    }
    // else it's a doc
    const [collectionPath, docId] = getCollectionPathDocIdEntry(modulePath)
    const collectionMap = moduleData[collectionPath]
    if (!collectionMap.get(docId)) collectionMap.set(docId, {})
    const docDataToMutate = collectionMap.get(docId)
    Object.entries(payload).forEach(([key, value]) => {
      docDataToMutate[key] = value
    })
    return docId
  }
}
