let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Notification div (create if not exists)
let notification = document.getElementById("notification");
if (!notification) {
  notification = document.createElement("div");
  notification.id = "notification";
  Object.assign(notification.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    background: "#90ee90",
    padding: "10px",
    borderRadius: "5px",
    display: "none",
    zIndex: 1000,
  });
  document.body.appendChild(notification);
}

// Show notification message
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.background = isError ? "#f08080" : "#90ee90";
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Create Add Quote form dynamically
function createAddQuoteForm() {
  const formSection = document.createElement("div");
  formSection.style.marginTop = "30px";

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  formSection.appendChild(heading);
  formSection.appendChild(quoteInput);
  formSection.appendChild(categoryInput);
  formSection.appendChild(addBtn);
  document.body.appendChild(formSection);

  addBtn.addEventListener("click", addQuote);
}

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage or fallback to defaults
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
      { text: "Imagination is more important than knowledge.", category: "Inspirational" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];
    saveQuotes();
  }
}

// Update dropdown with available categories
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

// Show a random quote and store it in sessionStorage
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

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Restore the last viewed quote from sessionStorage
function loadLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.innerHTML = `
      "${q.text}"<br>
      <span class="quote-category">— ${q.category}</span>
    `;
  }
}

// Add a new quote and update everything
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  updateCategoryFilterOptions();
  alert("Quote added!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Merge local and server quotes, avoiding duplicates by quote text
function mergeQuotes(local, server) {
  const localTexts = new Set(local.map(q => q.text));
  const merged = [...local];

  server.forEach(serverQuote => {
    if (!localTexts.has(serverQuote.text)) {
      merged.push(serverQuote);
    }
  });

  return merged;
}

// Sync quotes from server and merge with local data
async function syncQuotes() {
  try {
    // Replace URL with your actual API endpoint
    const response = await fetch('https://example.com/api/quotes');
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const serverQuotes = await response.json();

    if (!Array.isArray(serverQuotes)) throw new Error("Server returned invalid data");

    const merged = mergeQuotes(quotes, serverQuotes);
    if (merged.length !== quotes.length) {
      quotes = merged;
      saveQuotes();
      updateCategoryFilterOptions();
      showNotification('Quotes synced successfully!');
    } else {
      showNotification('No new quotes to sync.');
    }
  } catch (error) {
    console.error('Sync failed:', error);
    showNotification('Failed to sync quotes.', true);
  }
}

// Initialize app and event listeners
function init() {
  loadQuotes();
  updateCategoryFilterOptions();
  createAddQuoteForm();
  loadLastQuote();

  newQuoteButton.addEventListener("click", showRandomQuote);
  categoryFilter.addEventListener("change", showRandomQuote);

  // Initial sync + periodic every 5 minutes
  syncQuotes();
  setInterval(syncQuotes, 5 * 60 * 1000);
}

init();
