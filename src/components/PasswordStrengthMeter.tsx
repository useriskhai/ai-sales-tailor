import React from 'react';

interface PasswordStrengthMeterProps {
  password: string | undefined;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  // パスワードの強度を計算するロジック
  const calculateStrength = (password: string | undefined): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    // if (password.match(/[$@#&!]+/)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-700 dark:text-white">パスワード強度</span>
        <span className="text-sm font-medium text-blue-700 dark:text-white">
          {strength === 0 && 'パスワード入力'}
          {strength === 1 && '弱い'}
          {strength === 2 && '普通'}
          {strength === 3 && '強い'}
          {strength >= 4 && 'とても強い'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${(strength / 4) * 100}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-black-700 dark:text-white">8文字以上、大文字、小文字、数字を含む。</span>
    </div>
    
  );
};