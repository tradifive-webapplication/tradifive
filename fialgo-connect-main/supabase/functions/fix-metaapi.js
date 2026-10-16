const META_API_TOKEN = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI3MGEzZmU4ZGUxODk1NTQ1MDI0MTljODMwOWI1NzUzYyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX1dLCJpZ25vcmVSYXRlTGltaXRzIjpmYWxzZSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaW1wZXJzb25hdGVkIjpmYWxzZSwicmVhbFVzZXJJZCI6IjcwYTNmZThkZTE4OTU1NDUwMjQxOWM4MzA5YjU3NTNjIiwiaWF0IjoxNzc3MjgzNjA4fQ.AH6l3FPUMpintBlZBbrALb7gH0hiQLCty68EfKGvyjHbX7F8Ai0ZNO-G44x9wx-iXP6S2Y0Zijtm-HBrtobAdPyyPLgIWNhglJOLiClfb4Hz0cJPqTetfZU6ddyywGmYhu3M4xPSpCRkkANRMYqyr1ITxIrX8Aeif2d3QthfBoeKq3BumrvdK-ApC5geEUnXoeTZQiP8rRxrfWav56JFYXlw9X24Jm1syQg0SfJ4csl_4wWfMqfsTzX3CkQwS85VcRmKf49KOASuVC4_Cnz2OqQ39azQypgbC99PIjAUfBTIM8jGDUA528zVUQV9jo4mxhpgvj31R51LAi2JYqdFVHYbqilDLd9jxnpHZ7KijjjPaauN1saH8flkvyAqpv7ec5es8nw1qN3-KuEdCmurzW5O3ogOG25Se03mjcJqrem4Z5gtMyp2nwNNRBoTR-RQ7pkBGKVj6Jhi6fCpXGXdH6B4rUB7Jx_XF6RPynB8NA-ye5aRzbdasjiQbLuh4fREhEhwgsbLsuPM6k9q8yBMB5sfk1XzPKOSRKCLsV7caPcuyWfOLhYStY628EGn_1quXLBHxXAyJE5Km3uEjkHBDqFJeqR6ZAQpomlhnFCr3i716CxglrhnNwNEleyPOtNv3AWvRvtUHF_IkGqCgnI6qnCzK5oiFvLNldDVkbL42qE";

const BASE = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts';

async function fix() {
  // Step 1: List ALL accounts
  console.log("=== Step 1: Listing all accounts ===");
  const listRes = await fetch(BASE, {
    headers: { 'auth-token': META_API_TOKEN }
  });
  const accounts = await listRes.json();
  console.log(`Found ${accounts.length} account(s):`);
  
  for (const acc of accounts) {
    console.log(`  - ID: ${acc.id}, Login: ${acc.login}, Server: ${acc.server}, State: ${acc.state}, Reliability: ${acc.reliability}, Type: ${acc.type}`);
  }

  // Step 2: Delete ALL existing accounts to start completely fresh
  console.log("\n=== Step 2: Deleting all existing accounts ===");
  for (const acc of accounts) {
    console.log(`  Deleting ${acc.id}...`);
    // First undeploy if deployed
    if (acc.state === 'DEPLOYED' || acc.state === 'DEPLOYING') {
      const undeployRes = await fetch(`${BASE}/${acc.id}/undeploy`, {
        method: 'POST',
        headers: { 'auth-token': META_API_TOKEN }
      });
      console.log(`    Undeploy status: ${undeployRes.status}`);
      // Wait a moment for undeploy
      await new Promise(r => setTimeout(r, 2000));
    }
    const delRes = await fetch(`${BASE}/${acc.id}`, {
      method: 'DELETE',
      headers: { 'auth-token': META_API_TOKEN }
    });
    const delBody = await delRes.text();
    console.log(`    Delete status: ${delRes.status}, Body: ${delBody}`);
  }

  // Step 3: Wait for cleanup
  console.log("\n=== Step 3: Waiting 3 seconds for cleanup ===");
  await new Promise(r => setTimeout(r, 3000));

  // Step 4: Create a fresh account with FREE tier
  console.log("\n=== Step 4: Creating fresh account with regular (free) reliability ===");
  const createRes = await fetch(BASE, {
    method: 'POST',
    headers: {
      'auth-token': META_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "Tradifive-415616401",
      type: "cloud",
      login: "415616401",
      password: "PUT_YOUR_MT5_PASSWORD_HERE",
      server: "Exness-MT5Trial14",
      platform: "mt5",
      magic: 1000,
      reliability: "regular"
    })
  });

  const createData = await createRes.json();
  console.log("Create status:", createRes.status);
  console.log("Create response:", JSON.stringify(createData, null, 2));

  if (createRes.ok) {
    // Step 5: Deploy the account
    console.log("\n=== Step 5: Deploying account ===");
    const deployRes = await fetch(`${BASE}/${createData.id}/deploy`, {
      method: 'POST',
      headers: { 'auth-token': META_API_TOKEN }
    });
    console.log("Deploy status:", deployRes.status);
    console.log("\n✅ SUCCESS! Account ID:", createData.id);
    console.log("Save this ID - you can use it in the app.");
  }
}

fix();
