install.packages('data.table')
install.packages('lubridate')
install.packages('tm')
install.packages('plyr')
library(plyr)
library(lubridate)
library(data.table)
library(tm)

statesCanda <- c('AB','BC','PE','MB','NB','NS','ON','QC','SK','NL')
statesEua <- c('AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MT','NE','NV'
               ,'NH','NJ','NM','NY','NC','ND','OH','OK','OR','MD','MA','MI','MN','MS','MO','PA','RI','SC','SD','TN','TX','UT','VT'
               ,'VA','WA','WV','WI','WY')
countries <- c('Armenia','Czech Republic','Russia','Georgia','Czech Republic')
win <- 'data/jobs1.csv'
#lin <- ''

convertDate <- function(x){
  retorno <- c()
  if( grepl('day|days',x) ){
    day <- as.numeric( gsub("([0-9]+).*$", "\\1", x) )
    retorno <- sysDate - day
  }else if( grepl('hour|hours',x) ){
    hour <- paste(gsub("([0-9]+).*$", "\\1", x), ':00',sep = '' )
    hour <- hm(hour)
    retorno <- sysDate - hour
  }else if( grepl('week|weeks',x) ){
    week <- as.numeric( gsub("([0-9]+).*$", "\\1", x) )
    day <- week * 7
    retorno <- sysDate - day
  }else if( grepl('month|months',x) ){
    month <- as.numeric( gsub("([0-9]+).*$", "\\1", x) )
    day <- month * 30
    retorno <- sysDate - day
  }else if( grepl('minute|minutes',x) ){
    min <- as.numeric( gsub("([0-9]+).*$", "\\1", x) )
    min <- ms('2:00')
    retorno <- sysDate - min
  }else if( grepl('moments',x) ){
    retorno <- sysDate
  }
  #print(retorno)
  as.character(retorno)
}


job1 <- fread('C:/Users/gabri/Desktop/vanHack/dice_com-job_us_sample.csv/dice_com-job_us_sample.csv')
job1$states <- sapply(job1$joblocation_address, function(x){
  i <- strsplit(x,split = ',')[[1]][2] #gregexpr(',',x)[[1]][1]
  trimws(i)
})

job1$city <- sapply(job1$joblocation_address, function(x){
  i <- strsplit(x,split = ',')[[1]][1] #gregexpr(',',x)[[1]][1]
  trimws(i)
})

job1$country <- sapply(job1$states, function(x){
  country <- c()
  if(x %in% statesCanda){
    country <- 'Canada'  
  }else if(x %in% statesEua){
    country <- 'EUA'
  }else{
    country <- 'Canada'
  }
})

job1_2 <- job1[, c('company', 'employmenttype_jobstatus', 'jobtitle', 'postdate', 'skills', 'city','states','country')]
job1_2[, c('employmenttype_jobstatus', 'jobtitle', 'postdate', 'skills')] <- 
  data.frame(apply(job1_2[, c( 'employmenttype_jobstatus', 'jobtitle', 'postdate', 'skills')], 2, function(x){
  tolower(x)
}))

sysDate <- Sys.Date()
job1_2$date <- sapply(job1_2$postdate, function(x){
  convertDate(x)
})

job1_2$skillsClean <- sapply(job1_2$skills, function(x){
  x <- gsub('\"|\\*|\\(|\\)|\\-|\'|\\. |\\+|year|years|[[:digit:]]|experience|over|required|needed|see|below|please|job|description','',x)
  x <- gsub('\\:|\\/| and |,and |and,| or |,or ',',',x) 
  x <- gsub("^,","",x) 
  x <- removeWords(as.character(x),stopwords())
  x
})

colnames(job1_2) <- c('company','status','title','postdate','skills','city','state','country','date','skillclean')


fwrite(job1_2,win)
##################################################################################################

job2 <- fread('C:/Users/gabri/Desktop/vanHack/data-job-posts.csv/datajob-posts.csv')
job2$country <- sapply(job2$Location, function(x){
  i <- strsplit(x,split = ',')[[1]][2] #gregexpr(',',x)[[1]][1]
  trimws(i)
})
job2 <- job2[job2$country %in% c('Armenia','Czech Republic','Russia','Georgia','Czech Republic'),]

job2_2 <- job2[, c('date', 'Title', 'Company', 'Term', 'Location', 'RequiredQual', 'country')]

job2_2$date <- sapply(job2_2$date, function(x){
  if(!grepl('\\,',x)){
    x <- sub('[[:digit:]]:[[:digit:]]{,2}','',x)
    x <- sub('AM|PM','',x)
    x <- paste(x,', 2017',sep = '')
  }
  as.character(mdy(x))
}) 

job2_2$Location <- sapply(job2_2$Location, function(x){
  end <- gregexpr(',',x)[[1]][2]
  if(!is.na(end)){
    x <- substr(x,1,end-1)
  }
  x
})
job2_2$Location[1464] <- 'nd,Armenia'

job2_2$city <- sapply(job2_2$Location, function(x){
    end <- gregexpr(',',x)[[1]][1]
    x <- substr(x,1,end-1)
    trimws(x)
  })
job2_2$country <- sapply(job2_2$Location, function(x){
  start <- gregexpr(',',x)[[1]][1]
  x <- substr(x,start+1,stringr::str_length(x))
  trimws(x)
})


job2_2$skillsClean <- sapply(job2_2$RequiredQual, function(x){
  x <- gsub('\"|\\*|\\(|\\)|\\-|\'|\\. |\\+|year|years|[[:digit:]]|experience|over|required|needed|see|below|please|job|description','',x)
  x <- gsub('\\;|\\:|\\/| and |,and |and,| or |,or ',',',x) 
  x <- gsub("^,","",x) 
  x <- removeWords(as.character(x),stopwords())
  x
})

job2_2 <- job2_2[,c('Company', 'Term','Title', 'RequiredQual','city', 'country', 'date' , 'skillsClean')]
colnames(job2_2) <- c('company','status','title','skills','city','country','date','skillclean')

win <- 'C:/Users/gabri/Desktop/vanHack/data/jobs2.csv'
fwrite(job2_2,win)


rows  <- sample(1:dim(job1_2)[1], dim(job2_2)[1],replace = T)


job2_2$salary <- round(runif(dim(job2_2)[1],min = 6,max=10), 4) * 10000
job2_2$skillclean <- job1_2[rows,'skillclean']
job2_2$date <- job1_2[rows,'date'] #as.Date(dados2$date)

final <- rbind.fill(job1_2, job2_2)
final$date <- as.Date(final$date)

final$status <- sapply(final$status,function(x){
  x <- tolower(strsplit(x, ',')[[1]][1]  )
  x <- gsub('\\-',' ', x)
})

json <- jsonlite::toJSON(final)
write(json, 'C:/Users/gabri/Desktop/vanHack/data/data.json')
