"use client"

import { useDevice } from "@/hooks/use-device"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Tablet, Monitor, RotateCcw } from "lucide-react"

export function ResponsiveDemo() {
  const device = useDevice()
  
  const getDeviceIcon = () => {
    if (device.isMobile) return <Smartphone className="h-5 w-5" />
    if (device.isTablet) return <Tablet className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }
  
  const getDeviceColor = () => {
    if (device.isMobile) return "bg-green-500"
    if (device.isTablet) return "bg-blue-500"
    return "bg-purple-500"
  }
  
  const getLayoutDescription = () => {
    if (device.isMobile) return "Single column, bottom navigation, compact spacing"
    if (device.isTablet) return "Two columns, hybrid navigation, medium spacing"
    return "Multi-column, sidebar navigation, generous spacing"
  }

  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDeviceIcon()}
          <span className="text-dynamic-base">
            Responsive Adaptation
          </span>
          <Badge variant="outline" className={`${getDeviceColor()} text-white border-none`}>
            {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-dynamic-xs">
          Real-time layout adaptation based on your current screen size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Device Info */}
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Screen Size:</span>
            <span className="text-muted-foreground">
              {device.screenWidth} × {device.screenHeight}px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Device Type:</span>
            <span className="text-muted-foreground">
              {device.isMobile ? 'Mobile Phone' : 
               device.isTablet ? 'Tablet' : 'Desktop/Laptop'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Orientation:</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <RotateCcw className="h-3 w-3" />
              {device.orientation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Touch Device:</span>
            <span className="text-muted-foreground">
              {device.isTouchDevice ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Operating System:</span>
            <span className="text-muted-foreground">
              {device.isIOS ? 'iOS' : device.isAndroid ? 'Android' : 'Other'}
            </span>
          </div>
        </div>

        {/* Layout Description */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Current Layout Configuration:</h4>
          <p className="text-sm text-muted-foreground">
            {getLayoutDescription()}
          </p>
        </div>

        {/* Responsive Grid Demo */}
        <div className="space-y-2">
          <h4 className="font-medium">Grid System Demo:</h4>
          <div className={`grid gap-2 ${device.isMobile ? 'grid-cols-1' : device.isTablet ? 'grid-cols-2' : 'grid-cols-4'} transition-all duration-300`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className={`${getDeviceColor()} rounded p-3 text-white text-center text-sm transition-all duration-300`}
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Button Size Demo */}
        <div className="space-y-2">
          <h4 className="font-medium">Touch-Optimized Buttons:</h4>
          <div className="flex gap-2 flex-wrap">
            <Button 
              size={device.isMobile ? "lg" : device.isTablet ? "default" : "sm"}
              className="transition-all duration-300"
            >
              Primary Action
            </Button>
            <Button 
              variant="outline"
              size={device.isMobile ? "lg" : device.isTablet ? "default" : "sm"}
              className="transition-all duration-300"
            >
              Secondary
            </Button>
          </div>
        </div>

        {/* Text Scaling Demo */}
        <div className="space-y-2">
          <h4 className="font-medium">Dynamic Text Scaling:</h4>
          <div className="space-y-1">
            <p className="text-dynamic-xs">Small text that adapts to screen size</p>
            <p className="text-dynamic-sm">Medium text that scales responsively</p>
            <p className="text-dynamic-base">Large text optimized for readability</p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-1">Test Instructions:</h4>
          <p className="text-sm text-yellow-700">
            Open developer tools (F12), enable device simulation, and select different devices to see real-time adaptation!
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 