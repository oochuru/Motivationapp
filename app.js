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

// Add this to your existing JavaScript file
// This will enable browser notifications for your web app

class NotificationManager {
    constructor() {
        this.quotes = [
            "Time to shine! Your shift starts in 1 hour. You've got this! 💪",
            "Ready to conquer the day? Your work starts soon - stay motivated! ⭐",
            "One hour until showtime! Remember: you're capable of amazing things! 🌟",
            "Almost time to make things happen! Your shift is coming up! 🚀",
            "Gear up for greatness! Your work starts in an hour! ⚡"
        ];
    }

    // Request permission for notifications
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
                return true;
            } else {
                alert('Please enable notifications to get motivated before your shifts!');
                return false;
            }
        } else {
            alert('Your browser does not support notifications');
            return false;
        }
    }

    // Schedule a notification
    scheduleNotification(activityName, dayOfWeek, time) {
        const [hours, minutes] = time.split(':');
        const notificationTime = new Date();
        
        // Calculate next occurrence of this day and time
        const targetDay = this.getDayNumber(dayOfWeek);
        const currentDay = notificationTime.getDay();
        
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget < 0) {
            daysUntilTarget += 7; // Next week
        }
        
        notificationTime.setDate(notificationTime.getDate() + daysUntilTarget);
        notificationTime.setHours(parseInt(hours) - 1, parseInt(minutes), 0, 0); // 1 hour before
        
        // If the time has passed today, schedule for next week
        if (notificationTime <= new Date()) {
            notificationTime.setDate(notificationTime.getDate() + 7);
        }
        
        const timeUntilNotification = notificationTime.getTime() - new Date().getTime();
        
        if (timeUntilNotification > 0) {
            setTimeout(() => {
                this.showNotification(activityName);
                // Schedule the next week's notification
                this.scheduleNotification(activityName, dayOfWeek, time);
            }, timeUntilNotification);
            
            console.log(`Notification scheduled for ${notificationTime.toLocaleString()}`);
            return true;
        }
        return false;
    }

    // Show the actual notification
    showNotification(activityName) {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const notification = new Notification(`${activityName} starts soon!`, {
            body: randomQuote,
            icon: '/favicon.ico', // Add your app icon
            tag: 'motivation-reminder',
            requireInteraction: true
        });

        // Close notification after 10 seconds
        setTimeout(() => notification.close(), 10000);
        
        // Optional: Play a sound (you'd need to add an audio file)
        // const audio = new Audio('/notification-sound.mp3');
        // audio.play().catch(e => console.log('Could not play sound'));
    }

    getDayNumber(dayName) {
        const days = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        return days[dayName] || 0;
    }
}

// Initialize the notification manager
const notificationManager = new NotificationManager();

// Modify your existing "Add to Schedule" function
function addToScheduleWithNotifications() {
    // Your existing schedule adding logic here...
    const activityName = document.getElementById('activity-name').value;
    const selectedDay = document.getElementById('day-select').value;
    const selectedTime = document.getElementById('time-input').value;
    
    if (activityName && selectedDay && selectedTime) {
        // Add to your existing schedule display
        addToScheduleDisplay(activityName, selectedDay, selectedTime);
        
        // NEW: Schedule the notification
        notificationManager.requestPermission().then(granted => {
            if (granted) {
                notificationManager.scheduleNotification(activityName, selectedDay, selectedTime);
                alert(`✅ Schedule saved! You'll get a motivational reminder 1 hour before ${activityName} on ${selectedDay} at ${selectedTime}`);
            }
        });
        
        // Save to localStorage for persistence
        saveScheduleToStorage(activityName, selectedDay, selectedTime);
    }
}

// Load saved schedules when page loads
function loadSchedulesAndSetNotifications() {
    const savedSchedules = JSON.parse(localStorage.getItem('userSchedules') || '[]');
    
    savedSchedules.forEach(schedule => {
        // Restore the schedule display
        addToScheduleDisplay(schedule.activity, schedule.day, schedule.time);
        
        // Reschedule notifications
        notificationManager.scheduleNotification(schedule.activity, schedule.day, schedule.time);
    });
    
    if (savedSchedules.length > 0) {
        notificationManager.requestPermission();
    }
}

function saveScheduleToStorage(activity, day, time) {
    const savedSchedules = JSON.parse(localStorage.getItem('userSchedules') || '[]');
    savedSchedules.push({ activity, day, time, id: Date.now() });
    localStorage.setItem('userSchedules', JSON.stringify(savedSchedules));
}

// Call this when your page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSchedulesAndSetNotifications();
});

// Add this CSS for better notification styling (add to your CSS file)
const notificationStyles = `
.notification-permission-banner {
    background: linear-gradient(45deg, #ff6b6b, #ff8e53);
    color: white;
    padding: 15px;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.notification-permission-banner button {
    background: white;
    color: #ff6b6b;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    margin-left: 10px;
    cursor: pointer;
    font-weight: bold;
}

.schedule-item {
    position: relative;
}

.schedule-item.has-notification::after {
    content: "🔔";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
`;

// Inject the styles
const styleSheet = document.createElement("style");
styleSheet.innerText = notificationStyles;
document.head.appendChild(styleSheet);

class NotificationTester {
    constructor() {
        this.testQuotes = [
            "🚀 Test notification working! Your motivation app is ready!",
            "💪 Notifications are live! Time to stay motivated!",
            "⭐ Success! Your app will keep you motivated before every shift!"
        ];
    }

    async testNotificationNow() {
        console.log("Testing notifications...");
        
        // Check if notifications are supported
        if (!("Notification" in window)) {
            alert("❌ Your browser doesn't support notifications. Try Chrome or Safari.");
            return false;
        }

        // Check current permission status
        console.log("Current permission:", Notification.permission);
        
        if (Notification.permission === "granted") {
            this.showTestNotification();
            return true;
        } else if (Notification.permission === "default") {
            // Request permission
            const permission = await Notification.requestPermission();
            console.log("Permission result:", permission);
            
            if (permission === "granted") {
                this.showTestNotification();
                return true;
            } else {
                alert("❌ Please allow notifications to use this feature!");
                return false;
            }
        } else {
            alert("❌ Notifications are blocked. Please enable them in your browser settings.");
            return false;
        }
    }

