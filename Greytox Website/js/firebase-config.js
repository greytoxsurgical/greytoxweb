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
  apiKey: "AIzaSyB3etHr49OXjX-X3-DfoWZk1vbz_Y67ysg",
  authDomain: "greytoxweb.firebaseapp.com",
  databaseURL: "https://greytoxweb-default-rtdb.firebaseio.com",
  projectId: "greytoxweb",
  storageBucket: "greytoxweb.firebasestorage.app",
  messagingSenderId: "316301158430",
  appId: "1:316301158430:web:ea1bf7be8f81bae094a60f"
};

// Web3Forms access key — https://web3forms.com par free signup karke milegi.
// Contact Us aur Make a Deal forms isi key se seedha email par pohanchte hain.
const WEB3FORMS_ACCESS_KEY = "140c99f8-f54b-4fc1-bb41-171ccf847d1a";

// Contact Us aur Make a Deal submissions inhi emails par jayengi (comma se multiple).
const NOTIFY_EMAILS = "greytoxsurgical@gmail.com, sales@greytox.com";

// Admin panel password (footer logo par 5 baar click karke access hota hai)
const ADMIN_PASSWORD = "22332021";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
