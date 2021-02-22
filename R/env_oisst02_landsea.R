# Land sea mask for OISST data (env_oisst01.R)
# data source: ftp://ftp.cdc.noaa.gov/Datasets/noaa.oisst.v2/lsmask.nc (0.5 degree)
# data source: https://ldas.gsfc.nasa.gov/sites/default/files/ldas/gldas/VEG/GLDASp4_landmask_025d.nc4 (0.25 degree, 1400x600 -59.875 - 89.875)

library(stars)
library(data.table)
library(magrittr)
library(abind)
library(dplyr)
library(ggplot2)
library(viridis)

lsm <- read_stars("../data_src/oisst/GLDASp4_landmask_025d.nc4") #0 = water; 1 = land 

dt <- as.data.table(lsm)
dt[, time:=NULL] #only one time: 2000-01-01
setnames(dt, 3, "landmask")
dt[, seamask:= as.integer(!landmask)] #Now seamask 0 is land

## Read monthly icemask data, must run env_oisst01.R first
vart <- "icemask"
yrng <- seq(1982,2019)
mmx <- 12
gcnt <- 1 ## Cannot directly use sum/gcnt as average, beccause may have NA
cntm <- matrix( rep( 0, len=1440*720), nrow = 1440)
pret <- as.Date("1982-01-01")

for (i in yrng) {
  for (j in 1:mmx) { ## Certainly can read a whole year at once, not necessarily read only two months
    monj <- fifelse(j<10, paste0("0",j), paste0(j))
    print(paste0("Now in Year-month: ", i," - ", monj))
    filet <- paste0("../data_src/oisst/monthly_", vart, "/", i, monj, "_", vart, ".nc")
    curt <- as.Date(paste0(i, monj, "01"), format="%Y%m%d")
    
    if (gcnt==1) { 
      stx <- stars::read_stars(filet)
      names(stx)[1] <- vart
      stx <- stx %>% select(vart)
      cntm[which(!is.na(stx[[1]]))] <- 1
      gcnt <- gcnt + 1
      next 
    }
    x <- stars::read_stars(filet) 
    names(x)[1] <- vart 
    x <- x %>% select(vart)
    cntm[which(!is.na(x[[1]]))] <- cntm[which(!is.na(x[[1]]))] + 1
    stx <- c(stx, x)
    names(stx) <- c(vart, vart)
    stx <- merge(stx) %>% st_set_dimensions(3, values = as.POSIXct(c(pret, curt)), names = "time") %>% 
      aggregate(by="2 months", FUN=sum, na.rm=TRUE)
    names(stx) <- vart
    stx <- stx %>% select(vart) %>% adrop
    if (i==yrng[length(yrng)] & j==mmx) { ## last month
      stx[[1]] <- stx[[1]]/cntm
    } else {
      pret <- curt
      gcnt <- gcnt + 1
    }
  }
}

icemask <- as.data.table(stx)
icemask[, x:=fifelse(x>180, x-360, x)]
dt <- merge(dt, icemask, by=c("x", "y"), all=TRUE) ## this icemask is an average value through time
dt[is.na(landmask), `:=`(landmask=0, seamask=1)]
dt[seamask==1, seamask:=NA_integer_] ## reassign seamask according to average icemask
dt[, remark:=NA_character_]

## The following code ref: https://github.com/mjacox/Thermal_Displacement/blob/master/make_oisst_masks.m
## Permanent sea ice
dt[icemask>.9 & is.na(seamask), seamask := 1L]
dt[seamask==1L, remark:='Permanent sea ice']

## Seasonal sea ice
dt[icemask>0 & is.na(seamask), seamask := 2L]
dt[seamask==2L, remark:='Seasonal sea ice']

dt[,`:=`(lon=fifelse(x<0, x+360, x), lat=y, region=NA_character_)]

