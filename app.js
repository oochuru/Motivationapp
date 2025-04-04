// Quotes data - will be populated from JSON
let quotes = [];

// App state
let state = {
    savedQuotes: [],
    schedule: [],
    currentQuote: null
};

// Load quotes from JSON file
async function loadQuotes() {
    try {
        console.log('Attempting to load quotes...');
        const response = await fetch('quotes.json');
        console.log('Fetch response:', response);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Quotes loaded successfully:', data.length + ' quotes');
        quotes = data;
        return data;
    } catch (error) {
        console.error('Error loading quotes:', error);
        // Return a fallback quote if loading fails
        return [{ 
            quoteText: "Failed to load quotes. Please try again later.", 
            quoteAuthor: "System" 
        }];
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded, initializing app...');
    
    // Load saved data from localStorage
    loadFromLocalStorage();
    
    // Load quotes
    quotes = await loadQuotes();
    
    // Set up event listeners
    setupEventListeners();
    
    // Display a random quote on startup
    displayRandomQuote();
    
    // Set up schedule form
    setupScheduleForm();
    
    // Render schedule list if the element exists
    if (document.getElementById('schedule-list')) {
        renderScheduleList();
    }
});

// Load data from localStorage
function loadFromLocalStorage() {
    console.log('Loading data from localStorage...');
    
    const savedQuotes = localStorage.getItem('savedQuotes');
    if (savedQuotes) {
        state.savedQuotes = JSON.parse(savedQuotes);
        console.log('Loaded saved quotes:', state.savedQuotes.length);
    } else {
        state.savedQuotes = [];
    }
    
    const schedule = localStorage.getItem('schedule');
    if (schedule) {
        state.schedule = JSON.parse(schedule);
        console.log('Loaded schedule items:', state.schedule.length);
    } else {
        state.schedule = [];
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('savedQuotes', JSON.stringify(state.savedQuotes));
    localStorage.setItem('schedule', JSON.stringify(state.schedule));
}

// Display a random quote
function displayRandomQuote() {
    console.log('Displaying random quote...');
    
    if (quotes.length === 0) {
        console.error('No quotes available to display');
        return;
    }

    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    state.currentQuote = quotes[randomIndex];
    
    console.log('Selected quote:', state.currentQuote);
    
    // Update UI
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    
    if (quoteText && quoteAuthor) {
        quoteText.textContent = `"${state.currentQuote.quoteText}"`;
        quoteAuthor.textContent = `- ${state.currentQuote.quoteAuthor}`;
        
        // Update save button state
        updateSaveButtonState();
    } else {
        console.error('Quote display elements not found in the DOM');
    }
}

// Update save button state
function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-quote-btn');
    if (!saveBtn || !state.currentQuote) return;
    
    const isSaved = state.savedQuotes.some(quote => 
        quote.quoteText === state.currentQuote.quoteText && 
        quote.quoteAuthor === state.currentQuote.quoteAuthor
    );
    
    saveBtn.textContent = isSaved ? 'Saved!' : 'Save Quote';
    saveBtn.classList.toggle('saved', isSaved);
}

// Toggle save quote function
function toggleSaveQuote() {
    console.log('Toggle save quote...');
    
    if (!state.currentQuote) {
        console.error('No current quote to save');
        return;
    }
    
    // Check if this quote is already saved
    const isSaved = state.savedQuotes.some(quote => 
        quote.quoteText === state.currentQuote.quoteText && 
        quote.quoteAuthor === state.currentQuote.quoteAuthor
    );
    
    if (isSaved) {
        // Remove from saved quotes
        state.savedQuotes = state.savedQuotes.filter(quote => 
            !(quote.quoteText === state.currentQuote.quoteText && 
              quote.quoteAuthor === state.currentQuote.quoteAuthor)
        );
        
        console.log('Quote removed from favorites');
    } else {
        // Add to saved quotes
        state.savedQuotes.push({...state.currentQuote});
        console.log('Quote added to favorites');
    }
    
    // Update button state
    updateSaveButtonState();
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Show feedback to user
    showToast(isSaved ? 'Quote removed from favorites' : 'Quote saved to favorites');
    
    // Update favorites section if it exists
    const favoritesSection = document.getElementById('favorites-section');
    if (favoritesSection && favoritesSection.classList.contains('active')) {
        renderSavedQuotes();
    }
}

// Render saved quotes
function renderSavedQuotes() {
    console.log('Rendering saved quotes...');
    
    const container = document.getElementById('favorites-container');
    if (!container) {
        console.error('Favorites container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (state.savedQuotes.length === 0) {
        container.innerHTML = '<p class="empty-message">No saved quotes yet. Click "Save Quote" on quotes you like!</p>';
        return;
    }
    
    state.savedQuotes.forEach(quote => {
        const quoteEl = document.createElement('div');
        quoteEl.className = 'quote-container';
        quoteEl.innerHTML = `
            <p class="quote-text">"${quote.quoteText}"</p>
            <p class="quote-author">- ${quote.quoteAuthor}</p>
            <div class="quote-actions">
                <button class="remove-quote-btn" data-text="${quote.quoteText}">Remove</button>
            </div>
        `;
        
        container.appendChild(quoteEl);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-quote-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteText = this.getAttribute('data-text');
            
            // Remove from saved quotes
            state.savedQuotes = state.savedQuotes.filter(quote => quote.quoteText !== quoteText);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Re-render saved quotes
            renderSavedQuotes();
            
            // Update current quote's save button if it's displayed
            updateSaveButtonState();
            
            // Show feedback
            showToast('Quote removed from favorites');
        });
    });
}

