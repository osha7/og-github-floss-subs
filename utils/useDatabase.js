import { supabaseAdmin } from './initSupabaseAdmin';
import { stripe } from './initStripe';

const upsertProductRecord = async (product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error } = await supabaseAdmin
    .from('products')
    .insert([productData], { upsert: true });
  if (error) throw error;
  console.log(`Product inserted/updated: ${product.id}`);
};


const upsertPriceRecord = async (price) => {
  const priceData = {
    id: price.id,
    product_id: price.product,
    active: price.active,
    currency: price.currency,
    description: price.nickname,
    type: price.type,
    unit_amount: price.unit_amount,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata
  };

  const { error } = await supabaseAdmin
    .from('prices')
    .insert([priceData], { upsert: true });
  if (error) throw error;
  console.log(`Price inserted/updated: ${price.id}`);
};

const createOrRetrieveCustomer = async ({ email, uuid }) => {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', uuid)
    .single();
  if (error) {
    // No customer record found, let's create one.
    const customerData = {
      metadata: {
        supabaseUUID: uuid
      }
    };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    // Now insert the customer ID into our Supabase mapping table.
    const { error: supabaseError } = await supabaseAdmin
      .from('customers')
      .insert([{ id: uuid, stripe_customer_id: customer.id }]);
    if (supabaseError) throw supabaseError;
    console.log(`New customer created and inserted for ${uuid}.`);
    return customer.id;
  }
  if (data) return data.stripe_customer_id;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (uuid, payment_method) => {
  const customer = payment_method.customer;
  const { name, phone, address } = payment_method.billing_details;
  await stripe.customers.update(customer, { name, phone, address });
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: address,
      payment_method: payment_method[payment_method.type]
    })
    .eq('id', uuid);
  if (error) throw error;
};



export {
  upsertProductRecord,
  upsertPriceRecord,
  createOrRetrieveCustomer
};
