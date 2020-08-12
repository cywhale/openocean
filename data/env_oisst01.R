# Optimum Interpolation Sea Surface Temperature (OISST)
library(curl)
library(data.table)
library(magrittr)
library(ggplot2)
library(viridis)

## try one daily OISST file
oisstfile <- "https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/198201/oisst-avhrr-v02r01.19820101.nc"
dest <- "../data_src/oisst/daily/"

######################## Use Old Method to open a NetCDF ## New: use stars
## library(tidync) # need R 3.5 # https://ropensci.org/blog/2019/11/05/tidync/
## oisst <- tidync(oisstfile) ### is another way to read NetCDF

library(ncdf4)
datei <- tstrsplit(filei, "\\.") %>% .[[length(.)-1]] %>% ## before .nc
           as.IDate(format="%Y%m%d")
filei <- tstrsplit(oisstfile, "/") %>% .[[length(.)]]
fileo <- paste0(dest, filei)
    
if (!file.exists(fileo)) {
  tryCatch({
    curl_download(oisstfile, destfile = fileo)
   }, error = function(e) paste0(datei, ": ", e))
} 

nx0 <- nc_open(fileo) ## four var: anom (anomaly), err (standard err), ice (sea ice concentration %), sst (in Celsius)
print(nx0) ## [lon,lat,zlev,time]   (Chunking: [1440,720,1,1])
zlev <- ncvar_get(nx0, "zlev") ## only 0 (surface)
latn1<- ncvar_get(nx0, "lat")
lngn1<- ncvar_get(nx0, "lon")
time<- ncvar_get(nx0, "time") 
date<- time %>%  as.Date(origin="1978-01-01 00:00:0.0") 

sst <- as.data.table(ncvar_get(nx0, "sst")) %>% melt() %>%
  .[,`:=`(latx=.GRP), by=.(variable)] %>% .[,lngx:=rowid(variable)] %>%
  .[,`:=`(longitude=fifelse(lngn1[lngx]>180, lngn1[lngx]-360, lngn1[lngx]), latitude=latn1[latx])] %>% .[,`:=`(variable=NULL, lngx=NULL, latx=NULL)]
setnames(sst, 1, "sst")
setcolorder(sst, c(2,3,1))

ggplot() +  
  geom_tile(data=sst, aes(x=longitude, y=latitude, fill=sst), alpha=0.8) + 
  scale_fill_viridis() +
  coord_equal() + 
  xlim(c(-180, 180)) + ylim(c(-90, 90))

######################## New: use stars to read NetCDF https://www.r-spatial.org/r/2017/11/23/stars1.html
library(stars) #https://www.r-spatial.org/r/2017/11/23/stars1.html
library(abind)
library(dplyr)

stx <- read_stars(fileo)
z <- stx %>% select(ice) %>% adrop

gplotx <- function(z, val="sst") {
  df = as.data.frame(z)
  zcol = grep(val, colnames(df))
  if (length(zcol)) { #ensym(val)
    df[,zcol] = unclass(df[,zcol])
    ggplot() +  
      geom_tile(data=df, aes_string(x="x", y="y", fill=val), alpha=0.8) + 
      scale_fill_viridis() +
      coord_equal()
  } else {
    print("Error z column")
  }
}

gplotx(z, "ice")

anm <- stx %>% select(anom) %>% adrop
gplotx(anm, "anom")

######################## Calculate monthly mean...
