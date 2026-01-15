"use client";
import { useState } from "react";
import Image from "next/image";
import { getMinioUrl } from "@/utils/image-helper"; 
import Skeleton from "./Skeleton";


interface ComicImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  unoptimized?: boolean; 
  priority?: boolean;
}

export default function ComicImage({ 
  src, alt, className, fill, width, height, unoptimized 
}: ComicImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      <Image
        src={getMinioUrl(src)}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`transition-opacity duration-500 object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        unoptimized={unoptimized} 
      />
    </div>
  );
}