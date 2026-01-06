'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/8bit/dialog';
import { Button } from '@/components/ui/8bit/button';

interface ATMProps {
  credits: number;
  bankDeposit: number;
  currentGoal: number;
  interestRate: number;
  totalInterestEarned: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export const ATM = ({ 
  credits, 
  bankDeposit, 
  currentGoal, 
  interestRate, 
  totalInterestEarned,
  onDeposit, 
  onWithdraw 
}: ATMProps) => {
  const [depositAmount, setDepositAmount] = useState(10);

  const expectedInterest = Math.floor(bankDeposit * interestRate);
  const interestPercentage = Math.round(interestRate * 100);

  const handleDeposit = () => {
    if (depositAmount > 0 && depositAmount <= credits) {
      onDeposit(depositAmount);
    }
  };

  const handleWithdraw = () => {
    if (depositAmount > 0 && depositAmount <= bankDeposit) {
      onWithdraw(depositAmount);
    }
  };

  const handleDepositAll = () => {
    if (credits > 0) {
      onDeposit(credits);
    }
  };

  const handleWithdrawAll = () => {
    if (bankDeposit > 0) {
      onWithdraw(bankDeposit);
    }
  };

  const presetAmounts = [10, 50, 100];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 text-xs bg-green-900/50 text-green-300 border-green-500">
          🏧 ATM
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-stone-900 border-4 border-green-500 text-white">
        <DialogTitle className="text-center text-green-400 border-b-2 border-green-600 pb-2 mb-3">
          🏧 ATM
        </DialogTitle>

        {/* Goal Display */}
        <div className="bg-black/50 p-3 rounded border border-stone-700 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">목표 코인:</span>
            <span className="text-yellow-400 font-bold">{currentGoal} 🪙</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-stone-400">현재 보유:</span>
            <span className="text-green-400 font-bold">{credits} 🪙</span>
          </div>
        </div>

        {/* Bank Account */}
        <div className="bg-green-900/30 p-3 rounded border border-green-600 mb-3">
          <div className="text-center mb-2">
            <div className="text-stone-400 text-xs">입금된 코인</div>
            <div className="text-2xl font-bold text-green-400">{bankDeposit} 🪙</div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-400">이자율:</span>
            <span className="text-yellow-400">{interestPercentage}%</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-stone-400">예상 이자:</span>
            <span className="text-yellow-400">+{expectedInterest} 🪙</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-stone-400">총 획득 이자:</span>
            <span className="text-blue-400">{totalInterestEarned} 🪙</span>
          </div>
        </div>

        {/* Interest Info */}
        <div className="text-[10px] text-yellow-400 text-center mb-3 bg-yellow-900/30 p-2 rounded border border-yellow-600/50">
          ⚠️ 매 데드라인마다 입금된 코인에 {interestPercentage}% 이자가 붙습니다!
        </div>

        {/* Amount Selector */}
        <div className="flex gap-1 justify-center mb-3">
          {presetAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => setDepositAmount(amount)}
              className={`px-3 py-1 text-xs rounded ${
                depositAmount === amount 
                  ? 'bg-green-600 text-white' 
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              }`}
            >
              {amount}
            </button>
          ))}
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 px-2 py-1 text-xs bg-stone-800 border border-stone-600 rounded text-center"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={handleDeposit}
            disabled={depositAmount <= 0 || depositAmount > credits}
            className="bg-green-700 hover:bg-green-600 text-xs"
          >
            입금 {depositAmount}
          </Button>
          <Button
            size="sm"
            onClick={handleWithdraw}
            disabled={depositAmount <= 0 || depositAmount > bankDeposit}
            className="bg-red-700 hover:bg-red-600 text-xs"
          >
            출금 {depositAmount}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDepositAll}
            disabled={credits <= 0}
            className="text-xs border-green-500 text-green-400"
          >
            전액 입금
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleWithdrawAll}
            disabled={bankDeposit <= 0}
            className="text-xs border-red-500 text-red-400"
          >
            전액 출금
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
