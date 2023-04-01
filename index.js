const createDNSServer = require("./dns");
const createMediaServer = require("./media");

const dnsServer = createDNSServer();

dnsServer.on("requestError", (error) => {
  console.log("Client sent an invalid request", error);
});

dnsServer.on("listening", () => {
  console.log("Server started", dnsServer.addresses());
});

// Start Media server
const mediaServer = createMediaServer();

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
  dnsServer.close();
  mediaServer.stop();
}
