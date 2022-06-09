up:
	@npm start
# curl 5 requests processed sequentially and in parallel 
curl-inflight: 
	seq 1 10 | xargs -I $ -n1 -P5  curl "localhost:8080/sleep?time=[1-5]"

curl: 
	curl localhost:8080/sleep

curl-seq: 
	for i in `seq 1 5`; do curl localhost:8080/sleep; done

