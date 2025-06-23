let quotes = [];

// Load quotes from localStorage or use defaults
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate the category dropdown based on existing quotes
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

// Filter and display quotes based on selected category
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

// Show a random quote within the current filter
function showRandomQuote() {
  filterQuotes(); // already includes random selection logic
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

// Import quotes from a selected JSON file
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

// Restore last shown quote based on sessionStorage
function restoreLastQuote() {
  const index = sessionStorage.getItem('lastQuoteIndex');
  if (index !== null && quotes[index]) {
    document.getElementById('quoteDisplay').innerText = quotes[index].text;
  }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  restoreLastQuote();

  document.getElementById('newQuoteBtn').addEventListener('click', showRandomQuote);
  document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
});
