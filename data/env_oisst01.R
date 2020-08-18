# Optimum Interpolation Sea Surface Temperature (OISST)
library(curl)
library(data.table)
library(magrittr)
library(ggplot2)
library(viridis)

## try one daily OISST file
initialTrial <- FALSE
oisstfile <- "https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/198201/oisst-avhrr-v02r01.19820101.nc"
dest <- "../data_src/oisst/daily/"

######################## Use Old Method to open a NetCDF ## New: use stars
## library(tidync) # need R 3.5 # https://ropensci.org/blog/2019/11/05/tidync/
## oisst <- tidync(oisstfile) ### is another way to read NetCDF
require(ncdf4)
plot_ncdf4x <- function (file, var="sst") {
  nx0 <- nc_open(file) ## four var: anom (anomaly), err (standard err), ice (sea ice concentration %), sst (in Celsius)
  print(nx0) ## [lon,lat,zlev,time]   (Chunking: [1440,720,1,1])
  #zlev <- ncvar_get(nx0, "zlev") ## only 0 (surface)
  latn1<- ncvar_get(nx0, "lat")
  lngn1<- ncvar_get(nx0, "lon")
  time<- ncvar_get(nx0, "time") 
  date<- time %>%  as.Date(origin="1978-01-01 00:00:0.0") 
  
  dt <- as.data.table(ncvar_get(nx0, var)) %>% melt() %>%
    .[,`:=`(latx=.GRP), by=.(variable)] %>% .[,lngx:=rowid(variable)] %>%
    .[,`:=`(longitude=fifelse(lngn1[lngx]>180, lngn1[lngx]-360, lngn1[lngx]), latitude=latn1[latx])] %>% .[,`:=`(variable=NULL, lngx=NULL, latx=NULL)]
  setnames(dt, 1, var)
  setcolorder(dt, c(2,3,1))
  
  ggplot() +  
    geom_tile(data=dt, aes_string(x="longitude", y="latitude", fill=var), alpha=0.8) + 
    scale_fill_viridis() +
    coord_equal() + 
    xlim(c(-180, 180)) + ylim(c(-90, 90))
}

if (initialTrial) {
  datei <- tstrsplit(filei, "\\.") %>% .[[length(.)-1]] %>% ## before .nc
    as.IDate(format="%Y%m%d")
  filei <- tstrsplit(oisstfile, "/") %>% .[[length(.)]]
  fileo <- paste0(dest, filei)
  
  if (!file.exists(fileo)) {
    tryCatch({
      curl_download(oisstfile, destfile = fileo)
    }, error = function(e) paste0(datei, ": ", e))
  } 
  
  plot_ncdf4x(fileo, "sst")
  ######################## New: use stars to read NetCDF https://www.r-spatial.org/r/2017/11/23/stars1.html
}

library(stars) #https://www.r-spatial.org/r/2017/11/23/stars1.html
library(abind)
library(dplyr)
gplotx <- function(z, var="sst", returnx=FALSE, minz=-2, maxz=32.5) {
  df = as.data.frame(z)
  if (is.na(var) | var=="") { var = colnames(df)[3] }
  zcol = chmatch(var, colnames(df))
  if (!length(zcol) | is.na(zcol)) { #ensym(var)
    print("Warning: change z column name")
    colnames(df)[3] <- var
    zcol = grep(var, colnames(df))
  }  
  df[,zcol] = unclass(df[,zcol])
  gx <- ggplot() +  
    geom_tile(data=df, aes_string(x="x", y="y", fill=var), alpha=0.8) + 
    coord_equal()
  
  if (any(is.na(c(minz, maxz)))) {
    gx <- gx + scale_fill_viridis() 
  } else {
    gx <- gx + scale_fill_viridis(limits=c(minz, maxz))
  }
  if (returnx) {return(gx)}
  gx
}

if (initialTrial) {
  stx <- read_stars(fileo)
  z <- stx %>% select(ice) %>% adrop
  gplotx(z, "ice")
  
  anm <- stx %>% select(anom) %>% adrop
  gplotx(anm, "anom")
}  

plot_stars <- function (file, var="", name=var) {
  xt <- read_stars(file)
  
  if (is.na(var) | var=="") {
    gplotx(xt, name)
  } else {
    z <- xt %>% select(var) %>% adrop 
    gplotx(z, name)
  }
}

