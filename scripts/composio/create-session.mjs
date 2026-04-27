#!/usr/bin/env node

const requiredToolkits = [
  'gmail',
  'composio',
  'github',
  'googlecalendar',
  'notion',
  'googlesheets',
  'slack',
  'supabase',
  'outlook',
  'perplexityai',
  'twitter',
  'googledrive',
  'googledocs',
  'hubspot',
  'linear',
  'airtable',
];

async function main() {
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error('Missing COMPOSIO_API_KEY. Put it in your local .env, never in git.');
  }

  const userId = process.env.COMPOSIO_USER_ID;
  if (!userId) {
    throw new Error('Missing COMPOSIO_USER_ID. Example: COMPOSIO_USER_ID=thiagaoai-local');
  }

  let Composio;
  try {
    ({ Composio } = await import('@composio/core'));
  } catch {
    throw new Error('Missing @composio/core. Install it only after approving: npm install @composio/core');
  }

  const composio = new Composio();
  const session = await composio.create(userId, {
    toolkits: requiredToolkits,
    manageConnections: {
      waitForConnections: true,
    },
  });

  console.log(JSON.stringify({ userId, toolkits: requiredToolkits, session }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
