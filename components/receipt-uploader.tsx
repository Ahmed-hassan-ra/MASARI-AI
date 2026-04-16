"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Receipt, Upload, Camera, FileText, Check, AlertCircle, Loader2, CreditCard, Clock, MapPin, Phone, Trash2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Enhanced types for intelligent OCR
type ReceiptItem = {
  name: string
  price: number
  quantity?: number
  category?: string
  confidence: number
}

type PaymentInfo = {
  method: string
  cardType?: string
  lastFourDigits?: string
  amount: number
  confidence: number
}

type ParsedReceiptData = {
  merchant: string
  address?: string
  phone?: string
  date: string
  time?: string
  total: number
  subtotal?: number
  tax?: number
  tip?: number
  discount?: number
  items: ReceiptItem[]
  paymentMethod: PaymentInfo
  category: string
  confidence: number
  rawText: string
}

type ReceiptData = {
  id: string
  merchant: string
  address?: string
  phone?: string
  date: string
  time?: string
  total: number
  subtotal?: number
  tax?: number
  tip?: number
  discount?: number
  items: ReceiptItem[]
  paymentMethod: PaymentInfo
  category: string
  confidence: number
  image: string
}

// Sample receipt data for demo purposes
const SAMPLE_RECEIPTS = [
  {
    id: "receipt-1",
    merchant: "McDonald's Restaurant",
    address: "2378 PINE RD NH, RICE, MN 56367",
    phone: "320-393-4600",
    date: "2022-12-08",
    time: "08:48 PM",
    total: 8.10,
    subtotal: 7.58,
    tax: 0.52,
    items: [
      { name: "Happy Meal 6 Pc", price: 4.89, confidence: 0.9, category: "Food" },
      { name: "Creamy Ranch Cup", price: 0.00, confidence: 0.8, category: "Food" },
      { name: "Extra Kids Fry", price: 0.00, confidence: 0.8, category: "Food" },
      { name: "1S Coke", price: 0.00, confidence: 0.8, category: "Beverage" },
      { name: "Snack Oreo McFlurry", price: 2.69, confidence: 0.9, category: "Food" }
    ],
    category: "Food & Dining",
    paymentMethod: { method: "Cash", amount: 10.00, confidence: 0.9 },
    confidence: 0.85,
    image: "/placeholder.svg?height=600&width=400",
  }
]

