import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { verifyPaymentSignature } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Verify payment signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 })
    }

    // Update payment status in database
    await executeQuery("UPDATE payments SET status = ? WHERE razorpay_order_id = ?", ["completed", razorpay_order_id])

    return NextResponse.json({ success: true, message: "Payment verified successfully" })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 500 })
  }
}

