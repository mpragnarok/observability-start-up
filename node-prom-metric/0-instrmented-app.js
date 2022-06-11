const express = require("express");
const app = express();
const metricServer = express();
const prom = require("prom-client");
const Registry = prom.Registry;
const register = new Registry();
// register prometheus default metrics
// prom.collectDefaultMetrics({ register });
// Setup server to Prometheus scrapes
metricServer.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});
// Set metric server
metricServer.listen(9090, function () {
  console.log("Metric exposed at http://localhost:9090/metrics");
});

app.listen(8080, function () {
  console.log("Listening at http://localhost:8080");
});
