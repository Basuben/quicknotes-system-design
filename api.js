const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.querySelector("#load-btn");
const statusEl = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let notes = [];

// Show a message in the status line. type is "loading", "success" or "error".
function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type || "";
}

// Disable the buttons while a request is running so it cannot be sent twice.
function setBusy(isBusy) {
  loadBtn.disabled = isBusy;
}

// One reusable function for every call. It checks response.ok and throws on errors.
async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("The server answered with status " + response.status);
  }

  // DELETE can return an empty body, so read text first and parse only if there is some.
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { status: response.status, data: data };
}

// Draw the notes. User text is always inserted with textContent, never innerHTML.
function renderNotes() {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No notes to show yet.";
    notesList.appendChild(empty);
    return;
  }

  notes.forEach(function (note) {
    const item = document.createElement("li");

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    item.append(title, body);
    notesList.appendChild(item);
  });
}

// GET: load 10 notes.
async function loadNotes() {
  setStatus("Loading notes...", "loading");
  setBusy(true);

  try {
    const result = await request(API_URL + "?_limit=10");
    notes = result.data;
    renderNotes();
    setStatus("Loaded " + notes.length + " notes from the server.", "success");
  } catch (error) {
    setStatus("Sorry, the notes could not be loaded. " + error.message, "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", loadNotes);
