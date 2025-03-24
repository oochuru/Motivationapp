// Sample quotes to start with (later you can fetch from an API)
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Don't count the days, make the days count.",
        author: "Muhammad Ali"
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "Be the change that you wish to see in the world.",
        author: "Mahatma Gandhi"
    }
];

// Sample schedule
const schedule = [
    { name: "Math Class", day: "Monday", startTime: "9:00 AM", endTime: "10:30 AM" },
    { name: "Programming Lab", day: "Tuesday", startTime: "1:00 PM", endTime: "3:00 PM" },
    { name: "English", day: "Wednesday", startTime: "11:00 AM", endTime: "12:30 PM" },
    { name: "Work Shift", day: "Friday", startTime: "4:00 PM", endTime: "8:00 PM" }
];

// DOM elements
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote-btn');
const scheduleList = document.getElementById('schedule-list');

// Display a random quote
function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
}

// Display schedule
function displaySchedule() {
    scheduleList.innerHTML = '';
    
    schedule.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}: ${item.day} (${item.startTime} - ${item.endTime})`;
        scheduleList.appendChild(li);
    });
}

// Event listeners
newQuoteBtn.addEventListener('click', displayRandomQuote);

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    displayRandomQuote();
    displaySchedule();
    
    // Set up a timer to show a new quote every hour
    setInterval(displayRandomQuote, 3600000); // 3600000 ms = 1 hour
});