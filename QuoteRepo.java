package repo;

import model.Quote;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.Random;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.io.BufferedReader;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
public class QuoteRepo {
    //List to store all qoutes
    private List<Quote> quotes;
    //random object for the quotes
    private Random random;

    public QuoteRepo(){
        quotes = new ArrayList<>();
        random = new Random();
        //incase case file fails something gon show
        addDefaultQuotes();

        
    }
    String a = "Anonymous";
    public void addDefaultQuotes(){
        quotes.add(new Quote("We can only learn to love by loving", "Iris Murdoch"));
        quotes.add(new Quote("It's easier to see the mistakes on someone else's paper.", a));
        quotes.add(new Quote("Trust yourself. You know more than you think you do.", "Benjamin Spock"));
        quotes.add(new Quote("The day is already blessed, find peace within it.", a));
        quotes.add(new Quote("Be as you wish to seem.", "Socrates"));
    }
    public void loadQuotesFromJson(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
            
            String jsonStr = content.toString();
            // Extract quotes using string operations
            int startIndex = 0;
            while (true) {
                // Find start of quote
                int textIndex = jsonStr.indexOf("\"quoteText\":", startIndex);
                if (textIndex == -1) break;
                
                // Find start and end of the quote text
                int textStartIndex = jsonStr.indexOf("\"", textIndex + 11) + 1;
                int textEndIndex = jsonStr.indexOf("\"", textStartIndex);
                String quoteText = jsonStr.substring(textStartIndex, textEndIndex);
                
                // Find start and end of the author
                int authorIndex = jsonStr.indexOf("\"quoteAuthor\":", textEndIndex);
                int authorStartIndex = jsonStr.indexOf("\"", authorIndex + 14) + 1;
                int authorEndIndex = jsonStr.indexOf("\"", authorStartIndex);
                String author = jsonStr.substring(authorStartIndex, authorEndIndex);
                
                // Add the quote
                quotes.add(new Quote(quoteText, author));
                
                // Move to next quote
                startIndex = authorEndIndex;
            }
            
            System.out.println("Successfully loaded " + quotes.size() + " quotes from JSON!");
            
        } catch (Exception e) {
            System.err.println("Error loading quotes: " + e.getMessage());
            e.printStackTrace();
            // Default quotes are already added in constructor
        }
    }
    
    public void loadQuotesFromFile(String filename){
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))){
            String line;
            while((line = reader.readLine()) != null){
                String[] parts = line.split("\\|");
                if ( parts.length >= 2){
                    quotes.add(new Quote(parts[0], parts[1]));
                }

            }
            System.out.println("Loaded " + quotes.size() + " quotes from file");
            //is there is an error is the above code a custom error text prints
        } catch (Exception e) {
            System.err.println("Error loading quotes: " + e.getMessage());
        }
    }
    public Quote getRandomQuote(){
        if(quotes.isEmpty()){
            return new Quote("No quote available", "Ochuru Error");
        }
        int index = random.nextInt(quotes.size());
        return quotes.get(index);
    }
    public Quote getRandomQuoteByAuthor(String author){
        List<Quote> authorQuotes = new ArrayList<>();

        for(Quote quote : quotes){
            if (quote.getAuthor().equalsIgnoreCase(author)){
                authorQuotes.add(quote);
            }
        }
        if(authorQuotes.isEmpty()){
            return getRandomQuote();
        }
        int index = random.nextInt(authorQuotes.size());
        return authorQuotes.get(index);
    }
    public void addQuote(Quote quote){
        quotes.add(quote);
    }
    public int getQuoteCount(){
        return quotes.size();
    }

}
