---
title: 'Count Deployment Frequency with Compass'
authors: [amaralc]
tags: [devops, compass, deployment-frequency, dora, dora-metrics]
description: 'Learn how to count deployment frequency with Compass'
---

## Overview

- Access the GraphQL explorer at https://developer.atlassian.com/cloud/compass/graphql/explorer/ and login to your account;

- Make a query to get your cloudId:

```graphql
query example {
  tenantContexts(hostNames: ["your-domain.atlassian.net"]) {
    cloudId
  }
}
```

Source: https://developer.atlassian.com/cloud/compass/components/create-components-using-the-api/#look-up-the-unique-cloudid-for-your-atlassian-site

- Create an event source of type "DEPLOYMENT:

```graphql title="Mutation"
mutation createEventSource($input: CreateEventSourceInput!) {
  compass {
    createEventSource(input: $input) {
      eventSource {
        id
      }
      success
      errors {
        message
      }
    }
  }
}
```

```graphql title="Variables"
{
  "input": {
    "cloudId": "<your cloud ID>",
    "externalEventSourceId": "<external event source ID>",
    "eventType": "CUSTOM"
  }
}
```

Source: https://developer.atlassian.com/cloud/compass/components/send-events-using-rest-api/

- Connect the event source to a component:

```graphql title="Mutation"
mutation attachEventSource($input: AttachEventSourceInput!) {
  compass {
    attachEventSource(input: $input) {
      success
      errors {
        message
      }
    }
  }
}
```

```graphql title="Variables"
{
  "input": {
    "eventSourceId": "<event source ID>",
    "componentId": "<component ID>"
  }
}
```

Obs.: You can find the component's ID from its details page in Compass. When you’re there, select more actions (•••), then select Copy component ID.

- Create an API token;

- Send a deployment event;

```bash
curl \
    --request POST \
    --url https://$DOMAIN.atlassian.net/gateway/api/compass/v1/events \
    --user "$USER_EMAIL:$USER_API_TOKEN" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data "{
        \"cloudId\": \"$CLOUD_ID\",
        \"event\": {
            \"custom\": {
                \"updateSequenceNumber\": 1,
                \"displayName\": \"Production Deployment\",
                \"description\": \"Production Deployment\",
                \"url\": \"https://www.peerlab.com.br\",
                \"lastUpdated\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\",
                \"externalEventSourceId\": \"$EXTERNAL_EVENT_SOURCE_ID\",
                \"customEventProperties\": {
                    \"id\": \"1\",
                    \"icon\": \"CHECKPOINT\"
                }
            }
        }
    }"
```

Source: https://developer.atlassian.com/cloud/compass/rest/api-group-events/#api-compass-v1-events-post

## References

- https://developer.atlassian.com/cloud/compass/rest/api-group-events/#api-compass-v1-events-post
- https://developer.atlassian.com/cloud/compass/components/create-components-using-the-api/#look-up-the-unique-cloudid-for-your-atlassian-site
- https://developer.atlassian.com/cloud/compass/graphql/explorer/
