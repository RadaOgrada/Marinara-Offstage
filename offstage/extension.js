// Offstage — a side panel for group scenes in Marinara Engine.
// Who's here (here / away), whispers, emotions, reply mode, private notes "in their ear",
// and markers on hidden messages. Russian / English interface.
// Runs inside Marinara's page (full_page_access) and talks only to Marinara's own /api.
//
// Internal identifiers (chat metadata keys, CSS classes, storage keys) keep the original
// "kulisy" prefix (the panel's Russian name) so existing chats keep working.

const VERSION = "0.7.0";
const ACTIVE_CHAT_KEY = "marinara-active-chat-id";
const AWAY_KEY = "kulisyAway"; // chat metadata: { characterId → createdAt of the last message when they left }
const EAR_KEY = "kulisyEarLorebookId"; // chat metadata: id of this chat's "in their ear" lorebook
const EAR_LOUD_DEPTH = 1; // "loud" — right before the reply
const FEEL_KEY = "kulisyFeelings"; // chat metadata: { characterId → [{ e: emotion, lv: 1..3, to: [id | "user"] }] }
const FEEL_MAX = 3;
const USER_TARGET = "user"; // the user's persona in the "toward" checkboxes
const MODE_KEY = "kulisyMode"; // chat metadata: { all | characterId → { f: form, l: length } }
const MODE_ALL = "all"; // the "Everyone" row
const MODE_OFF = "off"; // in a personal row: "as usual", even though "Everyone" has it pressed

// ---------- language ----------
// Every visible word and every text the model reads lives here. "ru" is the original
// wording; "en" is the English translation. Placeholders: {name}, {who}, {err}, …

const I18N = {
  ru: {
    title: "Кулисы",
    close: "Закрыть",
    lang_title: "Язык панели",
    sec_here: "Кто рядом",
    here_clear: "Вернуть всех",
    here_hint: "«Не здесь» — персонаж не слышит ничего нового в чате, пока не вернёшь его.",
    sec_whisper: "Шёпот",
    all_label: "Всем",
    all_ph: "*Кир наклонился к Вивиан и прошептал*",
    whisper_label: "Шёпот",
    whisper_ph: "— Встретимся в полночь.",
    who_label: "Кто слышит шёпот",
    clear_all: "Снять все",
    send: "Отправить",
    sec_feel: "Эмоции",
    sec_mode: "Режим",
    sec_ear: "На ухо",
    ear_clear: "Стереть все",
    ear_hint:
      "Знает только этот персонаж и только в этом чате, пока не сотрёшь. «Тихо» — как заметка автора, «громко» — прямо перед его ответом.",
    unnamed: "Без имени",
    character: "Персонаж",
    persona: "Героиня",
    here_on: "здесь",
    here_off: "не здесь",
    here_title_on: "Увести: всё новое пройдёт мимо него",
    here_title_off: "Вернуть: снова слышит всё новое",
    who_away: " — не здесь",
    note_one: "В чате один персонаж — шептать некому.",
    note_individual: "Шёпот и «не здесь» работают только в режиме Individual (шестерёнка → Group Chat → Mode).",
    returning: "Возвращаю…",
    leaving: "Увожу…",
    back: "{name} снова здесь. Что было без него — не знает.",
    gone: "{name} не здесь. Всё новое пройдёт мимо него.",
    failed: "Не получилось: {err}",
    returning_all: "Возвращаю всех…",
    all_back: "Все снова здесь. Что было без них — не знают.",
    whisper_empty: "Напиши, что шепчут.",
    sending: "Отправляю…",
    next_manual: "Выбери, кто ответит.",
    next_auto: "Чтобы ответили, нажми отправку в пустом поле чата.",
    sent: "Отправлено. {next}",
    sent_reopen: "Отправлено. Если не видно — открой чат заново. {next}",
    whisper_half: "«Всем» ушло, а шёпот — нет. Шёпот остался в поле, попробуй ещё раз.",
    not_sent: "Не отправилось: {err}",
    ear_confirm: "Точно стереть? Тапни ещё раз",
    ear_ok_loud: "✓ громко, знает только {who}",
    ear_ok: "✓ знает только {who}",
    ear_quiet: "тихо",
    ear_quiet_title: "Как заметка автора: помнит и ведёт себя соответственно",
    ear_loud: "громко",
    ear_loud_title: "Прямо перед его ответом: отреагирует сразу",
    ear_ph: "Что знает или чувствует только он…",
    ear_book: "На ухо — {chat}",
    ear_book_bare: "На ухо",
    ear_book_desc: "Подсказки «на ухо» из панели Кулисы. Работает только в этом чате.",
    ear_entry: "На ухо — {name}",
    erasing: "Стираю…",
    saving: "Сохраняю…",
    ear_failed: "Не сохранилось: {err}. Поправь текст — попробую ещё раз.",
    feel_entry: "Эмоции — {name}",
    feel_head: "{name} — текущее внутреннее состояние:",
    feel_mood: "Настроение: {word}",
    feel_low: "сила: слабая",
    feel_high: "сила: высокая",
    feel_tail:
      "Это скрытый временный фон. Он проходит через характер и ситуацию и проступает выборочно — в решениях, тоне, паузах, взгляде, дистанции: одно-два проявления за ответ. Вслух чувство звучит, когда персонаж сам его осознаёт и готов проговорить.",
    feel_arrows: "Эмоция со стрелкой окрашивает отношение к тому, на кого указывает.",
    feel_events: "События сцены могут её усилить, ослабить или сменить.",
    feel_fold: "Свернуть",
    feel_unfold: "Показать эмоции",
    feel_level_title: "Сила: слабо → норм → сильно",
    feel_to: "на кого:",
    feel_max: "Уже три эмоции. Сними одну — нажми на неё.",
    feel_not_loaded: "Не успел прочитать лорбук. Закрой и открой панель, потом щёлкни ещё раз.",
    feel_ok: "✓ чувствует только {who}",
    retrying: "Не сохранилось, пробую ещё раз…",
    save_failed: "Не сохранилось: {err}. Закрой и открой панель — покажет, что сохранено.",
    mode_entry: "Режим — {name}",
    mode_not_loaded: "Не успел прочитать лорбук. Закрой и открой панель, потом нажми ещё раз.",
    mode_saved: "✓ сохранено",
    mode_all_badge: "Всем: {words}",
    heard_by: "🤫 слышат: {names}",
    heard_by_none: "🤫 не слышит никто",
  },
  en: {
    title: "Offstage",
    close: "Close",
    lang_title: "Panel language",
    sec_here: "Who's here",
    here_clear: "Bring everyone back",
    here_hint: "“Away”: the character hears nothing new in the chat until you bring them back.",
    sec_whisper: "Whisper",
    all_label: "Everyone",
    all_ph: "*leans in close and whispers*",
    whisper_label: "Whisper",
    whisper_ph: "“Meet me at midnight.”",
    who_label: "Who hears the whisper",
    clear_all: "Clear all",
    send: "Send",
    sec_feel: "Emotions",
    sec_mode: "Mode",
    sec_ear: "In their ear",
    ear_clear: "Erase all",
    ear_hint:
      "Only this character knows it, and only in this chat, until you erase it. “Quiet” works like an author's note; “loud” lands right before their reply.",
    unnamed: "Unnamed",
    character: "Character",
    persona: "Protagonist",
    here_on: "here",
    here_off: "away",
    here_title_on: "Send away: everything new passes them by",
    here_title_off: "Bring back: they hear everything new again",
    who_away: " — away",
    note_one: "Only one character in this chat — no one to whisper to.",
    note_individual: "Whisper and “away” only work in Individual mode (chat gear → Group Chat → Mode).",
    returning: "Bringing back…",
    leaving: "Sending away…",
    back: "{name} is back. They don't know what happened while they were away.",
    gone: "{name} is away. Everything new will pass them by.",
    failed: "Didn't work: {err}",
    returning_all: "Bringing everyone back…",
    all_back: "Everyone is back. They don't know what happened while they were away.",
    whisper_empty: "Write what is whispered.",
    sending: "Sending…",
    next_manual: "Choose who replies.",
    next_auto: "To get replies, press send with the chat box empty.",
    sent: "Sent. {next}",
    sent_reopen: "Sent. If you don't see it, reopen the chat. {next}",
    whisper_half: "“Everyone” went through, the whisper didn't. It's still in the box — try again.",
    not_sent: "Not sent: {err}",
    ear_confirm: "Erase everything? Tap again",
    ear_ok_loud: "✓ loud, only {who} knows",
    ear_ok: "✓ only {who} knows",
    ear_quiet: "quiet",
    ear_quiet_title: "Like an author's note: they remember it and act accordingly",
    ear_loud: "loud",
    ear_loud_title: "Right before their reply: they react at once",
    ear_ph: "What only they know or feel…",
    ear_book: "In their ear — {chat}",
    ear_book_bare: "In their ear",
    ear_book_desc: "Private notes from the Offstage panel. Active only in this chat.",
    ear_entry: "In their ear — {name}",
    erasing: "Erasing…",
    saving: "Saving…",
    ear_failed: "Not saved: {err}. Edit the text and I'll try again.",
    feel_entry: "Emotions — {name}",
    feel_head: "{name} — current inner state:",
    feel_mood: "Mood: {word}",
    feel_low: "intensity: low",
    feel_high: "intensity: high",
    feel_tail:
      "This is a hidden, temporary undercurrent. It passes through the character's personality and the situation and surfaces selectively — in choices, tone, pauses, glances, distance: one or two signs per reply. The feeling is spoken aloud when the character recognizes it and is ready to put it into words.",
    feel_arrows: "An emotion with an arrow colors their attitude toward the one it points at.",
    feel_events: "Events in the scene can strengthen, weaken, or change it.",
    feel_fold: "Collapse",
    feel_unfold: "Show emotions",
    feel_level_title: "Intensity: mild → normal → strong",
    feel_to: "toward:",
    feel_max: "Already three emotions. Tap one to remove it.",
    feel_not_loaded: "Couldn't read the lorebook yet. Close and reopen the panel, then tap again.",
    feel_ok: "✓ only {who} feels it",
    retrying: "Not saved, retrying…",
    save_failed: "Not saved: {err}. Close and reopen the panel to see what was saved.",
    mode_entry: "Mode — {name}",
    mode_not_loaded: "Couldn't read the lorebook yet. Close and reopen the panel, then tap again.",
    mode_saved: "✓ saved",
    mode_all_badge: "Everyone: {words}",
    heard_by: "🤫 heard by: {names}",
    heard_by_none: "🤫 heard by no one",
  },
};
const LANGS = Object.keys(I18N);
let lang = "en"; // decided once storage is read, see below

