## Just a trial to match copepod/larval fish taxonomy list from ODB api, to match this marine species checklist
library(data.table)
library(httr)
library(jsonlite)

# command line: curl https://bio.odb.ntu.edu.tw/api/bioquery/json -F "return_type=\"taxonomy\"" 
args <- list(return_type="taxonomy")

resp <- POST(
  url = "https://bio.odb.ntu.edu.tw/api/bioquery/json",
  body = args, encode = 'json', verbose())

dj <- setDT(fromJSON(rawToChar(resp$content)))

## Just check if all marine sp crawled is consistent with this data ##

if (file.exists(paste0(data_backup_dir, "taibnet_marine_species.csv"))) {
  mdt <- fread(paste0(data_backup_dir, "taibnet_marine_species.csv"))
  print(paste0("Marine sp: ", nrow(mdt), " and species in copepod data, ODB: ", nrow(dj[rank=="species",])))
  
  dj[rank=="species" & !taxon %in% mdt$sciname,] 
}
  
## Need furthur check if this sp had abundance > 0 in ODB raw data, or just name in taxonomy list
## Or because in larval state, so taiBNET has no record?
  
#  taxon         family         genus    rank
#  1:      Abudefduf saxatilis  Pomacentridae     Abudefduf species
#  2: Acanthogobius flavimanus       Gobiidae Acanthogobius species
#  3:      Acanthogobius hasta       Gobiidae Acanthogobius species
#  4:  Acanthopagrus australis       Sparidae Acanthopagrus species
#  5:      Acanthopagrus berda       Sparidae Acanthopagrus species
#  ---                                                              
#  592:            Xyrichtys dea       Labridae     Iniistius species
#  593:      Yarrella blackfordi Phosichthyidae      Yarrella species
#  594:      Zebrasoma veliferum   Acanthuridae     Zebrasoma species
#  595:        Zebrias fasciatus       Soleidae       Zebrias species
#  596:        Zebrias japonicus       Soleidae       Zebrias species  
