import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { DiscountInfo } from "./types";

interface DiscountFormProps {
  discountInfo: DiscountInfo;
  onDiscountInfoChange: (info: Partial<DiscountInfo>) => void;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ discountInfo, onDiscountInfoChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Discounts Available</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="isVeteran"
            checked={discountInfo.isVeteran}
            onCheckedChange={(checked) => onDiscountInfoChange({ isVeteran: checked })}
          />
          <Label htmlFor="isVeteran">
            Veteran discount (10% off)
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isStudent"
            checked={discountInfo.isStudent}
            onCheckedChange={(checked) => onDiscountInfoChange({ isStudent: checked })}
          />
          <Label htmlFor="isStudent">
            Student discount (8% off)
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DiscountForm;
