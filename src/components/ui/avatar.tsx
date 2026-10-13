"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Avatar>) {
  return (
    <AvatarPrimitive.Avatar
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.AvatarImage>) {
  return (
    <AvatarPrimitive.AvatarImage
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.AvatarFallback>) {
  return (
    <AvatarPrimitive.AvatarFallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
