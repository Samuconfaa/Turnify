// Turnify shared components

const F = window.TURNIFY_FONT;

// Status bar for phone frame
function TStatusBar({ t, dark }) {
  const c = t.text;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px 6px', height: 44, boxSizing: 'border-box',
      fontFamily: F, color: c,
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>9:41</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="5" rx="0.5" fill={c}/><rect x="4.5" y="4" width="3" height="7" rx="0.5" fill={c}/><rect x="9" y="2" width="3" height="9" rx="0.5" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.5" fill={c}/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2C9.5 2 11.4 2.8 12.8 4.1L13.7 3.2C12 1.6 9.9 0.7 7.5 0.7C5.1 0.7 3 1.6 1.3 3.2L2.2 4.1C3.6 2.8 5.5 2 7.5 2Z" fill={c}/><path d="M7.5 5C8.7 5 9.8 5.5 10.6 6.3L11.5 5.4C10.4 4.3 9 3.6 7.5 3.6C6 3.6 4.6 4.3 3.5 5.4L4.4 6.3C5.2 5.5 6.3 5 7.5 5Z" fill={c}/><circle cx="7.5" cy="9" r="1.3" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill={c}/><path d="M22 4v3c0.7-0.2 1.2-0.9 1.2-1.5C23.2 4.9 22.7 4.2 22 4z" fill={c} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

// Phone frame — clean, light, scaleable
function Phone({ children, t, dark, width = 390, height = 800, statusBar = true, homeIndicator = true, tabBar = null, hideStatus = false }) {
  return (
    <div style={{
      width, height, borderRadius: 44, overflow: 'hidden',
      background: t.bg, position: 'relative',
      boxShadow: dark
        ? '0 30px 60px rgba(0,0,0,0.45), 0 0 0 1.5px #2a382f, 0 0 0 6px #0a100c'
        : '0 30px 60px rgba(20,40,30,0.14), 0 0 0 1.5px #d6e0d9, 0 0 0 6px #f0f4f1',
      fontFamily: F,
      color: t.text,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 32, borderRadius: 22, background: '#000', zIndex: 50,
      }} />
      {statusBar && !hideStatus && <TStatusBar t={t} dark={dark} />}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {tabBar && (
        <div style={{ padding: '0 16px 8px', position: 'relative', zIndex: 30 }}>
          {tabBar}
        </div>
      )}
      {homeIndicator && (
        <div style={{
          height: 28, display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: 8, pointerEvents: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: 124, height: 5, borderRadius: 100,
            background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(23,29,25,0.35)',
          }} />
        </div>
      )}
    </div>
  );
}

// Page header
function Header({ t, title, leading, trailing, subtitle, dense = false }) {
  return (
    <div style={{
      padding: dense ? '10px 20px 14px' : '8px 20px 16px',
      borderBottom: `1px solid ${t.border}`,
      background: t.surface,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 32 }}>
        {leading}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4, lineHeight: 1.15 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {trailing}
      </div>
    </div>
  );
}

// Card
function Card({ t, children, style, onClick, padding = 16, accent }) {
  return (
    <div onClick={onClick} style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 16,
      padding,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {accent && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />}
      {children}
    </div>
  );
}

// Buttons
function PrimaryBtn({ t, children, full = true, height = 50, style, leading }) {
  return (
    <div style={{
      height, width: full ? '100%' : 'auto', padding: '0 20px',
      background: t.primary, color: dark_text_on_primary(t),
      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 15, fontWeight: 600, letterSpacing: -0.1, ...style,
    }}>
      {leading}
      {children}
    </div>
  );
}
function dark_text_on_primary(t) {
  // dark primary is light green; needs dark text. light primary is deep green; white text.
  return t.primary === '#68DBA9' ? '#0D1510' : '#FFFFFF';
}
function OutlineBtn({ t, children, full = true, height = 50, style, leading, color }) {
  const c = color || t.primary;
  return (
    <div style={{
      height, width: full ? '100%' : 'auto', padding: '0 20px',
      background: 'transparent', color: c,
      border: `1px solid ${c}`,
      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontSize: 15, fontWeight: 600, letterSpacing: -0.1, ...style,
    }}>
      {leading}{children}
    </div>
  );
}
function DangerBtn({ t, children, full = true, height = 50, outline = true, style }) {
  if (outline) return <OutlineBtn t={t} color={t.danger} full={full} height={height} style={style}>{children}</OutlineBtn>;
  return <PrimaryBtn t={{...t, primary: t.danger}} full={full} height={height} style={style}>{children}</PrimaryBtn>;
}
function SmallPill({ children, bg, color, style }) {
  return (
    <div style={{
      height: 32, padding: '0 14px', borderRadius: 16,
      background: bg, color, display: 'inline-flex', alignItems: 'center',
      fontSize: 13, fontWeight: 600, ...style,
    }}>{children}</div>
  );
}

// Input
function Input({ t, label, value, placeholder, focused, trailing, leading, type = 'text', helper, error }) {
  const borderColor = error ? t.danger : focused ? t.primary : t.border;
  const borderWidth = focused || error ? 2 : 1;
  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <div style={{
          position: 'absolute', top: -7, left: 14,
          background: t.surface, padding: '0 6px', zIndex: 1,
          fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
          color: focused ? t.primary : t.textSecondary,
        }}>{label}</div>
      )}
      <div style={{
        height: 50, borderRadius: 12,
        border: `${borderWidth}px solid ${borderColor}`,
        padding: '0 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: t.surface, color: t.text,
        fontSize: 15,
        ...(focused || error ? { padding: `0 ${14 - borderWidth + 1}px` } : {}),
      }}>
        {leading}
        <div style={{ flex: 1, color: value ? t.text : t.textSecondary, opacity: value ? 1 : 0.7 }}>
          {value || placeholder}
        </div>
        {trailing}
      </div>
      {helper && <div style={{ fontSize: 12, color: error ? t.danger : t.textSecondary, marginTop: 6, paddingLeft: 4 }}>{helper}</div>}
    </div>
  );
}

