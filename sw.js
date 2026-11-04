const CACHE_NAME = `temperature-converter-v12`;
const WIDGET_TAG = 'temperature-converter-widget';
const WIDGET_TEMPLATE_URL = './widgets/temperature-template.json';
const WIDGET_DATA_URL = './widgets/temperature-data.json';

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      './',
      './converter.js',
      './converter.css',
      './icon192.png',
      './icon512.png',
      './manifest.json',
      './widgets/temperature-template.json',
      './widgets/temperature-data.json',
      './widgets/widget-preview.svg'
    ]);
  })());
  self.skipWaiting();
});

// Clean up old caches.
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    await self.clients.claim();
    await updateWindowsWidget();
  })());
});

async function getWidgetPayload(dataOverride) {
  const template = await (await fetch(WIDGET_TEMPLATE_URL)).text();
  const data = dataOverride
    ? JSON.stringify(dataOverride)
    : await (await fetch(WIDGET_DATA_URL)).text();
  return { template, data };
}

async function updateWindowsWidget(dataOverride) {
  if (!('widgets' in self)) return;
  const widget = await self.widgets.getByTag(WIDGET_TAG);
  if (!widget) return;
  await self.widgets.updateByTag(WIDGET_TAG, await getWidgetPayload(dataOverride));
}

self.addEventListener('widgetinstall', event => {
  event.waitUntil((async () => {
    const payload = await getWidgetPayload();
    await self.widgets.updateByTag(event.widget.definition.tag, payload);
  })());
});

self.addEventListener('widgetresume', event => {
  event.waitUntil(updateWindowsWidget());
});

self.addEventListener('widgetclick', event => {
  if (event.action === 'open-converter') {
    event.waitUntil(self.clients.openWindow('./'));
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'widget-data') {
    event.waitUntil(updateWindowsWidget(event.data.data));
  }
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);
    
          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed
        }
    }
  })());
});
