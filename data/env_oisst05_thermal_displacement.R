# Thermal displacement by marine heatwaves By Jacox et al. 2020 https://www.nature.com/articles/s41586-020-2534-z
# ref: https://github.com/mjacox/Thermal_Displacement/blob/master/thermal_displacement.m
library(stars)
library(data.table)
library(magrittr)
library(abind)
library(dplyr)
#library(geosphere)

# arbitary get one file to get lon-lat matrix
dt <- read_stars("../data_src/oisst/monthly_heatwave/198201_heatwave.nc") %>% as.data.table() %>%
  .[,`:=`(lng=fifelse(x>180, x-360, x), lat=y)] %>% .[,.(lng, lat)]

latx0 <- sort(unique(dt$lat))
lngx0 <- sort(unique(dt$lng))

Detrend <- TRUE ## selece result in monthly_heatwave_detrend
RE <- 6371 #km of Earth radius
res <- lngx0[2]-lngx0[1]

bbox= c(115.0, 20.0, 135.0, 35.0) #c(-180.0, -90.0, 180.0, 90.0) #first try a smaller bounding box
grd_x <- res
grd_y <- res
# hridx <- data.table(lngidx= c(which(round(lngx0,2)<=(bbox[1]+grd_x/2)) %>% .[length(.)], which(round(lngx0,2)>=(bbox[3]-grd_x/2))[1]), 
#                     latidx= c(which(round(latx0,2)<=(bbox[2]+grd_y/2)) %>% .[length(.)], which(round(latx0,2)>(bbox[4]-grd_y/2))[1]))
# dt <- CJ(hridx$lngidx[1]:hridx$lngidx[2], 
#           hridx$latidx[1]:hridx$latidx[2]) %>% setnames(1:2, c("lngx", "latx")) %>%
#   .[,`:=`(lng=lngx0[lngx], lat=latx0[latx])]
## Just test
# lngx1 <- c(-359.75, -359.5, -270.25, -270, -269.75, -180.25, -180, -179.75, 
#            -90.25, -90, -89.75, -45.25, -45, -44.75, -30.25, -30, -29.75, -1, -0.75, -0.5, -0.25, 
#            0, 0,25, 0.5, 0.75, 1, 29.75, 30, 30.25, 44.75, 45, 45.25, 89.75, 90, 90.25, 
#            179.75, 180, 180.25, 269.75, 270, 270.25, 359.5, 359.75)
# latx1 <- c(-89.875, -89.625, -45.125, -44.875, -30.125, -29.875, -1.125, -0.875, -0.625, -0.375, -0.125, 
#            0.125, 0.375, 0.625, 0.875, 1.125, 29.875, 30.125, 44.875, 45.125, 89.625, 89.875)

lngx1 <- seq(as.integer(-360*1000+grd_x*1000), 
             as.integer(360*1000-grd_x*1000), by=as.integer(grd_x*1000))/1000.0
latx1 <- rev(seq(as.integer(-90*1000+(grd_x/2)*1000), 
                 as.integer(90*1000), by=as.integer(grd_x*1000))/1000.0)

lngxt <- sort(fifelse(lngx0<0, lngx0+360, lngx0))
latxt <- rev(latx0) #in NetCDF, lat is from 89.875 to -89.875

## NOTE: very large dm
## print(object.size(dm), units="Gb") ## 11.1 Gb ## consider generate later in parallel code

# dm <- array(rep(NA_real_, length(latx1)*length(latx1)*length(lngx1)), dim=c(length(latx1),length(latx1),length(lngx1)))
# for (i in seq_along(latx1)) {
#  dm[i,,] <- Re(RE*acos(sin(latx1[i]*pi/180)*sin(latx1*pi/180) + 
#                        cos(latx1[i]*pi/180)*cos(latx1*pi/180) %*% t(cos(lngx1*pi/180))))
#}
## Just check ##
# using marked example: dim(dm) == c(22,44); tt <- dm[1,,] #i.e i=1
# tt[,1] == tt[,21] #i.e -359.75 (two longitude difference, ldif) equal ldif=-0.25, and
# tt[,2] == tt[,20]; #tt[]
# distGeo(c(-0.125, -89.875), c(-179.875, -0.125))/1000 # 10002.11
# tt[11, 37] #10007.54
# distGeo(c(-0.125, -89.875), c(-179.875, 89.875))/1000 # 20003.87
# tt[22, 37] #20015.03

