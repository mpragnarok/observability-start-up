up-init:
	@npm run start:init
up:
	@npm run start


# curl 5 requests processed sequentially and in parallel 
curl-inflight: 
	seq 1 10 | xargs -I $ -n1 -P5  curl "localhost:8080/sleep?time=[1-5]"

curl: 
	curl localhost:8080/sleep

curl-seq: 
	for i in `seq 1 5`; do curl localhost:8080/sleep; done

metric: 
	curl -v localhost:9090/metrics

counter:
	curl -v localhost:8080/counter

gauge:
	curl -v localhost:8080/gauge

histogram:
	curl -v localhost:8080/histogram

histogram-3s:
	curl -v localhost:8080/histogram?time=3

	
summary:
	curl -v localhost:8080/summary

summary-3s:
	curl -v localhost:8080/summary?time=3
