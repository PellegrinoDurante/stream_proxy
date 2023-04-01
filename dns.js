const dns = require("dns");
const { Packet, UDPClient, createServer } = require("dns2");
const { isAddressPrivate, localAddress, publicAddress } = require("./utils");

function shouldInterceptDNSQuestion(question) {
  if (question.type !== Packet.TYPE.A || question.class !== Packet.CLASS.IN) {
    return false;
  }

  return (
    question.name.includes("contribute.live-video.net") ||
    question.name.match(/live.*\.twitch\.tv/)
  );
}

function createDNSServer() {
  // Get resolve function using system DNS
  const resolve = UDPClient({
    dns: dns.getServers()[0] ?? "8.8.8.8",
  });

  async function sendDefaultResponse(name, send, response) {
    const { answers } = await resolve(name);
    response.answers.push(...answers);
    send(response);
  }

  // Create DNS server
  const server = createServer({
    udp: true,
    handle: async (request, send, rinfo) => {
      const [question] = request.questions;
      const { name } = question;

      const response = Packet.createResponseFromRequest(request);

      // Resolve with system DNS
      if (!shouldInterceptDNSQuestion(question)) {
        return sendDefaultResponse(name, send, response);
      }

      // Resolve with the server IP, local or public based on the client IP
      const address = isAddressPrivate(rinfo.address)
        ? localAddress()
        : await publicAddress();

      // Send default DNS response if unable to get address
      if (!address) {
        console.log("Unable to retrieve local or public address.");
        return sendDefaultResponse(name, send, response);
      }

      // Send custom DNS response with server address
      response.answers.push({
        name,
        type: Packet.TYPE.A,
        class: Packet.CLASS.IN,
        ttl: 300,
        address: address,
      });

      return send(response);
    },
  });

  return server;
}

module.exports = createDNSServer;
