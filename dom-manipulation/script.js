// Notification element setup (create if not present)
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

function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.background = isError ? "#f08080" : "#90ee90";
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Updated createAddQuoteForm function
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

  addBtn.addEventListener("click", async () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
      alert("Please enter both a quote and a category.");
      return;
    }

    // Add quote locally
    quotes.push({ text, category });
    saveQuotes();
    updateCategoryFilterOptions();
    showNotification("Quote added locally!");

    // Clear inputs
    quoteInput.value = "";
    categoryInput.value = "";

    // Post quote to server
    try {
      // Replace with your real API endpoint
      const response = await fetch("https://mockapi.example.com/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, category })
      });

      if (!response.ok) throw new Error("Failed to post quote");

      showNotification("Quote synced to server!");
    } catch (error) {
      console.error("Error posting quote:", error);
      showNotification("Failed to sync quote to server.", true);
    }
  });
}

// Sync function: fetch new quotes periodically and merge
async function syncQuotes() {
  try {
    const response = await fetch("https://mockapi.example.com/quotes");
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const serverQuotes = await response.json();
    if (!Array.isArray(serverQuotes)) throw new Error("Invalid server data");

    // Merge without duplicates (by text)
    const localTexts = new Set(quotes.map(q => q.text));
    const merged = [...quotes];

    serverQuotes.forEach(sq => {
      if (!localTexts.has(sq.text)) {
        merged.push(sq);
      }
    });

    if (merged.length !== quotes.length) {
      quotes = merged;
      saveQuotes();
      updateCategoryFilterOptions();
      showNotification("Quotes synced from server!");
    } else {
      showNotification("No new quotes from server.");
    }
  } catch (error) {
    console.error("Sync failed:", error);
    showNotification("Failed to sync quotes.", true);
  }
}

// Set up periodic sync (every 5 minutes)
setInterval(syncQuotes, 5 * 60 * 1000); // 5 mins

// Initial call to sync on load
syncQuotes();
