import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyC2zqF5at3r8eKG0Q7frxnS-byD1OW-vto",

authDomain: "carcarepro-daf80.firebaseapp.com",

projectId: "carcarepro-daf80",

storageBucket: "carcarepro-daf80.firebasestorage.app",

messagingSenderId: "1014143359387",

appId: "1:1014143359387:web:d3ab7e58dcc73af4b8a93e",

measurementId: "G-5C1H0RZ9HY"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };