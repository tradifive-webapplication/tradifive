const META_API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI3MGEzZmU4ZGUxODk1NTQ1MDI0MTljODMwOWI1NzUzYyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJpZ25vcmVSYXRlTGltaXRzIjpmYWxzZSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaW1wZXJzb25hdGVkIjpmYWxzZSwicmVhbFVzZXJJZCI6IjcwYTNmZThkZTE4OTU1NDUwMjQxOWM4MzA5YjU3NTNjIiwiaWF0IjoxNzc3MjgzNjA4fQ.AH6l3FPUMpintBlZBbrALb7gH0hiQLCty68EfKGvyjHbX7F8Ai0ZNO-G44x9wx-iXP6S2Y0Zijtm-HBrtobAdPyyPLgIWNhglJOLiClfb4Hz0cJPqTetfZU6ddyywGmYhu3M4xPSpCRkkANRMYqyr1ITxIrX8Aeif2d3QthfBoeKq3BumrvdK-ApC5geEUnXoeTZQiP8rRxrfWav56JFYXlw9X24Jm1syQg0SfJ4csl_4wWfMqfsTzX3CkQwS85VcRmKf49KOASuVC4_Cnz2OqQ39azQypgbC99PIjAUfBTIM8jGDUA528zVUQV9jo4mxhpgvj31R51LAi2JYqdFVHYbqilDLd9jxnpHZ7KijjjPaauN1saH8flkvyAqpv7ec5es8nw1qN3-KuEdCmurzW5O3ogOG25Se03mjcJqrem4Z5gtMyp2nwNNRBoTR-RQ7pkBGKVj6Jhi6fCpXGXdH6B4rUB7Jx_XF6RPynB8NA-ye5aRzbdasjiQbLuh4fREhEhwgsbLsuPM6k9q8yBMB5sfk1XzPKOSRKCLsV7caPcuyWfOLhYStY628EGn_1quXLBHxXAyJE5Km3uEjkHBDqFJeqR6ZAQpomlhnFCr3i716CxglrhnNwNEleyPOtNv3AWvRvtUHF_IkGqCgnI6qnCzK5oiFvLNldDVkbL42qE";

const BASE = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';

async function tryCreate() {
  // Try different combinations to find what works on free tier
  const attempts = [
    { name: "Test 1: cloud-g2 + regular", type: "cloud-g2", reliability: "regular" },
    { name: "Test 2: cloud-g1 + regular", type: "cloud-g1", reliability: "regular" },
    { name: "Test 3: cloud + regular + quoteStreaming 60", type: "cloud", reliability: "regular", quoteStreamingIntervalInSeconds: 60 },
  ];

  for (const attempt of attempts) {
    console.log(`\n=== ${attempt.name} ===`);
    const payload = {
      name: "Tradifive-Test-" + Date.now(),
      type: attempt.type,
      login: "415616401",
      password: "test123",
      server: "Exness-MT5Trial14",
      platform: "mt5",
      magic: 1000,
      reliability: attempt.reliability,
    };
    if (attempt.quoteStreamingIntervalInSeconds) {
      payload.quoteStreamingIntervalInSeconds = attempt.quoteStreamingIntervalInSeconds;
    }

    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'auth-token': META_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);

    // If successful, delete the test account immediately
    if (res.ok && data.id) {
      console.log("SUCCESS! Cleaning up test account...");
      await fetch(`${BASE}/${data.id}`, {
        method: 'DELETE',
        headers: { 'auth-token': META_API_TOKEN }
      });
      console.log(`\n✅ WORKING CONFIG: type="${attempt.type}", reliability="${attempt.reliability}"${attempt.quoteStreamingIntervalInSeconds ? ', quoteStreamingIntervalInSeconds=' + attempt.quoteStreamingIntervalInSeconds : ''}`);
      return;
    }
  }

  console.log("\n❌ None of the combinations worked.");
}

tryCreate();
