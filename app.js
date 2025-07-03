// SECURE Gmail Integration - No API keys in code
class GmailScheduleIntegration {
    constructor() {
        // DO NOT PUT REAL API KEYS HERE - These are placeholders
        this.API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // Replace locally only
        this.CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Replace locally only
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
        
        this.isSignedIn = false;
        this.scheduleKeywords = ['schedule', 'shift', 'work hours', 'roster', 'rota', 'timetable'];
        this.senders = ['no.reply@innout.com', 'store222@innout.com', 'schedule@', 'noreply@'];
        
        // Check if API keys are properly configured
        this.checkConfiguration();
    }

    checkConfiguration() {
        if (this.API_KEY === 'YOUR_GOOGLE_API_KEY_HERE' || this.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            console.warn('⚠️ Gmail API not configured - using demo mode');
            this.showConfigurationHelp();
            return false;
        }
        return true;
    }

    showConfigurationHelp() {
        const helpMessage = `
🔧 Gmail Integration Setup Required:

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a project and enable Gmail API
3. Create OAuth 2.0 credentials
4. Add your domain to authorized origins
5. Replace the placeholder API keys in your LOCAL copy only

📚 Full setup guide: https://developers.google.com/gmail/api/quickstart/js

For now, use manual schedule entry or the email parser!
        `;
        
        console.log(helpMessage);
        
        // Show user-friendly message
        setTimeout(() => {
            this.showInfo('Gmail integration needs setup - using manual mode for now');
        }, 1000);
    }

    async initialize() {
        // Check if API keys are configured
        if (!this.checkConfiguration()) {
            // Still allow the rest of the app to work
            this.updateEmailUI(false);
            return false;
        }

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
            this.showError('Gmail API setup needed - check console for setup guide');
            this.updateEmailUI(false);
            return false;
        }
    }

    async signIn() {
        if (!this.checkConfiguration()) {
            this.showError('Gmail API not configured. Check console for setup instructions.');
            return;
        }

        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signIn();
        } catch (error) {
            console.error('Sign-in failed:', error);
            this.showError('Gmail sign-in failed. Please try again.');
        }
    }

    updateEmailUI(isConnected) {
        const emailScreen = document.getElementById('email-screen');
        if (!emailScreen) return;
        
        const formContainer = emailScreen.querySelector('.schedule-form');
        if (!formContainer) return;
        
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
            const isConfigured = this.checkConfiguration();
            
            formContainer.innerHTML = `
                <h3 style="color: #ff8e53; margin-bottom: 20px;">📧 Gmail Integration</h3>
                
                ${!isConfigured ? `
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #FFC107; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <h4 style="color: #FFC107; margin-bottom: 10px;">⚙️ Setup Required</h4>
                        <p style="color: #a0a0a0; font-size: 14px; line-height: 1.4; margin-bottom: 15px;">
                            Gmail integration needs Google Cloud Console setup. For now, you can:
                        </p>
                        <ul style="color: #a0a0a0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                            <li>Use manual schedule entry</li>
                            <li>Try the email parser below</li>
                            <li>Set up Gmail API for automatic detection</li>
                        </ul>
                    </div>
                ` : ''}
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.2); margin-bottom: 20px;">
                    <h4 style="color: #4CAF50; margin-bottom: 10px;">✨ Email Parser (No Setup Needed)</h4>
                    <p style="color: #a0a0a0; margin-bottom: 15px;">
                        Copy and paste your schedule email below for instant parsing:
                    </p>
                    
                    <textarea 
                        id="manual-email-input" 
                        placeholder="Paste your work schedule email here..."
                        style="width: 100%; height: 120px; padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 107, 107, 0.3); background: rgba(255, 255, 255, 0.1); color: white; resize: vertical; font-family: monospace; font-size: 14px; margin-bottom: 15px;"
                    ></textarea>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="parseManualEmail()" 
                                style="background: #ff6b6b; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; flex: 1;">
                            🔍 Parse Schedule
                        </button>
                        <button onclick="pasteExampleEmail()" 
                                style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); color: white; padding: 12px 16px; border-radius: 8px; cursor: pointer;">
                            📝 Try Example
                        </button>
                    </div>
                    
                    <div id="manual-parsing-results" style="margin-top: 15px;"></div>
                </div>
                
                ${isConfigured ? `
                    <button onclick="gmailIntegration.signIn()"
                            style="background: linear-gradient(135deg, #ea4335, #fbbc04); color: white; border: none; padding: 16px 24px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; box-shadow: 0 4px 20px rgba(234, 67, 53, 0.3);">
                        <span style="margin-right: 8px;">📧</span>
                        Connect Gmail Account
                    </button>
                ` : `
                    <button onclick="showGmailSetupGuide()" 
                            style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); color: white; padding: 16px 24px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">
                        <span style="margin-right: 8px;">📚</span>
                        Gmail Setup Guide
                    </button>
                `}
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.2); margin-top: 20px;">
                    <h4 style="color: #ff6b6b; margin-bottom: 8px;">🔒 Privacy & Security</h4>
                    <p style="color: #a0a0a0; font-size: 14px; line-height: 1.4;">
                        We only read emails to find your work schedules. No personal data is stored or shared. You can disconnect anytime.
                    </p>
                </div>
            `;
        }
    }

    // Rest of your Gmail methods (searchScheduleEmails, parseEmailData, etc.)
    // ... (keeping all the existing functionality)

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

    showSuccess(message) { this.showToast(message, '#4CAF50'); }
    showError(message) { this.showToast(message, '#f44336'); }
    showInfo(message) { this.showToast(message, '#2196F3'); }
    showProgress(message) { this.showToast(message, '#ff8e53'); }
}

