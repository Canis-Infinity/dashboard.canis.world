// @ts-nocheck
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useMutationAction } from '@/hooks/useMutationAction';
import { updateContact } from '@/services/contactService';

const statusOptions = [
  { value: 'unread', label: '未讀' },
  { value: 'pending', label: '佇列' },
  { value: 'done', label: '完成' },
];

const categoryLabels = {
  collaboration: '合作邀約',
  commission: '委託詢問',
  business: '商務聯繫',
  feedback: '網站回饋',
  other: '其他事項',
};

function ReadOnlyField({ label, value }) {
  return (
    <div className="grid gap-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{value || '-'}</div>
    </div>
  );
}

export function ContactDialog({ open, onOpenChange, contact, onSaved }) {
  const mutate = useMutationAction({
    successMessage: '聯絡表單已更新',
    errorMessage: '聯絡表單更新失敗',
    onSuccess: async () => {
      onOpenChange(false);
      await onSaved?.();
    },
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: contact.name,
      email: contact.email,
      category: contact.category,
      subject: contact.subject,
      message: contact.message,
      replyPreference: contact.replyPreference || 'email',
      locale: contact.locale || 'zh-TW',
      website: contact.website || '',
      acknowledged: contact.acknowledged === true,
      status: formData.get('status'),
      comment: formData.get('comment'),
    };

    await mutate(() => updateContact(contact._id, payload));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88svh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>聯絡內容</DialogTitle>
          <DialogDescription>查看表單內容並更新處理狀態。</DialogDescription>
        </DialogHeader>
        <form className="grid min-h-0 min-w-0 gap-0" onSubmit={handleSubmit}>
          <div className="max-h-[62svh] overflow-x-hidden overflow-y-auto overscroll-contain py-4">
            <div className="grid min-w-0 gap-5 px-6">
              <div className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField label="姓名" value={contact.name} />
                <ReadOnlyField label="信箱" value={contact.email} />
                <ReadOnlyField label="類型" value={categoryLabels[contact.category] || contact.category} />
                <ReadOnlyField label="主旨" value={contact.subject} />
                <ReadOnlyField label="是否需要回覆" value={contact.replyPreference === 'no-reply' ? '不需要回覆' : '需要回覆'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact-message">訊息</Label>
                <Textarea id="contact-message" value={contact.message || ''} rows={5} readOnly aria-readonly="true" className="bg-muted/40" />
              </div>
              <div className="grid gap-3">
                <Label>狀態</Label>
                <RadioGroup name="status" defaultValue={contact.status || 'unread'} className="grid gap-2 sm:grid-cols-3">
                  {statusOptions.map((item) => (
                    <Label key={item.value} htmlFor={`contact-status-${item.value}`} className="flex cursor-pointer items-center gap-2 rounded-md border p-3">
                      <RadioGroupItem id={`contact-status-${item.value}`} value={item.value} />
                      {item.label}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment">備註</Label>
                <Textarea id="comment" name="comment" defaultValue={contact.comment || ''} rows={5} />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button type="submit">更新</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