// Avatar with initials
function Avatar({ t, initials, size = 44, bg, color, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg || t.primaryLight, color: color || t.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.32), fontWeight: 600, letterSpacing: -0.2,
      flexShrink: 0,
      ...(ring ? { boxShadow: `0 0 0 2px ${ring}` } : {}),
    }}>{initials}</div>
  );
}

// Status badge
function StatusBadge({ t, kind = 'pending', label, dot }) {
  const map = {
    approved: { bg: t.successBg, color: t.successText, def: 'Approvato' },
    pending: { bg: t.warningBg, color: t.warningText, def: 'In attesa' },
    rejected: { bg: t.errorBg, color: t.errorText, def: 'Rifiutato' },
    today: { bg: t.primary, color: dark_text_on_primary(t), def: 'Oggi' },
    active: { bg: t.successBg, color: t.successText, def: 'Attivo' },
    inactive: { bg: t.surfaceLow, color: t.textSecondary, def: 'Inattivo' },
  };
  const s = map[kind] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 24, padding: '0 10px', borderRadius: 12,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />}
      {label || s.def}
    </span>
  );
}

// Filter chip
function Chip({ t, label, active, style }) {
  return (
    <div style={{
      height: 32, padding: '0 14px', borderRadius: 20,
      background: active ? t.primary : t.surfaceLow,
      color: active ? dark_text_on_primary(t) : t.textSecondary,
      display: 'inline-flex', alignItems: 'center',
      fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      whiteSpace: 'nowrap', flexShrink: 0, ...style,
    }}>{label}</div>
  );
}

// Section label
function SectionLabel({ t, children, action, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 4px', marginBottom: 10, ...style,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
        color: t.textSecondary, textTransform: 'uppercase',
      }}>{children}</div>
      {action && <div style={{ fontSize: 13, color: t.primary, fontWeight: 500 }}>{action}</div>}
    </div>
  );
}

