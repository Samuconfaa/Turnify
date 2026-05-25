// Turnify — Leave + Notifications + Profile

// 12. LISTA FERIE (admin view)
function S_LeaveList({ t, dark, role = 'admin' }) {
  const items = [
    { i: 'EL', n: 'Elena Lopez', type: 'Ferie', range: '15 – 20 lug', days: 5, s: 'pending', accent: t.kpiAmber, note: 'Matrimonio sorella' },
    { i: 'DV', n: 'Davide Verdi', type: 'Permesso', range: '22 mag', days: 1, s: 'pending', accent: t.kpiAmber },
    { i: 'GR', n: 'Giulia Rossi', type: 'Malattia', range: '10 – 12 mag', days: 3, s: 'approved', accent: t.primary },
    { i: 'MB', n: 'Marco Bianchi', type: 'Ferie', range: '1 – 7 ago', days: 7, s: 'approved', accent: t.primary },
    { i: 'SC', n: 'Sara Conti', type: 'Permesso', range: '8 mag', days: 1, s: 'rejected', accent: t.danger },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Ferie" trailing={role === 'employee' ?
        <div style={{ height: 36, padding: '0 14px', borderRadius: 10, background: t.primary, color: dark_text_on_primary(t), display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <Icon name="plus" size={16} color={dark_text_on_primary(t)} strokeWidth={2.2}/> Richiedi
        </div>
        : null}/>
      <ScrollBody t={t} padding="14px 16px" gap={10}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip t={t} label="Tutte" active />
          <Chip t={t} label="In attesa · 2" />
          <Chip t={t} label="Approvate" />
          <Chip t={t} label="Rifiutate" />
        </div>
        {items.map((x, i) => (
          <Card key={i} t={t} padding={0} accent={x.accent}>
            <div style={{ padding: '14px 16px 14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: x.s === 'pending' && role === 'admin' ? 12 : 0 }}>
                {role === 'admin' && <Avatar t={t} initials={x.i} size={40}/>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {role === 'admin' && <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{x.n}</div>}
                  <div style={{ fontSize: 13, color: role === 'admin' ? t.textSecondary : t.text, fontWeight: role === 'admin' ? 400 : 600, marginTop: role === 'admin' ? 1 : 0 }}>
                    {x.type} · {x.range}
                  </div>
                  <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 4 }}>{x.days} {x.days === 1 ? 'giorno' : 'giorni'} lavorativi</div>
                </div>
                <StatusBadge t={t} kind={x.s}/>
              </div>
              {x.note && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: t.warningBg, color: t.warningText, borderRadius: 10, fontSize: 12, fontStyle: 'italic' }}>
                  "{x.note}"
                </div>
              )}
              {x.s === 'pending' && role === 'admin' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <div style={{
                    flex: 1, height: 32, borderRadius: 10, background: t.primary, color: dark_text_on_primary(t),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                  }}>
                    <Icon name="check" size={14} color={dark_text_on_primary(t)} strokeWidth={2.4}/> Approva
                  </div>
                  <div style={{
                    flex: 1, height: 32, borderRadius: 10, border: `1px solid ${t.danger}`, color: t.danger,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                  }}>
                    <Icon name="x" size={14} color={t.danger} strokeWidth={2.4}/> Rifiuta
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </ScrollBody>
    </div>
  );
}

// 12b. NUOVA RICHIESTA FERIE (bottom sheet)
function S_LeaveNew({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.4)' }}>
      <div style={{ flex: 1 }}/>
      <div style={{ background: t.surface, borderRadius: '28px 28px 0 0', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <DragHandle t={t}/>
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: -0.3 }}>Nuova richiesta</div>
          <IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="x"/>
        </div>
        <div style={{ padding: '12px 20px 20px', overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionLabel t={t} style={{ marginTop: 2, marginBottom: 4 }}>Tipo di assenza</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { l: 'Ferie', icon: 'palm', active: true },
              { l: 'Permesso', icon: 'clock' },
              { l: 'Malattia', icon: 'flag' },
            ].map((x, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 12,
                background: x.active ? t.primaryLight : t.surface,
                border: x.active ? `2px solid ${t.primary}` : `1px solid ${t.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <Icon name={x.icon} size={20} color={x.active ? t.primary : t.textSecondary} strokeWidth={2}/>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: x.active ? t.primary : t.text }}>{x.l}</div>
              </div>
            ))}
          </div>

          <SectionLabel t={t} style={{ marginTop: 6, marginBottom: 4 }}>Periodo</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input t={t} label="Dal" value="15 lug 2026" focused leading={<Icon name="cal" size={16} color={t.primary}/>}/>
            <Input t={t} label="Al" value="20 lug 2026" leading={<Icon name="cal" size={16} color={t.textSecondary}/>}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: t.primaryLight, borderRadius: 12 }}>
            <Icon name="check" size={18} color={t.primary} strokeWidth={2.4}/>
            <div style={{ flex: 1, fontSize: 13, color: t.successText, fontWeight: 500 }}>
              <span style={{ fontWeight: 700 }}>5 giorni</span> lavorativi selezionati
            </div>
            <SmallPill bg={t.primary} color={dark_text_on_primary(t)} style={{ height: 24, fontSize: 11 }}>15 – 20 lug</SmallPill>
          </div>

          <SectionLabel t={t} style={{ marginTop: 6, marginBottom: 4 }}>Nota (opzionale)</SectionLabel>
          <div style={{
            border: `1px solid ${t.border}`, borderRadius: 12, padding: 14,
            minHeight: 80, fontSize: 14, color: t.textSecondary, lineHeight: 1.4,
          }}>
            Matrimonio della sorella, vacanza già pianificata.
          </div>
        </div>
        <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${t.borderSoft}` }}>
          <PrimaryBtn t={t}>Invia richiesta</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// 13. NOTIFICHE
function S_Notifs({ t, dark }) {
  const items = [
    { icon: 'check', bg: t.primaryLight, color: t.primary, title: 'Turno approvato', body: 'Il tuo turno di Mer 22 maggio 09:00–13:00 è stato confermato.', when: '5 min fa', unread: true },
    { icon: 'palm', bg: t.warningBg, color: t.warningText, title: 'Nuova richiesta ferie', body: 'Elena Lopez ha richiesto ferie dal 15 al 20 luglio (5 giorni).', when: '2 ore fa', unread: true },
    { icon: 'swap', bg: dark ? '#2A1F30' : '#EEE5F7', color: dark ? '#C49BFF' : '#6D28D9', title: 'Proposta di scambio', body: 'Marco vuole scambiare il turno di Mer 22 con il tuo di Ven 24.', when: '4 ore fa', unread: true },
    { icon: 'bell', bg: t.kpiBlueBg, color: t.kpiBlue, title: 'Promemoria turno', body: 'Domani inizi alle 09:00 a Nord Café Centro.', when: 'ieri' },
    { icon: 'x', bg: t.errorBg, color: t.errorText, title: 'Permesso rifiutato', body: 'La richiesta di permesso dell\'8 maggio non è stata approvata.', when: '3 giorni fa' },
    { icon: 'doc', bg: t.surfaceLow, color: t.textSecondary, title: 'Report ore pronto', body: 'Il report ore di aprile 2026 è disponibile in Report e statistiche.', when: '1 sett. fa' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Notifiche" trailing={
        <div style={{ fontSize: 12, color: t.primary, fontWeight: 600 }}>Segna lette</div>
      }/>
      <div style={{ padding: '14px 16px 0' }}>
        <SmallPill bg={t.primary} color={dark_text_on_primary(t)} style={{ height: 26 }}>3 non lette</SmallPill>
      </div>
      <ScrollBody t={t} padding="12px 16px" gap={8}>
        {items.map((x, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: 14, borderRadius: 14,
            background: x.unread ? t.surfaceLow : t.surface,
            border: `1px solid ${x.unread ? t.borderSoft : t.border}`,
            position: 'relative',
          }}>
            <IconBox size={40} radius={12} bg={x.bg} color={x.color} icon={x.icon}/>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{x.title}</div>
              <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 3, lineHeight: 1.4 }}>{x.body}</div>
              <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 6, opacity: 0.7 }}>{x.when}</div>
            </div>
            {x.unread && (
              <div style={{ position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: '50%', background: t.primary }}/>
            )}
          </div>
        ))}
      </ScrollBody>
    </div>
  );
}

