import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Smartphone, Heart, Edit, Save, Loader2,
  ToggleLeft, ToggleRight, AlertCircle, CheckCircle
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

const iconMap: Record<string, any> = {
  CreditCard,
  Smartphone,
  Heart
};

export function PaymentConfigTab() {
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    const { data } = await supabase
      .from("payment_config")
      .select("*")
      .order("sort_order");
    
    if (data) setPaymentConfigs(data as PaymentConfig[]);
    setLoading(false);
  }

  async function toggleEnabled(config: PaymentConfig) {
    await supabase
      .from("payment_config")
      .update({ enabled: !config.enabled })
      .eq("id", config.id);
    
    toast({ 
      title: config.enabled ? "Disabled" : "Enabled",
      description: `${config.display_name} has been ${config.enabled ? "disabled" : "enabled"}`
    });
    loadConfigs();
  }

  async function saveConfig() {
    if (!editingConfig) return;
    setSaving(true);
    
    await supabase
      .from("payment_config")
      .update({
        display_name: editingConfig.display_name,
        description: editingConfig.description,
        config: editingConfig.config
      })
      .eq("id", editingConfig.id);
    
    setSaving(false);
    setEditingId(null);
    setEditingConfig(null);
    toast({ title: "Saved", description: "Payment configuration updated" });
    loadConfigs();
  }

  function updateConfigField(field: string, value: any) {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      config: {
        ...editingConfig.config,
        [field]: value
      }
    });
  }

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
          <h1 className="font-display text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground">Configure PayPal, M-Pesa, and Donorbox for donations</p>
        </div>
      </div>

      <div className="grid gap-6">
        {paymentConfigs.map((config) => {
          const IconComponent = iconMap[config.icon] || CreditCard;
          const isEditing = editingId === config.id;

          return (
            <div 
              key={config.id} 
              className={`bg-card rounded-xl border ${config.enabled ? "border-primary/50" : "border-border"} p-6`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.enabled ? "bg-primary" : "bg-muted"}`}>
                    <IconComponent className={`h-6 w-6 ${config.enabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      {config.display_name}
                      {config.enabled && <CheckCircle className="h-5 w-5 text-primary" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleEnabled(config)}
                    className="flex items-center gap-2"
                  >
                    {config.enabled ? (
                      <ToggleRight className="h-8 w-8 text-primary" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      if (isEditing) {
                        setEditingId(null);
                        setEditingConfig(null);
                      } else {
                        setEditingId(config.id);
                        setEditingConfig(config);
                      }
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isEditing && editingConfig && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                      <input
                        type="text"
                        value={editingConfig.display_name}
                        onChange={(e) => setEditingConfig({ ...editingConfig, display_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <input
                        type="text"
                        value={editingConfig.description || ""}
                        onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                      />
                    </div>
                  </div>

                  {/* PayPal Config */}
                  {config.provider === "paypal" && (
                    <div className="space-y-4 bg-muted/50 p-4 rounded-xl">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        PayPal Configuration
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">PayPal Email / PayPal.me Username</label>
                          <input
                            type="text"
                            value={editingConfig.config.email || ""}
                            onChange={(e) => updateConfigField("email", e.target.value)}
                            placeholder="your@email.com or username"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Client ID (Optional)</label>
                          <input
                            type="text"
                            value={editingConfig.config.client_id || ""}
                            onChange={(e) => updateConfigField("client_id", e.target.value)}
                            placeholder="For API integration"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingConfig.config.sandbox || false}
                          onChange={(e) => updateConfigField("sandbox", e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground">Sandbox Mode (Testing)</span>
                      </label>
                    </div>
                  )}

                  {/* M-Pesa Till Config */}
                  {config.provider === "mpesa_till" && (
                    <div className="space-y-4 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        M-Pesa Till (Buy Goods) Configuration
                      </h4>
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-green-700 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-green-700 dark:text-green-400">
                            <strong>Till Number:</strong> Used for Buy Goods transactions. The customer enters your Till Number on their phone.
                            No account number is required for Till payments.
                          </p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Till Number</label>
                          <input
                            type="text"
                            value={editingConfig.config.till_number || ""}
                            onChange={(e) => updateConfigField("till_number", e.target.value)}
                            placeholder="e.g., 123456"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Store Number (Optional)</label>
                          <input
                            type="text"
                            value={editingConfig.config.store_number || ""}
                            onChange={(e) => updateConfigField("store_number", e.target.value)}
                            placeholder="Head office number"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Consumer Key (Daraja API)</label>
                          <input
                            type="password"
                            value={editingConfig.config.consumer_key || ""}
                            onChange={(e) => updateConfigField("consumer_key", e.target.value)}
                            placeholder="From Safaricom Developer Portal"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Consumer Secret</label>
                          <input
                            type="password"
                            value={editingConfig.config.consumer_secret || ""}
                            onChange={(e) => updateConfigField("consumer_secret", e.target.value)}
                            placeholder="From Safaricom Developer Portal"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Passkey (for STK Push)</label>
                        <input
                          type="password"
                          value={editingConfig.config.passkey || ""}
                          onChange={(e) => updateConfigField("passkey", e.target.value)}
                          placeholder="Lipa Na M-Pesa Online Passkey"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingConfig.config.sandbox || false}
                          onChange={(e) => updateConfigField("sandbox", e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground">Sandbox Mode (Use sandbox.safaricom.co.ke)</span>
                      </label>
                    </div>
                  )}

                  {/* M-Pesa Paybill Config */}
                  {config.provider === "mpesa_paybill" && (
                    <div className="space-y-4 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        M-Pesa Paybill Configuration
                      </h4>
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-green-700 dark:text-green-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-green-700 dark:text-green-400">
                            <strong>Paybill:</strong> Requires both a Business Number and Account Number. The shortcode used for STK Push 
                            is the Paybill number. Token generation uses the same credentials but different transaction types.
                          </p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Paybill Number (Business Shortcode)</label>
                          <input
                            type="text"
                            value={editingConfig.config.paybill_number || ""}
                            onChange={(e) => updateConfigField("paybill_number", e.target.value)}
                            placeholder="e.g., 174379"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Account Reference</label>
                          <input
                            type="text"
                            value={editingConfig.config.account_reference || ""}
                            onChange={(e) => updateConfigField("account_reference", e.target.value)}
                            placeholder="e.g., DONATION or donor name"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Consumer Key (Daraja API)</label>
                          <input
                            type="password"
                            value={editingConfig.config.consumer_key || ""}
                            onChange={(e) => updateConfigField("consumer_key", e.target.value)}
                            placeholder="From Safaricom Developer Portal"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Consumer Secret</label>
                          <input
                            type="password"
                            value={editingConfig.config.consumer_secret || ""}
                            onChange={(e) => updateConfigField("consumer_secret", e.target.value)}
                            placeholder="From Safaricom Developer Portal"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Passkey (for STK Push)</label>
                        <input
                          type="password"
                          value={editingConfig.config.passkey || ""}
                          onChange={(e) => updateConfigField("passkey", e.target.value)}
                          placeholder="Lipa Na M-Pesa Online Passkey"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingConfig.config.sandbox || false}
                          onChange={(e) => updateConfigField("sandbox", e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground">Sandbox Mode (Use sandbox.safaricom.co.ke)</span>
                      </label>
                    </div>
                  )}

                  {/* Donorbox Config */}
                  {config.provider === "donorbox" && (
                    <div className="space-y-4 bg-purple-50 dark:bg-purple-950/20 p-4 rounded-xl">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4 text-purple-600" />
                        Donorbox Configuration
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Campaign/Form ID</label>
                        <input
                          type="text"
                          value={editingConfig.config.campaign_id || ""}
                          onChange={(e) => updateConfigField("campaign_id", e.target.value)}
                          placeholder="Your Donorbox campaign ID"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Embed/Donation Page URL</label>
                        <input
                          type="url"
                          value={editingConfig.config.embed_url || ""}
                          onChange={(e) => updateConfigField("embed_url", e.target.value)}
                          placeholder="https://donorbox.org/your-campaign"
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Get this from your Donorbox dashboard under "Share" options
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={saveConfig} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Configuration
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingId(null); setEditingConfig(null); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Status when not editing */}
              {!isEditing && (
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {config.provider === "paypal" && (
                      <span className={`text-xs px-3 py-1 rounded-full ${config.config.email ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {config.config.email ? `PayPal: ${config.config.email}` : "Email not set"}
                      </span>
                    )}
                    {config.provider === "mpesa_till" && (
                      <span className={`text-xs px-3 py-1 rounded-full ${config.config.till_number ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {config.config.till_number ? `Till: ${config.config.till_number}` : "Till not set"}
                      </span>
                    )}
                    {config.provider === "mpesa_paybill" && (
                      <>
                        <span className={`text-xs px-3 py-1 rounded-full ${config.config.paybill_number ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                          {config.config.paybill_number ? `Paybill: ${config.config.paybill_number}` : "Paybill not set"}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                          Account: {config.config.account_reference || "DONATION"}
                        </span>
                      </>
                    )}
                    {config.provider === "donorbox" && (
                      <span className={`text-xs px-3 py-1 rounded-full ${config.config.embed_url ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-muted text-muted-foreground"}`}>
                        {config.config.embed_url ? "Donorbox configured" : "URL not set"}
                      </span>
                    )}
                    {config.config.sandbox && (
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        Sandbox Mode
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}