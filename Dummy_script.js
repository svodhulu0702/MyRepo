import { sleep } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Define custom Trend metrics for transactions
let transaction1ResponseTime = new Trend('GetResptime');
let transaction2ResponseTime = new Trend('GetResptime2');

export const options = {
  // cloud: {
  //   distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
  //   apm: [],
  // },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 30, duration: '1m' },
        { target: 30, duration: '5m' },
        { target: 0, duration: '1m' },
      ],
      startVUs: 1,
      gracefulRampDown: '5s',
      exec: 'scenario_1',
    },
  },
};

export function scenario_1() {
  let response;

  // Request1
  let start1 = new Date().getTime();
  response = http.get('https://reqres.in/api/users?page=2');
  let end1 = new Date().getTime();
  transaction1ResponseTime.add(end1 - start1);
  sleep(1);

  // Request2
  let start2 = new Date().getTime();
  response = http.post(
    'https://reqres.in/api/users',
    '{"name": "morpheus",\r\n    "job": "leader"}',
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  );
  let end2 = new Date().getTime();
  transaction2ResponseTime.add(end2 - start2);
  sleep(1);
}

// This function generates an HTML summary report after the test is completed
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data), // Creates a report named "summary.html"
  };
}
