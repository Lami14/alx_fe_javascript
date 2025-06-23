let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      "The best way to get started is to quit talking and begin doing.",
      "Don't let yesterday take up too much of today.",
      "It's not whether you get knocked down, it's whether you get up."
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote and store the index in sessionStorage
function showRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  const quote = quotes[index];
  document.getElementById('quote-text').innerText = quote;
  sessionStorage.setItem('lastQuoteIndex', index);
}

// Export quotes to a JSON file
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

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid format: JSON must be an array of strings.');
      }
    } catch (err) {
      alert('Failed to import JSON. Error: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore the last shown quote from sessionStorage
function restoreLastQuote() {
  const index = sessionStorage.getItem('lastQuoteIndex');
  if (index !== null && quotes[index]) {
    document.getElementById('quote-text').innerText = quotes[index];
  }
}

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  restoreLastQuote();

  // Attach event listeners (optional — if you use `id`s or classes)
  document.querySelector('button[onclick="showRandomQuote()"]')
    .addEventListener('click', showRandomQuote);

  document.querySelector('button[onclick="exportToJsonFile()"]')
    .addEventListener('click', exportToJsonFile);

  document.getElementById('importFile')
    .addEventListener('change', importFromJsonFile);
});

