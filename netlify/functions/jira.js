exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Jira-Path, X-Jira-Method, X-Jira-Body',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Credenciales desde variables de entorno de Netlify (seguras)
    const email    = process.env.JIRA_EMAIL;
    const token    = process.env.JIRA_TOKEN;
    const instance = (process.env.JIRA_INSTANCE || 'https://vip2picallex.atlassian.net').replace(/\/$/, '');

    if (!email || !token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Variables de entorno JIRA_EMAIL y JIRA_TOKEN no configuradas en Netlify.' })
      };
    }

    const base64 = Buffer.from(`${email}:${token}`).toString('base64');
    const path   = event.queryStringParameters?.path || '/rest/api/3/myself';
    const method = event.httpMethod === 'GET' ? 'GET' : (event.headers['x-jira-method'] || event.httpMethod);
    const url    = `${instance}${path}`;

    const fetchOpts = {
      method,
      headers: {
        'Authorization': `Basic ${base64}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const body = event.headers['x-jira-body'] || event.body;
    if ((method === 'POST') && body) {
      fetchOpts.body = body;
    }

    const res  = await fetch(url, fetchOpts);
    const text = await res.text();

    return { statusCode: res.status, headers, body: text };

  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
