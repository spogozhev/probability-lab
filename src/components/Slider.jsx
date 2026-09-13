function Slider({ label, value, min, max, step, onChange, format, accentClass = 'accent-indigo-600' }) {
  return (
    <label className="block text-sm">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800 tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentClass}`}
      />
    </label>
  )
}

export default Slider
