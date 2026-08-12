const FormInput = ({ label, error, ...inputProps }) => {
  return (
    <div>
      <label
        htmlFor={inputProps.id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        {...inputProps}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${
          error
            ? "border-danger focus:border-danger"
            : "border-slate-300 focus:border-brand-500"
        }`}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
};

export default FormInput;
