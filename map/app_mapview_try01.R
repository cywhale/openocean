# A simple shiny test integrating mapview, mapedit, leaflet and feature info about Ocean Biographical Provinces
# Dataset (shapefile) from https://data.unep-wcmc.org/datasets/38
# js/html version: https://github.com/cywhale/all_for_it_learning/blob/master/js/js_leaflet_wms_meow.html
# simple R version:https://github.com/cywhale/all_for_it_learning/blob/master/R_misc/R_leaflet_wms_meow01.R
library(mapedit)
library(mapview)
library(shiny)
library(leaflet)
library(leaflet.extras)
library(leafem)
library(sf)
library(colourvalues)

n = 1e2
set.seed(123L)
df1 = data.frame(id = 1:n,
                 x = rnorm(n, 120, 3),
                 y = rnorm(n, 25, 1.8)) # data of random point, just test 
pts <- st_as_sf(df1, coords = c("x", "y"), crs = 4326, remove=FALSE) 
  #st_multipoint(data.matrix(df1[,c("x","y")])) %>% st_sfc() %>%
  #st_cast("POINT") %>% st_sf(df1, crs = 4326)
colt <- colour_values(pts$id%%4, include_alpha = FALSE)

br <- st_read("D:/backup/env/MEOW_PPOW_2007_2012/01_Data/WCMC-036-MEOW-PPOW-2007-2012-NoCoast.shp") %>%
  st_as_sf(crs=4326)

m <- mapview(br, zcol = c("PROVINC"), legend = FALSE, layer.name = "bio_provinces",
             map.types=c('Esri.OceanBasemap','CartoDB.DarkMatterNoLabels'))@map %>%
  setView(120, 25, zoom = 5) %>%
  addCircleMarkers(~x, ~y, popup = ~paste0("(",round(x,3),",",round(y,3),")"),
                   radius = 2, fillOpacity=0.5,
                   layerId=~id, stroke=FALSE, group="pts",
                   color = colt, data=pts) %>% 
  leaflet.extras::addSearchFeatures(targetGroups = 'bio_provinces',
    options = searchFeaturesOptions(
      zoom=12, openPopup = TRUE, firstTipSubmit = TRUE,
      autoCollapse = TRUE, hideMarkerOnCollapse = TRUE )) %>%  
  leafem::garnishMap(addLayersControl, baseGroups = c("Esri.OceanBasemap","CartoDB.DarkMatterNoLabels"), 
                     overlayGroups =c("bio_provinces","pts"),
                     position="topright")

ui <- tagList(
  editModUI("meow"),
  leafletOutput("lmap")
)
server <- function(input, output, session) {
  lmod <- callModule(editMod, "meow", m)
  output$lmap <- renderLeaflet({
    req(lmod()$finished)
    mapview(lmod()$finished)@map 
  })
}
shinyApp(ui, server)
