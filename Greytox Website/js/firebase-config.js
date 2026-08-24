/* =========================================================
   FIREBASE CONFIG
   -----------------------------------------------------------
   1) Firebase console (console.firebase.google.com) me jaa kar
      naya project banayen (README.md me pura step-by-step guide hai).
   2) Project Settings > General > "Your apps" > Web app (</>) add karen.
   3) Wahan se milne wala config object neeche paste karen.
   4) Firestore Database aur Storage ko "production mode" me enable
      karen aur README.md me di gayi Security Rules paste karen.
   ========================================================= */

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Web3Forms access key — https://web3forms.com par free signup karke milegi.
// Contact Us aur Make a Deal forms isi key se seedha email par pohanchte hain.
const WEB3FORMS_ACCESS_KEY = "PASTE_YOUR_WEB3FORMS_ACCESS_KEY";

// Contact Us aur Make a Deal submissions inhi emails par jayengi (comma se multiple).
const NOTIFY_EMAILS = "greytoxsurgical@gmail.com, sales@greytox.com";

// Admin panel password (footer logo par 5 baar click karke access hota hai)
const ADMIN_PASSWORD = "22332021";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
