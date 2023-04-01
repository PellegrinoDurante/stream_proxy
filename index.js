const createDNSServer = require("./dns");
const createMediaServer = require("./media");

// Create DNS server
const dnsServer = createDNSServer();

dnsServer.on("requestError", (error) => {
  console.log("Client sent an invalid request", error);
});

dnsServer.on("listening", () => {
  console.log("Server started", dnsServer.addresses());
});

// Create media server
const mediaServer = createMediaServer();

// Start servers
try {
  dnsServer.listen({
    udp: {
      port: 5333,
      address: "0.0.0.0",
      type: "udp4",
    },
  });
  mediaServer.run();
} catch (e) {
  console.log('Error', e);
  dnsServer.close();
  mediaServer.stop();
}