// Setup schedule form
function setupScheduleForm() {
    console.log('Setting up schedule form...');
    
    const scheduleForm = document.getElementById('schedule-form');
    if (!scheduleForm) {
        // Try with the original ID that had a space
        const altForm = document.getElementById('schedule form');
        if (altForm) {
            console.log('Found schedule form with space in ID');
            altForm.id = 'schedule-form';  // Fix the ID
            setupScheduleForm();  // Recursively call to set up the fixed form
            return;
        }
        
        console.error('Schedule form not found! Check your HTML ID.');
        return;
    }
    
    console.log('Schedule form found, adding event listener');
    
    scheduleForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Form submitted!');
        
        const activityName = document.getElementById('activity-name').value.trim();
        const activityDay = document.getElementById('activity-day').value;
        const activityTime = document.getElementById('activity-time').value;
        
        console.log('Form values:', { activityName, activityDay, activityTime });
        
        if (!activityName || !activityDay || !activityTime) {
            console.log('Missing values in form');
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // Create a unique ID for the activity
        const id = Date.now().toString();
        
        // Add to schedule
        const newActivity = {
            id,
            name: activityName,
            day: activityDay,
            time: activityTime
        };
        
        console.log('Adding activity:', newActivity);
        
        // Update state
        if (!state.schedule) {
            state.schedule = [];
        }
        
        state.schedule.push(newActivity);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Reset form
        scheduleForm.reset();
        
        // Render the updated list
        renderScheduleList();
        
        // Show toast notification
        showToast('Activity added to schedule');
    });
}

// Render schedule list
function renderScheduleList() {
    console.log('Rendering schedule list...');
    
    const scheduleList = document.getElementById('schedule-list');
    if (!scheduleList) {
        console.error('Schedule list element not found!');
        return;
    }
    
    // Clear the current list
    scheduleList.innerHTML = '';
    
    // Get schedule from state
    const schedule = state.schedule || [];
    
    if (schedule.length === 0) {
        scheduleList.innerHTML = '<div class="empty-state"><p>No activities scheduled yet</p></div>';
        return;
    }
    
    // Sort schedule by day and time
    const sortedSchedule = [...schedule].sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        
        if (dayDiff !== 0) return dayDiff;
        
        return a.time.localeCompare(b.time);
    });
    
    // Create list items
    sortedSchedule.forEach(activity => {
        // Format time for display
        const timeDisplay = formatTimeForDisplay(activity.time);
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="schedule-info">
                <div class="schedule-activity">${activity.name}</div>
                <div class="schedule-time">${activity.day} • ${timeDisplay}</div>
            </div>
            <button class="delete-btn" data-id="${activity.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Add event listener to delete button
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteActivity(activity.id);
        });
        
        scheduleList.appendChild(li);
    });
}

// Delete activity from schedule
function deleteActivity(id) {
    console.log('Deleting activity:', id);
    
    // Remove activity
    state.schedule = state.schedule.filter(activity => activity.id !== id);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update UI
    renderScheduleList();
    
    // Show toast
    showToast('Activity removed from schedule');
}

// Format time for display (convert from 24h to 12h format)
function formatTimeForDisplay(time) {
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours, 10);
    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;
    
    return `${hours12}:${minutes} ${period}`;
}

// Show toast notification
function showToast(message, type = 'success') {
    console.log('Showing toast:', message, type);
    
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.app-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'app-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${type === 'success' ? 'Success' : 'Error'}</div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="notification-quote">${message}</p>
    `;
    
    // Show notification
    notification.style.display = 'block';
    
    // Add close button event listener
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.style.display = 'none';
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // New quote button
    const newQuoteBtn = document.getElementById('new-quote-btn');
    if (newQuoteBtn) {
        console.log('Adding new quote button listener');
        newQuoteBtn.addEventListener('click', displayRandomQuote);
    } else {
        console.error('New quote button not found');
    }
    
    // Save quote button
    const saveQuoteBtn = document.getElementById('save-quote-btn');
    if (saveQuoteBtn) {
        console.log('Adding save quote button listener');
        saveQuoteBtn.addEventListener('click', toggleSaveQuote);
    }
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-nav button');
    if (tabButtons.length > 0) {
        console.log('Setting up tab navigation');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update tab buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show selected section
                const tabId = button.dataset.tab;
                const sections = document.querySelectorAll('.section');
                
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                const activeSection = document.getElementById(`${tabId}-section`);
                if (activeSection) {
                    activeSection.classList.add('active');
                    
                    // If favorites tab is selected, render saved quotes
                    if (tabId === 'favorites') {
                        renderSavedQuotes();
                    }
                }
            });
        });
    }
}

// Check for service worker support and register it
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
