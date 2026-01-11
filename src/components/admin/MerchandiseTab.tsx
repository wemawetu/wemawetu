import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Edit, Loader2, Save, Package, 
  Eye, EyeOff, Sparkles, DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  sort_order: number | null;
}

const categories = ["apparel", "accessories", "jewelry", "art", "books", "general"];

export function MerchandiseTab() {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Merchandise | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMerchandise();
  }, []);

  async function loadMerchandise() {
    const { data } = await supabase
      .from("merchandise")
      .select("*")
      .order("sort_order");
    
    if (data) setMerchandise(data as Merchandise[]);
    setLoading(false);
  }

  async function saveMerchandise() {
    if (!editing) return;
    setSaving(true);

    if (editing.id) {
      await supabase.from("merchandise").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("merchandise").insert([{
        name: editing.name,
        description: editing.description,
        price: editing.price,
        image_url: editing.image_url,
        impact_message: editing.impact_message,
        category: editing.category,
        stock: editing.stock,
        active: editing.active,
        sort_order: editing.sort_order || 0
      }]);
    }

    setSaving(false);
    setEditing(null);
    toast({ title: "Saved" });
    loadMerchandise();
  }

  async function deleteMerchandise(id: string) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("merchandise").delete().eq("id", id);
    toast({ title: "Deleted" });
    loadMerchandise();
  }

  async function toggleActive(item: Merchandise) {
    await supabase.from("merchandise").update({ active: !item.active }).eq("id", item.id);
    loadMerchandise();
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
          <h1 className="font-display text-3xl font-bold text-foreground">Merchandise</h1>
          <p className="text-muted-foreground">Manage products for the "Shop for Good" section</p>
        </div>
        <Button onClick={() => setEditing({
          id: "",
          name: "",
          description: "",
          price: 0,
          image_url: null,
          impact_message: "",
          category: "general",
          stock: 0,
          active: true,
          sort_order: 0
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="bg-card p-6 rounded-xl border border-border space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editing.id ? "Edit" : "New"} Product
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g., Wemawetu T-Shirt"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Describe your product..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background h-24"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
              <input
                type="number"
                min="0"
                value={editing.stock}
                onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
              <input
                type="number"
                value={editing.sort_order || 0}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
            <input
              type="url"
              value={editing.image_url || ""}
              onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Impact Message (shown to buyers)
            </label>
            <input
              type="text"
              value={editing.impact_message || ""}
              onChange={(e) => setEditing({ ...editing, impact_message: e.target.value })}
              placeholder="e.g., This purchase provides school supplies for 1 child"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tell buyers how their purchase makes a difference
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editing.active}
              onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
            />
            <span className="text-sm text-foreground">Active (visible in store)</span>
          </label>

          <div className="flex gap-3">
            <Button onClick={saveMerchandise} disabled={saving || !editing.name || editing.price <= 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Product
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchandise.map((item) => (
          <div 
            key={item.id} 
            className={`bg-card rounded-xl border ${item.active ? "border-border" : "border-dashed border-muted-foreground/30"} overflow-hidden`}
          >
            <div className="aspect-video bg-muted relative">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-xs px-2 py-1 rounded-full ${item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {item.active ? "Active" : "Hidden"}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
              </div>
              
              {item.impact_message && (
                <div className="bg-primary/10 rounded-lg p-2 mb-3">
                  <p className="text-xs text-primary flex items-start gap-1">
                    <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
                    {item.impact_message}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>Stock: {item.stock}</span>
                <span>Order: {item.sort_order}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => toggleActive(item)}>
                  {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMerchandise(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {merchandise.length === 0 && !editing && (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-4">Add merchandise to start your "Shop for Good" store</p>
          <Button onClick={() => setEditing({
            id: "",
            name: "",
            description: "",
            price: 0,
            image_url: null,
            impact_message: "",
            category: "general",
            stock: 0,
            active: true,
            sort_order: 0
          })}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Product
          </Button>
        </div>
      )}
    </div>
  );
}