function t(key, vars) {
  let text = I18N[lang][key] ?? I18N.en[key] ?? key;
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}

// Entry names in the "in their ear" lorebook tell the panel what each entry is.
// Both languages are recognized, so switching the language never orphans an entry.
function namePrefix(key) {
  return LANGS.map((code) => I18N[code][key].split("{name}")[0]);
}
const FEEL_ENTRY_PREFIXES = namePrefix("feel_entry");
const MODE_ENTRY_PREFIXES = namePrefix("mode_entry");

// Emotions. The key is stored in chat metadata; word and hint go into the text the model reads.
const FEELINGS = [
  { key: "anger", emoji: "😠" },
  { key: "sadness", emoji: "😢" },
  { key: "anxiety", emoji: "😨" },
  { key: "fear", emoji: "😱" },
  { key: "shy", emoji: "😳" },
  { key: "tender", emoji: "🥰" },
  { key: "love", emoji: "❤️" },
  { key: "desire", emoji: "🔥" },
  { key: "playful", emoji: "😏" },
  { key: "fun", emoji: "😂" },
  { key: "cold", emoji: "🧊" },
  { key: "suspicion", emoji: "🤨" },
  { key: "jealousy", emoji: "💚" },
  { key: "hurt", emoji: "💔" },
  { key: "guilt", emoji: "😔" },
  { key: "cruel", emoji: "🔪" },
];
const FEELING_TEXT = {
  ru: {
    anger: ["злость", "раздражение, импульс ответить резче"],
    sadness: ["грусть", "тяжесть, склонность замкнуться"],
    anxiety: ["тревога", "напряжение, беспокойство, трудно расслабиться"],
    fear: ["страх", "ощущение угрозы, импульс избежать опасности или защититься"],
    shy: ["смущение", "неловкость, желание уйти из-под взгляда"],
    tender: ["нежность", "мягкость, желание беречь"],
    love: ["любовь", "глубокая привязанность, высокая значимость человека"],
    desire: ["возбуждение", "сексуальное влечение, повышенная чувствительность к физической близости"],
    playful: ["игривость", "желание дразнить, ловить реакцию"],
    fun: ["веселье", "лёгкость, тяга шутить"],
    cold: ["холод", "отстранённость, эмоциональная дистанция"],
    suspicion: ["подозрительность", "настороженность, поиск подвоха"],
    jealousy: ["ревность", "угроза значимой связи, внимание к сопернику"],
    hurt: ["обида", "задетость, боль от чужого отношения, тянет отдалиться или закрыться"],
    guilt: ["вина", "тяжесть от собственного поступка, желание исправить или искупить"],
    cruel: ["жестокий импульс", "желание причинить боль или унизить"],
  },
  en: {
    anger: ["anger", "irritation, an urge to answer more sharply"],
    sadness: ["sadness", "heaviness, a pull to withdraw"],
    anxiety: ["anxiety", "tension, worry, hard to relax"],
    fear: ["fear", "a sense of threat, an urge to avoid danger or protect oneself"],
    shy: ["embarrassment", "awkwardness, a wish to get out from under someone's gaze"],
    tender: ["tenderness", "softness, a wish to take care of someone"],
    love: ["love", "deep attachment; this person matters a great deal"],
    desire: ["arousal", "sexual attraction, heightened sensitivity to physical closeness"],
    playful: ["playfulness", "an urge to tease and catch a reaction"],
    fun: ["amusement", "lightness, an itch to joke"],
    cold: ["coldness", "detachment, emotional distance"],
    suspicion: ["suspicion", "wariness, looking for a catch"],
    jealousy: ["jealousy", "a threat to a meaningful bond, attention fixed on a rival"],
    hurt: ["hurt", "stung by how someone treated them; an urge to pull back or shut down"],
    guilt: ["guilt", "the weight of their own act, a wish to make it right or atone"],
    cruel: ["cruel impulse", "a wish to cause pain or to humiliate"],
  },
};
const FEELING_BY_KEY = Object.fromEntries(FEELINGS.map((f) => [f.key, f]));
function feelWord(key) {
  return FEELING_TEXT[lang][key][0];
}
function feelHint(key) {
  return FEELING_TEXT[lang][key][1];
}
const LEVEL_WORD = { ru: { 1: "слабая", 2: "обычная", 3: "высокая" }, en: { 1: "mild", 2: "normal", 3: "strong" } };
const LEVEL_DOTS = { 1: "·", 2: "··", 3: "···" };
const LEVEL_TAP = { ru: { 1: "слабо", 2: "норм", 3: "сильно" }, en: { 1: "mild", 2: "normal", 3: "strong" } }; // label on the intensity button

// ---------- which chat is open in THIS tab ----------
// Marinara writes the open chat to localStorage, which every tab shares.
// So we only trust what this tab itself wrote.

let tabChatId = null;
try {
  tabChatId = localStorage.getItem(ACTIVE_CHAT_KEY) || null;
} catch {
  tabChatId = null;
}
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.setItem = function (key, value) {
  if (this === window.localStorage && key === ACTIVE_CHAT_KEY) tabChatId = String(value) || null;
  return originalSetItem.call(this, key, value);
};
Storage.prototype.removeItem = function (key) {
  if (this === window.localStorage && key === ACTIVE_CHAT_KEY) tabChatId = null;
  return originalRemoveItem.call(this, key);
};

// ---------- talking to Marinara ----------

async function api(path, options = {}) {
  const headers = { "x-marinara-csrf": "1" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await marinara.fetch(path, { ...options, headers });
  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).error || "";
    } catch {
      /* no body */
    }
    throw new Error(`${response.status} ${detail}`.trim());
  }
  return response.status === 204 ? null : response.json();
}