# apply_oisst_masks code ref: https://github.com/mjacox/Thermal_Displacement/blob/master/apply_oisst_masks.m
# used data from env_oisst02_landsea.R
dt <- fread("../data_src/oisst/sea_icemask_025d.csv")
setnames(dt, 1:2, c("lng", "y"))
dt[,x:=fifelse(lng<0, lng+360, lng)]
setorder(dt, -y, x)
dt[,ry:=rowid(x)] ## NOTE that in OISST.nc file, y is from Northest (89.875) to Southest (-89.875)
#################### Actually, x is 0-360 in nc so is 0-180 -180-0 arranged 
mask <- dcast(dt, x ~ ry, value.var = "seamask")[,-1] %>% as.matrix()
mlon <- dcast(dt, x ~ ry, value.var = "lng")[,-1] %>% as.matrix()
mlat <- dcast(dt, x ~ ry, value.var = "y")[,-1] %>% as.matrix()

apply_oisst_masks <- function(ii, jj, d_mask) { #, mask, mlat, mlon) {
# ====================================================
# Inputs:
#       ii: longitude index on OISST grid
#       jj: latitude index on OISST grid
#       d:  matrix of distances to all other OISST grid cells
#           from point [ii, jj]. Dimensions are [lon lat]
#       mask: mask defining regions, created by make_oisst_masks.m
#             Dimensions are [lon lat]
#       lat:  Matrix of OISST latitudes
#       lon:  Matrix of OISST longitudes
# Output:
#       d_mask: matrix of distances with unavailable locations masked out
  # d_mask <- d
  # Exclude ice-surrounded areas
  d_mask[mask==3] <- NA_real_
  if (!is.na(mask[ii, jj])) {
    maskij <- letters[as.integer(mask[ii, jj])]
    # Handle regional cases
    switch(maskij,
           d = { d_mask[mask != 4] <- NA_real_ }, # maskij ==  4
           e = { d_mask[mask != 5] <- NA_real_ }, # maskij ==  5
           f = {
             d_mask[mask<=5 | mask==7 | mask==8 | mlat>48 | (mlat>43 & mlon>351)] <- NA_real_
             if (mlon[ii,jj]>12 & mlon[ii,jj]<20 & mlat[ii,jj]>42.3 & mlat[ii,jj]<46) {
               d_mask[mask!=6] <- NA_real_
             }
           }, # maskij ==  6
           g = { d_mask[!(mask==7 | mask==11)] <- NA_real_ },  # maskij ==  7
           h = { d_mask[!(mask==8 | mask==9)] <- NA_real_ },   # maskij ==  8
           i = { d_mask[!(mask==7 | mask==8 | mask==9 | mask==11)] <- NA_real_ }, # maskij ==  9
           j = { d_mask[!(mask==10 | mask==11)] <- NA_real_ }, # maskij ==  10
           k = { d_mask[(mask>=4 & mask<=6) | mask==12] <- NA_real_ }, # maskij ==  11
           l = { d_mask[mask>=9 & mask<=11] <- NA_real_ }, # maskij ==  12
           m = { d_mask[!(mask==13 | mask==14)] <- NA_real_ }, # maskij ==  13
           n = { d_mask[(mask>=15 & mask<=17) | mlat>283] <- NA_real_ }, # maskij ==  14
           o = { d_mask[mask==2 | mask==13 | mask==14 | mask==17 | mlon<260 | mlon>280] <- NA_real_ }, # maskij ==  15
           p = { d_mask[mask==13 | mask==14 | mlon<260] <- NA_real_ }, #maskij ==  16
           q = { d_mask[mask==15] <- NA_real_ } # maskij ==  17
    )
  }
  return(d_mask)
}

# code ref: https://github.com/mjacox/Thermal_Displacement/blob/master/thermal_displacement.m
if (Detrend) {
  indir <- "../data_src/oisst/monthly_heatwave_detrend/"
  andir <- "../data_src/oisst/monthly_anom_detrend/"
} else {
  indir <- "../data_src/oisst/monthly_heatwave/"
  andir <- "../data_src/oisst/monthly_anom/"
}

td_max = 3000 # km
latn <- length(latx1) #dim(dm)[2] #720
dlon <- length(lngx1) #dim(dm)[3] #2879 (difference of longitude)
lonn <- dim(mask)[1] #1440