    showTestNotification() {
        const quote = this.testQuotes[Math.floor(Math.random() * this.testQuotes.length)];
        
        const notification = new Notification("🎉 Motivation App Test", {
            body: quote,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E💪%3C/text%3E%3C/svg%3E",
            tag: "motivation-test",
            requireInteraction: false,
            badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E⭐%3C/text%3E%3C/svg%3E"
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Log success
        console.log("✅ Test notification sent!");
        alert("✅ Test notification sent! Check if you saw it.");
        
        return notification;
    }

    // Test scheduling a notification for 10 seconds from now
    testScheduledNotification() {
        if (Notification.permission !== "granted") {
            alert("Please allow notifications first!");
            return;
        }

        console.log("Scheduling test notification for 10 seconds from now...");
        
        setTimeout(() => {
            const notification = new Notification("⏰ Scheduled Test", {
                body: "This notification was scheduled 10 seconds ago! Your app timing works perfectly.",
                icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E⏰%3C/text%3E%3C/svg%3E",
                tag: "scheduled-test"
            });
            
            setTimeout(() => notification.close(), 8000);
        }, 10000);
        
        alert("⏰ Scheduled a test notification for 10 seconds from now!");
    }
}

// Create tester instance
const notificationTester = new NotificationTester();


// Specialized parser for IN-N-OUT style schedules
class INOutScheduleParser {
    constructor() {
        this.dayMap = {
            'MON': 'Monday',
            'TUE': 'Tuesday', 
            'WED': 'Wednesday',
            'THU': 'Thursday',
            'FRI': 'Friday',
            'SAT': 'Saturday',
            'SUN': 'Sunday'
        };
    }

    parseINOutEmail(emailText) {
        const schedules = [];
        const lines = emailText.split('\n');
        
        let currentWeek = null;
        let associateName = null;
        
        // Extract associate name and week info
        lines.forEach(line => {
            const weekMatch = line.match(/Week Of:\s*(\d{2}\/\d{2}\/\d{2})/);
            if (weekMatch) {
                currentWeek = weekMatch[1];
            }
            
            const nameMatch = line.match(/Associate:\s*\d+\s*-\s*(.+)/);
            if (nameMatch) {
                associateName = nameMatch[1].trim();
            }
        });

        // Parse each day's schedule
        lines.forEach((line, index) => {
            // Look for day patterns like "MON:", "TUE:", etc.
            const dayMatch = line.match(/^(MON|TUE|WED|THU|FRI|SAT|SUN):/);
            
            if (dayMatch) {
                const dayAbbr = dayMatch[1];
                const dayName = this.dayMap[dayAbbr];
                
                // Look for the time on the same line or next line
                let timeInfo = this.extractTimeFromLine(line);
                
                // If no time on current line, check next line
                if (!timeInfo && index + 1 < lines.length) {
                    timeInfo = this.extractTimeFromLine(lines[index + 1]);
                }
                
                if (timeInfo && timeInfo !== 'OFF') {
                    const schedule = {
                        day: dayName,
                        timeRange: timeInfo,
                        startTime: this.parseStartTime(timeInfo),
                        endTime: this.parseEndTime(timeInfo),
                        week: currentWeek,
                        associate: associateName,
                        rawLine: line
                    };
                    
                    schedules.push(schedule);
                }
            }
        });
        
        return schedules;
    }
    
    extractTimeFromLine(line) {
        // Look for time patterns like "08:30pm-02:00am" or "03:30pm-09:15pm"
        const timeMatch = line.match(/(\d{1,2}:\d{2}[ap]m)-(\d{1,2}:\d{2}[ap]m)/i);
        if (timeMatch) {
            return timeMatch[0]; // Return the full time range
        }
        
        // Check for "OFF" 
        if (line.includes('OFF')) {
            return 'OFF';
        }
        
        return null;
    }
    
    parseStartTime(timeRange) {
        if (!timeRange || timeRange === 'OFF') return null;
        
        const startTime = timeRange.split('-')[0];
        return this.convertTo24Hour(startTime);
    }
    
    parseEndTime(timeRange) {
        if (!timeRange || timeRange === 'OFF') return null;
        
        const endTime = timeRange.split('-')[1];
        return this.convertTo24Hour(endTime);
    }
    
    convertTo24Hour(timeStr) {
        const match = timeStr.match(/(\d{1,2}):(\d{2})([ap]m)/i);
        if (!match) return timeStr;
        
        let hour = parseInt(match[1]);
        const minute = match[2];
        const ampm = match[3].toLowerCase();
        
        if (ampm === 'pm' && hour !== 12) {
            hour += 12;
        } else if (ampm === 'am' && hour === 12) {
            hour = 0;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    
    // Calculate notification time (1 hour before shift)
    calculateNotificationTime(startTime) {
        if (!startTime) return null;
        
        const [hour, minute] = startTime.split(':').map(Number);
        let notificationHour = hour - 1;
        
        // Handle midnight rollover
        if (notificationHour < 0) {
            notificationHour = 23;
        }
        
        return `${notificationHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
}

// Enhanced UI for the IN-N-OUT parser
function createINOutParserUI() {
    return `
        <div id="inout-parser-section" style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #ff6b6b, #ff8e53); border-radius: 12px; color: white;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center;">
                🍔 IN-N-OUT Schedule Parser
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 20px; font-size: 12px; margin-left: 10px;">SMART</span>
            </h3>
            
            <p style="margin-bottom: 15px; opacity: 0.9;">
                Copy your entire IN-N-OUT schedule email and paste it below. I'll automatically extract all your work times!
            </p>
            
            <textarea 
                id="inout-email-input" 
                placeholder="Paste your full IN-N-OUT schedule email here..."
                style="width: 100%; height: 150px; padding: 15px; border-radius: 8px; border: none; background: rgba(255,255,255,0.9); color: #333; resize: vertical; font-family: monospace; font-size: 14px;"
            ></textarea>
            
            <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button 
                    onclick="parseINOutSchedule()" 
                    style="background: white; color: #ff6b6b; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; flex: 1; min-width: 150px;"
                >
                    🔍 Parse Schedule
                </button>
                
                <button 
                    onclick="pasteExampleSchedule()" 
                    style="background: rgba(255,255,255,0.2); color: white; padding: 12px 16px; border: 1px solid white; border-radius: 8px; cursor: pointer; font-weight: bold;"
                >
                    📝 Try Example
                </button>
            </div>
            
            <div id="inout-parsing-results" style="margin-top: 20px;"></div>
        </div>
    `;
}

// Function to parse the IN-N-OUT schedule
function parseINOutSchedule() {
    const emailText = document.getElementById('inout-email-input').value;
    const resultsDiv = document.getElementById('inout-parsing-results');
    
    if (!emailText.trim()) {
        resultsDiv.innerHTML = '<p style="color: rgba(255,255,255,0.8);">Please paste your schedule email first!</p>';
        return;
    }
    
    const parser = new INOutScheduleParser();
    const schedules = parser.parseINOutEmail(emailText);
    
    if (schedules.length === 0) {
        resultsDiv.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);">
                <p>🤔 No schedules found. Make sure you copied the full email with lines like:</p>
                <code style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px; display: block; margin-top: 5px;">
                MON:<br>
                07/07 &nbsp;&nbsp;&nbsp;&nbsp; 08:30pm-02:00am
                </code>
            </div>
        `;
        return;
    }
    
    let resultsHTML = `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);">
            <h4 style="margin-bottom: 15px; color: white;">✅ Found ${schedules.length} work shifts:</h4>
    `;
    
    schedules.forEach((schedule, index) => {
        const notificationTime = parser.calculateNotificationTime(schedule.startTime);
        
        resultsHTML += `
            <div style="background: rgba(255,255,255,0.1); padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>${schedule.day}</strong>
                    <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                        ${schedule.timeRange}
                    </span>
                </div>
                
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">
                    🕐 Work: ${schedule.startTime} - ${schedule.endTime}<br>
                    🔔 Notification: ${notificationTime} (1 hour before)
                </div>
                
                <button 
                    onclick="addINOutSchedule('${schedule.day}', '${schedule.startTime}', '${schedule.timeRange}')"
                    style="background: white; color: #ff6b6b; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;"
                >
                    ➕ Add to Schedule
                </button>
            </div>
        `;
    });
    
    resultsHTML += `
        <div style="margin-top: 15px; text-align: center;">
            <button 
                onclick="addAllINOutSchedules(${JSON.stringify(schedules).replace(/"/g, '&quot;')})"
                style="background: white; color: #ff6b6b; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;"
            >
                ⚡ Add All Shifts
            </button>
        </div>
    </div>`;
    
    resultsDiv.innerHTML = resultsHTML;
}

// Function to add a single IN-N-OUT schedule
function addINOutSchedule(day, startTime, timeRange) {
    // Use your existing schedule adding logic
    document.getElementById('activity-name').value = `IN-N-OUT Shift (${timeRange})`;
    document.getElementById('day-select').value = day;
    document.getElementById('time-input').value = startTime;
    
    // Add to schedule with notifications
    addToScheduleWithNotifications();
}

// Function to add all schedules at once
function addAllINOutSchedules(schedules) {
    schedules.forEach(schedule => {
        addINOutSchedule(schedule.day, schedule.startTime, schedule.timeRange);
    });
    
    alert(`✅ Added ${schedules.length} shifts to your schedule with notifications!`);
}

// Function to paste example schedule for testing
function pasteExampleSchedule() {
    const exampleEmail = `Your manager has published the schedule for the week of 07/07/25 - 07/13/25:

Associate: 183972 - Ochuru Ochuru

Week Of: 07/07-07/13

MON:
07/07     08:30pm-02:00am

TUE:
07/08     03:30pm-09:15pm

WED:
07/09     OFF

THU:
07/10     OFF

FRI:
07/11     09:00pm-02:30am

SAT:
07/12     OFF`;
    
    document.getElementById('inout-email-input').value = exampleEmail;
    alert('📝 Example schedule pasted! Now click "Parse Schedule" to see the magic!');
}


class GmailScheduleIntegration {
    constructor() {
        this.API_KEY = 'AIzaSyBDfbTss2Q08iJR-5uy9i2ZS1L2J6z1UZM'; // You'll need to get this from Google Cloud Console
        this.CLIENT_ID = '241024677126-kog16pe0325428vpqj5sdpu7tfbso7oo.apps.googleusercontent.com'; // You'll need to get this from Google Cloud Console
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
        
        this.isSignedIn = false;
        this.scheduleKeywords = ['schedule', 'shift', 'work hours', 'roster', 'rota', 'timetable'];
        this.senders = ['no.reply@innout.com', 'store222@innout.com', 'schedule@', 'noreply@'];
    }

    async initialize() {
        try {
            await new Promise((resolve) => {
                gapi.load('api:auth2', resolve);
            });

            await gapi.api.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: [this.DISCOVERY_DOC],
                scope: this.SCOPES
            });

            const authInstance = gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();
            
            this.updateSignInStatus();
            
            // Listen for sign-in state changes
            authInstance.isSignedIn.listen(this.updateSignInStatus.bind(this));
            
            return true;
        } catch (error) {
            console.error('Gmail API initialization failed:', error);
            this.showError('Failed to initialize Gmail connection. Please try again.');
            return false;
        }
    }

    updateSignInStatus() {
        const authInstance = gapi.auth2.getAuthInstance();
        this.isSignedIn = authInstance.isSignedIn.get();
        
        if (this.isSignedIn) {
            this.showSuccess('✅ Connected to Gmail!');
            this.updateEmailUI(true);
            this.startAutoScheduleDetection();
        } else {
            this.updateEmailUI(false);
        }
    }

    async signIn() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signIn();
        } catch (error) {
            console.error('Sign-in failed:', error);
            this.showError('Gmail sign-in failed. Please try again.');
        }
    }

