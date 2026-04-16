import { RegisterForm } from "@/components/auth/register-form"
import { Wallet } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mb-8 flex items-center gap-2">
        <Wallet className="h-8 w-8" />
        <h1 className="text-2xl font-bold">MA$ARI-AI</h1>
      </div>
      <RegisterForm />
    </div>
  )
}