## Update 20200814: only fetch till 20200727 ([1] "All resolved BUT NOT exist: 28,29,30,31") 
yrng <- seq(1982,2020)
trackdate <- seq.Date(as.IDate("2020-07-27")-6, as.IDate("2020-07-27"), by="day")
curryr <- year(as.IDate("2020-07-27"))
currmo <- month(as.IDate("2020-07-27"))
#monstr <- c("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")

setkey(dt, x, y)
rowGrp <- 4L

library(future.apply)
plan(multisession)
options(future.globals.maxSize= 1048576000*2)

for (i in yrng) {
  mmx <- fifelse(i==curryr, currmo-1L, 12L)
  for (j in 1:mmx) {
    monj <- fifelse(j<10, paste0("0",j), paste0(j))
    #jstr <- monstr[j]
    print(paste0("Now in Year-month: ", i," - ", monj, " to calculate thermal displacement"))
    filet <- paste0("../data_src/oisst/thermal_displace/", i, monj, "_td.csv")
    if (!file.exists(filet)) {
      z <- read_stars(paste0(indir, i, monj, "_heatwave.nc"))
      names(z)[1] <- "heatwave" 
      sst <- read_stars(paste0("../data_src/oisst/monthly_sst/", i, monj, "_sst.nc"))
      names(sst)[1] <- "sst" 
      anom <- read_stars(paste0(andir, i, monj, "_anom.nc"))
      names(anom)[1] <- "anom"
      zd <- merge(as.data.table(z) %>% setkey(x,y), dt[,.(x,y,lng,seamask)], by=c("x","y"), all=T)[
        heatwave==1 & (is.na(seamask) | seamask >3), .(lng, y, heatwave, seamask)][
          ,`:=`(xd=NA_real_, yd=NA_real_, ddis=NA_real_, 
                sst=NA_real_, anom=NA_real_, sst_dis=NA_real_, td_flag=NA, 
                rowgrp=cut(seq_len(.N), rowGrp, labels = FALSE))] #%>%
        #.[sample.int(nrow(.), 3000),] ## Just test performance bottelneck
      setnames(zd, 2, "lat")
      
      #print("Start get_tdx...")
      get_tdx <- function(lng, lat) {
        lngt <- fifelse(lng<0, lng+360, lng)
        ii <- which(lngxt==lngt)
        it <- which(lngx0==lng)
        jt <- which(latx0==lat)
        jj <- latn-jt+1 ## NetCDF lat in rev order
        #if (is.na(mask[ii, jj]) | mask[ii, jj] > 3) { #z[[1]][ii, jj]==1 & () ## already check in zd[]
          ## (old version) Note that dm (aboving), diff of lng order is reversed to match NetCDF, not the same of ref matlab
          ## (old version use whole dm 11GB too large)
          ## d_lat <- apply_oisst_masks(ii, jj, t(dm[jj, ,seq(it, it+lonn-1)])) #, mask, latm, lngm) #t(dm[jj, ,seq(dlon-lonn-it+2, dlon-it+1)])
          
          rlng <- seq(as.integer((0.125-lngt)*1000), 
                      as.integer((359.875-lngt)*1000), by=as.integer(grd_x*1000))/1000.0
          #rlng <- lngx1[seq(dlon-lonn-it+2, dlon-it+1)] #seq(it, it+lonn-1)
          #dm <- array(rep(NA_real_, length(latx1)*length(rlng)), dim=c(length(latx1),length(rlng)))
          dm <- t(Re(RE*acos(sin(latx1[jj]*pi/180)*sin(latx1*pi/180) + 
                             cos(latx1[jj]*pi/180)*cos(latx1*pi/180) %*% t(cos(rlng*pi/180)))))
          # print(object.size(dm), units="Mb") ## 7.9 Mb << 11Gb !!
          # print(paste0("After matrix multiplication: ", rowid))
          
          d_lat <- apply_oisst_masks(ii, jj, dm) #, mask, latm, lngm) #t(dm[jj, ,seq(dlon-lonn-it+2, dlon-it+1)])
          sst_norm <- sst[[1]][ii,jj] - anom[[1]][ii,jj]; # i.e. climatology, because sst - climatology = anomaly
          d_lat[is.na(sst[[1]]) | sst[[1]]>sst_norm | d_lat>td_max] <- NA_real_;
          idx <- which(!is.na(d_lat))
          if (any(idx)) {
            minidx <- which.min(d_lat[idx])
            xt <- idx[minidx] %% lonn
            yt <- as.integer(idx[minidx]/lonn)
            yt <- fifelse(xt==0, yt, yt+1)
            xt <- fifelse(xt==0, lonn, xt)
            xx <- lngxt[xt]
            xx <- fifelse(xx>180, xx-360, xx)
            yy <- latxt[yt]
            #zd[lng==lngx0[ii] & lat==latx0[jt], `:=`
            return(list(xd=xx, yd=yy, ddis=d_lat[idx[minidx]], 
                        sst=sst[[1]][ii,jj], anom=anom[[1]][ii,jj], sst_dis=sst[[1]][xt,yt], td_flag=TRUE)) #]
          } else {
            #zd[lng==lngx0[ii] & lat==latx0[jt], `:=`
            return(list(xd=NA_real_, yd=NA_real_, ddis=NA_real_, 
                        sst=sst[[1]][ii,jj], anom=anom[[1]][ii,jj], sst_dis=NA_real_, td_flag=FALSE)) #]
          }
        #}
      }
      
      #for (ii in seq_along(lngx0)) {
      #  for (jj in seq_along(latx0)) {
      zdx <- rbindlist(future_lapply(seq_len(rowGrp), function(grp) {
        x <- zd[rowgrp==grp, ]
        return(
          x[,c("xd", "yd", "ddis", "sst", "anom", "sst_dis", "td_flag"):=get_tdx(lng, lat), by = 1:nrow(x)] 
        )
      }), use.names = TRUE, fill = TRUE)
      #} #use rowGrp =3 with future_lapply for nrow=3000 user  system elapsed 0.742   0.033  70.476 
         #use rowGrp =4 for nrow=3000  user  system elapsed 0.867   0.048  60.149 
         #For one month data 1400x720 rows need  user   system  elapsed 21.244    1.086 3309.989 
      #zd[#heatwave==1 & (is.na(seamask) | seamask >3)
      #  , c("xd", "yd", "ddis", "sst", "anom", "sst_dis", "td_flag"):=get_tdx(lng, lat, rowid), by = 1:nrow(zd)] #by=.(lng, lat)]
      setkey(zdx, lng, lat)
      fwrite(zdx[,rowgrp:=NULL], file= filet)
      #} #for-loop is very slow
    }
  }
}




