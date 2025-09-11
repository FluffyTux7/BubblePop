const staticCacheName = 'site-static-v2'
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
  './',
  './index.html',
  "./manifest.json",
  "./maskable_icon.png",
  './assets/013e483ee63813787d5440b22e397b81.png',
  './assets/0e2f6316f4a84707b085fe1344def581.png',
  './assets/10b220db79dbff430c0e1dba26524eff.svg',
  './assets/136a05e475a73eb793a4d36b4e8898bc.svg',
  './assets/1e7ce0f6887befe1d87228576f866216.svg',
  './assets/3339a2953a3bf62bb80e54ff575dbced.svg',
  './assets/36e2f1718bca918878eba3da189b5481.svg',
  './assets/374a63f28f3dd4d4ee702ceb1c5bfe0d.png',
  './assets/4b7e0c99b48cc6d433b20a4aa5588305.svg',
  './assets/58c5b8bfb73b8c0e243efbb035112944.png',
  './assets/5b4c502025c49604bb5dc8ebba46aceb.png',
  './assets/6ad1565358c2bd1983be373af3ed2daf.png',
  './assets/6d020362d66938184a7e8a1855c6dea1.svg',
  './assets/6d1d0ecc3793a281d08b119ca696168b.png',
  './assets/730040342cec64bb8ad5332755be61f8.png',
  './assets/78f1c8994065bafc771e04e2af4f7453.svg',
  './assets/7ed6649b5e4f721640017b571502c220.svg',
  './assets/844de2042e8356d0b01b5014ae272f3b.svg',
  './assets/a947b43e78245e749141e512dfd807d4.png',
  './assets/b23a2a74760b613849defb68c2e56e08.svg',
  './assets/cd21514d0531fdffb22204e0ec5ed84a.svg',
  './assets/d0364acbfdc3f9ec81a9e441d552606f.svg',
  './assets/d14cbf5b7d074bf78eda4a6d7f90472a.png',
  './assets/d1d0d40f2a5ff4116d5991b5e97cc1d7.png',
  './assets/d8aa6d786d136ff428424ecbee1acf95.png',
  './assets/e49d6ab7debc9b21ff2a2cc47bf15c49.png',
  './assets/e534db8d297f4443709004ade066e504.svg',
  './assets/e9ab1c2411af38749f3de883727cf273.jpg',
  './assets/ef66fd6274cca3ab21ee31d319536096.svg',
  './assets/f6f0bf29c5a7e227ff6efbbe758a89bf.png',
  './assets/feab390c651318c4e5f5e2c04ca43d33.svg',
  './assets/project.json',
  './static/img/site/favicon.svg'
]

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size))
      }
    })
  })
}

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed')
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets')
      cache.addAll(assets)
    })
  )
})

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated')
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys)
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      )
    })
  )
})

// fetch event
self.addEventListener('fetch', evt => {
  //console.log('fetch event', evt)
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone())
          // check cached items size
          limitCacheSize(dynamicCacheName, 15)
          return fetchRes
        })
      })
    }).catch(() => {
      if (evt.request.url.indexOf('.html') > -1) {
        return caches.match('./static/tmpl/404.html')
      }
    })
  )
})
