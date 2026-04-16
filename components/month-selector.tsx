"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthSelectorProps {
  selectedMonth: number // 0-11 (JavaScript month format)
  selectedYear: number
  onMonthYearChange: (month: number, year: number) => void
  className?: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MonthSelector({ 
  selectedMonth, 
  selectedYear, 
  onMonthYearChange, 
  className = "" 
}: MonthSelectorProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Generate years from current year back to 5 years ago
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      onMonthYearChange(11, selectedYear - 1)
    } else {
      onMonthYearChange(selectedMonth - 1, selectedYear)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthYearChange(0, selectedYear + 1)
    } else {
      onMonthYearChange(selectedMonth + 1, selectedYear)
    }
  }

  const goToCurrentMonth = () => {
    onMonthYearChange(currentMonth, currentYear)
  }

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear
  const isFutureMonth = selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Select 
          value={selectedMonth.toString()} 
          onValueChange={(value) => onMonthYearChange(parseInt(value), selectedYear)}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => onMonthYearChange(selectedMonth, parseInt(value))}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        disabled={isFutureMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goToCurrentMonth}
          className="h-8 px-2 text-xs"
        >
          Current
        </Button>
      )}
    </div>
  )
} 