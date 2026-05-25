// Turnify — Team + Business + Hours admin screens

// 15. LISTA DIPENDENTI
function S_Team({ t, dark }) {
  const people = [
    { i: 'MB', n: 'Marco Bianchi', role: 'Barista', contract: 'Full-time', active: true, business: 'Nord Café Centro' },
    { i: 'EL', n: 'Elena Lopez', role: 'Cameriera', contract: 'Part-time', active: true, business: 'Nord Café Centro' },
    { i: 'GR', n: 'Giulia Rossi', role: 'Barista', contract: 'Full-time', active: true, business: 'Nord Café Stazione' },
    { i: 'DV', n: 'Davide Verdi', role: 'Cuoco', contract: 'Full-time', active: true, business: 'Nord Café Centro' },
    { i: 'SC', n: 'Sara Conti', role: 'Cassiera', contract: 'Part-time', active: true, business: 'Nord Café Stazione' },
    { i: 'LF', n: 'Luca Ferrari', role: 'Aiuto cuoco', contract: 'Part-time', active: false, business: 'Nord Café Centro' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Team"/>
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input t={t} placeholder="Cerca per nome o ruolo" leading={<Icon name="search" size={18} color={t.textSecondary}/>}/>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip t={t} label="Tutte le attività" active />
          <Chip t={t} label="Nord Café Centro" />
          <Chip t={t} label="Nord Café Stazione" />
        </div>
      </div>
      <ScrollBody t={t} padding="12px 16px" gap={10}>
        {people.map((p, i) => (
          <Card key={i} t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: p.active ? 1 : 0.55 }}>
            <Avatar t={t} initials={p.i} size={44}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>{p.n}</div>
                <SmallPill bg={t.surfaceLow} color={t.textSecondary} style={{ height: 20, fontSize: 10, padding: '0 8px' }}>{p.contract}</SmallPill>
              </div>
              <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2 }}>{p.role} · {p.business}</div>
            </div>
            <StatusBadge t={t} kind={p.active ? 'active' : 'inactive'} dot label={p.active ? 'Attivo' : 'Inattivo'}/>
            <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2}/>
          </Card>
        ))}
        <div style={{
          border: `1.5px dashed ${t.border}`, borderRadius: 16,
          padding: 16, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: t.primary, fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="plus" size={16} color={t.primary} strokeWidth={2.4}/> Aggiungi dipendente
        </div>
      </ScrollBody>
    </div>
  );
}

