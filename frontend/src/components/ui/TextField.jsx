export function TextField({ label, type = "text", value, onChange, placeholder, required = false, hint }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-main">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={type === "password" ? 8 : undefined}
        className="w-full rounded-md border border-line bg-sunken px-3 py-2.5 text-sm text-main placeholder:text-faint focus:border-accent focus:outline-none"
      />
      {hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export default TextField;
