//import * as firebase from "firebase/app";
//import { firebase } from '@firebase/app'; // cannot build firebase, but less than 500KB (220KB in size)
//import '@firebase/auth'; // BUT build ERROR Template execution failed: Error: The XMLHttpRequest compatibility library was not found.
const firebase = require('firebase'); //can build firebase, but exceed 500KB
require('firebase/auth'); //can build, Unable to read file: /node_modules/idb/lib/idb.mjs
// .........................ReferenceError: IDBIndex is not defined
//import 'firebase/database';
//import 'firebase/auth';
//const { firebaseConfig } = require('../../.credentials.development.js');
const { firebaseConfig } = require('./.credentials.development.js');

firebase.initializeApp(firebaseConfig);

export default firebase;

//export const database = firebase.database();
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
