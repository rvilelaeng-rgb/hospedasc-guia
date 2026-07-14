import { useState, useEffect, useCallback } from "react";
import {
  Copy, Check, Lock, Plus, Trash2, Pencil, ArrowLeft, Search,
  Phone, MapPin, Wifi, KeyRound, ShieldAlert, Compass, LogOut,
  X, Home, ClipboardList, Save, ChevronRight, Waves, Tv, Wind,
  ShowerHead, Flame, WashingMachine, Info, Users, HeartPulse,
  Pill, Fuel, Star, MessageCircle, CheckSquare, Square, Copy as CopyIcon,
  Link as LinkIcon, Image as ImageIcon, Eye
} from "lucide-react";
import { loadGuideData, saveGuideData, uploadPhoto } from "./lib/supabase";

/* ---------------------------------------------------------
   IDENTIDADE HOSPEDA SC — navy profundo, dourado areia, fundo
   cream/branco, Poppins (títulos/wordmark) + Inter (corpo).
--------------------------------------------------------- */
const T = {
  navyDeep: "#0D1B2A",
  navy: "#16283F",
  navyMid: "#25415F",
  gold: "#C9A063",
  goldDark: "#A67C3D",
  goldSoft: "#E3CFA0",
  sand: "#F7F2E7",
  sandLine: "#E6DCC5",
  cloud: "#FFFFFF",
  ink: "#1B2230",
  inkSoft: "#5B6472",
  ok: "#3F7A56",
  danger: "#B54A38",
  whatsapp: "#3F8A5A",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`;

const uid = () => Math.random().toString(36).slice(2, 9);
const genToken = () => (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8));

const HUES = [
  { a: "#0D1B2A", b: "#16283F" },
  { a: "#16283F", b: "#25415F" },
  { a: "#25415F", b: "#C9A063" },
];

const DEFAULT_CHECKLIST = () => [
  { id: uid(), text: "Apagar as luzes" },
  { id: uid(), text: "Desligar o ar-condicionado" },
  { id: uid(), text: "Fechar portas e janelas" },
  { id: uid(), text: "Recolher pertences pessoais" },
  { id: uid(), text: "Retirar o lixo" },
  { id: uid(), text: "Deixar a louça organizada" },
  { id: uid(), text: "Avisar a anfitriã ao sair" },
];

const EXAMPLE_PROPERTIES = [
    {
      id: uid(),
      accessToken: genToken(),
      name: "Loft 127",
      city: "Itajaí, SC",
      hue: 0,
      coverImage: "",
      description: "Apartamento inteiro com vista para o mar, a poucos passos da praia central.",
      hostName: "Janaina Amorim",
      hostMessage:
        "Olá! Seja muito bem-vindo. Preparamos tudo com carinho para que vocês aproveitem dias incríveis. Qualquer dúvida durante a estadia, estarei à disposição pelo WhatsApp.",
      superhost: true,
      address: "Rua João Bauer, 218 — Itajaí/SC",
      checkin: "15:00",
      checkout: "11:00",
      maxGuests: "2",
      petsAllowed: true,
      petsNote: "Pets de pequeno porte, mediante aviso prévio.",
      smokingAllowed: false,
      partyAllowed: false,
      quietHours: "22h às 8h",
      wifiName: "LOFT 127",
      wifiPass: "Sejabemvindoaoloft127",
      doorCode: "",
      gateCode: "",
      items: [
        { id: uid(), name: "TV", icon: "tv", instructions: "Use o controle remoto. Netflix e YouTube disponíveis. Faça logout ao final da estadia." },
        { id: uid(), name: "Ar-condicionado", icon: "wind", instructions: "Ligue pelo controle remoto. Temperatura recomendada entre 22° e 24°. Desligue ao sair do quarto." },
        { id: uid(), name: "Chuveiro", icon: "shower", instructions: "Ajuste a temperatura antes do banho e aguarde alguns segundos para a água aquecer." },
        { id: uid(), name: "Fogão / Cooktop", icon: "flame", instructions: "Utilize com cuidado. Verifique se as bocas ficaram desligadas após o uso." },
        { id: uid(), name: "Máquina de lavar", icon: "washer", instructions: "Disponível para estadias longas. Use sabão líquido e deixe o espaço organizado." },
      ],
      checklist: DEFAULT_CHECKLIST(),
      emergency: [
        { id: uid(), label: "Anfitriã — Janaina Amorim", phone: "+55 47 99902-0048", address: "", category: "host" },
        { id: uid(), label: "Hospital Unimed", phone: "(47) 3267-4400", address: "Rua João Bauer, 218 - Itajaí", category: "hospital" },
        { id: uid(), label: "Farmácia — Drogaria Catarinense", phone: "(47) 3348-8924", address: "Rua Hercílio Luz, 220 - Centro, Itajaí", category: "farmacia" },
        { id: uid(), label: "Polícia Militar", phone: "190", address: "Rua Felipe Schmidt, 257 - Itajaí", category: "policia" },
        { id: uid(), label: "Chaveiro 24h", phone: "(47) 99755-7003", address: "Atendimento 24h", category: "chaveiro" },
      ],
      recommendations: [
        { id: uid(), name: "Praia Central de Balneário Camboriú", note: "Cartão-postal da região, ótima para o pôr do sol." },
        { id: uid(), name: "Mercado Público", note: "Lojas, queijos e produtos artesanais." },
        { id: uid(), name: "Molhe de Itajaí", note: "Clima agradável o ano todo." },
      ],
    },
];

/* --------------------------- utils --------------------------- */
const ITEM_ICONS = { tv: Tv, wind: Wind, shower: ShowerHead, flame: Flame, washer: WashingMachine, info: Info };
const CATEGORY_META = {
  host: { icon: Home, label: "Anfitrião" },
  hospital: { icon: HeartPulse, label: "Hospital" },
  farmacia: { icon: Pill, label: "Farmácia" },
  policia: { icon: ShieldAlert, label: "Polícia" },
  chaveiro: { icon: KeyRound, label: "Chaveiro" },
  posto: { icon: Fuel, label: "Posto de combustível" },
  outro: { icon: Phone, label: "Outro" },
};

function buildGuestLink(token) {
  try {
    return `${window.location.origin}${window.location.pathname}${window.location.search}#guia=${token}`;
  } catch (e) {
    return `#guia=${token}`;
  }
}

