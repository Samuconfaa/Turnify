// Turnify — Dashboard screens (admin + employee)

// 6. DASHBOARD ADMIN
function S_DashAdmin({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 20px 16px',
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4, lineHeight: 1.2 }}>Buongiorno, Laura</div>
            <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2 }}>Settimana del 18 – 24 maggio</div>
          </div>
          <div style={{ position: 'relative' }}>
            <IconBox size={40} radius={12} bg={t.surfaceLow} color={t.text} icon="bell" />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: t.danger, border: `2px solid ${t.surface}` }}/>
          </div>
        </div>
      </div>
      <ScrollBody t={t} padding="20px 16px 16px" gap={20}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KPI t={t} dark={dark} label="In turno oggi" value="8" bg={t.primary} fg={dark_text_on_primary(t)} icon={<Icon name="users" size={16} color={dark_text_on_primary(t)} strokeWidth={2.2}/>}/>
          <KPI t={t} dark={dark} label="Turni questa settimana" value="42" bg={t.kpiAmber} fg="#FFF" icon={<Icon name="cal" size={16} color="#FFF" strokeWidth={2.2}/>}/>
          <KPI t={t} dark={dark} label="Ferie in attesa" value="3" bg={t.danger} fg="#FFF" icon={<Icon name="palm" size={16} color="#FFF" strokeWidth={2.2}/>}/>
          <KPI t={t} dark={dark} label="Ore totali" value="320" bg={t.kpiBlue} fg="#FFF" icon={<Icon name="clock" size={16} color="#FFF" strokeWidth={2.2}/>}/>
        </div>

        <div>
          <SectionLabel t={t} action="Vedi tutti">Turni oggi</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { i: 'MB', n: 'Marco Bianchi', t: '09:00 – 13:00', s: 'today' },
              { i: 'EL', n: 'Elena Lopez', t: '09:00 – 17:00', s: 'today' },
              { i: 'GR', n: 'Giulia Rossi', t: '13:00 – 19:00', s: 'approved' },
              { i: 'DV', n: 'Davide Verdi', t: '17:00 – 23:00', s: 'approved' },
            ].map((x, i) => (
              <Card key={i} t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar t={t} initials={x.i} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{x.n}</div>
                  <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>{x.t}</div>
                </div>
                <StatusBadge t={t} kind={x.s} />
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel t={t} action="Tutte (3)">Ferie in attesa</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { i: 'EL', n: 'Elena Lopez', d: '15 – 20 lug', g: '5 giorni' },
              { i: 'DV', n: 'Davide Verdi', d: '22 – 23 mag', g: '2 giorni' },
            ].map((x, i) => (
              <Card key={i} t={t} padding={14}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar t={t} initials={x.i} size={40} bg={t.warningBg} color={t.warningText}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{x.n}</div>
                    <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>Ferie · {x.d} · {x.g}</div>
                  </div>
                  <StatusBadge t={t} kind="pending" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 10,
                    background: t.primary, color: dark_text_on_primary(t),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    <Icon name="check" size={15} color={dark_text_on_primary(t)} strokeWidth={2.4}/> Approva
                  </div>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 10,
                    border: `1px solid ${t.danger}`, color: t.danger,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    <Icon name="x" size={15} color={t.danger} strokeWidth={2.4}/> Rifiuta
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel t={t}>Copertura settimana</SectionLabel>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { d: 'Lun', n: 18, c: 'ok' },
              { d: 'Mar', n: 19, c: 'ok' },
              { d: 'Mer', n: 20, c: 'part' },
              { d: 'Gio', n: 21, c: 'ok' },
              { d: 'Ven', n: 22, c: 'ok' },
              { d: 'Sab', n: 23, c: 'empty' },
              { d: 'Dom', n: 24, c: 'part' },
            ].map((x, i) => {
              const bgs = { ok: t.successBg, part: t.warningBg, empty: t.errorBg };
              const fgs = { ok: t.successText, part: t.warningText, empty: t.errorText };
              return (
                <div key={i} style={{
                  flex: '0 0 64px', height: 84, borderRadius: 14,
                  background: bgs[x.c], color: fgs[x.c],
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: 0.3 }}>{x.d}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{x.n}</div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }}/>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollBody>
    </div>
  );
}

// 7. DASHBOARD DIPENDENTE
function S_DashEmployee({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 20px 16px',
        background: t.surface, borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>Ciao, Marco 👋</div>
          <div style={{ position: 'relative' }}>
            <IconBox size={40} radius={12} bg={t.surfaceLow} color={t.text} icon="bell" />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: t.danger, border: `2px solid ${t.surface}` }}/>
          </div>
        </div>
      </div>
      <ScrollBody t={t} padding="20px 16px 16px" gap={20}>
        {/* Hero next shift */}
        <div style={{
          background: t.primary, color: dark_text_on_primary(t),
          borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, opacity: 0.9, textTransform: 'uppercase' }}>Prossimo turno</div>
            <StatusBadge t={t} kind="today" label="Oggi" />
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1 }}>09:00 – 13:00</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.92 }}>Lunedì 20 maggio</div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }}/>
            <div style={{ fontSize: 13, opacity: 0.92 }}>4 ore</div>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }}/>
            <div style={{ fontSize: 13, opacity: 0.92 }}>Nord Café Centro</div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <SectionLabel t={t}>Azioni rapide</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { icon: 'palm', label: 'Richiedi\nferie', bg: dark ? '#3A2718' : '#FFE8DA', fg: dark ? '#FBBA8C' : '#9A3F0F' },
              { icon: 'clock', label: 'Timbratura', bg: t.primaryLight, fg: t.primary },
              { icon: 'check', label: 'Disponibi-\nlità', bg: dark ? '#0F2A2C' : '#D4F1F4', fg: dark ? '#6EE0E0' : '#0E7C7B' },
            ].map((x, i) => (
              <div key={i} style={{
                background: x.bg, borderRadius: 14, padding: '14px 12px',
                display: 'flex', flexDirection: 'column', gap: 10,
                border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`,
              }}>
                <Icon name={x.icon} size={22} color={x.fg} strokeWidth={2}/>
                <div style={{ fontSize: 12, fontWeight: 600, color: x.fg, whiteSpace: 'pre-line', lineHeight: 1.2 }}>{x.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timbratura oggi */}
        <div>
          <SectionLabel t={t}>Timbratura oggi</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Card t={t} padding={14} style={{ background: t.successBg, borderColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name="arrow-r" size={14} color={t.successText} strokeWidth={2.2}/>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.successText, letterSpacing: 0.4 }}>ENTRATA</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.successText, letterSpacing: -0.4 }}>09:02</div>
            </Card>
            <Card t={t} padding={14} style={{ background: t.warningBg, borderColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name="arrow-l" size={14} color={t.warningText} strokeWidth={2.2}/>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.warningText, letterSpacing: 0.4 }}>USCITA</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.warningText, letterSpacing: -0.4 }}>—</div>
            </Card>
          </div>
        </div>

        {/* Ore */}
        <div>
          <SectionLabel t={t}>Riepilogo ore</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Card t={t} padding={14}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.4 }}>SETTIMANALI</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: -0.6 }}>32</div>
                <div style={{ fontSize: 14, color: t.textSecondary }}>/ 40h</div>
              </div>
              <div style={{ height: 4, background: t.surfaceLow, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', background: t.primary }}/>
              </div>
            </Card>
            <Card t={t} padding={14}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.4 }}>MENSILI</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: -0.6 }}>128</div>
                <div style={{ fontSize: 14, color: t.textSecondary }}>/ 160h</div>
              </div>
              <div style={{ height: 4, background: t.surfaceLow, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '100%', background: t.primary }}/>
              </div>
            </Card>
          </div>
        </div>

        {/* Ferie */}
        <Card t={t} padding={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <IconBox size={44} radius={12} bg={t.primaryLight} color={t.primary} icon="palm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Ferie rimanenti</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: t.primary, letterSpacing: -0.4 }}>18</div>
                <div style={{ fontSize: 12, color: t.textSecondary }}>su 26 giorni · 8 usati</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: t.primary, fontWeight: 600 }}>Vedi tutte ›</div>
          </div>
        </Card>

        <div style={{ fontSize: 13, color: t.textSecondary, textAlign: 'center', padding: '0 0 8px' }}>
          <span style={{ color: t.primary, fontWeight: 600 }}>Storico presenze →</span>
        </div>
      </ScrollBody>
    </div>
  );
}

Object.assign(window, { S_DashAdmin, S_DashEmployee });
