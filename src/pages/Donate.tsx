import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Heart, Droplets, Home, BookOpen, TreePine, 
  CheckCircle, Shield, Gift, CreditCard 
} from "lucide-react";

const donationAmounts = [25, 50, 100, 250, 500, 1000];

const impactCards = [
  {
    amount: 25,
    icon: Droplets,
    impact: "Provides clean water for 1 family for a month"
  },
  {
    amount: 50,
    icon: BookOpen,
    impact: "Sponsors a child's school supplies for a term"
  },
  {
    amount: 100,
    icon: TreePine,
    impact: "Plants 50 trees in degraded areas"
  },
  {
    amount: 250,
    icon: Home,
    impact: "Contributes to building materials for 1 family"
  },
  {
    amount: 500,
    icon: Droplets,
    impact: "Funds a water filtration unit for a school"
  },
  {
    amount: 1000,
    icon: Heart,
    impact: "Sponsors a complete community water project"
  }
];

const trustIndicators = [
  "100% of donations go to programs",
  "Registered NGO in Kenya",
  "Annual independent audits",
  "Transparent impact reporting"
];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);

  const displayAmount = selectedAmount === "custom" 
    ? (parseFloat(customAmount) || 0) 
    : selectedAmount;

  const currentImpact = impactCards.find(card => card.amount <= displayAmount);

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

      {/* Donation Form Section */}
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

                {/* Donor Info */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-foreground">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Submit Button */}
                <Button size="lg" className="w-full">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Donate ${displayAmount} {isMonthly ? "Monthly" : ""}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Secure payment powered by Stripe. Your donation may be tax-deductible.
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
                  <li>• Bank transfer / wire</li>
                  <li>• M-Pesa (Kenya)</li>
                  <li>• Stock donations</li>
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
