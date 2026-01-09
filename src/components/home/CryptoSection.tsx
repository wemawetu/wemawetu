import { useEffect, useState } from "react";
import { Coins, ExternalLink, Copy, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CryptoConfig {
  id: string;
  coin_name: string;
  coin_symbol: string;
  contract_address: string;
  network: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  how_to_buy: string | null;
}

export function CryptoSection() {
  const [crypto, setCrypto] = useState<CryptoConfig | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCrypto() {
      const { data } = await supabase
        .from("crypto_config")
        .select("*")
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      if (data) {
        setCrypto(data);
      }
    }
    fetchCrypto();
  }, []);

  if (!crypto) return null;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(crypto.contract_address);
    setCopied(true);
    toast({ title: "Copied!", description: "Contract address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Support Us With Crypto
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
              ${crypto.coin_symbol} for Good
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join our mission by supporting us through our community token. 100% of proceeds go directly to humanitarian projects.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Coin Info */}
              <div className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex items-center gap-4 mb-6">
                  {crypto.logo_url ? (
                    <img
                      src={crypto.logo_url}
                      alt={crypto.coin_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Coins className="h-8 w-8 text-primary-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {crypto.coin_name}
                    </h3>
                    <p className="text-muted-foreground">${crypto.coin_symbol} on {crypto.network}</p>
                  </div>
                </div>

                {crypto.description && (
                  <p className="text-muted-foreground mb-6">{crypto.description}</p>
                )}

                {/* Contract Address */}
                <div className="bg-background/50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-foreground font-mono flex-1 truncate">
                      {crypto.contract_address}
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyAddress}>
                      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {crypto.website_url && (
                  <Button asChild variant="outline" className="w-full">
                    <a href={crypto.website_url} target="_blank" rel="noopener noreferrer">
                      Learn More
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Right Side - How to Buy */}
              <div className="p-8 md:p-12 bg-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    How to Contribute
                  </h3>
                </div>

                {crypto.how_to_buy ? (
                  <div className="prose prose-sm text-muted-foreground">
                    {crypto.how_to_buy.split('\n').map((line, i) => (
                      <p key={i} className="mb-3">{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
                      <p className="text-muted-foreground">Create a Solana wallet (Phantom, Solflare)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
                      <p className="text-muted-foreground">Purchase SOL from an exchange</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</span>
                      <p className="text-muted-foreground">Swap SOL for ${crypto.coin_symbol} on Raydium or Jupiter</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">4</span>
                      <p className="text-muted-foreground">Hold and support humanitarian impact!</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    100% Non-Profit · Transparent · Community-Driven
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
