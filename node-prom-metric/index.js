const express = require("express");
const app = express();
const metricServer = express();
const prom = require("prom-client");
const { delay } = require("./tools");
const Registry = prom.Registry;
const register = new Registry();
// register prometheus default metrics
// prom.collectDefaultMetrics({ register });

// customized prometheus metrics
const httpRequestTotal = new prom.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests.",
  labelNames: ["route", "method", "statusCode"],
});

const httpRequestsInflight = new prom.Gauge({
  name: "http_requests_in_flight",
  help: "The number of inflight HTTP requests being handled at the same time.",
  labelNames: ["route", "method"],
});

const httpRequestDuration = new prom.Histogram({
  name: "http_request_duration_seconds",
  help: "The http request duration in seconds",
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  labelNames: ["route", "method", "statusCode"],
});

const httpRequestDurationSummary = new prom.Summary({
  name: "summary_http_request_duration_seconds",
  help: "The Summary of http request duration in seconds",
  percentiles: [0.01, 0.1, 0.9, 0.95, 0.99],
  maxAgeSeconds: 600, // 10 minutes the bucket will be reset
  ageBuckets: 5, // 5 buckets in the sliding window
  labelNames: ["route", "method", "statusCode"],
});
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestDurationSummary);
register.registerMetric(httpRequestTotal);
register.registerMetric(httpRequestsInflight);

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

// rest endpoints below
app.get("/sleep", async (req, res) => {
  const { time = 1 } = req.query;
  const ms = time * 1000;
  console.log("sleep time", time);
  await delay(ms);
  return res.json({ foo: "bar" });
});

app.get("/counter", (req, res) => {
  const { method, path: route } = req;
  const { statusCode } = res;

  httpRequestTotal.inc({ route, method, statusCode });
  res.json("ok");
});

app.get("/gauge", async (req, res) => {
  const { method, path: route } = req;

  httpRequestsInflight.inc({ route, method });
  const duration = 3;
  const ms = duration * 1000;

  await delay(ms);

  res.json("ok");
  httpRequestsInflight.dec({ route, method });
});

app.get("/histogram", async (req, res) => {
  const {
    method,
    path: route,
    query: { time = 2 },
  } = req;

  const { statusCode } = res;
  const duration = parseInt(time, 10);
  const ms = duration * 1000;
  const observe_response_time = httpRequestDuration.startTimer({ method, route, statusCode });
  console.log("histogram duration", duration);
  await delay(ms);
  observe_response_time();
  res.json("ok");
});
app.get("/summary", async (req, res) => {
  const {
    method,
    path: route,
    query: { time = 2 },
  } = req;
  const { statusCode } = res;
  const duration = parseInt(time, 10);
  const observe_response_time = httpRequestDurationSummary.startTimer({ method, route, statusCode });

  const ms = duration * 1000;
  console.log("summary duration", duration);

  await delay(ms);
  observe_response_time();
  res.json("ok");
});

app.listen(8080, function () {
  console.log("Listening at http://localhost:8080");
});
