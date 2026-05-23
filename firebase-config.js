// ── CONFIGURAÇÃO FIREBASE ──
// Copie suas credenciais do Firebase Console e cole aqui

const firebaseConfig = {
    apiKey: "AIzaSyDx_YOUR_API_KEY_HERE",
    authDomain: "eventcalc-leads.firebaseapp.com",
    databaseURL: "https://eventcalc-leads-default-rtdb.firebaseio.com",
    projectId: "eventcalc-leads",
    storageBucket: "eventcalc-leads.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ── NOTIFICAÇÕES (Será preenchido via Netlify Functions) ──
// Endpoints das funções serverless
const NETLIFY_FUNCTIONS = {
    sendEmail: '/.netlify/functions/send-email',
    sendWhatsApp: '/.netlify/functions/send-whatsapp',
    sendFollowUp: '/.netlify/functions/send-followup'
};

console.log('✅ Firebase inicializado com sucesso');