######################## Calculate monthly mean...
urlx <- "https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/"
prex <- "oisst-avhrr-v02r01"
yrng <- seq(1982,2020) #current 198109 - 202008 (update 20200812)
#mday <- c(31,28,31,30,31,30,31,31,30,31,30,31)
mdayx <- function (yr, month, mday=c(31,28,31,30,31,30,31,31,30,31,30,31)) {
  return (fifelse(yr %% 4 != 0 | month != 2, mday[month], 29))
}
trackdate <- seq.Date(as.IDate(Sys.Date()-7), as.IDate(Sys.Date()-1), by="day")
curryr <- year(Sys.Date())
currmo <- month(Sys.Date())

icedayx <- function(x) {
  sum(fifelse(is.na(x) | x<=0, 0L, 1L))
}
icemaskx <- function(x, days) {
  fifelse(x>=(days-x), 1L, 0L)
}

## Update 20200814: only fetch till 20200727 ([1] "All resolved BUT NOT exist: 28,29,30,31") 
library(future.apply)
plan(multisession)
options(future.globals.maxSize= 1048576000)
for (i in yrng) {
    mmx <- fifelse(i==curryr, currmo-1L, 12L)
    for (j in 1:mmx) {
      monj <- fifelse(j<10, paste0("0",j), paste0(j))
      days <- mdayx(i, j)
      print(paste0("Now in Year-month: ", i," - ", monj, " and have days: ", days))
      flist <- future_lapply(1:days, function(k) {
        dayk <- fifelse(k<10, paste0("0",k), paste0(k))
        datei <- paste0(i, monj, dayk)
        filei <- paste(prex, datei, "nc", sep=".")
        fileo <- paste0(dest, filei)
        if (!file.exists(fileo)) {
          tryCatch({
            curl_download(paste(urlx, substr(datei, 1, 6), filei, sep="/"), destfile = fileo)
          }, error = function(e) paste0(datei, ": ", e))
        } 
        return(fileo)
      }) 
      
      while(!any(resolved(flist))) {
        print("Wait for resolved...")
        Sys.sleep(0.1)
      }
      fs <- unlist(flist, use.names = FALSE)
      chkfs <- all(file.exists(fs))
      if (chkfs) {
        print(paste0("All resolved check: ", as.character(chkfs)))
      } else {
        chkt <- which(!file.exists(fs))
        print(paste0("All resolved BUT NOT exist: ", paste(chkt, collapse=",")))
        fs <- fs[-chkt]
      }
      sts <- read_stars(fs)
      
      future_lapply(c("anom", "ice", "sst"), function(var) {
        z <- sts %>% select(var) %>% adrop %>% aggregate(by=paste0(days, " days"), FUN=mean, na.rm=TRUE)
        filet <- paste0("../data_src/oisst/monthly_", var, "/", i, monj, "_", var, ".nc")
        write_stars(z, filet)
        if (var=="ice") {
          #vart <- "icemask"
          z <- sts %>% select(var) %>% adrop %>% aggregate(by="months",FUN=icedayx) %>%
               aggregate(by="months",FUN=icemaskx, days=days)
          filet <- paste0("../data_src/oisst/monthly_icemask", "/", i, monj, "_icemask.nc")
          write_stars(z, filet)
        }
      })
    }
  if (i!=curryr) try(system(paste0("zip -j -m -9 ", dest, "zip/", i, ".zip ", dest, prex, ".", i, "*.nc")))
}

## Only check
plot_stars("../data_src/oisst/monthly_sst/198212_sst.nc", "", "sst")
plot_stars("../data_src/oisst/monthly_anom/198202_anom.nc", "", "anom")
plot_stars("../data_src/oisst/monthly_icemask/198212_icemask.nc", "", "icemask")

## Read back https://r-spatial.github.io/stars/articles/stars1.html
stx <- read_stars(c("../data_src/oisst/monthly_sst/198201_sst.nc", "../data_src/oisst/monthly_sst/198202_sst.nc"), name="sst")
stx
names(stx) <- c("sst", "sst")
x <- merge(stx)
st_set_dimensions(x, 3, values = as.POSIXct(c("1982-01-01", "1982-02-01")), names = "time")

# check: NO missing_data = [1987 12;1988 1;2011 11] in https://github.com/mjacox/Thermal_Displacement/blob/master/oisst_ice_mask_monthly.m

