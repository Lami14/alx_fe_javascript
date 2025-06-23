const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = [];

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from localStorage or initialize defaults
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

// Populate the category dropdown dynamically
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const lastCategory = localStorage.getItem('lastCategory');
  if (lastCategory) {
    select.value = lastCategory;
    filterQuotes();
  }
}

// Filter quotes by selected category and display a random one
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

// Show a new random quote based on current filter
function showRandomQuote() {
  filterQuotes();
}

// Synchronize quotes with server (simulate GET and conflict resolution)
async function performSync() {
  const status = document.getElementById('syncStatus');
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Extract first 5 posts as server quotes with a category "Server"
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Detect if local and server quotes differ (simple stringify comparison)
    const serverSet = new Set(serverQuotes.map(q => JSON.stringify(q)));
    const localSet = new Set(quotes.map(q => JSON.stringify(q)));

    const different = serverQuotes.length !== quotes.length ||
      [...serverSet].some(q => !localSet.has(q));

    if (different) {
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      status.textContent = "Quotes updated from server (conflicts resolved in favor of server data).";
    } else {
      status.textContent = "Quotes are up to date with the server.";
    }
  } catch (error) {
    status.textContent = "⚠️ Failed to sync with server.";
    console.error("Sync error:", error);
  }
}

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('syncNowBtn').addEventListener('click', performSync);

  performSync(); // Initial sync
  setInterval(performSync, 60000); // Periodic sync every 60 seconds
});

