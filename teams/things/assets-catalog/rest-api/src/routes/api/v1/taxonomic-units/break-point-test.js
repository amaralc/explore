import http from 'k6/http';

export const options = {
  ext: {
    loadimpact: {
      apm: [
        {
          // provider: 'prometheus',
          // remoteWriteURL: '<Remote Write URL>',
          // // optional parameters
          // credentials: {
          //   token: '<token>',
          // },
          includeDefaultMetrics: true,
          // metrics: ['http_req_sending', 'my_rate', 'my_gauge'], //...other options,
          includeTestRunId: true,
          resampleRate: 3,
        },
      ],
    },
  },

  discardResponseBodies: true,
  scenarios: {
    rampingArrivalRate: {
      executor: 'ramping-arrival-rate',
      startTime: '0s', // the ramping API test starts a little later
      startRate: 5,
      timeUnit: '1s', // we start at 50 iterations per second
      stages: [
        { target: 5, duration: '30s' }, // 300/min
        { target: 30, duration: '30s' },
        { target: 30, duration: '30s' },
        { target: 55, duration: '30s' },
        { target: 55, duration: '30s' },
        { target: 80, duration: '30s' },
        { target: 80, duration: '30s' },
      ],
      preAllocatedVUs: 250, // how large the initial pool of VUs would be
      maxVUs: 500, // if the preAllocatedVUs are not enough, we can initialize more
      tags: { testType: 'api' }, // different extra metric tags for this scenario
      env: { FEATURE_ENABLED: 'true' }, // same function, different environment variables
      exec: 'createTaxonomicUnit', // same function as the scenario above, but with different env vars
    },
  },
};

export function createTaxonomicUnit() {
  const randomString = Math.round(Math.random() * 10000000);

  const postTaxonomicUnitsV1RequestBody = {
    slug: `abc-${randomString}`,
  };

  http.post('http://localhost:8080/api/v1/taxonomic-units', JSON.stringify(postTaxonomicUnitsV1RequestBody), {
    headers: { 'Content-Type': 'application/json' },
  });
}
