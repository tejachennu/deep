"use client"

import type React from "react"

import { useState } from "react"
import { getDonorDonations } from "@/app/actions/donation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const [email, setEmail] = useState("")
  const [donorData, setDonorData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await getDonorDonations(email)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "No donations found for this email",
          variant: "destructive",
        })
        setDonorData(null)
      } else {
        setDonorData(result)
      }
    } catch (error) {
      console.error("Error fetching donations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch donation history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-8">Donor Dashboard</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Donations</CardTitle>
            <CardDescription>Enter your email to view your donation history</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {donorData && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Donor Information</h2>
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-lg">{donorData.donor.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-lg">{donorData.donor.email}</dd>
                    </div>
                    {donorData.donor.phone && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd className="text-lg">{donorData.donor.phone}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>

            {donorData.payments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">One-Time Donations</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donorData.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {payment.amount} {payment.currency}
                            </TableCell>
                            <TableCell>{payment.status}</TableCell>
                            <TableCell>{payment.razorpay_payment_id || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {donorData.subscriptions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donorData.subscriptions.map((subscription: any) => (
                          <TableRow key={subscription.id}>
                            <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {subscription.amount} {subscription.currency}
                            </TableCell>
                            <TableCell>{subscription.frequency}</TableCell>
                            <TableCell>{subscription.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

