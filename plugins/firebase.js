import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyB8yUEO0qmv6KwgKyutDUcsbZADcccgCvw',
  authDomain: 'dms-01-cd8fb.firebaseapp.com',
  databaseURL: 'https://dms-01-cd8fb.firebaseio.com',
  projectId: 'dms-01-cd8fb',
  storageBucket: 'dms-01-cd8fb.appspot.com',
  messagingSenderId: '1070031518454'
}

let app = null
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig)
} else {
  app = firebase.app()
}

export const db = app.database()
