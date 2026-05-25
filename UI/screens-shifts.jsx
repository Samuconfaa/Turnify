// Turnify — Shifts screens (4)

// Compact pill header for week nav
function WeekNav({ t, label = 'Sett. 21' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: t.surface,
      }}><Icon name="chev-l" size={16} color={t.text} strokeWidth={2}/></div>
      <div style={{
        height: 32, padding: '0 14px', borderRadius: 10,
        border: `1px solid ${t.border}`, background: t.surface,
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 600, color: t.text,
      }}><Icon name="cal" size={14} color={t.primary} strokeWidth={2}/> {label}</div>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: t.surface,
      }}><Icon name="chev-r" size={16} color={t.text} strokeWidth={2}/></div>
      <div style={{
        height: 32, padding: '0 12px', borderRadius: 10,
        background: t.primaryLight, color: t.primary,
        display: 'flex', alignItems: 'center',
        fontSize: 13, fontWeight: 600, marginLeft: 'auto',
      }}>Oggi</div>
    </div>
  );
}

// 8. CALENDARIO TURNI — DIPENDENTE
function S_ShiftsEmp({ t, dark }) {
  const days = [
    { d: 'Lun 20', date: 'Oggi', a: 'Nord Café Centro', tm: '09:00 – 13:00', accent: t.primary, today: true },
    { d: 'Mar 21', date: '', a: 'Nord Café Centro', tm: '13:00 – 19:00', accent: t.kpiBlue },
    { d: 'Mer 22', date: '', a: 'Riposo', tm: '—', accent: t.border, off: true },
    { d: 'Gio 23', date: '', a: 'Nord Café Stazione', tm: '07:00 – 13:00', accent: t.kpiAmber },
    { d: 'Ven 24', date: '', a: 'Nord Café Centro', tm: '13:00 – 19:00', accent: t.kpiBlue },
    { d: 'Sab 25', date: '', a: 'Nord Café Centro', tm: '17:00 – 23:00', accent: '#B45309' },
    { d: 'Dom 26', date: '', a: 'Riposo', tm: '—', accent: t.border, off: true },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 14px', background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4, marginBottom: 12 }}>I tuoi turni</div>
        <WeekNav t={t} label="Sett. 21"/>
      </div>
      <ScrollBody t={t} padding="16px 16px" gap={12}>
        {/* Live timbratura card */}
        <Card t={t} padding={16} style={{ background: t.primaryLight, borderColor: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: t.primary,
              boxShadow: `0 0 0 4px ${dark ? 'rgba(104,219,169,0.18)' : 'rgba(0,105,72,0.18)'}`,
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.successText, letterSpacing: 0.4 }}>TURNO IN CORSO · 09:02 entrato</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginTop: 2 }}>Nord Café Centro · fino alle 13:00</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{
              flex: 1, height: 44, borderRadius: 11, background: t.primary, color: dark_text_on_primary(t),
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 14, fontWeight: 600,
            }}>
              <Icon name="check" size={16} color={dark_text_on_primary(t)} strokeWidth={2.4}/> Timbra Entrata
            </div>
            <div style={{
              flex: 1, height: 44, borderRadius: 11, border: `1px solid ${t.primary}`, color: t.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 14, fontWeight: 600, background: t.surface,
            }}>
              <Icon name="arrow-l" size={16} color={t.primary} strokeWidth={2.4}/> Timbra Uscita
            </div>
          </div>
        </Card>

        <SectionLabel t={t} style={{ marginTop: 4 }}>Questa settimana</SectionLabel>

        {days.map((x, i) => (
          <Card key={i} t={t} padding={0} accent={x.accent} style={{
            ...(x.today ? { borderColor: t.primary, borderWidth: 1.5 } : {}),
            opacity: x.off ? 0.7 : 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 14px 18px' }}>
              <div style={{ flex: '0 0 56px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{x.d}</div>
                {x.date && <div style={{ fontSize: 11, fontWeight: 600, color: t.primary, marginTop: 2 }}>{x.date}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: x.off ? t.textSecondary : t.text }}>{x.a}</div>
                <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{x.tm}</div>
              </div>
              {!x.off && (
                <SmallPill bg={t.surfaceLow} color={t.textSecondary} style={{ height: 26, fontSize: 11 }}>
                  fino alle {x.tm.split(' – ')[1]}
                </SmallPill>
              )}
            </div>
          </Card>
        ))}
      </ScrollBody>
    </div>
  );
}

// 9. CALENDARIO TURNI — ADMIN (griglia dipendenti)
function S_ShiftsAdmin({ t, dark }) {
  const dayHeaders = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
  const dayColors = ['', '', '', '', '', '#B45309', t.danger];
  const employees = [
    { i: 'MB', n: 'Marco B.', s: ['09–13', '13–19', null, '07–13', '13–19', '17–23', null] },
    { i: 'EL', n: 'Elena L.', s: ['09–17', null, '09–17', '09–17', null, 'FERIE', 'FERIE'] },
    { i: 'GR', n: 'Giulia R.', s: [null, '09–17', '09–17', null, '09–17', '09–14', null] },
    { i: 'DV', n: 'Davide V.', s: ['17–23', '17–23', '17–23', '17–23', null, null, null] },
    { i: 'SC', n: 'Sara C.', s: [null, null, '09–13', '09–13', '09–13', '09–13', '09–13'] },
  ];
  const colorFor = (s) => {
    if (!s) return null;
    if (s === 'FERIE') return { bg: t.warningBg, fg: t.warningText };
    const start = parseInt(s.split('–')[0]);
    if (start < 9) return { bg: t.kpiBlueBg, fg: t.kpiBlue };
    if (start < 13) return { bg: t.primaryLight, fg: t.primary };
    if (start < 17) return { bg: dark ? '#2E2611' : '#FEF9C3', fg: t.kpiAmber };
    return { bg: dark ? '#2A1F30' : '#EEE5F7', fg: dark ? '#C49BFF' : '#6D28D9' };
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 20px 14px', background: t.surface, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: t.text, letterSpacing: -0.4 }}>Turni</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBox size={36} radius={10} bg={t.surfaceLow} color={t.text} icon="filter" />
            <IconBox size={36} radius={10} bg={t.primary} color={dark_text_on_primary(t)} icon="plus" />
          </div>
        </div>
        <WeekNav t={t} label="20 – 26 mag"/>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: t.bg, padding: '14px 12px 16px' }}>
        {/* Grid header */}
        <div style={{ display: 'grid', gridTemplateColumns: '76px repeat(7, 1fr)', gap: 4, marginBottom: 8, paddingLeft: 4 }}>
          <div></div>
          {dayHeaders.map((d, i) => (
            <div key={i} style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8,
              color: dayColors[i] || t.textSecondary, textAlign: 'center',
            }}>{d}</div>
          ))}
        </div>
        {/* Grid rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {employees.map((e, ei) => (
            <div key={ei} style={{ display: 'grid', gridTemplateColumns: '76px repeat(7, 1fr)', gap: 4, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 4px' }}>
                <Avatar t={t} initials={e.i} size={28} />
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text, lineHeight: 1.1 }}>{e.n}</div>
              </div>
              {e.s.map((s, i) => {
                const c = colorFor(s);
                return (
                  <div key={i} style={{
                    minHeight: 40, borderRadius: 8,
                    background: c ? c.bg : t.surfaceLow,
                    color: c ? c.fg : t.textSecondary,
                    border: c ? 'none' : `1px dashed ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10.5, fontWeight: 600, textAlign: 'center',
                    padding: '4px 2px', lineHeight: 1.1,
                  }}>
                    {s || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 18, fontSize: 11, color: t.textSecondary }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.primary }}/> Turno
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.kpiAmber }}/> Ferie
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.border }}/> Riposo
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. DETTAGLIO / CREAZIONE TURNO (bottom sheet style fullscreen)
function S_ShiftDetail({ t, dark, edit = false }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.4)' }}>
      <div style={{ flex: 1 }}/>
      <div style={{ background: t.surface, borderRadius: '28px 28px 0 0', maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <DragHandle t={t}/>
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: -0.3 }}>{edit ? 'Modifica turno' : 'Nuovo turno'}</div>
          <IconBox size={32} radius={10} bg={t.surfaceLow} color={t.text} icon="x"/>
        </div>
        <div style={{ padding: '12px 20px 20px', overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {edit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: t.warningBg, color: t.warningText, borderRadius: 10, fontSize: 12.5, fontWeight: 500 }}>
              <Icon name="sparkle" size={14} color={t.warningText} strokeWidth={2.2}/>
              Turno ricorrente · ogni Lun · 4 settimane rimanenti
            </div>
          )}
          <SectionLabel t={t} style={{ marginTop: 2, marginBottom: 4 }}>Dipendente</SectionLabel>
          <div style={{
            border: `1px solid ${t.border}`, borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 12, background: t.surface,
          }}>
            <Avatar t={t} initials="MB" size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Marco Bianchi</div>
              <div style={{ fontSize: 12, color: t.textSecondary }}>Barista · Full-time</div>
            </div>
            <Icon name="chev-d" size={18} color={t.textSecondary} strokeWidth={2}/>
          </div>

          <SectionLabel t={t} style={{ marginTop: 6, marginBottom: 4 }}>Orari</SectionLabel>
          <Input t={t} label="Data" value="Lunedì 20 maggio 2026" focused leading={<Icon name="cal" size={18} color={t.primary}/>}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input t={t} label="Ora inizio" value="09:00" leading={<Icon name="clock" size={18} color={t.textSecondary}/>}/>
            <Input t={t} label="Ora fine" value="13:00" leading={<Icon name="clock" size={18} color={t.textSecondary}/>}/>
          </div>
          <Input t={t} label="Etichetta / nota" placeholder="Es. Aperture, copertura pranzo…"/>

          {!edit && (
            <React.Fragment>
              <SectionLabel t={t} style={{ marginTop: 6, marginBottom: 4 }}>Ripeti</SectionLabel>
              <div style={{
                border: `1px solid ${t.border}`, borderRadius: 12, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 14, background: t.surface,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>Ripeti per</div>
                  <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 2 }}>Stesso giorno della settimana</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: t.surfaceLow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="minus" size={16} color={t.text} strokeWidth={2.2}/>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text, minWidth: 50, textAlign: 'center' }}>4 sett.</div>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: t.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="plus" size={16} color={dark_text_on_primary(t)} strokeWidth={2.2}/>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
        <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${t.borderSoft}`, display: 'flex', gap: 10 }}>
          {edit && <DangerBtn t={t} full={false} style={{ flex: 1 }}>Elimina</DangerBtn>}
          <PrimaryBtn t={t} style={{ flex: edit ? 2 : 1 }}>Salva turno</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// 11. SCAMBI TURNO
function S_Swaps({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header t={t} title="Scambi turno" trailing={
        <IconBox size={36} radius={10} bg={t.primary} color={dark_text_on_primary(t)} icon="plus"/>
      }/>
      <ScrollBody t={t} padding="16px 16px" gap={10}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip t={t} label="Tutte" active />
          <Chip t={t} label="In attesa" />
          <Chip t={t} label="Accettati" />
          <Chip t={t} label="Rifiutati" />
        </div>
        <Card t={t} padding={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <StatusBadge t={t} kind="pending" label="In attesa"/>
            <div style={{ fontSize: 11, color: t.textSecondary, marginLeft: 'auto' }}>2 ore fa</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="MB" size={36}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Marco · Mer 22 · 09–13</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px' }}>
            <Icon name="swap" size={18} color={t.primary} strokeWidth={2}/>
            <div style={{ flex: 1, height: 1, background: t.borderSoft }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="EL" size={36} bg={t.warningBg} color={t.warningText}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Elena · Ven 24 · 13–19</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div style={{
              flex: 1, height: 34, borderRadius: 10, background: t.primary, color: dark_text_on_primary(t),
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
            }}>Accetta</div>
            <div style={{
              flex: 1, height: 34, borderRadius: 10, border: `1px solid ${t.danger}`, color: t.danger,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
            }}>Rifiuta</div>
          </div>
        </Card>

        <Card t={t} padding={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <StatusBadge t={t} kind="approved" label="Accettato"/>
            <div style={{ fontSize: 11, color: t.textSecondary, marginLeft: 'auto' }}>ieri</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="MB" size={36}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Marco · Sab 18 · 17–23</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px' }}>
            <Icon name="swap" size={18} color={t.successText} strokeWidth={2}/>
            <div style={{ flex: 1, height: 1, background: t.borderSoft }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="DV" size={36}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Davide · Dom 19 · 13–19</div>
          </div>
        </Card>

        <Card t={t} padding={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <StatusBadge t={t} kind="rejected" label="Rifiutato"/>
            <div style={{ fontSize: 11, color: t.textSecondary, marginLeft: 'auto' }}>3 giorni fa</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="GR" size={36}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Giulia · Gio 16 · 09–17</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px' }}>
            <Icon name="swap" size={18} color={t.errorText} strokeWidth={2}/>
            <div style={{ flex: 1, height: 1, background: t.borderSoft }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar t={t} initials="SC" size={36}/>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Sara · Ven 17 · 09–13</div>
          </div>
        </Card>
      </ScrollBody>
    </div>
  );
}

Object.assign(window, { S_ShiftsEmp, S_ShiftsAdmin, S_ShiftDetail, S_Swaps, WeekNav });