// 14. PROFILO
function S_Profile({ t, dark, role = 'admin' }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: t.bg }}>
      {/* Hero — only screen with subtle gradient */}
      <div style={{
        background: `linear-gradient(180deg, ${t.primary} 0%, ${dark ? '#3A8A6E' : '#006A63'} 100%)`,
        padding: '20px 24px 70px',
        color: dark_text_on_primary(t),
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.8, opacity: 0.85, textTransform: 'uppercase' }}>Profilo</div>
          <IconBox size={36} radius={10} bg="rgba(255,255,255,0.18)" color={dark_text_on_primary(t)} icon="pencil"/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Avatar t={t} initials="LM" size={88} bg="rgba(255,255,255,0.95)" color={t.primary} ring="rgba(255,255,255,0.6)"/>
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14,
              background: t.surface, color: t.primary, border: `2px solid ${t.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="camera" size={14} color={t.primary} strokeWidth={2}/></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>Laura Marini</div>
            <div style={{ fontSize: 13, opacity: 0.88, marginTop: 2 }}>laura@nordcafe.it</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 8, padding: '4px 10px', borderRadius: 10,
              background: 'rgba(255,255,255,0.22)',
              fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
            }}>
              <Icon name="briefcase" size={12} color={dark_text_on_primary(t)} strokeWidth={2.2}/>
              {role === 'admin' ? 'Admin' : 'Dipendente'}
            </div>
          </div>
        </div>
      </div>

      {/* Settings card overlay */}
      <div style={{
        flex: 1, background: t.surface,
        borderRadius: '24px 24px 0 0',
        marginTop: -28,
        padding: '14px 20px 16px',
        overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {role === 'admin' ? (
          <React.Fragment>
            <SectionLabel t={t} style={{ marginTop: 8, marginBottom: 0 }}>Gestione</SectionLabel>
            <div style={{ background: t.surface }}>
              <SettingsRow t={t} icon="building" iconBg={t.primaryLight} iconColor={t.primary} title="Le mie attività" />
              <SettingsRow t={t} icon="clock" iconBg={t.kpiBlueBg} iconColor={t.kpiBlue} title="Orari di apertura" />
              <SettingsRow t={t} icon="users" iconBg={t.warningBg} iconColor={t.warningText} title="Gestisci team" />
              <SettingsRow t={t} icon="swap" iconBg={dark ? '#2A1F30' : '#EEE5F7'} iconColor={dark ? '#C49BFF' : '#6D28D9'} title="Scambi turno" />
              <SettingsRow t={t} icon="bar" iconBg={t.kpiDangerBg} iconColor={t.danger} title="Report ore dipendenti" />
              <SettingsRow t={t} icon="doc" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Report e statistiche" last/>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <SectionLabel t={t} style={{ marginTop: 8, marginBottom: 0 }}>Lavoro</SectionLabel>
            <div>
              <SettingsRow t={t} icon="swap" iconBg={dark ? '#2A1F30' : '#EEE5F7'} iconColor={dark ? '#C49BFF' : '#6D28D9'} title="Scambi turno" />
              <SettingsRow t={t} icon="check" iconBg={t.primaryLight} iconColor={t.primary} title="Disponibilità" />
              <SettingsRow t={t} icon="doc" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Storico presenze" last/>
            </div>
          </React.Fragment>
        )}
        <SectionLabel t={t} style={{ marginTop: 14, marginBottom: 0 }}>Account</SectionLabel>
        <div>
          <SettingsRow t={t} icon="camera" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Cambia foto profilo" />
          <SettingsRow t={t} icon="lock" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Cambia password" />
          <SettingsRow t={t} icon="moon" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="Tema scuro" trailing={<Toggle t={t} on={dark}/>}/>
          <SettingsRow t={t} icon="shield" iconBg={t.surfaceLow} iconColor={t.textSecondary} title="I tuoi dati (GDPR)" last/>
        </div>
        <div style={{ marginTop: 20 }}>
          <DangerBtn t={t} outline>
            <Icon name="logout" size={18} color={t.danger} strokeWidth={2}/> Esci dall'account
          </DangerBtn>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: t.textSecondary, marginTop: 14, opacity: 0.7 }}>Turnify v1.0.0</div>
      </div>
    </div>
  );
}

Object.assign(window, { S_LeaveList, S_LeaveNew, S_Notifs, S_Profile });
