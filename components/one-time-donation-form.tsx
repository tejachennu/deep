"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDonation, verifyPayment } from "@/app/actions/donation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { clientEnv } from "@/lib/env"
import { useToast } from "@/components/ui/use-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function OneTimeDonationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const fixedAmounts = [12000,6000,3000]
  const [amount, setAmount] = useState()


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createDonation(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create donation")
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript()
      }

      // Initialize Razorpay checkout
      const options = {
        key: clientEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "DEEP Disease Eradication Through Education and Prevention TRUST",
        description: "Donation to our cause",
        order_id: result.order.id,
        prefill: {
          name: result.donor.name,
          email: result.donor.email,
          contact: result.donor.phone,
        },
        handler: async (response: any) => {
          debugger
          const verificationResult = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          )
          debugger

          if (verificationResult.success) {
            toast({
              title: "Payment Successful",
              description: "Thank you for your donation!",
            })
            router.push("/donation/success")
          } else {
            toast({
              title: "Payment Successful",
              description: "Thank you for your donation!",
            })
            router.push("/donation/success")
          }
        },
        theme: {
          color: "#3399cc",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Donation error:", error)
      toast({
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>Support our cause with a one-time donation</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Donation Amount (₹)</Label>
            <div className="flex flex-wrap gap-2">
              {fixedAmounts.map((amt) => (
                <Button key={amt} type="button" variant={amount === amt ? "default" : "outline"} onClick={() => setAmount(amt)}>
                  ₹{amt}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              placeholder="Enter custom amount"
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <label className="block text-sm text-gray-600">
              Minimum 1000 brings Hope and Opportunity
            </label>
          </div>

          { amount > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone </Label> 
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                  <label className="block text-sm text-gray-600">
                    If you don't want/have email address add donor@deepindia.org
                  </label>
                </div>
                <div className="space-y-2">
                      <Label htmlFor="pan">Pan (Optional)</Label>
                      <Input id="pan" name="pan"  type="tel" />
                      <label className="block text-sm text-gray-600">
                         Please provide for instant 80G certificate
                      </label>
                </div>
              </>
            )
          }
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Donate Now"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// Load Razorpay script
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"))
    document.body.appendChild(script)
  })
}

