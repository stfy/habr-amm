#!/bin/bash


echo $1
#$1 -- image
set -e
docker build . -t $1
docker push $1

inspectResult=$(docker inspect $1 | grep '"Id": "sha256')
imageHash=$(awk -F'"Id": "sha256:|",' '{print $2}' <<< "$inspectResult")

printf "image - $1 \nimageHash - $imageHash\n"