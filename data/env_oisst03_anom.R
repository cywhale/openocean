## Compare anormly of OISST computed with provided data
## data source (refer to env_oisst01.R)
## ref: https://github.com/mjacox/Thermal_Displacement/blob/master/oisst_an.m
library(stars)
library(data.table)
library(magrittr)

land_mask <- fread("../data_src/oisst/sea_icemask_025d.csv") %>%
  .[, `:=`(x= fifelse(x<0, x+360, x), landmask= fifelse(!is.na(seamask) & seamask==0, 1L, 0L))] %>%
  .[, .(x, y, landmask)]  ##%>% dcast first column is x, and column name is y
setorder(land_mask, -y, x)
land_mask[,ry:=rowid(x)]
yy <- unique(land_mask[,.(y, ry)]) ## check, NOTE that in OISST.nc file, y is from Northest (89.875) to Southest (-89.875)

landm <- dcast(land_mask, x ~ ry, value.var = "landmask")
xx <- as.numeric(landm[,1]$x)
landm <- as.matrix(landm[,-1])

## xt <- read_stars("../data_src/oisst/monthly_sst/198201_sst.nc") %>% as.data.frame()
## all.equal(xx, xt$x[1:1440]) ## TRUE

initialTrial <- FALSE
if (initialTrial) { #### Just a trial ###########
  x <- read_stars(c("../data_src/oisst/monthly_sst/198201_sst.nc", "../data_src/oisst/monthly_sst/198202_sst.nc"), name="sst")
  names(x) <- c("Jan", "Feb")
  
  ## Just check if landm mask really on land ####
  x$Jan[1, which(landm[1,]==1)]
  x$Jan[1, which(landm[41,]==1)]
  yt=data.table(y=yy$y[as.integer(names(landm[1,which(landm[1,]==1)]))]) %>% 
    .[,x:=xx[1]] %>% list(., data.table(y=yy$y[as.integer(names(landm[41,which(landm[41,]==1)]))]) %>% 
                            .[,x:=xx[41]]) %>% rbindlist(use.names = T)
  
  land_mask[,`:=`(lon=fifelse(x>180, x-360, x), lat=y)]
  yt[,`:=`(lon=fifelse(x>180, x-360, x), lat=y)]
  ggplot() +  
    geom_tile(data=land_mask, aes_string(x="lon", y="lat", fill="landmask"), alpha=0.8) + 
    geom_point(data=yt, aes(lon,lat), color="red") + 
    scale_fill_viridis() +
    coord_equal() + xlim(c(-15,15)) + ylim(c(min(yt$y)-5, max(yt$y)+5))
  ###############################################
  
  ## tt <- copy(x$Jan)
  x$Jan[which(landm==1)] <- NA_real_
  ## gplotx(x, "Jan") ## Check: This function is in env_oisst01.R
  ice <- read_stars(c("../data_src/oisst/monthly_icemask/198201_icemask.nc", 
                      "../data_src/oisst/monthly_icemask/198202_icemask.nc"))
  names(ice) <- c("Jan", "F2eb")
  x$Jan[which(ice$Jan==1)] <- NA_real_
  ## gplotx(x, "Jan") ## Check: This function is in env_oisst01.R
  
  x2 <- read_stars(c("../data_src/oisst/monthly_sst/198301_sst.nc", "../data_src/oisst/monthly_sst/198302_sst.nc"), name="sst")
  names(x2) <- c("Jan", "Feb")
  x2$Jan[which(landm==1)] <- NA_real_
  x2$Jan[which(ice$Jan==1)] <- NA_real_
  
  xt <- c(x %>% select("Jan"), x2 %>% select("Jan"))
  names(xt) <- c("Jan", "Jan")
  xt <- merge(xt) 
  names(xt) <- "Jan"
  xt <- xt %>% st_set_dimensions(3, values = as.POSIXct(c("1982-01-01", "1983-01-01")), names = "time") %>% 
    aggregate(by="2 years", FUN=mean, na.rm=TRUE) %>% select(Jan) %>% adrop
  
  gplotx(xt, "Jan")  
}

yrng <- seq(1982,2019)
clim_years = seq(1982,2011) #for climatology
climyrs<- clim_years[length(clim_years)] - clim_years[1] + 1 #30 yrs
monstr <- c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")

library(future.apply)
plan(multisession)
options(future.globals.maxSize= 1048576000)

stm <- future_lapply(1:12, function(j) {
  monj <- fifelse(j<10, paste0("0",j), paste0(j))
  jstr <- monstr[j]
  for (i in clim_years) {
    x <- read_stars(paste0("../data_src/oisst/monthly_sst/", i, monj, "_sst.nc"))
    names(x)[1] <- jstr 
    x[[1]][which(landm==1)] <- NA_real_
    ice <- read_stars(paste0("../data_src/oisst/monthly_icemask/", i, monj, "_icemask.nc"))
    x[[1]][which(ice[[1]]==1)] <- NA_real_
    if (i == clim_years[1]) {
      stmx <- x
      datex<- as.Date(paste0(i, monj, "01"), format="%Y%m%d")
    } else {
      stmx <- c(stmx, x)
      datex<- c(datex, as.Date(paste0(i, monj, "01"), format="%Y%m%d"))
    }
  }
  names(stmx) <- rep(jstr, length(names(stmx)))
  stmx <- merge(stmx) %>% st_set_dimensions(3, values = as.POSIXct(datex), names = "time") %>% 
    aggregate(by=paste0(climyrs, " years"), FUN=mean, na.rm=TRUE)
  names(stmx)[1] <- jstr
  stmx <- stmx %>% select(jstr) %>% adrop
  return (stmx)
})

plotx <- vector("list", length = 12)
pstrx <- '';
for (j in 1:12) {
  plotx[[j]] <- gplotx(stm[[j]], monstr[j], returnx = TRUE)
  pstrx <- paste0(pstrx, "plotx[[", j, "]],") ##,ifelse(j==12, "]]", "]],"))
}

library(grid)
library(gridExtra)
lay1 <- rbind(c(1,1,2,2,3,3),
              c(4,4,5,5,6,6),
              c(7,7,8,8,9,9),
              c(10,10,11,11,12,12))
evplot <- paste0('grid.arrange(', pstrx, ' layout_matrix=lay1)') #(globs = list())
eval(parse(text=evplot))
#### Double check if the plots is right ####
#### download NetCDF OISST (0.5d, monthly mean) from ftp://ftp.cdc.noaa.gov/Datasets/noaa.oisst.v2/sst.mnmean.nc 











