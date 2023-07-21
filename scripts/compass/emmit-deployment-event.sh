DOMAIN=
USER_EMAIL=
USER_API_TOKEN=
CLOUD_ID=
EXTERNAL_EVENT_SOURCE_ID=

curl \
    --request POST \
    --url https://$DOMAIN.atlassian.net/gateway/api/compass/v1/events \
    --user "$USER_EMAIL:$USER_API_TOKEN" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data "{
        \"cloudId\": \"$CLOUD_ID\",
        \"event\": {
            \"deployment\": {
                \"updateSequenceNumber\": 2,
                \"displayName\": \"Production Deployment\",
                \"description\": \"Production Deployment\",
                \"url\": \"https://www.peerlab.com.br\",
                \"lastUpdated\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\",
                \"externalEventSourceId\": \"$EXTERNAL_EVENT_SOURCE_ID\",
                \"deploymentProperties\": {
                    \"sequenceNumber\": 2,
                    \"state\": \"SUCCESSFUL\",
                    \"pipeline\": {
                        \"pipelineId\": \"1\",
                        \"url\": \"https://www.peerlab.com.br\",
                        \"displayName\": \"Production Pipeline\"
                      },
                    \"environment\": {
                        \"category\": \"PRODUCTION\",
                        \"displayName\": \"Production\",
                        \"environmentId\": \"1\"
                    }
                }
            }
        }
    }"
