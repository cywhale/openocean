## Try to crawl TaiBNET newest (all) species checklist from provided csv file
## http://taibnet.sinica.edu.tw/chi/download_pre.php

library(data.table)
library(magrittr)
library(rvest)
library(curl)
library(tabulizer)

data_backup_dir <- "data/"  #### write data backup file of fetched TaiBNET marine species checklist
base<- "http://taibnet.sinica.edu.tw"
url <- "http://taibnet.sinica.edu.tw/chi/download_pre.php"
webx <- read_html(url)
en_updat_taiBNET_header <- TRUE

Log_file <- "./taibnet_fetch_allsp.log" ######## write warning message to a log file if use Rscript to run this script. 
sink(Log_file)
print(paste0("........ TaiBNET fetch all sp start at: ",as.POSIXct(Sys.time())," ........"))

tbls <- html_nodes(webx, "table")

desc <- as.data.table(html_table(tbls[5], fill=TRUE)[[1]])[,2] %>% setnames(1, "remark")

## must exclude "物種名錄 txt 檔欄位說明.pdf (2020-01-10更新)"
srcx <- grep("物種名錄", desc$remark)
if (length(srcx)<=1) stop("Error: NO species checklist file in html of TaiBNET, please check manually")
headx<- grep("物種名錄 txt 檔欄位說明.pdf", desc$remark)
if (!headx %in% srcx) stop("Error: NO header file in html of TaiBNET, please check manually")
newdatx <- min(srcx[!srcx %in% headx])

urlx <- html_attr(html_nodes(tbls, xpath = "//td/a"), "href")

if (en_updat_taiBNET_header) {
  print("Enable update file of taiBNET header format for species checklist...")
  
  headf <- try(extract_tables(paste0(base,"/download/",
                                     curl::curl_escape(gsub("/download/","",urlx[headx[1]]))),
                              pages = 1, guess = TRUE, columns = list(4)))
  if (any("try-error" %in% class(headf))) stop("Error: Cannot download header file from TaiBNET, please check manually")
  
  hdx <- as.data.table(headf[[1]][-1,])
  
  if (ncol(hdx)!=4) print("Warning: Column number of TaiBNET header seems change, please check manually")
  setnames(hdx, 1:4, c("var",'def',"caption","remark"))
  
  if (any(grepl("附錄", hdx$var))) {
    hdx <- hdx[!grepl("附錄", hdx$var),]
  }
  ## parse multi-line of caption in original pdf table and cause headx table with empty headx$var
  hd <- hdx[, chk:=0] %>% .[!is.na(var) & var!="", chk:=1] %>%
        .[, nvar:=cumsum(chk)] %>%
        .[, {.(var=var[1], def=def[1], caption=paste(caption, collapse=", "), 
               remark= remark[1])}, by = .(nvar)] %>% .[,nvar:=NULL]
  
  fwrite(hd, file=paste0(data_backup_dir, "taibnet_all_checklist_columns_def.csv"))
  print(paste0("Header file update: ", desc$remark[headx[1]], " at data/taibnet_all_checklist_columns_def.csv"))
}

## Data file compressed in TaiwanSpecies20200109txt.zip, with desired txt and undesired dir 
## fread should be able to read zip file from internet, but not work for this zip. Thus, curl_download and then fread
## nth row = 82811 "燦孔雀夜蛾" \t\t occur after column 'name' and 'species'
## that's because some rows in the downloaded txt with two consecutive tab \t\t, need to process it
desc$remark[newdatx[1]]
ft <- curl_download(paste0(base, "/download/",
                           curl::curl_escape(gsub("/download/","",urlx[newdatx[1]]))), destfile = tempfile())
#tt <- unzip(ft, list=TRUE)
xt <- unzip(ft, files=gsub("txt","\\.txt",gsub(".zip","",gsub("/download/","",urlx[newdatx[1]]))),
            exdir = dirname(ft))
system(paste0("tr -s '\t' '\t' < ", xt, " > ", paste0(data_backup_dir, basename(xt))))

dt <- fread(paste0(data_backup_dir, basename(xt)),  sep = "\t", fill=TRUE, strip.white=TRUE,
            na.strings = c("", NA, "NA", "NULL", "<NA>")) 

print(paste0("Got file: ", paste0(data_backup_dir, basename(xt)), " with rows: ", nrow(dt), " and cols: ", ncol(dt)))
# [1] 154470, 38 2020215
print(paste0("Original description of taiBNET about this data: ",  desc$remark[newdatx[1]]))
# 20200215 [1] "Original description of taiBNET about this data: 物種名錄 txt 檔 (2020-01-09更新；有效學名 60132 筆，同種異名 94338 筆，合計 154470 筆)"

fwrite(dt, file=gsub(".txt", "\\.csv", paste0(data_backup_dir, basename(xt))))

print(paste0("........ TaiBNET fetch all sp end: ",as.POSIXct(Sys.time()), " ........"))
sink()
closeAllConnections()