function extractToken() {
  try {
    const hash = window.location.hash || "";
    let m = hash.match(/guia=([a-z0-9]+)/i);
    if (m) return m[1];
    const search = window.location.search || "";
    m = search.match(/[?&]guia=([a-z0-9]+)/i);
    if (m) return m[1];
  } catch (e) {}
  return null;
}

function waLink(phone) {
  let digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 11 && !digits.startsWith("55")) digits = "55" + digits;
  return `https://wa.me/${digits}`;
}

/* ---------------------------------------------------------
   Marca — casa com sol nascendo atrás e onda
--------------------------------------------------------- */
function Logomark({ size = 40, colorOverride }) {
  const line = colorOverride || T.navy;
  const accent = colorOverride || T.gold;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M36 34 A14 14 0 0 1 64 34" stroke={accent} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M24 42 L50 21 L76 42 M24 42 L24 66 M76 42 L76 66" stroke={line} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 54 Q41 46 50 54 T68 54" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 70 Q23 61 36 70 T62 70 T88 70" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 78 Q23 69 36 78 T62 78 T88 78" stroke={line} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function LogomarkWatermark({ size = 320, style }) {
  return (
    <div style={{ position: "absolute", opacity: 0.07, pointerEvents: "none", ...style }}>
      <Logomark size={size} colorOverride="#FFFFFF" />
    </div>
  );
}

function Wordmark({ light, size = 22 }) {
  return (
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1, color: light ? "#fff" : T.navy, letterSpacing: 0.2 }}>
      Hospeda SC
    </div>
  );
}

function TideDivider({ color = T.sand }) {
  return (
    <svg viewBox="0 0 400 24" preserveAspectRatio="none" style={{ width: "100%", height: 18, display: "block" }}>
      <path d="M0 14 Q 25 2 50 14 T 100 14 T 150 14 T 200 14 T 250 14 T 300 14 T 350 14 T 400 14 V24 H0 Z" fill={color} />
    </svg>
  );
}

/* ---------------------------------------------------------
   Campo copiável ("etiqueta de bagagem")
--------------------------------------------------------- */
function CopyStub({ icon: Icon, label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {}
  };
  return (
    <button
      onClick={doCopy}
      className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-2.5 mb-1.5 transition-transform active:scale-[0.98]"
      style={{ background: T.cloud, border: `1.5px dashed ${T.sandLine}` }}
    >
      <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 32, height: 32, background: T.sand, color: T.navy }}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "Inter", fontSize: 11, color: T.inkSoft, letterSpacing: 0.3 }}>{label}</div>
        <div className="truncate" style={{ fontFamily: mono ? "IBM Plex Mono" : "Inter", fontWeight: 600, fontSize: 14, color: T.ink }}>{value}</div>
      </div>
      <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: copied ? T.ok : T.gold, color: "#fff" }}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </div>
    </button>
  );
}

/* Campo informativo (sem cópia) — usado para check-in/checkout/hóspedes/wifi */
function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mr-2 mb-2" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
      <Icon size={13} color={T.navy} />
      <span style={{ fontFamily: "Inter", fontSize: 11.5, color: T.inkSoft }}>{label}:</span>
      <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: T.ink }}>{value}</span>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 11, color: T.navyMid, letterSpacing: 1, marginTop: 14, marginBottom: 6 }}>
      {text.toUpperCase()}
    </div>
  );
}

