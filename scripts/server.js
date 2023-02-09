const http = require("http");
const fs = require("fs");
const path = require("path");

const mime = {
  ".html": "text/html",
  ".css": "text/css",
};

const BUILD_DIR = "../dist";

function runServer(port = 4000) {
  const server = http.createServer((req, res) => {
    const filename = req.url !== "/" ? req.url : "index.html";
    const filepath = path.join(__dirname, BUILD_DIR, filename);
    if (fs.existsSync(filepath)) {
      const stream = fs.createReadStream(filepath);

      stream.on("ready", () => {
        const type =
          mime[path.parse(filepath).ext] || "application/octet-stream";

        res.writeHead(200, { "content-type": type });

        stream.pipe(res);
      });

      stream.on("error", (err) => {
        console.log(`${req.method} ${req.url} => 500 ${filepath} ${err.name}`);

        res.writeHead(500, err.name);

        res.end(JSON.stringify(err));
      });
    } else {
      const reqProxy = http.request({ path: req.url, port: port });

      reqProxy.on("response", (resProxy) => {
        const type = resProxy.headers["content-type"];

        res.writeHead(resProxy.statusCode, { "content-type": type });
        resProxy.pipe(res);
      });

      req.pipe(reqProxy);
    }
  });

  server.listen(port, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Served on http://localhost:${port}`);
  });
}

module.exports = {
  runServer,
};
