const axios = require('axios');
const os = require('os');

async function publicAddress() {
  return await (
    await axios.get("https://api.ipify.org")
  ).data;
}

function localAddress() {
  const addresses = Object.values(os.networkInterfaces()).reduce(
    (r, addresses) => {
      return r.concat(
        addresses.reduce((rr, address) => {
          return rr.concat(
            (address.family === "IPv4" &&
              !address.internal &&
              address.address) ||
              []
          );
        }, [])
      );
    },
    []
  );

  return addresses[0] ?? null;
}

function isAddressPrivate(address) {
  var parts = address.split(".");

  return (
    // Class A
    parts[0] === "10" ||
    // Class B
    (parts[0] === "172" &&
      parseInt(parts[1], 10) >= 16 &&
      parseInt(parts[1], 10) <= 31) ||
    // Class C
    (parts[0] === "192" && parts[1] === "168")
  );
}

module.exports = {
  publicAddress,
  localAddress,
  isAddressPrivate,
};
