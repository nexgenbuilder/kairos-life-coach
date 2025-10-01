import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Palette, Image, Type, Layout, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPage() {
  const { activeContext, isAdmin } = useOrganization();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState(
    activeContext?.settings?.brand_colors?.primary || '#3b82f6'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    activeContext?.settings?.brand_colors?.secondary || '#8b5cf6'
  );
  const [accentColor, setAccentColor] = useState(
    activeContext?.settings?.brand_colors?.accent || '#f59e0b'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    activeContext?.settings?.brand_colors?.background || '#ffffff'
  );
  const [textColor, setTextColor] = useState(
    activeContext?.settings?.brand_colors?.text || '#000000'
  );
  const [customFont, setCustomFont] = useState(
    activeContext?.settings?.typography?.font || 'Inter'
  );

  if (!activeContext) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Alert>
            <AlertDescription>
              Please select a space to access admin settings.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin()) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <Alert>
            <AlertDescription>
              You need admin permissions to access space branding settings.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackgroundFile(file);
  };

  const uploadAsset = async (file: File, assetType: 'logo' | 'background') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${activeContext.id}-${assetType}-${Date.now()}.${fileExt}`;
    const filePath = `${activeContext.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('organization-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('organization-files')
      .getPublicUrl(filePath);

    // Save to space_assets table
    const { error: assetError } = await supabase.from('space_assets').insert({
      organization_id: activeContext.id,
      asset_type: assetType,
      file_name: fileName,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id || '',
    });
    
    if (assetError) {
      console.error('Error saving asset metadata:', assetError);
    }

    return publicUrl;
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      let logoUrl = activeContext.logo_url;
      let backgroundUrl = activeContext.settings?.background_image_url;

      // Upload logo if changed
      if (logoFile) {
        setUploading(true);
        logoUrl = await uploadAsset(logoFile, 'logo');
      }

      // Upload background if changed
      if (backgroundFile) {
        setUploading(true);
        backgroundUrl = await uploadAsset(backgroundFile, 'background');
      }

      setUploading(false);

      // Update organization with new branding
      const { error } = await supabase
        .from('organizations')
        .update({
          logo_url: logoUrl,
          settings: {
            ...activeContext.settings,
            brand_colors: {
              primary: primaryColor,
              secondary: secondaryColor,
              accent: accentColor,
              background: backgroundColor,
              text: textColor,
            },
            background_image_url: backgroundUrl,
            typography: {
              font: customFont,
            },
          },
        })
        .eq('id', activeContext.id);

      if (error) throw error;

      toast({
        title: 'Branding Updated',
        description: 'Your space branding has been saved successfully.',
      });

      // Reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branding settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Space Branding</h1>
            <p className="text-muted-foreground">
              Customize the look and feel of {activeContext.name}
            </p>
          </div>
        </div>

        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Visual Identity</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Typography</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Background</CardTitle>
                <CardDescription>
                  Upload your space logo and background image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Space Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {activeContext.logo_url && (
                    <img
                      src={activeContext.logo_url}
                      alt="Current logo"
                      className="h-20 w-20 object-contain border rounded"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background Image</Label>
                  <Input
                    id="background"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                  />
                  {activeContext.settings?.background_image_url && (
                    <img
                      src={activeContext.settings.background_image_url}
                      alt="Current background"
                      className="h-32 w-full object-cover border rounded"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>
                  Define your brand colors for a unique space experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Font Selection</CardTitle>
                <CardDescription>Choose a font that matches your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="font">Primary Font</Label>
                  <Input
                    id="font"
                    value={customFont}
                    onChange={(e) => setCustomFont(e.target.value)}
                    placeholder="e.g., Inter, Roboto, Arial"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a Google Font name or system font
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Options</CardTitle>
                <CardDescription>Coming soon - Customize your space layout</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Layout customization options will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Assets Library</CardTitle>
                <CardDescription>Manage all your space assets in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Asset management interface coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your branding changes will look (save to apply)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg p-6 space-y-4"
                  style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {activeContext.logo_url && (
                      <img
                        src={activeContext.logo_url}
                        alt="Logo preview"
                        className="h-12 w-12 object-contain"
                      />
                    )}
                    <h2 className="text-2xl font-bold" style={{ fontFamily: customFont }}>
                      {activeContext.name}
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor, color: '#fff' }}>
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{ borderColor: secondaryColor, color: secondaryColor }}
                    >
                      Secondary Button
                    </Button>
                    <Button style={{ backgroundColor: accentColor, color: '#fff' }}>
                      Accent Button
                    </Button>
                  </div>

                  <p style={{ fontFamily: customFont }}>
                    This is a preview of how your text will appear with the selected font and
                    colors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Cancel
          </Button>
          <Button onClick={handleSaveBranding} disabled={saving || uploading}>
            {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
