import Razorpay from "razorpay"
import { env } from "./env"
import crypto from "crypto"

// Initialize Razorpay
export const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

// Create a one-time payment order
export async function createOrder(amount: number, currency = "INR", receipt: string) {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    }

    const order = await razorpayInstance.orders.create(options)
    return order
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    throw new Error("Failed to create payment order")
  }
}

// Create a subscription plan
export async function createPlan(
  planName: string,
  amount: number,
  interval: "weekly" | "monthly" | "yearly",
  currency = "INR",
) {
  try {
    const plan = await razorpayInstance.plans.create({
      period: interval,
      interval: 1,
      item: {
        name: planName,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
      },
    })
    return plan
  } catch (error) {
    console.error("Razorpay plan creation error:", error)
    throw new Error("Failed to create subscription plan")
  }
}

// Create a subscription
export async function createSubscription(
  planId: string,
  totalCount: number,
  customerId: string,
  customerEmail: string,
  customerPhone: string,
) {
  try {
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: planId,
      total_count: totalCount,
      customer_notify: 1,
      customer: {
        name: customerId,
        email: customerEmail,
        contact: customerPhone,
      },
    })
    return subscription
  } catch (error) {
    console.error("Razorpay subscription creation error:", error)
    throw new Error("Failed to create subscription")
  }
}

// // Verify payment signature
// export function verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {

//   console.log("RazorpayOrderId:", razorpayOrderId)
//   console.log("RazorpayPaymentId:", razorpayPaymentId)
//   console.log("Signature:", signature)


//   const generatedSignature = crypto
//     .createHmac("sha256", 'zV641NZ9ocDm8fRhO7QqAco6')
//     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
//     .digest("hex")
//   console.log("Generated signature:", generatedSignature)
//   console.log("Received signature:", signature ,razorpayPaymentId ,razorpayOrderId)


//   return generatedSignature === signature
// }

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
) {
  console.log("RazorpayOrderId:", razorpayOrderId);
  console.log("RazorpayPaymentId:", razorpayPaymentId);
  console.log("Signature:", signature);

  // Trim to avoid extra spaces
  const orderIdTrimmed = razorpayOrderId.trim();
  const paymentIdTrimmed = razorpayPaymentId.trim();

  const secret = "zV641NZ9ocDm8fRhO7QqAco6"; // Replace with actual secret
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderIdTrimmed}|${paymentIdTrimmed}`)
    .digest("hex");

  console.log("Generated signature:", generatedSignature);
  console.log("Received signature:", signature);

  return generatedSignature.toLowerCase() === signature.toLowerCase();
}
