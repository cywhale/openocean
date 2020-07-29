import { getFiles, setupPrecaching, setupRouting } from 'preact-cli/sw/';

setupRouting();

const urlsToCache = getFiles();
urlsToCache.push({url: 'assets/icons/favicon.png', revision: null});

setupPrecaching(urlsToCache);
