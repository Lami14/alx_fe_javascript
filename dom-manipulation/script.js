// Modify the populateCategories function
function populateCategories(doFilter = true) {
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
    if (doFilter) {
      filterQuotes();
    }
  }
}

// Add to DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  
  // New event listeners
  document.getElementById('addQuoteBtn').addEventListener('click', () => {
    document.getElementById('addQuoteModal').style.display = 'block';
  });

  document.getElementById('cancelAddBtn').addEventListener('click', () => {
    document.getElementById('addQuoteModal').style.display = 'none';
    document.getElementById('addQuoteForm').reset();
  });

  document.getElementById('addQuoteForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const text = document.getElementById('quoteText').value.trim();
    const category = document.getElementById('quoteCategory').value.trim();
    
    if (text && category) {
      // Add new quote
      quotes.push({ text, category });
      saveQuotes();
      
      // Update UI
      localStorage.setItem('lastCategory', category);
      populateCategories(false);
      document.getElementById('quoteDisplay').innerText = text;
      sessionStorage.setItem('lastQuoteIndex', quotes.length - 1);
      
      // Reset and hide modal
      document.getElementById('addQuoteModal').style.display = 'none';
      this.reset();
    } else {
      alert('Both fields are required!');
    }
  });
});

