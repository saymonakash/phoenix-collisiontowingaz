import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuoteData } from "./types";

interface EnhancedQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteData: QuoteData;
}

const EnhancedQuoteModal: React.FC<EnhancedQuoteModalProps> = ({
  open,
  onOpenChange,
  quoteData,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if distance has been calculated (required for quote submission)
  const isDistanceCalculated =
    quoteData.miles && parseFloat(quoteData.miles) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError("Please enter your name and phone number.");
      return;
    }

    if (!isDistanceCalculated) {
      setFormError(
        "Please calculate the distance first using the 'Calculate' button.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare quote data for submission
      const submitData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        message: message.trim() || undefined,

        // Service and location info
        service: quoteData.service,
        fromAddress: quoteData.fromAddress,
        toAddress: quoteData.toAddress,
        miles: quoteData.miles,

        // Vehicle info
        vehicleYear: quoteData.year,
        vehicleMake: quoteData.make,
        vehicleModel: quoteData.model,
        vehiclePlate: quoteData.plate,
        vehicleRegistrationState: quoteData.registrationState,
        isLargeVehicle: quoteData.isLarge,

        // Discounts
        isVeteran: quoteData.isVeteran,
        isStudent: quoteData.isStudent,

        // Calculated cost
        estimatedTotal: quoteData.estimatedTotal,
      };

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!result.success) {
        setFormError(result.message || "Failed to submit quote request");
        return;
      }

      // Success - reset form and show success message
      setShowSuccess(true);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting quote:", error);
      setFormError("Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setShowSuccess(false);
    onOpenChange(false);
    // Reset form state
    setFormError("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setMessage("");
  }

  return (
    <>
      <Dialog open={open && !showSuccess} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a Quote</DialogTitle>
            <DialogDescription>
              Please fill out your details to complete your quote request.
              {!isDistanceCalculated && (
                <span className="text-destructive block mt-2">
                  ⚠️ Please calculate the distance first before submitting your
                  quote.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 ">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid grid-cols-2 gap-4 *:space-y-1">
                <div>
                  <Label htmlFor="quoteName">Full Name *</Label>
                  <Input
                    id="quoteName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="quotePhone">Phone Number *</Label>
                  <Input
                    id="quotePhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="quoteEmail">Email (optional)</Label>
                <Input
                  id="quoteEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send you a confirmation email if provided
                </p>
              </div>
            </div>

            {/* Quote Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quote Summary</h3>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>{" "}
                    {quoteData.service}
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span>{" "}
                    {quoteData.miles} miles
                  </div>
                  <div>
                    <span className="font-medium">Vehicle:</span>{" "}
                    {quoteData.year} {quoteData.make} {quoteData.model}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Total:</span>{" "}
                    <span className="font-bold">
                      ${quoteData.estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">From:</span>{" "}
                    {quoteData.fromAddress}
                  </div>
                  <div>
                    <span className="font-medium">To:</span>{" "}
                    {quoteData.toAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <Label htmlFor="quoteMessage">
                Additional Information (optional)
              </Label>
              <Textarea
                id="quoteMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your situation, special instructions, or any additional details..."
                rows={3}
              />
            </div>

            {formError && (
              <div className="text-destructive text-sm p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                {formError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDistanceCalculated}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quote Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Quote Request Sent Successfully!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Thank you for choosing Collision Towing AZ! We've received your
                quote request.
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3 mt-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                  <li>• We'll contact you within minutes to confirm details</li>
                  <li>• Our driver will be dispatched to your location</li>
                  {customerEmail && (
                    <li>• Check your email for confirmation details</li>
                  )}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Need immediate assistance?</strong>
                  <br />
                  Call us directly at <strong>(623) 283-8345</strong>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedQuoteModal;
