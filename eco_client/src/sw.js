import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw/';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';



const bgSyncPlugin = new BackgroundSyncPlugin('apiRequests', {
    maxRetentionTime: 60  // retry for up to one hour (in minutes)
});



// retry failed POST requests to /api/**.json

registerRoute(
    /\/api\/.*\/.*\.json/,
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);

/** Preact CLI setup */
setupRouting();

const urlsToCache = getFiles();
urlsToCache.push({url: 'assets/icons/*.png', revision: null});

setupPrecaching(urlsToCache);
