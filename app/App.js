import React, { useRef, useState } from "react";
import {
  Animated, FlatList, Image, KeyboardAvoidingView, Modal, PanResponder,
  Platform, Pressable, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

/* ================= Link.Up tema (gul / sort / grøn) ================= */
const C = {
  bg: "#f8da54", teal: "#175f55", tealDark: "#114a42", sage: "#83c2a2",
  soft: "#ddefe4", ink: "#1c1c1c", muted: "#6e6b5c", card: "#ffffff",
  ok: "#2c8c74", warn: "#d99a2b", hot: "#c95f7b",
};
const AVA = ["#2c8c74", "#c95f7b", "#d99a2b", "#3ba776", "#5a7bd8", "#5a8a6d"];
const BADGE = {
  open: { label: "Åben", color: C.ok, fg: "#fff" },
  very: { label: "Meget åben", color: C.teal, fg: "#fff" },
  special: { label: "Åben for særlige muligheder", color: C.warn, fg: C.ink },
  active: { label: "Aktivt søgende", color: C.hot, fg: "#fff" },
};
const MASCOT = {
  dance: require("./assets/mascot/dance.png"),
  sit: require("./assets/mascot/sit.png"),
  lookup: require("./assets/mascot/lookup.png"),
  idle: require("./assets/mascot/idle.png"),
  walk: require("./assets/mascot/walk.png"),
  cheer: require("./assets/mascot/cheer.png"),
  wave: require("./assets/mascot/wave.png"),
};

const PEOPLE = [
  { id: "vera", pose: "dance", name: "Vera, 26", role: "Vokalist / Sangskriver", area: "musik vokal sang",
    exp: "4 års erfaring", edu: "MGK, 2022", badge: "active",
    desc: "R&B- og drain-vokal. Skriver toplines på eget hjemmestudie og leder efter producere med et drømmende lydbillede." },
  { id: "moss", pose: "sit", name: "Malik, 24", role: "Producer", area: "musik producer beats pluggnb",
    exp: "6 års erfaring", edu: "Selvlært, 2019", badge: "very",
    desc: "Pluggnb og cloud. Har release med tre danske artister og et bibliotek på 200+ beats. Søger vokalister og rappere." },
  { id: "line", pose: "lookup", name: "Line, 31", role: "Fotograf", area: "foto fotograf pressefoto analog",
    exp: "8 års erfaring", edu: "Fatamorgana, 2018", badge: "open",
    desc: "35mm og studie. Skyder pressefotos, covers og kampagner — mest musik og mode. Base på Vesterbro." },
  { id: "axo", pose: "idle", name: "Anton, 28", role: "Grafisk designer", area: "design grafik covers artwork",
    exp: "5 års erfaring", edu: "DMJX, 2021", badge: "special",
    desc: "Typografi og cover-artwork. Har lavet singles-covers for 40+ udgivelser." },
  { id: "juno", pose: "walk", name: "Jonas, 27", role: "Videograf / Klipper", area: "video film musikvideo klip",
    exp: "7 års erfaring", edu: "Super16, 2020", badge: "very",
    desc: "Musikvideoer og visualizers. Ét-mands-hold: idé, optagelse, klip og grade." },
  { id: "sara", pose: "cheer", name: "Sara, 30", role: "Mix & Master", area: "musik mix master lyd studie",
    exp: "9 års erfaring", edu: "Sonic College, 2017", badge: "open",
    desc: "Mixer og masterer fra eget rum i NV. 300+ udgivelser gennem hænderne. Fast turnaround på 5 dage." },
];
const REPLY = {
  vera: "Hej! Fed timing — jeg sidder faktisk og mangler beats til to nye toplines. Send noget over?",
  moss: "Yo! Lyder fedt. Smid en reference, så finder vi noget der matcher.",
  line: "Hej! Tak for beskeden — jeg har ledige datoer i næste måned. Hvad er projektet?",
  axo: "Hey! Send musikken med — jeg vil altid høre den, før jeg siger ja til artwork.",
  juno: "Hej hej! Jeg er frisk. Har du en dato og en lokation i tankerne?",
  sara: "Hej! Send dine stems, så vender jeg tilbage med en tid.",
};
const FILTERS = [["Alle", null], ["Musik", "musik"], ["Foto", "foto"], ["Design", "design"], ["Video", "video"]];

const avaColor = (id) => AVA[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVA.length];
const initials = (name) => name.split(",")[0].slice(0, 2).toUpperCase();

/* ================= små byggesten ================= */
const Pill = ({ text, color = C.teal, fg = "#fff" }) => (
  <View style={[s.pill, { backgroundColor: color }]}>
    <Text style={[s.pillText, { color: fg }]}>{text}</Text>
  </View>
);
const Btn = ({ label, onPress, kind = "primary", style }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [
    s.btn, kind === "primary" ? s.btnPrimary : s.btnSoft,
    pressed && { transform: [{ translateX: 2 }, { translateY: 2 }], shadowOffset: { width: 1, height: 1 } },
    style,
  ]}>
    <Text style={[s.btnText, kind === "primary" ? { color: "#fff" } : { color: C.ink }]}>{label}</Text>
  </Pressable>
);
const Logo = ({ size = 26 }) => (
  <Text style={[s.logo, { fontSize: size }]}>
    Li<Text style={{ color: C.sage }}>n</Text>k.<Text style={{ color: C.teal }}>Up</Text>
  </Text>
);

