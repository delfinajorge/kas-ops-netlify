exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Jira-Instance',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const auth     = event.headers['authorization'] || event.headers['Authorization'] || '';
    const instance = (event.headers['x-jira-instance'] || 'https://vip2picallex.atlassian.net').replace(/\/$/, '');
    const path     = event.queryStringParameters?.path || '/rest/api/3/myself';
    const method   = event.httpMethod;
    const url      = `${instance}${path}`;

    const fetchOpts = {
      method,
      headers: { 'Authorization': auth, 'Accept': 'application/json', 'Content-Type': 'application/json' }
    };
    if (method === 'POST' && event.body) fetchOpts.body = event.body;

    const res  = await fetch(url, fetchOpts);
    const text = await res.text();

    return { statusCode: res.status, headers, body: text };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