// Tab bar — floating pill
function TabBar({ t, active = 0, role = 'admin' }) {
  const tabs = role === 'admin'
    ? [
        { label: 'Dashboard', icon: <Icon name="home" /> },
        { label: 'Turni', icon: <Icon name="cal" /> },
        { label: 'Team', icon: <Icon name="users" /> },
        { label: 'Notifiche', icon: <Icon name="bell" /> },
        { label: 'Profilo', icon: <Icon name="user" /> },
      ]
    : [
        { label: 'Home', icon: <Icon name="home" /> },
        { label: 'Turni', icon: <Icon name="cal" /> },
        { label: 'Ferie', icon: <Icon name="palm" /> },
        { label: 'Notifiche', icon: <Icon name="bell" /> },
        { label: 'Profilo', icon: <Icon name="user" /> },
      ];
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 28,
      padding: 6, display: 'flex', gap: 4,
      boxShadow: '0 6px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {tabs.map((tab, i) => (
        <div key={i} style={{
          flex: 1, height: 44, borderRadius: 22,
          background: i === active ? t.primary : 'transparent',
          color: i === active ? dark_text_on_primary(t) : t.textSecondary,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(tab.icon, { color: i === active ? dark_text_on_primary(t) : t.textSecondary, size: 20 })}
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.1 }}>{tab.label}</div>
        </div>
      ))}
    </div>
  );
}

// Bottom sheet drag handle
function DragHandle({ t }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
      <div style={{ width: 32, height: 4, borderRadius: 2, background: t.border }} />
    </div>
  );
}

// KPI card
function KPI({ t, label, value, icon, bg, fg, dark }) {
  return (
    <div style={{
      background: bg, borderRadius: 16,
      padding: 14, color: fg, minHeight: 96,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 500, marginTop: 6, opacity: 0.9, letterSpacing: -0.1 }}>{label}</div>
      </div>
    </div>
  );
}

// Toggle switch
function Toggle({ on, t }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 13,
      background: on ? t.primary : t.border,
      position: 'relative', flexShrink: 0,
      transition: 'background 0.15s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.15s',
      }} />
    </div>
  );
}

// Icon system — simple line icons
function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-4v-7h-8v7H4a1 1 0 01-1-1V11z"/></svg>;
    case 'cal': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'users': return <svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17" cy="9" r="2.5"/><path d="M21.5 17c0-2-1.6-3.5-4-3.5"/></svg>;
    case 'bell': return <svg {...p}><path d="M6 8a6 6 0 1112 0c0 3 1.5 5 2 6H4c.5-1 2-3 2-6z"/><path d="M10 19a2 2 0 004 0"/></svg>;
    case 'user': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    case 'palm': return <svg {...p}><path d="M12 21V10"/><path d="M12 10c-2-4-6-3-7-1M12 10c2-4 6-3 7-1M12 10c-1-3 1-6 4-6M12 10c1-3-1-6-4-6"/></svg>;
    case 'check': return <svg {...p}><path d="M4 12l5 5L20 6"/></svg>;
    case 'x': return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'chev-r': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chev-l': return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chev-d': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'filter': return <svg {...p}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 118 0v4"/></svg>;
    case 'mail': return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>;
    case 'eye': return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'briefcase': return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
    case 'key': return <svg {...p}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'download': return <svg {...p}><path d="M12 3v13M6 11l6 6 6-6M4 21h16"/></svg>;
    case 'upload': return <svg {...p}><path d="M12 21V8M6 13l6-6 6 6M4 3h16"/></svg>;
    case 'edit': return <svg {...p}><path d="M4 20h4l11-11-4-4L4 16v4z"/></svg>;
    case 'trash': return <svg {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>;
    case 'swap': return <svg {...p}><path d="M7 5h13l-4-4M7 5l4 4M17 19H4l4 4M17 19l-4-4"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>;
    case 'phone': return <svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>;
    case 'building': return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>;
    case 'doc': return <svg {...p}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>;
    case 'logout': return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'bolt': return <svg {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
    case 'bar': return <svg {...p}><path d="M4 21V10M10 21V5M16 21v-8M22 21H2"/></svg>;
    case 'camera': return <svg {...p}><path d="M3 8h4l2-3h6l2 3h4v12H3V8z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'moon': return <svg {...p}><path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/></svg>;
    case 'list': return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'flag': return <svg {...p}><path d="M4 21V4l9 2 7-1v10l-7 1-9-2"/></svg>;
    case 'pencil': return <svg {...p}><path d="M12 19l7-7 3 3-7 7H12v-3zM15 7l3 3M11 8l-7 7v3h3l7-7"/></svg>;
    case 'arrow-r': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-l': return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-u': return <svg {...p}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case 'arrow-d': return <svg {...p}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case 'menu': return <svg {...p}><path d="M4 12h16M4 6h16M4 18h16"/></svg>;
    case 'more': return <svg {...p}><circle cx="6" cy="12" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/><circle cx="18" cy="12" r="1.5" fill={color} stroke="none"/></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>;
    case 'globe': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="3"/></svg>;
  }
}