    async signOut() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            this.showSuccess('Disconnected from Gmail');
        } catch (error) {
            console.error('Sign-out failed:', error);
        }
    }

    async searchScheduleEmails() {
        if (!this.isSignedIn) {
            this.showError('Please connect to Gmail first');
            return [];
        }

        try {
            this.showProgress('🔍 Searching for schedule emails...');
            
            // Build search query for schedule-related emails
            const queries = [
                'from:(no.reply@innout.com OR store222@innout.com OR noreply@innout.com)',
                'subject:(schedule OR shift OR "work hours" OR roster)',
                'newer_than:30d' // Only look at emails from last 30 days
            ];
            
            const searchQuery = queries.join(' ');
            
            const response = await gapi.client.gmail.users.messages.list({
                userId: 'me',
                q: searchQuery,
                maxResults: 20
            });

            const messages = response.result.messages || [];
            this.showProgress(`📧 Found ${messages.length} potential schedule emails`);
            
            const scheduleEmails = [];
            
            // Get detailed information for each message
            for (const message of messages.slice(0, 10)) { // Limit to 10 most recent
                try {
                    const messageDetail = await gapi.client.gmail.users.messages.get({
                        userId: 'me',
                        id: message.id,
                        format: 'full'
                    });
                    
                    const emailData = this.parseEmailData(messageDetail.result);
                    if (emailData) {
                        scheduleEmails.push(emailData);
                    }
                } catch (error) {
                    console.warn('Failed to fetch message:', message.id, error);
                }
            }
            
            this.showSuccess(`✅ Found ${scheduleEmails.length} schedule emails!`);
            return scheduleEmails;
            
        } catch (error) {
            console.error('Email search failed:', error);
            this.showError('Failed to search emails. Please check your connection.');
            return [];
        }
    }

    parseEmailData(message) {
        try {
            const headers = message.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || '';
            const from = headers.find(h => h.name === 'From')?.value || '';
            const date = headers.find(h => h.name === 'Date')?.value || '';
            
            // Extract email body
            let body = '';
            if (message.payload.body && message.payload.body.data) {
                body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (message.payload.parts) {
                // Handle multipart messages
                for (const part of message.payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body.data) {
                        body += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                }
            }
            
            // Check if this looks like a schedule email
            const isScheduleEmail = this.scheduleKeywords.some(keyword => 
                subject.toLowerCase().includes(keyword) || 
                body.toLowerCase().includes(keyword)
            );
            
            if (!isScheduleEmail) {
                return null;
            }
            
            // Parse schedule from email body
            const schedules = this.parseScheduleFromText(body);
            
            if (schedules.length === 0) {
                return null;
            }
            
            return {
                id: message.id,
                subject: subject,
                from: from,
                date: new Date(date),
                body: body,
                schedules: schedules
            };
            
        } catch (error) {
            console.warn('Failed to parse email:', error);
            return null;
        }
    }

    parseScheduleFromText(text) {
        const schedules = [];
        const lines = text.split('\n');
        
        // Enhanced regex patterns for different schedule formats
        const patterns = {
            // IN-N-OUT format: "MON:\n07/07     08:30pm-02:00am"
            innout: /^(MON|TUE|WED|THU|FRI|SAT|SUN):/,
            // Time ranges: "08:30pm-02:00am" or "8:30 AM - 2:00 PM"
            timeRange: /(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/g,
            // Days: Monday, Tuesday, etc.
            days: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/gi,
            // Dates: 07/07, 12/25, etc.
            dates: /\d{1,2}\/\d{1,2}/g
        };
        
        const dayMap = {
            'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday', 'thu': 'Thursday',
            'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday',
            'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday',
            'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday'
        };
        
        let currentDay = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for day headers (IN-N-OUT style)
            const dayMatch = line.match(patterns.innout);
            if (dayMatch) {
                currentDay = dayMap[dayMatch[1].toLowerCase()];
                
                // Check next line for time
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    const timeMatches = [...nextLine.matchAll(patterns.timeRange)];
                    
                    timeMatches.forEach(match => {
                        const schedule = this.parseTimeRange(match[0], currentDay);
                        if (schedule) {
                            schedules.push(schedule);
                        }
                    });
                }
                continue;
            }
            
            // Look for time ranges in current line
            const timeMatches = [...line.matchAll(patterns.timeRange)];
            if (timeMatches.length > 0) {
                // Try to find day in same line or nearby lines
                let dayForTime = currentDay;
                
                const dayMatches = [...line.matchAll(patterns.days)];
                if (dayMatches.length > 0) {
                    dayForTime = dayMap[dayMatches[0][1].toLowerCase()];
                }
                
                timeMatches.forEach(match => {
                    const schedule = this.parseTimeRange(match[0], dayForTime || 'Monday');
                    if (schedule) {
                        schedules.push(schedule);
                    }
                });
            }
        }
        
        return schedules;
    }

    parseTimeRange(timeRangeStr, day) {
        try {
            const parts = timeRangeStr.split(/[-–]/);
            if (parts.length !== 2) return null;
            
            const startTime = this.parseTime(parts[0].trim());
            const endTime = this.parseTime(parts[1].trim());
            
            if (!startTime || !endTime) return null;
            
            return {
                day: day,
                startTime: startTime,
                endTime: endTime,
                timeRange: timeRangeStr,
                activity: 'Work Shift'
            };
        } catch (error) {
            console.warn('Failed to parse time range:', timeRangeStr, error);
            return null;
        }
    }

    parseTime(timeStr) {
        const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/);
        if (!match) return null;
        
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3] ? match[3].toLowerCase() : null;
        
        // Convert to 24-hour format
        if (ampm === 'pm' && hour !== 12) {
            hour += 12;
        } else if (ampm === 'am' && hour === 12) {
            hour = 0;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    async startAutoScheduleDetection() {
        this.showProgress('🔄 Starting automatic schedule detection...');
        
        const scheduleEmails = await this.searchScheduleEmails();
        
        if (scheduleEmails.length === 0) {
            this.showInfo('📫 No new schedule emails found. I\'ll keep checking for you!');
            return;
        }
        
        // Process the most recent schedule email
        const latestEmail = scheduleEmails[0];
        this.displayFoundSchedules(latestEmail);
        
        // Set up periodic checking (every 30 minutes)
        setInterval(() => {
            this.checkForNewSchedules();
        }, 30 * 60 * 1000);
    }

    async checkForNewSchedules() {
        try {
            const scheduleEmails = await this.searchScheduleEmails();
            const lastChecked = localStorage.getItem('lastScheduleCheck');
            const now = new Date().toISOString();
            
            if (lastChecked) {
                const newEmails = scheduleEmails.filter(email => 
                    email.date > new Date(lastChecked)
                );
                
                if (newEmails.length > 0) {
                    this.showSuccess(`📬 Found ${newEmails.length} new schedule emails!`);
                    this.displayFoundSchedules(newEmails[0]);
                }
            }
            
            localStorage.setItem('lastScheduleCheck', now);
        } catch (error) {
            console.warn('Periodic schedule check failed:', error);
        }
    }

    displayFoundSchedules(emailData) {
        const schedules = emailData.schedules;
        
        if (schedules.length === 0) {
            this.showInfo('📧 Email found but no schedules detected');
            return;
        }
        
        // Update the email screen with found schedules
        const emailScreen = document.getElementById('email-screen');
        const resultsContainer = emailScreen.querySelector('.schedule-form') || emailScreen;
        
        const resultsHTML = `
            <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">✅ Schedules Found!</h3>
                <p style="color: #a0a0a0; margin-bottom: 15px;">
                    From: ${emailData.subject}<br>
                    Date: ${emailData.date.toLocaleDateString()}
                </p>
                
                <div style="margin-bottom: 20px;">
                    ${schedules.map((schedule, index) => `
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #4CAF50;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${schedule.day}</strong><br>
                                    <span style="color: #4CAF50;">${schedule.timeRange}</span>
                                </div>
                                <button onclick="addAutoSchedule('${schedule.day}', '${schedule.startTime}', '${schedule.activity} (${schedule.timeRange})')"
                                        style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                    ➕ Add
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="addAllAutoSchedules(${JSON.stringify(schedules).replace(/"/g, '&quot;')})"
                        style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%;">
                    ⚡ Add All Schedules
                </button>
            </div>
        `;
        
        // Insert results after the form
        const existingResults = emailScreen.querySelector('.auto-schedule-results');
        if (existingResults) {
            existingResults.innerHTML = resultsHTML;
        } else {
            const resultsDiv = document.createElement('div');
            resultsDiv.className = 'auto-schedule-results';
            resultsDiv.innerHTML = resultsHTML;
            resultsContainer.appendChild(resultsDiv);
        }
    }

    updateEmailUI(isConnected) {
        const emailScreen = document.getElementById('email-screen');
        const formContainer = emailScreen.querySelector('.schedule-form');
        
        if (isConnected) {
            formContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                    <h3 style="color: #4CAF50; margin-bottom: 10px;">Gmail Connected!</h3>
                    <p style="color: #a0a0a0; margin-bottom: 20px;">
                        Automatically checking for schedule emails...
                    </p>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="gmailIntegration.searchScheduleEmails().then(emails => { if(emails.length > 0) gmailIntegration.displayFoundSchedules(emails[0]); })"
                            style="background: #4CAF50; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; flex: 1;">
                        🔍 Search Now
                    </button>
                    <button onclick="gmailIntegration.signOut()"
                            style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); color: white; padding: 12px 20px; border-radius: 8px; cursor: pointer;">
                        Disconnect
                    </button>
                </div>
            `;
        } else {
            formContainer.innerHTML = `
                <h3 style="color: #ff8e53; margin-bottom: 20px;">📧 Connect Your Gmail</h3>
                <p style="color: #a0a0a0; margin-bottom: 20px; line-height: 1.5;">
                    Connect your Gmail account to automatically detect and import work schedules from emails.
                </p>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.2); margin-bottom: 20px;">
                    <h4 style="color: #4CAF50; margin-bottom: 10px;">✨ What This Does:</h4>
                    <ul style="color: #a0a0a0; padding-left: 20px; line-height: 1.6;">
                        <li>Searches for schedule emails automatically</li>
                        <li>Extracts work times and days</li>
                        <li>Sets up notifications instantly</li>
                        <li>Works with IN-N-OUT and other formats</li>
                    </ul>
                </div>
                
                <button onclick="gmailIntegration.signIn()"
                        style="background: linear-gradient(135deg, #ea4335, #fbbc04); color: white; border: none; padding: 16px 24px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; box-shadow: 0 4px 20px rgba(234, 67, 53, 0.3);">
                    <span style="margin-right: 8px;">📧</span>
                    Connect Gmail Account
                </button>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.2); margin-top: 20px;">
                    <h4 style="color: #ff6b6b; margin-bottom: 8px;">🔒 Privacy & Security</h4>
                    <p style="color: #a0a0a0; font-size: 14px; line-height: 1.4;">
                        We only read emails to find your work schedules. No personal data is stored or shared. You can disconnect anytime.
                    </p>
                </div>
            `;
        }
    }

    // Utility methods for user feedback
    showSuccess(message) {
        this.showToast(message, '#4CAF50');
    }

    showError(message) {
        this.showToast(message, '#f44336');
    }

    showInfo(message) {
        this.showToast(message, '#2196F3');
    }

    showProgress(message) {
        this.showToast(message, '#ff8e53');
    }

    showToast(message, color = '#ff6b6b') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.5s ease;
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.5s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 4000);
    }
}

// Global functions for the UI
window.addAutoSchedule = function(day, startTime, activity) {
    // Add the schedule item using existing function
    const scheduleItem = {
        id: Date.now(),
        activity: activity,
        day: day,
        time: startTime,
        notifications: true,
        source: 'email'
    };
    
    scheduleItems.push(scheduleItem);
    localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems));
    
    scheduleNotification(scheduleItem);
    showToast(`✅ ${activity} added for ${day} at ${startTime}!`);
};

window.addAllAutoSchedules = function(schedules) {
    schedules.forEach(schedule => {
        addAutoSchedule(schedule.day, schedule.startTime, schedule.activity + ' (' + schedule.timeRange + ')');
    });
    
    showToast(`🎉 Added ${schedules.length} schedules with notifications!`);
    
    // Switch to schedule screen to show the results
    setTimeout(() => {
        showScreen('schedule-screen');
    }, 1500);
};

// Initialize Gmail integration
const gmailIntegration = new GmailScheduleIntegration();

// Auto-initialize when Gmail API loads
window.gapiLoaded = function() {
    gmailIntegration.initialize();
};
