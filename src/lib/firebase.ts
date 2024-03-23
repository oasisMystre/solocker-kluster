import admin from "firebase-admin";
import { firestore } from "firebase-admin";

export class Firebase {
  readonly firestore: ReturnType<typeof firestore>;

  constructor() {
    this.firestore = admin.firestore();
  }
}
