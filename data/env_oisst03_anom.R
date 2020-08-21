## Compare anormly of OISST computed with provided data
## data source (refer to env_oisst01.R)
## ref: https://github.com/mjacox/Thermal_Displacement/blob/master/oisst_an.m
library(stars)
library(data.table)
library(magrittr)
library(abind)
library(dplyr)

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

yrng <- seq(1982,2020)
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

save(stm, file="../data_src/oisst/sst_1982_2011month_climatology_nc.RData")


#### Double check if the plots is right ####
#### download NetCDF OISST (0.5d, monthly mean) from ftp://ftp.cdc.noaa.gov/Datasets/noaa.oisst.v2/sst.mnmean.nc 
library(ncdf4)
library(sf)
library(rnaturalearth)

nx0 <- nc_open("../data_src/oisst/sst.mnmean.nc") 
print(nx0) ## sst[lon,lat,time]   (Chunking: [360,180,464])
latn1<- ncvar_get(nx0, "lat") # 89.5 - -89.5
lngn1<- ncvar_get(nx0, "lon") # 0 - 359.5
time<- ncvar_get(nx0, "time") # 1981-12.01 - 2020-07-01, we now check every March, and August
date<- time %>%  as.Date(origin="1800-01-01 00:00:0.0") 

maridx <- seq(4, 464, by = 12) #check date[maridx]
augidx <- seq(9, 464, by = 12)
#yrng <- seq(1982,2019)
#clim_years = seq(1982,2011) #for climatology

get_sstmx <- function (midx, minsst=-2, maxsst=32.5) {
  dt <- as.data.table(ncvar_get(nx0, "sst")[,,midx]) %>% 
    .[,.(sstm=mean(value, na.rm=TRUE)), by=.(V1,V2)] %>%
    .[,`:=`(longitude=fifelse(lngn1[V1]>180, lngn1[V1]-360, lngn1[V1]), latitude=latn1[V2])] %>%
    .[,.(longitude, latitude, sstm)]
  
  gx <- ggplot() + 
    geom_tile(data=dt, aes_string(x="longitude", y="latitude", fill="sstm"), alpha=0.8) + 
    scale_fill_viridis(limits=c(minsst, maxsst)) +
    geom_sf(data = ne_coastline(scale = "large", returnclass = "sf"), color = 'darkgray', size = .3) +
    coord_sf() + 
    xlim(c(-180, 180)) + ylim(c(-90, 90))
  
  return(gx)  
}

gx3 <- get_sstmx(maridx)
gx8 <- get_sstmx(augidx)

# stm from aboving code 
# load("../data_src/oisst/sst_1982_2011month_climatology_nc.RData")
gt3 <- gplotx(stm[[3]], "Mar", returnx=TRUE)  
gt8 <- gplotx(stm[[8]], "Aug", returnx=TRUE)  

lay2 <- rbind(c(1,1,2,2),
              c(3,3,4,4))
grid.arrange(gx3, gt3, gx8, gt8, layout_matrix=lay2)
# ---- Only a double check to see the long-term average is correct ####

#### Evaluate anormaly by substrating long-term mean ####
## trackdate <- seq.Date(as.IDate(Sys.Date()-7), as.IDate(Sys.Date()-1), by="day")
## Update 20200814: only fetch till 20200727 ([1] "All resolved BUT NOT exist: 28,29,30,31") 
trackdate <- seq.Date(as.IDate("2020-07-27")-6, as.IDate("2020-07-27"), by="day")
curryr <- year(as.IDate("2020-07-27"))
currmo <- month(as.IDate("2020-07-27"))

#for (i in yrng) {
  i <- 1982
  mmx <- fifelse(i==curryr, currmo-1L, 12L)
  #for (j in 1:mmx) {
  j <- 1
    monj <- fifelse(j<10, paste0("0",j), paste0(j))
    jstr <- monstr[j]
  
    x <- read_stars(paste0("../data_src/oisst/monthly_sst/", i, monj, "_sst.nc"))
    names(x)[1] <- "anom" 
    x[[1]][which(landm==1)] <- NA_real_
    ice <- read_stars(paste0("../data_src/oisst/monthly_icemask/", i, monj, "_icemask.nc"))
    x[[1]][which(ice[[1]]==1)] <- NA_real_
    
    x[[1]] <- x[[1]] - stm[[j]][[1]]
  # filet <- paste0("../data_src/oisst/monthly_anom_by_sstm30yr/", i, monj, "_anom.nc")
  # write_stars(x, filet)
  #}
#}

## Just check if plot 1982-01
gx <- gplotx(x, "anom", minz=-8.5, maxz=4.5, return=TRUE)
y <- read_stars("../data_src/oisst/monthly_anom/198201_anom.nc")
names(y)[1] <- "anom" 
gy <- gplotx(y, "anom", minz=-8.5, maxz=4.5, return=TRUE)

