/* Shared utility components */

/** Page wrapper with heading */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="px-8 pt-8 pb-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/** Blue primary button */
export function Btn({ onClick, children, variant = 'primary', disabled = false, type = 'button' }) {
  const styles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger:  'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
    ghost:   'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

/** Search input */
export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <img src="https://img.icons8.com/ios/16/6b7280/search.png" alt="" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-60" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-white"
      />
    </div>
  );
}

/** Status badge */
export function Badge({ label, color = 'gray' }) {
  const colors = {
    green:  'bg-green-50 text-green-700 border-green-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    gray:   'bg-gray-50 text-gray-600 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${colors[color] ?? colors.gray}`}>
      {label}
    </span>
  );
}

/** Modal wrapper */
export function Modal({ title, onClose, children, size = 'md' }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${widths[size]} mx-4 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Form field label + input wrapper */
export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Standard text/select input */
export function Input({ value, onChange, type = 'text', placeholder, required, className = '' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

export function Select({ value, onChange, children, required }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {children}
    </select>
  );
}

export function Textarea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    />
  );
}

/** Data table */
export function Table({ columns, rows, onEdit, onDelete, keyField }) {
  if (!rows.length) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        <img src="https://img.icons8.com/ios/48/d1d5db/database.png" alt="" className="mx-auto mb-3 opacity-40" />
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
            <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[keyField]} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row[keyField])}
                    className="px-2.5 py-1 text-xs rounded-md border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Loading spinner */
export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Confirm delete dialog */
export function ConfirmDelete({ onConfirm, onCancel, label = 'this record' }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel} size="sm">
      <div className="px-6 py-4">
        <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-5">
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        </div>
      </div>
    </Modal>
  );
}
