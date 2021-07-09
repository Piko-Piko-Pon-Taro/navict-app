import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FB_APPID
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}
export const auth = firebase.auth()
export const projectStorage = firebase.storage()
export default firebase
