import "network-idle-callback/lib/request-monitor";

self.addEventListener("fetch", (event) => {
    // @ts-ignore
    self.requestMonitor.listen(event);

    // @ts-ignore
    const fetchPromise = fetch(event.request)
        .then((response) => {
            // @ts-ignore
            self.requestMonitor.unlisten(event);

            return response;
        })
        .catch(() => {
            // @ts-ignore
            self.requestMonitor.unlisten(event);
        });

    // @ts-ignore
    event.respondWith(fetchPromise);
});
