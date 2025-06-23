const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "Start where you are. Use what you have. Do what you can.", category: "Motivation" },
      { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
      { text: "Act as if what you do makes a difference. It does.", category: "Positivity" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const select = document.getElementById('categoryFilter');
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const lastSelected = localStorage.getItem('lastCategory');
  if (lastSelected) {
    select.value = lastSelected;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById('quoteDisplay');

  if (filtered.length === 0) {
    display.innerText = 'No quotes found for this category.';
  } else {
    const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
    display.innerText = randomQuote.text;
    sessionStorage.setItem('lastQuoteIndex', quotes.indexOf(randomQuote));
  }
}

function showRandomQuote() {
  filterQuotes();
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            quotes.push(q);
          }
        });
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('JSON must be an array of { text, category } objects.');
      }
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function restoreLastQuote() {
  const index = sessionStorage.getItem('lastQuoteIndex');
  if (index !== null && quotes[index]) {
    document.getElementById('quoteDisplay').innerText = quotes[index].text;
  }
}

// ✅ Sync quotes from simulated server (GET)
async function fetchQuotesFromServer() {
  const statusEl = document.getElementById('syncStatus');
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Use first 5 posts as fake quotes
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server" // Placeholder category
    }));

    const serverSet = new Set(serverQuotes.map(q => JSON.stringify(q)));
    const localSet = new Set(quotes.map(q => JSON.stringify(q)));

    const isDifferent = serverQuotes.length !== quotes.length ||
      [...serverSet].some(item => !localSet.has(item));

    if (isDifferent) {
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      statusEl.innerText = "Quotes synced from server (server version applied).";
    } else {
      statusEl.innerText = "Quotes are up-to-date with the server.";
    }
  } catch (error) {
    statusEl.innerText = "Failed to sync with server.";
    console.error("Sync error:", error);
  }
}

// ✅ Simulate POST to server
async function postQuotesToServer() {
  try {
    const res = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotes)
    });

    const data = await res.json();
    console.log("Posted to server (simulated):", data);
    document.getElementById('syncStatus').innerText = "Quotes posted to server (simulated).";
  } catch (err) {
    console.error("Post error:", err);
    document.getElementById('syncStatus').innerText = "Failed to post quotes.";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('syncNowBtn').addEventListener('click', fetchQuotesFromServer);

  fetchQuotesFromServer();                      // Initial fetch
  setInterval(fetchQuotesFromServer, 60000);   // Auto-sync every 60s
});

