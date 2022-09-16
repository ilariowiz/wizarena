import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore';
//import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJpS5RrKvHRDaJAXFOSlHIxcWn97yFIr4",
  authDomain: "wizarena-a32c6.firebaseapp.com",
  projectId: "wizarena-a32c6",
  storageBucket: "wizarena-a32c6.appspot.com",
  messagingSenderId: "886776405520",
  appId: "1:886776405520:web:219eb72a849c4fcc4cf495",
  measurementId: "G-LB1W1KS9DJ"
};


const firebaseapp = initializeApp(firebaseConfig)

const firebasedb = getFirestore(firebaseapp)

//const firebasestorage = getStorage(firebaseapp)

export { firebaseapp };

export { firebasedb };

//export { firebasestorage };
