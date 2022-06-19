var staticCacheName = "pwa";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(["/", "/users", "/chat", "/offline"]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  let request = event.request;
  if (request.method === "GET") {
    request = new Request(request.url, {
      method: "GET",
      headers: request.headers,
      mode: request.mode == "navigate" ? "cors" : request.mode,
      credentials: request.credentials,
      redirect: request.redirect,
    });
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(staticCacheName).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (response) {
            return response || caches.match("/offline");
          });
        })
    );
    return;
  }
});
