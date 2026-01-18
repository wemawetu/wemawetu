import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, Search, Loader2, MapPin, Truck, 
  CheckCircle, Clock, XCircle, Mail, Phone
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  items: any[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
  confirmed: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
  processing: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
  shipped: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
  delivered: "text-green-500 bg-green-50 dark:bg-green-950/20",
  cancelled: "text-red-500 bg-red-50 dark:bg-red-950/20",
};

export default function OrderTracking() {
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [searchValue, setSearchValue] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setLoading(true);
    setSearched(true);

    const query = searchType === "email"
      ? supabase.from("orders").select("*").ilike("customer_email", searchValue.trim())
      : supabase.from("orders").select("*").ilike("customer_phone", `%${searchValue.trim()}%`);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (data && !error) {
      setOrders(data as Order[]);
    } else {
      setOrders([]);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Track Your <span className="text-primary">Order</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your email or phone number to view your order status
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              {/* Search Type Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setSearchType("email")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    searchType === "email"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType("phone")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    searchType === "phone"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-3">
                <input
                  type={searchType === "email" ? "email" : "tel"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === "email" ? "Enter your email address" : "Enter your phone number"}
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any orders with that {searchType}. Please check and try again.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Found {orders.length} order{orders.length !== 1 ? "s" : ""}
                  </h2>

                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.order_status] || Clock;
                    const statusColor = statusColors[order.order_status] || statusColors.pending;

                    return (
                      <div key={order.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                        {/* Order Header */}
                        <div className="p-6 border-b border-border">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Order Number</p>
                              <p className="font-mono font-bold text-foreground">{order.order_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Order Date</p>
                              <p className="font-medium text-foreground">
                                {format(new Date(order.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="p-6 border-b border-border">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${statusColor}`}>
                              <StatusIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground capitalize">{order.order_status}</p>
                              <p className="text-sm text-muted-foreground">
                                Payment: <span className="capitalize">{order.payment_status}</span>
                              </p>
                            </div>
                            {order.tracking_number && (
                              <div className="ml-auto text-right">
                                <p className="text-sm text-muted-foreground">Tracking Number</p>
                                <p className="font-mono font-medium text-primary">{order.tracking_number}</p>
                              </div>
                            )}
                          </div>

                          {order.notes && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Items */}
                        <div className="p-6 border-b border-border">
                          <h4 className="font-semibold text-foreground mb-4">Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping & Total */}
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                          {/* Shipping Address */}
                          {order.shipping_address && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Shipping Address
                              </h4>
                              <p className="text-muted-foreground">
                                {order.customer_first_name} {order.customer_last_name}<br />
                                {order.shipping_address}<br />
                                {order.shipping_city}{order.shipping_country ? `, ${order.shipping_country}` : ""}
                              </p>
                            </div>
                          )}

                          {/* Total */}
                          <div className="md:text-right">
                            <div className="space-y-1">
                              <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-foreground">${order.shipping_fee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between md:justify-end gap-8 pt-2 border-t border-border">
                                <span className="font-semibold text-foreground">Total</span>
                                <span className="font-bold text-foreground">${order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
