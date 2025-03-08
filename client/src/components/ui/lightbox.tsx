
import * as React from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LightboxProps {
  image: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Lightbox({ image, alt, open, onOpenChange }: LightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
        <div className="relative flex items-center justify-center w-full h-full">
          <img 
            src={image} 
            alt={alt} 
            className="max-w-full max-h-[85vh] object-contain rounded-md"
          />
          <Button 
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 h-auto" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
