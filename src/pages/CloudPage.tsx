import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Upload, Download, Trash2, Eye, Share2, Image, Video, FileAudio, File as FileIcon, FileText } from "lucide-react";
import { FilePreviewModal } from "@/components/cloud/FilePreviewModal";
import { FileShareDialog } from "@/components/cloud/FileShareDialog";
import { useUserRole } from "@/hooks/useUserRole";

interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description: string | null;
  uploaded_by: string;
  created_at: string;
  shared_with_users?: string[];
}

export default function CloudPage() {
  const { activeContext } = useOrganization();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const [shareFile, setShareFile] = useState<FileMetadata | null>(null);

  // Fetch files
  const { data: files, isLoading } = useQuery({
    queryKey: ['files', activeContext?.id],
    queryFn: async () => {
      if (!activeContext?.id) return [];
      
      const { data, error } = await supabase
        .from('file_metadata')
        .select('*')
        .eq('organization_id', activeContext.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FileMetadata[];
    },
    enabled: !!activeContext?.id
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (file: FileMetadata) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('organization-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: dbError } = await supabase
        .from('file_metadata')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', activeContext?.id] });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      console.error('Error deleting file:', error);
      toast.error("Failed to delete file");
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !activeContext?.id) return;

    setUploading(true);
    try {
      const filePath = `${activeContext.id}/${Date.now()}-${selectedFile.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('organization-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save metadata
      const { error: dbError } = await supabase
        .from('file_metadata')
        .insert({
          organization_id: activeContext.id,
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          description: description || null,
          uploaded_by: user.id
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['files', activeContext.id] });
      setSelectedFile(null);
      setDescription('');
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file: FileMetadata) => {
    try {
      const { data, error } = await supabase.storage
        .from('organization-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  if (!activeContext) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>No Organization Selected</CardTitle>
              <CardDescription>
                Please select an organization to access cloud storage
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cloud Storage</h1>
          <p className="text-muted-foreground">
            Share files with your {activeContext.type} members
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Upload files to share with your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,text/*"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this file"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared Files</CardTitle>
            <CardDescription>Files shared within your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading files...</p>
            ) : !files || files.length === 0 ? (
              <p className="text-muted-foreground">No files uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1">
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                        {file.description && (
                          <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewFile(file)}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareFile(file)}
                        title="Share with members"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(file)}
                          disabled={deleteMutation.isPending}
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <FileShareDialog
        file={shareFile}
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
        onShareUpdate={() => queryClient.invalidateQueries({ queryKey: ['files', activeContext?.id] })}
      />
    </AppLayout>
  );
}
