'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib'

type RemoteImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null
  alt: string
  fallbackClassName?: string
}

const EXTERNAL_HOSTS = [
  'themealdb.com',
  'thecocktaildb.com',
  'unsplash.com',
  'supabase.co',
  'picsum.photos',
  'images.pexels.com',
]

function isExternalSrc(src: string) {
  try {
    const host = new URL(src).hostname
    return EXTERNAL_HOSTS.some(h => host.includes(h))
  } catch {
    return false
  }
}

export default function RemoteImage({
  src,
  alt,
  className,
  fallbackClassName,
  onError,
  ...props
}: RemoteImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-white/5 text-3xl text-text-grey',
          fallbackClassName,
        )}
        aria-label={alt}
      >
        ▣
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={cn(props.fill && 'absolute inset-0 size-full', className)}
      unoptimized={isExternalSrc(src)}
      onError={event => {
        setFailed(true)
        onError?.(event)
      }}
      {...props}
    />
  )
}
