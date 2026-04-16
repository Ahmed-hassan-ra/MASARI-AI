import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DollarSign, Wallet, Upload, Receipt, BarChart3, CreditCard, Menu } from "lucide-react"
import { ReceiptUploader } from "@/components/receipt-uploader"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ReceiptsPage() {
  const SideNavigation = () => (
    <nav className="flex flex-1 flex-col gap-2 px-2 py-4">
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/dashboard">
          <Wallet className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/budgets">
          <BarChart3 className="mr-2 h-4 w-4" />
          Budgets
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/expenses">
          <CreditCard className="mr-2 h-4 w-4" />
          Expenses
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/income">
          <DollarSign className="mr-2 h-4 w-4" />
          Income
        </Link>
      </Button>
      <Button variant="default" className="justify-start" asChild>
        <Link href="/receipts">
          <Receipt className="mr-2 h-4 w-4" />
          Receipts
        </Link>
      </Button>
      <Button variant="ghost" className="justify-start" asChild>
        <Link href="/reports">
          <BarChart3 className="mr-2 h-4 w-4" />
          Reports
        </Link>
      </Button>
    </nav>
  )

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 px-2 py-4">
                <Wallet className="h-6 w-6" />
                <span className="font-semibold">MA$ARI-AI</span>
              </div>
              <SideNavigation />
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6" />
            <span className="hidden sm:inline-block">MA$ARI-AI</span>
          </Link>
        </div>
        <nav className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/simple-settings">Settings</Link>
          </Button>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-48 flex-col border-r bg-background sm:flex">
          <SideNavigation />
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Receipt Scanner</h1>
            <Button className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
          </div>
          <div className="grid gap-4">
            <ReceiptUploader />
          </div>
        </main>
      </div>
    </div>
  )
}
