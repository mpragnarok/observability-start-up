const express = require("express");
const app = express();
const metricServer = express();
const prom = require("prom-client");
const responseTime = require("response-time");
const Registry = prom.Registry;
const register = new Registry();
// register prometheus metrics
prom.collectDefaultMetrics({ register });

const httpRequestDuration = new prom.Histogram({
  name: "http_request_duration_seconds",
  help: "The http request duration in seconds",
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ["route", "method", "statusCode"],
});
register.registerMetric(httpRequestDuration);
app.use(
  responseTime(function (req, res, time) {
    const { statusCode } = res;
    const { method, originalUrl } = req;
    const duration = Math.round(time) / 1000;
    httpRequestDuration.observe({ method, route: originalUrl, statusCode }, duration);
  }),
);
app.get("/", (req, res) =>
  res.json({
    "GET /": "All Routes",
    "GET /hello": "{foo:bar}",
    "GET /metrics": "Metrics data",
  }),
);

// Setup server to Prometheus scrapes:
metricServer.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

metricServer.listen(9090, function () {
  console.log("Metric exposed at http://localhost:9090/metrics");
});

// hello world rest endpoint
app.get("/foo", (req, res) => res.json({ foo: "bar" }));

app.listen(8080, function () {
  console.log("Listening at http://localhost:8080");
});