// 16. DETTAGLIO / CREAZIONE DIPENDENTE
function S_TeamMember({ t, dark, edit = true }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title={edit ? 'Marco Bianchi' : 'Nuovo dipendente'}
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}
        trailing={edit && <IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="more"/>}
      />
      <ScrollBody t={t} padding="18px 18px" gap={14}>
        <SectionLabel t={t}>Dati personali</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input t={t} label="Nome" value="Marco"/>
          <Input t={t} label="Cognome" value="Bianchi"/>
        </div>
        <Input t={t} label="Username" value="m.bianchi" focused leading={<Icon name="user" size={18} color={t.primary}/>} helper="Identificatore univoco per il login"/>

        <SectionLabel t={t} style={{ marginTop: 8 }}>Contatti</SectionLabel>
        <Input t={t} label="Email (opzionale)" value="marco.b@nordcafe.it" leading={<Icon name="mail" size={18} color={t.textSecondary}/>}/>
        <Input t={t} label="Telefono (opzionale)" value="+39 348 12 34 567" leading={<Icon name="phone" size={18} color={t.textSecondary}/>}/>

        <SectionLabel t={t} style={{ marginTop: 8 }}>Lavoro</SectionLabel>
        <Input t={t} label="Ruolo in azienda" value="Barista" leading={<Icon name="briefcase" size={18} color={t.textSecondary}/>}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
          <Input t={t} label="Tipo contratto" value="Full-time" trailing={<Icon name="chev-d" size={16} color={t.textSecondary}/>}/>
          <Input t={t} label="Ore / sett." value="40" leading={<Icon name="clock" size={16} color={t.textSecondary}/>}/>
        </div>

        <SectionLabel t={t} style={{ marginTop: 8 }}>Attività e account</SectionLabel>
        <Input t={t} label="Attività di riferimento" value="Nord Café Centro" leading={<Icon name="building" size={18} color={t.textSecondary}/>} trailing={<Icon name="chev-d" size={16} color={t.textSecondary}/>}/>
        <Input t={t} label="Ruolo account" value="Dipendente" trailing={<Icon name="chev-d" size={16} color={t.textSecondary}/>}/>

        {edit && (
          <React.Fragment>
            <SectionLabel t={t} style={{ marginTop: 8 }}>Saldo ferie</SectionLabel>
            <Card t={t} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <IconBox size={40} radius={12} bg={t.primaryLight} color={t.primary} icon="palm"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: t.textSecondary }}>Giorni assegnati</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>26</div>
                    <div style={{ fontSize: 12, color: t.textSecondary }}>· 8 usati · 18 rimanenti</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: t.surfaceLow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="minus" size={14} color={t.text} strokeWidth={2.2}/>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={14} color={dark_text_on_primary(t)} strokeWidth={2.2}/>
                  </div>
                </div>
              </div>
            </Card>
          </React.Fragment>
        )}

        {!edit && (
          <React.Fragment>
            <SectionLabel t={t} style={{ marginTop: 8 }}>Sicurezza</SectionLabel>
            <Input t={t} label="Password temporanea" value="••••••••" leading={<Icon name="lock" size={18} color={t.textSecondary}/>} helper="Sarà richiesta al primo accesso"/>
          </React.Fragment>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {edit && <DangerBtn t={t} full={false} style={{ flex: 1 }}>Disattiva</DangerBtn>}
          <PrimaryBtn t={t} style={{ flex: edit ? 2 : 1 }}>Salva</PrimaryBtn>
        </div>
      </ScrollBody>
    </div>
  );
}

