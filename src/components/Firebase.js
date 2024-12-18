import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"
//import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MSGSENDERID,
    appId: process.env.REACT_APP_FIREBASE_APPID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID
};


const firebaseapp = initializeApp(firebaseConfig)

const firebasedb = getFirestore(firebaseapp)

const analytics = getAnalytics(firebaseapp);

//const firebasestorage = getStorage(firebaseapp)

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}


const appCheck = initializeAppCheck(firebaseapp, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_WEB3CAPTCHA),
    isTokenAutoRefreshEnabled: true
})

export { firebaseapp };

export { firebasedb };

//export { firebasestorage };

export { analytics }
