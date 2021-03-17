import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

const bgSyncPlugin = new BackgroundSyncPlugin('apiRequests', {
    maxRetentionTime: 60  // retry for up to one hour (in minutes)
});



/* retry failed POST requests to /api/**.json
registerRoute(
    /\/api\/.*\/.*\.json/,
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);
*/

registerRoute(
  ({ url }) => url.pathname.startsWith("/session/"),
  new NetworkOnly({ //NetworkFirst
        plugins: [bgSyncPlugin]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/search/"),
  new NetworkOnly({ //NetworkFirst
        plugins: [bgSyncPlugin]
  })
);

/** Preact CLI setup */
setupRouting();

const urlsToCache = getFiles();
urlsToCache.push({url: 'assets/icons/favicon.png', revision: null});
//urlsToCache.push({url: 'https://www.gmrt.org/apple-touch-icon.png', revision: null});
//urlsToCache.push({url: 'https://noaa.maps.arcgis.com/sharing/rest/content/items/e11ebaeb19544bb18c2afe440f063062/info/thumbnail/thumbnail1599599541626.png', revision: null});
//urlsToCache.push({url: 'https://noaa.maps.arcgis.com/sharing/rest/content/items/89dbb3a8eb294652adae4e8a7c92ad24/info/thumbnail/etopo1_hillshade.png', revision: null});
//urlsToCache.push({url: 'https://noaa.maps.arcgis.com/sharing/rest/content/items/766fe2c6985e43d7a86fc39134b4f0f6/info/thumbnail/thumbnail1596833199248.png', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_mx.jpg', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_my.jpg', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_mz.jpg', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_px.jpg', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_py.jpg', revision: null});
urlsToCache.push({url: 'Assets/Textures/SkyBox/tycho2t3_80_pz.jpg', revision: null});

setupPrecaching(urlsToCache);
