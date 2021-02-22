# First, docker pull opencpu/rstudio, and run this docker container
# see this: (to be continued)
# ref
# https://github.com/opencpu/opencpu/issues/286
# https://rwebapps.ocpu.io/appdemo/www/chain.html
# https://github.com/opencpu/opencpu/issues/336
# Rprotobuf and opencpu pdf: http://bit.ly/2UCvQmX

library(data.table)
library(httr)
library(jsonlite)
library(curl)

# testapi package now only put some testing functions, meaningless temporarily, will be modified radically 202002
# also used in this issue: https://github.com/cywhale/ODB/issues/3 file in https://github.com/cywhale/ODB/tree/master/opencpu_test
args <- list(rand_seed=123, L=1e5, P=10)

resp <- POST(
  url = "http://localhost:8000/ocpu/library/testapi/R/genx_rdt/json",
  body = args, encode = 'json', verbose())

dj <- setDT(fromJSON(rawToChar(resp$content))) # Note rawToChar will lost precision if content is floating point number!!

print(resp$headers$location)
print(resp$headers$`x-ocpu-session`) #x05a261d1ac02a6

res2 <- curl_download(paste0('http://localhost:8000/ocpu/tmp/',
                             resp$headers$`x-ocpu-session`,'/R/.val/csv'), "debug/tmp-get.csv")
tj <- fread(res2)

all.equal(dj, tj)
#[1] "Column 'V1': Mean relative difference: 4.995355e-05"
#> dj
#V1     V2     V3     V4     V5     V6     V7
#1: 0.2876 0.3106 0.9911 0.0879 0.2015 0.2132 0.4232
#> tj
# V1        V2         V3         V4        V5
#1: 0.2875775 0.3105917 0.99112339 0.08789230 0.2014940

sessx <- paste0('http://localhost:8000/ocpu/tmp/', resp$headers$`x-ocpu-session`)

readLines(curl(sessx)) # curl return connection
#[1] "console"           "files/DESCRIPTION"
#[3] "info"              "R/.val"
#[5] "R/genx_rdt"        "source"
#[7] "stdout" ## info: put sessionInfo()

# source include binary file *.so, MUST add text, before readLines it!!
readLines(curl(paste0(sessx, '/source/text')))
# [1] "genx_rdt(rand_seed = 123L, L = 100000L, P = 10L)"

# try protobuf
# see ref: https://cran.r-project.org/web/packages/RProtoBuf/vignettes/RProtoBuf-paper.pdf
library(protolite)
# library(RProtoBuf) # both RProtoBuf and protolite work!
res <- httr::POST(
  url = 'http://localhost:8000/ocpu/library/testapi/R/genx_rdt/pb',
  body = protolite::serialize_pb(args, NULL), #RProtoBuf::serialize_pb(args, NULL),
  httr::add_headers("Content-Type" = "application/protobuf")
)

out <- protolite::unserialize_pb(res$content)
# RProtoBuf::unserialize_pb(res$content) #error cannot unserialize, use protolite get similar error
# Error in cpp_unserialize_pb(msg) :
# Evaluation error: cannot read workspace version 3 written by R 3.6.0; need R 3.5.0 or newer
# seems due to my docker container opencpu/rstudio use R 3.6.0 but I just use R 3.4.4 in local
# BUT IT WORKS when I run the same code in docker container! so it's the problem describing in aboving line
# > out
# V1        V2        V3        V4        V5        V6        V7
# 1 0.2875775 0.3105917 0.9911234 0.0878923 0.2014940 0.2132464 0.4232420
# 2 0.7883051 0.3245201 0.3022307 0.7796115 0.9781903 0.4436674 0.7854825
# 3 0.4089769 0.8702542 0.4337590 0.2811673 0.4127125 0.1281643 0.6018534
# > class(out)
# [1] "data.table" "data.frame"

httr::stop_for_status(res)

print(res$headers$location)
print(res$headers$`x-ocpu-session`)

tj <- fread(curl_download(paste0('http://localhost:8000/ocpu/tmp/',
                             res$headers$`x-ocpu-session`,'/R/.val/csv'), "debug/tmp-pb.csv"))