/* ================= profilkort + swipe-dæk ================= */
function ProfileCard({ p, onReach, onProfile }) {
  const b = BADGE[p.badge];
  return (
    <View style={s.card}>
      <View style={[s.photo, { backgroundColor: avaColor(p.id) }]}>
        <Image source={MASCOT[p.pose]} style={s.mascot} resizeMode="contain" />
      </View>
      <View style={s.info}>
        <Text style={s.who}>{p.name}</Text>
        <Text style={s.role}>{p.role}</Text>
        <View style={s.pillRow}>
          <Pill text={`💼 ${p.exp}`} />
          <Pill text={`🎓 ${p.edu}`} />
          <Pill text={`📅 ${b.label}`} color={b.color} fg={b.fg} />
        </View>
        <View style={s.actions}>
          <Btn label="Se profil" kind="soft" style={{ flex: 1 }} onPress={() => onProfile(p)} />
          <Btn label="Ræk ud" style={{ flex: 1 }} onPress={() => onReach(p)} />
        </View>
      </View>
    </View>
  );
}

function Deck({ people, onReach, onProfile }) {
  const [idx, setIdx] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 110) {
          Animated.timing(pan, {
            toValue: { x: Math.sign(g.dx) * 500, y: g.dy }, duration: 220, useNativeDriver: false,
          }).start(() => { pan.setValue({ x: 0, y: 0 }); setIdx((i) => i + 1); });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (!people.length) {
    return <View style={s.empty}><Text style={s.emptyText}>Ingen profiler matcher din søgning endnu.{"\n"}Prøv et bredere arbejdsområde.</Text></View>;
  }
  const top = people[idx % people.length];
  const next = people[(idx + 1) % people.length];
  const rotate = pan.x.interpolate({ inputRange: [-300, 300], outputRange: ["-12deg", "12deg"] });
  return (
    <View style={{ flex: 1 }}>
      {people.length > 1 && (
        <View style={[s.cardWrap, { transform: [{ scale: 0.96 }, { translateY: -8 }] }]} pointerEvents="none">
          <ProfileCard p={next} onReach={() => {}} onProfile={() => {}} />
        </View>
      )}
      <Animated.View
        style={[s.cardWrap, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
        {...responder.panHandlers}
      >
        <ProfileCard p={top} onReach={onReach} onProfile={onProfile} />
      </Animated.View>
    </View>
  );
}

/* ================= app ================= */
function LinkUpApp() {
  const [screen, setScreen] = useState("login"); // login | find | chat | thread | me
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(null);
  const [pitchFor, setPitchFor] = useState(null);
  const [profFor, setProfFor] = useState(null);
  const [pitch, setPitch] = useState("");
  const [toast, setToast] = useState("");
  const [unread, setUnread] = useState(false);
  const [meProf, setMeProf] = useState("producer");
  const [threads, setThreads] = useState([
    { id: "moss", person: PEOPLE[1], msgs: [
      { sys: true, text: "I blev forbundet i går" },
      { me: true, text: "Yo! Hørte dine beats — jeg har en vokal, der ville sidde perfekt." },
      { me: false, text: REPLY.moss },
    ] },
  ]);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState("");

  const say = (t) => { setToast(t); setTimeout(() => setToast(""), 2600); };

  const people = PEOPLE.filter((p) => {
    const hay = (p.role + " " + p.area).toLowerCase();
    if (filter && !hay.includes(filter)) return false;
    const q = query.trim().toLowerCase();
    if (q && !hay.includes(q) && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const sendPitch = () => {
    if (!pitch.trim()) { say("Skriv en kort pitch først."); return; }
    const p = pitchFor, txt = pitch;
    setPitchFor(null); setPitch("");
    say(`Anmodning sendt til ${p.name.split(",")[0]}`);
    setTimeout(() => {
      setThreads((ts) => ts.find((t) => t.id === p.id) ? ts : [{
        id: p.id, person: p, msgs: [
          { sys: true, text: `${p.name.split(",")[0]} accepterede din anmodning` },
          { me: true, text: txt }, { me: false, text: REPLY[p.id] },
        ],
      }, ...ts]);
      setUnread(true);
      say(`${p.name.split(",")[0]} accepterede din anmodning ✓`);
    }, 2800);
  };

  const sendMsg = () => {
    if (!draft.trim()) return;
    setThreads((ts) => ts.map((t) => t.id === openId ? { ...t, msgs: [...t.msgs, { me: true, text: draft }] } : t));
    setDraft("");
  };

  const thread = threads.find((t) => t.id === openId);
  const me = meProf === "producer"
    ? { sub: "Producer · København", pills: [["💼 7 års erfaring", C.teal, "#fff"], ["🎓 Selvlært, 2018", C.teal, "#fff"], [`📅 ${BADGE.very.label}`, C.teal, "#fff"]],
        desc: "Drain, cloud og pluggnb. Bygger komplette lydbilleder og har eget bibliotek af arps og loops." }
    : { sub: "Grafisk designer · København", pills: [["💼 5 års erfaring", C.teal, "#fff"], ["🎓 Selvlært, 2020", C.teal, "#fff"], [`📅 ${BADGE.special.label}`, BADGE.special.color, C.ink]],
        desc: "Brand-design, emballage og covers. Driver til daglig tre brands og designer alt selv." };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {screen === "login" && (
        <View style={s.login}>
          <Logo size={46} />
          <Text style={s.tagline}>Start connecting</Text>
          <View style={{ gap: 12, alignItems: "center", marginTop: 34 }}>
            <Btn label="Login" kind="soft" style={{ width: 230 }} onPress={() => setScreen("find")} />
            <Btn label="Opret Konto" style={{ width: 230 }} onPress={() => setScreen("find")} />
            <Text style={s.note}>Proof of concept — alle profiler og beskeder er demo-data.</Text>
          </View>
        </View>
      )}

      {screen === "find" && (
        <View style={{ flex: 1 }}>
          <View style={s.topbar}><Logo /></View>
          <View style={{ paddingHorizontal: 18, gap: 10 }}>
            <View style={s.search}>
              <Text style={{ color: C.muted }}>⌕</Text>
              <TextInput value={query} onChangeText={setQuery} placeholder="Søg titel eller arbejdsområde…"
                placeholderTextColor={C.muted} style={s.searchInput} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {FILTERS.map(([lbl, val]) => (
                <Pressable key={lbl} onPress={() => setFilter(val)}
                  style={[s.chip, filter === val && s.chipOn]}>
                  <Text style={[s.chipText, filter === val && { color: C.bg }]}>{lbl}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View style={{ flex: 1, margin: 18, marginTop: 8 }}>
            <Deck people={people} onReach={setPitchFor} onProfile={setProfFor} />
          </View>
          <Text style={s.hint}>SWIPE FOR AT BLADRE</Text>
        </View>
      )}

      {screen === "chat" && (
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Beskeder</Text>
          <FlatList data={threads} keyExtractor={(t) => t.id} contentContainerStyle={{ padding: 18, gap: 10 }}
            ListEmptyComponent={<Text style={s.emptyText}>Ingen samtaler endnu.{"\n"}Ræk ud til nogen fra Søg-fanen.</Text>}
            renderItem={({ item }) => {
              const last = item.msgs[item.msgs.length - 1];
              return (
                <Pressable style={s.thread} onPress={() => { setOpenId(item.id); setScreen("thread"); }}>
                  <View style={[s.ava, { backgroundColor: avaColor(item.id) }]}>
                    <Text style={s.avaText}>{initials(item.person.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tName}>{item.person.name.split(",")[0]} <Text style={s.tRole}>· {item.person.role}</Text></Text>
                    <Text style={s.tPrev} numberOfLines={1}>{last.text}</Text>
                  </View>
                  <Text style={{ color: C.ok, fontWeight: "800" }}>✓</Text>
                </Pressable>
              );
            }} />
        </View>
      )}

      {screen === "thread" && thread && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.chatHead}>
            <Pressable onPress={() => setScreen("chat")} style={s.backBtn}><Text style={{ fontSize: 18 }}>‹</Text></Pressable>
            <View style={[s.ava, { backgroundColor: avaColor(thread.id) }]}>
              <Text style={s.avaText}>{initials(thread.person.name)}</Text>
            </View>
            <View>
              <Text style={s.tName}>{thread.person.name.split(",")[0]}</Text>
              <Text style={s.tRole}>{thread.person.role}</Text>
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 8 }}>
            {thread.msgs.map((m, i) => m.sys
              ? <Text key={i} style={s.sysline}>{m.text}</Text>
              : <View key={i} style={[s.msg, m.me ? s.msgMe : s.msgThem]}>
                  <Text style={{ color: m.me ? "#fff" : C.ink, fontSize: 14.5 }}>{m.text}</Text>
                </View>)}
          </ScrollView>
          <View style={s.composer}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Skriv en besked…"
              placeholderTextColor={C.muted} style={s.composerInput} onSubmitEditing={sendMsg} />
            <Pressable onPress={sendMsg} style={s.sendBtn}><Text style={{ color: "#fff", fontSize: 16 }}>➤</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {screen === "me" && (
        <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
          <Text style={[s.title, { paddingHorizontal: 0, paddingTop: 0 }]}>Min profil</Text>
          <View style={s.profCard}>
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <View style={[s.ava, { width: 62, height: 62, backgroundColor: C.teal }]}>
                <Text style={[s.avaText, { fontSize: 21 }]}>FJ</Text>
              </View>
              <View>
                <Text style={s.who}>Frederik, 29</Text>
                <Text style={s.role}>{me.sub}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[["producer", "Producer"], ["design", "Grafisk designer"]].map(([k, lbl]) => (
                <Pressable key={k} onPress={() => setMeProf(k)} style={[s.chip, meProf === k && s.chipOn]}>
                  <Text style={[s.chipText, meProf === k && { color: C.bg }]}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.pillRow}>{me.pills.map(([t, c, fg], i) => <Pill key={i} text={t} color={c} fg={fg} />)}</View>
            <Text style={{ fontSize: 14, lineHeight: 21 }}>{me.desc}</Text>
          </View>
          <View style={s.profNote}>
            <Text style={{ fontSize: 12.5, lineHeight: 19, fontWeight: "600" }}>
              Flere profiler, én konto. Skift mellem dine professioner ovenfor — hver profil har sine egne
              bulletpoints og portfolio og vises kun for dem, der søger netop dét.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* pitch-modal */}
      <Modal visible={!!pitchFor} transparent animationType="slide" onRequestClose={() => setPitchFor(null)}>
        <View style={s.modalWrap}>
          <View style={s.sheet}>
            <Pressable onPress={() => setPitchFor(null)}><Text style={s.close}>Luk</Text></Pressable>
            <Text style={s.sheetTitle}>Ræk ud</Text>
            {pitchFor && <Text style={s.sheetSub}>
              Til {pitchFor.name.split(",")[0]} · {pitchFor.role}. {pitchFor.name.split(",")[0]} skal acceptere
              din anmodning, før chatten åbner.</Text>}
            <TextInput value={pitch} onChangeText={(t) => t.length <= 600 && setPitch(t)} multiline
              placeholder="Skriv en kort pitch — hvorfor vil du gerne i kontakt? (max 600 tegn)"
              placeholderTextColor={C.muted} style={s.pitchInput} />
            <Text style={s.charcount}>{pitch.length}/600</Text>
            <Btn label="Send anmodning" onPress={sendPitch} />
          </View>
        </View>
      </Modal>

      {/* profil-modal */}
      <Modal visible={!!profFor} transparent animationType="slide" onRequestClose={() => setProfFor(null)}>
        <View style={s.modalWrap}>
          {profFor && (
            <View style={s.sheet}>
              <Pressable onPress={() => setProfFor(null)}><Text style={s.close}>Luk</Text></Pressable>
              <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                <View style={[s.ava, { width: 56, height: 56, backgroundColor: avaColor(profFor.id) }]}>
                  <Text style={[s.avaText, { fontSize: 19 }]}>{initials(profFor.name)}</Text>
                </View>
                <View>
                  <Text style={s.who}>{profFor.name}</Text>
                  <Text style={s.role}>{profFor.role}</Text>
                </View>
              </View>
              <View style={s.pillRow}>
                <Pill text={`💼 ${profFor.exp}`} />
                <Pill text={`🎓 ${profFor.edu}`} />
                <Pill text={`📅 ${BADGE[profFor.badge].label}`} color={BADGE[profFor.badge].color} fg={BADGE[profFor.badge].fg} />
              </View>
              <Text style={{ fontSize: 14, lineHeight: 21 }}>{profFor.desc}</Text>
              <Btn label="Ræk ud" onPress={() => { const p = profFor; setProfFor(null); setPitchFor(p); }} />
            </View>
          )}
        </View>
      </Modal>

      {!!toast && <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>}

      {screen !== "login" && screen !== "thread" && (
        <View style={s.nav}>
          {[["find", "⌕", "Søg"], ["chat", "🗨", "Beskeder"], ["me", "☺", "Profil"]].map(([k, ic, lbl]) => (
            <Pressable key={k} onPress={() => { setScreen(k); if (k === "chat") setUnread(false); }} style={s.navBtn}>
              <Text style={{ fontSize: 20, color: screen === k ? C.teal : C.muted }}>{ic}</Text>
              <Text style={[s.navLbl, { color: screen === k ? C.teal : C.muted }]}>{lbl}</Text>
              {k === "chat" && unread && <View style={s.dot} />}
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LinkUpApp />
    </SafeAreaProvider>
  );
}

/* ================= styles ================= */
const sticker = { borderWidth: 2.5, borderColor: C.ink, shadowColor: C.ink, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 4, height: 4 }, elevation: 3 };
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  logo: { fontWeight: "800", color: C.ink, letterSpacing: -0.5, transform: [{ rotate: "-2deg" }] },
  tagline: { fontStyle: "italic", fontWeight: "700", color: C.teal, fontSize: 12, letterSpacing: 1.2, marginTop: 6 },
  login: { flex: 1, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 12, color: C.muted, textAlign: "center", maxWidth: 240, marginTop: 10, fontWeight: "600" },

  btn: { ...sticker, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, alignItems: "center" },
  btnPrimary: { backgroundColor: C.teal },
  btnSoft: { backgroundColor: C.soft },
  btnText: { fontWeight: "800", fontSize: 15 },

  topbar: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  search: { ...sticker, shadowOffset: { width: 2, height: 2 }, borderWidth: 2, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 15, color: C.ink, padding: 0 },
  chip: { ...sticker, shadowOffset: { width: 2, height: 2 }, borderWidth: 2, backgroundColor: "#fff", borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  chipOn: { backgroundColor: C.ink },
  chipText: { fontWeight: "800", fontSize: 12.5, color: C.ink },

  cardWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  card: { ...sticker, shadowOffset: { width: 6, height: 6 }, flex: 1, backgroundColor: "#fff", borderRadius: 22, overflow: "hidden" },
  photo: { flex: 1, borderBottomWidth: 2.5, borderColor: C.ink, alignItems: "center", justifyContent: "center" },
  mascot: { width: "80%", height: "88%" },
  info: { padding: 15, gap: 9 },
  who: { fontSize: 20, fontWeight: "800", color: C.ink },
  role: { fontSize: 13.5, color: C.muted, fontWeight: "600" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  pill: { borderWidth: 1.5, borderColor: C.ink, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  pillText: { fontSize: 11.5, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, paddingTop: 4 },
  hint: { textAlign: "center", fontSize: 10.5, color: C.ink, opacity: 0.55, paddingBottom: 8, letterSpacing: 1.2, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: C.ink, opacity: 0.6, textAlign: "center", fontSize: 15, fontWeight: "600", lineHeight: 23 },

  title: { fontSize: 23, fontWeight: "800", color: C.ink, paddingHorizontal: 18, paddingTop: 12 },
  thread: { ...sticker, shadowOffset: { width: 3, height: 3 }, borderWidth: 2, flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 13 },
  ava: { width: 44, height: 44, borderRadius: 999, borderWidth: 2, borderColor: C.ink, alignItems: "center", justifyContent: "center" },
  avaText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  tName: { fontWeight: "800", fontSize: 15, color: C.ink },
  tRole: { fontWeight: "600", fontSize: 12, color: C.muted },
  tPrev: { color: C.muted, fontSize: 13 },

  chatHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 8 },
  backBtn: { ...sticker, shadowOffset: { width: 2, height: 2 }, borderWidth: 2, width: 38, height: 38, borderRadius: 999, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  msg: { maxWidth: "78%", padding: 11, borderRadius: 16, borderWidth: 2, borderColor: C.ink },
  msgThem: { backgroundColor: "#fff", alignSelf: "flex-start", borderBottomLeftRadius: 5 },
  msgMe: { backgroundColor: C.teal, alignSelf: "flex-end", borderBottomRightRadius: 5 },
  sysline: { alignSelf: "center", fontSize: 11.5, color: C.ink, opacity: 0.65, backgroundColor: "rgba(255,255,255,.7)", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, overflow: "hidden", fontWeight: "700" },
  composer: { flexDirection: "row", gap: 8, padding: 14 },
  composerInput: { flex: 1, borderWidth: 2, borderColor: C.ink, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, backgroundColor: "#fff", color: C.ink },
  sendBtn: { ...sticker, shadowOffset: { width: 2, height: 2 }, borderWidth: 2, width: 46, height: 46, borderRadius: 999, backgroundColor: C.teal, alignItems: "center", justifyContent: "center" },

  profCard: { ...sticker, shadowOffset: { width: 5, height: 5 }, backgroundColor: "#fff", borderRadius: 22, padding: 18, gap: 12 },
  profNote: { backgroundColor: C.soft, borderWidth: 2, borderStyle: "dashed", borderColor: C.teal, borderRadius: 16, padding: 13 },

  modalWrap: { flex: 1, backgroundColor: "rgba(23,21,18,.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 3, borderColor: C.ink, padding: 20, paddingBottom: 30, gap: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: C.ink },
  sheetSub: { color: C.muted, fontSize: 13, marginTop: -8 },
  close: { alignSelf: "flex-end", color: C.muted, fontWeight: "800", fontSize: 14 },
  pitchInput: { borderWidth: 2, borderColor: C.ink, borderRadius: 14, padding: 12, minHeight: 110, fontSize: 15, color: C.ink, textAlignVertical: "top" },
  charcount: { fontSize: 11, color: C.muted, textAlign: "right", marginTop: -8, fontWeight: "700" },

  toast: { position: "absolute", bottom: 100, alignSelf: "center", backgroundColor: C.ink, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18, zIndex: 60 },
  toastText: { color: C.bg, fontSize: 13.5, fontWeight: "700" },

  nav: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 2.5, borderColor: C.ink, paddingTop: 8, paddingBottom: 12 },
  navBtn: { flex: 1, alignItems: "center", gap: 2 },
  navLbl: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  dot: { position: "absolute", top: 2, right: "30%", width: 10, height: 10, borderRadius: 999, backgroundColor: C.hot, borderWidth: 1.5, borderColor: C.ink },
});
