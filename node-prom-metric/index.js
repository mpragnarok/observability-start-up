const express = require("express");
const app = express();
const metricServer = express();
const prom = require("prom-client");
const responseTime = require("response-time");
const { genRandomInteger, delay } = require("./tools");
const Registry = prom.Registry;
const register = new Registry();
// register prometheus metrics
prom.collectDefaultMetrics({ register });

// customized prometheus metrics
const fooSalesTotal = new prom.Counter({
  name: "foo_sales_twd_total",
  help: "TWD made serving Foo service",
});

const queueSizeTotal = new prom.Gauge({
  name: "queue_size_total",
  help: "Jobs waiting to be processed in queue",
  labelNames: ["queueName"],
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
  percentiles: [0.01, 0.1, 0.9, 0.99],
  labelNames: ["route", "method", "statusCode"],
});
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestDurationSummary);
register.registerMetric(fooSalesTotal);
register.registerMetric(queueSizeTotal);
app.use(
  responseTime(function (req, res, time) {
    const { statusCode } = res;
    const { method, originalUrl } = req;
    const duration = Math.round(time) / 1000;

    httpRequestDuration.observe({ method, route: originalUrl, statusCode }, duration);
    httpRequestDurationSummary.observe({ method, route: originalUrl, statusCode }, duration);
  }),
);
// application endpoints
app.get("/", (req, res) =>
  res.json({
    "GET /": "All Routes",
  }),
);

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
app.get("/foo", async (req, res) => {
  const ms = genRandomInteger(3) * 1000;
  fooSalesTotal.inc(Math.random());
  await delay(ms);
  return res.json({ foo: "bar" });
});
app.get("/queue", (req, res) => {
  const queueA = new Array(genRandomInteger(100)).fill("jobA");
  const queueB = new Array(genRandomInteger(50)).fill("jobB");
  const queueASize = queueA?.length;
  const queueBSize = queueB?.length;
  // jobs waiting in queue
  queueSizeTotal.labels({ queueName: "a" }).set(queueASize);
  queueSizeTotal.labels({ queueName: "b" }).set(queueBSize);
  return res.json({ queueASize, queueBSize });
});
app.listen(8080, function () {
  console.log("Listening at http://localhost:8080");
});
