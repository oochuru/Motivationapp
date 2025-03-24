package app;
import model.Quote;
import repo.QuoteRepo;
import service.Notifications;
public class MotivationApp {
    public static void main(String[] args) throws Exception {
        System.out.println("Hello, World!");
        //Create quote repository
        QuoteRepo quoteRepo = new QuoteRepo();
        QuoteRepo quoteFile = new QuoteRepo();
        //try and load qupte from file
        quoteRepo.loadQuotesFromJson("lib/resources/quotes.json");
        quoteFile.loadQuotesFromFile("lib/resources/quotes.txt");

        //test random quotes
       // System.out.println("Total quotes available " + quoteRepo.getQuoteCount());

        System.out.println("\nSome ranndom quotes to get u going!");
        for(int i = 0; i < 3; i++){
            Quote quote = quoteRepo.getRandomQuote();
            System.out.println("- " + quote);
        }
        System.out.println("Some random quotes from file!");
        for(int i = 0; i < 3; i++){
            Quote quote = quoteFile.getRandomQuote();
            System.out.println(" - " + quote);
        }
        
        Notifications notificationService = new Notifications(quoteRepo);

        notificationService.sendOneTimeQuote(5);

        System.out.println("Waiting for notification...");
        try{
            Thread.sleep(100000);

        } catch (InterruptedException e){
            System.out.println("Interrupted");
        }
        

    

        
    }
}
