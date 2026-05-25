// Turnify — Attendance + Availability + GDPR (22-24)

// 22. STORICO PRESENZE
function S_Attendance({ t, dark }) {
  const days = [
    { d: 'Lun 20', date: 'Maggio', i: '09:02', o: '13:08', h: '4h 06m', ok: true },
    { d: 'Sab 18', date: 'Maggio', i: '17:00', o: '23:14', h: '6h 14m', ok: true },
    { d: 'Ven 17', date: 'Maggio', i: '12:55', o: '19:02', h: '6h 07m', ok: true },
    { d: 'Gio 16', date: 'Maggio', i: '07:00', o: '13:00', h: '6h 00m', ok: true },
    { d: 'Mer 15', date: 'Maggio', i: '—', o: '—', h: 'Ferie', ok: false, leave: true },
    { d: 'Mar 14', date: 'Maggio', i: '13:02', o: '19:05', h: '6h 03m', ok: true },
    { d: 'Lun 13', date: 'Maggio', i: '08:58', o: '13:00', h: '4h 02m', ok: true },
    { d: 'Sab 11', date: 'Maggio', i: '17:00', o: '23:00', h: '6h 00m', ok: true },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Storico presenze"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}/>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 12,
        }}>
          <Icon name="chev-l" size={18} color={t.text} strokeWidth={2}/>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Maggio 2026</div>
          <Icon name="chev-r" size={18} color={t.text} strokeWidth={2}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <Card t={t} padding={14}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.4 }}>GIORNI LAVORATI</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: -0.6, marginTop: 4 }}>18</div>
          </Card>
          <Card t={t} padding={14}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary, letterSpacing: 0.4 }}>ORE TOTALI</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: -0.6 }}>96</div>
              <div style={{ fontSize: 13, color: t.textSecondary }}>h 32m</div>
            </div>
          </Card>
        </div>
      </div>
      <ScrollBody t={t} padding="14px 16px" gap={6}>
        <SectionLabel t={t}>Registro giornaliero</SectionLabel>
        {days.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', background: t.surface,
            border: `1px solid ${t.border}`, borderRadius: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: d.leave ? t.warningBg : d.ok ? t.primaryLight : t.errorBg,
              color: d.leave ? t.warningText : d.ok ? t.primary : t.errorText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={d.leave ? 'palm' : 'check'} size={16} color={d.leave ? t.warningText : t.primary} strokeWidth={2.4}/>
            </div>
            <div style={{ flex: '0 0 70px' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text }}>{d.d}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
              <div style={{ fontSize: 13, color: d.ok ? t.text : t.textSecondary, fontWeight: 500 }}>{d.i}</div>
              <Icon name="arrow-r" size={10} color={t.textSecondary} strokeWidth={2}/>
              <div style={{ fontSize: 13, color: d.ok ? t.text : t.textSecondary, fontWeight: 500 }}>{d.o}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: d.leave ? t.warningText : t.text, letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums' }}>{d.h}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '14px 0 4px', fontSize: 12, color: t.textSecondary }}>
          Carica altri giorni…
        </div>
      </ScrollBody>
    </div>
  );
}

// 23. DISPONIBILITÀ
function S_Availability({ t, dark }) {
  const days = [
    { l: 'Lunedì', avail: true },
    { l: 'Martedì', avail: true },
    { l: 'Mercoledì', avail: true },
    { l: 'Giovedì', avail: false },
    { l: 'Venerdì', avail: true },
    { l: 'Sabato', avail: true, accent: '#B45309' },
    { l: 'Domenica', avail: false, accent: t.danger },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Disponibilità"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}/>
      <ScrollBody t={t} padding="18px 18px" gap={16}>
        <div style={{
          padding: '14px 16px', background: t.primaryLight,
          borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <IconBox size={36} radius={10} bg={t.primary} color={dark_text_on_primary(t)} icon="sparkle"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: t.successText }}>Indica i giorni in cui sei disponibile</div>
            <div style={{ fontSize: 12.5, color: t.successText, marginTop: 4, lineHeight: 1.4, opacity: 0.88 }}>
              Il manager userà queste preferenze per pianificare i tuoi turni settimanali.
            </div>
          </div>
        </div>

        <Card t={t} padding={0}>
          {days.map((d, i) => (
            <div key={i} style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < days.length - 1 ? `1px solid ${t.borderSoft}` : 'none',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: d.accent || t.text, flex: 1 }}>{d.l}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: d.avail ? t.primary : t.textSecondary }}>{d.avail ? 'Sì' : 'No'}</div>
              <Toggle t={t} on={d.avail}/>
            </div>
          ))}
        </Card>

        <SectionLabel t={t} style={{ marginTop: 4 }}>Note per il manager</SectionLabel>
        <div style={{
          border: `1px solid ${t.border}`, borderRadius: 12, padding: 14,
          minHeight: 70, fontSize: 14, color: t.textSecondary, lineHeight: 1.4,
        }}>
          Preferisco turni del mattino. Posso fare straordinari il venerdì.
        </div>

        <PrimaryBtn t={t}>Salva disponibilità</PrimaryBtn>
      </ScrollBody>
    </div>
  );
}

// 24. GDPR
function S_GDPR({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="I tuoi dati"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}/>
      <ScrollBody t={t} padding="22px 22px" gap={18}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: t.primaryLight, color: t.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="shield" size={36} color={t.primary} strokeWidth={1.8}/>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>I tuoi dati personali</div>
            <div style={{ fontSize: 13.5, color: t.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
              Ai sensi degli articoli 15, 17 e 20 del GDPR, hai il diritto di accedere ai tuoi dati, riceverli in formato strutturato e richiederne la cancellazione.
            </div>
          </div>
        </div>

        <Card t={t} padding={16} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <IconBox size={40} radius={12} bg={t.kpiBlueBg} color={t.kpiBlue} icon="download"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Esporta i miei dati</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 3, lineHeight: 1.45 }}>Riceverai un file JSON con turni, presenze, ferie e dati account.</div>
            <div style={{ marginTop: 12 }}>
              <div style={{
                height: 38, padding: '0 14px', borderRadius: 10,
                background: t.kpiBlue, color: '#FFF',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 600,
              }}>
                <Icon name="download" size={15} color="#FFF" strokeWidth={2.2}/> Esporta in JSON
              </div>
            </div>
          </div>
        </Card>

        <Card t={t} padding={16} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderColor: dark ? '#5A2A2A' : '#FFCDC9' }}>
          <IconBox size={40} radius={12} bg={t.errorBg} color={t.errorText} icon="trash"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Elimina il mio account</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 3, lineHeight: 1.45 }}>L'azione è irreversibile. Tutti i tuoi dati saranno cancellati entro 30 giorni come da policy interna.</div>
            <div style={{ marginTop: 12 }}>
              <div style={{
                height: 38, padding: '0 14px', borderRadius: 10,
                border: `1px solid ${t.danger}`, color: t.danger,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 600,
              }}>
                <Icon name="trash" size={15} color={t.danger} strokeWidth={2.2}/> Richiedi cancellazione
              </div>
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center', fontSize: 12, color: t.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
          Per richieste o dubbi:<br/><span style={{ color: t.primary, fontWeight: 600 }}>privacy@turnify.it</span>
        </div>
      </ScrollBody>
    </div>
  );
}

Object.assign(window, { S_Attendance, S_Availability, S_GDPR });
