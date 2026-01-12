import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit, Eye, EyeOff, Loader2, Save, Mail, Phone, MapPin, Globe, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string | null;
  sort_order: number | null;
  active: boolean;
}

interface ContactInfoTabProps {
  contactInfo: ContactInfo[];
  onDataChange: () => void;
}

const iconOptions = [
  { value: "Mail", label: "Email", icon: Mail },
  { value: "Phone", label: "Phone", icon: Phone },
  { value: "MapPin", label: "Address", icon: MapPin },
  { value: "Globe", label: "Website", icon: Globe },
  { value: "Clock", label: "Hours", icon: Clock },
];

const typeOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "website", label: "Website" },
  { value: "hours", label: "Working Hours" },
  { value: "social", label: "Social Media" },
];

export function ContactInfoTab({ contactInfo, onDataChange }: ContactInfoTabProps) {
  const [editing, setEditing] = useState<ContactInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function saveContact(contact: Partial<ContactInfo>) {
    setSaving(true);
    try {
      if (contact.id) {
        const { error } = await supabase.from("contact_info").update(contact).eq("id", contact.id);
        if (error) throw error;
        toast({ title: "Success", description: "Contact info updated" });
      } else {
        const { error } = await supabase.from("contact_info").insert([{
          type: contact.type!,
          label: contact.label!,
          value: contact.value!,
          icon: contact.icon,
          active: contact.active ?? true,
          sort_order: contact.sort_order || 0
        }]);
        if (error) throw error;
        toast({ title: "Success", description: "Contact info added" });
      }
      setEditing(null);
      onDataChange();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  }

  async function deleteContact(id: string) {
    if (!confirm("Delete this contact info?")) return;
    const { error } = await supabase.from("contact_info").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      onDataChange();
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("contact_info").update({ active: !active }).eq("id", id);
    onDataChange();
  }

  const getIconComponent = (iconName: string | null) => {
    const found = iconOptions.find(i => i.value === iconName);
    return found?.icon || Mail;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Contact Information</h1>
        <Button onClick={() => setEditing({ 
          id: "", 
          type: "email", 
          label: "", 
          value: "", 
          icon: "Mail", 
          sort_order: 0, 
          active: true 
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {editing && (
        <div className="bg-card p-6 rounded-xl border border-border space-y-4">
          <h2 className="font-semibold text-foreground">{editing.id ? "Edit" : "Add"} Contact Info</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <select
                value={editing.icon || "Mail"}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Label</label>
            <input
              type="text"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g., Email, Phone, Office Address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input
              type="text"
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              placeholder="e.g., info@example.org, +254 700 000 000"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sort Order</label>
              <input
                type="number"
                value={editing.sort_order || 0}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="contact-active"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="contact-active" className="text-sm">Active (visible on site)</label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => saveContact(editing)} disabled={saving || !editing.label || !editing.value}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Icon</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Label</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Value</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contactInfo.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No contact information added yet
                </td>
              </tr>
            ) : (
              contactInfo.map((info) => {
                const IconComp = getIconComponent(info.icon);
                return (
                  <tr key={info.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="p-2 bg-primary/10 rounded-lg w-fit">
                        <IconComp className="h-4 w-4 text-primary" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{info.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{info.value}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{info.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${info.active ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {info.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => toggleActive(info.id, info.active)}>
                          {info.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(info)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteContact(info.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
