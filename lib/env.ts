import { z } from "zod"

const envSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  MYSQL_HOST: z.string().min(1),
  MYSQL_PORT: z.string().min(1),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string().min(1),
  MYSQL_DATABASE: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1).optional(),
})

// For client components
export const clientEnv = {
  NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_live_Zl5mVSbnDgUKF8' ,
}

// For server components
// export const env = {
//   RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID!,
//   RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
//   MYSQL_HOST: process.env.MYSQL_HOST!,
//   MYSQL_PORT: process.env.MYSQL_PORT!,
//   MYSQL_USER: process.env.MYSQL_USER!,
//   MYSQL_PASSWORD: process.env.MYSQL_PASSWORD!,
//   MYSQL_DATABASE: process.env.MYSQL_DATABASE!,
//   NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
// }

export const env = {
  RAZORPAY_KEY_ID: 'rzp_live_Zl5mVSbnDgUKF8',
  RAZORPAY_KEY_SECRET: 'xYHpqE9nhJw7xmJVfCSdyegv',
  MYSQL_HOST: '194.163.45.105',
  MYSQL_PORT: `3306`,
  MYSQL_USER: 'Deep',
  MYSQL_PASSWORD: 'Deep@123',
  MYSQL_DATABASE: 'deep_payments',
  NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_live_Zl5mVSbnDgUKF8',
}

// Validate environment variables
try {
  envSchema.parse(env)
} catch (error) {
  console.error("Invalid environment variables:", error)
  throw new Error("Invalid environment variables")
}

