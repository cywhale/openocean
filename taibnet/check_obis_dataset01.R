## Get OBIS copepoda data in south china sea (region id: 34332, 40336 from OBS mapper https://mapper.obis.org/ )

library(robis)
library(data.table)
library(magrittr)
library(ggplot2)
library(sf)
library(rnaturalearth)

dt <- robis::occurrence("Copepoda", areaid =c(34332, 40336), ## South China Sea
                        fields = c("scientificName", "decimalLongitude", "decimalLatitude","eventDate", "depth",
                            "minimumDepthInMeters", "maximumDepthInMeters", "originalScientificName", "taxonRank", "occurrenceID", 
                            "bibliographicCitation", "datasetName", "samplingProtocol", "references", "occurrenceRemarks"))
setDT(dt)
dt1 <- dt[taxonRank=="species" & grepl("Density=", occurrenceRemarks),]
#norw(dt1) taxonRank == species: 564, if not noly species have #567 records

unique(dt1$bibliographicCitation)

#[1] "Johan, I., M.K. Abu Hena, M.H. Idris and A. Arshad (2013) Taxonomic composition and abundance of zooplankton copepoda in the coastal waters of Bintulu, Sarawak, [...]"
#[2] "Jinag-Shiou Hwang, Qingchao Chen, Wen-Tseng Lo and Min-Pen Chen (2000) Taxonomic composition and abundance of the copepods in the northeastern South China Sea.  [...]"

dt1[,AuthorTag:=fifelse(grepl("Johan", bibliographicCitation), "Johan 2013", "Hwang 2000")]

firstwordx <- function(x) { wl <- regexpr("^[a-zA-Z0-9-]+",x); return(substr(x, wl, attributes(wl)$match.length)) }
twowordx <- function(x) { 
  wl2 <- regexpr("\\s\\b[a-zA-Z0-9\\-\\.]+(?:\\s|$)",x, perl=T) 
  wl2[wl2>0] <- wl2[wl2>0]+attributes(wl2)$match.length[wl2>0]-1
  return(substr(x, 1, wl2-1)) 
}
#dt[,AuthorTag:=fifelse(is.na(bibliographicCitation),"None", bibliographicCitation)]
#dt[AuthorTag != "None", AuthorTag:=twowordx(AuthorTag)] #firstwordx
dt[, AuthorTag:=firstwordx(bibliographicCitation)]

g0 <- ggplot() + geom_sf(data = ne_coastline(scale = "large", returnclass = "sf"), color = 'darkgray', size = .3)
dt2 <- dt #dt1 
g0 + 
  geom_point(data = dt2, aes(x = decimalLongitude, y = decimalLatitude, color = AuthorTag)) +
  coord_sf() + labs(x="Longitude",y="Latitude") +
  xlim(c(range(dt2$decimalLongitude)[1]-0.5, range(dt2$decimalLongitude)[2]+0.5)) + 
  ylim(c(range(dt2$decimalLatitude)[1]-0.5, range(dt2$decimalLatitude)[2]+0.5)) +
  theme(
    panel.background = element_rect(fill="white"),
    panel.border = element_rect(colour = "black", fill=NA, size=0.75),
    panel.grid.major = element_line(colour = "lightgrey"), 
    panel.grid.minor = element_line(colour = "lightgrey"), 
    legend.key = element_rect(fill = "transparent", colour = "transparent"),
    legend.background = element_rect(fill = "transparent", colour = "transparent"),#, #"white"),
    legend.position = c(0.2,  0.8)
  )
