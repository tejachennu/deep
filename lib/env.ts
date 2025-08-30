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
  NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_live_RBRzmAQOwt8WAl' ,
}


export const env = {
  RAZORPAY_KEY_ID: 'rzp_live_RBRzmAQOwt8WAl',
  RAZORPAY_KEY_SECRET: 'thdjWneoVPgFlhaIUfZExz2k',
  MYSQL_HOST: '194.163.45.105',
  MYSQL_PORT: `3306`,
  MYSQL_USER: 'Deep',
  MYSQL_PASSWORD: 'Deep@123',
  MYSQL_DATABASE: 'deep_payments',
  NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_live_RBRzmAQOwt8WAl',
}
// Validate environment variables
try {
  envSchema.parse(env)
} catch (error) {
  console.error("Invalid environment variables:", error)
  throw new Error("Invalid environment variables")
}

