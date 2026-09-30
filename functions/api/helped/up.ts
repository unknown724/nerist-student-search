export async function onRequest() {
  const targetUrl = 'https://api.counterapi.dev/v1/nerist-student-directory/helped/up';
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: `CounterAPI returned status ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
