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

// Vordefinierte Farben
const predefinedColors = {
    rot: "#ff4d4d",
    blau: "#4d79ff",
    gelb: "#ffd633",
    grün: "#47d147",
    petrol: "#008080"
};

// Karte erstellen
function addCard() {
    const task = prompt("Aufgabe eingeben:");
    if (!task) return;

    // Farbauswahl-Dialog
    const colorDialog = document.createElement("div");
    colorDialog.innerHTML = `
        <h3>Farbe wählen:</h3>
        <div class="color-picker">
            ${Object.entries(predefinedColors).map(([name, color]) => `
                <button style="background: ${color}" onclick="selectColor('${color}')"></button>
            `).join("")}
            <input type="text" id="customColor" placeholder="Hex-Code">
            <button onclick="useCustomColor()">✅</button>
        </div>
    `;
    document.body.appendChild(colorDialog);

    window.selectColor = (color) => {
        saveCard(task, color);
        colorDialog.remove();
    };

    window.useCustomColor = () => {
        const customColor = document.getElementById("customColor").value;
        if (/^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
            saveCard(task, customColor);
            colorDialog.remove();
        } else {
            alert("Ungültiger Hex-Code!");
        }
    };
}

// Karte speichern
function saveCard(task, color) {
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
    if (!newText) return;

    // Farbauswahl für Bearbeitung
    const colorDialog = document.createElement("div");
    colorDialog.innerHTML = `
        <h3>Neue Farbe wählen:</h3>
        <div class="color-picker">
            ${Object.entries(predefinedColors).map(([name, color]) => `
                <button style="background: ${color}" onclick="updateCard('${id}', '${newText}', '${color}')"></button>
            `).join("")}
            <input type="text" id="editCustomColor" placeholder="Hex-Code">
            <button onclick="updateCard('${id}', '${newText}', document.getElementById('editCustomColor').value)">✅</button>
        </div>
    `;
    document.body.appendChild(colorDialog);
}

// Karte aktualisieren
function updateCard(id, newText, newColor) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(newColor) && !Object.values(predefinedColors).includes(newColor)) {
        alert("Ungültige Farbe!");
        return;
    }
    db.collection("cards").doc(id).update({
        text: newText,
        color: newColor,
        updatedAt: new Date().toISOString()
    }).then(() => document.querySelector(".color-picker").remove());
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

//document.getElementById("addCardButton").addEventListener("click", addCard);
//loadCards();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addCardButton").addEventListener("click", addCard);
    loadCards();
});
