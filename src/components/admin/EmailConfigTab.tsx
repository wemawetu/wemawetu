import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Server, Lock, Send, Eye, EyeOff, RefreshCw } from "lucide-react";

interface EmailConfig {
  id: string;
  enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

export const EmailConfigTab = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error: any) {
      console.error('Error loading email config:', error);
      toast.error('Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_config')
        .update({
          enabled: config.enabled,
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_user: config.smtp_user,
          smtp_password: config.smtp_password,
          from_email: config.from_email,
          from_name: config.from_name,
        })
        .eq('id', config.id);

      if (error) throw error;
      toast.success('Email configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving email config:', error);
      toast.error('Failed to save email configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-order-notification', {
        body: {
          orderId: 'test',
          customerEmail: testEmail,
          customerName: 'Test User',
          orderNumber: 'TEST-001',
          newStatus: 'Test Email',
          trackingNumber: null,
          isTest: true
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success('Test email sent successfully! Check your inbox.');
      } else {
        toast.error(data?.error || 'Failed to send test email');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No email configuration found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure SMTP settings for order status notifications</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="email-enabled" className="text-sm font-medium">
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id="email-enabled"
                checked={config.enabled}
                onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SMTP Server Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Server className="h-4 w-4" />
              SMTP Server Settings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  value={config.smtp_host || ''}
                  onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                  value={config.smtp_port || 587}
                  onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) || 587 })}
                />
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lock className="h-4 w-4" />
              Authentication
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  placeholder="your-email@gmail.com"
                  value={config.smtp_user || ''}
                  onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password / App Password</Label>
                <div className="relative">
                  <Input
                    id="smtp-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={config.smtp_password || ''}
                    onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  For Gmail, use an App Password. Go to Google Account → Security → 2-Step Verification → App passwords
                </p>
              </div>
            </div>
          </div>

          {/* Sender Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Send className="h-4 w-4" />
              Sender Settings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  placeholder="Wemawetu Foundation"
                  value={config.from_name || ''}
                  onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="orders@wemawetu.org"
                  value={config.from_email || ''}
                  onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Email</CardTitle>
          <CardDescription>Send a test email to verify your SMTP configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter test email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={handleTestEmail} 
              disabled={testing || !config.enabled}
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          {!config.enabled && (
            <p className="text-sm text-muted-foreground mt-2">
              Enable email notifications above to send test emails
            </p>
          )}
        </CardContent>
      </Card>

      {/* Common SMTP Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common SMTP Providers</CardTitle>
          <CardDescription>Quick reference for popular email providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Gmail</p>
              <p className="text-muted-foreground">smtp.gmail.com : 587</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Outlook/Hotmail</p>
              <p className="text-muted-foreground">smtp-mail.outlook.com : 587</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Yahoo</p>
              <p className="text-muted-foreground">smtp.mail.yahoo.com : 587</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
