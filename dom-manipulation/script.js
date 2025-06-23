// script.js
// Initial quotes database
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Success" },
  { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" },
  { text: "The only thing we have to fear is fear itself.", category: "Courage" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryControls = document.getElementById('categoryControls');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteTextInput = document.getElementById('newQuoteText');
const quoteCategoryInput = document.getElementById('newQuoteCategory');

// Current state
let currentCategory = 'All';
let filteredQuotes = [...quotes];

// Initialize application
function init() {
  renderCategoryControls();
  showRandomQuote();
  setupEventListeners();
}

// Create category filter buttons dynamically
function renderCategoryControls() {
  // Clear existing buttons
  categoryControls.innerHTML = '';
  
  // Create 'All' button
  const allButton = createCategoryButton('All');
  categoryControls.appendChild(allButton);
  
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Create buttons for each category
  categories.forEach(category => {
    const button = createCategoryButton(category);
    categoryControls.appendChild(button);
  });
}

// Helper function to create a category button
function createCategoryButton(category) {
  const button = document.createElement('button');
  button.className = 'category-btn';
  button.textContent = category;
  button.dataset.category = category;
  
  if (category === currentCategory) {
    button.classList.add('active');
  }
  
  button.addEventListener('click', () => {
    // Update current category
    currentCategory = category;
    
    // Update filtered quotes
    filteredQuotes = category === 'All' 
      ? [...quotes] 
      : quotes.filter(q => q.category === category);
    
    // Update UI
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Show a random quote from the new category
    showRandomQuote();
  });
  
  return button;
}

// Display random quote with animation
function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p class="placeholder">No quotes found in this category</p>`;
    return;
  }
  
  // Remove any existing animation classes
  quoteDisplay.classList.remove('fade-in');
  
  // Force reflow to restart animation
  void quoteDisplay.offsetWidth;
  
  // Add animation class
  quoteDisplay.classList.add('fade-in');
  
  // Get random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  // Update display
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <span class="category">— ${quote.category}</span>
  `;
}

// Add new quote to the system
function addNewQuote() {
  const text = quoteTextInput.value.trim();
  const category = quoteCategoryInput.value.trim();
  
  // Validate inputs
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }
  
  // Create new quote object
  const newQuote = { text, category };
  
  // Update data
  quotes.push(newQuote);
  
  // Update filtered quotes if needed
  if (currentCategory === 'All' || currentCategory === category) {
    filteredQuotes.push(newQuote);
  }
  
  // Update UI
  renderCategoryControls();
  
  // Clear inputs
  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
  
  // Show success message
  showSuccessMessage('Quote added successfully!');
}

// Show temporary success message
function showSuccessMessage(message) {
  const successMsg = document.createElement('div');
  successMsg.textContent = message;
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--secondary-color);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  `;
  
  document.body.appendChild(successMsg);
  
  // Remove after animation
  setTimeout(() => {
    successMsg.remove();
  }, 3000);
}

// Set up event listeners
function setupEventListeners() {
  // New quote button
  newQuoteBtn.addEventListener('click', showRandomQuote);
  
  // Add quote button
  addQuoteBtn.addEventListener('click', addNewQuote);
  
  // Allow form submission with Enter key
  quoteTextInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addNewQuote();
  });
  
  quoteCategoryInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addNewQuote();
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
