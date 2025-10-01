import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface FilePreviewModalProps {
  file: {
    id: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal = ({ file, isOpen, onClose }: FilePreviewModalProps) => {
  const [downloading, setDownloading] = useState(false);

  if (!file) return null;

  const isImage = file.mime_type.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';
  const isVideo = file.mime_type.startsWith('video/');
  const isAudio = file.mime_type.startsWith('audio/');
  const isText = file.mime_type.startsWith('text/');

  const getFileUrl = () => {
    const { data } = supabase.storage
      .from('organization-files')
      .getPublicUrl(file.file_path);
    return data.publicUrl;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
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
    } finally {
      setDownloading(false);
    }
  };

  const fileUrl = getFileUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{file.file_name}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage && (
            <img
              src={fileUrl}
              alt={file.file_name}
              className="w-full h-auto object-contain max-h-[70vh]"
            />
          )}

          {isPDF && (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0"
              title={file.file_name}
            />
          )}

          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="w-full h-auto max-h-[70vh]"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {isAudio && (
            <div className="flex items-center justify-center h-[200px]">
              <audio src={fileUrl} controls className="w-full max-w-md">
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {isText && (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0 bg-background"
              title={file.file_name}
            />
          )}

          {!isImage && !isPDF && !isVideo && !isAudio && !isText && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <p className="text-muted-foreground mb-4">
                Preview not available for this file type
              </p>
              <Button onClick={handleDownload} disabled={downloading}>
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
