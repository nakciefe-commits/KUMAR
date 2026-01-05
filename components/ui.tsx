import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50",
    ghost: "bg-transparent hover:bg-white/10 text-gray-300 hover:text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm text-gray-400 font-medium">{label}</label>}
      <input
        className={`bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}>
      {title && <h2 className="text-xl font-bold text-white mb-4">{title}</h2>}
      {children}
    </div>
  );
};