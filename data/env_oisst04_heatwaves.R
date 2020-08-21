# Marine Heatwaves: https://www.nature.com/articles/s41586-020-2534-z
# Note that in original paper by Jacox 2020: "For each grid cell we calculated time series of SST anomalies relative to 
#   the 1982–2011 climatology and classified MHWs as periods with SST anomalies above a seasonally varying 90th-percentile 
#   threshold (Extended Data Fig. 5). Our analysis differs from those used in some other studies in that 
#   we used monthly averaged SST rather than daily data..." AND Here we do not implement "detrend" global trend in paper 
# ref: https://github.com/mjacox/Thermal_Displacement/blob/master/define_heatwaves.m

library(stars)
library(data.table)
library(magrittr)
library(abind)
library(dplyr)

yrng <- seq(1982,2020)
clim_years = seq(1982,2011) #for climatology
climyrs<- clim_years[length(clim_years)] - clim_years[1] + 1 #30 yrs
monstr <- c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")

library(future.apply)
plan(multisession)
options(future.globals.maxSize= 1048576000*2)

#### Define Marine heatwave is monthly anomaly > 90% historical anomaly
Thresh <- 0.9
Detrend <- TRUE
if (Detrend) {
  prex <- "../data_src/oisst/monthly_anom_detrend/"
  outd <- "../data_src/oisst/monthly_heatwave_detrend/"
} else {
  prex <- "../data_src/oisst/monthly_anom_icemask/"
  outd <- "../data_src/oisst/monthly_heatwave/"
}


sty <- future_lapply(1:12, function(j) {
  if (j==1) {
    winj = c(12, 1, 2)
  } else if (j==12) {
    winj = c(11, 12, 1)
  } else {
    winj = c(j-1, j , j+1)
  }
  monj <- fifelse(winj<10, paste0("0",winj), paste0(winj))
  jstr <- monstr[j]
  for (i in clim_years) {
    if (winj[1] == 12 & (i-1)>=clim_years[1]) {
      x0 <- read_stars(paste0(prex, i-1, monj[1], "_anom.nc"))
    } else if (winj[1] == 12 & i==clim_years[1]) {
      x0 <- NULL
    } else {
      x0 <- read_stars(paste0(prex, i, monj[1], "_anom.nc"))
    }
    
    x1 <- read_stars(paste0(prex, i, monj[2], "_anom.nc"))
    
    if (winj[3] == 1 & (i+1)<=clim_years[length(clim_years)]) {
      x2 <- read_stars(paste0(prex, i+1, monj[3], "_anom.nc"))
    } else if (winj[3] == 1 & i==clim_years[length(clim_years)]) {
      x2 <- NULL
    } else {
      x2 <- read_stars(paste0(prex, i, monj[3], "_anom.nc"))
    }
    
    if (is.null(x0)) {
      x <- c(x1, x2)
      datex<- c(as.Date(paste0(i, monj[2], "01"), format="%Y%m%d"),
                as.Date(paste0(i, monj[3], "01"), format="%Y%m%d"))
    } else if (is.null(x2)) {
      x <- c(x0, x1)
      datex<- c(as.Date(paste0(i, monj[1], "01"), format="%Y%m%d"),
                as.Date(paste0(i, monj[2], "01"), format="%Y%m%d"))
    } else {
      x <- c(x0, x1, x2)
      datex<- c(fifelse(winj[1]==12, as.Date(paste0(i-1, monj[1], "01"), format="%Y%m%d"), as.Date(paste0(i, monj[1], "01"), format="%Y%m%d")),
                as.Date(paste0(i, monj[2], "01"), format="%Y%m%d"),
                fifelse(winj[3]==1, as.Date(paste0(i+1, monj[3], "01"), format="%Y%m%d"), as.Date(paste0(i, monj[3], "01"), format="%Y%m%d")))
    }
    
    if (i == clim_years[1]) {
      styx <- x
      datey<- datex
    } else {
      styx <- c(styx, x)
      datey<- c(datey, datex)
    }
  }
  names(styx) <- rep(jstr, length(names(styx)))
  styx <- merge(styx) %>% st_set_dimensions(3, values = as.POSIXct(datey), names = "time") %>% 
    aggregate(by=paste0(climyrs, " years"), FUN=quantile, na.rm=TRUE, probs=Thresh, names=FALSE)
  names(styx)[1] <- jstr
  styx <- styx %>% dplyr::select(jstr) %>% adrop
  return (styx)
})

## Update 20200814: only fetch till 20200727 ([1] "All resolved BUT NOT exist: 28,29,30,31") 
trackdate <- seq.Date(as.IDate("2020-07-27")-6, as.IDate("2020-07-27"), by="day")
curryr <- year(as.IDate("2020-07-27"))
currmo <- month(as.IDate("2020-07-27"))

for (i in yrng) {
  mmx <- fifelse(i==curryr, currmo-1L, 12L)
  for (j in 1:mmx) {
    monj <- fifelse(j<10, paste0("0",j), paste0(j))
    jstr <- monstr[j]
    
    z <- read_stars(paste0(prex, i, monj, "_anom.nc"))
    names(z)[1] <- "heatwave" 
    zt <- matrix(rep(0, len=1440*720), nrow = 1440)
    zt[which(z[[1]]>=sty[[j]][[1]])] <- 1
    z[[1]] <- zt

    #x[[1]] <- x[[1]] - stm[[j]][[1]]
    filet <- paste0(outd, i, monj, "_heatwave.nc")
    write_stars(z, filet)
  }
}

## Just check
tt <- as.data.table(z) %>% 
  .[,`:=`(longitude=fifelse(x>180, x-360, x), latitude=y)] %>% .[,.(longitude, latitude, heatwave)]

gx  <- ggplot() +  
  geom_tile(data=tt, aes_string(x="longitude", y="latitude", fill="heatwave"), alpha=0.8) + 
  scale_fill_viridis() +
  geom_sf(data = ne_coastline(scale = "large", returnclass = "sf"), color = 'darkgray', size = .3) +
  coord_sf() + 
  xlim(c(-180, 180)) + ylim(c(-90, 90))  

zt <- read_stars(paste0("../data_src/oisst/monthly_heatwave/", 2020, "06", "_heatwave.nc"))
names(zt)[1] <- "heatwave"

zt <- as.data.table(zt) %>% 
  .[,`:=`(longitude=fifelse(x>180, x-360, x), latitude=y)] %>% .[,.(longitude, latitude, heatwave)]

gy  <- ggplot() +  
  geom_tile(data=zt, aes_string(x="longitude", y="latitude", fill="heatwave"), alpha=0.8) + 
  scale_fill_viridis() +
  geom_sf(data = ne_coastline(scale = "large", returnclass = "sf"), color = 'darkgray', size = .3) +
  coord_sf() + 
  xlim(c(-180, 180)) + ylim(c(-90, 90))  

layt <- rbind(c(1,1),
              c(2,2))
grid.arrange(gx, gy, layout_matrix=layt) #compare detrend and not_detrend results


