package service;

import model.Quote;
import repo.QuoteRepo;
import java.util.Timer;
import java.util.TimerTask;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;


public class Notifications {
    //store the quote repo to acess quotes
    private QuoteRepo quoteRepo;
    private Timer timer;

    //constructor with quote repo
    public Notifications(QuoteRepo quoteRepo){
        this.quoteRepo = quoteRepo;
        //timer object manages scheduling task
        this.timer = new Timer();
        System.out.println("Notifcation service started");
    }
    public void scheduleRepeatingQuote(int intervalMinutes){
        long intervalMs = intervalMinutes * 60 * 10000;
        timer.scheduleAtFixedRate(new TimerTask(){
            @Override
            public void run() {
                Quote quote = quoteRepo.getRandomQuote();
                displayNoti("Motivational Quote", quote.toString());
            }

        }, 0, intervalMs);
    }

    private void displayNoti(String title, String message){
        System.out.println("\n===== NOTIFICATION =====");
        System.out.println("📱 " + title);
        System.out.println("-----------------------");
        System.out.println(message);
        System.out.println("=======================\n");
    }
    public void stopAllNotifications(){
        timer.cancel();
        timer = new Timer();
    }

    public void sendOneTimeQuote(int delaySeconds){
        //convert seconds to milliseconds
        long delayMs = delaySeconds * 1000;

        //schedule a notification after the delay
        timer.schedule(new TimerTask(){
            @Override
            public void run(){
                Quote quote = quoteRepo.getRandomQuote();

                displayNoti("Your motivation Quote", quote.toString());
            }
        }, delayMs);
        System.out.println("Scheduled a quote to appear in " + delaySeconds + " seconds");
    }
}

