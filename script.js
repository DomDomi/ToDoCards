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

// Stacks für die Karten
const stacks = {
    open: document.getElementById("open"),
    inProgress: document.getElementById("inProgress"),
    postponed: document.getElementById("postponed"),
    done: document.getElementById("done"),
    archive: document.getElementById("archive")
};

// Karte erstellen
function addCard() {
    const task = prompt("Aufgabe eingeben:");
    if (!task) return;
    
    const color = prompt("Farbe wählen (rot, blau, gelb, grün, petrol oder hex-code):", "#ffffff");
    const card = {
        text: task,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: color
    };
    db.collection("cards").add(card);
}

// Karten laden
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
    card.draggable = true;
    card.style.backgroundColor = data.color;
    card.innerHTML = `
        <strong>${data.text}</strong>
        <small>Erstellt: ${new Date(data.createdAt).toLocaleString()}</small>
        <small>Geändert: ${new Date(data.updatedAt).toLocaleString()}</small>
        <span class="edit">✏️</span>
    `;
    card.dataset.id = id;

    card.querySelector(".edit").addEventListener("click", () => editCard(id, data));
    card.addEventListener("dragstart", event => {
        event.dataTransfer.setData("id", id);
    });
    
    stacks[data.status].appendChild(card);
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

// Drag & Drop Event-Listener
Object.keys(stacks).forEach(status => {
    const stack = stacks[status];
    stack.addEventListener("dragover", event => event.preventDefault());
    stack.addEventListener("drop", event => {
        event.preventDefault();
        const id = event.dataTransfer.getData("id");
        db.collection("cards").doc(id).update({ status, updatedAt: new Date().toISOString() });
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

// Archiv minimieren/erweitern
document.getElementById("toggleArchive").addEventListener("click", () => {
    stacks.archive.classList.toggle("minimized");
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search").addEventListener("input", searchCards);
});

//document.getElementById("addCardButton").addEventListener("click", addCard);
//loadCards();


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addCardButton").addEventListener("click", addCard);
    loadCards();
});
