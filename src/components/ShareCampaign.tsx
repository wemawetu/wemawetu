import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Mail,
  Linkedin
} from 'lucide-react';

interface ShareCampaignProps {
  campaign: {
    title: string;
    description: string;
    slug: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ShareCampaign = ({ 
  campaign, 
  variant = 'outline',
  size = 'default',
  className = ''
}: ShareCampaignProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Generate dynamic URL based on current domain
  const getCampaignUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/campaign/${campaign.slug}`;
  };

  const shareUrl = getCampaignUrl();
  const shareText = `Support "${campaign.title}" - ${campaign.description}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Campaign link copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-[#1DA1F2] hover:bg-[#1a8cd8]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20BD5A]',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#0958A8]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-muted hover:bg-muted/80',
      url: `mailto:?subject=${encodeURIComponent(`Support: ${campaign.title}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: shareUrl
        });
        setOpen(false);
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && 'Share'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this campaign</DialogTitle>
          <DialogDescription>
            Help spread the word and support this cause by sharing with your network.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Native share button (mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button 
              className="w-full gap-2" 
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share via...
            </Button>
          )}

          {/* Social share buttons */}
          <div className="grid grid-cols-5 gap-2">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                size="icon"
                className={`h-12 w-full ${option.color} text-white border-0`}
                onClick={() => {
                  if (option.name === 'Email') {
                    window.location.href = option.url;
                    setOpen(false);
                  } else {
                    openShareWindow(option.url);
                  }
                }}
                title={option.name}
              >
                <option.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Sharing helps campaigns reach their goals faster!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};