// 17. LISTA ATTIVITÀ
function S_Businesses({ t, dark }) {
  const bs = [
    { name: 'Nord Café Centro', type: 'Bar / Caffetteria', addr: 'Via Verdi 14, Milano', active: true, accent: t.primary },
    { name: 'Nord Café Stazione', type: 'Bar / Caffetteria', addr: 'Piazzale Cadorna 2, Milano', active: true, accent: t.kpiBlue },
    { name: 'Nord Café Navigli', type: 'Bar / Bistrot', addr: 'Ripa di Porta Ticinese 35, Milano', active: true, accent: t.kpiAmber },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Attività" subtitle="Le mie sedi"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}
      />
      <ScrollBody t={t} padding="16px 16px" gap={10}>
        {bs.map((b, i) => (
          <Card key={i} t={t} padding={0} accent={b.accent}>
            <div style={{ padding: '14px 16px 14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text, flex: 1 }}>{b.name}</div>
                <StatusBadge t={t} kind="active" dot label="Attiva"/>
              </div>
              <div style={{ fontSize: 13, color: t.textSecondary }}>{b.type}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12.5, color: t.textSecondary }}>
                <Icon name="pin" size={13} color={t.textSecondary} strokeWidth={1.8}/> {b.addr}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <SmallPill bg={t.surfaceLow} color={t.text} style={{ flex: 1, justifyContent: 'center', height: 36 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="pencil" size={14} color={t.text} strokeWidth={2}/> Modifica</span>
                </SmallPill>
                <SmallPill bg={t.primaryLight} color={t.primary} style={{ flex: 1, justifyContent: 'center', height: 36 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={14} color={t.primary} strokeWidth={2}/> Orari</span>
                </SmallPill>
              </div>
            </div>
          </Card>
        ))}
        <div style={{
          border: `1.5px dashed ${t.border}`, borderRadius: 16,
          padding: 16, marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: t.primary, fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="plus" size={16} color={t.primary} strokeWidth={2.4}/> Aggiungi attività
        </div>
      </ScrollBody>
    </div>
  );
}

// 18. DETTAGLIO ATTIVITÀ
function S_BusinessDetail({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Nord Café Centro"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}
      />
      <ScrollBody t={t} padding="18px 18px" gap={14}>
        <SectionLabel t={t}>Informazioni</SectionLabel>
        <Input t={t} label="Nome attività" value="Nord Café Centro" focused leading={<Icon name="building" size={18} color={t.primary}/>}/>
        <Input t={t} label="Tipo attività" value="Bar / Caffetteria" leading={<Icon name="briefcase" size={18} color={t.textSecondary}/>} trailing={<Icon name="chev-d" size={16} color={t.textSecondary}/>}/>
        <Input t={t} label="Indirizzo" value="Via Verdi 14, 20121 Milano" leading={<Icon name="pin" size={18} color={t.textSecondary}/>}/>
        <Input t={t} label="Telefono" value="+39 02 1234 5678" leading={<Icon name="phone" size={18} color={t.textSecondary}/>}/>

        <SectionLabel t={t} style={{ marginTop: 8 }}>Operativo</SectionLabel>
        <Card t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconBox size={40} radius={12} bg={t.primaryLight} color={t.primary} icon="users"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>4 dipendenti assegnati</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>Marco, Elena, Davide, Sara</div>
          </div>
          <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2}/>
        </Card>
        <Card t={t} padding={14} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconBox size={40} radius={12} bg={t.kpiBlueBg} color={t.kpiBlue} icon="clock"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Orari di apertura</div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 2 }}>Lun–Sab 07:00–23:00 · Dom chiuso</div>
          </div>
          <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2}/>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <DangerBtn t={t} full={false} style={{ flex: 1 }}>Disattiva</DangerBtn>
          <PrimaryBtn t={t} style={{ flex: 2 }}>Salva</PrimaryBtn>
        </div>
      </ScrollBody>
    </div>
  );
}

// 19. ORARI DI APERTURA
function S_Hours({ t, dark }) {
  const days = [
    { l: 'Lunedì', open: true, from: '07:00', to: '23:00' },
    { l: 'Martedì', open: true, from: '07:00', to: '23:00' },
    { l: 'Mercoledì', open: true, from: '07:00', to: '23:00' },
    { l: 'Giovedì', open: true, from: '07:00', to: '23:00' },
    { l: 'Venerdì', open: true, from: '07:00', to: '24:00' },
    { l: 'Sabato', open: true, from: '08:00', to: '24:00', accent: '#B45309' },
    { l: 'Domenica', open: false, accent: t.danger },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Orari di apertura" subtitle="Nord Café Centro"
        leading={<IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="chev-l"/>}
      />
      <ScrollBody t={t} padding="18px 18px" gap={16}>
        <Card t={t} padding={0}>
          {days.map((d, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderBottom: i < days.length - 1 ? `1px solid ${t.borderSoft}` : 'none',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: '0 0 90px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: d.accent || t.text }}>{d.l}</div>
                {!d.open && <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>Chiuso</div>}
              </div>
              {d.open ? (
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 10,
                    border: `1px solid ${t.border}`, padding: '0 10px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, color: t.text, fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: t.textSecondary, letterSpacing: 0.4 }}>DAL</span> {d.from}
                  </div>
                  <div style={{
                    flex: 1, height: 36, borderRadius: 10,
                    border: `1px solid ${t.border}`, padding: '0 10px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, color: t.text, fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: t.textSecondary, letterSpacing: 0.4 }}>AL</span> {d.to}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1 }}/>
              )}
              <Toggle t={t} on={d.open}/>
            </div>
          ))}
        </Card>
        <PrimaryBtn t={t}>Salva orari</PrimaryBtn>
      </ScrollBody>
    </div>
  );
}

Object.assign(window, { S_Team, S_TeamMember, S_Businesses, S_BusinessDetail, S_Hours });
