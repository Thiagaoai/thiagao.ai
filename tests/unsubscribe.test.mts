import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buildUnsubscribeUrls, hasUnsubscribeSecret, unsubscribeToken, verifyUnsubscribeToken } from '../lib/briefing/unsubscribe.ts';

afterEach(() => {
  delete process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  delete process.env.AGENT_CRON_SECRET;
});

test('token round-trips and is case/space insensitive on the email', () => {
  process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'secret';
  const token = unsubscribeToken(' Ana@Example.com ');
  assert.ok(token && token.length >= 24);
  assert.equal(verifyUnsubscribeToken('ana@example.com', token!), true);
  assert.equal(verifyUnsubscribeToken('ana@example.com', token!.slice(1)), false);
  assert.equal(verifyUnsubscribeToken('bob@example.com', token!), false);
});

test('falls back to AGENT_CRON_SECRET and returns null without any secret', () => {
  assert.equal(hasUnsubscribeSecret(), false);
  assert.equal(unsubscribeToken('a@b.c'), null);
  assert.equal(buildUnsubscribeUrls('a@b.c'), null);
  process.env.AGENT_CRON_SECRET = 'cron';
  assert.equal(hasUnsubscribeSecret(), true);
  const urls = buildUnsubscribeUrls('a@b.c')!;
  assert.match(urls.pageUrl, /\/newsletter\/sair\?email=a%40b\.c&token=/);
  assert.match(urls.apiUrl, /\/api\/newsletter\/unsubscribe\?email=a%40b\.c&token=/);
});
