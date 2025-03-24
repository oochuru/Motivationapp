package model;
public class Quote {
    //store info
    private String text;
    private String author;
    private String category;
    //constructor
    public Quote(String text, String author){
        this.text = text;
        this.author = author;
        
    }
    //getter method for other classes to get the value of method
    public String getText(){
        return text;
    }
    public String getAuthor(){
        return author;
    }
    public String getCategory(){
        return category;
    }
    //the the quote will come out
    @Override
    public String toString(){
        return "\"" + text + "\"-" + author;
    }
}
