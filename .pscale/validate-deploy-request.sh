#!/bin/bash

. use-pscale-docker-image.sh

. authenticate-ps.sh

branch=$1

raw_output=`pscale deploy-request --org "$ORG_NAME" list $DB_NAME --format json`
output=`echo $raw_output | jq ".[] | select(.branch == \"$branch\" and .state == \"open\") | .deployment.deployable"`

if [[ -z $output ]]; then
    echo "No matching deploy request found. Skipping..."
    exit 0
elif [ "${output//$'\r'/}" == "true" ]; then
    echo "Matching deploy request is ready to merge...."
    exit 0
else
    echo "Matching deploy request is not ready to merge. Failing..."
    exit 1
fi