import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OneTimeDonationForm from "@/components/one-time-donation-form";
import SubscriptionDonationForm from "@/components/subscription-donation-form";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50">
      <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl relative overflow-visible pb-6">
  {/* Floating Logo - Adjusted */}
  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full shadow-md">
    <Image src="/DEEP Logo.png" width={200} height={200} alt="Logo" className="rounded-md" />
  </div>

  {/* Text Content */}
  {/* <div className="text-center pt-14 px-6">
    <p className="text-lg font-semibold text-gray-800">
      DEEP Disease Eradication Through Education and Prevention TRUST
    </p>
  </div> */}


        {/* Donation Heading */}
        <div className="text-center px-6 pt-14">
          <h1 className="text-2xl font-bold mb-2">Support Our Cause</h1>
          <p className="text-gray-600">
            Your donation helps us make a difference. Choose a one-time donation or become a regular supporter.
          </p>
        </div>

        {/* Tabs for Donations */}
        <Tabs defaultValue="one-time" className="w-full max-w-md px-6 mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="one-time" className="py-2 rounded-lg">One-Time Donation</TabsTrigger>
            <TabsTrigger value="subscription" className="py-2 rounded-lg">Monthly/Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="one-time">
            <OneTimeDonationForm />
          </TabsContent>
          <TabsContent value="subscription">
            <SubscriptionDonationForm />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
