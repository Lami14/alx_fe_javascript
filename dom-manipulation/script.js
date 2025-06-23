let quotes = [];

// Load quotes from localStorage on initialization
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
    saveQuotes(); // Save default quotes
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote and store its index in sessionStorage
function showRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  const quote = quotes[index];
  document.getElementById('quote-text').innerText = quote;
  sessionStorage.setItem('lastQuoteIndex', index);
}

// Export quotes as JSON
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
    } catch (error) {
      alert('Error parsing JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore last viewed quote from session storage
function restoreLastQuote() {
  const index = sessionStorage.getItem('lastQuoteIndex');
  if (index !== null && quotes[index]) {
    document.getElementById('quote-text').innerText = quotes[index];
  }
}

// Initialize app
window.onload = function () {
  loadQuotes();
  restoreLastQuote();
};
