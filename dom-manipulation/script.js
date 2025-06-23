const SERVER_URL = "https://mocki.io/v1/your-mock-endpoint-id"; // Replace with your real endpoint
let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
      { text: "It's not whether you get knocked down, it's whether you get up.", category: "Resilience" }
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
  fileReader.onload = function(e) {
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

// 🔄 Sync with simulated server (server wins in conflict)
async function fetchQuotesFromServer() {
  const statusEl = document.getElementById('syncStatus');
  try {
    const res = await fetch(SERVER_URL);
    const serverQuotes = await res.json();

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

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('syncNowBtn').addEventListener('click', fetchQuotesFromServer);

  fetchQuotesFromServer();                 // Initial sync on load
  setInterval(fetchQuotesFromServer, 60000); // Auto-sync every 60s
});