function parseMaybeJson(value, fallback) {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function chatPath(chatId, rest = "") {
  return `/api/chats/${encodeURIComponent(chatId)}${rest}`;
}

// So that new messages show up in the chat right away, ask Marinara's query cache to refetch them.
// The cache (TanStack QueryClient) is found through the React tree; if Marinara changes its
// internals this simply returns null and the user reopens the chat instead.
let queryClient = null;
function findQueryClient() {
  if (queryClient) return queryClient;
  const root = document.getElementById("root");
  if (!root) return null;
  const key = Object.keys(root).find((k) => k.startsWith("__reactContainer$"));
  if (!key) return null;
  const stack = [root[key]];
  let visited = 0;
  while (stack.length && visited < 5000) {
    const fiber = stack.pop();
    visited += 1;
    if (!fiber) continue;
    const client = fiber.memoizedProps && fiber.memoizedProps.client;
    if (client && typeof client.invalidateQueries === "function") {
      queryClient = client;
      return client;
    }
    if (fiber.sibling) stack.push(fiber.sibling);
    if (fiber.child) stack.push(fiber.child);
  }
  return null;
}

function refreshChatMessages(chatId) {
  const client = findQueryClient();
  if (!client) return false;
  client.invalidateQueries({ queryKey: ["chats", "messages", chatId] });
  client.invalidateQueries({ queryKey: ["chats", "messageCount", chatId] });
  return true;
}

function refreshChatDetail(chatId) {
  const client = findQueryClient();
  if (client) client.invalidateQueries({ queryKey: ["chats", "detail", chatId] });
}

// ---------- state ----------

const state = {
  chatId: null,
  chat: null, // { characterIds, groupChatMode, groupResponseOrder, mode, away }
  names: {}, // characterId → name
  hearers: {}, // chatId → [ids of those who hear the whisper]
  open: false,
  busy: false, // a whisper is being sent
  awayBusy: false, // toggling here / away
};

const saved = (await marinara.storage.get().catch(() => ({}))) || {};
state.hearers = saved.hearers && typeof saved.hearers === "object" ? saved.hearers : {};

// Language: the saved choice. On the very first run: Russian for installs that predate the
// switch (they were Russian-only) or a Russian browser, otherwise English — and that first
// pick is saved at once, so every device uses the same language from then on.
function pickLanguage(stored) {
  if (stored && (stored.hearers || stored.modeTexts)) return "ru";
  const browser = String((navigator.languages && navigator.languages[0]) || navigator.language || "");
  return browser.toLowerCase().startsWith("ru") ? "ru" : "en";
}
if (LANGS.includes(saved.lang)) {
  lang = saved.lang;
} else {
  lang = pickLanguage(saved);
  saved.lang = lang;
  marinara.storage.patch({ lang }).catch((error) => marinara.log.warn("Could not save the language", error));
}

async function loadNames(ids) {
  if (ids.every((id) => state.names[id])) return;
  const list = await api("/api/characters");
  for (const character of list) {
    const data = parseMaybeJson(character.data, {});
    state.names[character.id] = (data && data.name) || character.name || t("unnamed");
  }
}

function readAway(meta, characterIds) {
  const raw = meta && typeof meta[AWAY_KEY] === "object" && meta[AWAY_KEY] ? meta[AWAY_KEY] : {};
  const away = {};
  for (const id of characterIds) {
    if (Object.prototype.hasOwnProperty.call(raw, id)) away[id] = typeof raw[id] === "string" ? raw[id] : "";
  }
  return away;
}

async function loadChat(chatId) {
  const chat = await api(chatPath(chatId));
  const meta = parseMaybeJson(chat.metadata, {}) || {};
  const characterIds = parseMaybeJson(chat.characterIds, []) || [];
  await loadNames(characterIds);
  const result = {
    characterIds,
    name: chat.name || "",
    mode: chat.mode,
    groupChatMode: meta.groupChatMode || "merged",
    groupResponseOrder: meta.groupResponseOrder || "sequential",
    away: readAway(meta, characterIds),
    authorNotesDepth:
      typeof meta.authorNotesDepth === "number" && Number.isFinite(meta.authorNotesDepth)
        ? Math.max(0, Math.floor(meta.authorNotesDepth))
        : 4,
    earLorebookId: typeof meta[EAR_KEY] === "string" ? meta[EAR_KEY] : null,
    modeOutlet: await presetHasModeOutlet(chat.promptPresetId),
    personaId: chat.personaId || null,
    personaName: await personaName(chat.personaId),
  };
  // Emotions and mode are not part of the "did the chat change" comparison: the panel owns them.
  Object.defineProperty(result, "feelingsRaw", { value: meta[FEEL_KEY], enumerable: false });
  Object.defineProperty(result, "modeRaw", { value: meta[MODE_KEY], enumerable: false });
  return result;
}

// Does the chat's preset have a slot for the mode — {{outlet::Offstage}} (or the Russian
// {{outlet::Режим}})? If so, the mode instruction goes there (best: at the very end of the
// preset's last writing rules, so it is the final word on length). If not, it goes into the
// history at depth 0. Returns the outlet name found, or "". Checked at most once a minute.
const presetOutletCache = {}; // presetId → { at, name }
async function presetHasModeOutlet(presetId) {
  if (!presetId) return "";
  const cached = presetOutletCache[presetId];
  if (cached && Date.now() - cached.at < 60000) return cached.name;
  try {
    const full = await api(`/api/prompts/${encodeURIComponent(presetId)}/full`);
    const sections = Array.isArray(full && full.sections) ? full.sections : [];
    const live = sections.filter((s) => String(s.enabled) !== "false" && typeof s.content === "string");
    const name = MODE_OUTLETS.find((outlet) => live.some((s) => s.content.includes(`{{outlet::${outlet}}}`))) || "";
    presetOutletCache[presetId] = { at: Date.now(), name };
    return name;
  } catch (error) {
    marinara.log.warn("Could not read the preset", error);
    return cached ? cached.name : "";
  }
}

const personaNames = {};
async function personaName(personaId) {
  if (!personaId) return "";
  if (personaNames[personaId] !== undefined) return personaNames[personaId];
  try {
    const list = await api("/api/characters/personas/list");
    for (const persona of Array.isArray(list) ? list : []) personaNames[persona.id] = persona.name || "";
  } catch (error) {
    marinara.log.warn("Could not read personas", error);
    return "";
  }
  if (personaNames[personaId] === undefined) personaNames[personaId] = "";
  return personaNames[personaId];
}

function awayIds() {
  return state.chat ? Object.keys(state.chat.away) : [];
}

// ---------- the panel ----------

const tab = document.createElement("button");
tab.type = "button";
tab.className = "kulisy-tab";
tab.hidden = true;

// Fixed texts carry data-t (text), data-t-ph (placeholder) or data-t-title (tooltip):
// applyStaticTexts() fills them in the current language.
const panel = document.createElement("aside");
panel.className = "kulisy-panel";
panel.hidden = true;
panel.innerHTML = `
  <div class="kulisy-head">
    <span class="kulisy-title" data-t="title"></span>
    <span class="kulisy-head-tools">
      <button type="button" class="kulisy-lang" data-t-title="lang_title"></button>
      <button type="button" class="kulisy-close" data-t-title="close">×</button>
    </span>
  </div>
  <section class="kulisy-section" data-fold="here">
    <h3 class="kulisy-fold" role="button" tabindex="0" data-t="sec_here"></h3>
    <div class="kulisy-here"></div>
    <button type="button" class="kulisy-clear kulisy-here-clear" hidden data-t="here_clear"></button>
    <div class="kulisy-hint" data-t="here_hint"></div>
  </section>
  <section class="kulisy-section" data-fold="whisper">
    <h3 class="kulisy-fold" role="button" tabindex="0" data-t="sec_whisper"></h3>
    <label class="kulisy-label" for="kulisy-all" data-t="all_label"></label>
    <textarea id="kulisy-all" rows="2" data-t-ph="all_ph"></textarea>
    <label class="kulisy-label" for="kulisy-whisper" data-t="whisper_label"></label>
    <textarea id="kulisy-whisper" rows="3" data-t-ph="whisper_ph"></textarea>
    <div class="kulisy-label" data-t="who_label"></div>
    <div class="kulisy-who"></div>
    <button type="button" class="kulisy-clear kulisy-who-clear" hidden data-t="clear_all"></button>
    <div class="kulisy-note" hidden></div>
    <button type="button" class="kulisy-send" data-t="send"></button>
  </section>
  <section class="kulisy-section" data-fold="feel">
    <h3 class="kulisy-fold" role="button" tabindex="0" data-t="sec_feel"></h3>
    <div class="kulisy-feel"></div>
  </section>
  <section class="kulisy-section" data-fold="mode">
    <h3 class="kulisy-fold" role="button" tabindex="0"><span><span data-t="sec_mode"></span> <span class="kulisy-mode-badge"></span></span></h3>
    <div class="kulisy-mode"></div>
    <button type="button" class="kulisy-clear kulisy-mode-clear" hidden data-t="clear_all"></button>
    <div class="kulisy-ear-state kulisy-mode-state"></div>
  </section>
  <section class="kulisy-section" data-fold="ear">
    <h3 class="kulisy-fold" role="button" tabindex="0" data-t="sec_ear"></h3>
    <div class="kulisy-ear"></div>
    <button type="button" class="kulisy-clear kulisy-ear-clear" hidden data-t="ear_clear"></button>
    <div class="kulisy-hint" data-t="ear_hint"></div>
  </section>
  <div class="kulisy-status"></div>
`;

function applyStaticTexts() {
  tab.textContent = t("title");
  for (const node of panel.querySelectorAll("[data-t]")) node.textContent = t(node.dataset.t);
  for (const node of panel.querySelectorAll("[data-t-ph]")) node.placeholder = t(node.dataset.tPh);
  for (const node of panel.querySelectorAll("[data-t-title]")) node.title = t(node.dataset.tTitle);
  // The language button shows the language you switch TO.
  el.lang.textContent = lang === "ru" ? "EN" : "RU";
}

const el = {
  lang: panel.querySelector(".kulisy-lang"),
  close: panel.querySelector(".kulisy-close"),
  here: panel.querySelector(".kulisy-here"),
  all: panel.querySelector("#kulisy-all"),
  whisper: panel.querySelector("#kulisy-whisper"),
  who: panel.querySelector(".kulisy-who"),
  note: panel.querySelector(".kulisy-note"),
  send: panel.querySelector(".kulisy-send"),
  ear: panel.querySelector(".kulisy-ear"),
  feel: panel.querySelector(".kulisy-feel"),
  mode: panel.querySelector(".kulisy-mode"),
  modeBadge: panel.querySelector(".kulisy-mode-badge"),
  modeState: panel.querySelector(".kulisy-mode-state"),
  hereClear: panel.querySelector(".kulisy-here-clear"),
  whoClear: panel.querySelector(".kulisy-who-clear"),
  modeClear: panel.querySelector(".kulisy-mode-clear"),
  earClear: panel.querySelector(".kulisy-ear-clear"),
  status: panel.querySelector(".kulisy-status"),
};

applyStaticTexts();
document.body.appendChild(tab);
document.body.appendChild(panel);

// ---------- sections fold on a tap on their heading ----------
// Each device remembers its own folded sections (tablet and desktop separately).
const FOLD_KEY = "kulisy-folded";
let folded = [];
try {
  folded = JSON.parse(localStorage.getItem(FOLD_KEY) || "[]");
  if (!Array.isArray(folded)) folded = [];
} catch {
  folded = [];
}
function applyFolds() {
  for (const section of panel.querySelectorAll("[data-fold]")) {
    const isFolded = folded.includes(section.dataset.fold);
    section.classList.toggle("is-folded", isFolded);
    section.querySelector(".kulisy-fold").setAttribute("aria-expanded", String(!isFolded));
  }
}
function toggleFold(key) {
  folded = folded.includes(key) ? folded.filter((k) => k !== key) : [...folded, key];
  try {
    localStorage.setItem(FOLD_KEY, JSON.stringify(folded));
  } catch {}
  applyFolds();
}
for (const head of panel.querySelectorAll(".kulisy-fold")) {
  const key = head.parentElement.dataset.fold;
  head.addEventListener("click", () => toggleFold(key));
  head.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFold(key);
    }
  });
}
applyFolds();

function setStatus(text, kind = "") {
  el.status.textContent = text;
  el.status.dataset.kind = kind;
}

function renderHere() {
  el.here.textContent = "";
  const chat = state.chat;
  el.hereClear.hidden = !chat || awayIds().length === 0;
  el.hereClear.disabled = state.awayBusy;
  if (!chat) return;
  for (const id of chat.characterIds) {
    const away = Object.prototype.hasOwnProperty.call(chat.away, id);
    const row = document.createElement("div");
    row.className = "kulisy-here-row" + (away ? " is-away" : "");
    const name = document.createElement("span");
    name.className = "kulisy-here-name";
    name.textContent = state.names[id] || id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "kulisy-here-toggle";
    button.dataset.state = away ? "away" : "here";
    button.dataset.characterId = id;
    button.textContent = away ? t("here_off") : t("here_on");
    button.title = away ? t("here_title_off") : t("here_title_on");
    button.disabled = state.awayBusy;
    button.addEventListener("click", () => void toggleAway(id));
    row.append(name, button);
    el.here.appendChild(row);
  }
}

function renderWho() {
  el.who.textContent = "";
  const chat = state.chat;
  paintWhoClear();
  if (!chat) return;
  const heard = new Set(state.hearers[state.chatId] || []);
  for (const id of chat.characterIds) {
    const away = Object.prototype.hasOwnProperty.call(chat.away, id);
    const row = document.createElement("label");
    row.className = "kulisy-person" + (away ? " is-away" : "");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !away && heard.has(id);
    box.disabled = away;
    box.addEventListener("change", () => toggleHearer(id, box.checked));
    const name = document.createElement("span");
    name.textContent = (state.names[id] || id) + (away ? t("who_away") : "");
    row.append(box, name);
    el.who.appendChild(row);
  }

  const notes = [];
  if (chat.characterIds.length < 2) notes.push(t("note_one"));
  else if (chat.groupChatMode !== "individual") notes.push(t("note_individual"));
  el.note.textContent = notes.join(" ");
  el.note.hidden = notes.length === 0;
}

function renderAll() {
  renderHere();
  renderWho();
  renderFeel();
  renderMode();
  renderEar();
}

function paintWhoClear() {
  const heard = new Set(state.hearers[state.chatId] || []);
  el.whoClear.hidden = !state.chat || !state.chat.characterIds.some((id) => heard.has(id));
}

function clearHearers() {
  if (!state.chatId) return;
  state.hearers[state.chatId] = [];
  renderWho();
  marinara.storage
    .patch({ hearers: state.hearers })
    .catch((error) => marinara.log.warn("Could not save the checkboxes", error));
}

async function toggleHearer(id, on) {
  const current = new Set(state.hearers[state.chatId] || []);
  if (on) current.add(id);
  else current.delete(id);
  state.hearers[state.chatId] = [...current];
  paintWhoClear();
  try {
    await marinara.storage.patch({ hearers: state.hearers });
  } catch (error) {
    marinara.log.warn("Could not save the checkboxes", error);
  }
}

function showTab() {
  tab.hidden = !state.chatId;
  panel.hidden = !(state.chatId && state.open);
}

// ---------- "away": everything new is hidden from those who left ----------
// When a character leaves, the time of the last message is remembered.
// Every later message is hidden from them (except their own lines) through Marinara's
// per-message hiddenFromAICharacterIds. Checked right after any message update and every 2 s.

