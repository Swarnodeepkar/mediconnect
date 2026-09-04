import { useEffect, useMemo, useRef, useState } from 'react';
import { Children, isValidElement } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { initials } from '../lib/format.js';
import './ui.css';

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`mc-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ tone = 'neutral', children, dot = false }) {
  return (
    <span className={`mc-badge mc-badge--${tone}`}>
      {dot && <span className="mc-badge__dot" />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  Completed: 'success', Resolved: 'success', Present: 'success', Active: 'success', 'Report Ready': 'success', Closed: 'success', Paid: 'success', Approved: 'success',
  'In Progress': 'info', Assigned: 'info', Processing: 'info', Scheduled: 'info', 'Sample Collected': 'info',
  Waiting: 'warn', Late: 'warn', Submitted: 'warn', Pending: 'warn', 'On Leave': 'warn', Due: 'warn',
  Absent: 'danger', High: 'danger', Overdue: 'danger', Cancelled: 'danger', Rejected: 'danger', Refunded: 'danger',
  Medium: 'warn', Low: 'neutral',
};

export function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || 'neutral';
  return <Badge tone={tone} dot>{status}</Badge>;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...rest }) {
  return (
    <button className={`mc-btn mc-btn--${variant} mc-btn--${size} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Avatar({ name, size = 36, color }) {
  const bg = color || stringToColor(name || '?');
  return (
    <span
      className="mc-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: bg }}
    >
      {initials(name || '?')}
    </span>
  );
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const palette = ['#1aa8a1', '#2f6fed', '#e9a520', '#e0483f', '#7c5cff', '#0d8f9e'];
  return palette[Math.abs(hash) % palette.length];
}

export function StatTile({ label, value, delta, tone = 'neutral', icon: Icon, iconTone = 'brand' }) {
  return (
    <Card className="mc-stat">
      <div className="mc-stat__top">
        {Icon && (
          <span className={`mc-stat__icon mc-stat__icon--${iconTone}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <span className="mc-stat__label">{label}</span>
      </div>
      <div className="mc-stat__value">{value}</div>
      {delta && (
        <div className={`mc-stat__delta mc-stat__delta--${tone}`}>{delta}</div>
      )}
    </Card>
  );
}

export function Table({ columns, rows, keyField = 'id', onRowClick, empty = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return <div className="mc-table-empty">{empty}</div>;
  }
  return (
    <div className="mc-table-wrap">
      <table className="mc-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'mc-row--clickable' : ''}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="mc-modal-overlay" onMouseDown={onClose}>
      <div
        className="mc-modal"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mc-modal__head">
          <h3>{title}</h3>
          <button className="mc-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="mc-modal__body">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📋', title, body, action }) {
  return (
    <div className="mc-empty">
      <div className="mc-empty__icon">{icon}</div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="mc-segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`mc-segmented__item ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="mc-field">
      <span className="mc-field__label">{label}</span>
      {children}
      {hint && <span className="mc-field__hint">{hint}</span>}
    </label>
  );
}

export function Select({ value, onChange, children, className = '', style, required, disabled, placeholder, id, name }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const options = useMemo(() => {
    return Children.toArray(children)
      .filter((c) => isValidElement(c) && c.type === 'option')
      .map((c) => ({
        value: c.props.value !== undefined ? String(c.props.value) : String(c.props.children),
        label: c.props.children,
        disabled: !!c.props.disabled,
      }));
  }, [children]);

  const selected = options.find((o) => o.value === String(value));

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function fireChange(nextValue) {
    onChange?.({ target: { value: nextValue, name, id } });
  }

  function handlePick(opt) {
    if (opt.disabled) return;
    fireChange(opt.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className={`mc-select ${disabled ? 'is-disabled' : ''} ${className}`} style={style} ref={rootRef}>
      {/* Hidden native select keeps forms/required-field semantics and validation working */}
      <select
        className="mc-select__native"
        value={value ?? ''}
        onChange={(e) => fireChange(e.target.value)}
        required={required}
        disabled={disabled}
        name={name}
        id={id}
        tabIndex={-1}
        aria-hidden="true"
      >
        {children}
      </select>

      <button
        type="button"
        className={`mc-select__trigger ${open ? 'is-open' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`mc-select__value ${!selected ? 'is-placeholder' : ''}`}>
          {selected ? selected.label : (placeholder || 'Select…')}
        </span>
        <ChevronDown size={15} strokeWidth={2.2} className="mc-select__chevron" />
      </button>

      {open && (
        <ul className="mc-select__menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === String(value)}
              className={`mc-select__option ${opt.value === String(value) ? 'is-selected' : ''} ${opt.disabled ? 'is-disabled' : ''}`}
              onClick={() => handlePick(opt)}
            >
              <span>{opt.label}</span>
              {opt.value === String(value) && <Check size={14} strokeWidth={2.4} className="mc-select__check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Input({ className = '', ...rest }) {
  return <input className={`mc-input ${className}`} {...rest} />;
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`mc-input ${className}`} {...rest} />;
}
