// Variable to store quotes
let allQuotes = [];

async function loadQuotes(){
    try {
        const response = await fetch('./quotes.json');
        allQuotes = await response.json();
        console.log(`Loaded ${allQuotes.length} quotes`);        displayRandomQuote();
    }catch(error){
        console.error('Error loading quotes', error);

        allQuotes = [
        {
            quoteText: "The best way to predict the future is to create it.",
            quoteAuthor: "Abraham Lincoln"
        },
        {
            quoteText: "Be the change that you wish to see in the world.",
            quoteAuthor: "Mahatma Gandhi"
        }
    ];
        displayRandomQuote();
    }
}

function displayRandomQuote(){
    if(allQuotes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const quote = allQuotes[randomIndex];

    document.getElementById('quote-text').textContent = '"' + quote.quoteText + '"';
document.getElementById('quote-author').textContent = '- ' + quote.quoteAuthor;

}

document.getElementById('new-quote-button')/addEventListener('click', displayRandomQuote);


window.addEventListener('DOMContentLoaded', () => {
    loadQuotes();

    setInterval(displayRandomQuote, 3600000);
});
//store schedule items
let scheduleItems = [];
//load schedules from localstorage on paage load

function loadSchedule(){
    const savedSchedule = loacalStorage.getItem('motivationAppSchedule');
    if(savedSchedule){
        scheduleItems = JSON.parse(savedSchedule);
        displayScheduleItems();
    }
}

//save a new schedule item
function addScheduleItem(event){
    event.preventDefault();

    const name = document.getElementById('activity-name').value;
    const day = document.getElementById('activity-day').value;
    const time = document.getElementById('activity-time').value;

    const newItem = {
        id: Date.now(),
        name: name,
        day: day,
        time: time
    };

    scheduleItems.push(newItem);

    //save to localStorage
    localStorage.setItem('motivationAppSchedule', JSON.stringify(scheduleItems));

    //resetform
    document.getElementById('schedule-form').reset();
    //update display
    displayScheduleItems();
    //setup Noti
    scheduleNotification(newItem);
}
//display all scheduled items
function displayScheduleItems(){
    const scheduleList = document.getElementById('schedule-list');
        if(!scheduleList) return;
    scheduleList.innerHTML = '';

    scheduleItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
        <span>${item.name}</span>
        <span>${item.dau}, ${formatTime(item.time)}</span>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
        `;
        scheduleList.appendChild(li);
    }
    );
}

//format time for display
function formatTime(time){
    cons [hours,minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampnm = hours >= 12 ? 'PM' : 'AM';
    return `${hour}:${minutes} ${ampm}`;
}

//delete a schedule item
function deleteScheduleItem(event){
    const id = Number(event.target.getAttribute('data-id'));
    scheduleItems = scheduleItems.filter(item => item.id !== id);
    localStorage.setItem('motivationAppSchedule', JSON.stringify(scheduleItems));
    displayScheduleItems();
}

function scheduleNotification(item){
    console.log('Schedule notificationn for ${item.name} on ${item.day} at ${item.time}');
}
function checkSchedule() {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    scheduleItems.forEach(item => {
      // Get the time of the activity
      const [itemHours, itemMinutes] = item.time.split(':').map(Number);
      
      // Set up a date object for the activity time
      const activityTime = new Date();
      activityTime.setHours(itemHours, itemMinutes, 0);
      
      // Set up a date object for 1 hour before
      const notificationTime = new Date(activityTime);
      notificationTime.setHours(notificationTime.getHours() - 1);
      
      // If it's the correct day and it's 1 hour before the activity
      if (item.day === currentDay && 
          now.getHours() === notificationTime.getHours() && 
          now.getMinutes() === notificationTime.getMinutes()) {
        
        // Show notification with a motivational quote
        const quote = getRandomQuote();
        showNotification(item.name, quote);
      }
    });
  }

  //shows noti w a quote
  function showNotification(activityName, quote) {
    if("Notification" in window && Notification.permission === "granted"){
        new Notification(`Reminder: ${activityName}`, {
            body: quote.quoteText + ' - ' + quote.quoteAuthor
        });
    } else {
        // Fallback - show in the UI
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'app-notification';
        notificationDiv.innerHTML = `
          <h3>Reminder: ${activityName} in 1 hour</h3>
          <div class="notification-quote">
            <p>"${quote.quoteText}"</p>
            <p>- ${quote.quoteAuthor}</p>
          </div>
          <button class="close-notification">Close</button>
        `;
        
        document.body.appendChild(notificationDiv);
        
        // Add event listener to close button
        notificationDiv.querySelector('.close-notification').addEventListener('click', () => {
          notificationDiv.remove();
        });
      }
    }
    
    // Get permission for notifications
    function requestNotificationPermission() {
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    }
    
    // Add event listeners when the DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Load existing quotes and schedules
      loadQuotes();
      loadSchedules();
      
      // Add event listener to schedule form
      document.getElementById('schedule-form').addEventListener('submit', addScheduleItem);
      
      // Request notification permission
      requestNotificationPermission();
      
      // Check schedule every minute
      setInterval(checkSchedule, 60000);
    });
    document.querySelector('.quote-container').addEventListener('swipe', function() {
        displayRandomQuote();
      });

