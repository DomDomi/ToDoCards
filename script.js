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
    currentEditId = null;
});

// 🔹 Karten aus Firebase abrufen & laden
function loadCards() {
    db.collection("cards").onSnapshot(snapshot => {
        document.querySelectorAll(".card").forEach(card => card.remove());
        snapshot.forEach(doc => renderCard(doc.id, doc.data()));
    });
}

 
   
// Bearbeiten einer Karte
function editCard(id, data) {
    const newText = prompt("Neuer Text:", data.text);
    const newColor = prompt("Neue Farbe (rot, blau, gelb, grün, petrol oder hex-code):", data.color);
    if (newText) {
        db.collection("cards").doc(id).update({
            text: newText,
            color: newColor,
            updatedAt: new Date().toISOString()
        });
    }
}

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

// Karte rendern
function renderCard(id, data) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundColor = data.color;
    card.draggable = true;
    card.innerHTML = `<div class="card-title">${data.title}</div><div class="card-text">${data.text}</div><span class="edit">✏️</span>`;
    card.querySelector(".edit").addEventListener("click", () => editCard(id, data));
    card.addEventListener("dragstart", event => {
        event.dataTransfer.setData("id", id);
    });
    card.querySelector(".edit").addEventListener("click", () => editCard(id, data));
    stacks[data.status].appendChild(card);
}

// Drag & Drop Event-Listener für die Stapel
Object.keys(stacks).forEach(status => {
    const stack = stacks[status];
    stack.addEventListener("dragover", event => event.preventDefault());
    stack.addEventListener("drop", event => {
        event.preventDefault();
        const id = event.dataTransfer.getData("id");
        db.collection("cards").doc(id).update({ status, timestamp: new Date().toISOString() });
    });
});

// Mülltonnen-Funktion
const trashBin = document.getElementById("trash");
trashBin.addEventListener("dragover", event => event.preventDefault());
trashBin.addEventListener("drop", event => {
    event.preventDefault();
    const id = event.dataTransfer.getData("id");
    if (confirm("Karte löschen oder ins Archiv verschieben? (OK = Löschen, Abbrechen = Archiv)")) {
        db.collection("cards").doc(id).delete();
    } else {
        db.collection("cards").doc(id).update({ status: "archive", updatedAt: new Date().toISOString() });
    }
});

// Stichwortsuche
function searchCards() {
    const query = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "block" : "none";
    });
}

document.getElementById("search").addEventListener("input", searchCards);

// Archiv minimieren/erweitern
document.getElementById("toggleArchive").addEventListener("click", () => {
    stacks.archive.classList.toggle("minimized");
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search").addEventListener("input", searchCards);
});

loadCards();