function isAfter(createdAt, since) {
  if (!since) return true;
  return String(createdAt || "") > since;
}

let sweepChain = Promise.resolve();
let sweepRunning = false;

function sweepAway(chatId, full = false) {
  const run = sweepChain.then(() => doSweep(chatId, full));
  sweepChain = run.catch(() => {});
  return run;
}

async function doSweep(chatId, full) {
  if (!state.chat || state.chatId !== chatId) return 0;
  const away = { ...state.chat.away };
  const ids = Object.keys(away);
  if (ids.length === 0) return 0;
  sweepRunning = true;
  try {
    const messages = await api(chatPath(chatId, full ? "/messages" : "/messages?limit=40"));
    let changed = 0;
    for (const message of Array.isArray(messages) ? messages : []) {
      const extra = parseMaybeJson(message.extra, {}) || {};
      const hidden = Array.isArray(extra.hiddenFromAICharacterIds) ? extra.hiddenFromAICharacterIds : [];
      const need = ids.filter(
        (id) => id !== message.characterId && isAfter(message.createdAt, away[id]) && !hidden.includes(id),
      );
      if (need.length === 0) continue;
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      const before = Array.isArray(kulisy.away) ? kulisy.away : [];
      await api(chatPath(chatId, `/messages/${encodeURIComponent(message.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({
          hiddenFromAICharacterIds: [...hidden, ...need],
          kulisy: { ...kulisy, away: [...new Set([...before, ...need])] },
        }),
      });
      changed += 1;
    }
    if (changed) refreshChatMessages(chatId);
    return changed;
  } finally {
    sweepRunning = false;
  }
}

let sweepTimer = null;
function scheduleSweep() {
  if (sweepTimer !== null || !state.chatId || awayIds().length === 0) return;
  const chatId = state.chatId;
  sweepTimer = marinara.setTimeout(() => {
    sweepTimer = null;
    sweepAway(chatId).catch((error) => marinara.log.warn("Could not hide messages from absent characters", error));
  }, 200);
}

async function toggleAway(id) {
  if (state.awayBusy || !state.chatId || !state.chat) return;
  const chatId = state.chatId;
  const wasAway = Object.prototype.hasOwnProperty.call(state.chat.away, id);
  const name = state.names[id] || t("character");
  state.awayBusy = true;
  renderHere();
  setStatus(wasAway ? t("returning") : t("leaving"));
  try {
    const away = { ...state.chat.away };
    if (wasAway) {
      // First catch up on everything that happened without them, then bring them back.
      await sweepAway(chatId, true);
      delete away[id];
    } else {
      const last = await api(chatPath(chatId, "/messages?limit=1"));
      away[id] = Array.isArray(last) && last.length ? String(last[last.length - 1].createdAt || "") : "";
    }
    await api(chatPath(chatId, "/metadata"), {
      method: "PATCH",
      body: JSON.stringify({ [AWAY_KEY]: away }),
    });
    refreshChatDetail(chatId);
    if (state.chatId === chatId && state.chat) {
      state.chat.away = away;
      renderAll();
    }
    setStatus(wasAway ? t("back", { name }) : t("gone", { name }), "ok");
  } catch (error) {
    marinara.log.error("Could not toggle here / away", error);
    setStatus(t("failed", { err: error.message }), "error");
  } finally {
    state.awayBusy = false;
    renderHere();
  }
}

// "Bring everyone back": like "here" for each of them, in one pass.
async function returnAll() {
  if (state.awayBusy || !state.chatId || !state.chat || awayIds().length === 0) return;
  const chatId = state.chatId;
  state.awayBusy = true;
  renderHere();
  setStatus(t("returning_all"));
  try {
    await sweepAway(chatId, true);
    await api(chatPath(chatId, "/metadata"), {
      method: "PATCH",
      body: JSON.stringify({ [AWAY_KEY]: {} }),
    });
    refreshChatDetail(chatId);
    if (state.chatId === chatId && state.chat) {
      state.chat.away = {};
      renderAll();
    }
    setStatus(t("all_back"), "ok");
  } catch (error) {
    marinara.log.error("Could not bring everyone back", error);
    setStatus(t("failed", { err: error.message }), "error");
  } finally {
    state.awayBusy = false;
    renderHere();
  }
}

// ---------- whisper ----------
// Two messages from the user: "Everyone" (seen by all) and the whisper itself, hidden from
// everyone not checked.

async function sendWhisper() {
  if (state.busy || !state.chatId || !state.chat) return;
  const allText = el.all.value.trim();
  const whisperText = el.whisper.value.trim();
  if (!whisperText) {
    setStatus(t("whisper_empty"), "error");
    el.whisper.focus();
    return;
  }

  const chatId = state.chatId;
  // Fresh list of characters, in case someone was added.
  try {
    state.chat = await loadChat(chatId);
    renderAll();
  } catch {
    /* keep the previous one */
  }
  const away = awayIds();
  const heard = new Set(state.hearers[chatId] || []);
  const deaf = state.chat.characterIds.filter((id) => !heard.has(id) || away.includes(id));

  state.busy = true;
  el.send.disabled = true;
  setStatus(t("sending"));
  let firstSent = false;
  try {
    if (allText) {
      const body = { chatId, role: "user", characterId: null, content: allText };
      if (away.length) body.extra = { hiddenFromAICharacterIds: away, kulisy: { away } };
      await api(chatPath(chatId, "/messages"), { method: "POST", body: JSON.stringify(body) });
      firstSent = true;
    }
    const whisperKulisy = { kind: "whisper" };
    if (away.length) whisperKulisy.away = away;
    await api(chatPath(chatId, "/messages"), {
      method: "POST",
      body: JSON.stringify({
        chatId,
        role: "user",
        characterId: null,
        content: whisperText,
        extra: { hiddenFromAICharacterIds: deaf, kulisy: whisperKulisy },
      }),
    });
    el.all.value = "";
    el.whisper.value = "";
    const refreshed = refreshChatMessages(chatId);
    const next = state.chat.groupResponseOrder === "manual" ? t("next_manual") : t("next_auto");
    setStatus(refreshed ? t("sent", { next }) : t("sent_reopen", { next }), "ok");
  } catch (error) {
    marinara.log.error("Whisper not sent", error);
    setStatus(firstSent ? t("whisper_half") : t("not_sent", { err: error.message }), "error");
    if (firstSent) el.all.value = "";
    refreshChatMessages(chatId);
  } finally {
    state.busy = false;
    el.send.disabled = false;
  }
}

// ---------- in their ear: a private note for one character ----------
// The chat gets its own lorebook (chatId = this chat, so it never reaches other chats).
// One constant entry per character: filter include → that character only, inserted at a
// depth with role system — the same way Marinara inserts the author's note.
// "Quiet" = this chat's author's note depth (4 by default), "loud" = 1.

const ear = {
  sig: "", // chat + cast the fields were drawn for
  entries: {}, // characterId → { id, content, depth }
  rows: {}, // characterId → { textarea, quiet, loud, stateEl, loudMode, dirty, timer }
  clearArmed: null, // "Erase all": the first tap arms it for 3 s, the second erases
  chain: Promise.resolve(),
};

function earQuietDepth() {
  return state.chat ? state.chat.authorNotesDepth : 4;
}

function earQueue(task) {
  const run = ear.chain.then(task);
  ear.chain = run.catch((error) => marinara.log.warn("In their ear: error", error));
  return run;
}

function paintEarClear() {
  const any =
    Object.keys(ear.entries).length > 0 || Object.values(ear.rows).some((r) => r.textarea.value.trim());
  el.earClear.hidden = !state.chat || !any;
  if (el.earClear.hidden) disarmEarClear();
}

function disarmEarClear() {
  if (ear.clearArmed !== null) marinara.clearTimeout(ear.clearArmed);
  ear.clearArmed = null;
  el.earClear.textContent = t("ear_clear");
  el.earClear.dataset.armed = "";
}

function clickEarClear() {
  if (!state.chat) return;
  if (ear.clearArmed === null) {
    el.earClear.textContent = t("ear_confirm");
    el.earClear.dataset.armed = "1";
    ear.clearArmed = marinara.setTimeout(disarmEarClear, 3000);
    return;
  }
  disarmEarClear();
  const chatId = state.chatId;
  for (const [id, row] of Object.entries(ear.rows)) {
    if (!row.textarea.value.trim() && !ear.entries[id]) continue;
    if (row.timer !== null) marinara.clearTimeout(row.timer);
    row.timer = null;
    row.textarea.value = "";
    row.dirty = true;
    void earQueue(() => saveEar(chatId, id));
  }
  paintEarClear();
}

function paintEarRow(id) {
  paintEarClear();
  const row = ear.rows[id];
  if (!row) return;
  row.quiet.dataset.on = row.loudMode ? "" : "1";
  row.loud.dataset.on = row.loudMode ? "1" : "";
  const entry = ear.entries[id];
  if (row.stateEl.dataset.kind === "busy" || row.stateEl.dataset.kind === "error") return;
  const who = shortName(id);
  row.stateEl.textContent = entry ? (row.loudMode ? t("ear_ok_loud", { who }) : t("ear_ok", { who })) : "";
  row.stateEl.dataset.kind = entry ? "ok" : "";
}

function setEarRowState(id, text, kind) {
  const row = ear.rows[id];
  if (!row) return;
  row.stateEl.textContent = text;
  row.stateEl.dataset.kind = kind;
  if (kind !== "busy" && kind !== "error") paintEarRow(id);
}

function renderEar() {
  const chat = state.chat;
  if (!chat) {
    el.ear.textContent = "";
    ear.sig = "";
    ear.rows = {};
    paintEarClear();
    return;
  }
  const sig = `${state.chatId}|${chat.characterIds.join(",")}`;
  if (sig === ear.sig) return;
  ear.sig = sig;
  for (const row of Object.values(ear.rows)) if (row.timer !== null) marinara.clearTimeout(row.timer);
  el.ear.textContent = "";
  ear.rows = {};
  for (const id of chat.characterIds) {
    const wrap = document.createElement("div");
    wrap.className = "kulisy-ear-row";
    const head = document.createElement("div");
    head.className = "kulisy-ear-head";
    const name = document.createElement("span");
    name.textContent = state.names[id] || id;
    const volume = document.createElement("div");
    volume.className = "kulisy-ear-volume";
    const quiet = document.createElement("button");
    quiet.type = "button";
    quiet.textContent = t("ear_quiet");
    quiet.title = t("ear_quiet_title");
    const loud = document.createElement("button");
    loud.type = "button";
    loud.textContent = t("ear_loud");
    loud.title = t("ear_loud_title");
    volume.append(quiet, loud);
    head.append(name, volume);
    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.placeholder = t("ear_ph");
    const stateEl = document.createElement("div");
    stateEl.className = "kulisy-ear-state";
    wrap.append(head, textarea, stateEl);
    el.ear.appendChild(wrap);

    const entry = ear.entries[id];
    const row = { textarea, quiet, loud, stateEl, loudMode: entry ? entry.depth <= EAR_LOUD_DEPTH : false, dirty: false, timer: null };
    textarea.value = entry ? entry.content : "";
    ear.rows[id] = row;

    const chatId = state.chatId;
    const saveSoon = (delay) => {
      if (row.timer !== null) marinara.clearTimeout(row.timer);
      row.timer = marinara.setTimeout(() => {
        row.timer = null;
        void earQueue(() => saveEar(chatId, id));
      }, delay);
    };
    textarea.addEventListener("input", () => {
      row.dirty = true;
      paintEarClear();
      setEarRowState(id, "…", "busy");
      saveSoon(1200);
    });
    textarea.addEventListener("blur", () => {
      if (row.dirty) saveSoon(0);
    });
    const setMode = (loudMode) => {
      if (row.loudMode === loudMode) return;
      row.loudMode = loudMode;
      paintEarRow(id);
      if (ear.entries[id] || textarea.value.trim()) {
        row.dirty = true;
        saveSoon(0);
      }
    };
    quiet.addEventListener("click", () => setMode(false));
    loud.addEventListener("click", () => setMode(true));
    paintEarRow(id);
  }
}

async function loadEar(chatId) {
  if (!state.chat || state.chatId !== chatId) return;
  const lorebookId = state.chat.earLorebookId;
  let entries = {};
  const feelEntries = {};
  const modeEntries = {};
  if (lorebookId) {
    try {
      await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}`);
      const list = await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries`);
      for (const entry of Array.isArray(list) ? list : []) {
        const ids = parseMaybeJson(entry.characterFilterIds, []) || [];
        if (entry.characterFilterMode !== "include" || ids.length !== 1) continue;
        const item = {
          id: entry.id,
          content: entry.content || "",
          depth: Number(entry.depth) || 0,
          position: Number(entry.position) || 0,
          outletName: entry.outletName || "",
        };
        const entryName = String(entry.name || "");
        if (FEEL_ENTRY_PREFIXES.some((prefix) => entryName.startsWith(prefix))) feelEntries[ids[0]] = item;
        else if (MODE_ENTRY_PREFIXES.some((prefix) => entryName.startsWith(prefix))) modeEntries[ids[0]] = item;
        else entries[ids[0]] = item;
      }
    } catch (error) {
      // The lorebook was deleted by hand — a new one is made with the next note.
      if (String(error.message).startsWith("404") && state.chat && state.chatId === chatId) state.chat.earLorebookId = null;
      else throw error;
    }
  }
  if (state.chatId !== chatId) return;
  ear.entries = entries;
  feel.entries = feelEntries;
  feel.loaded = true;
  reconcileFeel(chatId);
  mode.entries = modeEntries;
  mode.loaded = true;
  reconcileMode(chatId);
  for (const [id, row] of Object.entries(ear.rows)) {
    if (row.dirty || document.activeElement === row.textarea) continue;
    const entry = entries[id];
    row.textarea.value = entry ? entry.content : "";
    row.loudMode = entry ? entry.depth <= EAR_LOUD_DEPTH : false;
    paintEarRow(id);
  }
}

async function ensureEarLorebook(chatId) {
  if (state.chat.earLorebookId) return state.chat.earLorebookId;
  const title = state.chat.name ? t("ear_book", { chat: state.chat.name }) : t("ear_book_bare");
  const book = await api("/api/lorebooks", {
    method: "POST",
    body: JSON.stringify({
      name: title.slice(0, 200),
      description: t("ear_book_desc"),
      category: "uncategorized",
      chatId,
    }),
  });
  await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [EAR_KEY]: book.id }) });
  if (state.chat && state.chatId === chatId) state.chat.earLorebookId = book.id;
  return book.id;
}

async function saveEar(chatId, id) {
  if (!state.chat || state.chatId !== chatId) return;
  const row = ear.rows[id];
  if (!row) return;
  row.dirty = false;
  const text = row.textarea.value.trim();
  const depth = row.loudMode ? EAR_LOUD_DEPTH : earQuietDepth();
  const existing = ear.entries[id];
  const lorebookId = state.chat.earLorebookId;
  try {
    if (!text) {
      if (existing && lorebookId) {
        setEarRowState(id, t("erasing"), "busy");
        await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
          method: "DELETE",
        });
      }
      delete ear.entries[id];
      setEarRowState(id, "", "");
      return;
    }
    if (existing && existing.content === text && existing.depth === depth) {
      setEarRowState(id, "", "");
      return;
    }
    setEarRowState(id, t("saving"), "busy");
    if (existing && lorebookId) {
      await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ content: text, depth, enabled: true }),
      });
      ear.entries[id] = { ...existing, content: text, depth };
    } else {
      const bookId = await ensureEarLorebook(chatId);
      const created = await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries`, {
        method: "POST",
        body: JSON.stringify({
          lorebookId: bookId,
          name: t("ear_entry", { name: state.names[id] || id }).slice(0, 200),
          content: text,
          keys: [],
          constant: true,
          position: 2,
          depth,
          role: "system",
          characterFilterMode: "include",
          characterFilterIds: [id],
        }),
      });
      ear.entries[id] = { id: created.id, content: text, depth };
    }
    setEarRowState(id, "", "");
  } catch (error) {
    marinara.log.error("In their ear: not saved", error);
    row.dirty = true;
    setEarRowState(id, t("ear_failed", { err: error.message }), "error");
  }
}

