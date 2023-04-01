const MediaServer = require("node-media-server");

function createMediaServer({
  rtmpPort = 1935,
  onStreamStarted = () => {},
  onStreamStopped = () => {},
} = {}) {
  const server = new MediaServer({
    rtmp: {
      port: rtmpPort,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: 8000,
      allow_origin: "*",
    },
  });

  server.on("postPublish", (id, StreamPath, args) => {
    onStreamStarted(StreamPath, args);
  });

  server.on("donePublish", (id, StreamPath, args) => {
    onStreamStopped(StreamPath, args);
  });

  return server;
}

module.exports = createMediaServer;
