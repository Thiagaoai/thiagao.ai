import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COLLECTIONS, OrderInputSchema, PRODUCTS } from '../lib/farmz3d/catalog.ts';

const valid = {
  productId: 'christmas-name-ornament',
  quantity: 2,
  personalization: 'Emma 2026',
  neededBy: '',
  fulfillment: 'shipping',
  shippingZip: '02601',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '',
  notes: '',
};

test('catalog is consistent', () => {
  const ids = PRODUCTS.map((product) => product.id);
  assert.equal(new Set(ids).size, ids.length, 'product ids are unique');
  const collections = new Set(COLLECTIONS.map((collection) => collection.id));
  for (const product of PRODUCTS) {
    assert.ok(collections.has(product.collection), `${product.id} has a known collection`);
    assert.ok(Number.isInteger(product.priceCents) && product.priceCents > 0, `${product.id} has a price`);
  }
  for (const collection of collections) {
    assert.ok(PRODUCTS.some((product) => product.collection === collection), `${collection} has products`);
  }
});

test('valid order parses and blanks become undefined', () => {
  const order = OrderInputSchema.parse(valid);
  assert.equal(order.neededBy, undefined);
  assert.equal(order.phone, undefined);
  assert.equal(order.quantity, 2);
});

test('pickup does not need a ZIP; shipping does', () => {
  assert.equal(OrderInputSchema.safeParse({ ...valid, fulfillment: 'pickup', shippingZip: '' }).success, true);
  const missingZip = OrderInputSchema.safeParse({ ...valid, shippingZip: '' });
  assert.equal(missingZip.success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, shippingZip: 'abcde' }).success, false);
});

test('invalid orders are rejected', () => {
  assert.equal(OrderInputSchema.safeParse({ ...valid, productId: 'not-a-product' }).success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, quantity: 0 }).success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, quantity: 51 }).success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, email: 'nope' }).success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, personalization: '   ' }).success, false);
  assert.equal(OrderInputSchema.safeParse({ ...valid, neededBy: '12/15/2026' }).success, false);
});
