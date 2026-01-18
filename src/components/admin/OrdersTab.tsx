import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Package, Loader2, Eye, Truck, CheckCircle, 
  Clock, XCircle, Search, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "completed", "failed", "refunded"];

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) setOrders(data as Order[]);
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, field: "order_status" | "payment_status", value: string) {
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ [field]: value })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Order ${field.replace("_", " ")} updated` });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, [field]: value });
      }
    }
    setUpdating(false);
  }

  async function updateTrackingNumber(orderId: string, trackingNumber: string) {
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ tracking_number: trackingNumber })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: "Tracking number updated" });
      loadOrders();
    }
    setUpdating(false);
  }

  async function updateNotes(orderId: string, notes: string) {
    const { error } = await supabase
      .from("orders")
      .update({ notes })
      .eq("id", orderId);

    if (!error) {
      toast({ title: "Notes saved" });
      loadOrders();
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.order_status === filterStatus;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage merchandise orders and track shipments</p>
        </div>
        <Button variant="outline" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {orderStatuses.slice(0, 5).map((status) => {
          const count = orders.filter((o) => o.order_status === status).length;
          const Icon = statusIcons[status] || Package;
          return (
            <div key={status} className="bg-card p-4 rounded-xl border border-border">
              <Icon className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground capitalize">{status}</p>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm font-medium text-foreground">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "h:mm a")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">${order.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[order.payment_status] || statusColors.pending}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[order.order_status] || statusColors.pending}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Order Details</h2>
                <p className="text-sm text-muted-foreground font-mono">{selectedOrder.order_number}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>✕</Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Customer</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}<br />
                    {selectedOrder.customer_email}<br />
                    {selectedOrder.customer_phone}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Shipping</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping_address || "No address"}<br />
                    {selectedOrder.shipping_city}{selectedOrder.shipping_country ? `, ${selectedOrder.shipping_country}` : ""}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">${selectedOrder.shipping_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order Status</label>
                  <Select 
                    value={selectedOrder.order_status} 
                    onValueChange={(v) => updateOrderStatus(selectedOrder.id, "order_status", v)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Payment Status</label>
                  <Select 
                    value={selectedOrder.payment_status} 
                    onValueChange={(v) => updateOrderStatus(selectedOrder.id, "payment_status", v)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tracking Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedOrder.tracking_number || ""}
                    placeholder="Enter tracking number"
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
                    onBlur={(e) => {
                      if (e.target.value !== (selectedOrder.tracking_number || "")) {
                        updateTrackingNumber(selectedOrder.id, e.target.value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea
                  defaultValue={selectedOrder.notes || ""}
                  placeholder="Add notes for the customer..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background h-24"
                  onBlur={(e) => {
                    if (e.target.value !== (selectedOrder.notes || "")) {
                      updateNotes(selectedOrder.id, e.target.value);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