## Just check with plot
library(ggplot2)
library(viridis)
library(sf)
library(rnaturalearth)
library(grid)
library(gridExtra)
library(MASS)

zt <- fread("../data_src/oisst/thermal_displace/201908_td.csv") %>%
  .[td_flag==TRUE,] 
# .[lat>=46 & lat<=62 & lng >= -160 & lng <= -140,]

zd <- zt[,.(lng,lat,sst)][,label:="A"] %>%
  list(zt[,.(xd,yd,sst_dis)][,label:="B"] %>% setnames(1:3,c("lng","lat","sst"))) %>%
  rbindlist(use.names = T, fill=T)

# https://stackoverflow.com/questions/48282989/show-only-high-density-areas-with-ggplot2s-stat-density-2d
nzd <- zd %>% group_by(label) %>% do(Dens=kde2d(.$lng, .$lat, n=100, lims=c(c(-180,180),c(-90,90))))
nzd %<>% do(label=.$label, V=expand.grid(.$Dens$x,.$Dens$y), Value=c(.$Dens$z)) %>% 
  do(data.frame(label=.$label,x=.$V$Var1, y=.$V$Var2, Value=.$Value))

#nzd %<>% spread(label,value=Value) %>%
#  mutate(Level = if_else(A>B, A, B), label = if_else(A>B,"A", "B"))

ggplot(nzd, aes(x,y, z=Value, fill=label, alpha=..level..)) + stat_contour(geom="polygon")

tt <- read_stars(paste0("../data_src/oisst/monthly_heatwave_detrend/", 2019, "08", "_heatwave.nc"))
names(tt)[1] <- "heatwave"
tt <- as.data.table(tt) %>% 
  .[,`:=`(longitude=fifelse(x>180, x-360, x), latitude=y)] %>% .[,.(longitude, latitude, heatwave)]