// Manual email parsing functions (no API needed)
function parseManualEmail() {
    const emailText = document.getElementById('manual-email-input').value;
    const resultsDiv = document.getElementById('manual-parsing-results');
    
    if (!emailText.trim()) {
        resultsDiv.innerHTML = '<p style="color: #ff6b6b;">Please paste your schedule email first!</p>';
        return;
    }
    
    // Use the existing IN-N-OUT parser
    const parser = new INOutScheduleParser();
    const schedules = parser.parseINOutEmail(emailText);
    
    if (schedules.length === 0) {
        resultsDiv.innerHTML = `
            <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid #ff6b6b; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <p style="color: #ff6b6b; margin-bottom: 10px;">🤔 No schedules found in that text.</p>
                <p style="color: #a0a0a0; font-size: 14px;">Make sure your email includes lines like:</p>
                <code style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 4px; display: block; margin-top: 8px; color: #a0a0a0;">
                MON:<br>
                07/07&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;08:30pm-02:00am
                </code>
            </div>
        `;
        return;
    }
    
    let resultsHTML = `
        <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 8px; padding: 15px; margin-top: 15px;">
            <h4 style="color: #4CAF50; margin-bottom: 15px;">✅ Found ${schedules.length} work shifts:</h4>
    `;
    
    schedules.forEach(schedule => {
        const notificationTime = parser.calculateNotificationTime(schedule.startTime);
        
        resultsHTML += `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #4CAF50;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="color: white;">${schedule.day}</strong>
                    <span style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                        ${schedule.timeRange}
                    </span>
                </div>
                
                <div style="font-size: 14px; color: #a0a0a0; margin-bottom: 10px;">
                    🕐 Work: ${schedule.startTime} - ${schedule.endTime}<br>
                    🔔 Notification: ${notificationTime} (1 hour before)
                </div>
                
                <button onclick="addManualSchedule('${schedule.day}', '${schedule.startTime}', 'Work Shift (${schedule.timeRange})')"
                        style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">
                    ➕ Add to Schedule
                </button>
            </div>
        `;
    });
    
    resultsHTML += `
        <div style="margin-top: 15px; text-align: center;">
            <button onclick="addAllManualSchedules(${JSON.stringify(schedules).replace(/"/g, '&quot;')})"
                    style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                ⚡ Add All Shifts
            </button>
        </div>
    </div>`;
    
    resultsDiv.innerHTML = resultsHTML;
}

function pasteExampleEmail() {
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
    
    document.getElementById('manual-email-input').value = exampleEmail;
    showToast('📝 Example schedule pasted! Now click "Parse Schedule"', '#2196F3');
}

function addManualSchedule(day, startTime, activity) {
    // Use existing schedule adding function
    const scheduleItem = {
        id: Date.now(),
        activity: activity,
        day: day,
        time: startTime,
        notifications: true,
        source: 'manual'
    };
    
    scheduleItems.push(scheduleItem);
    localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems));
    
    scheduleNotification(scheduleItem);
    showToast(`✅ ${activity} added for ${day} at ${startTime}!`, '#4CAF50');
}

function addAllManualSchedules(schedules) {
    schedules.forEach(schedule => {
        addManualSchedule(schedule.day, schedule.startTime, `Work Shift (${schedule.timeRange})`);
    });
    
    showToast(`🎉 Added ${schedules.length} schedules with notifications!`, '#4CAF50');
    
    // Switch to schedule screen
    setTimeout(() => {
        showScreen('schedule-screen');
    }, 1500);
}

function showGmailSetupGuide() {
    const guide = `
📧 Gmail API Setup Guide:

1. Go to console.cloud.google.com
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Replace API keys in your LOCAL code only

For now, use the email parser above - it works great!
    `;
    
    alert(guide);
    console.log(guide);
}

// Initialize Gmail integration (safely)
const gmailIntegration = new GmailScheduleIntegration();
