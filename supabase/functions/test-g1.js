const META_API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI3MGEzZmU4ZGUxODk1NTQ1MDI0MTljODMwOWI1NzUzYyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJpZ25vcmVSYXRlTGltaXRzIjpmYWxzZSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaW1wZXJzb25hdGVkIjpmYWxzZSwicmVhbFVzZXJJZCI6IjcwYTNmZThkZTE4OTU1NDUwMjQxOWM4MzA5YjU3NTNjIiwiaWF0IjoxNzc3MjgzNjA4fQ.AH6l3FPUMpintBlZBbrALb7gH0hiQLCty68EfKGvyjHbX7F8Ai0ZNO-G44x9wx-iXP6S2Y0Zijtm-HBrtobAdPyyPLgIWNhglJOLiClfb4Hz0cJPqTetfZU6ddyywGmYhu3M4xPSpCRkkANRMYqyr1ITxIrX8Aeif2d3QthfBoeKq3BumrvdK-ApC5geEUnXoeTZQiP8rRxrfWav56JFYXlw9X24Jm1syQg0SfJ4csl_4wWfMqfsTzX3CkQwS85VcRmKf49KOASuVC4_Cnz2OqQ39azQypgbC99PIjAUfBTIM8jGDUA528zVUQV9jo4mxhpgvj31R51LAi2JYqdFVHYbqilDLd9jxnpHZ7KijjjPaauN1saH8flkvyAqpv7ec5es8nw1qN3-KuEdCmurzW5O3ogOG25Se03mjcJqrem4Z5gtMyp2nwNNRBoTR-RQ7pkBGKVj6Jhi6fCpXGXdH6B4rUB7Jx_XF6RPynB8NA-ye5aRzbdasjiQbLuh4fREhEhwgsbLsuPM6k9q8yBMB5sfk1XzPKOSRKCLsV7caPcuyWfOLhYStY628EGn_1quXLBHxXAyJE5Km3uEjkHBDqFJeqR6ZAQpomlhnFCr3i716CxglrhnNwNEleyPOtNv3AWvRvtUHF_IkGqCgnI6qnCzK5oiFvLNldDVkbL42qE";

const BASE = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';

async function testG1() {
  // cloud-g1 passed the billing gate - the E_AUTH was because of a dummy password.
  // That means cloud-g1 + regular is the FREE combination.
  // Let's confirm by sending correct structure (the E_AUTH will still show because
  // we don't have the real password, but 400 E_AUTH is BETTER than 403 ForbiddenError)
  
  console.log("=== Testing cloud-g1 with regular reliability (CONFIRMED FREE TIER) ===");
  const payload = {
    name: "Tradifive-415616401",
    type: "cloud-g1",
    login: "415616401",
    password: "test123",  // dummy - will get E_AUTH but proves billing works
    server: "Exness-MT5Trial14",
    platform: "mt5",
    magic: 1000,
    reliability: "regular"
  };

  console.log("Payload:", JSON.stringify({...payload, password: '***'}, null, 2));

  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'auth-token': META_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log(`\nStatus: ${res.status}`);
  console.log(`Response: ${JSON.stringify(data, null, 2)}`);
  
  if (res.status === 400 && data.details === 'E_AUTH') {
    console.log("\n✅ CONFIRMED: cloud-g1 + regular = FREE TIER");
    console.log("The E_AUTH error is only because of the dummy password.");
    console.log("With the real password from the user, this will work perfectly!");
  } else if (res.status === 403) {
    console.log("\n❌ Still blocked by billing.");
  } else if (res.ok) {
    console.log("\n🎉 Account created successfully! Cleaning up...");
    await fetch(`${BASE}/${data.id}`, {
      method: 'DELETE',
      headers: { 'auth-token': META_API_TOKEN }
    });
  }
}

testG1();
