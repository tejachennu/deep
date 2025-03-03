"use server"

import { executeQuery, initializeDatabase } from "@/lib/db"
import { createOrder, createPlan } from "@/lib/razorpay"
import { revalidatePath } from "next/cache"
import axios from "axios"
import { z } from "zod"
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: 'rzp_test_j2X7xk2nK287Ri',
  key_secret: 'zV641NZ9ocDm8fRhO7QqAco6',
});


// Initialize database on first import
initializeDatabase().catch(console.error)

// Validate one-time donation data
const donationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least 1"),
})

// Validate subscription data
const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  amount: z.number().min(1, "Amount must be at least 1"),
  frequency: z.enum(["monthly", "yearly"]),
})

// Create a one-time donation
export async function createDonation(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || ""
    const amount = Number.parseInt(formData.get("amount") as string)

    // Validate input data
    const validatedData = donationSchema.parse({ name, email, phone, amount })

    // Check if donor exists, otherwise create
    let donorId: number
    const existingDonor = await executeQuery<any[]>("SELECT id FROM donors WHERE email = ?", [email])

    if (existingDonor.length > 0) {
      donorId = existingDonor[0].id
    } else {
      const result = await executeQuery<any>("INSERT INTO donors (name, email, phone) VALUES (?, ?, ?)", [
        name,
        email,
        phone,
      ])
      donorId = result.insertId
    }

    // Create receipt ID
    const receipt = `don_${Date.now()}`

    // Create Razorpay order
    const order = await createOrder(amount, "INR", receipt)

    // Save payment record
    await executeQuery("INSERT INTO payments (donor_id, razorpay_order_id, amount) VALUES (?, ?, ?)", [
      donorId,
      order.id,
      amount,
    ])

    return {
      success: true,
      order,
      donor: { id: donorId, name, email, phone },
    }
  } catch (error) {
    console.error("Create donation error:", error)
    return { success: false, error: "Failed to create donation" }
  }
}


// export async function createSubscription(name: string, email: string, phone: string, amount: number, frequency: "monthly" | "yearly", duration: number) {
//   try {

//     const keySecret = "zV641NZ9ocDm8fRhO7QqAco6";
//     const keyId = "rzp_test_j2X7xk2nK287Ri";
//     const Plans = [
//       { id: "plan_Q1vnu0qLfa2V6Z", name: "Platinum Plan Yearly", amount: 15000 , frequency: "yearly"},
//       { id: "plan_Q1vnXB7MiMDoDR", name: "Gold Plan Yearly", amount: 7500 , frequency: "yearly"},
//       { id: "plan_Q1vnAemMuSzMDt", name: "Silver Plan Yearly", amount: 3500 , frequency: "yearly"},
//       { id: "plan_Q1vmkWhJ2v1WjC", name: "Bronze Plan Yearly", amount: 1500, frequency: "yearly" },
//       { id: "plan_Q1vjSBvodUh83U", name: "Platinum Plan Monthly", amount: 200 , frequency: "monthly"},
//       { id: "plan_Q1vids2Ywra2zl", name: "Gold Plan Monthly", amount: 500, frequency: "monthly" },
//       { id: "plan_Q1vi9LJc7xyYrX", name: "Silver Plan Monthly", amount: 1000 , frequency: "monthly"},
//       { id: "plan_Q1vhN25ckhXhiH", name: "Bronze Plan Monthly", amount: 5000 , frequency: "monthly"},
//     ];



//     if (!keyId || !keySecret) {
//       throw new Error("❌ Razorpay API keys are missing!");
//     }

//     if (!amount || amount <= 0) {
//       throw new Error("❌ Invalid amount. Amount must be greater than zero.");
//     }




//     // 1️⃣ Create Plan
//     const planDetails = {
//       period: frequency, // "monthly" or "yearly"
//       interval: 1,
//       item: {
//         name: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation Plan`,
//         amount: amount * 100, // Convert ₹ to paise
//         currency: "INR",
//         description: `Recurring donation of ₹${amount} (${frequency})`,
//       },
//       notes: {
//         createdBy: "Subscription API",
//       },
//     };

