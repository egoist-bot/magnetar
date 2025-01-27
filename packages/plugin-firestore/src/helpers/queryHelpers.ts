import type {
  Firestore,
  Query,
  CollectionReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { collection, query, where, orderBy, limit } from 'firebase/firestore'
import { isNumber } from 'is-what'
import { FirestoreModuleConfig } from '../CreatePlugin'
import { DocMetadata } from '@magnetarjs/core'

export function getQueryInstance(
  collectionPath: string,
  config: FirestoreModuleConfig,
  db: Firestore
): Query {
  let q: CollectionReference | Query
  q = collection(db, collectionPath)
  for (const whereClause of config.where || []) {
    q = query(q, where(...whereClause))
  }
  for (const orderByClause of config.orderBy || []) {
    q = query(q, orderBy(...orderByClause))
  }
  if (isNumber(config.limit)) {
    q = query(q, limit(config.limit))
  }
  return q
}

export function docSnapshotToDocMetadata(
  docSnapshot: DocumentSnapshot | QueryDocumentSnapshot
): DocMetadata {
  const docMetaData: DocMetadata = {
    data: docSnapshot.data() as Record<string, any> | undefined,
    metadata: docSnapshot as any,
    id: docSnapshot.id,
    exists: docSnapshot.exists(),
  }
  return docMetaData
}
