import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeTwilioSignature, escapeXml, isValidTwilioSignature, twiml } from '../lib/dockplus/twilio.ts';

// Vector cross-checked against twilio-node's getExpectedTwilioSignature/validateRequest.
const TOKEN = '12345';
const URL = 'https://mycompany.com/myapp.php?foo=1&bar=2';
const PARAMS = { CallSid: 'CA1234567890ABCDE', Caller: '+12349013030', Digits: '1234', From: '+12349013030', To: '+18005551212' };
const EXPECTED = '0/KCTR6DLpKmkAf8muzZqo1nDgQ=';

test('signature matches the official Twilio SDK', () => {
  assert.equal(computeTwilioSignature(TOKEN, URL, PARAMS), EXPECTED);
  assert.equal(isValidTwilioSignature(TOKEN, URL, PARAMS, EXPECTED), true);
});

test('signature rejects tampering, wrong URL, wrong token and missing header', () => {
  assert.equal(isValidTwilioSignature(TOKEN, URL, { ...PARAMS, From: '+10000000000' }, EXPECTED), false);
  assert.equal(isValidTwilioSignature(TOKEN, 'http://internal:3000/myapp.php?foo=1&bar=2', PARAMS, EXPECTED), false);
  assert.equal(isValidTwilioSignature('wrong', URL, PARAMS, EXPECTED), false);
  assert.equal(isValidTwilioSignature(TOKEN, URL, PARAMS, null), false);
  assert.equal(isValidTwilioSignature(TOKEN, URL, PARAMS, 'short'), false);
});

test('TwiML escapes user-controlled text', () => {
  assert.equal(escapeXml(`Tom & Jerry's <Shop> "A"`), 'Tom &amp; Jerry&apos;s &lt;Shop&gt; &quot;A&quot;');
  assert.equal(twiml('<Hangup/>'), '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
});
