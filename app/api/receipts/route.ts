import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const receipts = await prisma.receipt.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(receipts)
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return NextResponse.json({ error: "An error occurred while fetching receipts" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { merchant, date, total, imageUrl, category, paymentMethod, items } = await req.json()

    // Validate input
    if (!merchant || !date || !total || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert paymentMethod to string if it's an object
    let paymentMethodString = paymentMethod
    if (typeof paymentMethod === 'object' && paymentMethod !== null) {
      paymentMethodString = paymentMethod.method || JSON.stringify(paymentMethod)
    }

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        userId: session.user.id,
        merchant,
        date: new Date(date),
        total,
        imageUrl,
        category,
        paymentMethod: paymentMethodString,
        items,
      },
    })

    return NextResponse.json(receipt)
  } catch (error) {
    console.error("Error creating receipt:", error)
    return NextResponse.json({ error: "An error occurred while creating receipt" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const receiptId = searchParams.get('id')

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    // Verify the receipt belongs to the user before deleting
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        userId: session.user.id,
      },
    })

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found or unauthorized" }, { status: 404 })
    }

    console.log(`Deleting receipt ${receiptId} for user ${session.user.id}:`, {
      merchant: receipt.merchant,
      total: receipt.total,
      date: receipt.date
    })

    // Find and delete the corresponding expense entry that was created for this receipt
    // The expense description follows the pattern: "{merchant} - Receipt"
    const expenseDescriptionPattern = `${receipt.merchant} - Receipt`
    
    // First, let's find all matching expenses to see what we're dealing with
    const matchingExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        description: expenseDescriptionPattern,
        amount: receipt.total,
        // Use date range to account for timezone differences
        date: {
          gte: new Date(new Date(receipt.date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(receipt.date).setHours(23, 59, 59, 999))
        }
      },
    })

    console.log(`Found ${matchingExpenses.length} matching expenses:`, matchingExpenses.map(exp => ({
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      date: exp.date
    })))

    if (matchingExpenses.length > 0) {
      // Delete all matching expenses (in case there are duplicates)
      const deleteResult = await prisma.expense.deleteMany({
        where: {
          id: {
            in: matchingExpenses.map(exp => exp.id)
          }
        },
      })
      console.log(`Deleted ${deleteResult.count} corresponding expenses for receipt ${receiptId}`)
    } else {
      console.warn(`No matching expenses found for receipt ${receiptId} with pattern: "${expenseDescriptionPattern}", amount: ${receipt.total}, date: ${receipt.date}`)
      
      // Fallback: Try to find expenses with just merchant name in description and same date
      const fallbackExpenses = await prisma.expense.findMany({
        where: {
          userId: session.user.id,
          description: {
            contains: receipt.merchant
          },
          date: {
            gte: new Date(new Date(receipt.date).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(receipt.date).setHours(23, 59, 59, 999))
          }
        },
      })
      
      console.log(`Found ${fallbackExpenses.length} fallback expenses containing merchant "${receipt.merchant}":`, fallbackExpenses.map(exp => ({
        id: exp.id,
        description: exp.description,
        amount: exp.amount,
        date: exp.date
      })))
      
      if (fallbackExpenses.length > 0) {
        // Ask user which expenses to delete (for now, delete expenses that contain "Receipt" in description)
        const receiptExpenses = fallbackExpenses.filter(exp => 
          exp.description.toLowerCase().includes('receipt') ||
          exp.description.includes(receipt.merchant)
        )
        
        if (receiptExpenses.length > 0) {
          const fallbackDeleteResult = await prisma.expense.deleteMany({
            where: {
              id: {
                in: receiptExpenses.map(exp => exp.id)
              }
            },
          })
          console.log(`Fallback: Deleted ${fallbackDeleteResult.count} expenses containing merchant name for receipt ${receiptId}`)
          matchingExpenses.push(...receiptExpenses) // Update count for response
        }
      }
    }

    // Delete the receipt
    await prisma.receipt.delete({
      where: {
        id: receiptId,
      },
    })

    console.log(`Successfully deleted receipt ${receiptId}`)
    return NextResponse.json({ 
      message: "Receipt and corresponding expense deleted successfully",
      deletedExpenses: matchingExpenses.length
    })
  } catch (error) {
    console.error("Error deleting receipt:", error)
    return NextResponse.json({ error: "An error occurred while deleting receipt" }, { status: 500 })
  }
}
