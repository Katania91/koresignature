import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange, placeholder, type = "text" }) => {
  const inputId = `input-${name}`;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5 ml-1">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-white/20 dark:border-gray-600/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm hover:bg-white/70 dark:hover:bg-gray-800/70"
      />
    </div>
  );
};

export default FormInput;