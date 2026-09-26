import { randomBytes } from 'node:crypto';
import { Resend } from 'resend';
import { getNewsletterFrom } from '@/lib/briefing/config';
import { getSupabaseAdmin } from '@/lib/briefing/supabase';
import { escapeHtml, senderWithName } from '@/lib/shared/request-guard';
import { formatUsd, type OrderInput } from './catalog';
import { getLiveCatalog } from './pricing';
import { getActiveCampaign, newYorkToday } from './season';

const ORDER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createOrderNumber(now: Date = new Date()) {
  const day = newYorkToday(now).replace(/-/g, '').slice(2);
  const suffix = Array.from(randomBytes(4), (byte) => ORDER_ALPHABET[byte % ORDER_ALPHABET.length]).join('');
  return `FZ-${day}-${suffix}`;
}

export function getFarmz3dConfigStatus() {
  return {
    database: Boolean(getSupabaseAdmin()),
    email: Boolean(process.env.RESEND_API_KEY && process.env.FARMZ3D_ORDERS_EMAIL),
  };
}

type SavedOrder = {
  orderNumber: string;
  productName: string;
  unitPriceCents: number;
  shippingCents: number;
  estimatedTotalCents: number;
  campaign: string;
};

export async function saveOrder(order: OrderInput): Promise<{ saved: SavedOrder; stored: boolean; storeError?: string }> {
  // Price and campaign come from the approved decisions, never from the browser.
  const { products, leadDays, shippingCents: flatShipping } = await getLiveCatalog();
  const product = products.find((item) => item.id === order.productId);
  if (!product) throw new Error('Unknown product.');

  const campaign = getActiveCampaign(new Date(), leadDays).id;
  const shippingCents = order.fulfillment === 'shipping' ? flatShipping : 0;
  const base = {
    productName: product.name,
    unitPriceCents: product.priceCents,
    shippingCents,
    estimatedTotalCents: product.priceCents * order.quantity + shippingCents,
    campaign,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { saved: { orderNumber: createOrderNumber(), ...base }, stored: false, storeError: 'Supabase not configured.' };
  }

  let lastError = '';
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const orderNumber = createOrderNumber();
    const { error } = await supabase.from('farmz3d_orders').insert({
      order_number: orderNumber,
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: product.priceCents,
      quantity: order.quantity,
      shipping_cents: shippingCents,
      estimated_total_cents: base.estimatedTotalCents,
      personalization: order.personalization,
      needed_by: order.neededBy ?? null,
      fulfillment: order.fulfillment,
      shipping_zip: order.fulfillment === 'shipping' ? order.shippingZip ?? null : null,
      customer_name: order.name,
      customer_email: order.email.toLowerCase(),
      customer_phone: order.phone ?? null,
      notes: order.notes ?? null,
      campaign,
    });

    if (!error) return { saved: { orderNumber, ...base }, stored: true };
    lastError = error.message;
    // 23505 = unique violation on order_number; retry with a new number.
    if (error.code !== '23505') break;
  }

  return { saved: { orderNumber: createOrderNumber(), ...base }, stored: false, storeError: lastError };
}

function orderRows(order: OrderInput, saved: SavedOrder) {
  return [
    ['Order', saved.orderNumber],
    ['Product', saved.productName],
    ['Quantity', String(order.quantity)],
    ['Unit price', formatUsd(saved.unitPriceCents)],
    ['Shipping', saved.shippingCents ? formatUsd(saved.shippingCents) : 'Local pickup — no shipping'],
    ['Estimated total', formatUsd(saved.estimatedTotalCents)],
    ['Personalization', order.personalization],
    ['Needed by', order.neededBy ?? '—'],
    ['Fulfillment', order.fulfillment === 'shipping' ? `Shipping to ZIP ${order.shippingZip}` : 'Local pickup'],
    ['Name', order.name],
    ['Email', order.email],
    ['Phone', order.phone ?? '—'],
    ['Notes', order.notes ?? '—'],
  ];
}

function rowsToHtml(rows: string[][]) {
  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b5a4a;vertical-align:top"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>`;
}

export async function sendOrderEmails(order: OrderInput, saved: SavedOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  const ordersEmail = process.env.FARMZ3D_ORDERS_EMAIL;
  if (!apiKey || !ordersEmail) return { emailed: false, error: 'RESEND_API_KEY and FARMZ3D_ORDERS_EMAIL are required.' };

  const resend = new Resend(apiKey);
  const from = process.env.FARMZ3D_FROM_EMAIL || senderWithName('Farmz3D', getNewsletterFrom());
  const rows = orderRows(order, saved);
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  const owner = await resend.emails.send({
    from,
    to: ordersEmail,
    replyTo: order.email,
    subject: `New Farmz3D order ${saved.orderNumber} — ${saved.productName} x${order.quantity}`,
    html: `<h2 style="font-family:Arial,sans-serif">New order</h2>${rowsToHtml(rows)}`,
    text,
  });

  if (owner.error) return { emailed: false, error: owner.error.message };

  // Customer confirmation is best effort: the owner already has the order.
  const customer = await resend.emails.send({
    from,
    to: order.email,
    replyTo: ordersEmail,
    subject: `We got your Farmz3D order ${saved.orderNumber}`,
    html: `<p style="font-family:Arial,sans-serif">Hi ${escapeHtml(order.name)},</p>
<p style="font-family:Arial,sans-serif">Thanks for your order! We will review the details and reply with a confirmation and a payment link. Nothing is charged until you approve it.</p>
${rowsToHtml(rows)}
<p style="font-family:Arial,sans-serif">Just reply to this email if anything needs to change.<br/>— Farmz3D</p>`,
    text: `Hi ${order.name},\n\nThanks for your order! We will reply with a confirmation and a payment link. Nothing is charged until you approve it.\n\n${text}\n\n— Farmz3D`,
  });

  return { emailed: true, customerEmailed: !customer.error };
}