## Ice-free areas surrounded by sea ice
dt[lat < -63.9 & is.na(seamask), `:=`(seamask=3, region='Antarctica')]
dt[lon>12 & lon<32 & lat>53.5 & lat<=66 & is.na(seamask), `:=`(seamask=3, region='Baltic')]
dt[lon>9.9 & lon<12 & lat>53 & lat<=60 & is.na(seamask), `:=`(seamask=3, region='Baltic')]
dt[lon>36 & lon<46 & lat>63 & lat<=67 & is.na(seamask), `:=`(seamask=3, region='White')]
dt[lon>14 & lon<24 & lat>77 & lat<=81 & is.na(seamask), `:=`(seamask=3, region='Svalbard')]
dt[lon>50 & lon<190 & lat>60 & lat<=88 & is.na(seamask), `:=`(seamask=3, region='Russia')]
dt[lon>136 & lon<139 & lat>53 & lat<=54 & is.na(seamask), `:=`(seamask=3, region='Russia')]
dt[lon>158 & lon<159 & lat>52 & lat<=54 & is.na(seamask), `:=`(seamask=3, region='Russia')]
dt[lon>160 & lon<163 & lat>57 & lat<=60 & is.na(seamask), `:=`(seamask=3, region='Russia')]
dt[lon>193 & lon<207.8 & lat>57 & lat<=68 & is.na(seamask), `:=`(seamask=3, region='Alaska')]
dt[lon>207 & lon<213 & lat>60 & lat<=62 & is.na(seamask), `:=`(seamask=3, region='Alaska')]
dt[lon>228 & lon<320 & lat>62.5 & lat<=85 & is.na(seamask), `:=`(seamask=3, region='Canada/Greenland')]
dt[lon>267 & lon<284 & lat>51 & lat<=63 & is.na(seamask), `:=`(seamask=3, region='Canada')]
dt[lon>333 & lon<341 & lat>70 & lat<=84 & is.na(seamask), `:=`(seamask=3, region='Greenland')]
dt[lon>338 & lon<345 & lat>64.5 & lat<=68 & is.na(seamask), `:=`(seamask=3, region='Iceland')]
dt[lon>267 & lon<285 & lat>41 & lat<=50 & is.na(seamask), `:=`(seamask=3, region='Great Lakes')]
dt[lon>290 & lon<297 & lat>45 & lat<=50 & is.na(seamask), `:=`(seamask=3, region='NW Atlantic')]
dt[lon>302 & lon<307 & lat>47 & lat<=54 & is.na(seamask), `:=`(seamask=3, region='NW Atlantic')]
dt[seamask==3, remark:='Ice-surrounded areas'];

## Caspian Sea
dt[lon>=46 & lon<=56 & lat>=36 & lat<=48 & is.na(seamask), `:=`(seamask=4, region='Caspian Sea')]
dt[seamask==4, remark:='Caspian Sea']

## Black Sea
dt[lon>=26.8 & lon<=42 & lat>=40 & lat<=48 & is.na(seamask), `:=`(seamask=5, region='Black Sea')]
dt[seamask==5, remark:='Black Sea']

## Mediterranean Sea
dt[lon<=26.7 & lat>=30 & lat<=46 & is.na(seamask), `:=`(seamask=6, region='Mediterranean Sea')]
dt[lon>=26 & lon<=37 & lat>=30.5 & lat<=39.5 & is.na(seamask), `:=`(seamask=6, region='Mediterranean Sea')]
dt[lon>=354 & lat>=33 & lat<=41 & is.na(seamask), `:=`(seamask=6, region='Mediterranean Sea')]
dt[seamask==6, remark:='Mediterranean Sea']

## Red Sea
dt[lon>=32 & lon<=43 & lat>=12.5 & lat<=30 & is.na(seamask), `:=`(seamask=7, region='Red Sea')]
dt[seamask==7, remark:='Red Sea']

## Persian Gulf
dt[lon>=46 & lon<56 & lat>=23 & lat<=31 & is.na(seamask), `:=`(seamask=8, region='Persian Gulf')]
dt[seamask==8, remark:='Persian Gulf']

## Northern Arabian Sea
dt[lon>=45 & lon<75 & lat>=14 & lat<=28 & is.na(seamask), `:=`(seamask=9, region='Northern Arabian Sea')]
dt[seamask==9, remark:='Northern Arabian Sea']

## Northern Bay of Bengal
dt[lon>=77 & lon<99 & lat>=14 & lat<=25 & is.na(seamask), `:=`(seamask=10, region='Northern Bay of Bengal')]
dt[seamask==10, remark:='Northern Bay of Bengal']

