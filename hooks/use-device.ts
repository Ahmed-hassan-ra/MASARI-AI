"use client"

import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    screenWidth: 1024,
    screenHeight: 768,
    orientation: 'landscape'
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768
      
      // Device type detection
      const isMobile = screenWidth < 768
      const isTablet = screenWidth >= 768 && screenWidth < 1024
      const isDesktop = screenWidth >= 1024
      
      // OS detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      
      // Touch device detection
      const isTouchDevice = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
      
      // Orientation detection
      const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait'
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouchDevice,
        screenWidth,
        screenHeight,
        orientation
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    const handleResize = () => {
      updateDeviceInfo()
    }

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Delay to ensure screen dimensions are updated
      setTimeout(updateDeviceInfo, 100)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleOrientationChange)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleOrientationChange)
      }
    }
  }, [])

  return deviceInfo
} 