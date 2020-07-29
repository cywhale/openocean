export default function importFirebase() {
  // code from https://medium.com/@romanonthego/firebase-js-is-so-damn-huge-f04de528094f
  // dynamic import, will return promise
  // magic weback comment to get meaningfull chunkname
  return import(/* webpackChunkName: 'firebase' */ 'firebase/firebase-browser')
}

