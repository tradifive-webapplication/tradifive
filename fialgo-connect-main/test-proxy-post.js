(async () => {
  try {
    console.log('Sending request to ai-proxy...');
    const res = await fetch('https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/ai-proxy', {
      method: 'POST',
      headers: {
        'Origin': 'https://tradifive.in',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', parts: [{ text: 'Hello, who are you?' }] }],
        systemInstruction: 'You are a trading coach.'
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Response body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
})();
