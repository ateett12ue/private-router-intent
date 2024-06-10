#!/bin/bash
#credits 
# https://github.com/aws-samples/aws-codedeploy-sample-tomcat/blob/master/scripts/basic_health_check.sh
for i in `seq 1 10`;
do
  HTTP_CODE=`curl --write-out '%{http_code}' -o /dev/null -m 10 -q -s http://localhost:4022/agreement/health`
  if [ "$HTTP_CODE" == "200" ]; then
    echo "Successfully Get Health Report."
    exit 0;
  fi
  echo "Attempt to curl endpoint returned HTTP Code $HTTP_CODE. Backing off and retrying."
  sleep 10
done
echo "Server did not come up after expected time. Failing."
exit 1