function RuleChip({ ok, label, note }) {
  return (
    <div className="rounded-xl px-4 py-2.5 mb-1.5 flex items-start gap-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
      <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, background: ok ? "#E7EFE8" : "#F4E5E0", color: ok ? T.ok : T.danger }}>
        {ok ? <Check size={14} /> : <X size={14} />}
      </div>
      <div>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>{label}</div>
        {note && <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>{note}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Tela travada (acesso público sem token) — nenhum dado exposto
--------------------------------------------------------- */
function LockedLanding({ onAdminClick }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center relative overflow-hidden" style={{ minHeight: "100%", background: `linear-gradient(160deg, ${T.navyDeep}, ${T.navy})` }}>
      <LogomarkWatermark size={280} style={{ top: -60, right: -80 }} />
      <LogomarkWatermark size={220} style={{ bottom: -50, left: -60 }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="rounded-full flex items-center justify-center mb-4" style={{ width: 72, height: 72, background: "#fff" }}>
          <Logomark size={50} />
        </div>
        <Wordmark light size={22} />
        <div style={{ fontFamily: "Inter", fontSize: 13.5, color: "#D7DEE6", marginTop: 14, lineHeight: 1.5, maxWidth: 300 }}>
          Este é o acesso reservado do anfitrião. Hóspedes acessam pelo link individual do imóvel.
        </div>
        <button onClick={onAdminClick} className="flex items-center gap-2 rounded-xl px-5 py-3 mt-8" style={{ background: T.gold, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14 }}>
          <Lock size={15} /> Entrar como anfitrião
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Tela: detalhe do imóvel (visão do hóspede)
--------------------------------------------------------- */
function DetailView({ p, onBack, guestLocked }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [checked, setChecked] = useState({});
  const [imgError, setImgError] = useState(false);
  const hue = HUES[p.hue % HUES.length];
  const showImg = p.coverImage && !imgError;

  const toggleCheck = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const pills = [
    p.checkin ? { icon: Home, label: `Check-in ${p.checkin}` } : null,
    p.checkout ? { icon: Home, label: `Check-out ${p.checkout}` } : null,
  ].filter(Boolean);

  const copyAll = async () => {
    const lines = [
      `${p.name} — ${p.city}`,
      p.hostName ? `Anfitrião(ã): ${p.hostName}` : null,
      ``,
      `Endereço: ${p.address}`,
      `Check-in: ${p.checkin}  •  Check-out: ${p.checkout}`,
      p.maxGuests ? `Máximo de hóspedes: ${p.maxGuests}` : null,
      p.wifiName ? `Wi-Fi: ${p.wifiName} / Senha: ${p.wifiPass}` : null,
      p.doorCode ? `Código da porta: ${p.doorCode}` : null,
      p.gateCode ? `Código do portão: ${p.gateCode}` : null,
      `\nRegras: pets ${p.petsAllowed ? "permitido" : "não permitido"}; fumar ${p.smokingAllowed ? "permitido" : "não permitido"}; festas ${p.partyAllowed ? "permitido" : "não permitido"}; silêncio ${p.quietHours || "-"}.`,
      p.items?.length ? `\nItens da casa:\n${p.items.map((i) => `- ${i.name}: ${i.instructions}`).join("\n")}` : null,
      p.emergency?.length ? `\nContatos:\n${p.emergency.map((e) => `- ${e.label}: ${e.phone}`).join("\n")}` : null,
      p.recommendations?.length ? `\nRecomendações:\n${p.recommendations.map((r) => `- ${r.name} — ${r.note}`).join("\n")}` : null,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1600);
    } catch (e) {}
  };

  return (
    <div className="flex flex-col" style={{ background: T.sand, minHeight: "100%" }}>
      <div
        className="px-5 pt-6 pb-5 relative overflow-hidden"
        style={{ background: showImg ? "#000" : `linear-gradient(160deg, ${hue.a}, ${hue.b})`, minHeight: showImg ? 190 : undefined }}
      >
        {showImg && (
          <img src={p.coverImage} onError={() => setImgError(true)} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
        )}
        <LogomarkWatermark size={190} style={{ bottom: -45, right: -55, opacity: 0.1 }} />

        <div className="relative z-10">
          {!guestLocked ? (
            <button onClick={onBack} className="flex items-center gap-1 mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>
              <ArrowLeft size={17} /><span style={{ fontFamily: "Inter", fontSize: 13.5 }}>Meus imóveis</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <Logomark size={20} colorOverride="#fff" />
              <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>Hospeda SC</span>
            </div>
          )}
          {p.superhost && (
            <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 mb-2" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Star size={12} color={T.gold} fill={T.gold} />
              <span style={{ fontFamily: "Inter", fontSize: 11, color: "#fff", fontWeight: 600 }}>Anfitrião 5 estrelas</span>
            </div>
          )}
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 23, color: "#fff", lineHeight: 1.15 }}>{p.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} color="rgba(255,255,255,0.85)" />
            <span style={{ fontFamily: "Inter", fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>{p.city}</span>
          </div>
          {p.description && (
            <div style={{ fontFamily: "Inter", fontSize: 12.5, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 1.4, maxWidth: 420 }}>
              {p.description}
            </div>
          )}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pills.map((pill, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <pill.icon size={12} color="#fff" />
                  <span style={{ fontFamily: "Inter", fontSize: 11.5, color: "#fff", fontWeight: 500 }}>{pill.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TideDivider color={T.sand} />

      <div className="px-5 -mt-1 flex-1" style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}>
        {p.hostMessage && (
          <div className="rounded-xl px-4 py-3 mb-1.5" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={13} color={T.gold} />
              <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 10.5, color: T.navyMid, letterSpacing: 0.6 }}>MENSAGEM DA ANFITRIÃ{p.hostName ? ` — ${p.hostName.toUpperCase()}` : ""}</span>
            </div>
            <div style={{ fontFamily: "Poppins", fontStyle: "italic", fontWeight: 500, fontSize: 13.5, color: T.ink, lineHeight: 1.45 }}>{p.hostMessage}</div>
          </div>
        )}

        <SectionLabel text="Endereço & horários" />
        <CopyStub icon={MapPin} label="Endereço" value={p.address} mono={false} />
        <div className="flex flex-wrap">
          <InfoChip icon={Home} label="Check-in" value={p.checkin} />
          <InfoChip icon={Home} label="Check-out" value={p.checkout} />
          <InfoChip icon={Users} label="Hóspedes" value={p.maxGuests} />
        </div>

        <SectionLabel text="Acesso ao imóvel" />
        <InfoChip icon={Wifi} label="Rede Wi-Fi" value={p.wifiName} />
        <div className="w-full" />
        <CopyStub icon={Wifi} label="Senha do Wi-Fi" value={p.wifiPass} />
        <CopyStub icon={KeyRound} label="Código da porta / fechadura" value={p.doorCode} />
        <CopyStub icon={KeyRound} label="Código do portão" value={p.gateCode} />

        <SectionLabel text="Regras da casa" />
        <RuleChip ok={p.petsAllowed} label={p.petsAllowed ? "Pets permitidos" : "Pets não permitidos"} note={p.petsAllowed ? p.petsNote : ""} />
        <RuleChip ok={p.smokingAllowed} label={p.smokingAllowed ? "Permitido fumar" : "Não é permitido fumar"} />
        <RuleChip ok={p.partyAllowed} label={p.partyAllowed ? "Festas permitidas" : "Não são permitidas festas"} />
        {p.quietHours && (
          <div className="rounded-xl px-4 py-2.5 mb-1.5 flex items-start gap-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, background: T.sand, color: T.navy }}><Info size={14} /></div>
            <div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>Horário de silêncio</div>
              <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>{p.quietHours}</div>
            </div>
          </div>
        )}

        {p.items?.length > 0 && (
          <>
            <SectionLabel text="Como usar os itens" />
            {p.items.map((it) => {
              const Ic = ITEM_ICONS[it.icon] || Info;
              return (
                <div key={it.id} className="rounded-xl px-4 py-2.5 mb-1.5 flex items-start gap-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
                  <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, background: T.sand, color: T.navy }}><Ic size={14} /></div>
                  <div>
                    <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>{it.name}</div>
                    <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>{it.instructions}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {p.recommendations?.length > 0 && (
          <>
            <SectionLabel text="Recomendações locais" />
            {p.recommendations.map((r) => (
              <div key={r.id} className="rounded-xl px-4 py-2.5 mb-1.5 flex items-start gap-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
                <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, background: T.sand, color: T.navy }}><Compass size={14} /></div>
                <div>
                  <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>{r.name}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>{r.note}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {p.emergency?.length > 0 && (
          <>
            <SectionLabel text="Contatos úteis & emergência" />
            {p.emergency.map((c) => {
              const meta = CATEGORY_META[c.category] || CATEGORY_META.outro;
              const wa = c.category === "host" ? waLink(c.phone) : null;
              return (
                <div key={c.id} className="mb-1.5">
                  <CopyStub icon={meta.icon} label={c.label} value={c.phone} mono={false} />
                  {c.address && (
                    <div style={{ fontFamily: "Inter", fontSize: 11, color: T.inkSoft, marginTop: -4, marginLeft: 4, marginBottom: 4 }}>{c.address}</div>
                  )}
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5" style={{ background: T.whatsapp, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 13 }}>
                      <MessageCircle size={15} /> Conversar no WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </>
        )}

        {p.checklist?.length > 0 && (
          <>
            <SectionLabel text="Checklist de saída" />
            <div className="rounded-xl px-4 py-1 mb-1.5" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
              {p.checklist.map((it) => (
                <button key={it.id} onClick={() => toggleCheck(it.id)} className="w-full flex items-center gap-3 py-1.5 text-left">
                  {checked[it.id] ? <CheckSquare size={17} color={T.ok} /> : <Square size={17} color={T.inkSoft} />}
                  <span style={{ fontFamily: "Inter", fontSize: 13, color: checked[it.id] ? T.inkSoft : T.ink, textDecoration: checked[it.id] ? "line-through" : "none" }}>{it.text}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={copyAll} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 mt-3" style={{ background: copiedAll ? T.ok : T.gold, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14 }}>
          {copiedAll ? <Check size={16} /> : <ClipboardList size={16} />}
          {copiedAll ? "Guia copiado!" : "Copiar guia completo"}
        </button>

        {guestLocked && (
          <div className="flex items-center justify-center gap-2 mt-5 opacity-60">
            <Logomark size={15} />
            <span style={{ fontFamily: "Inter", fontSize: 11, color: T.inkSoft }}>Hospeda SC</span>
          </div>
        )}

        {/* tarja de respiro no final, garante que o botão acima não fique colado no fim da tela */}
        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Modal de senha do admin
--------------------------------------------------------- */
function AdminLoginModal({ onClose, onSuccess, passcode }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (val === passcode) onSuccess();
    else { setErr(true); setTimeout(() => setErr(false), 1200); }
  };
  return (
    <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(13,27,42,0.55)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl px-6 pt-6 pb-8" style={{ background: T.cloud, maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Logomark size={26} />
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 17, color: T.ink }}>Entrar como anfitrião</div>
          </div>
          <button onClick={onClose}><X size={20} color={T.inkSoft} /></button>
        </div>
        <input type="password" autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Senha de acesso"
          className="w-full rounded-xl px-4 py-3 mb-2 outline-none" style={{ background: T.sand, border: `1.5px solid ${err ? T.danger : T.sandLine}`, fontFamily: "IBM Plex Mono", fontSize: 15 }} />
        {err && <div style={{ color: T.danger, fontFamily: "Inter", fontSize: 12.5, marginBottom: 8 }}>Senha incorreta.</div>}
        <button onClick={submit} className="w-full rounded-xl py-3 mt-2" style={{ background: T.navy, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14.5 }}>Entrar</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Painel admin — lista de todos os imóveis (só aqui dentro)
--------------------------------------------------------- */
function AdminList({ data, onEdit, onPreview, onAdd, onDuplicate, onDelete, onExit, onChangePasscode }) {
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState(data.passcode);
  const [savedPass, setSavedPass] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const copyLink = async (p) => {
    try {
      await navigator.clipboard.writeText(buildGuestLink(p.accessToken));
      setCopiedLinkId(p.id);
      setTimeout(() => setCopiedLinkId(null), 1600);
    } catch (e) {}
  };

  return (
    <div className="flex flex-col" style={{ background: T.sand, minHeight: "100%" }}>
      <div className="px-5 pt-8 pb-6 flex items-center justify-between relative overflow-hidden" style={{ background: T.navyDeep }}>
        <LogomarkWatermark size={220} style={{ bottom: -60, left: -50 }} />
        <div className="relative z-10">
          <div style={{ fontFamily: "Inter", fontSize: 12, color: T.goldSoft, letterSpacing: 1 }}>PAINEL DO ANFITRIÃO</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 21, color: "#fff" }}>Meus imóveis</div>
        </div>
        <button onClick={onExit} style={{ color: "#fff" }} className="relative z-10"><LogOut size={18} /></button>
      </div>

      <div className="px-5 pt-5 flex-1" style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}>
        <button onClick={onAdd} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 mb-2" style={{ background: T.gold, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14 }}>
          <Plus size={16} /> Novo imóvel em branco
        </button>
        <div style={{ fontFamily: "Inter", fontSize: 11.5, color: T.inkSoft, textAlign: "center", marginBottom: 12 }}>
          toque no nome do imóvel para visualizar, ou use os ícones para duplicar/editar/excluir
        </div>

        {data.properties.length === 0 && (
          <div className="text-center py-8" style={{ fontFamily: "Inter", color: T.inkSoft, fontSize: 13.5 }}>Nenhum imóvel cadastrado ainda.</div>
        )}

        {data.properties.map((p) => (
          <div key={p.id} className="rounded-xl mb-3 px-4 py-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <div className="flex items-center justify-between">
              <button onClick={() => onPreview(p.id)} className="min-w-0 text-left flex items-center gap-2 flex-1">
                <Eye size={14} color={T.inkSoft} className="shrink-0" />
                <div className="min-w-0">
                  <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: T.ink }} className="truncate">{p.name}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }} className="truncate">{p.city}</div>
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button onClick={() => onDuplicate(p.id)} title="Duplicar como modelo" className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#F1E7D4", color: T.goldDark }}><CopyIcon size={14} /></button>
                <button onClick={() => onEdit(p.id)} className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: T.sand, color: T.navy }}><Pencil size={14} /></button>
                <button onClick={() => onDelete(p.id)} className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#F4E1DB", color: T.danger }}><Trash2 size={14} /></button>
              </div>
            </div>
            <button onClick={() => copyLink(p)} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 mt-2" style={{ background: T.sand, border: `1px dashed ${T.sandLine}` }}>
              <LinkIcon size={13} color={T.navyMid} />
              <span className="flex-1 truncate text-left" style={{ fontFamily: "IBM Plex Mono", fontSize: 11.5, color: T.inkSoft }}>{buildGuestLink(p.accessToken)}</span>
              <span className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: copiedLinkId === p.id ? T.ok : T.navyMid, color: "#fff" }}>
                {copiedLinkId === p.id ? <Check size={11} /> : <Copy size={11} />}
              </span>
            </button>
          </div>
        ))}

        <button onClick={() => setShowPass((s) => !s)} className="w-full flex items-center justify-between rounded-xl px-4 py-3 mt-6" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
          <span style={{ fontFamily: "Inter", fontSize: 13.5, color: T.ink, fontWeight: 600 }}>Alterar senha de acesso</span>
          <ChevronRight size={16} color={T.inkSoft} style={{ transform: showPass ? "rotate(90deg)" : "none" }} />
        </button>
        {showPass && (
          <div className="rounded-xl px-4 py-3 mt-2" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <input value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full rounded-lg px-3 py-2 mb-2 outline-none" style={{ background: T.sand, border: `1px solid ${T.sandLine}`, fontFamily: "IBM Plex Mono", fontSize: 14 }} />
            <button onClick={() => { onChangePasscode(newPass); setSavedPass(true); setTimeout(() => setSavedPass(false), 1400); }} className="w-full rounded-lg py-2" style={{ background: savedPass ? T.ok : T.navy, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 13.5 }}>
              {savedPass ? "Senha atualizada" : "Salvar nova senha"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, mono = false, textarea = false }) {
  return (
    <div className="mb-3">
      <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft, marginBottom: 4 }}>{label}</div>
      {textarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg px-3 py-2 outline-none resize-none" style={{ background: T.cloud, border: `1px solid ${T.sandLine}`, fontFamily: mono ? "IBM Plex Mono" : "Inter", fontSize: 14 }} />
      ) : (
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: T.cloud, border: `1px solid ${T.sandLine}`, fontFamily: mono ? "IBM Plex Mono" : "Inter", fontSize: 14 }} />
      )}
    </div>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 mb-3" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
      <span style={{ fontFamily: "Inter", fontSize: 13.5, color: T.ink }}>{label}</span>
      <div className="rounded-full" style={{ width: 40, height: 22, background: value ? T.ok : "#D8D2C4", position: "relative", transition: "background 0.15s" }}>
        <div style={{ position: "absolute", top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s" }} />
      </div>
    </button>
  );
}

/* ---------------------------------------------------------
   Formulário de edição de imóvel
--------------------------------------------------------- */
function PropertyForm({ initial, onCancel, onSave }) {
  const [p, setP] = useState(initial);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }));

  const handleUpload = (file) => {
    if (!file) return;
    setUploading(true);
    setImgPreviewError(false);
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 1000;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          async (blob) => {
            try {
              const url = await uploadPhoto(blob);
              set("coverImage")(url);
            } catch (err) {
              console.error("Erro ao enviar foto", err);
              setUploadError(
                err?.message
                  ? `Não foi possível enviar a foto: ${err.message}`
                  : "Não foi possível enviar a foto. Confira se o bucket 'property-photos' existe e tem permissão de upload no Supabase."
              );
            } finally {
              setUploading(false);
            }
          },
          "image/jpeg",
          0.75
        );
      };
      img.onerror = () => { setUploading(false); setUploadError("Não foi possível processar essa imagem."); };
      img.src = ev.target.result;
    };
    reader.onerror = () => { setUploading(false); setUploadError("Não foi possível ler o arquivo selecionado."); };
    reader.readAsDataURL(file);
  };

  const updateListItem = (listKey, id, field, val) => setP((prev) => ({ ...prev, [listKey]: prev[listKey].map((it) => (it.id === id ? { ...it, [field]: val } : it)) }));
  const addListItem = (listKey, empty) => setP((prev) => ({ ...prev, [listKey]: [...(prev[listKey] || []), { id: uid(), ...empty }] }));
  const removeListItem = (listKey, id) => setP((prev) => ({ ...prev, [listKey]: prev[listKey].filter((it) => it.id !== id) }));

  return (
    <div className="flex flex-col" style={{ background: T.sand, minHeight: "100%" }}>
      <div className="px-5 pt-8 pb-5 flex items-center gap-3" style={{ background: T.navyDeep }}>
        <button onClick={onCancel}><ArrowLeft size={19} color="#fff" /></button>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 17, color: "#fff" }}>Editar imóvel</div>
      </div>

      <div className="px-5 pt-5 flex-1" style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}>
        <SectionLabel text="Identificação" />
        <TextField label="Nome do imóvel" value={p.name} onChange={set("name")} />
        <TextField label="Cidade" value={p.city} onChange={set("city")} />

        <div className="mb-1">
          <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft, marginBottom: 4 }}>Foto principal</div>

          {p.coverImage ? (
            <div className="rounded-lg overflow-hidden relative" style={{ height: 150, background: T.sandLine }}>
              {!imgPreviewError ? (
                <img src={p.coverImage} onError={() => setImgPreviewError(true)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center px-3" style={{ fontFamily: "Inter", fontSize: 11.5, color: T.danger }}>Não foi possível exibir esta imagem.</div>
              )}
              <button
                onClick={() => { set("coverImage")(""); setImgPreviewError(false); }}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: "rgba(13,27,42,0.75)", color: "#fff", fontFamily: "Inter", fontSize: 11.5 }}
              >
                <Trash2 size={11} /> Remover
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer"
              style={{ height: 110, background: T.cloud, border: `1.5px dashed ${T.sandLine}` }}
            >
              {uploading ? (
                <span style={{ fontFamily: "Inter", fontSize: 12.5, color: T.inkSoft }}>Processando foto...</span>
              ) : (
                <>
                  <ImageIcon size={20} color={T.inkSoft} />
                  <span style={{ fontFamily: "Inter", fontSize: 12.5, color: T.inkSoft }}>Toque para enviar uma foto do imóvel</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </label>
          )}
          <div style={{ fontFamily: "Inter", fontSize: 11, color: T.inkSoft, marginTop: 4, lineHeight: 1.4 }}>
            Envie diretamente do celular ou computador (a foto é redimensionada automaticamente para carregar rápido).
          </div>
          {uploadError && (
            <div style={{ fontFamily: "Inter", fontSize: 11.5, color: T.danger, marginTop: 6, lineHeight: 1.4 }}>
              {uploadError}
            </div>
          )}
        </div>

        <div className="mt-3">
          <TextField label="Descrição curta (aparece na tela principal)" value={p.description} onChange={set("description")} textarea />
        </div>

        <TextField label="Nome do anfitrião(ã)" value={p.hostName} onChange={set("hostName")} />
        <TextField label="Mensagem de boas-vindas da anfitriã" value={p.hostMessage} onChange={set("hostMessage")} textarea />
        <ToggleField label="Selo de Anfitrião 5 estrelas" value={p.superhost} onChange={set("superhost")} />

        <SectionLabel text="Endereço & horários" />
        <TextField label="Endereço completo" value={p.address} onChange={set("address")} textarea />
        <div className="flex gap-2">
          <div className="flex-1"><TextField label="Check-in" value={p.checkin} onChange={set("checkin")} /></div>
          <div className="flex-1"><TextField label="Check-out" value={p.checkout} onChange={set("checkout")} /></div>
        </div>
        <TextField label="Máximo de hóspedes" value={p.maxGuests} onChange={set("maxGuests")} />

        <SectionLabel text="Acesso ao imóvel" />
        <TextField label="Nome da rede Wi-Fi" value={p.wifiName} onChange={set("wifiName")} mono />
        <TextField label="Senha do Wi-Fi" value={p.wifiPass} onChange={set("wifiPass")} mono />
        <TextField label="Código da porta / fechadura" value={p.doorCode} onChange={set("doorCode")} mono />
        <TextField label="Código do portão" value={p.gateCode} onChange={set("gateCode")} mono />

        <SectionLabel text="Regras da casa" />
        <ToggleField label="Permite pets" value={p.petsAllowed} onChange={set("petsAllowed")} />
        {p.petsAllowed && <TextField label="Observação sobre pets" value={p.petsNote} onChange={set("petsNote")} />}
        <ToggleField label="Permite fumar" value={p.smokingAllowed} onChange={set("smokingAllowed")} />
        <ToggleField label="Permite festas" value={p.partyAllowed} onChange={set("partyAllowed")} />
        <TextField label="Horário de silêncio" value={p.quietHours} onChange={set("quietHours")} />

        <SectionLabel text="Itens da casa" />
        {(p.items || []).map((it) => (
          <div key={it.id} className="rounded-lg p-3 mb-2" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <TextField label="Nome do item" value={it.name} onChange={(v) => updateListItem("items", it.id, "name", v)} />
            <TextField label="Instruções" value={it.instructions} onChange={(v) => updateListItem("items", it.id, "instructions", v)} textarea />
            <button onClick={() => removeListItem("items", it.id)} className="flex items-center gap-1" style={{ color: T.danger, fontFamily: "Inter", fontSize: 12.5 }}><Trash2 size={13} /> Remover item</button>
          </div>
        ))}
        <button onClick={() => addListItem("items", { name: "", instructions: "", icon: "info" })} className="flex items-center gap-1 mb-4" style={{ color: T.navyMid, fontFamily: "Inter", fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Adicionar item</button>

        <SectionLabel text="Contatos de emergência" />
        {(p.emergency || []).map((c) => (
          <div key={c.id} className="rounded-lg p-3 mb-2" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <TextField label="Nome / função" value={c.label} onChange={(v) => updateListItem("emergency", c.id, "label", v)} />
            <TextField label="Telefone" value={c.phone} onChange={(v) => updateListItem("emergency", c.id, "phone", v)} mono />
            <TextField label="Endereço (opcional)" value={c.address} onChange={(v) => updateListItem("emergency", c.id, "address", v)} />
            <div className="mb-2">
              <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft, marginBottom: 4 }}>Categoria</div>
              <select value={c.category} onChange={(e) => updateListItem("emergency", c.id, "category", e.target.value)} className="w-full rounded-lg px-3 py-2 outline-none" style={{ background: T.cloud, border: `1px solid ${T.sandLine}`, fontFamily: "Inter", fontSize: 14 }}>
                {Object.entries(CATEGORY_META).map(([key, m]) => <option key={key} value={key}>{m.label}</option>)}
              </select>
              {c.category === "host" && (
                <div style={{ fontFamily: "Inter", fontSize: 11, color: T.inkSoft, marginTop: 4 }}>
                  Contatos marcados como "Anfitrião" ganham automaticamente um botão de WhatsApp na tela do hóspede (use o telefone com DDD).
                </div>
              )}
            </div>
            <button onClick={() => removeListItem("emergency", c.id)} className="flex items-center gap-1" style={{ color: T.danger, fontFamily: "Inter", fontSize: 12.5 }}><Trash2 size={13} /> Remover contato</button>
          </div>
        ))}
        <button onClick={() => addListItem("emergency", { label: "", phone: "", address: "", category: "outro" })} className="flex items-center gap-1 mb-4" style={{ color: T.navyMid, fontFamily: "Inter", fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Adicionar contato</button>

        <SectionLabel text="Recomendações locais" />
        {(p.recommendations || []).map((r) => (
          <div key={r.id} className="rounded-lg p-3 mb-2" style={{ background: T.cloud, border: `1px solid ${T.sandLine}` }}>
            <TextField label="Nome do local" value={r.name} onChange={(v) => updateListItem("recommendations", r.id, "name", v)} />
            <TextField label="Observação" value={r.note} onChange={(v) => updateListItem("recommendations", r.id, "note", v)} />
            <button onClick={() => removeListItem("recommendations", r.id)} className="flex items-center gap-1" style={{ color: T.danger, fontFamily: "Inter", fontSize: 12.5 }}><Trash2 size={13} /> Remover recomendação</button>
          </div>
        ))}
        <button onClick={() => addListItem("recommendations", { name: "", note: "" })} className="flex items-center gap-1 mb-4" style={{ color: T.navyMid, fontFamily: "Inter", fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Adicionar recomendação</button>

        <SectionLabel text="Checklist de saída" />
        {(p.checklist || []).map((it) => (
          <div key={it.id} className="flex items-center gap-2 mb-2">
            <input value={it.text} onChange={(e) => updateListItem("checklist", it.id, "text", e.target.value)} className="flex-1 rounded-lg px-3 py-2 outline-none" style={{ background: T.cloud, border: `1px solid ${T.sandLine}`, fontFamily: "Inter", fontSize: 13.5 }} />
            <button onClick={() => removeListItem("checklist", it.id)} style={{ color: T.danger }}><Trash2 size={15} /></button>
          </div>
        ))}
        <button onClick={() => addListItem("checklist", { text: "" })} className="flex items-center gap-1 mb-6" style={{ color: T.navyMid, fontFamily: "Inter", fontWeight: 600, fontSize: 13 }}><Plus size={14} /> Adicionar item ao checklist</button>

        <button onClick={() => onSave(p)} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5" style={{ background: T.navy, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14.5 }}>
          <Save size={16} /> Salvar alterações
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Configuração inicial — o próprio anfitrião cria sua senha
--------------------------------------------------------- */
function SetupScreen({ onComplete }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [startWithExample, setStartWithExample] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (pass.length < 6) { setErr("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (pass !== confirm) { setErr("As senhas não coincidem."); return; }
    setErr("");
    setSaving(true);
    await onComplete(pass, startWithExample);
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8" style={{ minHeight: "100%", background: T.sand }}>
      <div className="w-full" style={{ maxWidth: 380 }}>
        <div className="flex flex-col items-center mb-5">
          <Logomark size={48} />
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 19, color: T.ink, marginTop: 10 }}>Configurar seu painel</div>
          <div style={{ fontFamily: "Inter", fontSize: 12.5, color: T.inkSoft, textAlign: "center", marginTop: 4 }}>
            Primeiro acesso — crie a senha que só você (anfitrião) vai usar para editar os imóveis.
          </div>
        </div>

        <TextField label="Crie uma senha de acesso" value={pass} onChange={setPass} mono />
        <TextField label="Confirme a senha" value={confirm} onChange={setConfirm} mono />
        {err && <div style={{ color: T.danger, fontFamily: "Inter", fontSize: 12.5, marginBottom: 8 }}>{err}</div>}

        <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft, marginTop: 6, marginBottom: 6 }}>Como você quer começar?</div>
        <button onClick={() => setStartWithExample(true)} className="w-full flex items-start gap-3 rounded-xl px-4 py-3 mb-2 text-left" style={{ background: T.cloud, border: `1.5px solid ${startWithExample ? T.gold : T.sandLine}` }}>
          {startWithExample ? <CheckSquare size={18} color={T.gold} className="shrink-0 mt-0.5" /> : <Square size={18} color={T.inkSoft} className="shrink-0 mt-0.5" />}
          <div>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>Começar com um imóvel de exemplo</div>
            <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>Já vem preenchido (Loft 127) para você usar como modelo e duplicar.</div>
          </div>
        </button>
        <button onClick={() => setStartWithExample(false)} className="w-full flex items-start gap-3 rounded-xl px-4 py-3 mb-4 text-left" style={{ background: T.cloud, border: `1.5px solid ${!startWithExample ? T.gold : T.sandLine}` }}>
          {!startWithExample ? <CheckSquare size={18} color={T.gold} className="shrink-0 mt-0.5" /> : <Square size={18} color={T.inkSoft} className="shrink-0 mt-0.5" />}
          <div>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: T.ink }}>Começar em branco</div>
            <div style={{ fontFamily: "Inter", fontSize: 12, color: T.inkSoft }}>Sem nenhum imóvel cadastrado ainda.</div>
          </div>
        </button>

        <button onClick={submit} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5" style={{ background: T.navy, color: "#fff", fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Configurando..." : "Concluir configuração"}
        </button>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   App principal
--------------------------------------------------------- */
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [view, setView] = useState("locked"); // locked | detail | admin
  const [activeId, setActiveId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [guestLocked, setGuestLocked] = useState(false);
  const [guestNotFound, setGuestNotFound] = useState(false);

  const persist = useCallback(async (next) => {
    setData(next);
    try { await saveGuideData(next); } catch (e) { console.error("Erro ao salvar", e); }
  }, []);

  const checkToken = useCallback((loaded) => {
    const token = extractToken();
    if (!token) return;
    const prop = loaded.properties.find((p) => p.accessToken === token);
    if (prop) {
      setActiveId(prop.id);
      setGuestLocked(true);
      setView("detail");
      setGuestNotFound(false);
    } else {
      setGuestNotFound(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      let loaded = null;
      try {
        loaded = await loadGuideData();
      } catch (e) {
        console.error("Erro ao carregar dados do Supabase", e);
      }

      if (!loaded) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      setData(loaded);
      checkToken(loaded);
      setLoading(false);
    })();
  }, [checkToken]);

  useEffect(() => {
    const handler = () => { if (data) checkToken(data); };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [data, checkToken]);

  const completeSetup = async (passcode, startWithExample) => {
    const initial = {
      passcode,
      properties: startWithExample
        ? EXAMPLE_PROPERTIES.map((p) => ({ ...p, id: uid(), accessToken: genToken() }))
        : [],
    };
    await persist(initial);
    setNeedsSetup(false);
  };

  if (loading) {
    return (
      <div style={{ height: "100dvh", width: "100%", maxWidth: 560, margin: "0 auto", position: "relative", overflow: "hidden", background: T.sand }}>
        <style>{FONT_IMPORT}</style>
        <div className="flex items-center justify-center" style={{ height: "100%" }}>
          <div style={{ fontFamily: "Inter", color: T.inkSoft, fontSize: 14 }}>Carregando guia...</div>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div style={{ height: "100dvh", width: "100%", maxWidth: 560, margin: "0 auto", position: "relative", overflow: "hidden", background: T.sand }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <SetupScreen onComplete={completeSetup} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const activeProperty = data.properties.find((p) => p.id === activeId);
  const editingProperty = editingId === "__new__"
    ? { id: uid(), accessToken: genToken(), name: "Novo imóvel", city: "", hue: data.properties.length, coverImage: "", description: "", hostName: "", hostMessage: "", superhost: false, address: "", checkin: "15:00", checkout: "11:00", maxGuests: "", petsAllowed: false, petsNote: "", smokingAllowed: false, partyAllowed: false, quietHours: "22h às 8h", wifiName: "", wifiPass: "", doorCode: "", gateCode: "", items: [], checklist: DEFAULT_CHECKLIST(), emergency: [], recommendations: [] }
    : data.properties.find((p) => p.id === editingId);

  const savePropertyForm = async (p) => {
    const exists = data.properties.some((x) => x.id === p.id);
    const nextProps = exists ? data.properties.map((x) => (x.id === p.id ? p : x)) : [...data.properties, p];
    await persist({ ...data, properties: nextProps });
    setEditingId(null);
    setView("admin");
  };

  const deleteProperty = async (id) => {
    const ok = confirm("Remover este imóvel? Essa ação não pode ser desfeita.");
    if (!ok) return;
    await persist({ ...data, properties: data.properties.filter((p) => p.id !== id) });
  };

  const duplicateProperty = async (id) => {
    const src = data.properties.find((p) => p.id === id);
    if (!src) return;
    const clone = {
      ...src,
      id: uid(),
      accessToken: genToken(),
      name: `${src.name} (cópia)`,
      hue: data.properties.length,
      items: (src.items || []).map((it) => ({ ...it, id: uid() })),
      emergency: (src.emergency || []).map((it) => ({ ...it, id: uid() })),
      recommendations: (src.recommendations || []).map((it) => ({ ...it, id: uid() })),
      checklist: (src.checklist || []).map((it) => ({ ...it, id: uid() })),
    };
    await persist({ ...data, properties: [...data.properties, clone] });
    setEditingId(clone.id);
  };

  const changePasscode = async (newPass) => { if (newPass) await persist({ ...data, passcode: newPass }); };

  return (
    <div style={{ height: "100dvh", width: "100%", maxWidth: 560, margin: "0 auto", fontFamily: "Inter", position: "relative", overflow: "hidden", background: T.sand }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ height: "100%", overflowY: "auto" }}>
        {view === "locked" && !guestNotFound && <LockedLanding onAdminClick={() => setShowLogin(true)} />}

        {guestNotFound && (
          <div className="flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "100%" }}>
            <Logomark size={48} />
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 18, color: T.ink, marginTop: 16 }}>Link não encontrado</div>
            <div style={{ fontFamily: "Inter", fontSize: 13.5, color: T.inkSoft, marginTop: 6 }}>Este link de acesso não é válido ou o imóvel foi removido. Fale com a sua anfitriã para receber o link correto.</div>
          </div>
        )}

        {view === "detail" && activeProperty && <DetailView p={activeProperty} onBack={() => setView("admin")} guestLocked={guestLocked} />}
        {view === "admin" && !editingId && (
          <AdminList
            data={data}
            onEdit={(id) => setEditingId(id)}
            onPreview={(id) => { setActiveId(id); setGuestLocked(false); setView("detail"); }}
            onAdd={() => setEditingId("__new__")}
            onDuplicate={duplicateProperty}
            onDelete={deleteProperty}
            onExit={() => setView("locked")}
            onChangePasscode={changePasscode}
          />
        )}
        {view === "admin" && editingId && editingProperty && <PropertyForm initial={editingProperty} onCancel={() => setEditingId(null)} onSave={savePropertyForm} />}
      </div>

      {showLogin && <AdminLoginModal passcode={data.passcode} onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setView("admin"); }} />}
    </div>
  );
}
