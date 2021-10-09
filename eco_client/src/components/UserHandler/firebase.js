//import * as firebase from "firebase/app";
// *** ver 8.6.7 --> change to 9.1.2 20211008 *** //
//import { firebase } from '@firebase/app'; // cannot build firebase, but less than 500KB (220KB in size)
//import '@firebase/auth'; // BUT build ERROR Template execution failed: Error: The XMLHttpRequest compatibility library was not found.
//older, not used
//const firebase = require('firebase'); //can build firebase, but exceed 500KB
//require('firebase/auth'); //can build, Unable to read file: /node_modules/idb/lib/idb.mjs
// .........................ReferenceError: IDBIndex is not defined
//import 'firebase/database';
//import 'firebase/auth';
//const { firebaseConfig } = require('../../.credentials.development.js');
const { firebaseConfig } = require('./.credentials.development.js');

// *** ver 8.6.7 *** //
// firebase.initializeApp(firebaseConfig);
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebase = initializeApp(firebaseConfig); //firebaseApp

export default firebase;

//export const database = firebase.database();
export const auth = getAuth(firebase); //ver8.6.7: firebase.auth();
export const googleAuthProvider = new GoogleAuthProvider(); //ver8.6.7: new firebase.auth.GoogleAuthProvider();