layt <- rbind(c(1,1),
              c(2,2))
grid.arrange(gx, gy, layout_matrix=layt)
## ---- Very similar, do not need recompute, but need exclude ice and land ####

for (i in yrng) {
  mmx <- fifelse(i==curryr, currmo-1L, 12L)
  for (j in 1:mmx) {
    monj <- fifelse(j<10, paste0("0",j), paste0(j))
    jstr <- monstr[j]
    
    z <- read_stars(paste0("../data_src/oisst/monthly_anom/", i, monj, "_anom.nc"))
    names(z)[1] <- "anom" 
    z[[1]][which(landm==1)] <- NA_real_
    ice <- read_stars(paste0("../data_src/oisst/monthly_icemask/", i, monj, "_icemask.nc"))
    z[[1]][which(ice[[1]]==1)] <- NA_real_
    
    #x[[1]] <- x[[1]] - stm[[j]][[1]]
    filet <- paste0("../data_src/oisst/monthly_anom_icemask/", i, monj, "_anom.nc")
    write_stars(z, filet)
  }
}

## It's hard/slow to detrend each x,y along almost 30yr (30x12) year trend. Must read 1440x720x30x12 at once...

yrs <- yrng[length(yrng)] - yrng[1] + 1

for (j in 1:12) {
  monj <- fifelse(j<10, paste0("0",j), paste0(j))
  jstr <- monstr[j]
  for (i in yrng) {
    #mmx <- fifelse(i==curryr, currmo-1L, 12L)
    if (i==curryr & j>(currmo-1)) break
    
    z <- read_stars(paste0("../data_src/oisst/monthly_anom_icemask/", i, monj, "_anom.nc"))

    if (i==yrng[1]) {
      stdrx <- z
      datex<- as.Date(paste0(i, monj, "01"), format="%Y%m%d")
    } else {
      stdrx <- c(stdrx, z)
      datex<- c(datex, as.Date(paste0(i, monj, "01"), format="%Y%m%d"))
    }
  }
  names(stdrx) <- rep(jstr, length(names(stdrx)))
  print(paste0("Now in Year-month: ", i," - ", monj, " and have length stdrx: ", length(datex)))
  
  predy <- function(x) { return (stats::predict(lm(x ~ seq_along(datex)))) }
  trd <- merge(stdrx) %>% st_set_dimensions(3, values = as.POSIXct(datex), names = "time") %>% 
    aggregate(by=paste0(yrs, " years"), FUN = function(y) {
       #y[[1]][] <- vapply(y[[1]], residy, numeric(1))
       if (all(is.na(y))) return(y)
       y[!is.na(y)] <- as.numeric(predy(y)) #Seems if return value has equal length, the result will be simplified by aggregate if using as.matrix
       return(list(as.numeric(predy(y)))) #residy(y)
    }) #%>% .[[1]]
  tk <- array(unlist(trd[[1]]), dim = c(length(datex),1440,720)) #bug fix: NOT each predict have the same length result (if input has NA)
  
  print(paste0("Predict ok with dim(tk): ", paste0(dim(tk), collapse=",")))
  for (k in seq_along(yrng)) {
    if (yrng[k]==curryr & j>(currmo-1)) break
    
    z <- read_stars(paste0("../data_src/oisst/monthly_anom_icemask/", yrng[k], monj, "_anom.nc"))
    notna1 <- which(!is.na(z[1][[1]]))
    notna2 <- which(!is.na(tk[k,,]))
    notna <- intersect(notna1, notna2)
    z[[1]][notna] <- z[[1]][notna]- tk[1,,][notna]
    names(z)[1] <- "anom"
    
    filet <- paste0("../data_src/oisst/monthly_anom_detrend/", yrng[k], monj, "_anom.nc")
    write_stars(z, filet)
    print(paste0("Now write Year-month: ", yrng[k], " - ", monj, " ok"))
  }
}

## Just check
zk <- read_stars(paste0("../data_src/oisst/monthly_anom_detrend/", 2020, "06", "_anom.nc"))
z <- read_stars(paste0("../data_src/oisst/monthly_anom_icemask/", 2020, "06", "_anom.nc"))
names(zk)[1] <- "anom"
names(z)[1] <- "anom"
print(range(na.omit(as.data.table(zk)$anom))) #-8.227043 11.727673
print(range(na.omit(as.data.table(z)$anom))) # -8.361936  6.181935

gz <- gplotx(z, "anom", minz = -6, maxz = 11, returnx=TRUE)  
gzk<- gplotx(zk, "anom", minz = -6, maxz = 11, returnx=TRUE)  

layt <- rbind(c(1,1),
              c(2,2))
grid.arrange(gz, gzk, layout_matrix=layt)
