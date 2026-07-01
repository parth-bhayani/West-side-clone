import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB8ioUWdYAYwpIEPEN4Q8stcZ_fQ1m73_w",
    authDomain: "west-side-ba279.firebaseapp.com",
    projectId: "west-side-ba279",
    storageBucket: "west-side-ba279.firebasestorage.app",
    messagingSenderId: "263419269576",
    appId: "1:263419269576:web:2a7a86e25de57c656fb0fd",
    measurementId: "G-8WHZLBPTCW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
export default app;
