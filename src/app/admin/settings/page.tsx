
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themes, fonts, type Theme } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import { Paintbrush, CheckCircle, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type Settings = {
  enableRegistrations: boolean;
  sessionTimeoutEnabled: boolean;
  sessionTimeout: number;
  itemsPerPage: string;
  activeThemeName: string;
  activeFont: string;
  navbarThemeName: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!firestore) return;
      setLoading(true);
      const settingsRef = doc(firestore, 'settings', 'global');
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Settings;
        setSettings(data);
        applyTheme(themes.find(t => t.name === data.activeThemeName) || themes[0], false);
        applyNavbarTheme(themes.find(t => t.name === data.navbarThemeName) || themes[0], false);
        applyFont(data.activeFont, false);
      } else {
        // Set default settings if none exist
        const defaultSettings: Settings = {
          enableRegistrations: true,
          sessionTimeoutEnabled: false,
          sessionTimeout: 30,
          itemsPerPage: '25',
          activeThemeName: 'Default Teal',
          activeFont: 'var(--font-montserrat)',
          navbarThemeName: 'Default Teal'
        };
        setSettings(defaultSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [firestore]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const applyTheme = (theme: Theme, showToast = true) => {
    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    handleSettingChange('activeThemeName', theme.name);
    if (showToast) {
      toast({
        title: 'Theme Applied!',
        description: `The "${theme.name}" theme has been set as the default.`,
      });
    }
  };

  const applyNavbarTheme = (theme: Theme, showToast = true) => {
    const root = document.documentElement;
    root.style.setProperty('--navbar-primary', theme.cssVariables['--primary']);
    root.style.setProperty('--navbar-secondary', theme.cssVariables['--secondary']);
    handleSettingChange('navbarThemeName', theme.name);
     if (showToast) {
      toast({
        title: 'Navbar Theme Applied!',
        description: `The navbar now uses the "${theme.name}" theme.`,
      });
    }
  }

  const applyFont = (fontValue: string, showToast = true) => {
     const root = document.documentElement;
     root.style.setProperty('--font-body', fontValue);
     root.style.setProperty('--font-ui', fontValue);
     handleSettingChange('activeFont', fontValue);
     if (showToast) {
        toast({
            title: 'Font Applied!',
            description: `The admin panel font has been updated.`,
        });
     }
  }

  const handleSaveSettings = async () => {
    if (!firestore || !settings) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot save settings.' });
        return;
    }
    setSaving(true);
    try {
        const settingsRef = doc(firestore, 'settings', 'global');
        await setDoc(settingsRef, settings, { merge: true });
        toast({ title: 'Settings Saved', description: 'Your settings have been successfully saved.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    } finally {
        setSaving(false);
    }
  }
  
  if (loading) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      )
  }
  
  if (!settings) {
      return <div>Could not load settings.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="theme">Theme &amp; Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Application Settings</CardTitle>
              <CardDescription>Manage general settings for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="enable-registrations" className="font-semibold">Enable Registrations</Label>
                  <p className="text-sm text-muted-foreground">Control whether new users can create accounts.</p>
                </div>
                <Switch 
                    id="enable-registrations" 
                    checked={settings.enableRegistrations}
                    onCheckedChange={(checked) => handleSettingChange('enableRegistrations', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="session-timeout-enabled" className="font-semibold">Enable Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out admins after a period of inactivity.</p>
                </div>
                <Switch 
                    id="session-timeout-enabled" 
                    checked={settings.sessionTimeoutEnabled}
                    onCheckedChange={(checked) => handleSettingChange('sessionTimeoutEnabled', checked)}
                />
              </div>
              
              {settings.sessionTimeoutEnabled && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                    <Label htmlFor="session-timeout" className="font-semibold">Session Timeout (minutes)</Label>
                    <p className="text-sm text-muted-foreground">Set the duration of inactivity before a user is logged out.</p>
                    </div>
                    <Input 
                        id="session-timeout" 
                        type="number" 
                        value={settings.sessionTimeout || ''}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            handleSettingChange('sessionTimeout', isNaN(value) ? 0 : value);
                        }}
                        className="w-24" 
                    />
                </div>
              )}

               <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="items-per-page" className="font-semibold">Default Items Per Page</Label>
                  <p className="text-sm text-muted-foreground">Set the default number of items to show in data tables.</p>
                </div>
                <Select
                    value={settings.itemsPerPage}
                    onValueChange={(value) => handleSettingChange('itemsPerPage', value)}
                >
                    <SelectTrigger className="w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Admin Panel Theme</CardTitle>
                <CardDescription>Customize the primary look and feel of the admin dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {themes.map((theme) => (
                    <Card key={theme.name} className={cn("flex flex-col cursor-pointer", settings.activeThemeName === theme.name && "ring-2 ring-primary")}>
                        <CardHeader onClick={() => applyTheme(theme)}>
                        <CardTitle className="flex items-center gap-2">
                           {settings.activeThemeName === theme.name ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Paintbrush className="h-5 w-5" />}
                           {theme.name}
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4" onClick={() => applyTheme(theme)}>
                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Color Palette</p>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full border" style={{ background: `hsl(${theme.cssVariables['--primary']})` }}></div>
                                <div className="w-8 h-8 rounded-full border" style={{ background: `hsl(${theme.cssVariables['--secondary']})` }}></div>
                                <div className="w-8 h-8 rounded-full border" style={{ background: `hsl(${theme.cssVariables['--accent']})` }}></div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Font Customization</CardTitle>
                    <CardDescription>Select the primary font for the admin panel UI and text content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md space-y-2">
                        <Label htmlFor="font-select">Admin Panel Font</Label>
                        <Select value={settings.activeFont} onValueChange={(value) => applyFont(value)}>
                            <SelectTrigger id="font-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fonts.map(font => (
                                    <SelectItem key={font.name} value={font.value}>
                                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground pt-4" style={{ fontFamily: settings.activeFont }}>
                            The quick brown fox jumps over the lazy dog.
                        </p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Navbar Theme Customization</CardTitle>
                    <CardDescription>Select a specific theme for the sidebar and top header.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="max-w-md space-y-2">
                        <Label htmlFor="navbar-theme-select">Navbar Theme</Label>
                        <Select value={settings.navbarThemeName} onValueChange={(value) => applyNavbarTheme(themes.find(t => t.name === value) || themes[0])}>
                            <SelectTrigger id="navbar-theme-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map(theme => (
                                    <SelectItem key={theme.name} value={theme.name}>
                                        {theme.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
