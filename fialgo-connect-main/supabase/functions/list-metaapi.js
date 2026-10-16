const META_API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI3MGEzZmU4ZGUxODk1NTQ1MDI0MTljODMwOWI1NzUzYyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJpZ25vcmVSYXRlTGltaXRzIjpmYWxzZSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaW1wZXJzb25hdGVkIjpmYWxzZSwicmVhbFVzZXJJZCI6IjcwYTNmZThkZTE4OTU1NDUwMjQxOWM4MzA5YjU3NTNjIiwiaWF0IjoxNzc3MjgzNjA4fQ.AH6l3FPUMpintBlZBbrALb7gH0hiQLCty68EfKGvyjHbX7F8Ai0ZNO-G44x9wx-iXP6S2Y0Zijtm-HBrtobAdPyyPLgIWNhglJOLiClfb4Hz0cJPqTetfZU6ddyywGmYhu3M4xPSpCRkkANRMYqyr1ITxIrX8Aeif2d3QthfBoeKq3BumrvdK-ApC5geEUnXoeTZQiP8rRxrfWav56JFYXlw9X24Jm1syQg0SfJ4csl_4wWfMqfsTzX3CkQwS85VcRmKf49KOASuVC4_Cnz2OqQ39azQypgbC99PIjAUfBTIM8jGDUA528zVUQV9jo4mxhpgvj31R51LAi2JYqdFVHYbqilDLd9jxnpHZ7KijjjPaauN1saH8flkvyAqpv7ec5es8nw1qN3-KuEdCmurzW5O3ogOG25Se03mjcJqrem4Z5gtMyp2nwNNRBoTR-RQ7pkBGKVj6Jhi6fCpXGXdH6B4rUB7Jx_XF6RPynB8NA-ye5aRzbdasjiQbLuh4fREhEhwgsbLsuPM6k9q8yBMB5sfk1XzPKOSRKCLsV7caPcuyWfOLhYStY628EGn_1quXLBHxXAyJE5Km3uEjkHBDqFJeqR6ZAQpomlhnFCr3i716CxglrhnNwNEleyPOtNv3AWvRvtUHF_IkGqCgnI6qnCzK5oiFvLNldDVkbL42qE";

const BASE = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';

async function listAccounts() {
  console.log("=== Listing all MetaAPI accounts ===");
  const listRes = await fetch(BASE, {
    headers: { 'auth-token': META_API_TOKEN }
  });
  const accounts = await listRes.json();
  console.log(`Found ${accounts.length} account(s):\n`);
  
  for (const acc of accounts) {
    console.log(`ID: ${acc.id}`);
    console.log(`  Login: ${acc.login}`);
    console.log(`  Server: ${acc.server}`);
    console.log(`  State: ${acc.state}`);
    console.log(`  Reliability: ${acc.reliability}`);
    console.log(`  Type: ${acc.type}`);
    console.log(`  Name: ${acc.name}`);
    console.log("");
  }
}

listAccounts();