// Small icon box (colored bg, icon centered)
function IconBox({ size = 32, bg, color, icon, radius = 10 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={size * 0.55} color={color} />
    </div>
  );
}

// FAB
function FAB({ t, icon = 'plus' }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 28,
      background: t.primary, color: dark_text_on_primary(t),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0,105,72,0.30)',
    }}>
      <Icon name={icon} size={24} color={dark_text_on_primary(t)} strokeWidth={2.2} />
    </div>
  );
}

// Empty state
function EmptyState({ t, icon = 'bell', title, body, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: t.surfaceLow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={28} color={t.textSecondary} strokeWidth={1.6} />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: t.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.4 }}>{body}</div>
      </div>
      {action}
    </div>
  );
}

// Logo
function Logo({ size = 40, color = '#006948', text = '#171D19', withText = true, textColor }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: color, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M4 6.5a2 2 0 012-2h8l6 6v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-11z" fill="#fff" fillOpacity="0.95"/>
          <path d="M12 8v4l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {withText && (
        <div style={{
          fontSize: size * 0.5, fontWeight: 700, letterSpacing: -0.6,
          color: textColor || text, fontFamily: F,
        }}>Turnify</div>
      )}
    </div>
  );
}

// Bottom sheet container
function BottomSheet({ t, children, height, padding = 20, style }) {
  return (
    <div style={{
      background: t.surface,
      borderRadius: '28px 28px 0 0',
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      ...style,
    }}>
      <DragHandle t={t} />
      <div style={{ padding: `0 ${padding}px ${padding}px`, flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// Container that scrolls (page body)
function ScrollBody({ t, children, padding = '16px 16px 16px', gap = 16, style }) {
  return (
    <div style={{
      flex: 1, minHeight: 0, overflow: 'auto',
      padding, background: t.bg,
      display: 'flex', flexDirection: 'column', gap, ...style,
    }}>
      {children}
    </div>
  );
}

// Settings row
function SettingsRow({ t, icon, iconBg, iconColor, title, trailing, last, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${t.borderSoft}`,
    }}>
      {icon && <IconBox bg={iconBg || t.surfaceLow} color={iconColor || t.text} icon={icon} size={32} />}
      <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: danger ? t.danger : t.text }}>{title}</div>
      {trailing || <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2} />}
    </div>
  );
}

// Hero (login etc) — flat primary block
function Hero({ t, children, height = 220, style }) {
  return (
    <div style={{
      background: t.primary, color: dark_text_on_primary(t),
      padding: '20px 24px 36px', minHeight: height,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      ...style,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  Phone, TStatusBar, Header, Card, PrimaryBtn, OutlineBtn, DangerBtn, SmallPill,
  Input, Avatar, StatusBadge, Chip, SectionLabel, TabBar, DragHandle, KPI, Toggle,
  Icon, IconBox, FAB, EmptyState, Logo, BottomSheet, ScrollBody, SettingsRow, Hero,
  dark_text_on_primary,
});
