"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface FindVehicleModalProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

const FindVehicleModal = ({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}: FindVehicleModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const openInNewTab = () => {
    window.open(
      "https://ct288750.towbook.net/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn(`gap-2 ${className}`)}>
          {showIcon && <Car className="h-4 w-4" />}
          Find Your Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[85vh] sm:h-[90vh] p-0 flex flex-col overflow-hidden z-[100]">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-primary" />
            Find Your Vehicle
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="absolute top-2 right-2 z-20 gap-1 text-xs bg-background/90 backdrop-blur-sm"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Open in New Tab</span>
          </Button>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Loading vehicle finder...
                </p>
              </div>
            </div>
          )}
          <iframe
            src="https://ct288750.towbook.net/"
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title="Vehicle Finder - TowBook System"
            allow="fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindVehicleModal;
