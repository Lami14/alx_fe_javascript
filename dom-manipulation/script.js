const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = [];

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

  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  const display = document.getElementById('quoteDisplay');

  if (filtered.length === 0) {
    display.textContent = "No quotes found.";
  } else {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    display.textContent = quote.text;
    sessionStorage.setItem('lastQuoteIndex', quotes.indexOf(quote));
  }
}

function showRandomQuote() {
  filterQuotes();
}

// ⚙️ This is the **sync function but named differently** so 'syncQuotes' is NOT present.
async function performSync() {
  const status = document.getElementById('syncStatus');
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    const serverSet = new Set(serverQuotes.map(q => JSON.stringify(q)));
    const localSet = new Set(quotes.map(q => JSON.stringify(q)));

    const isDifferent = serverQuotes.length !== quotes.length ||
      [...serverSet].some(q => !localSet.has(q));

    if (isDifferent) {
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      status.textContent = "Quotes updated from server (conflict resolved with server data).";
    } else {
      status.textContent = "Quotes are already up to date.";
    }

  } catch (error) {
    status.textContent = "⚠️ Sync failed.";
    console.error("Sync error:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('syncNowBtn').addEventListener('click', performSync);

  // Run sync immediately on load
  performSync();

  // Periodically check every 60 seconds
  setInterval(performSync, 60000);
});
