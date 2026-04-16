import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      // Upload to Supabase Storage
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const ext = file.name.split(".").pop() ?? "jpg"
      const fileName = `${session.user.id}/${Date.now()}.${ext}`

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const { error } = await supabase.storage
        .from("receipts")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName)

      return NextResponse.json({ success: true, url: publicUrl, fileName })
    }

    // Fallback: local storage (development only)
    const fs = require("fs")
    const path = require("path")

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts")
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const safeName = `receipt_${session.user.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = path.join(uploadsDir, safeName)

    const bytes = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(bytes))

    return NextResponse.json({ success: true, url: `/uploads/receipts/${safeName}`, fileName: safeName })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
