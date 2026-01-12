import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, Droplets, Home, BookOpen, TreePine, 
  CheckCircle, Shield, Gift, CreditCard, Smartphone,
  ShoppingBag, Sparkles, Package, Loader2, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentConfig {
  id: string;
  provider: string;
  enabled: boolean;
  config: Record<string, any>;
  display_name: string;
  description: string | null;
  icon: string;
  sort_order: number | null;
}

interface Merchandise {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  impact_message: string | null;
  category: string;
  stock: number;
  active: boolean;
}

const donationAmounts = [25, 50, 100, 250, 500, 1000];

const impactCards = [
  { amount: 25, icon: Droplets, impact: "Provides clean water for 1 family for a month" },
  { amount: 50, icon: BookOpen, impact: "Sponsors a child's school supplies for a term" },
  { amount: 100, icon: TreePine, impact: "Plants 50 trees in degraded areas" },
  { amount: 250, icon: Home, impact: "Contributes to building materials for 1 family" },
  { amount: 500, icon: Droplets, impact: "Funds a water filtration unit for a school" },
  { amount: 1000, icon: Heart, impact: "Sponsors a complete community water project" }
];

const trustIndicators = [
  "100% of donations go to programs",
  "Registered NGO in Kenya",
  "Annual independent audits",
  "Transparent impact reporting"
];

const iconMap: Record<string, any> = {
  CreditCard,
  Smartphone,
  Heart,
  Gift
};

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([]);
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"donate" | "shop">("donate");
  const [cart, setCart] = useState<{item: Merchandise, quantity: number}[]>([]);
  const { toast } = useToast();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const displayAmount = selectedAmount === "custom" 
    ? (parseFloat(customAmount) || 0) 
    : selectedAmount;

  const currentImpact = impactCards.find(card => card.amount <= displayAmount);
  const cartTotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [paymentsRes, merchandiseRes] = await Promise.all([
      supabase.from("payment_config").select("*").eq("enabled", true).order("sort_order"),
      supabase.from("merchandise").select("*").eq("active", true).order("sort_order")
    ]);

    if (paymentsRes.data) {
      setPaymentMethods(paymentsRes.data as PaymentConfig[]);
      if (paymentsRes.data.length > 0) {
        setSelectedPaymentMethod(paymentsRes.data[0].provider);
      }
    }
    if (merchandiseRes.data) setMerchandise(merchandiseRes.data as Merchandise[]);
    setLoading(false);
  }

  function addToCart(item: Merchandise) {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? {...c, quantity: c.quantity + 1} : c);
      }
      return [...prev, {item, quantity: 1}];
    });
    toast({ title: "Added to cart", description: item.name });
  }

  function removeFromCart(itemId: string) {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  }

  async function handleDonation() {
    if (!selectedPaymentMethod) {
      toast({ title: "Select payment method", variant: "destructive" });
      return;
    }
    if (displayAmount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }

    setProcessing(true);

    const method = paymentMethods.find(p => p.provider === selectedPaymentMethod);
    
    try {
      if (selectedPaymentMethod === "paypal") {
        const paypalEmail = method?.config?.email;
        if (paypalEmail) {
          window.open(`https://www.paypal.com/paypalme/${paypalEmail}/${displayAmount}`, "_blank");
        } else {
          toast({ title: "PayPal not configured", variant: "destructive" });
        }
      } else if (selectedPaymentMethod === "mpesa_till" || selectedPaymentMethod === "mpesa_paybill") {
        if (!mpesaPhone) {
          toast({ title: "Enter M-Pesa phone number", variant: "destructive" });
          setProcessing(false);
          return;
        }
        
        // Call M-Pesa STK Push edge function
        const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
          body: {
            phone: mpesaPhone,
            amount: displayAmount,
            paymentType: selectedPaymentMethod === "mpesa_till" ? "till" : "paybill",
            reference: "DONATION"
          }
        });

        if (error) {
          toast({ title: "M-Pesa Error", description: error.message, variant: "destructive" });
        } else if (data?.success) {
          toast({ 
            title: "Check Your Phone!", 
            description: "Enter your M-Pesa PIN to complete the donation."
          });
        } else {
          toast({ title: "M-Pesa Error", description: data?.error || "Failed to initiate payment", variant: "destructive" });
        }
      } else if (selectedPaymentMethod === "donorbox") {
        const embedUrl = method?.config?.embed_url;
        if (embedUrl) {
          window.open(embedUrl, "_blank");
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    setProcessing(false);
  }

  const selectedMethodConfig = paymentMethods.find(p => p.provider === selectedPaymentMethod);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-accent/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
              Make a Difference
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Generosity <span className="text-accent">Changes Lives</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Every donation directly supports our programs providing clean water, 
              safe shelter, education, and environmental protection to communities in need.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab("donate")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "donate" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Heart className="h-5 w-5" />
              Donate
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "shop" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Shop for Good
              {cart.length > 0 && (
                <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      {activeTab === "donate" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Donation Form */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-2xl border border-border p-8 shadow-soft">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Choose Your Donation
                  </h2>

                  {/* Frequency Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg mb-8">
                    <button
                      onClick={() => setIsMonthly(false)}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                        !isMonthly 
                          ? "bg-card shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => setIsMonthly(true)}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        isMonthly 
                          ? "bg-card shadow-sm text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Gift className="h-4 w-4" />
                      Monthly
                    </button>
                  </div>

                  {/* Amount Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {donationAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-4 px-6 rounded-xl text-lg font-semibold transition-all ${
                          selectedAmount === amount
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Or enter a custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount("custom");
                        }}
                        onFocus={() => setSelectedAmount("custom")}
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Enter amount"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Impact Display */}
                  {currentImpact && displayAmount > 0 && (
                    <div className="bg-primary/10 rounded-xl p-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-xl">
                          <currentImpact.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your ${displayAmount} donation:</p>
                          <p className="font-medium text-foreground">{currentImpact.impact}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  {paymentMethods.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-foreground mb-4">Payment Method</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {paymentMethods.map((method) => {
                          const IconComponent = iconMap[method.icon] || CreditCard;
                          return (
                            <button
                              key={method.id}
                              onClick={() => setSelectedPaymentMethod(method.provider)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                selectedPaymentMethod === method.provider
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-6 w-6 text-primary" />
                                <div>
                                  <p className="font-medium text-foreground">{method.display_name}</p>
                                  <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* M-Pesa Phone Input */}
                  {(selectedPaymentMethod === "mpesa_till" || selectedPaymentMethod === "mpesa_paybill") && (
                    <div className="mb-8 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        M-Pesa Payment Details
                      </h4>
                      {selectedPaymentMethod === "mpesa_till" ? (
                        <div className="mb-3 p-3 bg-background rounded-lg">
                          <p className="text-sm text-muted-foreground">Till Number:</p>
                          <p className="font-mono font-bold text-foreground">{selectedMethodConfig?.config?.till_number || "Not configured"}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-sm text-muted-foreground">Paybill:</p>
                            <p className="font-mono font-bold text-foreground">{selectedMethodConfig?.config?.paybill_number || "Not configured"}</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-sm text-muted-foreground">Account:</p>
                            <p className="font-mono font-bold text-foreground">{selectedMethodConfig?.config?.account_reference || "DONATION"}</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="Phone Number (e.g., 254712345678)"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Enter your M-Pesa registered phone number</p>
                    </div>
                  )}

                  {/* Donorbox Embed Info */}
                  {selectedPaymentMethod === "donorbox" && selectedMethodConfig?.config?.embed_url && (
                    <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3 mb-3">
                        <Heart className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-foreground">Donorbox Secure Donation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        You'll be redirected to our secure Donorbox donation page for payment processing.
                      </p>
                      <a 
                        href={selectedMethodConfig.config.embed_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline text-sm flex items-center gap-1"
                      >
                        Preview donation page <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Donor Info */}
                  <div className="space-y-4 mb-8">
                    <h3 className="font-semibold text-foreground">Your Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleDonation}
                    disabled={processing || paymentMethods.length === 0}
                  >
                    {processing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    Donate ${displayAmount} {isMonthly ? "Monthly" : ""}
                  </Button>

                  {paymentMethods.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Payment methods are being configured. Please check back soon.
                    </p>
                  )}

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Your donation may be tax-deductible. You will receive a receipt.
                  </p>
                </div>
              </div>

              {/* Trust & Impact Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trust Indicators */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Your Trust Matters
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {trustIndicators.map((indicator, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-muted-foreground">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Guide */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">
                    What Your Donation Can Do
                  </h3>
                  <div className="space-y-4">
                    {impactCards.slice(0, 4).map((card, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <card.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">${card.amount}</p>
                          <p className="text-xs text-muted-foreground">{card.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Ways to Give */}
                <div className="bg-muted/50 rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">
                    Other Ways to Give
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Buy our merchandise - all profits support programs</li>
                    <li>• Contribute via our Solana token</li>
                    <li>• Corporate partnerships</li>
                    <li>• Legacy giving</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    <a href="/contact" className="text-primary hover:underline">
                      Contact us for details →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Shop Section */}
      {activeTab === "shop" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Shop for Good
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every purchase directly supports our mission. See the impact of each item below.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Products Grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : merchandise.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchandise.map((item) => (
                      <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all">
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          {item.stock < 10 && item.stock > 0 && (
                            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                              Only {item.stock} left
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                          
                          {item.impact_message && (
                            <div className="bg-primary/10 rounded-lg p-3 mb-4">
                              <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-primary font-medium">{item.impact_message}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-foreground">${item.price.toFixed(2)}</span>
                            <Button 
                              size="sm" 
                              onClick={() => addToCart(item)}
                              disabled={item.stock === 0}
                            >
                              {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/50 rounded-2xl">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">Our merchandise store is being set up. Check back soon!</p>
                  </div>
                )}
              </div>

              {/* Cart Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Your Cart
                  </h3>
                  
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cart.map((cartItem) => (
                          <div key={cartItem.item.id} className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">{cartItem.item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {cartItem.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground text-sm">
                                ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                              </p>
                              <button 
                                onClick={() => removeFromCart(cartItem.item.id)}
                                className="text-xs text-destructive hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-border pt-4 mb-4">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>Total</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button className="w-full" disabled={paymentMethods.length === 0}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Checkout
                      </Button>
                    </>
                  )}

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Heart className="h-4 w-4 text-primary shrink-0" />
                      <p>100% of profits go directly to our programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tax Info */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Tax-Deductible Donations
            </h2>
            <p className="text-muted-foreground">
              Wemawetu Foundation is a registered nonprofit organization. 
              Your donation may be tax-deductible depending on your country's tax laws. 
              You will receive a receipt for your records.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