## Equatorial Indian Ocean
dt[lon>=37 & lon<99 & lat>= -5 & lat<=15 & is.na(seamask), `:=`(seamask=11, region='Equatorial Indian Ocean')]
dt[lon>=99 & lon<=100 & lat>= -5 & lat<8 & is.na(seamask), `:=`(seamask=11, region='Equatorial Indian Ocean')]
dt[lon>100 & lon<=101 & lat>= -5 & lat<6.7 & is.na(seamask), `:=`(seamask=11, region='Equatorial Indian Ocean')]
dt[lon>101 & lon<=104 & lat>= -5 & lat< -2 & is.na(seamask), `:=`(seamask=11, region='Equatorial Indian Ocean')]
dt[seamask==11, remark:='Equatorial Indian Ocean']

## South China Sea
dt[lon>=98 & lon<120 & lat>= -5 & lat<=30 & is.na(seamask), `:=`(seamask=12, region='South China Sea')]
dt[seamask==12, remark:='South China Sea']

## Northern Gulf of California
dt[lon>=244.5 & lon<248 & lat>=29.7 & lat<=32 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[lon>=245.5 & lon<249 & lat>=29.4 & lat<=30 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[lon>=246 & lon<249 & lat>=28.9 & lat<=30 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[lon>=246.5 & lon<252 & lat>=27 & lat<=30 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[lon>=247.8 & lon<252 & lat>=26.4 & lat<=30 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[lon>=248.2 & lon<252 & lat>=25 & lat<=30 & is.na(seamask), `:=`(seamask=13, region='Northern Gulf of California')]
dt[seamask==13, remark:='Northern Gulf of California']

## Eastern Tropical Pacific
dt[lon>=245 & lon<260 & lat>= 0 & lat<=25 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=255 & lon<262 & lat>= 0 & lat<=20 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=261 & lon<270 & lat>= 0 & lat<=17 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=269 & lon<275.7 & lat>= 0 & lat<=14 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=269 & lon<282.8 & lat>= 0 & lat<=7.4 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=269 & lon<282 & lat>= 0 & lat<=8.5 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=275 & lon<277 & lat>=8.4 & lat<=9.5 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=280 & lon<281.6 & lat>=8.4 & lat<=9 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[lon>=245 & lon<295 & lat>= -30 & lat<= 0 & is.na(seamask), `:=`(seamask=14, region='Eastern Tropical Pacific')]
dt[seamask==14, remark:='Eastern Tropical Pacific']

## Northern Gulf of Mexico
dt[lon>=260 & lon<278.5 & lat>=27 & lat<=31 & is.na(seamask), `:=`(seamask=15, region='Northern Gulf of Mexico')]
dt[seamask==15, remark:='Northern Gulf of Mexico']

## Western Tropical Atlantic
dt[lon>=260 & lon<315 & lat>= -10 & lat<=27 & is.na(seamask), `:=`(seamask=16, region='Western Tropical Atlantic')]
dt[seamask==16, remark:='Western Tropical Atlantic']

## US East Coast
dt[lon>=278.5 & lon<315 & lat>=27 & lat<=47 & is.na(seamask), `:=`(seamask=17, region='US East Coast')]
dt[seamask==17, remark:='US East Coast']

## Treat some water bodies as land ## https://github.com/mjacox/Thermal_Displacement/blob/master/oisst_an.m
dt[lon>=267 & lon<285 & lat>=41 & lat<=50, seamask:=0] ## Great lakes
dt[lon>=269.5 & lon<270.5 & lat>=30 & lat<=31, seamask:=0]; ## Lake Ponchartrain

## just check
ggplot() +  
  geom_tile(data=dt, aes_string(x="x", y="y", fill="seamask"), alpha=0.8) + 
  scale_fill_viridis() +
  coord_equal() + 
  xlim(c(-180, 180)) + ylim(c(-90, 90))

## output 
dt[,`:=`(lon=NULL, lat=NULL, landmask=NULL)]
fwrite(dt, file="../data_src/oisst/sea_icemask_025d.csv")
save(stx, file="../data_src/oisst/sea_icemask_1982_2019avg_nc.RData")
