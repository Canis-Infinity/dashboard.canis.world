// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { CloudUpload, FileIcon, Maximize2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const imageAccept = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

function isImageSource(value) {
  return Boolean(value && !String(value).toLowerCase().endsWith('.pdf'));
}

export function FileUploadField({
  id,
  name,
  title = '檔案上傳',
  description = '拖曳檔案到這裡，或點擊選擇檔案。',
  helperText = '支援 PNG、JPG、WEBP、SVG，最大 10MB',
  previewUrl,
  accept = imageAccept,
  maxSize = 10 * 1024 * 1024,
  compact = false,
}) {
  const [preview, setPreview] = useState(previewUrl || '');
  const [selectedName, setSelectedName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setPreview(previewUrl || '');
    setSelectedName('');
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxFiles: 1,
    maxSize,
    multiple: false,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      setSelectedName(file.name);
      setPreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
        return file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      });
    },
  });

  const canPreviewImage = useMemo(() => isImageSource(preview), [preview]);
  const containedWidth = {
    inlineSize: '100%',
    minInlineSize: 0,
    maxInlineSize: '100%',
    contain: 'inline-size',
  };

  return (
    <div
      data-slot="file-upload-field"
      className="w-full min-w-0 max-w-full space-y-3 overflow-x-hidden"
      style={containedWidth}
    >
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div
        {...getRootProps()}
        data-slot="file-upload-dropzone"
        className={cn(
          'flex min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/30 text-center transition-colors hover:bg-muted/50',
          compact ? 'min-h-40 p-3 sm:p-4' : 'min-h-64 p-6',
          isDragActive && 'border-primary bg-primary/10'
        )}
        style={{
          ...containedWidth,
          inlineSize: 'calc(100% - 2px)',
          maxInlineSize: 'calc(100% - 2px)',
          marginInline: '1px',
          boxSizing: 'border-box',
        }}
      >
        <input {...getInputProps({ id, name })} />
        {canPreviewImage ? (
          <div
            data-slot="file-upload-preview"
            className="flex w-full min-w-0 max-w-full flex-col items-center gap-4 text-center"
            style={containedWidth}
          >
            <button
              type="button"
              data-slot="file-upload-preview-trigger"
              className={cn('group relative mx-auto block w-full min-w-0 overflow-hidden rounded-md border bg-background', compact ? 'max-w-32' : 'max-w-sm')}
              onClick={(event) => {
                event.stopPropagation();
                setPreviewOpen(true);
              }}
            >
              <img src={preview} alt="上傳預覽" className={cn('mx-auto w-full min-w-0 max-w-full object-cover', compact ? 'h-32' : 'h-48 p-3 object-contain')} />
              <span className="absolute inset-0 grid place-items-center bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="size-6" />
              </span>
            </button>
            <Button
              type="button"
              variant="outline"
              className={compact ? 'w-full max-w-48' : ''}
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
            >
              <Upload className="size-4" />
              選擇新圖片
            </Button>
          </div>
        ) : (
          <div
            data-slot="file-upload-empty"
            className="flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-4 text-center"
            style={containedWidth}
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-background">
              <CloudUpload className="size-7" />
            </div>
            <div className="min-w-0 max-w-full space-y-1">
              <div className="text-lg font-semibold">上傳檔案</div>
              <div className="break-words text-sm text-muted-foreground">{selectedName || helperText}</div>
            </div>
            <Button
              className={compact ? 'w-full max-w-48' : ''}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
            >
              選擇檔案
            </Button>
          </div>
        )}
      </div>
      {selectedName && canPreviewImage ? (
        <div className="flex min-w-0 max-w-full items-center gap-2 text-sm text-muted-foreground">
          <FileIcon className="size-4" />
          <span className="truncate">{selectedName}</span>
        </div>
      ) : null}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>圖片預覽</DialogTitle>
          </DialogHeader>
          <div className="grid place-items-center rounded-lg bg-muted p-4">
            {canPreviewImage ? <img src={preview} alt="圖片預覽" className="max-h-[70svh] object-contain" /> : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
