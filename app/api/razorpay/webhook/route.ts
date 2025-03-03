import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import crypto from "crypto"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("x-razorpay-signature") || ""

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(body))
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const { event, payload } = body

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        await handlePaymentAuthorized(payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity)
        break

      case "subscription.activated":
        await handleSubscriptionActivated(payload.subscription.entity)
        break

      case "subscription.halted":
        await handleSubscriptionHalted(payload.subscription.entity)
        break

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload.subscription.entity)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentAuthorized(payment: any) {
  // Update payment status in database
  await executeQuery("UPDATE payments SET status = ?, payment_method = ? WHERE razorpay_payment_id = ?", [
    "authorized",
    payment.method,
    payment.id,
  ])
}

async function handlePaymentFailed(payment: any) {
  // Update payment status in database
  await executeQuery("UPDATE payments SET status = ? WHERE razorpay_payment_id = ?", ["failed", payment.id])
}

async function handleSubscriptionActivated(subscription: any) {
  // Update subscription status in database
  await executeQuery("UPDATE subscriptions SET status = ? WHERE razorpay_subscription_id = ?", [
    "active",
    subscription.id,
  ])
}

async function handleSubscriptionHalted(subscription: any) {
  // Update subscription status in database
  await executeQuery("UPDATE subscriptions SET status = ? WHERE razorpay_subscription_id = ?", [
    "halted",
    subscription.id,
  ])
}

async function handleSubscriptionCancelled(subscription: any) {
  // Update subscription status in database
  await executeQuery(
    "UPDATE subscriptions SET status = ?, end_date = CURRENT_TIMESTAMP WHERE razorpay_subscription_id = ?",
    ["cancelled", subscription.id],
  )
}

