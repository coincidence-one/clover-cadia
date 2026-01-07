'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';
import { Confetti } from './Confetti';

interface PaymentCenterProps {
  credits: number;
  currentDebt: number;
  paidAmount: number;
  deadlineTurn: number;
  currentTurn: number;
  earlyPaymentBonus: number;
  onPayment: (amount: number) => void;
}

export function PaymentCenter({
  credits,
  currentDebt,
  paidAmount,
  deadlineTurn,
  currentTurn,
  onPayment,
}: PaymentCenterProps) {
  const [payAmount, setPayAmount] = useState(0);
  const [open, setOpen] = useState(false);

  const remainingDebt = currentDebt - paidAmount;
  const turnsLeft = deadlineTurn - currentTurn;
  const isDebtPaid = remainingDebt <= 0;
  
  // Calculate early payment bonus (1 coin per remaining turn per 10 coins paid early)
  const calculateBonus = (payment: number): number => {
    if (turnsLeft <= 0) return 0;
    return Math.floor((payment / 10) * turnsLeft);
  };

  const handlePayment = () => {
    if (payAmount > 0 && payAmount <= credits) {
      onPayment(payAmount);
      setPayAmount(0);
    }
  };

  const handlePayAll = () => {
    const maxPayable = Math.min(credits, remainingDebt);
    if (maxPayable > 0) {
      onPayment(maxPayable);
      setPayAmount(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`text-xs h-8 px-2 ${isDebtPaid ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
        >
          💳 {isDebtPaid ? '✓' : `${remainingDebt}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-stone-800 border-4 border-yellow-500 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-center">💳 PAYMENT CENTER</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Debt Status */}
          <div className="bg-black p-3 border-2 border-stone-600">
            <div className="flex justify-between mb-2">
              <span className="text-stone-400 text-xs">목표 금액</span>
              <span className="text-white">{currentDebt}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-stone-400 text-xs">납부 완료</span>
              <span className="text-green-400">{paidAmount}</span>
            </div>
            <div className="flex justify-between border-t border-stone-700 pt-2">
              <span className="text-xs text-red-400">남은 금액</span>
              <span className={`text-lg ${isDebtPaid ? 'text-green-400' : 'text-red-400'}`}>
                {isDebtPaid ? '✓ PAID' : remainingDebt}
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-black p-2 border-2 border-stone-600 text-center">
            <div className="text-stone-400 text-xs">남은 턴</div>
            <div className={`text-2xl ${turnsLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {turnsLeft > 0 ? turnsLeft : 'DEADLINE!'}
            </div>
            {turnsLeft > 0 && !isDebtPaid && (
              <div className="text-green-400 text-[10px] mt-1">
                선납 시 턴당 보너스 적립!
              </div>
            )}
          </div>

          {/* Payment Input */}
          {!isDebtPaid && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Math.min(Math.max(0, parseInt(e.target.value) || 0), credits))}
                  className="flex-1 bg-black border-2 border-stone-600 p-2 text-green-400 text-center"
                  placeholder="금액 입력"
                  max={credits}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPayAmount(Math.min(credits, remainingDebt))}
                  className="text-xs"
                >
                  MAX
                </Button>
              </div>
              
              {payAmount > 0 && turnsLeft > 0 && (
                <div className="text-center text-green-400 text-xs">
                  💰 선납 보너스: +{calculateBonus(payAmount)} 코인
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={handlePayment}
                  disabled={payAmount <= 0 || payAmount > credits}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                >
                  납부하기
                </Button>
                <Button
                  onClick={handlePayAll}
                  disabled={credits <= 0 || isDebtPaid}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black"
                >
                  전액납부
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isDebtPaid && (
            <div className="text-center py-4">
              <Confetti count={50} />
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-green-400">납부 완료!</div>
              <div className="text-stone-400 text-xs mt-1">
                다음 라운드로 진행하세요
              </div>
            </div>
          )}

          {/* Current Balance */}
          <div className="text-center text-stone-400 text-xs border-t border-stone-700 pt-2">
            보유 코인: <span className="text-green-400">{credits}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