export function ReceiptUploader() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [extractedReceipt, setExtractedReceipt] = useState<ReceiptData | null>(null)
  const [editedReceipt, setEditedReceipt] = useState<Partial<ReceiptData>>({})
  const [savedReceipts, setSavedReceipts] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [editableItems, setEditableItems] = useState<ReceiptItem[]>([])
  const [ocrProvider, setOcrProvider] = useState<string>("")
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [deletingReceiptId, setDeletingReceiptId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch saved receipts from database
  const fetchReceipts = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/receipts', {
        credentials: 'include'
      })
      if (response.ok) {
        const receipts = await response.json()
        console.log('Fetched receipts:', receipts)
        setSavedReceipts(receipts)
      } else {
        console.error('Failed to fetch receipts')
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load receipts when component mounts or when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchReceipts()
    }
  }, [activeTab])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    setUploadSuccess(false)
    setExtractedReceipt(null)
    setProcessingStatus("")

    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.includes("image/")) {
      setUploadError("Please upload an image file (JPEG, PNG, etc.)")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit")
      return
    }

    // Store the file for later upload
    setCurrentFile(file)
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)

    // Start intelligent OCR processing
    setIsUploading(true)
    setProcessingStatus("🔍 Starting intelligent OCR analysis...")
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
      setIsUploading(false)
      setUploadSuccess(true)
      setIsProcessing(true)
          setProcessingStatus("🧠 Processing with advanced AI algorithms...")

          // Call the new intelligent OCR API
          const response = await fetch('/api/receipts/ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: base64
            })
          })

          const result = await response.json()
          setIsProcessing(false)
          setProcessingStatus("")

          if (result.success && result.parsedReceipt) {
            const parsedData: ParsedReceiptData = result.parsedReceipt
            setOcrProvider(result.ocrProvider)
            
            // Convert to our internal format
            const receipt: ReceiptData = {
              id: `receipt-${Date.now()}`,
              merchant: parsedData.merchant || "Unknown Merchant",
              address: parsedData.address,
              phone: parsedData.phone,
              date: parsedData.date || new Date().toISOString().split('T')[0],
              time: parsedData.time,
              total: parsedData.total || 0,
              subtotal: parsedData.subtotal,
              tax: parsedData.tax,
              tip: parsedData.tip,
              discount: parsedData.discount,
              items: parsedData.items || [],
              paymentMethod: parsedData.paymentMethod || { method: "Unknown", amount: 0, confidence: 0 },
              category: parsedData.category || "Other",
              confidence: parsedData.confidence || 0,
              image: previewUrl
            }
            
            setExtractedReceipt(receipt)
            setEditedReceipt(receipt)
            setEditableItems(receipt.items || [])
            
            console.log("✅ Receipt processed successfully:", {
              merchant: receipt.merchant,
              itemCount: receipt.items.length,
              total: receipt.total,
              confidence: receipt.confidence,
              provider: result.ocrProvider
            })
          } else {
            // Start with blank form if OCR fails
            const blankReceipt: ReceiptData = {
              id: `receipt-${Date.now()}`,
              merchant: "",
              date: new Date().toISOString().split('T')[0],
              total: 0,
              items: [],
              paymentMethod: { method: "Unknown", amount: 0, confidence: 0 },
              category: "",
              confidence: 0,
              image: previewUrl
            }
            setExtractedReceipt(blankReceipt)
            setEditedReceipt(blankReceipt)
            setEditableItems([])
            setUploadError('OCR processing failed. Please fill in the details manually.')
          }
        } catch (error) {
        setIsProcessing(false)
          setProcessingStatus("")
          console.error('OCR processing error:', error)
          setUploadError('Failed to process receipt. Please try again.')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setIsUploading(false)
      setIsProcessing(false)
      setProcessingStatus("")
      console.error('File reading error:', error)
      setUploadError('Failed to read file. Please try again.')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Create a synthetic event to reuse the handleFileChange logic
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      } as React.ChangeEvent<HTMLInputElement>

      handleFileChange(syntheticEvent)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleCameraCapture = () => {
    // In a real implementation, this would access the device camera
    // For this demo, we'll just trigger the file input
    triggerFileInput()
  }

  const handleSaveReceipt = async () => {
    try {
      // Upload image first
      let imageUrl = "/placeholder.svg"
      
      if (currentFile) {
        console.log("Uploading file:", currentFile.name)
        const formData = new FormData()
        formData.append('file', currentFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })
        
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          console.error("Upload failed:", uploadError)
          throw new Error(uploadError.error || 'Failed to upload image')
        }
        
        const uploadResult = await uploadResponse.json()
        console.log("Upload result:", uploadResult)
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url
          console.log("Image uploaded successfully to:", imageUrl)
        } else {
          console.error("Upload failed:", uploadResult.error)
          throw new Error(uploadResult.error || 'Failed to upload image')
        }
      } else {
        console.log("No file selected for upload")
      }
      
      // Save receipt to database
      console.log("Saving receipt with imageUrl:", imageUrl)
      const receiptData = {
        merchant: editedReceipt.merchant,
        date: editedReceipt.date,
        total: editedReceipt.total,
        imageUrl,
        category: editedReceipt.category,
        paymentMethod: editedReceipt.paymentMethod,
        items: editedReceipt.items
      }
      console.log("Receipt data:", receiptData)
      
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Receipt save failed:", errorData)
        if (response.status === 401) {
          throw new Error('Please log in to save receipts')
        }
        throw new Error(errorData.error || 'Failed to save receipt')
      }

        // Also create an expense entry
      const expenseResponse = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `${editedReceipt.merchant} - Receipt`,
            amount: editedReceipt.total,
            date: editedReceipt.date,
            category: editedReceipt.category
        }),
        credentials: 'include'
        })

      if (!expenseResponse.ok) {
        console.warn("Failed to create associated expense entry")
      }

    alert("Receipt saved successfully!")
        
        // Refresh receipts list
        fetchReceipts()

            // Reset the form
        setPreviewImage(null)
        setExtractedReceipt(null)
        setEditedReceipt({})
        setEditableItems([])
        setCurrentFile(null)
        setUploadSuccess(false)
        setActiveTab("history") // Switch to history tab to show the saved receipt

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error('Save error:', error)
      alert(`Failed to save receipt. ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const handleInputChange = (field: keyof ReceiptData, value: string | number | PaymentInfo) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addItem = () => {
    const newItem: ReceiptItem = { name: "", price: 0, confidence: 0.5 }
    setEditableItems([...editableItems, newItem])
  }

  const removeItem = (index: number) => {
    const newItems = editableItems.filter((_, i) => i !== index)
    setEditableItems(newItems)
    updateTotal(newItems)
  }

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...editableItems]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'price' ? Number(value) : value
    }
    setEditableItems(newItems)
    updateTotal(newItems)
  }

  const updateTotal = (items: ReceiptItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0)
    setEditedReceipt(prev => ({ ...prev, total, items }))
  }

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      return
    }

    setDeletingReceiptId(receiptId)

    try {
      const response = await fetch(`/api/receipts?id=${receiptId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Delete result:', result)
        
        // Remove the deleted receipt from the list
        setSavedReceipts(prev => prev.filter(receipt => receipt.id !== receiptId))
        
        // Trigger a custom event to refresh dashboard components
        window.dispatchEvent(new CustomEvent('receiptDeleted', { 
          detail: { receiptId, deletedExpenses: result.deletedExpenses } 
        }))
        
        alert(`Receipt deleted successfully! ${result.deletedExpenses > 0 ? 'Associated expense also removed from transactions.' : 'No associated expense found.'}`)
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        alert(`Failed to delete receipt: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete receipt. Please try again.')
    } finally {
      setDeletingReceiptId(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Receipt Scanner
        </CardTitle>
        <CardDescription>
          Upload receipts to automatically track your expenses. We'll extract the merchant, date, and amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
            <TabsTrigger value="history" disabled={isUploading || isProcessing}>
              Receipt History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            {!extractedReceipt && (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center gap-4",
                  "hover:border-primary/50 transition-colors",
                  isUploading && "border-primary/50 bg-primary/5",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ minHeight: "300px" }}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-lg font-medium">Uploading receipt...</p>
                  </div>
                ) : isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-lg font-medium">🧠 Processing with Intelligent OCR...</p>
                    <p className="text-sm text-muted-foreground">{processingStatus}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Google Vision
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        OCR.space
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        Tesseract
                      </div>
                    </div>
                  </div>
                ) : previewImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-md h-64">
                      <Image
                        src={previewImage || "/placeholder.svg"}
                        alt="Receipt preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    {uploadSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">
                          Receipt uploaded successfully! Processing with AI...
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <>
                    <Receipt className="h-16 w-16 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drag and drop your receipt here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click the buttons below to upload</p>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <Button onClick={triggerFileInput}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                      <Button variant="outline" onClick={handleCameraCapture}>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: JPEG, PNG, HEIF • Max size: 5MB
                    </p>
                  </>
                )}

                {uploadError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {extractedReceipt && (
              <div className="space-y-6">
                {/* OCR Confidence and Provider Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Processing Results</h4>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        extractedReceipt.confidence >= 0.8 ? "bg-green-100 text-green-800" :
                        extractedReceipt.confidence >= 0.6 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {Math.round(extractedReceipt.confidence * 100)}% Confidence
                      </div>
                      {ocrProvider && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {ocrProvider}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Extracted {extractedReceipt.items.length} items using intelligent OCR analysis
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Receipt Information</h3>

                    <div className="grid gap-4">
                        {/* Merchant */}
                      <div className="grid gap-2">
                        <Label htmlFor="merchant">Merchant</Label>
                        <Input
                          id="merchant"
                          value={editedReceipt.merchant || ""}
                          onChange={(e) => handleInputChange("merchant", e.target.value)}
                        />
                      </div>

                        {/* Address and Phone in a row */}
                        {(extractedReceipt.address || extractedReceipt.phone) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extractedReceipt.address && (
                              <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Address
                                </Label>
                                <Input
                                  value={extractedReceipt.address}
                                  readOnly
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {extractedReceipt.phone && (
                              <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Phone
                                </Label>
                                <Input
                                  value={extractedReceipt.phone}
                                  readOnly
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={editedReceipt.date || ""}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                        />
                      </div>
                          {extractedReceipt.time && (
                            <div className="grid gap-2">
                              <Label className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time
                              </Label>
                              <Input
                                value={extractedReceipt.time}
                                readOnly
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Financial Breakdown */}
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {extractedReceipt.subtotal && (
                              <div className="grid gap-2">
                                <Label className="text-xs">Subtotal</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={extractedReceipt.subtotal?.toString() || ""}
                                  readOnly
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {extractedReceipt.tax && (
                              <div className="grid gap-2">
                                <Label className="text-xs">Tax</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={extractedReceipt.tax?.toString() || ""}
                                  readOnly
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {extractedReceipt.tip && (
                              <div className="grid gap-2">
                                <Label className="text-xs">Tip</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={extractedReceipt.tip?.toString() || ""}
                                  readOnly
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {extractedReceipt.discount && (
                              <div className="grid gap-2">
                                <Label className="text-xs">Discount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={extractedReceipt.discount?.toString() || ""}
                                  readOnly
                                  className="text-sm text-green-600"
                                />
                              </div>
                            )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="total">Total Amount</Label>
                        <Input
                          id="total"
                          type="number"
                          step="0.01"
                          value={editedReceipt.total ? editedReceipt.total.toString() : ""}
                          onChange={(e) => handleInputChange("total", Number.parseFloat(e.target.value) || 0)}
                          className="font-medium"
                        />
                          </div>
                      </div>

                        {/* Payment Method */}
                      <div className="grid gap-2">
                          <Label className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </Label>
                        <Select
                            value={
                              typeof editedReceipt.paymentMethod === 'object' 
                                ? editedReceipt.paymentMethod?.method || ""
                                : editedReceipt.paymentMethod || ""
                            }
                            onValueChange={(value) => {
                              if (typeof editedReceipt.paymentMethod === 'object') {
                                handleInputChange("paymentMethod", { ...editedReceipt.paymentMethod, method: value })
                              } else {
                                handleInputChange("paymentMethod", { method: value, amount: 0, confidence: 0.5 } as PaymentInfo)
                              }
                            }}
                        >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                              <SelectItem value="Debit Card">Debit Card</SelectItem>
                              <SelectItem value="Check">Check</SelectItem>
                              <SelectItem value="Mobile Payment">Mobile Payment (Apple Pay, Google Pay)</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Gift Card">Gift Card</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                          {extractedReceipt.paymentMethod?.lastFourDigits && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Card ending in: ****{extractedReceipt.paymentMethod.lastFourDigits}
                            </div>
                          )}
                      </div>

                        {/* Category */}
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={editedReceipt.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                              <SelectItem value="Groceries">Groceries</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                              <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                              <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium">Items ({editableItems.length})</h4>
                        <Button variant="outline" size="sm" onClick={addItem}>
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {editableItems.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                            <div className="col-span-5">
                                <Input
                                  placeholder="Item name"
                                  value={item.name}
                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                className="text-sm"
                                />
                              {item.category && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.category}
                              </div>
                              )}
                            </div>
                            {item.quantity && (
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  value={item.quantity?.toString() || "1"}
                                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                  className="text-sm text-center"
                                />
                              </div>
                            )}
                            <div className={cn("col-span-3", !item.quantity && "col-span-5")}>
                                <Input
                                  type="number"
                                  step="0.01"
                                placeholder="Price"
                                value={item.price?.toString() || ""}
                                onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                                className="text-sm"
                                />
                              </div>
                            <div className="col-span-1">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                item.confidence >= 0.8 ? "bg-green-500" :
                                item.confidence >= 0.6 ? "bg-yellow-500" :
                                "bg-red-500"
                              )} title={`${Math.round(item.confidence * 100)}% confidence`} />
                            </div>
                            <div className="col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {editableItems.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No items detected. Add items manually.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-medium">Receipt Image</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Image
                        src={previewImage || extractedReceipt.image}
                        alt="Receipt"
                        width={400}
                        height={600}
                        className="w-full object-contain"
                      />
                </div>

                    <div className="space-y-4">
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewImage(null)
                      setExtractedReceipt(null)
                      setEditedReceipt({})
                      setEditableItems([])
                      setCurrentFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveReceipt}>Save Receipt</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Recent Receipts</h3>
                <Button variant="outline" size="sm" onClick={fetchReceipts} disabled={isLoadingHistory}>
                  {isLoadingHistory ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading receipts...</span>
                </div>
              ) : savedReceipts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No receipts found</p>
                  <p className="text-sm">Upload your first receipt to get started!</p>
                </div>
              ) : (
              <div className="grid gap-4">
                  {savedReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {receipt.imageUrl && 
                         receipt.imageUrl !== "/placeholder.svg" && 
                         receipt.imageUrl !== "undefined" &&
                         receipt.imageUrl.trim() !== "" ? (
                          <Image
                            src={receipt.imageUrl}
                            alt="Receipt thumbnail"
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              console.error("Failed to load thumbnail:", receipt.imageUrl)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{receipt.merchant}</h4>
                      <p className="text-sm text-muted-foreground">
                          {new Date(receipt.date).toLocaleDateString()} • ${receipt.total.toFixed(2)} • {receipt.category || 'Uncategorized'}
                        </p>
                        {receipt.paymentMethod && (
                          <p className="text-xs text-muted-foreground">
                            {receipt.paymentMethod}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteReceipt(receipt.id)}
                          disabled={deletingReceiptId === receipt.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingReceiptId === receipt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Receipt Detail Modal/View */}
              {selectedReceipt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Receipt Details</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedReceipt(null)}
                        >
                          ✕
                    </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Merchant</Label>
                            <p className="text-sm">{selectedReceipt.merchant}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Date</Label>
                            <p className="text-sm">{new Date(selectedReceipt.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Total</Label>
                            <p className="text-sm font-mono">${selectedReceipt.total.toFixed(2)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Category</Label>
                            <p className="text-sm">{selectedReceipt.category || 'Uncategorized'}</p>
                          </div>
                          {selectedReceipt.paymentMethod && (
                            <div>
                              <Label className="text-sm font-medium">Payment Method</Label>
                              <p className="text-sm">{selectedReceipt.paymentMethod}</p>
                            </div>
                          )}
                          
                          {selectedReceipt.items && Array.isArray(selectedReceipt.items) && selectedReceipt.items.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Items</Label>
                              <div className="border rounded-lg overflow-hidden mt-2">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="py-2 px-3 text-left">Item</th>
                                      <th className="py-2 px-3 text-right">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedReceipt.items.map((item: any, index: number) => (
                                      <tr key={index} className="border-t">
                                        <td className="py-2 px-3">{item.name}</td>
                                        <td className="py-2 px-3 text-right">${item.price.toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Receipt Image</Label>
                          <div className="border rounded-lg overflow-hidden mt-2">
                            {selectedReceipt.imageUrl && 
                             selectedReceipt.imageUrl !== "/placeholder.svg" && 
                             selectedReceipt.imageUrl !== "undefined" &&
                             selectedReceipt.imageUrl.trim() !== "" ? (
                              <div className="relative">
                                <Image
                                  src={selectedReceipt.imageUrl}
                                  alt="Receipt"
                                  width={400}
                                  height={600}
                                  className="w-full object-contain"
                                  onError={(e) => {
                                    console.error("Failed to load image:", selectedReceipt.imageUrl)
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                                <div className="h-64 flex items-center justify-center bg-muted hidden">
                                  <div className="text-center">
                                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Image not available</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-64 flex items-center justify-center bg-muted">
                                <div className="text-center">
                                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">No image available</p>
                                  {selectedReceipt.imageUrl && (
                                    <p className="text-xs text-muted-foreground mt-1">URL: {selectedReceipt.imageUrl}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Powered by MA$ARI-AI OCR</p>
        <p>Your data is kept private and secure</p>
      </CardFooter>
    </Card>
  )
}
