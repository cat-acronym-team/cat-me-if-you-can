// this makes the import to the firebase-admin module work in the shared code
declare module "firebase-admin/firestore" {
  export type Timestamp = import("firebase/firestore").Timestamp;
}