// ---------- emotions: a ready-made hint for one character ----------
// State lives in chat metadata (kulisyFeelings). A text is built from it and stored in the same
// "in their ear" lorebook as a separate entry per character: constant, include → that character
// only, at the "quiet" depth (the author's note depth). The free-text note is left alone.

const feel = {
  data: {}, // characterId → [{ e, lv, to }]
  entries: {}, // characterId → { id, content, depth } — the lorebook entry
  loaded: false, // entries have been read (no writes before that, to avoid duplicates)
  open: null, // whose palette is open
  queued: new Set(), // who already has a save queued
  rowState: {}, // id → { text, kind }
  retries: {}, // id → failed saves in a row
};

function sanitizeFeelings(raw, characterIds) {
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const id of characterIds) {
    const list = Array.isArray(src[id]) ? src[id] : [];
    const clean = [];
    for (const item of list) {
      if (!item || !FEELING_BY_KEY[item.e] || clean.some((f) => f.e === item.e)) continue;
      const lv = [1, 2, 3].includes(item.lv) ? item.lv : 2;
      const to = Array.isArray(item.to) ? [...new Set(item.to.filter((t) => typeof t === "string"))] : [];
      clean.push({ e: item.e, lv, to });
      if (clean.length >= FEEL_MAX) break;
    }
    if (clean.length) out[id] = clean;
  }
  return out;
}

function feelTargets(id) {
  const chat = state.chat;
  if (!chat) return [];
  const list = [];
  if (chat.personaId) list.push({ id: USER_TARGET, name: (chat.personaName || "").split(/\s+/)[0] || t("persona") });
  for (const other of chat.characterIds) if (other !== id) list.push({ id: other, name: shortName(other) });
  return list;
}

function feelText(id) {
  const list = feel.data[id] || [];
  if (!list.length || !state.chat) return "";
  const targets = new Map(feelTargets(id).map((t) => [t.id, t.name]));
  let arrows = false;
  const lines = list.map((item) => {
    const def = FEELING_BY_KEY[item.e];
    const to = item.to.filter((t) => targets.has(t)).map((t) => targets.get(t));
    const word = feelWord(def.key);
    const parts = [to.length ? `${word} → ${to.join(", ")}` : t("feel_mood", { word })];
    if (to.length) arrows = true;
    if (item.lv === 1) parts.push(t("feel_low"));
    if (item.lv === 3) parts.push(t("feel_high"));
    parts.push(feelHint(def.key));
    return `• ${parts.join(" | ")}`;
  });
  const tail = [t("feel_tail")];
  if (arrows) tail.push(t("feel_arrows"));
  tail.push(t("feel_events"));
  return [t("feel_head", { name: state.names[id] || t("character") }), ...lines, tail.join(" ")].join("\n");
}

function renderFeel() {
  el.feel.textContent = "";
  const chat = state.chat;
  if (!chat) return;
  for (const id of chat.characterIds) {
    const list = feel.data[id] || [];
    const isOpen = feel.open === id;
    const wrap = document.createElement("div");
    wrap.className = "kulisy-feel-row" + (isOpen ? " is-open" : "");

    const head = document.createElement("button");
    head.type = "button";
    head.className = "kulisy-feel-head";
    head.title = isOpen ? t("feel_fold") : t("feel_unfold");
    const name = document.createElement("span");
    name.className = "kulisy-feel-name";
    name.textContent = state.names[id] || id;
    const summary = document.createElement("span");
    summary.className = "kulisy-feel-summary";
    for (const item of list) {
      const def = FEELING_BY_KEY[item.e];
      const chip = document.createElement("span");
      chip.className = "kulisy-feel-chip";
      chip.title = feelWord(def.key);
      chip.textContent = def.emoji + LEVEL_DOTS[item.lv];
      summary.appendChild(chip);
    }
    const arrow = document.createElement("span");
    arrow.className = "kulisy-feel-arrow";
    arrow.textContent = isOpen ? "▴" : "▾";
    head.append(name, summary, arrow);
    head.addEventListener("click", () => {
      feel.open = isOpen ? null : id;
      renderFeel();
    });
    wrap.appendChild(head);

    if (isOpen) {
      const grid = document.createElement("div");
      grid.className = "kulisy-feel-grid";
      for (const def of FEELINGS) {
        const item = list.find((f) => f.e === def.key);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "kulisy-feel-btn" + (item ? " is-on" : "");
        button.title = item ? `${feelWord(def.key)} — ${LEVEL_WORD[lang][item.lv]}` : feelWord(def.key);
        const emoji = document.createElement("span");
        emoji.textContent = def.emoji;
        const dots = document.createElement("span");
        dots.className = "kulisy-feel-dots";
        dots.textContent = item ? LEVEL_DOTS[item.lv] : "";
        button.append(emoji, dots);
        button.addEventListener("click", () => clickFeeling(id, def.key));
        grid.appendChild(button);
      }
      wrap.appendChild(grid);

      if (list.length) {
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "kulisy-feel-clear";
        clear.textContent = t("clear_all");
        clear.addEventListener("click", () => clearFeelings(id));
        wrap.appendChild(clear);
      }

      const targets = feelTargets(id);
      for (const item of list) {
        const def = FEELING_BY_KEY[item.e];
        const box = document.createElement("div");
        box.className = "kulisy-feel-item";
        const title = document.createElement("div");
        title.className = "kulisy-feel-item-title";
        const word = document.createElement("span");
        word.textContent = `${def.emoji} ${feelWord(def.key)}`;
        const level = document.createElement("button");
        level.type = "button";
        level.className = "kulisy-feel-level";
        level.dataset.lv = String(item.lv);
        level.title = t("feel_level_title");
        level.textContent = `${LEVEL_TAP[lang][item.lv]} ${LEVEL_DOTS[item.lv]}`;
        level.addEventListener("click", () => cycleFeelLevel(id, item.e));
        title.append(word, level);
        box.appendChild(title);
        if (targets.length) {
          const to = document.createElement("div");
          to.className = "kulisy-feel-to";
          const label = document.createElement("span");
          label.className = "kulisy-feel-to-label";
          label.textContent = t("feel_to");
          to.appendChild(label);
          for (const target of targets) {
            const row = document.createElement("label");
            const check = document.createElement("input");
            check.type = "checkbox";
            check.checked = item.to.includes(target.id);
            check.addEventListener("change", () => toggleFeelTarget(id, item.e, target.id, check.checked));
            const span = document.createElement("span");
            span.textContent = target.name;
            row.append(check, span);
            to.appendChild(row);
          }
          box.appendChild(to);
        }
        wrap.appendChild(box);
      }
    }

    const rs = feel.rowState[id];
    if (rs && rs.text) {
      const stateEl = document.createElement("div");
      stateEl.className = "kulisy-ear-state";
      stateEl.dataset.kind = rs.kind || "";
      stateEl.textContent = rs.text;
      wrap.appendChild(stateEl);
    }
    el.feel.appendChild(wrap);
  }
}