ggplot() +  
  geom_tile(data=tt, aes_string(x="longitude", y="latitude", fill="heatwave"), alpha=0.8) + 
  scale_fill_viridis() +
  #stat_contour(data=nzd, aes(x=x, y=y, z=Value, color=label), geom="polygon", alpha=0.5) +
  #stat_contour(data=zd, aes(x=lng, y=lat, z=sst, fill=after_stat(level), color=label), geom="polygon", alpha=0.5) +
  stat_density2d(data=zd, aes(x=lng, y=lat, fill=after_stat(level), color=label), alpha=0.6, geom="polygon") + 
  #geom_point(data=zt, aes(x=lng, y=lat), size=2) + #, color=factor(seamask)
  #geom_segment(data=zt,aes(x=lng, xend=xd, y=lat, yend=yd), size = 1, arrow = arrow(length = unit(0.08, "cm"))) + #, color=factor(seamask)
  geom_sf(data = ne_coastline(scale = "large", returnclass = "sf"), color = 'darkgray', size = .3) +
  guides(color=FALSE, fill=FALSE) + 
# coord_sf() + xlim(c(-140, -160)) + ylim(c(46, 62))  
  coord_sf() + xlim(c(-180, 180)) + ylim(c(-90, 90))  




## 
library(sp)
library(sf)
library(rgdal)
library(geosphere)
library(maptools)
library(spatstat)
library(rgeos)
library(raster)

# zt <- fread("../data_src/oisst/thermal_displace/201908_td.csv") %>%
#   .[td_flag==TRUE,]
# mdist <- distm(as_Spatial(zf$geometry)) ## too big
# https://www.r-bloggers.com/aggregating-spatial-points-by-clusters/
zf <- st_as_sf(setDF(zt[,.(lng, lat, sst, anom)]), coords=c("lng", "lat"))
pts<- as.ppp(zf)

#zf.km <- rescale(zf, 1000, "km")  
x <- list(x=c(-180, 180), y=c(-90,90))
extent(x)
kzf <- density(pts, adjust = 0.2, cut=6) #, ext=extent(x))
plot(kzf, main=NULL, las=1)
contour(density(pts, adjust = 0.2), nlevels = 6) 

gzf <- as(kzf, "SpatialGridDataFrame")  # convert to spatial grid class
igzf<- as.image.SpatialGridDataFrame(gzf)  # convert again to an image
cgzf <- contourLines(igzf, nlevels = 8)  # create contour object - change 8 for more/fewer levels
sldf <- ContourLines2SLDF(cgzf, CRS("+proj=utm +zone=19 +datum=NAD83 +units=m +no_defs"))  # convert to SpatialLinesDataFrame
plot(sldf, col = terrain.colors(8))

Polyclust <- gPolygonize(sldf[5, ])
gas <- gArea(Polyclust, byid = T)/10000
Polyclust <- SpatialPolygonsDataFrame(Polyclust, data = data.frame(gas), match.ID = F)
plot(Polyclust)

zsf <- st_sf(zf, crs=4326)
#zst <- as(zsf$geometry,"Spatial")
#crs(zst) <- "+proj=utm +zone=19 +datum=NAD83 +units=m +no_defs"
zst <- SpatialPointsDataFrame(st_coordinates(zf), data.frame(ID=1:nrow(zsf)), 
                              proj4string = CRS("+proj=utm +zone=19 +datum=NAD83 +units=m +no_defs"))
cag <- aggregate(zst, by = Polyclust, FUN = length)
plot(kzf, main=NULL, las=1, box=FALSE,axes=FALSE, ribbon =FALSE, useRaster=FALSE, xlim=c(-180,180), ylim=c(-90,90))
plot(sldf, col = terrain.colors(8), add = T)
plot(cag, col = "red", border = "white", add = T)
#graphics::text(coordinates(cag) + 1000, labels = cAg$CODE)

sin <- zst[cag, ]  # select the stations inside the clusters
sout<- zst[!row.names(zst) %in% row.names(sin), ]  # stations outside the clusters
#plot(sout) #, add=T)  # the more sparsely distributed points - notice the 'holes' of low density
#plot(cag, border = "red", lwd = 3, add = T)


## Just test (old version)
# lat = latx0; lon = lngx0
# which(lon>=26 & lon<=37) #825 ..... 868
# which(lat>=30.5 & lat<=39.5) #483.. 518
# ii=826; jj=484
# lngx0[ii]; latx0[jj]  #26.375 #30.875
# lngx1[range(seq(dlon-lonn-ii+2, dlon-ii+1))]  #lngx1[c(615, 2054)] => c(-206.25  153.50) => -179.875-26.375, 179.875-26.375
# BUT it's land, so seamask==0
# change to c(35.875 35.375) #ii=which(lon==35.875); jj=which(lat==35.375) #864, 502 
# d_mask <- t(dm[jj, ,seq(dlon-lonn-ii+2, dlon-ii+1)])
