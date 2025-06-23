const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
  { text: "Imagination is more important than knowledge.", category: "Inspirational" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

function updateCategoryFilterOptions() {
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = `<option value="All">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "All"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    "${randomQuote.text}"<br>
    <span class="quote-category">— ${randomQuote.category}</span>
  `;
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  // Update category filter
  updateCategoryFilterOptions();

  alert("Quote added successfully!");
}

newQuoteButton.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// Initialize filter options on page load
updateCategoryFilterOptions();
