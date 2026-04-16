import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear NextAuth session cookies
  const cookieStore = cookies()
  
  // Clear all NextAuth related cookies
  const response = NextResponse.redirect(new URL("/auth/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
  
  response.cookies.delete("next-auth.session-token")
  response.cookies.delete("__Secure-next-auth.session-token")
  response.cookies.delete("next-auth.csrf-token")
  response.cookies.delete("__Host-next-auth.csrf-token")
  
  return response
}

export async function POST() {
  return GET()
} 