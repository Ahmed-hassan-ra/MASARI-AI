import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { ReceiptUploader } from "@/components/receipt-uploader"

export default function ReceiptsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-8">
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
  )
}
