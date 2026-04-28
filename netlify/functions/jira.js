exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const email    = process.env.JIRA_EMAIL;
    const token    = process.env.JIRA_TOKEN;
    const cloudId  = process.env.JIRA_CLOUD_ID || '647f6662-de9f-47dc-b1c3-1922de8a15e8';

    if (!email || !token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Variables JIRA_EMAIL y JIRA_TOKEN no configuradas.' })
      };
    }

    const base64 = Buffer.from(`${email}:${token}`).toString('base64');
    const path   = event.queryStringParameters?.path || '/rest/api/3/myself';
    const method = event.httpMethod;

    // URL correcta para Atlassian Cloud API
    const url = `https://api.atlassian.com/ex/jira/${cloudId}${path}`;

    const fetchOpts = {
      method,
      headers: {
        'Authorization': `Basic ${base64}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (method === 'POST' && event.body) {
      fetchOpts.body = event.body;
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
