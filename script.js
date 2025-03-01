// Firebase-Projekt initialisieren (ersetze mit deinen Firebase-Konfigurationsdaten)
const firebaseConfig = {
    apiKey: "AIzaSyDpB20Xq8nVUmI8jYWkQ4xA6DBEwBNvsoU",
    authDomain: "todocards-472a0.firebaseapp.com",
    projectId: "todocards-472a0",
    storageBucket: "todocards-472a0.firebasestorage.app",
    messagingSenderId: "3981782181",
    appId: "1:3981782181:web:fa94888215d8b7b10ab14c"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const stacks = {
    open: document.getElementById("open"),
    inProgress: document.getElementById("inProgress"),
    postponed: document.getElementById("postponed"),
    done: document.getElementById("done"),
    archive: document.getElementById("archive")
};

const predefinedColors = { rot: "#ff4d4d", blau: "#4d79ff", gelb: "#ffd633", grün: "#47d147", petrol: "#008080" };
let currentEditId = null;

// Modal-Elemente
const cardModal = document.getElementById("cardModal");
const modalTitle = document.getElementById("modalTitle");
const cardTitleInput = document.getElementById("cardTitle");
const cardTextInput = document.getElementById("cardText");
const colorButtons = document.getElementById("colorButtons");
const customColorInput = document.getElementById("customColor");
const saveCardBtn = document.getElementById("saveCard");
const closeModalBtn = document.getElementById("closeModal");

// Farbauswahl-Buttons generieren
colorButtons.innerHTML = Object.entries(predefinedColors).map(([name, color]) => `
    <button style="background: ${color}" onclick="selectColor('${color}')"></button>
`).join("");

let selectedColor = "#ffffff";
function selectColor(color) { selectedColor = color; }

// Öffne Modal zum Erstellen einer Karte
document.getElementById("addCardButton").addEventListener("click", () => {
    modalTitle.textContent = "Karte erstellen";
    cardTitleInput.value = "";
    cardTextInput.value = "";
    selectedColor = "#ffffff";
    cardModal.style.display = "block";
});

// Karte speichern oder aktualisieren
saveCardBtn.addEventListener("click", () => {
    const title = cardTitleInput.value;
    const text = cardTextInput.value;
    const color = customColorInput.value || selectedColor;
    if (!title) return alert("Bitte eine Überschrift eingeben!");

    if (currentEditId) {
        db.collection("cards").doc(currentEditId).update({ title, text, color, updatedAt: new Date().toISOString() });
    } else {
        db.collection("cards").add({ title, text, status: "open", color, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    cardModal.style.display = "none";
});

// 🔹 Karten aus Firebase abrufen & laden
function loadCards() {
    db.collection("cards").onSnapshot(snapshot => {
        document.querySelectorAll(".card").forEach(card => card.remove());
        snapshot.forEach(doc => renderCard(doc.id, doc.data()));
    });
}

// Karte rendern
function renderCard(id, data) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundColor = data.color;
    card.innerHTML = `<div class="card-title">${data.title}</div><div class="card-text">${data.text}</div><span class="edit">✏️</span>`;
    card.querySelector(".edit").addEventListener("click", () => editCard(id, data));
    stacks[data.status].appendChild(card);
}

currentEditId = null;


