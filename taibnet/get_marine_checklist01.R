## Try to crawl TaiBNET marine species checklist
## http://taibnet.sinica.edu.tw/chi/taibnet_marine.php

library(data.table)
library(rvest)
#### NOTE: current marine species is 13,937 in TaiBNET, so set a max 20000 will show only one page in query
#### that's, taibnet_marine.php?pz=20000 means
url <- "http://taibnet.sinica.edu.tw/chi/taibnet_marine.php?key=&pz=20000&id=y&k=y&p=y&pc=y&c=y&cc=y&page=1&R1=name&D1=&D2=&D3=&T1=&T2="
webx <- read_html(url)

data_backup_dir <- "data/"  #### write data backup file of fetched TaiBNET marine species checklist
data_backup_date <- Sys.Date()
Log_file <- "./taibnet_fetch.log" ######## write warning message to a log file if use Rscript to run this script. 
sink(Log_file)
print(paste0("........ TaiBNET fetch process start at: ",as.POSIXct(Sys.time())," ........"))


tbls <- html_nodes(webx, "table")
# head(tbls)
# {xml_nodeset (5)}
# [1] <table border="0" cellpadding="0" cellspacing="0" width="100%" heig ...
# [2] <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr> ...
# [3] <table border="0" cellpadding="0" cellspacing="0" width="100%" heig ...
# [4] <table border="0" cellpadding="0" cellspacing="0"><tr>\n<td valign= ...
# [5] <table border="0" cellspacing="2" cellpadding="2">\n<tr>\n<td nowra ...
####
#### Desired node is [5]

headx <- as.character(html_table(tbls[5], fill=TRUE)[[1]])
print(paste0("NOTE: Table header fetched in TaiBNET website: ", paste(headx, collapse=",")))

tds <- html_text(html_nodes(webx, "td"))
# tds
#[1] " \r\n\t\r\n    \r\n    \r\n  "    ""                                
#[3] ""                                 ""                                
#[5] "\r\n\r\n\r\n"                     "\r\n"                            
#[7] "\r\n"                             "臺灣海洋生物 13937 種\r\n \r\r\n"
#[9] "\r\r\n        "                   "\r\r\n"                          
#[11] "編碼"                             "界名"                            
#[13] "門名"                             "門中文"                          
#[15] "綱名"                             "綱中文"                          
#[17] "目名"                             "目中文"                          
#[19] "科名"                             "科中文"                          
#[21] "學名"                             "中文名" 

####
#### 1:10 is another table in html that should be discarded
#### Check current total number of marine species announced in the TaiBNET website
tt <- tds[grep("臺灣海洋生物", tds)]
curr_spnum <- as.integer(unlist(regmatches(tt, gregexpr("[[:digit:]]+", tt)), 
                                use.names = FALSE))
# 13937 species, 2020/01/03 
print(paste0("NOTE: Total number of marine species announced by TaiBNET: ", curr_spnum))

start_td <- grep("編碼", tds)
if (length(start_td)==0) stop("Error: NOT expected nodes in html of TaiBNET, please check manually")

tdx <- try(data.frame(matrix(html_text(html_nodes(webx, "td"))[-c(1:(start_td-1))], ncol= length(headx), byrow=TRUE)))
if (any("try-error" %in% class(tdx))) stop("Error when fetch table in html of TaiBNET, please check manually")
if (!any("data.frame" %in% class(tdx))) stop("Error: NOT expected table contents in html of TaiBNET, please check manually")

tdx <- setDT(tdx[-c(1),])
if (nrow(tdx)!=curr_spnum) print(paste0("Warning: data table fetched NOT equal number of marine species in TaiBNET website: ", nrow(tdx)))
## setnames(tdx, 1:ncol(tdx), headx) ## but its a chinese name header, change to English

header <- data.frame(tw=c("編碼", "界名", "門名", "門中文", "綱名", "綱中文", 
                          "目名", "目中文", "科名", "科中文", "學名", "中文名"),
                     en=c("taibnet_code", "kingdom", "phylum", "phylum_tw", "class", "class_tw",
                          "order", "order_tw", "family", "family_tw", "sciname", "spname_tw"))

new_head <- as.character(header$en[match(headx, header$tw, nomatch=NA_character_)])
if (any(which(is.na(new_head)))) {
  new_head[which(is.na(new_head))] <- headx[which(is.na(new_head))] ## Some headers not matched, use original header
  print(paste0("Warning: Table header fetched not consistent: ", paste(new_head, collapse=",")))
}

setnames(tdx, 1:ncol(tdx), new_head)
fwrite(tdx, file=paste0(data_backup_dir, "taibnet_marine_species_",data_backup_date,".csv"))

print(paste0("NOTE: output files: ", paste0(data_backup_dir, "taibnet_marine_species_",data_backup_date,".csv")))
print(paste0("........ TaiBNET fetch end: ",as.POSIXct(Sys.time()), " ........"))
sink()
closeAllConnections()

## backup to newest_version file
processx::run("cp", c(paste0(data_backup_dir, "taibnet_marine_species_",data_backup_date,".csv"),
                      paste0(data_backup_dir, "taibnet_marine_species.csv")))
