// Turnify — auth flow screens (5)
// Each returns full phone content. Used inside <Phone t={t} dark={dark}>.

const { Phone: _P } = window; // not used but pattern hint

// 1. ROLE SELECTION
function S_Role({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: t.bg }}>
      <div style={{ padding: '32px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <Logo size={42} color={t.primary} textColor={t.text} />
      </div>
      <div style={{ padding: '40px 24px 16px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' }}>Bentornato</div>
        <div style={{ fontSize: 14, color: t.textSecondary, textAlign: 'center', lineHeight: 1.45 }}>Scegli come vuoi accedere a Turnify.</div>
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <Card t={t} padding={20} style={{ borderColor: t.primary, borderWidth: 2, display: 'flex', alignItems: 'center', gap: 16 }}>
          <IconBox size={44} radius={12} bg={t.primaryLight} color={t.primary} icon="briefcase" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>Admin / Manager</div>
            <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2 }}>Gestisci team e turni</div>
          </div>
          <Icon name="chev-r" size={20} color={t.primary} strokeWidth={2} />
        </Card>
        <Card t={t} padding={20} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <IconBox size={44} radius={12} bg={t.surfaceLow} color={t.text} icon="user" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>Dipendente</div>
            <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 2 }}>Visualizza turni e timbra</div>
          </div>
          <Icon name="chev-r" size={20} color={t.textSecondary} strokeWidth={2} />
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px' }}>
          <div style={{ flex: 1, height: 1, background: t.border }} />
          <div style={{ fontSize: 12, color: t.textSecondary }}>oppure</div>
          <div style={{ flex: 1, height: 1, background: t.border }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 14, color: t.text }}>
          Nuovo qui? <span style={{ color: t.primary, fontWeight: 600 }}>Registra la tua azienda</span>
        </div>
      </div>
      <div style={{ padding: '8px 24px 28px', textAlign: 'center', fontSize: 12, color: t.textSecondary }}>
        <span>Termini di servizio</span><span style={{ margin: '0 8px', opacity: 0.5 }}>·</span><span>Privacy</span>
      </div>
    </div>
  );
}

// 2. LOGIN
function S_Login({ t, dark, role = 'admin' }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Hero t={t} height={210}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(255,255,255,0.30)',
          }}>
            <Icon name="clock" size={32} color={dark_text_on_primary(t)} strokeWidth={2}/>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Turnify</div>
        </div>
      </Hero>
      <div style={{ flex: 1, background: t.surface, borderRadius: '28px 28px 0 0', marginTop: -16, padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <DragHandle t={t} />
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: -0.3, marginTop: 6, marginBottom: 4 }}>
          {role === 'admin' ? 'Accedi come Admin' : 'Accedi come Dipendente'}
        </div>
        <div style={{ fontSize: 13, color: t.textSecondary, marginBottom: 20 }}>
          {role === 'admin' ? 'Gestisci la tua azienda' : 'Inserisci il codice della tua azienda'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {role === 'admin' ? (
            <Input t={t} label="Email" value="laura@nordcafe.it" leading={<Icon name="mail" size={18} color={t.textSecondary}/>} />
          ) : (
            <React.Fragment>
              <Input t={t} label="Codice azienda" value="NORDCAFE" leading={<Icon name="building" size={18} color={t.textSecondary}/>} />
              <Input t={t} label="Username" placeholder="m.bianchi" leading={<Icon name="user" size={18} color={t.textSecondary}/>} />
            </React.Fragment>
          )}
          <Input t={t} label="Password" value="••••••••" focused leading={<Icon name="lock" size={18} color={t.primary}/>} trailing={<Icon name="eye" size={18} color={t.textSecondary}/>} />
          {role === 'admin' && (
            <div style={{ textAlign: 'right', fontSize: 13, color: t.primary, fontWeight: 500, marginTop: -4 }}>Password dimenticata?</div>
          )}
          <PrimaryBtn t={t}>Accedi</PrimaryBtn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 4px' }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <div style={{ fontSize: 12, color: t.textSecondary }}>oppure</div>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>
          <OutlineBtn t={t}>Registrati</OutlineBtn>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16, textAlign: 'center', fontSize: 11, color: t.textSecondary }}>
          Continuando accetti i Termini e la Privacy.
        </div>
      </div>
    </div>
  );
}

