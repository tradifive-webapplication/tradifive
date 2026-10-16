(async () => {
  try {
    const res = await fetch('https://rylwyxhupwpwsdbvuoej.supabase.co/functions/v1/ai-proxy', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tradifive.in',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, content-type'
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:');
    res.headers.forEach((val, key) => console.log(key, ':', val));
  } catch (err) {
    console.error(err);
  }
})();
