#!/bin/bash

docker build -t dms-01-y .
docker run -d -p 80:3000 dms-01-y