function setFeelRowState(id, text, kind) {
  feel.rowState[id] = { text, kind };
  renderFeel();
}

function clickFeeling(id, key) {
  if (!state.chat) return;
  const list = (feel.data[id] || []).map((f) => ({ ...f, to: [...f.to] }));
  const index = list.findIndex((f) => f.e === key);
  if (index < 0) {
    if (list.length >= FEEL_MAX) {
      setFeelRowState(id, t("feel_max"), "error");
      return;
    }
    list.push({ e: key, lv: 2, to: [] });
  } else {
    list.splice(index, 1);
  }
  if (list.length) feel.data[id] = list;
  else delete feel.data[id];
  queueFeelSave(id);
}

// Intensity cycles: mild → normal → strong → mild.
function cycleFeelLevel(id, key) {
  if (!state.chat) return;
  const item = (feel.data[id] || []).find((f) => f.e === key);
  if (!item) return;
  item.lv = (item.lv % 3) + 1;
  queueFeelSave(id);
}

function clearFeelings(id) {
  if (!state.chat || !(feel.data[id] || []).length) return;
  delete feel.data[id];
  queueFeelSave(id);
}

function toggleFeelTarget(id, key, targetId, on) {
  const list = feel.data[id] || [];
  const item = list.find((f) => f.e === key);
  if (!item) return;
  const to = new Set(item.to);
  if (on) to.add(targetId);
  else to.delete(targetId);
  item.to = [...to];
  queueFeelSave(id);
}

function queueFeelSave(id, withMeta = true) {
  if (!feel.rowState[id] || feel.rowState[id].kind !== "busy") {
    feel.rowState[id] = { text: "…", kind: "busy" };
    renderFeel();
  }
  if (feel.queued.has(id)) return;
  feel.queued.add(id);
  const chatId = state.chatId;
  void earQueue(async () => {
    feel.queued.delete(id);
    await saveFeel(chatId, id, withMeta);
  });
}

// After reading the entries: the lorebook text must match the metadata
// (names may have changed, the author's note depth may have changed, the language may have changed).
function reconcileFeel(chatId) {
  if (!state.chat || state.chatId !== chatId) return;
  const depth = earQuietDepth();
  const ids = new Set([...Object.keys(feel.data), ...Object.keys(feel.entries)]);
  for (const id of ids) {
    const entry = feel.entries[id];
    const text = feelText(id);
    if (!entry && !text) continue;
    if (entry && entry.content === text && entry.depth === depth) continue;
    if (feel.queued.has(id)) continue;
    feel.queued.add(id);
    void earQueue(async () => {
      feel.queued.delete(id);
      await saveFeel(chatId, id, false);
    });
  }
}

