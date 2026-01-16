import { forwardRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Heart, Calendar, Hash } from 'lucide-react';

interface DonationReceiptProps {
  donation: {
    id: string;
    amount: number;
    donor_name: string;
    created_at: string;
    payment_reference?: string;
    message?: string;
  };
  campaign: {
    title: string;
    slug: string;
  };
  platformFee: number;
}

export const DonationReceipt = forwardRef<HTMLDivElement, DonationReceiptProps>(
  ({ donation, campaign, platformFee }, ref) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const netAmount = donation.amount - platformFee;

    return (
      <div ref={ref} className="bg-white p-6 max-w-md mx-auto">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">Donation Successful!</h2>
            <p className="text-muted-foreground">Thank you for your generosity</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Receipt Header */}
            <div className="text-center bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Donation Receipt</p>
              <p className="font-mono text-xs text-muted-foreground">
                #{donation.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Donation Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Campaign
                </span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {campaign.title}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </span>
                <span className="font-medium">{formatDate(donation.created_at)}</span>
              </div>
              
              {donation.payment_reference && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Reference
                  </span>
                  <span className="font-mono text-sm">{donation.payment_reference}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Donation Amount</span>
                <span>{formatAmount(donation.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="text-muted-foreground">- {formatAmount(platformFee)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>To Campaign</span>
                <span className="text-primary">{formatAmount(netAmount)}</span>
              </div>
            </div>

            {/* Donor Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Donated by</p>
              <p className="font-semibold">{donation.donor_name}</p>
              {donation.message && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{donation.message}"
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p className="font-semibold mb-1">Wemawetu Foundation</p>
              <p>Thank you for supporting this cause!</p>
              <p className="mt-2">
                This receipt was generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

DonationReceipt.displayName = 'DonationReceipt';