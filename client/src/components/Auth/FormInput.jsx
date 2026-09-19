import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormInput = ({ label, error, ...inputProps }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputProps.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : inputProps.type;

  return (
    <div>
      <label
        htmlFor={inputProps.id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          type={inputType}
          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
            error
              ? "border-danger focus:border-danger"
              : "border-slate-300 focus:border-brand-500"
          } ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Eye className="h-5 w-5" aria-hidden="true" />
            ) : (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
};

export default FormInput;
