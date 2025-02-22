// Firebase-Projekt initialisieren (ersetze mit deinen Firebase-Konfigurationsdaten)
const firebaseConfig = {
    apiKey: "AIzaSyDpB20Xq8nVUmI8jYWkQ4xA6DBEwBNvsoU",
    authDomain: "todocards-472a0.firebaseapp.com",
    projectId: "todocards-472a0",
    storageBucket: "todocards-472a0.firebasestorage.app",
    messagingSenderId: "3981782181",
    appId: "1:3981782181:web:fa94888215d8b7b10ab14c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.body.innerHTML = `
    <input type="text" id="search" placeholder="Suche...">
    <button id="addCardButton">Karte hinzufügen</button>
    <div class="container">
        <div id="open" class="stack"><h3>Offen</h3></div>
        <div id="inProgress" class="stack"><h3>In Arbeit</h3></div>
        <div id="postponed" class="stack"><h3>Zurückgestellt</h3></div>
        <div id="done" class="stack"><h3>Fertig</h3></div>
    </div>
`;

// Stacks für die Karten
const stacks = {
    open: document.getElementById("open"),
    inProgress: document.getElementById("inProgress"),
    postponed: document.getElementById("postponed"),
    done: document.getElementById("done")
};

// Karte erstellen
function addCard() {
    const task = prompt("Aufgabe eingeben:");
    if (!task) return;
    
    const card = {
        text: task,
        status: "open",
        timestamp: new Date().toISOString()
    };

    db.collection("cards").add(card);
}

// Karten aus der Datenbank laden
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
    card.innerHTML = `<strong>${data.text}</strong><br><small>${new Date(data.timestamp).toLocaleString()}</small>`;
    card.dataset.id = id;

    card.addEventListener("dragstart", event => {
        event.dataTransfer.setData("id", id);
    });
    
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

// Stichwortsuche
function searchCards() {
    const query = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll(".card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? "block" : "none";
    });
}

document.getElementById("search").addEventListener("input", searchCards);

document.getElementById("addCardButton").addEventListener("click", addCard);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addCardButton").addEventListener("click", addCard);
    loadCards();
});
