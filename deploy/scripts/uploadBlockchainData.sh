#!/bin/bash

DATA_DIR=$1
BUCKET_NAME=$2
NETWORK=$3

cd "$DATA_DIR"
tar -czvf - * | aws s3 cp --only-show-errors - s3://$BUCKET_NAME/$NETWORK.tar.gz
