// Turnify — Reports + tools screens (20-24)

// 20. REPORT (export)
function S_Report({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Report"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}/>
      <ScrollBody t={t} padding="18px 18px" gap={16}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', background: t.primaryLight, color: t.successText,
          borderRadius: 12, fontSize: 13,
        }}>
          <Icon name="check" size={18} color={t.successText} strokeWidth={2.4}/>
          <div style={{ flex: 1 }}>Export di aprile pronto: <span style={{ fontWeight: 700 }}>turnify-apr-2026.csv</span></div>
          <Icon name="x" size={14} color={t.successText} strokeWidth={2}/>
        </div>

        <SectionLabel t={t}>Periodo</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input t={t} label="Dal" value="1 mag 2026" leading={<Icon name="cal" size={16} color={t.textSecondary}/>}/>
          <Input t={t} label="Al" value="31 mag 2026" leading={<Icon name="cal" size={16} color={t.textSecondary}/>}/>
        </div>

        <SectionLabel t={t} style={{ marginTop: 6 }}>Esporta</SectionLabel>
        <Card t={t} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconBox size={44} radius={12} bg={t.primaryLight} color={t.primary} icon="clock"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>Ore pianificate</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2, lineHeight: 1.4 }}>Tutti i turni assegnati nel periodo selezionato.</div>
          </div>
          <IconBox size={36} radius={10} bg={t.primary} color={dark_text_on_primary(t)} icon="download"/>
        </Card>
        <Card t={t} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconBox size={44} radius={12} bg={t.kpiBlueBg} color={t.kpiBlue} icon="doc"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>Presenze effettive</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2, lineHeight: 1.4 }}>Timbrature entrata e uscita con ore lavorate.</div>
          </div>
          <IconBox size={36} radius={10} bg={t.kpiBlue} color="#FFF" icon="download"/>
        </Card>
        <Card t={t} padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconBox size={44} radius={12} bg={t.warningBg} color={t.warningText} icon="palm"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>Ferie e permessi</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2, lineHeight: 1.4 }}>Storico assenze approvate per dipendente.</div>
          </div>
          <IconBox size={36} radius={10} bg={t.kpiAmber} color="#FFF" icon="download"/>
        </Card>
      </ScrollBody>
    </div>
  );
}

// 21. REPORT ORE DIPENDENTI
function S_HoursReport({ t, dark }) {
  const people = [
    { i: 'MB', n: 'Marco Bianchi', h: 168, plan: 168, expanded: true },
    { i: 'EL', n: 'Elena Lopez', h: 92, plan: 96 },
    { i: 'GR', n: 'Giulia Rossi', h: 164, plan: 168 },
    { i: 'DV', n: 'Davide Verdi', h: 172, plan: 168 },
    { i: 'SC', n: 'Sara Conti', h: 84, plan: 96 },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Report ore"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}
        trailing={<IconBox size={36} radius={10} bg={t.primaryLight} color={t.primary} icon="download"/>}/>
      <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Input t={t} label="Dal" value="1 mag" leading={<Icon name="cal" size={14} color={t.textSecondary}/>}/>
          <Input t={t} label="Al" value="31 mag" leading={<Icon name="cal" size={14} color={t.textSecondary}/>}/>
          <Input t={t} label="Raggruppa" value="Mese" trailing={<Icon name="chev-d" size={14} color={t.textSecondary}/>}/>
        </div>
      </div>
      <ScrollBody t={t} padding="4px 16px 16px" gap={10}>
        <Card t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.primaryLight, borderColor: 'transparent' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.successText, letterSpacing: 0.4 }}>TOTALE TEAM</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: t.successText, letterSpacing: -0.6 }}>680</div>
              <div style={{ fontSize: 12.5, color: t.successText, opacity: 0.85 }}>ore · 5 dipendenti · mag '26</div>
            </div>
          </div>
        </Card>
        {people.map((p, i) => (
          <Card key={i} t={t} padding={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
              <Avatar t={t} initials={p.i} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{p.n}</div>
                <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>su {p.plan} ore previste</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>{p.h}<span style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, marginLeft: 2 }}>h</span></div>
                <div style={{ fontSize: 10, fontWeight: 600, color: p.h >= p.plan ? t.primary : t.warningText, marginTop: 2 }}>{p.h >= p.plan ? '+' : ''}{p.h - p.plan}h</div>
              </div>
              <Icon name={p.expanded ? 'chev-d' : 'chev-r'} size={18} color={t.textSecondary} strokeWidth={2}/>
            </div>
            {p.expanded && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${t.borderSoft}` }}>
                {[
                  { w: 'Sett. 18', h: 42 },
                  { w: 'Sett. 19', h: 40 },
                  { w: 'Sett. 20', h: 44 },
                  { w: 'Sett. 21', h: 42 },
                ].map((w, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', borderBottom: j < 3 ? `1px solid ${t.borderSoft}` : 'none' }}>
                    <div style={{ fontSize: 13, color: t.textSecondary }}>{w.w}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80, height: 4, borderRadius: 2, background: t.surfaceLow, overflow: 'hidden' }}>
                        <div style={{ width: `${(w.h / 48) * 100}%`, height: '100%', background: t.primary }}/>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text, minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w.h}h</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </ScrollBody>
    </div>
  );
}

Object.assign(window, { S_Report, S_HoursReport });
