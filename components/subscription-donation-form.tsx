"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSubscriptionDonation } from "@/app/actions/donation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { clientEnv } from "@/lib/env"
import { useToast } from "@/components/ui/use-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

const fixedAmounts = [200, 500, 1000, 5000]

export default function SubscriptionDonationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState(100)
  const router = useRouter()
  const { toast } = useToast()
  const [frequency, setFrequency] = useState("monthly");
  const [duration, setDuration] = useState("12"); // Default duration
  const [customDuration, setCustomDuration] = useState("");

  const handleDurationChange = (value: string) => {
    setDuration(value);
    setCustomDuration(""); // Reset custom input when selecting predefined values
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("amount", amount.toString())
      formData.set("frequency", frequency)
      formData.set("duration", duration === "" ? customDuration : duration)

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });


      const result = await createSubscriptionDonation(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create subscription")
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript()
      }

      // Initialize Razorpay checkout for subscription
      const options = {
        key: clientEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: result.subscription.id,
        name: "Donation Platform",
        description: `${formData.get("frequency")} donation subscription`,
        prefill: {
          name: result.donor.name,
          email: result.donor.email,
          contact: result.donor.phone,
        },
        handler: (response: any) => {
          toast({
            title: "Subscription Created",
            description: "Your recurring donation has been set up successfully!",
          })
          router.push("/donation/subscription-success")
        },
        theme: {
          color: "#3399cc",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Failed",
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
        <CardTitle>Recurring Donation</CardTitle>
        <CardDescription>Support our cause with a recurring donation</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
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
              onChange={(e) => setAmount(Number(e.target.value) || 100)}
              required
            />
          </div>
          {/* <div className="space-y-2">
            <Label>Frequency</Label>
            <RadioGroup defaultValue="monthly" name="frequency" className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly">Yearly</Label>
              </div>
            </RadioGroup>
          </div> */}

<div className="space-y-4">
      {/* Frequency Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <select
          id="frequency"
          className="w-full p-2 border rounded"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Show duration options based on frequency */}
      {frequency === "monthly" && (
        <div className="space-y-2">
          <Label>Duration (Months)</Label>
          <div className="flex space-x-2">
            {["3", "6", "12"].map((value) => (
              <button
                key={value}
                type="button"
                className={`px-2 py-2 font-medium border rounded ${
                  duration === value ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleDurationChange(value)}
              >
                {value} Months
              </button>
            ))}
            <button
              type="button"
              className={`px-4 py-2 border rounded ${
                customDuration ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setDuration("")}
            >
              Custom
            </button>
          </div>

          {duration === "" && (
            <input
              type="number"
              className="w-full border p-2 mt-2"
              placeholder="Enter custom months"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
            />
          )}
        </div>
      )}

      {frequency === "yearly" && (
        <div className="space-y-2">
          <Label>Duration (Years)</Label>
          <div className="flex space-x-2">
            {["1", "2", "5"].map((value) => (
              <button
                key={value}
                type="button"
                className={`px-4 py-2 border rounded ${
                  duration === value ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleDurationChange(value)}
              >
                {value} Year{value !== "1" ? "s" : ""}
              </button>
            ))}
            <button
              type="button"
              className={`px-4 py-2 border rounded ${
                customDuration ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setDuration("")}
            >
              Custom
            </button>
          </div>

          {duration === "" && (
            <input
              type="number"
              className="w-full border p-2 mt-2"
              placeholder="Enter custom years"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
            />
          )}
        </div>
      )}
    </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Subscribe Now"}
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