// 3. REGISTRAZIONE
function S_Register({ t, dark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Hero t={t} height={150} style={{ paddingBottom: 28, paddingTop: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>Crea il tuo account</div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: 0.9 }}>Registra la tua azienda in pochi secondi</div>
      </Hero>
      <div style={{ flex: 1, background: t.surface, borderRadius: '28px 28px 0 0', marginTop: -16, padding: '8px 24px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <DragHandle t={t} />
        <SectionLabel t={t} style={{ marginTop: 12 }}>Dati Azienda</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input t={t} label="Nome Azienda" value="Nord Café" leading={<Icon name="building" size={18} color={t.textSecondary}/>}/>
          <Input t={t} label="Slug identificativo" value="nord-cafe" leading={<Icon name="globe" size={18} color={t.textSecondary}/>} helper="turnify.it/nord-cafe"/>
          <Input t={t} label="Email aziendale" placeholder="info@nordcafe.it" leading={<Icon name="mail" size={18} color={t.textSecondary}/>}/>
        </div>
        <SectionLabel t={t} style={{ marginTop: 22 }}>Account Admin</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input t={t} label="Email Admin" value="laura@nordcafe.it" leading={<Icon name="mail" size={18} color={t.textSecondary}/>}/>
          <Input t={t} label="Password" value="••••••••" leading={<Icon name="lock" size={18} color={t.textSecondary}/>} trailing={<Icon name="eye" size={18} color={t.textSecondary}/>}/>
          <Input t={t} label="Conferma Password" value="••••••••" leading={<Icon name="lock" size={18} color={t.textSecondary}/>}/>
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PrimaryBtn t={t}>Registrati</PrimaryBtn>
          <div style={{ textAlign: 'center', fontSize: 13, color: t.textSecondary }}>
            Hai già un account? <span style={{ color: t.primary, fontWeight: 600 }}>Accedi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. RECUPERO PASSWORD
function S_Forgot({ t, dark, success = false }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Hero t={t} height={210}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="key" size={30} color={dark_text_on_primary(t)} strokeWidth={2}/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.2 }}>Recupera password</div>
        </div>
      </Hero>
      <div style={{ flex: 1, background: t.surface, borderRadius: '28px 28px 0 0', marginTop: -16, padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <DragHandle t={t} />
        {!success ? (
          <React.Fragment>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginTop: 6 }}>Reimposta password</div>
            <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 6, marginBottom: 22, lineHeight: 1.45 }}>
              Inserisci la tua email. Ti invieremo un link sicuro per impostarne una nuova.
            </div>
            <Input t={t} label="Email" value="laura@nordcafe.it" focused leading={<Icon name="mail" size={18} color={t.primary}/>} />
            <div style={{ marginTop: 22 }}>
              <PrimaryBtn t={t}>Invia link di reset</PrimaryBtn>
            </div>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: t.primary, fontWeight: 600 }}>‹ Torna al login</div>
          </React.Fragment>
        ) : (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: t.successBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={36} color={t.successText} strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>Email inviata!</div>
              <div style={{ fontSize: 14, color: t.textSecondary, marginTop: 8, lineHeight: 1.5, padding: '0 12px' }}>
                Controlla la tua casella <span style={{ color: t.text, fontWeight: 600 }}>laura@nordcafe.it</span> e clicca il link per impostare una nuova password.
              </div>
            </div>
            <div style={{ width: '100%', marginTop: 12 }}>
              <PrimaryBtn t={t}>Torna al login</PrimaryBtn>
            </div>
            <div style={{ fontSize: 13, color: t.textSecondary }}>Non hai ricevuto l'email? <span style={{ color: t.primary, fontWeight: 600 }}>Reinvia</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. ONBOARDING
function ProgressDots({ t, total, current }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 0 20px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 8, height: 8, borderRadius: 4,
          background: i <= current ? t.primary : t.border,
          transition: 'width 0.2s',
        }}/>
      ))}
    </div>
  );
}
function S_Onboarding({ t, dark, step = 0 }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: t.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
        <Logo size={28} color={t.primary} textColor={t.text} />
        <div style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>Salta</div>
      </div>
      <ProgressDots t={t} total={3} current={step} />
      {step === 0 && (
        <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', marginTop: 8 }}>
            <Card t={t} padding={20} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <IconBox size={40} radius={12} bg={t.primaryLight} color={t.primary} icon="cal" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Gestione turni</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>Pianifica in pochi tap</div>
              </div>
            </Card>
            <Card t={t} padding={20} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <IconBox size={40} radius={12} bg={t.kpiAmberBg} color={t.kpiAmber} icon="users" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Il tuo team</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>Tutti sulla stessa pagina</div>
              </div>
            </Card>
            <Card t={t} padding={20} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <IconBox size={40} radius={12} bg={t.kpiBlueBg} color={t.kpiBlue} icon="palm" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Ferie e permessi</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>Approva con un tap</div>
              </div>
            </Card>
            <Card t={t} padding={20} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <IconBox size={40} radius={12} bg={t.kpiDangerBg} color={t.danger} icon="bar" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Report ore</div>
                <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>Esporta in CSV</div>
              </div>
            </Card>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4, lineHeight: 1.2 }}>Benvenuto in Turnify</div>
            <div style={{ fontSize: 14, color: t.textSecondary, marginTop: 8, lineHeight: 1.45 }}>
              Configuriamo insieme la tua attività. Tre passi, due minuti.
            </div>
          </div>
        </div>
      )}
      {step === 1 && (
        <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>La tua attività</div>
          <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 6, marginBottom: 22 }}>Dicci dove lavora il tuo team.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input t={t} label="Nome attività" value="Nord Café — Centro" focused leading={<Icon name="building" size={18} color={t.primary}/>}/>
            <Input t={t} label="Tipo attività" value="Bar / Caffetteria" leading={<Icon name="briefcase" size={18} color={t.textSecondary}/>} trailing={<Icon name="chev-d" size={18} color={t.textSecondary}/>}/>
            <Input t={t} label="Indirizzo" value="Via Verdi 14, Milano" leading={<Icon name="pin" size={18} color={t.textSecondary}/>}/>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.4 }}>Aggiungi il primo dipendente</div>
          <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 6, marginBottom: 22 }}>Potrai aggiungerne altri dal Profilo.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input t={t} label="Nome" value="Marco" />
              <Input t={t} label="Cognome" value="Bianchi" />
            </div>
            <Input t={t} label="Email" placeholder="marco.b@nordcafe.it" leading={<Icon name="mail" size={18} color={t.textSecondary}/>}/>
            <Input t={t} label="Password temporanea" value="••••••••" leading={<Icon name="lock" size={18} color={t.textSecondary}/>} helper="Sarà richiesta al primo accesso"/>
          </div>
        </div>
      )}
      <div style={{ padding: '20px 24px 16px', display: 'flex', gap: 12 }}>
        {step > 0 && <OutlineBtn t={t} full={false} style={{ flex: 1 }}>Indietro</OutlineBtn>}
        <PrimaryBtn t={t} style={{ flex: 2 }}>{step === 2 ? 'Crea dipendente' : step === 0 ? 'Inizia' : 'Avanti'}</PrimaryBtn>
      </div>
    </div>
  );
}

Object.assign(window, { S_Role, S_Login, S_Register, S_Forgot, S_Onboarding });