async function saveFeel(chatId, id, withMeta) {
  if (!state.chat || state.chatId !== chatId) return;
  if (!feel.loaded) {
    setFeelRowState(id, t("feel_not_loaded"), "error");
    return;
  }
  const text = feelText(id);
  const depth = earQuietDepth();
  const existing = feel.entries[id];
  const lorebookId = state.chat.earLorebookId;
  try {
    if (withMeta) {
      await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [FEEL_KEY]: feel.data }) });
    }
    if (!text) {
      if (existing && lorebookId) {
        await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
          method: "DELETE",
        });
      }
      delete feel.entries[id];
      setFeelRowState(id, "", "");
      return;
    }
    if (!(existing && existing.content === text && existing.depth === depth)) {
      if (existing && lorebookId) {
        await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ content: text, depth, enabled: true }),
        });
        feel.entries[id] = { ...existing, content: text, depth };
      } else {
        const bookId = await ensureEarLorebook(chatId);
        const created = await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries`, {
          method: "POST",
          body: JSON.stringify({
            lorebookId: bookId,
            name: t("feel_entry", { name: state.names[id] || id }).slice(0, 200),
            content: text,
            keys: [],
            constant: true,
            position: 2,
            depth,
            role: "system",
            characterFilterMode: "include",
            characterFilterIds: [id],
          }),
        });
        feel.entries[id] = { id: created.id, content: text, depth };
      }
    }
    feel.retries[id] = 0;
    setFeelRowState(id, t("feel_ok", { who: shortName(id) }), "ok");
  } catch (error) {
    marinara.log.error("Emotions: not saved", error);
    // A tap changes the intensity, so don't ask for a tap — retry by ourselves.
    const tries = (feel.retries[id] || 0) + 1;
    feel.retries[id] = tries;
    if (tries <= 3) {
      setFeelRowState(id, t("retrying"), "busy");
      marinara.setTimeout(() => {
        if (state.chatId === chatId) queueFeelSave(id, withMeta);
      }, 3000 * tries);
    } else {
      feel.retries[id] = 0;
      setFeelRowState(id, t("save_failed", { err: error.message }), "error");
    }
  }
}

// ---------- mode: in what form the character replies ----------
// Buttons stay pressed until released. State lives in chat metadata (kulisyMode):
// { all: { f, l }, characterId: { f, l } }; f = form, l = length, "off" = "as usual".
// A personal button beats "Everyone". A short instruction is built from it and stored in the
// "in their ear" lorebook as "Mode — <name>": constant, include → that character only. It goes
// into the preset's {{outlet::Offstage}} (or {{outlet::Режим}}) if there is one, else depth 0.
// Instruction texts are in MODE_TEXTS below. (Russian only: old custom edits from storage
// "modeTexts", if any, still apply.)

const MODE_FORMS = [
  { key: "dialog", word: { ru: "Диалог", en: "Dialogue" }, badge: { ru: "диалог", en: "dialogue" } },
  { key: "silent", word: { ru: "Реакция", en: "Reaction" }, badge: { ru: "реакция", en: "reaction" } },
];
const MODE_LENGTHS = [
  { key: "short", word: { ru: "коротко", en: "short" } },
  { key: "mid", word: { ru: "средне", en: "medium" } },
  { key: "long", word: { ru: "длинно", en: "long" } },
];
const MODE_DEPTH = 0; // without a preset slot — right next to the turn (at depth 1 DeepSeek ignored the length)
const MODE_OUTLETS = ["Offstage", "Режим"]; // {{outlet::…}} names the panel looks for in the preset

// Where the mode entry goes in this chat.
function modePlace() {
  return state.chat && state.chat.modeOutlet
    ? { position: 7, depth: MODE_DEPTH, outletName: state.chat.modeOutlet }
    : { position: 2, depth: MODE_DEPTH, outletName: "" };
}
function modeEntryFits(entry, text) {
  const place = modePlace();
  return (
    !!entry &&
    entry.content === text &&
    entry.depth === place.depth &&
    entry.position === place.position &&
    (entry.outletName || "") === place.outletName
  );
}
// {name} — the character's first name. (The Russian texts use {имя}.)
const MODE_TEXTS = {
  ru: {
    lead: "Форма этого ответа задана заранее.",
    dialog: "Сейчас идёт разговор. {имя} отвечает прямой речью; действия — короткие штрихи между фразами.",
    dialog_short:
      "Сейчас быстрый обмен репликами. {имя} отвечает одной репликой прямой речи в одну-две фразы; до и после неё ничего.",
    dialog_mid:
      "Сейчас идёт разговор. {имя} отвечает одним абзацем: две-три фразы прямой речи, между ними одно короткое действие — и ход окончен.",
    dialog_long:
      "{имя} говорит развёрнуто: монолог в два-три абзаца — объясняет, рассказывает или спорит. Речь занимает почти весь ответ.",
    silent:
      "Сейчас важна реакция, а не слова. {имя} молчит и отвечает только действием: взгляд, жест, движение, лицо — ни одной реплики.",
    solo: "Отвечает только {имя}, других персонажей в ответе нет.",
    len_short: "Весь ответ — одна-две фразы, и ход окончен.",
    len_mid: "Весь ответ — один абзац, и ход окончен.",
    len_long: "Ответ развёрнутый, с подробностями: три-четыре абзаца.",
    silent_long: "Ответ неторопливый, с подробностями: два-три абзаца.",
  },
  en: {
    lead: "The form of this reply is set in advance.",
    dialog: "This is a conversation. {name} answers in direct speech; actions are brief touches between spoken lines.",
    dialog_short:
      "This is a quick exchange. {name} answers with a single line of direct speech, one or two sentences long; nothing comes before or after it.",
    dialog_mid:
      "This is a conversation. {name} answers in one paragraph: two or three sentences of direct speech with one brief action between them, and the turn ends.",
    dialog_long:
      "{name} speaks at length: a monologue of two or three paragraphs, explaining, telling, or arguing. Speech fills almost the whole reply.",
    silent:
      "What matters now is the reaction, not words. {name} stays silent and answers only through action: a look, a gesture, a movement, an expression. No spoken lines at all.",
    solo: "Only {name} responds; no other characters appear in this reply.",
    len_short: "The whole reply is one or two sentences, and the turn ends.",
    len_mid: "The whole reply is a single paragraph, and the turn ends.",
    len_long: "The reply is full and detailed: three to four paragraphs.",
    silent_long: "The reply is unhurried and detailed: two to three paragraphs.",
  },
};

const mode = {
  data: {}, // MODE_ALL | characterId → { f?, l? }
  entries: {}, // characterId → { id, content, depth } — the lorebook entry
  loaded: false, // entries have been read (no writes before that, to avoid duplicates)
  texts: sanitizeModeTexts(saved.modeTexts), // key → custom Russian text (changed ones only)
  version: 0, // grows on every tap, so a stale chat read never overwrites a newer tap
  queued: false,
  saving: false,
  metaDirty: false,
  retries: 0,
  status: { text: "", kind: "" },
};

function sanitizeModeTexts(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, original] of Object.entries(MODE_TEXTS.ru)) {
    const text = typeof raw[key] === "string" ? raw[key].trim() : "";
    if (text && text !== original) out[key] = text;
  }
  return out;
}

function sanitizeMode(raw, characterIds) {
  const src = raw && typeof raw === "object" ? raw : {};
  const forms = MODE_FORMS.map((f) => f.key);
  const lengths = MODE_LENGTHS.map((l) => l.key);
  const out = {};
  for (const key of [MODE_ALL, ...characterIds]) {
    const item = src[key];
    if (!item || typeof item !== "object") continue;
    const own = key !== MODE_ALL;
    const clean = {};
    if (forms.includes(item.f) || (own && item.f === MODE_OFF)) clean.f = item.f;
    if (lengths.includes(item.l) || (own && item.l === MODE_OFF)) clean.l = item.l;
    if (clean.f || clean.l) out[key] = clean;
  }
  return out;
}

function modeUsesAll() {
  return !!state.chat && state.chat.characterIds.length > 1;
}

// What applies to a character: their own setting, else "Everyone"; "off" = as usual.
function modeOf(id) {
  const all = modeUsesAll() ? mode.data[MODE_ALL] || {} : {};
  const own = mode.data[id] || {};
  const f = own.f !== undefined ? own.f : all.f;
  const l = own.l !== undefined ? own.l : all.l;
  return { f: f === MODE_OFF ? undefined : f, l: l === MODE_OFF ? undefined : l };
}

function modeTextOf(key) {
  return (lang === "ru" && mode.texts[key]) || MODE_TEXTS[lang][key];
}

function modeText(id) {
  const { f, l } = modeOf(id);
  const parts = [];
  if (f === "dialog") {
    parts.push(modeTextOf(l ? `dialog_${l}` : "dialog"));
  } else {
    if (f === "silent") parts.push(modeTextOf("silent"));
    else if (l) parts.push(modeTextOf("solo"));
    if (l) parts.push(modeTextOf(f === "silent" && l === "long" ? "silent_long" : `len_${l}`));
  }
  if (!parts.length) return "";
  parts.unshift(modeTextOf("lead"));
  const name = shortName(id);
  return parts.join(" ").split("{имя}").join(name).split("{name}").join(name).trim();
}

function modeWords(m) {
  const words = [];
  if (m.f) words.push(MODE_FORMS.find((x) => x.key === m.f).badge[lang]);
  if (m.l) words.push(MODE_LENGTHS.find((x) => x.key === m.l).word[lang]);
  return words.join(", ");
}

// What is pressed now, as one line for the section heading.
function modeBadge() {
  const chat = state.chat;
  if (!chat) return "";
  const list = chat.characterIds.map((id) => ({ id, words: modeWords(modeOf(id)) }));
  const active = list.filter((x) => x.words);
  if (!active.length) return "";
  if (modeUsesAll() && active.length === list.length && list.every((x) => x.words === list[0].words)) {
    return t("mode_all_badge", { words: list[0].words });
  }
  return active.map((x) => `${shortName(x.id)}: ${x.words}`).join(" · ");
}

function paintModeHead() {
  const badge = modeBadge();
  el.modeBadge.textContent = badge ? `· ${badge}` : "";
  tab.classList.toggle("has-mode", !!badge);
}

function paintModeStatus() {
  el.modeState.textContent = mode.status.text;
  el.modeState.dataset.kind = mode.status.kind;
}

function setModeStatus(text, kind) {
  mode.status = { text, kind };
  paintModeStatus();
}

function renderMode() {
  el.mode.textContent = "";
  paintModeHead();
  el.modeClear.hidden = !state.chat || Object.keys(mode.data).length === 0;
  const chat = state.chat;
  if (!chat) return;
  const keys = modeUsesAll() ? [MODE_ALL, ...chat.characterIds] : [...chat.characterIds];
  for (const key of keys) {
    const row = document.createElement("div");
    row.className = "kulisy-mode-row" + (key === MODE_ALL ? " is-all" : "");
    const name = document.createElement("span");
    name.className = "kulisy-mode-name";
    name.textContent = key === MODE_ALL ? t("all_label") : state.names[key] || key;
    const buttons = document.createElement("div");
    buttons.className = "kulisy-mode-btns";
    buttons.append(modeGroup(key, "f", MODE_FORMS), modeGroup(key, "l", MODE_LENGTHS));
    row.append(name, buttons);
    el.mode.appendChild(row);
  }
}

function modeGroup(key, field, options) {
  const group = document.createElement("div");
  group.className = "kulisy-mode-group";
  const own = (mode.data[key] || {})[field];
  const all = key !== MODE_ALL && modeUsesAll() ? (mode.data[MODE_ALL] || {})[field] : undefined;
  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "kulisy-mode-btn";
    button.dataset.field = field;
    button.dataset.value = option.key;
    let look = "";
    if (own === option.key) look = "on";
    else if (own === undefined && all === option.key) look = "inherit";
    else if (own === MODE_OFF && all === option.key) look = "crossed";
    button.dataset.state = look;
    button.textContent = option.word[lang];
    button.addEventListener("click", () => clickMode(key, field, option.key));
    group.appendChild(button);
  }
  return group;
}

function clickMode(key, field, value) {
  if (!state.chat) return;
  const item = { ...(mode.data[key] || {}) };
  const all = key !== MODE_ALL && modeUsesAll() ? (mode.data[MODE_ALL] || {})[field] : undefined;
  const own = item[field];
  if (own === value) delete item[field];
  else if (own === undefined && all === value) item[field] = MODE_OFF; // pale (from "Everyone") → as usual for this one
  else if (own === MODE_OFF && all === value) delete item[field]; // crossed out → like everyone again
  else item[field] = value;
  if (item.f || item.l) mode.data[key] = item;
  else delete mode.data[key];
  // "Everyone" changed — earlier "as usual" overrides for this field are no longer needed.
  if (key === MODE_ALL) {
    for (const id of state.chat.characterIds) {
      const personal = mode.data[id];
      if (!personal || personal[field] !== MODE_OFF) continue;
      delete personal[field];
      if (!personal.f && !personal.l) delete mode.data[id];
    }
  }
  mode.version += 1;
  renderMode();
  queueModeSave(true);
}

// "Clear all": both "Everyone" and personal — every character writes as usual.
function clearMode() {
  if (!state.chat || Object.keys(mode.data).length === 0) return;
  mode.data = {};
  mode.version += 1;
  renderMode();
  queueModeSave(true);
}

function queueModeSave(withMeta) {
  if (withMeta) mode.metaDirty = true;
  setModeStatus("…", "busy");
  if (mode.queued) return;
  mode.queued = true;
  const chatId = state.chatId;
  void earQueue(async () => {
    mode.queued = false;
    await saveMode(chatId);
  });
}

// After reading the entries: the lorebook text must match the buttons
// (texts may have been edited on another device, a name or the language may have changed).
function reconcileMode(chatId) {
  if (!state.chat || state.chatId !== chatId) return;
  const ids = new Set([...state.chat.characterIds, ...Object.keys(mode.entries)]);
  for (const id of ids) {
    const entry = mode.entries[id];
    const text = state.chat.characterIds.includes(id) ? modeText(id) : "";
    if (!entry && !text) continue;
    if (modeEntryFits(entry, text)) continue;
    queueModeSave(false);
    return;
  }
}

async function saveMode(chatId) {
  if (!state.chat || state.chatId !== chatId) return;
  if (!mode.loaded) {
    setModeStatus(t("mode_not_loaded"), "error");
    return;
  }
  const withMeta = mode.metaDirty;
  mode.metaDirty = false;
  mode.saving = true;
  try {
    if (withMeta) {
      await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [MODE_KEY]: mode.data }) });
    }
    const ids = new Set([...state.chat.characterIds, ...Object.keys(mode.entries)]);
    for (const id of ids) {
      if (state.chatId !== chatId) return;
      const text = state.chat.characterIds.includes(id) ? modeText(id) : "";
      const existing = mode.entries[id];
      const lorebookId = state.chat.earLorebookId;
      if (!text) {
        if (existing && lorebookId) {
          await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
            method: "DELETE",
          });
        }
        delete mode.entries[id];
        continue;
      }
      if (modeEntryFits(existing, text)) continue;
      const place = modePlace();
      if (existing && lorebookId) {
        await api(`/api/lorebooks/${encodeURIComponent(lorebookId)}/entries/${encodeURIComponent(existing.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ content: text, ...place, enabled: true }),
        });
        mode.entries[id] = { ...existing, content: text, ...place };
      } else {
        const bookId = await ensureEarLorebook(chatId);
        const created = await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries`, {
          method: "POST",
          body: JSON.stringify({
            lorebookId: bookId,
            name: t("mode_entry", { name: state.names[id] || id }).slice(0, 200),
            content: text,
            keys: [],
            constant: true,
            ...place,
            role: "system",
            characterFilterMode: "include",
            characterFilterIds: [id],
          }),
        });
        mode.entries[id] = { id: created.id, content: text, ...place };
      }
    }
    mode.retries = 0;
    if (!mode.queued) setModeStatus(withMeta ? t("mode_saved") : "", withMeta ? "ok" : "");
  } catch (error) {
    marinara.log.error("Mode: not saved", error);
    if (withMeta) mode.metaDirty = true;
    mode.retries += 1;
    if (mode.retries <= 3) {
      setModeStatus(t("retrying"), "busy");
      const tries = mode.retries;
      marinara.setTimeout(() => {
        if (state.chatId === chatId) queueModeSave(false);
      }, 3000 * tries);
    } else {
      mode.retries = 0;
      setModeStatus(t("save_failed", { err: error.message }), "error");
    }
  } finally {
    mode.saving = false;
  }
}

// ---- instruction texts: old custom edits from storage ----

// Texts may have been edited on another device — re-read when the panel opens.
async function refreshModeTexts() {
  try {
    const fresh = await marinara.storage.get();
    const texts = sanitizeModeTexts(fresh && fresh.modeTexts);
    if (JSON.stringify(texts) === JSON.stringify(mode.texts)) return;
    mode.texts = texts;
  } catch (error) {
    marinara.log.warn("Could not re-read mode texts", error);
  }
}

// ---- switching the language ----
// Redraws the panel and rewrites this chat's emotion and mode entries in the new language
// (other chats follow when they are opened). Free-text "in their ear" notes stay as written.

function setLanguage(next, persist) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  applyStaticTexts();
  disarmEarClear();
  for (const row of Object.values(ear.rows)) {
    row.quiet.textContent = t("ear_quiet");
    row.quiet.title = t("ear_quiet_title");
    row.loud.textContent = t("ear_loud");
    row.loud.title = t("ear_loud_title");
    row.textarea.placeholder = t("ear_ph");
  }
  for (const id of Object.keys(ear.rows)) paintEarRow(id);
  feel.rowState = {};
  mode.status = { text: "", kind: "" };
  paintModeStatus();
  setStatus("");
  renderHere();
  renderWho();
  renderFeel();
  renderMode();
  if (persist) {
    marinara.storage.patch({ lang }).catch((error) => marinara.log.warn("Could not save the language", error));
  }
  const chatId = state.chatId;
  if (chatId) {
    void earQueue(async () => {
      if (feel.loaded) reconcileFeel(chatId);
      if (mode.loaded) reconcileMode(chatId);
    });
  }
}

// Another device may have switched the language: pick it up before touching any entries.
async function refreshLanguage() {
  try {
    const fresh = await marinara.storage.get();
    if (fresh && LANGS.includes(fresh.lang) && fresh.lang !== lang) setLanguage(fresh.lang, false);
  } catch (error) {
    marinara.log.warn("Could not re-read the language", error);
  }
}

el.lang.addEventListener("click", () => setLanguage(lang === "ru" ? "en" : "ru", true));
el.hereClear.addEventListener("click", () => void returnAll());
el.whoClear.addEventListener("click", clearHearers);
el.modeClear.addEventListener("click", clearMode);
el.earClear.addEventListener("click", clickEarClear);

// ---------- markers on hidden messages ----------
// For the user's eyes only: written to an attribute on the bubble and drawn by CSS; the model
// never sees it. 🔒 — hidden from those who were away; 🤫 heard by: … — whispers and other
// partial hiding.

function shortName(id) {
  const name = state.names[id] || "";
  return name.split(/\s+/)[0] || "?";
}

function badgeFor(extra) {
  if (!extra || !state.chat) return null;
  const hidden = Array.isArray(extra.hiddenFromAICharacterIds) ? extra.hiddenFromAICharacterIds : [];
  if (hidden.length === 0) return null;
  const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
  if (kulisy.kind !== "whisper") {
    const away = Array.isArray(kulisy.away) ? kulisy.away : [];
    if (away.length && hidden.every((id) => away.includes(id))) return "🔒";
  }
  const hear = state.chat.characterIds.filter((id) => !hidden.includes(id)).map(shortName);
  return hear.length ? t("heard_by", { names: hear.join(", ") }) : t("heard_by_none");
}

function cachedExtras(chatId) {
  const client = findQueryClient();
  const data = client && client.getQueryData(["chats", "messages", chatId]);
  if (!data) return null;
  const pages = Array.isArray(data.pages) ? data.pages : Array.isArray(data) ? [data] : [];
  const map = new Map();
  for (const page of pages) {
    for (const message of Array.isArray(page) ? page : []) {
      map.set(message.id, parseMaybeJson(message.extra, {}));
    }
  }
  return map;
}

function applyBadges() {
  const extras = state.chatId ? cachedExtras(state.chatId) : null;
  for (const row of document.querySelectorAll("[data-message-id]")) {
    const bubble = row.querySelector(".mari-message-bubble") || row;
    const label = extras ? badgeFor(extras.get(row.getAttribute("data-message-id"))) : null;
    if (label) {
      if (bubble.getAttribute("data-kulisy-note") !== label) bubble.setAttribute("data-kulisy-note", label);
    } else if (bubble.hasAttribute("data-kulisy-note")) {
      bubble.removeAttribute("data-kulisy-note");
    }
  }
}

let badgeTimer = null;
function scheduleBadges() {
  if (badgeTimer !== null) return;
  badgeTimer = marinara.setTimeout(() => {
    badgeTimer = null;
    applyBadges();
  }, 150);
}

const observer = new MutationObserver(() => scheduleBadges());
observer.observe(document.body, { childList: true, subtree: true });

let unsubscribeCache = null;
function watchCache() {
  if (unsubscribeCache) return;
  const client = findQueryClient();
  if (!client) return;
  unsubscribeCache = client.getQueryCache().subscribe((event) => {
    const key = event && event.query && event.query.queryKey;
    if (Array.isArray(key) && key[0] === "chats" && key[1] === "messages") {
      scheduleBadges();
      scheduleSweep();
    }
  });
}

// ---------- following the open chat ----------

let loadSeq = 0;
async function syncChat(force = false) {
  const chatId = tabChatId;
  if (!force && chatId === state.chatId) return;
  const changed = chatId !== state.chatId;
  state.chatId = chatId;
  if (changed) {
    state.chat = null;
    el.here.textContent = "";
    el.who.textContent = "";
    ear.entries = {};
    renderEar();
    feel.data = {};
    feel.entries = {};
    feel.loaded = false;
    feel.open = null;
    feel.rowState = {};
    el.feel.textContent = "";
    mode.data = {};
    mode.entries = {};
    mode.loaded = false;
    mode.status = { text: "", kind: "" };
    el.mode.textContent = "";
    for (const button of panel.querySelectorAll(".kulisy-clear")) button.hidden = true;
    paintModeStatus();
    paintModeHead();
    setStatus("");
  }
  showTab();
  if (!chatId) return;
  const seq = ++loadSeq;
  const modeVersion = mode.version;
  try {
    const chat = await loadChat(chatId);
    if (seq !== loadSeq || state.chatId !== chatId) return;
    // The "in their ear" lorebook may have just been created while metadata is not re-read yet.
    if (!chat.earLorebookId && state.chat && state.chat.earLorebookId) chat.earLorebookId = state.chat.earLorebookId;
    // Emotions are read from metadata only when a chat opens — after that the panel owns them.
    if (changed) feel.data = sanitizeFeelings(chat.feelingsRaw, chat.characterIds);
    // Mode is re-read while the panel is open too (it may have been changed on another device),
    // but only if nothing was tapped here in the meantime.
    let modeChanged = false;
    if (changed || (mode.version === modeVersion && !mode.queued && !mode.saving && !mode.metaDirty)) {
      const fresh = sanitizeMode(chat.modeRaw, chat.characterIds);
      if (changed || JSON.stringify(fresh) !== JSON.stringify(mode.data)) {
        mode.data = fresh;
        modeChanged = true;
      }
    }
    const before = JSON.stringify(state.chat);
    state.chat = chat;
    if (before !== JSON.stringify(chat)) {
      renderAll();
      scheduleBadges();
    } else if (modeChanged) {
      renderMode();
    }
    if (changed) void earQueue(async () => {
      await refreshLanguage();
      await loadEar(chatId);
    });
    // Opened a chat where someone is away — catch up on everything that arrived without the panel.
    if (changed && Object.keys(chat.away).length) {
      sweepAway(chatId, true).catch((error) => marinara.log.warn("Could not hide messages from absent characters", error));
    }
  } catch (error) {
    if (seq === loadSeq) marinara.log.warn("Could not read the chat", error);
  }
}

tab.addEventListener("click", async () => {
  state.open = !state.open;
  showTab();
  if (!state.open) return;
  await syncChat(true);
  const chatId = state.chatId;
  if (!chatId) return;
  await refreshModeTexts();
  await refreshLanguage();
  void earQueue(() => loadEar(chatId));
});
el.close.addEventListener("click", () => {
  state.open = false;
  showTab();
});

// A tap or click outside the panel closes it. That tap only closes: the click that follows
// never reaches the chat (so a button under the panel is not pressed by accident).
let swallowClickUntil = 0;
function onOutsidePointer(event) {
  if (!state.open || panel.hidden) return;
  const target = event.target;
  if (!(target instanceof Node) || !target.isConnected) return;
  if (panel.contains(target) || tab.contains(target)) return;
  state.open = false;
  showTab();
  swallowClickUntil = Date.now() + 700;
}
function onSwallowClick(event) {
  if (Date.now() > swallowClickUntil) return;
  swallowClickUntil = 0;
  event.preventDefault();
  event.stopPropagation();
}
function onEscape(event) {
  if (event.key !== "Escape" || !state.open || panel.hidden) return;
  state.open = false;
  showTab();
}
document.addEventListener("pointerdown", onOutsidePointer, true);
document.addEventListener("click", onSwallowClick, true);
document.addEventListener("keydown", onEscape);
el.send.addEventListener("click", () => void sendWhisper());
el.whisper.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    void sendWhisper();
  }
});

// Chat switch — every second; cast and "who's here" — every 5 s while the panel is open;
// the "away" check — every 2 s while someone is away.
let ticks = 0;
const timer = marinara.setInterval(() => {
  ticks += 1;
  watchCache();
  void syncChat(state.open && ticks % 5 === 0);
  if (ticks % 2 === 0 && !sweepRunning && state.chatId && awayIds().length) {
    sweepAway(state.chatId).catch((error) => marinara.log.warn("Could not hide messages from absent characters", error));
  }
}, 1000);
void syncChat(true);

marinara.onCleanup(() => {
  marinara.clearInterval(timer);
  document.removeEventListener("pointerdown", onOutsidePointer, true);
  document.removeEventListener("click", onSwallowClick, true);
  document.removeEventListener("keydown", onEscape);
  observer.disconnect();
  if (unsubscribeCache) unsubscribeCache();
  Storage.prototype.setItem = originalSetItem;
  Storage.prototype.removeItem = originalRemoveItem;
  for (const node of document.querySelectorAll("[data-kulisy-note]")) node.removeAttribute("data-kulisy-note");
  tab.remove();
  panel.remove();
});

marinara.log.info(`Offstage ${VERSION} loaded`);
