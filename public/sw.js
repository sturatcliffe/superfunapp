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
    console.log(`Received GET request for HTML file at ${request.url}`);
    request = new Request(url, {
      method: "GET",
      headers: request.headers,
      mode: request.mode == "navigate" ? "cors" : request.mode,
      credentials: request.credentials,
      redirect: request.redirect,
    });
    event.respondWith(
      fetch(request)
        .then(function (response) {
          console.log(`Received fetch response, success: ${response.ok}`);
          const copy = response.clone();
          caches.open(staticCacheName).then(function (cache) {
            console.log("Caching response...");
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          console.log(
            `Failed to fetch, attempting to return cached response for ${request.url}...`
          );
          return caches.match(request).then(function (response) {
            return response || caches.match("/offline");
          });
        })
    );
    return;
  }
});