//     console.log("🛠️ Creating Plan with Details:", planDetails);

//     const planResponse = await axios.post("https://api.razorpay.com/v1/plans", planDetails, {
//       auth: {
//         username: keyId,
//         password: keySecret,
//       },
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!planResponse.data.id) {
//       throw new Error("❌ Failed to create plan: " + (planResponse.data.error?.description || "Unknown error"));
//     }

//     console.log("✅ Plan Created Successfully:", planResponse.data);

//     // 2️⃣ Create Subscription
//     const subscriptionDetails = {
//       plan_id: planResponse.data.id, // Use the newly created plan ID
//       total_count: frequency === "monthly" ? 12 : 5, // 12 for monthly, 1 for yearly
//       customer_notify: 1,
//       notes: { name, email, phone },
//     };

//     console.log("🛠️ Creating Subscription with Details:", subscriptionDetails);

//     const subscriptionResponse = await axios.post("https://api.razorpay.com/v1/subscriptions", subscriptionDetails, {
//       auth: {
//         username: keyId,
//         password: keySecret,
//       },
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!subscriptionResponse.data.id) {
//       throw new Error("❌ Failed to create subscription: " + (subscriptionResponse.data.error?.description || "Unknown error"));
//     }

//     console.log("✅ Subscription Created Successfully:", subscriptionResponse.data);

//     return {
//       success: true,
//       subscription: subscriptionResponse.data,
//     };
//   } catch (error) {
//     console.error("🚨 Subscription Creation Error:", error || error);
//     return { success: false, error: error || error };
//   }
// }

export async function createSubscription(
  name: string,
  email: string,
  phone: string,
  amount: number,
  frequency: "monthly" | "yearly",
  duration: number
) {
  try {
    const keySecret = "zV641NZ9ocDm8fRhO7QqAco6";
    const keyId = "rzp_test_j2X7xk2nK287Ri";

    const Plans = [
      { id: "plan_Q1vnu0qLfa2V6Z", name: "Platinum Plan Yearly", amount: 15000, frequency: "yearly" },
      { id: "plan_Q1vnXB7MiMDoDR", name: "Gold Plan Yearly", amount: 7500, frequency: "yearly" },
      { id: "plan_Q1vnAemMuSzMDt", name: "Silver Plan Yearly", amount: 3500, frequency: "yearly" },
      { id: "plan_Q1vmkWhJ2v1WjC", name: "Bronze Plan Yearly", amount: 1500, frequency: "yearly" },
      { id: "plan_Q1vjSBvodUh83U", name: "Platinum Plan Monthly", amount: 200, frequency: "monthly" },
      { id: "plan_Q1vids2Ywra2zl", name: "Gold Plan Monthly", amount: 500, frequency: "monthly" },
      { id: "plan_Q1vi9LJc7xyYrX", name: "Silver Plan Monthly", amount: 1000, frequency: "monthly" },
      { id: "plan_Q1vhN25ckhXhiH", name: "Bronze Plan Monthly", amount: 5000, frequency: "monthly" },
    ];

    if (!keyId || !keySecret) {
      throw new Error("❌ Razorpay API keys are missing!");
    }

    if (!amount || amount <= 0) {
      throw new Error("❌ Invalid amount. Amount must be greater than zero.");
    }

    // 🔍 Check if a matching plan already exists
    const existingPlan = Plans.find((plan) => plan.amount === amount && plan.frequency === frequency);

    let planId;
    if (existingPlan) {
      console.log("✅ Using Existing Plan:", existingPlan);
      planId = existingPlan.id;
    } else {
      // 1️⃣ Create New Plan if No Matching Plan Exists
      const planDetails = {
        period: frequency,
        interval: 1,
        item: {
          name: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Donation Plan`,
          amount: amount * 100, // Convert ₹ to paise
          currency: "INR",
          description: `Recurring donation of ₹${amount} (${frequency})`,
        },
        notes: {
          createdBy: "Subscription API",
        },
      };

      console.log("🛠️ Creating New Plan with Details:", planDetails);

      const planResponse = await axios.post("https://api.razorpay.com/v1/plans", planDetails, {
        auth: {
          username: keyId,
          password: keySecret,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!planResponse.data.id) {
        throw new Error("❌ Failed to create plan: " + (planResponse.data.error?.description || "Unknown error"));
      }

      console.log("✅ New Plan Created Successfully:", planResponse.data);
      planId = planResponse.data.id;
    }

    // 2️⃣ Create Subscription using the found or created plan ID
    const subscriptionDetails = {
      plan_id: planId,
      total_count: duration ? duration : 1, // 12 for monthly, 5 for yearly
      customer_notify: 1,
      notes: { name, email, phone },
    };

    console.log("🛠️ Creating Subscription with Details:", subscriptionDetails);

    const subscriptionResponse = await axios.post("https://api.razorpay.com/v1/subscriptions", subscriptionDetails, {
      auth: {
        username: keyId,
        password: keySecret,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!subscriptionResponse.data.id) {
      throw new Error("❌ Failed to create subscription: " + (subscriptionResponse.data.error?.description || "Unknown error"));
    }

    console.log("✅ Subscription Created Successfully:", subscriptionResponse.data);

    return {
      success: true,
      subscription: subscriptionResponse.data,
    };
  } catch (error) {
    console.error("🚨 Subscription Creation Error:", error);
    return { success: false, error: error  };
  }
}




export async function createSubscriptionDonation(formData: FormData) {

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || "";
    const amount = Number.parseInt(formData.get("amount") as string);
    const frequency = formData.get("frequency") as "monthly" | "yearly";
    const duration = Number.parseInt(formData.get("duration") as string);

    console.log("User Data:", { name, email, phone, amount, frequency });

    // Call the merged function (plan + subscription)
    const subscriptionResponse = await createSubscription(name, email, phone, amount, frequency ,duration);

    if (!subscriptionResponse.success) {
      throw new Error(subscriptionResponse);
    }

    return {
      success: true,
      subscription: subscriptionResponse.subscription,
      donor: { name, email, phone },
    };
  } catch (error) {
    console.error("Create subscription error:", error);
    return { success: false, error: "Failed to create subscription" };
  }
}



// Verify payment and update database
export async function verifyPayment(orderId: string, paymentId: string, signature: string) {

  try {
    const response = await fetch(`https://deep-qd13.vercel.app/api/razorpay/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    })

    const data = await response.json()

    if (data.success) {
      // Update payment in database
      await executeQuery("UPDATE payments SET razorpay_payment_id = ?, status = ? WHERE razorpay_order_id = ?", [
        paymentId,
        "completed",
        orderId,
      ])

      revalidatePath("/donations")
      return { success: true }
    }

    return { success: false, error: data.message }
  } catch (error) {
    console.error("Payment verification error:", error)
    return { success: false, error: "Payment verification failed" }
  }
}

// Get donor's donation history
export async function getDonorDonations(email: string) {
  try {
    const donor = await executeQuery<any[]>("SELECT id, name, email, phone FROM donors WHERE email = ?", [email])

    if (donor.length === 0) {
      return { success: false, error: "Donor not found" }
    }

    const donorId = donor[0].id

    // Get one-time donations
    const payments = await executeQuery<any[]>(
      `SELECT id, razorpay_payment_id, razorpay_order_id, amount, currency, status, 
       payment_method, created_at FROM payments WHERE donor_id = ?`,
      [donorId],
    )

    // Get subscriptions
    const subscriptions = await executeQuery<any[]>(
      `SELECT id, razorpay_subscription_id, plan_id, status, amount, currency, 
       frequency, start_date, end_date, created_at FROM subscriptions WHERE donor_id = ?`,
      [donorId],
    )

    return {
      success: true,
      donor: donor[0],
      payments,
      subscriptions,
    }
  } catch (error) {
    console.error("Get donor donations error:", error)
    return { success: false, error: "Failed to get donation history" }
  }
}

