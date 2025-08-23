import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Loader2, Receipt } from 'lucide-react';

interface ReceiptProcessorProps {
  onExpensesAdded: () => void;
}

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ onExpensesAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processReceipt = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Error",
        description: "Please select a receipt image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/... prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Call the receipt processing edge function
      const { data, error } = await supabase.functions.invoke('process-receipt', {
        body: {
          image: base64,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: `Receipt processed! Added ${data.itemsAdded} expense items.`,
        });
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('receipt-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        onExpensesAdded();
      } else {
        throw new Error(data.error || 'Failed to process receipt');
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Error",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Receipt Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="receipt-file">Upload Receipt Image</Label>
          <Input
            id="receipt-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isProcessing}
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            Selected: {selectedFile.name}
          </div>
        )}

        <Button 
          onClick={processReceipt} 
          disabled={!selectedFile || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Receipt...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process Receipt
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          Upload a clear image of your receipt. Our AI will automatically extract and categorize each item as separate expenses.
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptProcessor;