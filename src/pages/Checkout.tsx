import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShoppingBag, Trash2, CreditCard, Smartphone, Heart, 
  Loader2, ArrowLeft, Globe, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Merchandise {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  impact_message: string | null;
}

interface PaymentConfig {
  id: string;
  provider: string;
  enabled: boolean;
  config: Record<string, any>;
  display_name: string;
  description: string | null;
  icon: string;
}

interface CartItem {
  item: Merchandise;
  quantity: number;
}

interface ExchangeRates {
  [key: string]: number;
}

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
];

const iconMap: Record<string, any> = {
  CreditCard,
  Smartphone,
  Heart,
};

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentConfig[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [ratesLoading, setRatesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const cartTotal = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

  useEffect(() => {
    loadCart();
    loadPaymentMethods();
    fetchExchangeRates();
  }, []);

  function loadCart() {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setLoading(false);
  }

  async function loadPaymentMethods() {
    const { data } = await supabase
      .from("payment_config")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");

    if (data) {
      setPaymentMethods(data as PaymentConfig[]);
      if (data.length > 0) {
        setSelectedPaymentMethod(data[0].provider);
      }
    }
  }

  async function fetchExchangeRates() {
    setRatesLoading(true);
    try {
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates) {
        setExchangeRates(data.rates);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates", error);
      // Fallback rates (approximate)
      setExchangeRates({
        USD: 1,
        KES: 153.5,
        EUR: 0.92,
        GBP: 0.79,
        CAD: 1.36,
        AUD: 1.53,
        NGN: 1550,
        ZAR: 18.5,
        TZS: 2520,
        UGX: 3750,
      });
      setLastUpdated(new Date());
    }
    setRatesLoading(false);
  }

  function convertPrice(usdPrice: number): number {
    const rate = exchangeRates[selectedCurrency] || 1;
    return usdPrice * rate;
  }

  function formatPrice(amount: number): string {
    const currency = currencies.find(c => c.code === selectedCurrency);
    const converted = convertPrice(amount);
    
    // Format based on currency
    if (selectedCurrency === "USD" || selectedCurrency === "EUR" || selectedCurrency === "GBP") {
      return `${currency?.symbol}${converted.toFixed(2)}`;
    }
    return `${currency?.symbol}${Math.round(converted).toLocaleString()}`;
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart(prev => {
      const updated = prev.map(c => {
        if (c.item.id === itemId) {
          const newQty = Math.max(1, c.quantity + delta);
          return { ...c, quantity: newQty };
        }
        return c;
      });
      sessionStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(itemId: string) {
    setCart(prev => {
      const updated = prev.filter(c => c.item.id !== itemId);
      sessionStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      toast({ title: "Your cart is empty", variant: "destructive" });
      return;
    }
    if (!selectedPaymentMethod) {
      toast({ title: "Select a payment method", variant: "destructive" });
      return;
    }
    if (!firstName || !lastName || !email) {
      toast({ title: "Please fill in your contact details", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const method = paymentMethods.find((p) => p.provider === selectedPaymentMethod);
    const reference = `MERCH-${Date.now()}`;

    // Convert to KES for M-Pesa (always charge in KES for M-Pesa)
    const kesRate = exchangeRates["KES"] || 153.5;
    const amountInKes = Math.round(cartTotal * kesRate);

    try {
      if (selectedPaymentMethod === "paypal") {
        const paypalEmail = method?.config?.email;
        if (paypalEmail) {
          window.open(`https://www.paypal.com/paypalme/${paypalEmail}/${cartTotal}`, "_blank");
          sessionStorage.removeItem('cart');
          setCart([]);
          toast({ title: "Redirecting to PayPal" });
        } else {
          toast({ title: "PayPal not configured", variant: "destructive" });
        }
      } else if (selectedPaymentMethod === "mpesa_till" || selectedPaymentMethod === "mpesa_paybill") {
        if (!mpesaPhone) {
          toast({ title: "Enter M-Pesa phone number", variant: "destructive" });
          setProcessing(false);
          return;
        }

        const mpesaReference =
          selectedPaymentMethod === "mpesa_paybill"
            ? String(method?.config?.account_reference || reference)
            : reference;

        const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
          body: {
            phone: mpesaPhone,
            amount: amountInKes,
            paymentType: selectedPaymentMethod === "mpesa_till" ? "till" : "paybill",
            reference: mpesaReference,
          },
        });

        if (error) {
          toast({ title: "M-Pesa Error", description: error.message, variant: "destructive" });
        } else if (data?.success) {
          toast({
            title: "Check Your Phone!",
            description: `Enter your M-Pesa PIN to pay KSh ${amountInKes.toLocaleString()}`,
          });
          sessionStorage.removeItem('cart');
          setCart([]);
        } else {
          toast({
            title: "M-Pesa Error",
            description: data?.error || "Failed to initiate payment",
            variant: "destructive",
          });
        }
      } else if (selectedPaymentMethod === "donorbox") {
        const embedUrl = method?.config?.embed_url;
        if (embedUrl) {
          window.open(embedUrl, "_blank");
          sessionStorage.removeItem('cart');
          setCart([]);
        } else {
          toast({ title: "Donorbox not configured", variant: "destructive" });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    setProcessing(false);
  }

  const selectedMethodConfig = paymentMethods.find(p => p.provider === selectedPaymentMethod);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/give')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Cart & Forms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Currency Selector */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Select Currency</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center gap-2">
                              <span className="font-mono">{currency.symbol}</span>
                              {currency.code} - {currency.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={fetchExchangeRates}
                      disabled={ratesLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Exchange rates updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Cart Items */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Your Cart ({cart.length} items)
                </h2>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/give')}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((cartItem) => (
                      <div key={cartItem.item.id} className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                          {cartItem.item.image_url ? (
                            <img 
                              src={cartItem.item.image_url} 
                              alt={cartItem.item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{cartItem.item.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{cartItem.item.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-border rounded-lg">
                              <button 
                                className="px-3 py-1 hover:bg-muted transition-colors"
                                onClick={() => updateQuantity(cartItem.item.id, -1)}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 font-medium">{cartItem.quantity}</span>
                              <button 
                                className="px-3 py-1 hover:bg-muted transition-colors"
                                onClick={() => updateQuantity(cartItem.item.id, 1)}
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(cartItem.item.id)}
                              className="text-destructive hover:underline text-sm flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {formatPrice(cartItem.item.price * cartItem.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(cartItem.item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {cart.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Contact Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 mt-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <input
                      type="text"
                      placeholder="Address (optional)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="City (optional)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Country (optional)"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 mt-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}

              {/* Payment Method */}
              {cart.length > 0 && paymentMethods.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Payment Method
                  </h2>
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

                  {/* M-Pesa Phone Input */}
                  {(selectedPaymentMethod === "mpesa_till" || selectedPaymentMethod === "mpesa_paybill") && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
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
                            <p className="font-mono font-bold text-foreground">{selectedMethodConfig?.config?.account_reference || "MERCH"}</p>
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
                      <p className="text-xs text-muted-foreground mt-2">
                        You'll be charged <strong>KSh {Math.round(cartTotal * (exchangeRates["KES"] || 153.5)).toLocaleString()}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {cart.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {cartItem.item.name} × {cartItem.quantity}
                      </span>
                      <span className="text-foreground font-medium">
                        {formatPrice(cartItem.item.price * cartItem.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">{formatPrice(cartTotal)}</span>
                  </div>
                  {selectedCurrency !== "USD" && (
                    <p className="text-xs text-muted-foreground">
                      ≈ ${cartTotal.toFixed(2)} USD
                    </p>
                  )}
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || processing || paymentMethods.length === 0}
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-5 w-5" />
                  )}
                  Complete Purchase
                </Button>

                {paymentMethods.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Payment methods are being configured.
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>100% of profits from merchandise sales go directly to supporting our community programs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
