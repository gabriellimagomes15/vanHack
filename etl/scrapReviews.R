install.packages('rvest')
library(rvest)
library(plyr)
library(lubridate)
library(data.table)
library(tm)

reviews <- data.frame()


getReview <- function(page){
  title     <- page %>% html_nodes('.reviewLink') %>% html_text()
  rating    <- page %>% html_nodes('.rating') %>% html_nodes('span') %>% html_attr(., 'title')
  recomends <- page %>% html_nodes('.recommends') %>% html_nodes('.tightLt:nth-child(1)') %>% html_nodes('.cell:nth-child(2)') %>%  html_text()
  outlook   <- page %>% html_nodes('.recommends') %>% html_nodes('.tightLt:nth-child(2)') %>% html_nodes('.cell:nth-child(2)') %>%  html_text()
  pros  <- page %>% html_nodes('.description') %>% html_nodes('.pros') %>% html_text()
  cons  <- page %>% html_nodes('.description') %>% html_nodes('.cons') %>% html_text()
  date  <- page %>% html_nodes('.date.subtle') %>% html_text()
  
  df <- data.frame( cbind(title, rating, recomends, outlook, pros, cons,date) )  
  return(df)
} 

#### SCRAP REVIEW VIDYARD COMPANY ####
url <- 'https://www.glassdoor.com.au/Reviews/Vidyard-Reviews-E951651.htm'
page <- read_html(url) %>% html_nodes('.hreview')
revVidyar <- getReview(page)
revVidyar$company <- 'Vidyard'

reviews <- rbind(reviews, revVidyar)

url <- 'https://www.glassdoor.com.au/Reviews/Vidyard-Reviews-E951651_P2.htm'
page <- read_html(url) %>% html_nodes('.hreview')
revVidyar <- getReview(page)
revVidyar$company <- 'Vidyard'

reviews <- rbind(reviews, revVidyar)
########################################################

#### SCRAP REVIEW eSentire COMPANY ####
url   <- 'https://www.glassdoor.com.au/Reviews/eSentire-Reviews-E866393.htm'
page  <- read_html(url) %>% html_nodes('.hreview')
eSent <- getReview(page)
eSent$company <- 'eSentire'

reviews <- rbind(reviews, eSent)

url <- 'https://www.glassdoor.com.au/Reviews/eSentire-Reviews-E866393_P2.htm'
page <- read_html(url) %>% html_nodes('.hreview')
eSent <- getReview(page)
eSent$company <- 'eSentire'

reviews <- rbind(reviews, eSent)

reviews_2 <- data.frame( apply(reviews, 2, function(x){
                            x <- gsub('\"|-','',x)
                            x
                          }
                        ), stringsAsFactors = F)

reviews_2[,c('prosClean','consClean')] <- data.frame(apply(reviews_2[,c('pros','cons')],2, function(x){
                                                x <- removeWords(x, stopwords('en'))
                                                x <- gsub("[[:punct:]]",'',x)
                                                x <- gsub("[[:digit:]]",'',x)
                                                x <- tolower(x)
                                                x
                                            }), stringsAsFactors = F)
reviews_2$dateFull <- dmy(reviews_2$date)

reviews_2[ reviews_2$recomends == 'No opinion of CEO','recomends'] <- "Doesn't Recommend"

json <- jsonlite::toJSON(reviews_2)
write(json, 'C:/Users/gabri/Desktop/vanHack/data/review.json')

