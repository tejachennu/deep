import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OneTimeDonationForm from "@/components/one-time-donation-form"
import SubscriptionDonationForm from "@/components/subscription-donation-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="max-w-4xl w-full mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Our Cause</h1>
        <p className="text-muted-foreground">
          Your donation helps us make a difference. Choose a one-time donation or become a regular supporter.
        </p>
      </div>

      <Tabs defaultValue="one-time" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one-time">One-Time Donation</TabsTrigger>
          <TabsTrigger value="subscription">Monthly/Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="one-time">
          <OneTimeDonationForm />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionDonationForm />
        </TabsContent>
      </Tabs>
    </main>
  )
}

