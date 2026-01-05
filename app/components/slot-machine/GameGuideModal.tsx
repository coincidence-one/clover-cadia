import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import { useLocale } from '@/app/contexts/LocaleContext';

interface GameGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function GameGuideModal({ open, onClose }: GameGuideModalProps) {
  const { t } = useLocale();
  const [page, setPage] = useState(0);

  const pages = [
    { title: t.guidePage1Title, desc: t.guidePage1Desc, icon: '💀' }, // Survival
    { title: t.guidePage2Title, desc: t.guidePage2Desc, icon: '⚖️' }, // Strategy
    { title: t.guidePage3Title, desc: t.guidePage3Desc, icon: '😈' }, // Curse
    { title: t.guidePage4Title, desc: t.guidePage4Desc, icon: '🛒' }, // Shop
  ];

  const handleNext = () => {
    if (page < pages.length - 1) setPage(page + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  // Reset page when opened
  useEffect(() => {
    if (open) setPage(0);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-sm bg-stone-900 border-4 border-yellow-500 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-center text-xl">
             {t.guideTitle} ({page + 1}/{pages.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 min-h-[200px] text-center gap-4">
          <div className="text-6xl animate-bounce">
            {pages[page].icon}
          </div>
          <h3 className="text-lg font-bold text-white underline decoration-yellow-500 underline-offset-4">
            {pages[page].title}
          </h3>
          <p className="text-sm text-stone-300 whitespace-pre-line leading-relaxed px-4">
            {pages[page].desc}
          </p>
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <Button 
            variant="secondary" 
            onClick={handlePrev} 
            disabled={page === 0}
            className="flex-1 bg-stone-700 hover:bg-stone-600"
          >
            {t.prev}
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
          >
            {page === pages.length - 1 ? t.close : t.next}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
