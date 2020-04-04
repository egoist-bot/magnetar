import { ActionType, ActionName } from './actions'
import { EventFnBefore, EventFnSuccess, EventFnError, EventFnRevert } from './events'
import { O } from 'ts-toolbelt'

// atomic types
export type PlainObject = { [key: string]: any }
export type StoreName = string

export type Modified<T> = T extends object ? O.Merge<Partial<T>, PlainObject> : T

// the shared config which can be set globally < per module < or per action.
export type SharedConfig = {
  executionOrder: {
    [actionType in ActionType]?: StoreName[]
  } &
    {
      [action in ActionName]?: StoreName[]
    }
  onError: 'stop' | 'continue' | 'revert'
  modifyPayloadOn: {
    insert?: (payload: object) => object
    merge?: (payload: object) => object
    assign?: (payload: object) => object
    replace?: (payload: object) => object
    delete?: (payload: string | string[]) => string | string[]
  }
  on: {
    before?: EventFnBefore
    success?: EventFnSuccess
    error?: EventFnError
    revert?: EventFnRevert
  }
}
// export interface SharedConfig {
//   executionOrder: {
//     [actionType in ActionType]?: StoreName[]
//   } &
//     {
//       [action in ActionName]?: StoreName[]
//     }
//   onError: 'stop' | 'continue' | 'revert'
//   on: {
//     [storeName: string]: {
//       before?: EventFnBefore<ActionName>
//       success?: EventFnSuccess
//       error?: EventFnError
//       revert?: EventFnRevert
//     }
//   }
// }