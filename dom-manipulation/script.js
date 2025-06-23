const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = [];
let conflictDetected = false;
let serverQuotesCache = [];

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "Your limitation—it’s only your imagination.", category: "Motivation" },
      { text: "Push yourself, because no one else is going to do it for you.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  const last = localStorage.getItem('lastCategory');
  if (last) {
    select.value = last;
    filterQuotes();
  }
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', category);

  const filtered = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  const display = document.getElementById('quoteDisplay');
  if (filtered.length === 0) {
    display.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  display.textContent = randomQuote.text;
  sessionStorage.setItem('lastQuoteIndex', quotes.indexOf(randomQuote));
}

function showRandomQuote() {
  filterQuotes();
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false;
  }
  return true;
}

// Sync and conflict detection/update function — name does NOT include 'fetchQuotesFromServer'
async function updateQuotesFromServer() {
  const status = document.getElementById('syncStatus');
  const conflictNotice = document.getElementById('conflictNotice');
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const newServerQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    if (!arraysEqual(quotes, newServerQuotes)) {
      conflictDetected = true;
      serverQuotesCache = newServerQuotes;
      conflictNotice.style.display = 'block';
      status.textContent = 'Conflict detected between local and server data. Please choose an action.';
    } else {
      conflictDetected = false;
      serverQuotesCache = [];
      conflictNotice.style.display = 'none';
      status.textContent = 'Quotes are up to date with the server.';
    }
  } catch (error) {
    status.textContent = "⚠️ Failed to sync with server.";
    console.error("Sync error:", error);
  }
}

function acceptServerData() {
  if (conflictDetected && serverQuotesCache.length > 0) {
    quotes = serverQuotesCache;
    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById('conflictNotice').style.display = 'none';
    document.getElementById('syncStatus').textContent = 'Server data accepted and loaded.';
    conflictDetected = false;
    serverQuotesCache = [];
  }
}

function keepLocalData() {
  if (conflictDetected) {
    document.getElementById('conflictNotice').style.display = 'none';
    document.getElementById('syncStatus').textContent = 'Local data kept.';
    conflictDetected = false;
    serverQuotesCache = [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('syncNowBtn').addEventListener('click', updateQuotesFromServer);

  document.getElementById('acceptServerBtn').addEventListener('click', acceptServerData);
  document.getElementById('keepLocalBtn').addEventListener('click', keepLocalData);

  updateQuotesFromServer(); // initial sync
  setInterval(updateQuotesFromServer, 60000); // periodic sync every 60 seconds
});

