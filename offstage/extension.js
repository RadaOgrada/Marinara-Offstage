// Offstage — a side panel for group scenes in Marinara Engine.
// Who's here (here / away), whispers, emotions, reply mode, private notes "in their ear",
// and markers on hidden messages. Russian / English interface. One look, Marinara's native (the Vintage look left in 0.9.23).
// Runs inside Marinara's page (full_page_access) and talks only to Marinara's own /api.
//
// Internal identifiers (chat metadata keys, CSS classes, storage keys) keep the original
// "kulisy" prefix (the panel's Russian name) so existing chats keep working.

const VERSION = "2.0.0";
const ACTIVE_CHAT_KEY = "marinara-active-chat-id";
const AWAY_KEY = "kulisyAway"; // chat metadata: { characterId → createdAt of the last message when they left }
const EAR_KEY = "kulisyEarLorebookId"; // chat metadata: id of this chat's "in their ear" lorebook
const CAST_SEEN_KEY = "kulisyCastSeen"; // chat metadata: the cards Offstage has already seen in this chat (newcomers)
const EAR_LOUD_DEPTH = 1; // "loud" — right before the reply
const FEEL_KEY = "kulisyFeelings"; // chat metadata: { characterId → [{ e: emotion, lv: 1..3, to: [id | "user"] }] }
const FEEL_MAX = 3;
const USER_TARGET = "user"; // the user's persona in the "toward" checkboxes
const MODE_KEY = "kulisyMode"; // chat metadata: { all | characterId → { f: form, l: length } }
const MODE_ALL = "all"; // the "Everyone" row
const MODE_OFF = "off"; // in a personal row: "as usual", even though "Everyone" has it pressed
const DECK_KEY = "kulisyDeck"; // chat metadata: { tone } of the scene; the cards are in storage (see "the event deck")
const DECK_HAND_KEY = "kulisyDeckHand"; // chat metadata: the last hand and the reply it went to (see "the event deck")
const TRUTH_HAND_KEY = "kulisyTruthHand"; // chat metadata: the last truth roll and its reply (see "truth or lie")
const DECK_AUTO_KEY = "kulisyDeckAuto"; // chat metadata: { f, t, skip, n } — the deck drawing by itself (see "the event deck")

// ---------- language ----------
// Every visible word and every text the model reads lives here. "ru" is the original
// wording; "en" is the English translation. Placeholders: {name}, {who}, {err}, …

const I18N = {
  ru: {
    title: "Кулисы",
    close: "Закрыть",
    lang_title: "Язык панели",
    set_title: "Настройки",
    set_lang: "Язык",
    help_on: "Показать подсказки",
    help_off: "Спрятать подсказки",
    help_all: "Как отвечают все, у кого нет своего режима.",
    help_scene: "Тап по имени — всё о нём. «Не здесь» — не слышит.",
    help_feel: "Скрытый фон: виден в тоне и поступках.",
    help_mode: "Главнее «для всех»; держится до отжатия.",
    help_ear: "Только он. Тихо — помнит, громко — сразу.",
    help_whisper: "«Всем» видят все, шёпот — только отмеченные.",
    pin_on: "Закрепить панель: тап мимо её не закроет",
    pin_off: "Открепить панель",
    sec_here: "Кто рядом",
    here_clear: "Вернуть всех",
    here_hint: "«Не здесь» — персонаж не слышит ничего нового в чате, пока не вернёшь его.",
    sec_whisper: "Шёпот",
    all_label: "Всем",
    all_ph: "*наклоняется ближе и шепчет*",
    whisper_label: "Шёпот",
    whisper_ph: "— Встретимся в полночь.",
    who_label: "Кто слышит шёпот",
    clear_all: "Снять все",
    send: "Отправить",
    sec_feel: "Эмоции",
    sec_mode: "Режим",
    sec_ear: "На ухо",
    page_scene: "Сцена",
    page_deck: "Судьба",
    page_log: "Журнал",
    pages_label: "Вкладки Кулис",
    mode_all_title: "Режим для всех",
    feel_label: "Эмоции · до трёх",
    char_ear: "есть записка на ухо",
    char_secrets: "конвертов: {n}",
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
    set_title: "Settings",
    set_lang: "Language",
    help_on: "Show hints",
    help_off: "Hide hints",
    help_all: "How everyone replies unless they have their own mode.",
    help_scene: "Tap a name for all about them. “Away”: hears nothing.",
    help_feel: "A hidden undercurrent: shows in tone and actions.",
    help_mode: "Beats “everyone”; stays until you tap it again.",
    help_ear: "Only they know. Quiet — kept; loud — at once.",
    help_whisper: "Everyone sees “Everyone”; only the checked hear the whisper.",
    pin_on: "Pin the panel: a tap outside won't close it",
    pin_off: "Unpin the panel",
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
    page_scene: "Scene",
    page_deck: "Fate",
    page_log: "Log",
    pages_label: "Offstage tabs",
    mode_all_title: "Mode for everyone",
    feel_label: "Emotions · up to three",
    char_ear: "has a note in their ear",
    char_secrets: "envelopes: {n}",
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

// Names and casts are re-read when a card was added or edited (Marinara bumps catalogGeneration on any character write).
let catalogGeneration = null;
async function loadNames(ids) {
  let generation = null;
  try {
    const head = await api("/api/characters/catalog?limit=1");
    generation = head && head.catalogGeneration !== undefined ? head.catalogGeneration : null;
  } catch (error) {
    marinara.log.warn("Could not read the character catalog", error);
  }
  if (ids.every((id) => state.names[id]) && (generation === null || generation === catalogGeneration)) return;
  const list = await api("/api/characters");
  for (const character of list) {
    const data = parseMaybeJson(character.data, {}) || {};
    state.names[character.id] = data.name || character.name || t("unnamed");
    readCast(character.id, data);
  }
  catalogGeneration = generation;
}

// ---------- several people on one card ----------
// A card may describe a cast (a family, a party): [CHARACTER: Name] headers, or else repeated "Name:" lines —
// the same rule as Marinara's character tracker (shared/src/utils/character-cast.ts), at least two people.
// Each member is a "slot" `<cardId>:cast:<normalized name>` (the tracker's own id form). Emotions, mode and
// "in their ear" work per slot. Lorebook entries stay filtered to the card (the engine knows only cards) and
// carry the member in their description ("offstage:cast:<key>"), which never reaches the model.
// Who's here and whispers stay per card: the engine hides a message from a whole card or not at all.
const CAST_SEP = ":cast:";
const CAST_MARK = "offstage:cast:";
const CAST_MAX = 12;
const CAST_HEADER_RE = /\[\s*(?:character|char)\s*(?:[:\-–—]\s*)([^\]\r\n]{1,60})\]/giu;
state.cast = {}; // cardId → [{ slot, name }]

function matchKey(value) {
  return typeof value === "string" ? value.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/gu, " ") : "";
}

function cleanMemberName(raw) {
  let name = String(raw).replace(/[*_`"“”'‘’]/gu, "").trim();
  if (name.endsWith(")")) {
    const opening = name.lastIndexOf("(");
    if (opening >= 0 && !name.slice(opening + 1, -1).includes(")")) name = name.slice(0, opening);
  }
  return name.replace(/\s+/gu, " ").trim();
}

function collectMember(raw, into) {
  const name = cleanMemberName(raw);
  if (!name || name.length > 60 || /[.!?;]/u.test(name) || name.split(" ").length > 5) return;
  const key = matchKey(name);
  if (key && !into.has(key)) into.set(key, name);
}

function castMembers(data) {
  const ext = data.extensions && typeof data.extensions === "object" ? data.extensions : {};
  const fields = [data.description, data.personality, data.scenario, ext.backstory ?? data.backstory, ext.appearance ?? data.appearance];
  const text = fields.filter((value) => typeof value === "string" && value.length > 0).join("\n");
  if (!text) return [];
  const members = new Map();
  CAST_HEADER_RE.lastIndex = 0;
  for (const match of text.matchAll(CAST_HEADER_RE)) collectMember(match[1] || "", members);
  if (members.size < 2) {
    members.clear();
    for (const line of text.split(/\r?\n/u)) {
      const colon = line.search(/[:：]/u);
      if (colon < 0) continue;
      const label = line.slice(0, colon).replace(/^[\s*_\-•>]+/u, "");
      if (!/^(?:full\s+name|name)[\s*_]*$/iu.test(label)) continue;
      const value = line.slice(colon + 1).replace(/^[\s*_]+/u, "").trimEnd();
      if (value.length <= 120) collectMember(value, members);
    }
  }
  members.delete(matchKey(data.name));
  if (members.size < 2) return [];
  return [...members].slice(0, CAST_MAX);
}

function readCast(cardId, data) {
  const list = castMembers(data).map(([key, name]) => ({ slot: `${cardId}${CAST_SEP}${key}`, name }));
  if (list.length) state.cast[cardId] = list;
  else delete state.cast[cardId];
  for (const member of list) state.names[member.slot] = member.name;
}

function isMember(slot) {
  return typeof slot === "string" && slot.indexOf(CAST_SEP) > 0;
}

function cardOf(slot) {
  const index = typeof slot === "string" ? slot.indexOf(CAST_SEP) : -1;
  return index > 0 ? slot.slice(0, index) : slot;
}

// Rows for emotions, mode and "in their ear": each card, its members right under it.
function castSlots(characterIds) {
  const out = [];
  for (const id of characterIds) {
    out.push(id);
    for (const member of state.cast[id] || []) out.push(member.slot);
  }
  return out;
}

// What a lorebook entry of this slot looks like to the engine: filtered to the card, the member in the description.
function entryTarget(slot) {
  return isMember(slot)
    ? { characterFilterIds: [cardOf(slot)], description: CAST_MARK + slot.slice(slot.indexOf(CAST_SEP) + CAST_SEP.length) }
    : { characterFilterIds: [slot] };
}

function entrySlot(cardId, description) {
  const mark = String(description || "");
  return mark.startsWith(CAST_MARK) && mark.length > CAST_MARK.length ? `${cardId}${CAST_SEP}${mark.slice(CAST_MARK.length)}` : cardId;
}

// Entry titles: a member is shown with their card — "Mode — Anna (The Smiths)".
function entryTitle(slot) {
  const name = state.names[slot] || slot;
  return isMember(slot) ? `${name} (${state.names[cardOf(slot)] || cardOf(slot)})` : name;
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
    slots: castSlots(characterIds), // cards and the people on them (see "several people on one card")
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
// Marinara's native look in either look, like the panel (0.9.18).
tab.dataset.offstageNative = "";
// data-no-intuitive-swipe: a drag that starts on the tab never flips a reply in Marinara's chat.
tab.setAttribute("data-no-intuitive-swipe", "");
let fateReady = false; // the Fate card's texts are defined in the fate section further down; until then it stays wordless

// Phone (< 768): no tab at the screen edge — it got in the way of the chat (10.10); a curtain button in Marinara's
// top bar instead, next to its own buttons (after the Damask theme's palette, when the theme is on). Marinara redraws
// the bar now and then — ensureTopButton() puts the button back (from the page observer below).
const PHONE = window.matchMedia("(max-width: 767px)");
const CURTAIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h20"/>' +
  '<path d="M4 3v18h5c-.6-3-1.4-6-2.6-8.5C8.8 10 10.6 7 11 3"/><path d="M20 3v18h-5c.6-3 1.4-6 2.6-8.5C15.2 10 13.4 7 13 3"/>' +
  '<path d="M4 12.5h2.4M20 12.5h-2.4"/></svg>';
const topBtn = document.createElement("button");
topBtn.type = "button";
topBtn.hidden = true;
topBtn.setAttribute("aria-pressed", "false");
topBtn.innerHTML = CURTAIN_SVG;
function ensureTopButton() {
  const nav = document.querySelector(".mari-topbar .mari-topbar-panel-nav");
  const want = !!(nav && PHONE.matches && state.chatId);
  if (!want) {
    if (topBtn.isConnected) topBtn.remove();
    return;
  }
  // look of a neighbouring Marinara button (size, rounding), without its panel colours and its "hidden on phones"
  const sib = nav.querySelector(".mari-topbar-action:not(.kulisy-topbtn):not(.cl-spark)");
  const cls = (sib ? sib.className.replace(/\s*(mari-panel-gradient--\S+|mari-topbar-panel-icon|max-sm:hidden|sm:hidden|ml-auto)/g, "") : "mari-topbar-action") +
    " kulisy-topbtn" + (tab.classList.contains("has-mode") ? " has-mode" : "");
  if (topBtn.className !== cls) topBtn.className = cls;
  const spark = nav.querySelector(":scope > .cl-spark");
  if (spark) { if (spark.nextElementSibling !== topBtn) spark.after(topBtn); }
  else if (nav.firstElementChild !== topBtn) nav.prepend(topBtn);
  if (topBtn.hidden) topBtn.hidden = false;
}

// Fixed texts carry data-t (text), data-t-ph (placeholder), data-t-title (tooltip) or data-t-label (aria-label):
// applyStaticTexts() fills them in the current language; the Fate texts (data-ft…) are filled by paintFateTexts().
// One panel with three tabs (0.9.18, the new layout of 19.10): Scene — a row per character; Deck — the deck (and, where
// there is no move button, this turn's event and "Truth or lie"); Log — the rolls. The gear holds the language and
// the turn's options; "?" shows one-line hints (0.9.19). It is in Marinara's native look.
const panel = document.createElement("aside");
panel.className = "kulisy-panel kulisy-fate-panel";
panel.dataset.offstageNative = "";
panel.hidden = true;
panel.innerHTML = `
  <div class="kulisy-head" data-no-intuitive-swipe>
    <span class="kulisy-grip" aria-hidden="true"></span>
    <span class="kulisy-title" data-t="title"></span>
    <span class="kulisy-head-tools">
      <button type="button" class="kulisy-help-btn" aria-pressed="false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg></button>
      <button type="button" class="kulisy-look kulisy-gear" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button>
      <button type="button" class="kulisy-pin" aria-pressed="false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg></button>
      <button type="button" class="kulisy-close" data-t-title="close">×</button>
    </span>
  </div>
  <div class="kulisy-looks" hidden>
    <div class="kulisy-label" data-t="set_lang"></div>
    <div class="kulisy-looks-row">
      <button type="button" class="kulisy-look-opt kulisy-lang-opt" data-lang="ru" lang="ru">Русский</button>
      <button type="button" class="kulisy-look-opt kulisy-lang-opt" data-lang="en" lang="en">English</button>
    </div>
    <div class="kulisy-label" data-ft="sec_die"></div>
    <label class="kulisy-person"><input type="checkbox" class="kulisy-fate-nodie"><span data-ft="nodie"></span></label>
    <div class="kulisy-hint kulisy-fate-opt-hint kulisy-help" data-ft="nodie_hint"></div>
    <div class="kulisy-label" data-ft="sec_dev"></div>
    <label class="kulisy-person"><input type="checkbox" class="kulisy-dev-on"><span data-ft="dev_on"></span></label>
    <div class="kulisy-hint kulisy-fate-opt-hint kulisy-help" data-ft="dev_on_hint"></div>
  </div>
  <div class="kulisy-pages" role="tablist" data-t-label="pages_label">
    <button type="button" role="tab" class="kulisy-page-tab" data-page="scene" data-t="page_scene"></button>
    <button type="button" role="tab" class="kulisy-page-tab" data-page="deck" data-t="page_deck"></button>
    <button type="button" role="tab" class="kulisy-page-tab" data-page="log" data-t="page_log"></button>
    <button type="button" role="tab" class="kulisy-page-tab" data-page="texts" data-ft="dev_page" hidden></button>
  </div>
  <div class="kulisy-page" data-page="scene" role="tabpanel">
    <div class="kulisy-scene-all" hidden>
      <div class="kulisy-scene-all-head">
        <span class="kulisy-label" data-t="mode_all_title"></span>
        <button type="button" class="kulisy-clear kulisy-mode-clear" hidden data-t="clear_all"></button>
      </div>
      <div class="kulisy-hint kulisy-help" data-t="help_all"></div>
      <div class="kulisy-mode"></div>
    </div>
    <div class="kulisy-hint kulisy-help kulisy-help-scene" data-t="help_scene"></div>
    <div class="kulisy-scene"></div>
    <div class="kulisy-scene-tools">
      <button type="button" class="kulisy-clear kulisy-here-ask" hidden></button>
      <button type="button" class="kulisy-clear kulisy-here-clear" hidden data-t="here_clear"></button>
      <button type="button" class="kulisy-clear kulisy-ear-clear" hidden data-t="ear_clear"></button>
    </div>
    <div class="kulisy-ear-state kulisy-mode-state"></div>
    <section class="kulisy-section" data-fold="scene-whisper">
      <h3 class="kulisy-fold" role="button" tabindex="0" data-t="sec_whisper"></h3>
      <div class="kulisy-hint kulisy-help" data-t="help_whisper"></div>
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
    <div class="kulisy-status"></div>
    <div class="kulisy-secret-form">
      <div class="kulisy-label kulisy-secret-len-label"></div>
      <div class="kulisy-mode-group kulisy-fate-chips kulisy-secret-len"></div>
      <div class="kulisy-label" data-ft="secret_kind"></div>
      <div class="kulisy-mode-group kulisy-fate-chips kulisy-secret-kind"></div>
      <div class="kulisy-label" data-ft="secret_size"></div>
      <div class="kulisy-mode-group kulisy-fate-chips kulisy-secret-size"></div>
      <label class="kulisy-label" for="kulisy-secret-about" data-ft="secret_about"></label>
      <textarea id="kulisy-secret-about" class="kulisy-secret-about" rows="2" maxlength="300" data-ft-ph="secret_about_ph"></textarea>
      <button type="button" class="kulisy-send kulisy-secret-go"></button>
      <div class="kulisy-hint kulisy-fate-card-hint kulisy-secret-note" hidden></div>
    </div>
  </div>
  <div class="kulisy-page" data-page="deck" role="tabpanel" hidden>
    <div class="kulisy-card kulisy-surprise-card">
      <label class="kulisy-person kulisy-surprise"><input type="checkbox" class="kulisy-fate-surprise"><span data-ft="surprise"></span></label>
      <div class="kulisy-hint kulisy-help" data-ft="surprise_hint"></div>
    </div>
    <section class="kulisy-card kulisy-try" hidden>
      <div class="kulisy-card-head"><div class="kulisy-card-title" data-ft="move_try"></div></div>
      <div class="kulisy-card-body">
        <div class="kulisy-hint kulisy-help" data-ft="help_try"></div>
        <div class="kulisy-try-body"></div>
      </div>
    </section>
    <section class="kulisy-card kulisy-deck-now">
      <div class="kulisy-card-head"><div class="kulisy-card-title" data-ft="deck_now"></div></div>
      <div class="kulisy-card-body">
        <div class="kulisy-hint kulisy-help kulisy-now-pick" data-ft="help_now"></div>
        <div class="kulisy-mode-group kulisy-fate-chips kulisy-now-pick">
          <div class="kulisy-deck-draw"></div>
          <div class="kulisy-truth-roll"></div>
        </div>
        <div class="kulisy-fate-armed kulisy-deck-armed" hidden>
          <span class="kulisy-deck-armed-text"></span>
          <button type="button" class="kulisy-clear kulisy-deck-cancel" data-ft="deck_cancel"></button>
        </div>
        <div class="kulisy-hint kulisy-fate-card-hint kulisy-deck-hint" hidden></div>
        <div class="kulisy-fate-armed kulisy-truth-armed" hidden>
          <span data-ft="truth_armed"></span>
          <button type="button" class="kulisy-clear kulisy-truth-cancel" data-ft="deck_cancel"></button>
        </div>
        <div class="kulisy-hint kulisy-fate-card-hint kulisy-truth-note" hidden></div>
      </div>
    </section>
    <section class="kulisy-card kulisy-deck">
      <div class="kulisy-card-head">
        <div class="kulisy-card-title" data-ft="sec_deck"></div>
        <div class="kulisy-card-sub kulisy-deck-count"></div>
      </div>
      <div class="kulisy-card-body">
        <div class="kulisy-label" data-ft="deck_tone"></div>
        <div class="kulisy-hint kulisy-help" data-ft="help_tone"></div>
        <div class="kulisy-mode-group kulisy-fate-chips kulisy-deck-tone"></div>
        <div class="kulisy-label" data-ft="deck_auto"></div>
        <div class="kulisy-hint kulisy-help" data-ft="deck_auto_hint"></div>
        <div class="kulisy-mode-group kulisy-fate-chips kulisy-deck-auto"></div>
        <div class="kulisy-hint kulisy-deck-auto-hint" hidden></div>
      </div>
      <div class="kulisy-card-body kulisy-deck-cards">
        <div class="kulisy-hint kulisy-help" data-ft="help_cards"></div>
        <div class="kulisy-deck-list"></div>
        <div class="kulisy-deck-tools">
          <button type="button" class="kulisy-deck-bulk-open">
            <span data-ft="deck_bulk"></span>
            <span class="kulisy-deck-edit" aria-hidden="true">›</span>
          </button>
          <button type="button" class="kulisy-clear kulisy-deck-more" aria-expanded="false" data-ft="deck_more"></button>
        </div>
        <div class="kulisy-deck-more-box" hidden>
          <button type="button" class="kulisy-clear kulisy-deck-shuffle" data-ft="deck_shuffle"></button>
          <button type="button" class="kulisy-clear kulisy-deck-clear-all"></button>
        </div>
        <div class="kulisy-deck-bulk" hidden>
          <div class="kulisy-hint" data-ft="deck_bulk_hint"></div>
          <textarea class="kulisy-deck-bulk-text" rows="8" data-ft-ph="deck_bulk_ph"></textarea>
          <div class="kulisy-deck-actions">
            <button type="button" class="kulisy-send kulisy-deck-bulk-add" data-ft="deck_bulk_add"></button>
            <button type="button" class="kulisy-clear kulisy-deck-bulk-cancel" data-ft="deck_cancel"></button>
          </div>
        </div>
        <div class="kulisy-hint kulisy-deck-bulk-result" hidden></div>
        <div class="kulisy-fate-armed kulisy-deck-undo" hidden>
          <span class="kulisy-deck-undo-text"></span>
          <button type="button" class="kulisy-clear kulisy-deck-undo-btn" data-ft="deck_undo"></button>
        </div>
      </div>
    </section>
  </div>
  <div class="kulisy-page" data-page="log" role="tabpanel" hidden>
    <section class="kulisy-section">
      <div class="kulisy-hint kulisy-help" data-ft="help_log"></div>
      <div class="kulisy-fate-log"></div>
    </section>
  </div>
  <div class="kulisy-page" data-page="texts" role="tabpanel" hidden>
    <div class="kulisy-hint kulisy-dev-intro"></div>
    <div class="kulisy-dev-groups"></div>
  </div>
`;

function applyStaticTexts() {
  paintTab();
  el.look.setAttribute("aria-label", t("set_title"));
  el.look.title = t("set_title");
  topBtn.setAttribute("aria-label", t("title"));
  topBtn.title = t("title");
  for (const node of panel.querySelectorAll("[data-t]")) node.textContent = t(node.dataset.t);
  for (const node of panel.querySelectorAll("[data-t-ph]")) node.placeholder = t(node.dataset.tPh);
  for (const node of panel.querySelectorAll("[data-t-title]")) node.title = t(node.dataset.tTitle);
  for (const node of panel.querySelectorAll("[data-t-label]")) node.setAttribute("aria-label", t(node.dataset.tLabel));
  for (const button of el.langs) button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  paintPin();
  paintHelp();
}

const el = {
  head: panel.querySelector(".kulisy-head"),
  look: panel.querySelector(".kulisy-look"),
  looks: panel.querySelector(".kulisy-looks"),
  langs: panel.querySelectorAll(".kulisy-lang-opt"),
  help: panel.querySelector(".kulisy-help-btn"),
  pin: panel.querySelector(".kulisy-pin"),
  close: panel.querySelector(".kulisy-close"),
  pages: panel.querySelector(".kulisy-pages"),
  scene: panel.querySelector(".kulisy-scene"),
  sceneAll: panel.querySelector(".kulisy-scene-all"),
  all: panel.querySelector("#kulisy-all"),
  whisper: panel.querySelector("#kulisy-whisper"),
  who: panel.querySelector(".kulisy-who"),
  note: panel.querySelector(".kulisy-note"),
  send: panel.querySelector(".kulisy-send"),
  mode: panel.querySelector(".kulisy-mode"),
  modeState: panel.querySelector(".kulisy-mode-state"),
  hereClear: panel.querySelector(".kulisy-here-clear"),
  whoClear: panel.querySelector(".kulisy-who-clear"),
  modeClear: panel.querySelector(".kulisy-mode-clear"),
  earClear: panel.querySelector(".kulisy-ear-clear"),
  status: panel.querySelector(".kulisy-status"),
  hereAsk: panel.querySelector(".kulisy-here-ask"),
};

function paintTab() {
  tab.textContent = t("title");
}
// One look since 0.9.23 (Leah 19.10: Vintage removed): the Classic rules hang on html[data-offstage-look="classic"].
document.documentElement.dataset.offstageLook = "classic";
function paintLooks() {
  el.look.setAttribute("aria-expanded", String(!el.looks.hidden));
}

// The Fate card's parts (0.9.6–0.9.17) live in the Fate (ex-Deck) and Log tabs and in the character rows (0.9.18).
const fel = {
  surprise: panel.querySelector(".kulisy-fate-surprise"),
  tryBox: panel.querySelector(".kulisy-try"),
  tryBody: panel.querySelector(".kulisy-try-body"),
  noDie: panel.querySelector(".kulisy-fate-nodie"),
  devOn: panel.querySelector(".kulisy-dev-on"),
  devIntro: panel.querySelector(".kulisy-dev-intro"),
  devGroups: panel.querySelector(".kulisy-dev-groups"),
  log: panel.querySelector(".kulisy-fate-log"),
  deckTone: panel.querySelector(".kulisy-deck-tone"),
  deckDraw: panel.querySelector(".kulisy-deck-draw"),
  deckArmed: panel.querySelector(".kulisy-deck-armed"),
  deckArmedText: panel.querySelector(".kulisy-deck-armed-text"),
  deckCancel: panel.querySelector(".kulisy-deck-cancel"),
  deckHint: panel.querySelector(".kulisy-deck-hint"),
  deckAuto: panel.querySelector(".kulisy-deck-auto"),
  deckAutoHint: panel.querySelector(".kulisy-deck-auto-hint"),
  deckCount: panel.querySelector(".kulisy-deck-count"),
  deckMore: panel.querySelector(".kulisy-deck-more"),
  deckMoreBox: panel.querySelector(".kulisy-deck-more-box"),
  deckList: panel.querySelector(".kulisy-deck-list"),
  deckShuffle: panel.querySelector(".kulisy-deck-shuffle"),
  deckBulkOpen: panel.querySelector(".kulisy-deck-bulk-open"),
  deckClearAll: panel.querySelector(".kulisy-deck-clear-all"),
  deckBulk: panel.querySelector(".kulisy-deck-bulk"),
  deckBulkText: panel.querySelector(".kulisy-deck-bulk-text"),
  deckBulkAdd: panel.querySelector(".kulisy-deck-bulk-add"),
  deckBulkCancel: panel.querySelector(".kulisy-deck-bulk-cancel"),
  deckBulkResult: panel.querySelector(".kulisy-deck-bulk-result"),
  deckUndo: panel.querySelector(".kulisy-deck-undo"),
  deckUndoText: panel.querySelector(".kulisy-deck-undo-text"),
  deckUndoBtn: panel.querySelector(".kulisy-deck-undo-btn"),
  truthRoll: panel.querySelector(".kulisy-truth-roll"),
  truthArmed: panel.querySelector(".kulisy-truth-armed"),
  truthCancel: panel.querySelector(".kulisy-truth-cancel"),
  truthHint: panel.querySelector(".kulisy-truth-note"),
  secretForm: panel.querySelector(".kulisy-secret-form"),
  secretLenLabel: panel.querySelector(".kulisy-secret-len-label"),
  secretLen: panel.querySelector(".kulisy-secret-len"),
  secretKind: panel.querySelector(".kulisy-secret-kind"),
  secretSize: panel.querySelector(".kulisy-secret-size"),
  secretAbout: panel.querySelector(".kulisy-secret-about"),
  secretGo: panel.querySelector(".kulisy-secret-go"),
  secretNote: panel.querySelector(".kulisy-secret-note"),
};
fel.secretForm.remove(); // "What happened to them?" opens inside that character's row (renderSecrets)

// "Pin" (Leah 18.10): a pinned panel stays open on a tap outside and on Esc, until it is unpinned or closed with x / its
// tab. Each device remembers its own.
const PIN_KEY = "kulisy-pinned";
function readPin(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
let pinned = readPin(PIN_KEY);
function paintPin() {
  const label = t(pinned ? "pin_off" : "pin_on");
  el.pin.setAttribute("aria-pressed", String(pinned));
  el.pin.setAttribute("aria-label", label);
  el.pin.title = label;
}
el.pin.addEventListener("click", () => {
  pinned = !pinned;
  try {
    localStorage.setItem(PIN_KEY, pinned ? "1" : "0");
  } catch {
    // the pin then lasts until the page reloads
  }
  paintPin();
});
// "?" (0.9.19): one-line hints under the headings; each device remembers its own.
const HELP_KEY = "kulisy-help";
let helpOn = readPin(HELP_KEY);
function paintHelp() {
  const label = t(helpOn ? "help_off" : "help_on");
  panel.classList.toggle("is-help", helpOn);
  el.help.setAttribute("aria-pressed", String(helpOn));
  el.help.setAttribute("aria-label", label);
  el.help.title = label;
}
el.help.addEventListener("click", () => {
  helpOn = !helpOn;
  try {
    localStorage.setItem(HELP_KEY, helpOn ? "1" : "0");
  } catch {
    // the hints then last until the page reloads
  }
  paintHelp();
});
function pinnedOpen() {
  return pinned && state.open;
}

applyStaticTexts();
document.body.appendChild(tab);
document.body.appendChild(panel);

// ---------- tabs: Scene · Deck · Log (0.9.18); each device remembers its own last tab ----------
const PAGE_KEY = "kulisy-page";
const PAGES = ["scene", "deck", "log", "texts"];
let devMode = saved.devMode === true; // 0.9.27: developer mode shows the Texts tab (Offstage's storage, all devices)
let page = "scene";
try {
  const stored = localStorage.getItem(PAGE_KEY);
  if (PAGES.includes(stored)) page = stored;
} catch {}
function paintPages() {
  el.pages.querySelector('[data-page="texts"]').hidden = !devMode;
  if (page === "texts" && !devMode) page = "scene";
  for (const button of el.pages.querySelectorAll("[data-page]")) {
    const on = button.dataset.page === page;
    button.setAttribute("aria-selected", String(on));
    button.tabIndex = on ? 0 : -1;
  }
  for (const node of panel.querySelectorAll(".kulisy-page")) node.hidden = node.dataset.page !== page;
}
function showPage(next) {
  if (!PAGES.includes(next) || (next === "texts" && !devMode)) return;
  page = next;
  try {
    localStorage.setItem(PAGE_KEY, page);
  } catch {}
  paintPages();
  panel.scrollTop = 0;
  loadPage();
}
// What a tab reads when it is shown, and when the panel opens on it.
function loadPage() {
  if (!fateReady || !state.open || !state.chatId) return;
  if (page === "deck") {
    setDeckHint("");
    setTruthHint("");
    loadDeck();
  }
  if (page === "log") void loadFateLog();
  if (page === "texts") renderPrompts();
}
for (const button of el.pages.querySelectorAll("[data-page]")) {
  button.addEventListener("click", () => showPage(button.dataset.page));
}
paintPages();

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
// 0.9.18: the whisper starts folded (once per device; a later unfold is remembered)
try {
  if (localStorage.getItem("kulisy-folded-v2") !== "1") {
    if (!folded.includes("scene-whisper")) folded.push("scene-whisper");
    localStorage.setItem(FOLD_KEY, JSON.stringify(folded));
    localStorage.setItem("kulisy-folded-v2", "1");
  }
} catch {}
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

// ---------- the Scene tab: one row per character (0.9.18) ----------
// A folded row shows the character's state — here or away, emotions, mode, a note in their ear, envelopes; a tap on it
// opens everything about them in one place, one row at a time. Rows are rebuilt only when the cast or the language
// changes, so a field being typed in is never moved.
const scene = {
  sig: "",
  rows: {}, // slot -> { wrap, open, name, sum, arrow, here, body, feel, mode, ear, secrets }
  open: null, // the slot whose row is open
};

function sceneHelp(text) {
  const hint = document.createElement("div");
  hint.className = "kulisy-hint kulisy-help";
  hint.textContent = text;
  return hint;
}

function sceneLabel(text) {
  const label = document.createElement("div");
  label.className = "kulisy-label";
  label.textContent = text;
  return label;
}

function buildScene() {
  const chat = state.chat;
  const sig = chat ? `${state.chatId}|${chat.slots.join(",")}|${lang}` : "";
  if (sig === scene.sig) return;
  scene.sig = sig;
  scene.rows = {};
  el.scene.textContent = "";
  if (!chat) return;
  if (scene.open && !chat.slots.includes(scene.open)) scene.open = null;
  for (const id of chat.slots) {
    const wrap = document.createElement("div");
    wrap.className = "kulisy-char" + (isMember(id) ? " is-member" : "");
    const head = document.createElement("div");
    head.className = "kulisy-char-head";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "kulisy-char-open";
    const name = document.createElement("span");
    name.className = "kulisy-char-name";
    const sum = document.createElement("span");
    sum.className = "kulisy-char-sum";
    const arrow = document.createElement("span");
    arrow.className = "kulisy-char-arrow";
    arrow.setAttribute("aria-hidden", "true");
    open.append(name, sum, arrow);
    open.addEventListener("click", () => openSceneRow(scene.open === id ? null : id));
    head.appendChild(open);
    // a person on a shared card is here or away with the card ("who's here" hides messages from the whole card)
    let here = null;
    if (!isMember(id)) {
      here = document.createElement("button");
      here.type = "button";
      here.className = "kulisy-here-toggle";
      here.dataset.characterId = id;
      here.addEventListener("click", () => void toggleAway(id));
      head.appendChild(here);
    }
    const body = document.createElement("div");
    body.className = "kulisy-char-body";
    body.hidden = true;
    const feelBox = document.createElement("div");
    feelBox.className = "kulisy-char-feel";
    const modeBox = document.createElement("div");
    modeBox.className = "kulisy-char-mode";
    const earBox = document.createElement("div");
    earBox.className = "kulisy-char-ear";
    const secretBox = document.createElement("div");
    secretBox.className = "kulisy-char-secrets";
    body.append(
      sceneLabel(t("feel_label")),
      sceneHelp(t("help_feel")),
      feelBox,
      sceneLabel(t("sec_mode")),
      sceneHelp(t("help_mode")),
      modeBox,
      earBox,
      sceneHelp(t("help_ear")),
      secretBox,
    );
    wrap.append(head, body);
    el.scene.appendChild(wrap);
    scene.rows[id] = { wrap, open, name, sum, arrow, here, body, feel: feelBox, mode: modeBox, ear: earBox, secrets: secretBox };
  }
}

function sceneChip(text, title) {
  const chip = document.createElement("span");
  chip.className = "kulisy-char-chip";
  chip.textContent = text;
  if (title) chip.title = title;
  return chip;
}

// The folded rows: name, state chips, "here / away".
function paintScene() {
  const chat = state.chat;
  if (!chat) return;
  const envelopes = {};
  if (fateReady && secrets.chatId === state.chatId) {
    for (const it of secrets.data.items) envelopes[it.who] = (envelopes[it.who] || 0) + 1;
  }
  for (const id of chat.slots) {
    const row = scene.rows[id];
    if (!row) continue;
    const away = Object.prototype.hasOwnProperty.call(chat.away, cardOf(id));
    const isOpen = scene.open === id;
    row.wrap.classList.toggle("is-away", away);
    row.wrap.classList.toggle("is-open", isOpen);
    row.open.setAttribute("aria-expanded", String(isOpen));
    row.name.textContent = isMember(id) ? shortName(id) : state.names[id] || id;
    row.arrow.textContent = isOpen ? "▴" : "▾";
    row.body.hidden = !isOpen;
    const chips = [];
    for (const item of feel.data[id] || []) {
      const def = FEELING_BY_KEY[item.e];
      if (def) chips.push(sceneChip(def.emoji + LEVEL_DOTS[item.lv], `${feelWord(def.key)} — ${LEVEL_WORD[lang][item.lv]}`));
    }
    const words = modeWords(modeOf(id));
    if (words) chips.push(sceneChip(words, t("sec_mode")));
    if (ear.entries[id]) chips.push(sceneChip("👂", t("char_ear")));
    if (envelopes[id]) chips.push(sceneChip(`✉ ${envelopes[id]}`, t("char_secrets", { n: envelopes[id] })));
    row.sum.replaceChildren(...chips);
    if (row.here) {
      row.here.dataset.state = away ? "away" : "here";
      row.here.textContent = away ? t("here_off") : t("here_on");
      row.here.title = away ? t("here_title_off") : t("here_title_on");
      row.here.disabled = state.awayBusy;
    }
  }
}

function openSceneRow(id) {
  scene.open = id;
  if (fateReady && secrets.step && secrets.step !== id) secrets.step = null;
  renderScene();
}

function renderScene() {
  buildScene();
  renderHere();
  renderFeel();
  renderMode();
  placeEar();
  if (fateReady) renderSecrets();
}

// "Who's here" lives on the rows now; "Bring everyone back" under them.
function renderHere() {
  el.hereClear.hidden = !state.chat || awayIds().length === 0;
  el.hereClear.disabled = state.awayBusy;
  paintScene();
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
  renderEar();
  renderScene();
  renderWho();
  if (fateReady) {
    renderFatePages();
    paintSecretOffer();
  }
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

// ---------- 0.9.20 (Leah 19.10, the new interface, piece 4): a sheet on phones, a panel dragged by its head elsewhere ----------
// Phone (< 768): the panel comes up from the bottom over the full width, half the screen high; the head (with its grip)
// drags it up to the full screen, back to half, or down and away (closes); a tap on the head switches half / full.
// PC and tablet: the head drags the panel anywhere; near the left or right edge or the top bar it sticks to it. Each
// device remembers the place (localStorage "kulisy-place"); a double click on the head puts it back where it was at first.
const PLACE_KEY = "kulisy-place";
const PLACE_SNAP = 32; // px from an edge that count as "at the edge"
const PLACE_EDGE = 12; // the panel's gap to the screen edge it sticks to
let place = null; // { side: "left" | "right" | "free", x, y: px | "bar" }
try {
  const saved = JSON.parse(localStorage.getItem(PLACE_KEY) || "null");
  if (saved && ["left", "right", "free"].includes(saved.side)) place = saved;
} catch {}
let sheetFull = false;
let headDrag = null;

function barBottom() {
  const bar = document.querySelector(".mari-topbar");
  if (!bar) return 0;
  const r = bar.getBoundingClientRect();
  return r.height > 0 && r.bottom > 0 && r.bottom < window.innerHeight / 2 ? r.bottom : 0;
}
function savePlace() {
  try {
    if (place) localStorage.setItem(PLACE_KEY, JSON.stringify(place));
    else localStorage.removeItem(PLACE_KEY);
  } catch {}
}
function setPanelXY(x, y, minTop) {
  const w = panel.offsetWidth || 320;
  const left = Math.round(Math.min(Math.max(x, 0), Math.max(0, window.innerWidth - w)));
  const top = Math.round(Math.min(Math.max(y, minTop), Math.max(minTop, window.innerHeight - 120)));
  panel.style.setProperty("--kulisy-at-x", `${left}px`);
  panel.style.setProperty("--kulisy-at-y", `${top}px`);
  panel.classList.add("is-placed");
}
// PC and tablet: the remembered place, kept inside the window
function applyPlace(bar) {
  if (PHONE.matches || !place) {
    panel.classList.remove("is-placed");
    return;
  }
  const w = panel.offsetWidth || 320;
  const minTop = bar + PLACE_EDGE;
  const x = place.side === "left" ? PLACE_EDGE : place.side === "right" ? window.innerWidth - w - PLACE_EDGE : place.x;
  setPanelXY(x, place.y === "bar" ? minTop : place.y, minTop);
}
function setSheet(full) {
  sheetFull = full;
  panel.classList.toggle("is-full", full);
  panel.style.removeProperty("--kulisy-sheet-h");
}
function onHeadDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (event.target instanceof Element && event.target.closest("button")) return;
  const box = panel.getBoundingClientRect();
  headDrag = {
    id: event.pointerId,
    x0: event.clientX,
    y0: event.clientY,
    left: box.left,
    top: box.top,
    h: box.height,
    moved: false,
    phone: PHONE.matches,
    bar: barBottom(),
  };
  try {
    el.head.setPointerCapture(event.pointerId);
  } catch {}
  if (event.pointerType === "mouse") event.preventDefault(); // no text selection while dragging
}
function onHeadMove(event) {
  const d = headDrag;
  if (!d || event.pointerId !== d.id) return;
  const dx = event.clientX - d.x0;
  const dy = event.clientY - d.y0;
  if (!d.moved) {
    if (Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    panel.classList.add("is-dragging");
  }
  if (d.phone) {
    const h = Math.min(Math.max(d.h - dy, 60), window.innerHeight - d.bar - 4);
    panel.style.setProperty("--kulisy-sheet-h", `${Math.round(h)}px`);
  } else {
    setPanelXY(d.left + dx, d.top + dy, d.bar + PLACE_EDGE);
  }
}
function onHeadUp(event) {
  const d = headDrag;
  if (!d || event.pointerId !== d.id) return;
  headDrag = null;
  panel.classList.remove("is-dragging");
  if (d.phone) {
    if (!d.moved) {
      if (event.type === "pointerup") setSheet(!sheetFull);
      return;
    }
    const h = panel.getBoundingClientRect().height;
    if (h < window.innerHeight * 0.28) {
      setSheet(false);
      state.open = false;
      showTab();
      return;
    }
    setSheet(h > (window.innerHeight * 0.5 + (window.innerHeight - d.bar)) / 2);
    return;
  }
  if (!d.moved) return;
  const box = panel.getBoundingClientRect();
  const minTop = d.bar + PLACE_EDGE;
  const side = box.left <= PLACE_SNAP ? "left" : window.innerWidth - box.right <= PLACE_SNAP ? "right" : "free";
  place = { side, x: Math.round(box.left), y: box.top - minTop <= PLACE_SNAP ? "bar" : Math.round(box.top) };
  savePlace();
  placePanel();
}
function onHeadDouble(event) {
  if (PHONE.matches || (event.target instanceof Element && event.target.closest("button"))) return;
  place = null;
  savePlace();
  placePanel();
}
el.head.addEventListener("pointerdown", onHeadDown);
el.head.addEventListener("pointermove", onHeadMove);
el.head.addEventListener("pointerup", onHeadUp);
el.head.addEventListener("pointercancel", onHeadUp);
el.head.addEventListener("dblclick", onHeadDouble);

// Where the panel stands: right under Marinara's top bar (measured: its height differs by device and safe area) or at
// the place it was dragged to, and where it is on the screen — the damask under its veil (.kulisy-bg) is laid exactly like
// the page's. --kulisy-head-h: the tabs stick right under the head, which sticks to the top while the panel scrolls.
function placePanel(p = panel) {
  const top = barBottom();
  if (top) p.style.setProperty("--kulisy-bar", `${Math.round(top)}px`);
  else p.style.removeProperty("--kulisy-bar");
  applyPlace(top);
  p.style.setProperty("--kulisy-head-h", `${el.head.offsetHeight}px`);
  // Phone: the card ends above Marinara's input block, so the block stays in sight (10.10). Not while the keyboard
  // is open — then the block sits on the keyboard and the card needs every pixel.
  let floor = 0;
  const input = document.querySelector(".mari-chat-input");
  const vv = window.visualViewport;
  if (input && window.matchMedia("(max-width: 767px)").matches && (!vv || vv.height > window.innerHeight * 0.8)) {
    const r = input.getBoundingClientRect();
    if (r.height > 0 && r.top > window.innerHeight / 2) floor = r.top;
  }
  if (floor) p.style.setProperty("--kulisy-floor", `${Math.round(floor)}px`);
  else p.style.removeProperty("--kulisy-floor");
  const box = p.getBoundingClientRect();
  p.style.setProperty("--kulisy-x", `${Math.round(box.left)}px`);
  p.style.setProperty("--kulisy-y", `${Math.round(box.top)}px`);
}
function onViewportChange() {
  if (!panel.hidden) placePanel();
  if (fate.pop && fateAnchor()) placeAboveDie(fate.pop);
}
// Typing on a touch screen (Leah 18.10): once the keyboard has opened, the field being typed in is scrolled into the
// part of the card the keyboard leaves visible - what Marinara does for its own panels
// (use-keep-focused-field-above-keyboard.ts); the card itself is kept on the visible screen by CSS (shared.css).
function onKeyboardViewport(event) {
  const detail = event && event.detail;
  const field = document.activeElement;
  if (!detail || !detail.keyboardOpen || !(field instanceof HTMLTextAreaElement)) return;
  const card = !panel.hidden && panel.contains(field) ? panel : null;
  if (!card) return;
  const reveal = () => {
    if (document.activeElement !== field) return;
    const vv = window.visualViewport;
    const screenTop = vv ? vv.offsetTop : 0;
    const screenBottom = screenTop + (vv ? vv.height : window.innerHeight);
    for (let area = field.parentElement; area && card.contains(area); area = area.parentElement) {
      if (area.scrollHeight <= area.clientHeight || !/auto|scroll/.test(getComputedStyle(area).overflowY)) continue;
      const frame = area.getBoundingClientRect();
      const top = Math.max(frame.top + area.clientTop, screenTop) + 8;
      const bottom = Math.min(frame.top + area.clientTop + area.clientHeight, screenBottom) - 8;
      const box = field.getBoundingClientRect();
      if (box.top < top) area.scrollTop += box.top - top;
      else if (box.bottom > bottom) area.scrollTop += Math.min(box.bottom - bottom, box.top - top);
    }
  };
  requestAnimationFrame(() => {
    reveal();
    requestAnimationFrame(reveal);
  });
}
// Contract with the Damask theme (ex-Concept Leya) (and anyone else): while the panel is open, <html> has the class
// "offstage-open" and the window gets "offstage:panel" {open}; the theme's own menu closes the panel
// ("concept-leya:menu" {open:true}), so the two never overlap.
let panelShown = false;
function showTab() {
  tab.hidden = !state.chatId;
  topBtn.setAttribute("aria-pressed", String(!!(state.chatId && state.open)));
  ensureTopButton();
  panel.hidden = !(state.chatId && state.open);
  if (panel.hidden && !el.looks.hidden) {
    el.looks.hidden = true;
    paintLooks();
  }
  if (!panel.hidden && !panelShown) setSheet(false);
  if (!panel.hidden) placePanel();
  const shown = !panel.hidden;
  if (shown === panelShown) return;
  panelShown = shown;
  document.documentElement.classList.toggle("offstage-open", shown);
  window.dispatchEvent(new CustomEvent("offstage:panel", { detail: { open: shown } }));
}
function onThemeMenu(event) {
  if (!event.detail || event.detail.open !== true || !state.open) return;
  state.open = false;
  showTab();
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

// "What can be seen from the doorway": the one coming back sees the chat's last message (it shows what the scene looks like
// now); everything else they missed stays hidden. Not a whisper they didn't hear. Runs in the sweep queue, after "here".
function showDoorway(chatId, ids) {
  const run = sweepChain.then(async () => {
    if (!ids.length) return;
    const list = await api(chatPath(chatId, "/messages?limit=5"));
    const last = (Array.isArray(list) ? list : []).filter((m) => m.role !== "system").pop();
    if (!last) return;
    const extra = parseMaybeJson(last.extra, {}) || {};
    const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
    if (kulisy.kind === "whisper") return;
    const awayList = Array.isArray(kulisy.away) ? kulisy.away : [];
    const hidden = Array.isArray(extra.hiddenFromAICharacterIds) ? extra.hiddenFromAICharacterIds : [];
    const back = ids.filter((id) => awayList.includes(id) && hidden.includes(id));
    if (!back.length) return;
    await api(chatPath(chatId, `/messages/${encodeURIComponent(last.id)}/extra`), {
      method: "PATCH",
      body: JSON.stringify({
        hiddenFromAICharacterIds: hidden.filter((id) => !back.includes(id)),
        kulisy: { ...kulisy, away: awayList.filter((id) => !back.includes(id)) },
      }),
    });
    refreshChatMessages(chatId);
  });
  sweepChain = run.catch(() => {});
  return run.catch((error) => marinara.log.warn("Could not show the doorway", error));
}

// ---------- newcomers: a card added mid-game knows the scene only from where they came in ----------
// Marinara gives a card added to a chat the whole history. Offstage marks the last message before they came with Marinara's
// own per-character start ("New Start" for one character, extra.conversationStartForCharacterIds): everything above it is
// left out of their prompt (Individual group mode; Merged ignores it), the message itself is what they see coming in. Only a
// card with no line of their own in this chat and only once the chat has begun (a user message); a card that was here
// before keeps its past (Who's here handles leaving). The cards already seen are kept in chat metadata (kulisyCastSeen);
// the first look at a chat only records them. Checked when a chat opens or its cast changes, after Marinara saves the
// cast, and before every generation (another device may have added them).
let newcomerChain = Promise.resolve();
function checkNewcomers(chatId) {
  newcomerChain = newcomerChain
    .then(() => doCheckNewcomers(chatId))
    .catch((error) => marinara.log.warn("Could not check for newcomers", error));
  return newcomerChain;
}
function isDoorway(message, id) {
  if (message.role === "system") return false;
  const extra = parseMaybeJson(message.extra, {}) || {};
  if (extra.hiddenFromAI === true) return false;
  return !(Array.isArray(extra.hiddenFromAICharacterIds) && extra.hiddenFromAICharacterIds.includes(id));
}
async function doCheckNewcomers(chatId) {
  if (!chatId) return;
  const chat = await api(chatPath(chatId));
  if (chat.mode === "game") return;
  const meta = parseMaybeJson(chat.metadata, {}) || {};
  const ids = (parseMaybeJson(chat.characterIds, []) || []).filter((id) => typeof id === "string");
  const seen = Array.isArray(meta[CAST_SEEN_KEY]) ? meta[CAST_SEEN_KEY] : null;
  if (seen && seen.length === ids.length && ids.every((id) => seen.includes(id))) return;
  const added = seen ? ids.filter((id) => !seen.includes(id)) : [];
  const marked = [];
  if (added.length) {
    const list = await api(chatPath(chatId, "/messages"));
    const messages = Array.isArray(list) ? list : [];
    if (messages.some((m) => m.role === "user")) {
      for (const id of added) {
        if (messages.some((m) => m.characterId === id)) continue;
        const door = [...messages].reverse().find((m) => isDoorway(m, id));
        if (!door) continue;
        const extra = parseMaybeJson(door.extra, {}) || {};
        const starts = Array.isArray(extra.conversationStartForCharacterIds) ? extra.conversationStartForCharacterIds : [];
        if (!starts.includes(id)) {
          await api(chatPath(chatId, `/messages/${encodeURIComponent(door.id)}/extra`), {
            method: "PATCH",
            body: JSON.stringify({ conversationStartForCharacterIds: [...starts, id] }),
          });
          door.extra = { ...extra, conversationStartForCharacterIds: [...starts, id] };
        }
        marked.push(id);
      }
    }
  }
  await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [CAST_SEEN_KEY]: ids }) });
  if (marked.length) {
    refreshChatMessages(chatId);
    // like coming back from "away": offer to find out what happened to them before they came
    if (chatId === state.chatId && fateReady) {
      secrets.offer = { chatId, id: marked[marked.length - 1] };
      paintSecretOffer();
    }
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
      void dropArrivals(chatId, castSlots([id])).catch((error) => marinara.log.warn("Could not remove the arrival", error));
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
    if (wasAway) await showDoorway(chatId, [id]);
    setStatus(wasAway ? t("back", { name }) : t("gone", { name }), "ok");
    // back from "away": offer to find out what happened to them meanwhile (life between scenes)
    secrets.offer = wasAway ? { chatId, id } : null;
    paintSecretOffer();
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
  const back = awayIds();
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
    await showDoorway(chatId, back);
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
      await api(chatPath(chatId, "/messages"), { method: "POST", body: JSON.stringify(allLine(chatId, allText)) });
      firstSent = true;
    }
    const whisperKulisy = { kind: "whisper", turn: 1 };
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
  paintScene();
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

// The fields are made once per chat and cast (what is typed survives); the open row shows its character's (placeEar).
function renderEar() {
  const chat = state.chat;
  if (!chat) {
    ear.sig = "";
    ear.rows = {};
    paintEarClear();
    return;
  }
  const sig = `${state.chatId}|${chat.slots.join(",")}`;
  if (sig === ear.sig) return;
  ear.sig = sig;
  for (const row of Object.values(ear.rows)) {
    if (row.timer !== null) marinara.clearTimeout(row.timer);
    row.wrap.remove();
  }
  ear.rows = {};
  for (const id of chat.slots) {
    const wrap = document.createElement("div");
    wrap.className = "kulisy-ear-row";
    const head = document.createElement("div");
    head.className = "kulisy-ear-head";
    const name = document.createElement("span");
    name.className = "kulisy-ear-name";
    name.textContent = t("sec_ear");
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

    const entry = ear.entries[id];
    const row = { wrap, label: name, textarea, quiet, loud, stateEl, loudMode: entry ? entry.depth <= EAR_LOUD_DEPTH : false, dirty: false, timer: null };
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
  placeEar();
}

function placeEar() {
  const id = scene.open;
  const target = id && scene.rows[id];
  const row = id && ear.rows[id];
  if (target && row && row.wrap.parentNode !== target.ear) target.ear.replaceChildren(row.wrap);
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
        const slot = entrySlot(ids[0], entry.description);
        const item = {
          id: entry.id,
          content: entry.content || "",
          depth: Number(entry.depth) || 0,
          position: Number(entry.position) || 0,
          outletName: entry.outletName || "",
        };
        const entryName = String(entry.name || "");
        if (FEEL_ENTRY_PREFIXES.some((prefix) => entryName.startsWith(prefix))) feelEntries[slot] = item;
        else if (MODE_ENTRY_PREFIXES.some((prefix) => entryName.startsWith(prefix))) modeEntries[slot] = item;
        else if (!isArrivalEntry(entryName)) entries[slot] = item;
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
          name: t("ear_entry", { name: entryTitle(id) }).slice(0, 200),
          content: text,
          keys: [],
          constant: true,
          position: 2,
          depth,
          role: "system",
          characterFilterMode: "include",
          ...entryTarget(id),
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
  for (const other of chat.slots) {
    if (other === id) continue;
    // a card and its own members are one voice — not targets for each other; members of one card are
    if (cardOf(other) === cardOf(id) && !(isMember(other) && isMember(id))) continue;
    list.push({ id: other, name: shortName(other) });
  }
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

// An emotion's icon: the outline is a CSS mask (extension.css, [data-e]), coloured by the text colour.
function feelIcon(key, cls = "kulisy-ei") {
  const icon = document.createElement("span");
  icon.className = cls;
  icon.dataset.e = key;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}
// Intensity as 1–3 small diamonds.
function levelDiamonds(lv, cls) {
  const box = document.createElement("span");
  box.className = cls;
  box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < lv; i += 1) box.appendChild(document.createElement("b"));
  return box;
}

// The open character's emotions: 16 buttons, then each chosen one with its intensity and "towards whom".
function renderFeel() {
  paintScene();
  const id = scene.open;
  const row = id && scene.rows[id];
  if (!row || !state.chat) return;
  const box = row.feel;
  box.textContent = "";
  const list = feel.data[id] || [];
  const grid = document.createElement("div");
  grid.className = "kulisy-feel-grid";
  for (const def of FEELINGS) {
    const item = list.find((f) => f.e === def.key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "kulisy-feel-btn" + (item ? " is-on" : "");
    button.dataset.e = def.key;
    button.title = item ? `${feelWord(def.key)} — ${LEVEL_WORD[lang][item.lv]}` : feelWord(def.key);
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", item ? "true" : "false");
    const emoji = document.createElement("span");
    emoji.textContent = def.emoji;
    const dots = document.createElement("span");
    dots.className = "kulisy-feel-dots";
    dots.textContent = item ? LEVEL_DOTS[item.lv] : "";
    button.append(emoji, dots);
    button.addEventListener("click", () => clickFeeling(id, def.key));
    grid.appendChild(button);
  }
  box.appendChild(grid);

  if (list.length) {
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "kulisy-feel-clear";
    clear.textContent = t("clear_all");
    clear.addEventListener("click", () => clearFeelings(id));
    box.appendChild(clear);
  }

  const targets = feelTargets(id);
  for (const item of list) {
    const def = FEELING_BY_KEY[item.e];
    const itemBox = document.createElement("div");
    itemBox.className = "kulisy-feel-item";
    itemBox.dataset.e = def.key;
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
    itemBox.appendChild(title);
    if (targets.length) {
      const to = document.createElement("div");
      to.className = "kulisy-feel-to";
      const label = document.createElement("span");
      label.className = "kulisy-feel-to-label";
      label.textContent = t("feel_to");
      to.appendChild(label);
      for (const target of targets) {
        const checkRow = document.createElement("label");
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = item.to.includes(target.id);
        check.addEventListener("change", () => toggleFeelTarget(id, item.e, target.id, check.checked));
        const span = document.createElement("span");
        span.textContent = target.name;
        checkRow.append(check, span);
        to.appendChild(checkRow);
      }
      itemBox.appendChild(to);
    }
    box.appendChild(itemBox);
  }

  const rs = feel.rowState[id];
  if (rs && rs.text) {
    const stateEl = document.createElement("div");
    stateEl.className = "kulisy-ear-state";
    stateEl.dataset.kind = rs.kind || "";
    stateEl.textContent = rs.text;
    box.appendChild(stateEl);
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
      // tell themes and other extensions at once (e.g. a portrait theme switches the picture): { chatId, feelings }
      window.dispatchEvent(new CustomEvent("offstage:feelings", { detail: { chatId, feelings: JSON.parse(JSON.stringify(feel.data)) } }));
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
            name: t("feel_entry", { name: entryTitle(id) }).slice(0, 200),
            content: text,
            keys: [],
            constant: true,
            position: 2,
            depth,
            role: "system",
            characterFilterMode: "include",
            ...entryTarget(id),
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
// Instruction texts are in MODE_TEXTS below; the player's own ones come from the Texts tab (promptOwn). Old custom
// Russian edits from storage "modeTexts" are taken into the Texts tab's "prompts" (withOldModeTexts).

const MODE_FORMS = [
  { key: "dialog", word: { ru: "Диалог", en: "Dialogue" }, badge: { ru: "диалог", en: "dialogue" } },
  { key: "silent", word: { ru: "Реакция", en: "Reaction" }, badge: { ru: "реакция", en: "reaction" } },
  { key: "move", word: { ru: "Ход", en: "Move" }, badge: { ru: "ход", en: "move" } },
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
    move:
      "Сейчас {имя} двигает сцену по своей воле: делает заметный шаг к тому, чего хочет, — решение, поступок или новость, после которых всё идёт иначе. {имя} пишет только свои слова и действия и ничего не решает за других.",
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
    move:
      "Now {name} moves the scene forward: takes a clear step toward what {name} wants — a decision, an act, or news after which things go differently. {name} writes only their own words and actions and decides nothing for anyone else.",
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
  version: 0, // grows on every tap, so a stale chat read never overwrites a newer tap
  queued: false,
  saving: false,
  metaDirty: false,
  retries: 0,
  status: { text: "", kind: "" },
};

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

// "Everyone" reaches cards, not the people on them: a card's own text already speaks for all of them.
function modeAllFor(id) {
  return id !== MODE_ALL && !isMember(id) && modeUsesAll();
}

// What applies to a character: their own setting, else "Everyone"; "off" = as usual.
function modeOf(id) {
  const all = modeAllFor(id) ? mode.data[MODE_ALL] || {} : {};
  const own = mode.data[id] || {};
  const f = own.f !== undefined ? own.f : all.f;
  const l = own.l !== undefined ? own.l : all.l;
  return { f: f === MODE_OFF ? undefined : f, l: l === MODE_OFF ? undefined : l };
}

function modeTextOf(key) {
  return promptOwn("mode", key, lang) ?? MODE_TEXTS[lang][key];
}

function modeText(id) {
  const { f, l } = modeOf(id);
  const parts = [];
  if (f === "dialog") {
    parts.push(modeTextOf(l ? `dialog_${l}` : "dialog"));
  } else {
    if (f === "silent" || f === "move") parts.push(modeTextOf(f));
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
  const list = chat.slots.map((id) => ({ id, words: modeWords(modeOf(id)) }));
  const active = list.filter((x) => x.words);
  if (!active.length) return "";
  const cards = list.filter((x) => !isMember(x.id));
  if (
    modeUsesAll() &&
    active.length === cards.length &&
    active.every((x) => !isMember(x.id)) &&
    cards.every((x) => x.words === cards[0].words)
  ) {
    return t("mode_all_badge", { words: cards[0].words });
  }
  return active.map((x) => `${shortName(x.id)}: ${x.words}`).join(" · ");
}

// A dot on the tab (the curtain button on a phone) while any mode is pressed.
function paintModeHead() {
  const badge = modeBadge();
  tab.classList.toggle("has-mode", !!badge);
  topBtn.classList.toggle("has-mode", !!badge);
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
  el.sceneAll.hidden = !chat || !modeUsesAll();
  paintScene();
  if (!chat) return;
  if (modeUsesAll()) {
    const row = document.createElement("div");
    row.className = "kulisy-mode-row is-all";
    const buttons = document.createElement("div");
    buttons.className = "kulisy-mode-btns";
    buttons.append(modeGroup(MODE_ALL, "f", MODE_FORMS), modeGroup(MODE_ALL, "l", MODE_LENGTHS));
    row.appendChild(buttons);
    el.mode.appendChild(row);
  }
  const id = scene.open;
  const target = id && scene.rows[id];
  if (!target) return;
  const buttons = document.createElement("div");
  buttons.className = "kulisy-mode-btns";
  buttons.append(modeGroup(id, "f", MODE_FORMS), modeGroup(id, "l", MODE_LENGTHS));
  target.mode.replaceChildren(buttons);
}

function modeGroup(key, field, options) {
  const group = document.createElement("div");
  group.className = "kulisy-mode-group";
  const own = (mode.data[key] || {})[field];
  const all = modeAllFor(key) ? (mode.data[MODE_ALL] || {})[field] : undefined;
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
  const all = modeAllFor(key) ? (mode.data[MODE_ALL] || {})[field] : undefined;
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
  const ids = new Set([...state.chat.slots, ...Object.keys(mode.entries)]);
  for (const id of ids) {
    const entry = mode.entries[id];
    const text = state.chat.slots.includes(id) ? modeText(id) : "";
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
    const ids = new Set([...state.chat.slots, ...Object.keys(mode.entries)]);
    for (const id of ids) {
      if (state.chatId !== chatId) return;
      const text = state.chat.slots.includes(id) ? modeText(id) : "";
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
            name: t("mode_entry", { name: entryTitle(id) }).slice(0, 200),
            content: text,
            keys: [],
            constant: true,
            ...place,
            role: "system",
            characterFilterMode: "include",
            ...entryTarget(id),
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

// ---- switching the language ----
// Redraws the panel and rewrites this chat's emotion and mode entries in the new language
// (other chats follow when they are opened). Free-text "in their ear" notes stay as written.

function setLanguage(next, persist) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  applyStaticTexts();
  disarmEarClear();
  for (const row of Object.values(ear.rows)) {
    row.label.textContent = t("sec_ear");
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
  renderScene();
  renderWho();
  closeFatePop();
  paintDie();
  paintFateTexts();
  scheduleBadges();
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
    // the die's options may have been changed on another device
    const surprise = !!(fresh && fresh.fateSurprise === true);
    const noDie = !!(fresh && fresh.fateNoDie === true);
    if (fresh && (surprise !== fate.surprise || noDie !== fate.noDie)) {
      fate.surprise = surprise;
      fate.noDie = noDie;
      ensureDie();
      renderFatePages();
    }
    // developer mode and the player's texts, from another device
    if (fresh) {
      const dev = fresh.devMode === true;
      if (dev !== devMode) {
        devMode = dev;
        fel.devOn.checked = dev;
        paintPages();
      }
      const own = sanitizePrompts(withOldModeTexts(fresh.prompts, fresh.modeTexts));
      if (JSON.stringify(own) !== JSON.stringify(prompts.own)) {
        prompts.own = own;
        if (!prompts.open) renderPrompts();
      }
    }
  } catch (error) {
    marinara.log.warn("Could not re-read the language", error);
  }
}

for (const button of el.langs) button.addEventListener("click", () => setLanguage(button.dataset.lang, true));
el.look.addEventListener("click", () => {
  el.looks.hidden = !el.looks.hidden;
  paintLooks();
});
el.hereClear.addEventListener("click", () => void returnAll());
el.whoClear.addEventListener("click", clearHearers);
el.modeClear.addEventListener("click", clearMode);
el.earClear.addEventListener("click", clickEarClear);

// ---------- fate: an attempt decided by a die ----------
// A 🎲 button right before Marinara's send button (roleplay input). A tap opens "Who attempts: Me · characters" and
// "Easy / Normal / Hard" above it; a difficulty rolls a d20. An attempt is { who, what (the text in Marinara's box),
// difficulty }. The outcome always reaches the model as Marinara's own generation guide (one system line at the very end
// of the prompt), which Marinara keeps with the reply and gives again on regenerate — a regenerate rewrites the text,
// never the outcome.
//   Me: the box is sent as the user's message by Marinara's own send; a fetch wrapper adds the guide to the next
//       /api/generate request of that chat (at once in the usual order, or in the generation from the character picker
//       in the Manual group order). The roll goes on the user's message.
//   A character: nothing of the attempt is posted to the chat. The box becomes Marinara's own command
//       "/guided respond for <name>: <attempt + outcome>" — that character replies at once, steered by it. The roll goes on
//       their reply.
// The roll is kept in the message's extra.kulisy.fate and shown under it like the whisper marker.

const FATE_LEVELS = ["easy", "normal", "hard"];
// d20: up to "fail" → failure, up to "cost" → success at a cost, above → success
const FATE_EDGES = { easy: { fail: 5, cost: 10 }, normal: { fail: 7, cost: 13 }, hard: { fail: 11, cost: 16 } };
const FATE_OUTCOMES = ["success", "cost", "fail"];
const FATE_TEXT = {
  ru: {
    die: "Попытка: бросить кубик",
    head: "Попытка — насколько трудно?",
    who: "Кто пытается",
    me: "Я",
    how: "Насколько трудно?",
    easy: "Легко",
    normal: "Нормально",
    hard: "Трудно",
    need_text: "Сначала напиши, что пытаешься сделать.",
    need_char: "Сначала напиши, что {name} пытается сделать.",
    note_char: "🎲 {name} · {d} · {r} — {o}",
    guide_char:
      "Попытка ({name}): «{a}». Получится или нет — уже решено броском кубика, менять это нельзя: {o} Сыграй именно этот исход — ясно, не смягчая и не переигрывая его. Никого не зови через @ и не пиши «@» в тексте. Кубик и бросок не упоминай.",
    busy: "Подожди, пока закончится ответ.",
    armed: "Бросок ждёт ответа: {d} — {o}",
    cancel: "Отменить бросок",
    note: "🎲 {d} · {r} — {o}",
    success: "успех",
    cost: "успех с ценой",
    fail: "провал",
    guide:
      "Получится ли попытка {{user}} из последней реплики {{user}}, уже решено броском кубика, менять это нельзя: {o} Исход — про то, чего добивается {{user}}: при провале цель в этом ответе не достигнута — ни самой {{user}}, ни кем-то за неё. Начни ответ с того, чем кончилась попытка, — ясно, не смягчая и не переигрывая исход. Покажи его через то, что происходит и что видно вокруг; не пиши за {{user}} ни слов, ни мыслей. Потом — реакция персонажа. Никого не зови через @ и не пиши «@» в тексте. Кубик и бросок не упоминай.",
    g_success: "УСПЕХ — получается, как задумано.",
    g_cost: "УСПЕХ С ЦЕНОЙ — получается, но за это приходится заплатить: потерей, риском, осложнением или уступкой.",
    g_fail: "ПРОВАЛ — не получается, и у неудачи есть последствия.",
    card: "Судьба",
    close: "Закрыть",
    sec_try: "Попытка",
    what: "Что пробует",
    what_ph: "Например: незаметно стянуть ключ со стола",
    what_ph_me: "Как обычный ход: *Оглядываюсь в поисках альбома*",
    how_roll: "Насколько трудно? — тап бросает кубик",
    no_input: "Здесь попытку не сделать: нужно поле ввода ролевого чата.",
    box_busy: "В поле ввода маринары уже есть текст — отправь или сотри его.",
    armed_secret: "Тайный бросок ждёт ответа",
    move: "Кулисы: что приложить к ходу",
    move_try: "Попытка",
    move_try_sub: "получится ли — решает кубик",
    move_event: "Событие",
    move_event_sub: "карта из колоды на ответ",
    move_event_tone: "карта из колоды · {tone}",
    move_truth: "Правда или ложь",
    move_truth_sub: "тайный бросок на ответ",
    move_whisper: "Шёпот",
    move_whisper_sub: "слышат только отмеченные",
    whisper_hear: "Кто слышит",
    whisper_all: "Что видят все · по желанию",
    whisper_all_ph: "*наклоняется ближе*",
    whisper_go: "Шептать",
    whisper_done: "Готово",
    whisper_off: "Отменить шёпот",
    whisper_pick: "Отметь, кто слышит.",
    whisper_none: "Все ушли — шептать некому.",
    write_whisper: "Напиши шёпот в поле",
    chip_whisper: "слышат: {names}",
    chip_whisper_all: "Все видят: {all}",
    move_waits: "ждёт ответа",
    chip_event: "событие",
    chip_event_tone: "событие: {tone}",
    chip_event_secret: "тайное событие",
    chip_truth: "правда или ложь",
    chip_off: "Убрать",
    write_me: "Напиши, что пробуешь, и нажми «Отправить».",
    write_char: "Напиши, что {name} пытается сделать, и нажми «Отправить».",
    char_gone: "{name} сейчас не здесь — попытку не сделать.",
    deck_loading: "Колода ещё загружается — попробуй через секунду.",
    sec_die: "Ход",
    surprise: "Сюрприз",
    surprise_hint: "Исход виден только в ответе и в журнале.",
    nodie: "Убрать кнопку 🎭 у «Отправить»",
    nodie_hint: "Попытка, событие и правда или ложь — тогда во вкладке «Судьба».",
    help_try: "Напиши, что пробуешь; кубик бросится при «Отправить».",
    help_tone: "Какие карты тянуть: мелочь, поворот или встряска.",
    help_cards: "Модель берёт одну подходящую из вытянутых карт.",
    help_now: "Событие из колоды или тайно правда / ложь.",
    help_log: "Тап по тайной записи открывает исход.",
    deck_now: "На следующий ответ",
    sec_dev: "Для разработчиков",
    dev_on: "Режим разработчика: вкладка «Тексты»",
    dev_on_hint: "Там правятся тексты, которые Кулисы отправляют модели.",
    dev_page: "Тексты",
    dev_intro: "Тексты, которые Кулисы отправляют модели. Язык — {lang}, его меняют в ⚙. Изменённые помечены точкой.",
    dev_lang_ru: "русский",
    dev_lang_en: "английский",
    dev_changed: "изменено: {n}",
    dev_vars: "Вставки — оставь их в тексте:",
    dev_no_vars: "Вставок нет — текст можно менять целиком.",
    dev_var_o: "исход броска",
    dev_var_name: "имя персонажа",
    dev_var_a: "что персонаж пытается сделать",
    dev_save: "Сохранить",
    dev_cancel: "Отменить",
    dev_reset: "Вернуть исходный",
    dev_empty: "Пустой текст не сохранить. Исходный — кнопкой «Вернуть исходный».",
    dev_missing: "Не хватает вставок: {list}. Без них Кулисы не подставят нужное.",
    dev_updated: "Исходный текст обновился в новой версии Кулис. Твой остаётся; «Вернуть исходный» покажет новый.",
    dev_save_error: "Не получилось сохранить.",
    dev_g_try: "Попытка",
    dev_try_me: "Попытка — твоя",
    dev_try_char: "Попытка — персонажа",
    dev_try_success: "Исход: успех",
    dev_try_cost: "Исход: успех с ценой",
    dev_try_fail: "Исход: провал",
    dev_g_deck: "Событие",
    dev_deck_many: "Из нескольких карт",
    dev_deck_one: "Одна карта",
    dev_g_truth: "Правда или ложь",
    dev_truth_truth: "Выпала правда",
    dev_truth_lie: "Выпала ложь",
    dev_var_list: "вытянутые карты",
    "dev_var_имя": "имя персонажа",
    dev_var_arrival: "как персонаж появляется — пишет модель",
    dev_var_when: "когда это было",
    dev_var_story: "сама история — пишет модель",
    dev_g_mode: "Режим",
    dev_mode_hint: "Ответ собирается так: «Начало» + форма + длина.",
    dev_mode_lead: "Начало — всегда первым",
    dev_mode_dialog: "Диалог",
    dev_mode_dialog_short: "Диалог + коротко",
    dev_mode_dialog_mid: "Диалог + средне",
    dev_mode_dialog_long: "Диалог + длинно",
    dev_mode_silent: "Реакция",
    dev_mode_silent_long: "Реакция + длинно",
    dev_mode_move: "Ход",
    dev_mode_solo: "Без формы: отвечает только он",
    dev_mode_len_short: "Длина: коротко",
    dev_mode_len_mid: "Длина: средне",
    dev_mode_len_long: "Длина: длинно",
    dev_g_away: "За кадром",
    dev_away_hint: "Меняет только новые истории и появления — записанные остаются как были.",
    dev_away_secret: "Как играть историю",
    dev_away_arrive: "Как персонаж входит в сцену",
    dev_set: "Набор текстов",
    dev_set_hint: "Все твои правки одним файлом: поделиться с другими, сохранить копию, держать разные наборы под разные модели.",
    dev_set_save: "Скачать",
    dev_set_load: "Загрузить",
    dev_set_empty: "Изменённых текстов нет — скачивать нечего.",
    dev_set_ask: "В файле текстов: {n}.",
    dev_set_replace: "Они заменят все твои правки ({m}) — свои можно сначала скачать.",
    dev_set_skipped: "Пропущено: {n} — незнакомые тексты или без нужных вставок.",
    dev_set_done: "Загружено текстов: {n}.",
    dev_set_bad: "Это не набор текстов Кулис.",
    dev_set_none: "В файле нет текстов, которые можно загрузить.",
    dev_set_error: "Не получилось загрузить.",
    deck_more: "ещё ⋯",
    deck_where_folder_short: "общая для папки «{name}»",
    deck_where_chat_short: "только этот чат",
    sec_log: "Журнал бросков",
    log_empty: "В этом чате бросков ещё не было.",
    log_secret: "тайный — тап, чтобы открыть",
    log_was_secret: "был тайным",
    log_error: "Не получилось прочитать журнал.",
    sec_deck: "Колода",
    deck_tone: "Сила событий",
    tone_any: "Любая",
    tone_cozy: "Мелочь",
    tone_tense: "Поворот",
    tone_danger: "Встряска",
    deck_draw: "Тянуть карты",
    deck_count: "{left} из {all}",
    deck_group_count: "{left} из {all}",
    deck_none: "Карт пока нет",
    deck_edit: "Изменить ›",
    deck_cards: "Карты колоды",
    deck_armed: "Ждут ответа: {list}",
    deck_armed_one: "Ждёт ответа: {list}",
    deck_armed_secret: "Тайные карты ждут ответа",
    deck_cancel: "Отменить",
    deck_already: "Карты уже ждут ответа.",
    deck_empty: "В колоде нет карт — напиши первые во вкладке «Судьба».",
    deck_spent: "Все карты сыграны — «Судьба» → «ещё ⋯» → «Перетасовать».",
    deck_no_tone: "Карт «{tone}» не осталось.",
    deck_list_empty: "Колода пуста. Карта — событие, которое может случиться в сцене.",
    deck_new_ph: "Например: начался дождь",
    deck_add: "Добавить",
    deck_new_card: "+ Новая карта",
    deck_group_none: "пусто",
    deck_save: "Сохранить",
    deck_delete: "Удалить",
    deck_delete_sure: "Точно удалить?",
    deck_used: "Сыграна",
    deck_shuffle: "Перетасовать",
    deck_bulk: "Вставить списком",
    deck_clear_all: "Убрать все карты",
    deck_clear_sure: "Точно убрать все?",
    deck_undo: "Вернуть",
    deck_undo_text: "Убрано карт: {n}.",
    sec_truth: "Правда или ложь",
    truth_roll: "Бросить на следующий ответ",
    truth_hint:
      "Ответ на твой следующий вопрос будет правдой или ложью — решает тайный бросок. Что выпало — в журнале, по тапу.",
    truth_armed: "Тайный бросок ждёт ответа",
    truth_already: "Бросок уже ждёт ответа.",
    log_truth: "Правда или ложь",
    truth_truth: "правда",
    truth_lie: "ложь",
    truth_guide_truth:
      "Правда или ложь: исход уже решён тайным броском, менять его нельзя. Если в этом ответе персонаж отвечает на вопрос {{user}} или говорит о том, о чём его спросили, — он отвечает правду: честно и по существу говорит, как есть на самом деле (насколько сам знает), даже если ему не хочется это раскрывать. Не подчёркивай, что это правда. Не пиши за {{user}} ни слов, ни мыслей. Никого не зови через @ и не пиши «@» в тексте. Не упоминай броски и проверки.",
    truth_guide_lie:
      "Правда или ложь: исход уже решён тайным броском, менять его нельзя. Если в этом ответе персонаж отвечает на вопрос {{user}} или говорит о том, о чём его спросили, — он лжёт: уверенно и правдоподобно, ложь звучит естественно. Не выдавай ложь ни мыслями персонажа, ни описанием (взгляд, голос, руки), ни намёками рассказчика: по тексту ответа нельзя понять, что это ложь. Не пиши за {{user}} ни слов, ни мыслей. Никого не зови через @ и не пиши «@» в тексте. Не упоминай броски и проверки.",
    deck_bulk_hint:
      "Одна строка — одна карта. Строка «Мелочь:», «Поворот:» или «Встряска:» задаёт силу карт под ней; без неё — мелочь. Можно попросить ИИ: «Напиши 30 событий для моей сцены [где и что происходит]: по 10 под заголовками Мелочь:, Поворот:, Встряска:, одно событие — одна короткая строка».",
    deck_bulk_ph: "Мелочь:\nНачался дождь\nКот уронил вазу\nПоворот:\nПришло письмо",
    deck_bulk_add: "Добавить все",
    deck_bulk_done: "Добавлено карт: {n}.",
    deck_bulk_dupes: "Уже были в колоде: {n}.",
    deck_bulk_full: "Не поместилось: {n} — в колоде до {max} карт.",
    deck_bulk_none: "Не нашёл ни одной карты: одна строка — одна карта.",
    deck_save_error: "Не получилось сохранить колоду.",
    deck_where_folder: "Общая для всех сцен папки «{name}».",
    deck_where_chat: "Только для этого чата: он не в папке. Чаты одной папки тянут из общей колоды.",
    deck_guide_many:
      "Колода событий: в этом ответе в сцене должно случиться ровно одно новое событие. Выбери из вариантов одно — то, что уместнее всего сейчас: {list}. Введи его естественно, через то, что происходит в сцене, и дай персонажу на него отреагировать. Остальные варианты в этом ответе не случаются: не вводи их, не упоминай и не намекай на них. Не пиши за {{user}} ни слов, ни мыслей. Никого не зови через @ и не пиши «@» в тексте. Не упоминай колоду, карты и выбор.",
    deck_guide_one:
      "Колода событий: в этом ответе в сцене случается событие — {list}. Введи его естественно, через то, что происходит в сцене, и дай персонажу на него отреагировать. Не пиши за {{user}} ни слов, ни мыслей. Никого не зови через @ и не пиши «@» в тексте. Не упоминай колоду и карты.",
    deck_auto: "Тянет сама",
    auto_off: "Выкл",
    auto_rare: "Редко",
    auto_some: "Иногда",
    auto_often: "Часто",
    deck_auto_hint: "Тайная карта раз в 10–15 / 6–10 / 3–6 твоих реплик.",
    deck_auto_dry: "Сейчас подходящих карт нет — колода ждёт.",
    log_deck: "Колода",
    log_deck_auto: "Колода · сама",
    log_deck_secret: "тайные карты — тап, чтобы открыть",
    log_deck_from: "из: {list}",
    log_deck_unknown: "какая сыграна — не понял",
    sec_secrets: "Жизнь за кадром",
    secret_who: "С кем",
    secret_len: "Сколько его не было",
    secret_len_start: "Когда это было",
    secret_kind: "Что случилось",
    secret_size: "Сила",
    secret_any: "Наугад",
    secret_size_deck: "Как в колоде",
    secret_about: "Намёк (по желанию)",
    secret_about_ph: "например: ездила в Лондон к сестре",
    secret_arrival: "Приход:",
    sl_hours: "Несколько часов",
    sl_day: "День",
    sl_week: "Неделя и больше",
    sl_recent: "Недавно",
    sl_long: "Давно",
    secret_go: "Что с ним было?",
    secret_ask: "Узнать",
    secrets_label: "Тайны",
    secret_busy: "Пишу историю…",
    secret_pick: "Выбери, с кем.",
    secret_pick_len: "Выбери, сколько его не было.",
    secret_pick_start: "Выбери, когда это было.",
    secret_no_conn: "у чата не выбрано подключение к модели",
    secret_empty: "модель ничего не написала, попробуй ещё раз",
    secret_failed: "Не получилось: {err}",
    secret_save_error: "Не получилось сохранить конверты.",
    secret_done: "Готово: конверт запечатан.",
    secret_none: "Конвертов пока нет.",
    secret_sealed: "запечатан — тап, чтобы прочитать",
    secret_closed: "тап — прочитать",
    secret_read: "тап — свернуть",
    secret_forget: "Забыть",
    secret_forget_sure: "Точно забыть?",
    secret_over: "{name}: тайн больше {n} — старые можно забыть.",
    secret_forget_old: "Забыть самую старую",
    secret_offer: "{name}: что с ним было? ›",
    secret_hint:
      "Что случилось с персонажем, пока его не видели: он это помнит, а ты — нет, пока не откроешь конверт. «Наугад» — вид решает тайный бросок, «Как в колоде» — «Сила событий» колоды. Если персонаж только входит в сцену (добавлен в чат или вернулся), модель допишет, как он сюда попал. Конверты общие для всех сцен папки.",
    secret_book: "Тайны — {name}",
    secret_book_bare: "Тайны",
    secret_book_desc:
      "Кулисы: что случилось с персонажами за кадром. Общий для всех чатов игры (папки); статью видит только её персонаж. Забывать — в Кулисах: «Судьба» → «Жизнь за кадром».",
    secret_entry_name: "Тайна — {name} · {date}",
    sk_good: "хорошее",
    sk_bad: "плохое",
    sk_meet: "встреча",
    sk_secret: "тайна",
    sg_good: "что-то хорошее для него: удача, подарок, успех, радость",
    sg_bad: "что-то плохое для него: потеря, рана, ссора, неудача",
    sg_meet:
      "встреча: он с кем-то познакомился — с новым человеком, которого нет ни в сцене, ни в карточке, — или неожиданно встретил кого-то из своего прошлого",
    sg_secret: "тайна: он узнал, сделал или получил что-то, что предпочёл бы скрыть",
    ss_cozy: "мелочь — небольшое, повседневное: про настроение и детали",
    ss_tense: "поворот — заметное событие, которое что-то для него меняет",
    ss_danger: "встряска — серьёзное событие, которое выбивает его из колеи",
    sw_hours: "за последние несколько часов",
    sw_day: "за последний день",
    sw_week: "за последнюю неделю или дольше",
    sw_recent: "незадолго до начала истории",
    sw_long: "давно, задолго до начала истории",
    sp_system:
      "Ты пишешь закулисье ролевой игры: что случилось с персонажем {name} {when}, пока игрок ({user}) этого не видел. Вид события: {kind}. Размах: {size}. Только его личное — знакомства, вещи, раны, тайны, настроение, планы. Не решай дела игрока и других персонажей, не двигай общий сюжет, не противоречь карточке и сцене. Сцена дана только как фон: её события, предметы и чужие тайны — не материал для истории; история — о его жизни вне сцены и заканчивается до того, что в сцене происходит. {length}, третье лицо, прошедшее время, без прямой речи, без вступлений, заголовков и пояснений. Пиши на языке сцены.",
    sp_card: "Карточка — {name}",
    sp_personality: "Характер",
    sp_scenario: "Сценарий",
    sp_member: "Речь об одном человеке из этой карточки — {name}.",
    sp_summary: "Что было раньше (краткий пересказ)",
    sp_scene: "Последние сообщения сцены",
    sp_missed: "Пока {name} не было, в сцене прошло ещё сообщений: {n}. Что в них — {name} не знает, и в этой истории их нет.",
    sp_absent: "{name} в этих сообщениях не участвовал(а) и мог(ла) их не видеть: не опирайся на то, что в них случилось.",
    sp_away: "Сейчас {name} в сцене нет.",
    sp_narrator: "Рассказчик",
    sp_player: "игрок",
    sp_ask: "Напиши, что случилось с персонажем {name} {when}.",
    sp_hint: "Игрок подсказал, о чём эта история: «{hint}». Построй её вокруг этого.",
    sp_arrive:
      "После истории — отдельная строка «---», а под ней 1–2 предложения: как {name} сейчас приходит туда, где идёт сцена (место — из последних сообщений), по своей причине — из этой истории или из своих дел. Что там происходит, {name} ещё не знает: приход — не ответ на события сцены.",
    sn_cozy: "1–2 предложения",
    sn_tense: "2–3 предложения",
    sn_danger: "3–5 предложений",
    arrive_entry_name: "Приход — {name}",
    arrive_entry:
      "Как {name} оказывается в этой сцене: {arrival}\nЧто здесь происходило, пока персонажа не было, ему неизвестно — только то, что видно сейчас.",
    secret_entry:
      "Закулисье — {name} ({when}); {{user}} об этом не знает:\n{story}\n\nКак с этим играть: это настоящая память персонажа, другой версии нет. Видимые следы (рана, новая вещь, усталость) видны сразу. О самом случившемся персонаж не заговаривает первым и не выкладывает всё сразу — только когда к месту. Если спросят — отвечает от этой истории, в своём характере: может рассказать, недоговорить или уйти от ответа, но не придумывает другую. Не упоминай кубики и броски.",
  },
  en: {
    die: "Attempt: roll the die",
    head: "Attempt — how hard?",
    who: "Who attempts",
    me: "Me",
    how: "How hard?",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    need_text: "First write what you are trying to do.",
    need_char: "First write what {name} is trying to do.",
    note_char: "🎲 {name} · {d} · {r} — {o}",
    guide_char:
      "Attempt ({name}): “{a}”. Whether it comes off is already decided by a die roll and cannot change: {o} Play exactly this outcome — clearly, without softening or overturning it. Don't call anyone with @ and don't write “@” in the text. Don't mention the die or the roll.",
    busy: "Wait until the reply is finished.",
    armed: "The roll waits for a reply: {d} — {o}",
    cancel: "Cancel the roll",
    note: "🎲 {d} · {r} — {o}",
    success: "success",
    cost: "success at a cost",
    fail: "failure",
    guide:
      "Whether {{user}}'s attempt in {{user}}'s last message comes off is already decided by a die roll and cannot change: {o} The outcome is about what {{user}} is after: on a failure the goal is not reached in this reply — neither by {{user}} nor by anyone else for {{user}}. Open the reply with how the attempt ended — clearly, without softening or overturning the outcome. Show it through what happens and what can be seen around; don't write {{user}}'s words or thoughts. Then the character's reaction. Don't call anyone with @ and don't write “@” in the text. Don't mention the die or the roll.",
    g_success: "SUCCESS — it works as intended.",
    g_cost: "SUCCESS AT A COST — it works, but there is a price: a loss, a risk, a complication or a concession.",
    g_fail: "FAILURE — it doesn't work, and the failure has consequences.",
    card: "Fate",
    close: "Close",
    sec_try: "Attempt",
    what: "What is attempted",
    what_ph: "E.g. slip the key off the desk unseen",
    what_ph_me: "As a normal turn: *I look around for my sketchbook*",
    how_roll: "How hard? — a tap rolls the die",
    no_input: "No attempt here: it needs a roleplay chat's message box.",
    box_busy: "Marinara's message box already has text — send or clear it first.",
    armed_secret: "A secret roll waits for a reply",
    move: "Offstage: add to this turn",
    move_try: "Attempt",
    move_try_sub: "will it work — the die decides",
    move_event: "Event",
    move_event_sub: "a card from the deck for the reply",
    move_event_tone: "a deck card · {tone}",
    move_truth: "Truth or lie",
    move_truth_sub: "a secret roll for the reply",
    move_whisper: "Whisper",
    move_whisper_sub: "only the checked hear it",
    whisper_hear: "Who hears",
    whisper_all: "What everyone sees · optional",
    whisper_all_ph: "*leans in close*",
    whisper_go: "Whisper",
    whisper_done: "Done",
    whisper_off: "Cancel the whisper",
    whisper_pick: "Check who hears.",
    whisper_none: "Everyone is away — no one to whisper to.",
    write_whisper: "Write the whisper in the box",
    chip_whisper: "heard by: {names}",
    chip_whisper_all: "Everyone sees: {all}",
    move_waits: "waits for the reply",
    chip_event: "event",
    chip_event_tone: "event: {tone}",
    chip_event_secret: "secret event",
    chip_truth: "truth or lie",
    chip_off: "Remove",
    write_me: "Write what you try, then press Send.",
    write_char: "Write what {name} tries to do, then press Send.",
    char_gone: "{name} is not here now — no attempt.",
    deck_loading: "The deck is still loading — try again in a second.",
    sec_die: "Turn",
    surprise: "Surprise",
    surprise_hint: "The outcome shows only in the reply and the log.",
    nodie: "Hide the 🎭 button by “Send”",
    nodie_hint: "Attempts, events and truth or lie are then in the Fate tab.",
    help_try: "Write what you try; the die is rolled when you press Send.",
    help_tone: "Which cards to draw: minor, twist or shake-up.",
    help_cards: "The model picks one fitting card of those drawn.",
    help_now: "An event from the deck, or a secret truth or lie.",
    help_log: "Tap a secret entry to reveal it.",
    deck_now: "For the next reply",
    sec_dev: "For developers",
    dev_on: "Developer mode: the Texts tab",
    dev_on_hint: "There you can edit the texts Offstage sends to the model.",
    dev_page: "Texts",
    dev_intro: "The texts Offstage sends to the model. Language: {lang}, changed in ⚙. Edited ones carry a dot.",
    dev_lang_ru: "Russian",
    dev_lang_en: "English",
    dev_changed: "edited: {n}",
    dev_vars: "Slots — keep them in the text:",
    dev_no_vars: "No slots — the text can change entirely.",
    dev_var_o: "the roll's outcome",
    dev_var_name: "the character's name",
    dev_var_a: "what the character attempts",
    dev_save: "Save",
    dev_cancel: "Cancel",
    dev_reset: "Restore the original",
    dev_empty: "An empty text can't be saved. For the original, tap “Restore the original”.",
    dev_missing: "Missing slots: {list}. Without them Offstage can't fill in what's needed.",
    dev_updated: "The original text changed in a newer Offstage. Yours stays; “Restore the original” shows the new one.",
    dev_save_error: "Could not save.",
    dev_g_try: "Attempt",
    dev_try_me: "Attempt — yours",
    dev_try_char: "Attempt — a character's",
    dev_try_success: "Outcome: success",
    dev_try_cost: "Outcome: success at a cost",
    dev_try_fail: "Outcome: failure",
    dev_g_deck: "Event",
    dev_deck_many: "From several cards",
    dev_deck_one: "One card",
    dev_g_truth: "Truth or lie",
    dev_truth_truth: "Rolled the truth",
    dev_truth_lie: "Rolled a lie",
    dev_var_list: "the drawn cards",
    dev_var_arrival: "how the character comes in — written by the model",
    dev_var_when: "when it happened",
    dev_var_story: "the story itself — written by the model",
    dev_g_mode: "Mode",
    dev_mode_hint: "A reply is built as: “Start” + form + length.",
    dev_mode_lead: "Start — always first",
    dev_mode_dialog: "Dialogue",
    dev_mode_dialog_short: "Dialogue + short",
    dev_mode_dialog_mid: "Dialogue + medium",
    dev_mode_dialog_long: "Dialogue + long",
    dev_mode_silent: "Reaction",
    dev_mode_silent_long: "Reaction + long",
    dev_mode_move: "Move",
    dev_mode_solo: "No form: only they reply",
    dev_mode_len_short: "Length: short",
    dev_mode_len_mid: "Length: medium",
    dev_mode_len_long: "Length: long",
    dev_g_away: "Offscreen",
    dev_away_hint: "Changes only new stories and arrivals — the ones already written stay as they were.",
    dev_away_secret: "How to play the story",
    dev_away_arrive: "How the character enters the scene",
    dev_set: "Text set",
    dev_set_hint: "All your edits in one file: share them, keep a copy, keep different sets for different models.",
    dev_set_save: "Download",
    dev_set_load: "Upload",
    dev_set_empty: "No edited texts — nothing to download.",
    dev_set_ask: "Texts in the file: {n}.",
    dev_set_replace: "They replace all your edits ({m}) — you can download yours first.",
    dev_set_skipped: "Skipped: {n} — unknown texts or missing slots.",
    dev_set_done: "Texts uploaded: {n}.",
    dev_set_bad: "This is not an Offstage text set.",
    dev_set_none: "The file has no texts that can be uploaded.",
    dev_set_error: "Could not upload.",
    deck_more: "more ⋯",
    deck_where_folder_short: "shared by the “{name}” folder",
    deck_where_chat_short: "this chat only",
    sec_log: "Roll log",
    log_empty: "No rolls in this chat yet.",
    log_secret: "secret — tap to reveal",
    log_was_secret: "was secret",
    log_error: "Could not read the log.",
    sec_deck: "Deck",
    deck_tone: "Event size",
    tone_any: "Any",
    tone_cozy: "Minor",
    tone_tense: "Twist",
    tone_danger: "Shake-up",
    deck_draw: "Draw cards",
    deck_count: "{left} of {all}",
    deck_group_count: "{left} of {all}",
    deck_none: "No cards yet",
    deck_edit: "Edit ›",
    deck_cards: "Deck cards",
    deck_armed: "Waiting for a reply: {list}",
    deck_armed_one: "Waiting for a reply: {list}",
    deck_armed_secret: "Secret cards wait for a reply",
    deck_cancel: "Cancel",
    deck_already: "Cards already wait for a reply.",
    deck_empty: "The deck has no cards — write the first ones in the Fate tab.",
    deck_spent: "Every card has been played — “Fate” → “more ⋯” → “Shuffle”.",
    deck_no_tone: "No “{tone}” cards left.",
    deck_list_empty: "The deck is empty. A card is an event that may happen in the scene.",
    deck_new_ph: "E.g. it starts to rain",
    deck_add: "Add",
    deck_new_card: "+ New card",
    deck_group_none: "empty",
    deck_save: "Save",
    deck_delete: "Delete",
    deck_delete_sure: "Delete for sure?",
    deck_used: "Played",
    deck_shuffle: "Shuffle",
    deck_bulk: "Paste a list",
    deck_clear_all: "Remove all cards",
    deck_clear_sure: "Remove all for sure?",
    deck_undo: "Bring back",
    deck_undo_text: "Cards removed: {n}.",
    sec_truth: "Truth or lie",
    truth_roll: "Roll for the next reply",
    truth_hint:
      "The answer to your next question will be the truth or a lie — a secret roll decides. Tap its line in the log to see which.",
    truth_armed: "A secret roll waits for the reply",
    truth_already: "A roll is already waiting for the reply.",
    log_truth: "Truth or lie",
    truth_truth: "the truth",
    truth_lie: "a lie",
    truth_guide_truth:
      "Truth or lie: the outcome is already decided by a secret roll and can't be changed. If in this reply the character answers {{user}}'s question or speaks about what they were asked, they tell the truth: honestly and to the point, how things really are (as far as they know), even if they would rather keep it hidden. Don't stress that it is the truth. Don't write {{user}}'s words or thoughts. Don't call anyone with @ and don't write “@” in the text. Don't mention rolls or checks.",
    truth_guide_lie:
      "Truth or lie: the outcome is already decided by a secret roll and can't be changed. If in this reply the character answers {{user}}'s question or speaks about what they were asked, they lie: confidently and plausibly, the lie sounds natural. Don't give the lie away through the character's thoughts, the description (eyes, voice, hands) or the narrator's hints: nothing in the reply may show that it is a lie. Don't write {{user}}'s words or thoughts. Don't call anyone with @ and don't write “@” in the text. Don't mention rolls or checks.",
    deck_bulk_hint:
      "One line — one card. A line “Minor:”, “Twist:” or “Shake-up:” sets the size of the cards under it; without one — minor. You can ask an AI: “Write 30 events for my scene [where, what is going on]: 10 under each heading Minor:, Twist:, Shake-up:, one short line per event.”",
    deck_bulk_ph: "Minor:\nIt starts to rain\nThe cat knocks over a vase\nTwist:\nA letter arrives",
    deck_bulk_add: "Add all",
    deck_bulk_done: "Cards added: {n}.",
    deck_bulk_dupes: "Already in the deck: {n}.",
    deck_bulk_full: "Didn't fit: {n} — a deck holds up to {max} cards.",
    deck_bulk_none: "No cards found: one line — one card.",
    deck_save_error: "Could not save the deck.",
    deck_where_folder: "Shared by every scene in the “{name}” folder.",
    deck_where_chat: "For this chat only: it is not in a folder. Chats of one folder draw from a shared deck.",
    deck_guide_many:
      "Event deck: exactly one new event must happen in the scene in this reply. Pick one option — the one that fits best right now: {list}. Bring it in naturally, through what is happening in the scene, and let the character react to it. The other options don't happen in this reply: don't bring them in, mention them or hint at them. Don't write {{user}}'s words or thoughts. Don't call anyone with @ and don't write “@” in the text. Don't mention the deck, the cards or the choice.",
    deck_guide_one:
      "Event deck: an event happens in the scene in this reply — {list}. Bring it in naturally, through what is happening in the scene, and let the character react to it. Don't write {{user}}'s words or thoughts. Don't call anyone with @ and don't write “@” in the text. Don't mention the deck or the cards.",
    deck_auto: "Draws by itself",
    auto_off: "Off",
    auto_rare: "Rarely",
    auto_some: "Sometimes",
    auto_often: "Often",
    deck_auto_hint: "A secret card every 10–15 / 6–10 / 3–6 of your turns.",
    deck_auto_dry: "No card fits right now — the deck waits.",
    log_deck: "Deck",
    log_deck_auto: "Deck · by itself",
    log_deck_secret: "secret cards — tap to reveal",
    log_deck_from: "from: {list}",
    log_deck_unknown: "couldn't tell which was played",
    sec_secrets: "Life off-screen",
    secret_who: "Who",
    secret_len: "How long they were away",
    secret_len_start: "When it was",
    secret_kind: "What happened",
    secret_size: "Size",
    secret_any: "Random",
    secret_size_deck: "As the deck",
    secret_about: "A hint (optional)",
    secret_about_ph: "e.g. went to London to see her sister",
    secret_arrival: "Arrival:",
    sl_hours: "A few hours",
    sl_day: "A day",
    sl_week: "A week or more",
    sl_recent: "Recently",
    sl_long: "Long ago",
    secret_go: "What happened to them?",
    secret_ask: "Find out",
    secrets_label: "Secrets",
    secret_busy: "Writing the story…",
    secret_pick: "Pick who.",
    secret_pick_len: "Pick how long they were away.",
    secret_pick_start: "Pick when it was.",
    secret_no_conn: "the chat has no model connection",
    secret_empty: "the model wrote nothing, try again",
    secret_failed: "Didn't work: {err}",
    secret_save_error: "Could not save the envelopes.",
    secret_done: "Done: the envelope is sealed.",
    secret_none: "No envelopes yet.",
    secret_sealed: "sealed — tap to read",
    secret_closed: "tap to read",
    secret_read: "tap to fold",
    secret_forget: "Forget",
    secret_forget_sure: "Forget for sure?",
    secret_over: "{name}: more than {n} secrets — old ones can be forgotten.",
    secret_forget_old: "Forget the oldest",
    secret_offer: "{name}: what happened to them? ›",
    secret_hint:
      "What happened to a character while nobody saw: they remember it, you don't — until you open the envelope. “Random” — the kind is a secret roll, “As the deck” — the deck's “Event size”. If the character is just entering the scene (added to the chat or back), the model also writes how they got here. Envelopes are shared by every scene in the folder.",
    secret_book: "Secrets — {name}",
    secret_book_bare: "Secrets",
    secret_book_desc:
      "Offstage: what happened to the characters off-screen. Shared by every chat of the game (folder); each entry reaches only its own character. Forget them in Offstage: “Fate” → “Life off-screen”.",
    secret_entry_name: "Secret — {name} · {date}",
    sk_good: "good",
    sk_bad: "bad",
    sk_meet: "a meeting",
    sk_secret: "a secret",
    sg_good: "something good for them: luck, a gift, a success, a joy",
    sg_bad: "something bad for them: a loss, a wound, a quarrel, a failure",
    sg_meet:
      "a meeting: they got to know someone — a new person who is neither in the scene nor on the card — or unexpectedly met someone from their past",
    sg_secret: "a secret: they learned, did or got something they would rather hide",
    ss_cozy: "minor — something small and everyday: about mood and details",
    ss_tense: "a twist — a noticeable event that changes something for them",
    ss_danger: "a shake-up — a serious event that throws them off balance",
    sw_hours: "over the last few hours",
    sw_day: "over the last day",
    sw_week: "over the last week or longer",
    sw_recent: "shortly before the story began",
    sw_long: "long ago, well before the story began",
    sp_system:
      "You write the backstage of a roleplay: what happened to the character {name} {when}, while the player ({user}) didn't see it. Kind of event: {kind}. Size: {size}. Only their own life — acquaintances, things, wounds, secrets, mood, plans. Don't decide anything for the player or other characters, don't move the main plot, don't contradict the card or the scene. The scene is given as background only: its events, objects and other people's secrets are not material for the story; the story is about their life away from the scene and ends before what happens in it. {length}, third person, past tense, no direct speech, no intro, headings or explanations. Write in the language of the scene.",
    sp_card: "Card — {name}",
    sp_personality: "Personality",
    sp_scenario: "Scenario",
    sp_member: "This is about one person on this card — {name}.",
    sp_summary: "Earlier (a short summary)",
    sp_scene: "The scene's last messages",
    sp_missed: "While {name} was away, more messages passed in the scene: {n}. {name} doesn't know what was in them, and they are not part of this story.",
    sp_absent: "{name} took no part in these messages and may not have seen them: don't build on what happened in them.",
    sp_away: "{name} is not in the scene right now.",
    sp_narrator: "Narrator",
    sp_player: "the player",
    sp_ask: "Write what happened to the character {name} {when}.",
    sp_hint: "The player hinted what this story is about: “{hint}”. Build it around that.",
    sp_arrive:
      "After the story — a separate line “---”, and under it 1–2 sentences: how {name} now comes to where the scene is (the place — from the last messages), for a reason of their own — from this story or their own business. {name} doesn't know yet what is going on there: the arrival is not a response to the scene's events.",
    sn_cozy: "1–2 sentences",
    sn_tense: "2–3 sentences",
    sn_danger: "3–5 sentences",
    arrive_entry_name: "Arrival — {name}",
    arrive_entry:
      "How {name} comes into this scene: {arrival}\nWhat went on here while the character was away, they don't know — only what can be seen now.",
    secret_entry:
      "Backstage — {name} ({when}); {{user}} doesn't know about it:\n{story}\n\nHow to play it: this is the character's real memory, there is no other version. Visible traces (a wound, a new thing, tiredness) show at once. The character doesn't bring it up first or tell it all at once — only when it fits. If asked, they answer from this story, in character: they may tell it, leave things out or dodge, but never make up another. Don't mention dice or rolls.",
  },
};
// ---------- developer mode (0.9.27, Leah 20.10): the texts Offstage sends to the model, editable ----------
// The player's own texts live in Offstage's storage "prompts" = { ru: { "fate:guide": { t, b } }, en: {…} }: t — the
// player's text, b — the built-in text it was written over (a newer built-in text shows "the original changed").
// A text missing a slot ({o}, {name}…) of its built-in one is never used. Edited in the Texts tab (renderPrompts).
const PROMPT_SOURCES = { fate: FATE_TEXT, mode: MODE_TEXTS };
const PROMPT_GROUPS = [
  {
    key: "try",
    title: "dev_g_try",
    items: [
      { src: "fate", key: "guide", name: "dev_try_me" },
      { src: "fate", key: "guide_char", name: "dev_try_char" },
      { src: "fate", key: "g_success", name: "dev_try_success" },
      { src: "fate", key: "g_cost", name: "dev_try_cost" },
      { src: "fate", key: "g_fail", name: "dev_try_fail" },
    ],
  },
  {
    key: "deck",
    title: "dev_g_deck",
    items: [
      { src: "fate", key: "deck_guide_many", name: "dev_deck_many" },
      { src: "fate", key: "deck_guide_one", name: "dev_deck_one" },
    ],
  },
  {
    key: "truth",
    title: "dev_g_truth",
    items: [
      { src: "fate", key: "truth_guide_truth", name: "dev_truth_truth" },
      { src: "fate", key: "truth_guide_lie", name: "dev_truth_lie" },
    ],
  },
  {
    key: "mode",
    title: "dev_g_mode",
    hint: "dev_mode_hint",
    items: [
      { src: "mode", key: "lead", name: "dev_mode_lead" },
      { src: "mode", key: "dialog", name: "dev_mode_dialog" },
      { src: "mode", key: "dialog_short", name: "dev_mode_dialog_short" },
      { src: "mode", key: "dialog_mid", name: "dev_mode_dialog_mid" },
      { src: "mode", key: "dialog_long", name: "dev_mode_dialog_long" },
      { src: "mode", key: "silent", name: "dev_mode_silent" },
      { src: "mode", key: "silent_long", name: "dev_mode_silent_long" },
      { src: "mode", key: "move", name: "dev_mode_move" },
      { src: "mode", key: "solo", name: "dev_mode_solo" },
      { src: "mode", key: "len_short", name: "dev_mode_len_short" },
      { src: "mode", key: "len_mid", name: "dev_mode_len_mid" },
      { src: "mode", key: "len_long", name: "dev_mode_len_long" },
    ],
  },
  {
    key: "away",
    title: "dev_g_away",
    hint: "dev_away_hint",
    items: [
      { src: "fate", key: "secret_entry", name: "dev_away_secret" },
      { src: "fate", key: "arrive_entry", name: "dev_away_arrive" },
    ],
  },
];
function promptId(item) {
  return `${item.src}:${item.key}`;
}
const PROMPT_ITEMS = new Map(PROMPT_GROUPS.flatMap((g) => g.items).map((item) => [promptId(item), item]));
function promptBuiltIn(item, code) {
  return PROMPT_SOURCES[item.src][code]?.[item.key] ?? "";
}
// Slots are {word}; Marinara's own macros {{user}} / {{char}} are not slots.
function promptVars(text) {
  const out = [];
  for (const m of text.matchAll(/(?<!\{)\{([^{}\s]+)\}(?!\})/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}
function promptMissing(text, built) {
  return promptVars(built).filter((v) => !text.includes(`{${v}}`));
}
function sanitizePrompts(raw) {
  const out = {};
  for (const code of LANGS) {
    const src = raw && typeof raw === "object" && raw[code] && typeof raw[code] === "object" ? raw[code] : {};
    for (const [id, value] of Object.entries(src)) {
      const item = PROMPT_ITEMS.get(id);
      if (!item || !value || typeof value !== "object") continue;
      const built = promptBuiltIn(item, code);
      const text = typeof value.t === "string" ? value.t.trim() : "";
      if (!text || text === built || promptMissing(text, built).length) continue;
      (out[code] ||= {})[id] = { t: text, b: typeof value.b === "string" ? value.b : built };
    }
  }
  return out;
}
// Mode texts edited before 0.9.30 (storage "modeTexts", Russian only) become the player's texts here.
function withOldModeTexts(raw, old) {
  const out = raw && typeof raw === "object" ? JSON.parse(JSON.stringify(raw)) : {};
  if (!old || typeof old !== "object") return out;
  for (const [key, built] of Object.entries(MODE_TEXTS.ru)) {
    const text = typeof old[key] === "string" ? old[key].trim() : "";
    if (!text || text === built) continue;
    out.ru = out.ru && typeof out.ru === "object" ? out.ru : {};
    if (!out.ru[`mode:${key}`]) out.ru[`mode:${key}`] = { t: text, b: built };
  }
  return out;
}
// which groups of the Texts tab are unfolded — each device remembers its own
const PROMPT_GROUPS_KEY = "kulisy-dev-groups";
function loadPromptGroups() {
  try {
    const keys = JSON.parse(localStorage.getItem(PROMPT_GROUPS_KEY) || "[]");
    return new Set(Array.isArray(keys) ? keys.filter((k) => PROMPT_GROUPS.some((g) => g.key === k)) : []);
  } catch {
    return new Set();
  }
}
function savePromptGroups() {
  try {
    localStorage.setItem(PROMPT_GROUPS_KEY, JSON.stringify([...prompts.groups]));
  } catch {
    // a private window: the groups simply fold again next time
  }
}
const prompts = {
  own: sanitizePrompts(withOldModeTexts(saved.prompts, saved.modeTexts)),
  groups: loadPromptGroups(),
  pending: null, // an uploaded set waiting for "Upload": { own, n, skipped }
  setNote: "",
  open: null, // the id being edited
  draft: "",
  error: "",
};
function promptOwnItem(item, code) {
  return prompts.own[code]?.[promptId(item)] || null;
}
function promptOwn(src, key, code) {
  const own = prompts.own[code]?.[`${src}:${key}`];
  return own ? own.t : undefined;
}
// Does a guide come from one of these texts as the player rewrote them? (Built-in texts are known by fixed marks.)
// Any slot-free stretch of 12+ characters of the player's text counts; spaces are compared collapsed.
function guideFromOwn(guide, ids) {
  if (!guide) return false;
  const flat = guide.replace(/\s+/g, " ");
  for (const code of LANGS) {
    for (const id of ids) {
      const own = prompts.own[code]?.[id];
      if (!own) continue;
      const parts = own.t.split(/\{\{[^{}]*\}\}|\{[^{}]*\}/).map((part) => part.replace(/\s+/g, " ").trim());
      if (parts.some((part) => part.length >= 12 && flat.includes(part))) return true;
    }
  }
  return false;
}
function ft(key, vars, code = lang) {
  let text = promptOwn("fate", key, code) ?? FATE_TEXT[code][key] ?? FATE_TEXT.en[key] ?? key;
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(value));
  return text;
}

const fate = {
  surprise: saved.fateSurprise === true, // secret rolls: no flash, no line under the message (Offstage's storage)
  noDie: saved.fateNoDie === true, // no die by Marinara's send button (Offstage's storage)
  log: [], // [{ id, at, f, extra }] — this chat's rolls, newest first
  logSeq: 0,
  logTimer: null,
  pending: null, // { chatId, d, r, o, s, lang, at, msgDone } — my roll, not yet handed to a generation
  marks: [], // [{ chatId, rec, at }] — a character's roll, waiting for their reply to be written on
  who: "me", // "me" | characterId — picked in the open menu
  plan: null, // { chatId, who, d } — an attempt picked in the move menu, rolled only when the turn is sent
  step: false, // the move menu shows the attempt's "who / how hard"
  die: null, // the move button (🎭) before Marinara's send button
  chips: null, // the turn's chips above Marinara's box
  pop: null,
  flash: null,
  flashTimer: null,
};
// 0.9.21 (Leah 19.10, the new interface, piece 5): the whisper from the move menu — who hears is the chat's checked
// hearers (state.hearers, shared with the panel); the whisper itself is written in Marinara's box.
const whisper = {
  plan: null, // { chatId, all } — armed: the next message sent in this chat is the whisper; all — "what everyone sees"
  step: false, // the move menu shows the whisper's "who hears"
  all: "", // "what everyone sees" being typed in the menu
};

function d20() {
  const box = new Uint32Array(1);
  crypto.getRandomValues(box);
  return 1 + Math.floor((box[0] / 4294967296) * 20);
}
function fateOutcome(d, r) {
  const edge = FATE_EDGES[d];
  return r <= edge.fail ? "fail" : r <= edge.cost ? "cost" : "success";
}
function fateRecord(p) {
  const rec = { d: p.d, r: p.r, o: p.o };
  if (p.s) rec.s = 1; // secret ("Surprise"); 2 once revealed in the log
  if (p.who) rec.who = p.who;
  if (p.a) rec.a = p.a.slice(0, 300);
  return rec;
}
function fateGuide(p) {
  return ft("guide", { o: ft(`g_${p.o}`, null, p.lang) }, p.lang);
}
function fateLine(f) {
  const vars = { d: ft(f.d).toLowerCase(), r: f.r, o: ft(f.o) };
  const name = f.who ? state.names[f.who] && shortName(f.who) : "";
  return name ? ft("note_char", { ...vars, name }) : ft("note", vars);
}
function fateBadge(extra) {
  const kulisy = extra && extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : null;
  const f = kulisy && kulisy.fate;
  // a secret roll never shows under the message, revealed or not — it opens only in the card's log (Leah, 18.10)
  if (!f || !FATE_EDGES[f.d] || !FATE_OUTCOMES.includes(f.o) || f.s) return null;
  return fateLine(f);
}

function sendButton() {
  return document.querySelector(".mari-chat-input .mari-chat-send-btn");
}
// Marinara's send button turns into "stop" while a reply streams and into a spinner while busy.
function sendBusy(send) {
  return send.disabled || sendStreaming(send);
}
// Only "a reply is under way": with an empty box Marinara may also disable the button (Manual order, 0.9.6 on Leah's chats).
function sendStreaming(send) {
  return !!send.querySelector('svg[class*="stop"], .animate-spin');
}

// 0.9.17 (Leah 19.10, the new interface, piece 1): the die became the move button 🎭 — everything that goes with this
// turn (an attempt, an event card, truth or lie) is picked in its menu and shows as a chip above Marinara's box; the
// chip's × takes it back. An attempt is rolled only when the turn is sent: "me" — when Marinara's request goes out
// (planTurn), a character — by catching the send and rewriting the box into "/guided …" first (firePlan).
function ensureDie() {
  placeDie();
  panel.classList.toggle("has-move", !!(fate.die && fate.die.isConnected));
  if (fateReady) renderTry();
}
function placeDie() {
  ensureChips();
  const send = sendButton();
  if (!send || !state.chatId || fate.noDie) {
    if (fate.die && fate.die.isConnected) fate.die.remove();
    closeFatePop();
    return;
  }
  if (!fate.die) {
    fate.die = document.createElement("button");
    fate.die.type = "button";
    fate.die.className = "kulisy-die kulisy-move";
    fate.die.dataset.offstageNative = "";
    fate.die.textContent = "🎭";
    fate.die.setAttribute("aria-haspopup", "menu");
    fate.die.addEventListener("click", toggleFatePop);
    paintDie();
  }
  if (fate.die.isConnected && fate.die.nextElementSibling === send) return;
  send.parentElement.insertBefore(fate.die, send);
}

function armedHere() {
  return fate.pending && fate.pending.chatId === state.chatId ? fate.pending : null;
}

function planHere() {
  return fate.plan && fate.plan.chatId === state.chatId ? fate.plan : null;
}
// The deck's own secret hand ("draws by itself") never shows.
function eventHere() {
  const hand = deckArmedHere();
  return hand && !hand.a ? hand : null;
}
function planWords(plan) {
  return `${plan.who === "me" ? ft("me") : shortName(plan.who)} · ${ft(plan.d).toLowerCase()}`;
}
// the user's roll waiting for the reply (Manual order: until a character is picked); a secret one keeps its outcome
function rolledWords(p) {
  return `${ft("me")} · ${ft(p.d).toLowerCase()} — ${p.s ? ft("move_waits") : ft(p.o)}`;
}

function paintDie() {
  if (!fateReady) return; // the deck and the truth roll are defined further down
  if (fate.die) {
    fate.die.classList.toggle("is-armed", !!(planHere() || armedHere() || whisperHere() || eventHere() || truthArmedHere()));
    fate.die.title = ft("move");
    fate.die.setAttribute("aria-label", ft("move"));
    fate.die.setAttribute("aria-expanded", fate.pop ? "true" : "false");
  }
  paintChips();
  renderTry();
}

// 0.9.25 (Leah 20.10): the attempt in the Fate tab, for players who hide the move button — the menu's step, the same
// plan and chip; only in Roleplay (Conversation has no box the attempt rewrites).
// It runs from ensureDie, which a page observer calls on every DOM change: it redraws only when what it shows changed
// (a redraw is a DOM change too).
let tryShown = "";
function renderTry() {
  const show = !panel.classList.contains("has-move") && !!state.chatId && !!fateBox();
  const p = armedHere();
  const key = JSON.stringify([show, lang, p && [p.d, p.o, p.s], planHere(), fate.who, show && fateCast().map((id) => state.names[id])]);
  if (key === tryShown) return;
  tryShown = key;
  fel.tryBox.hidden = !show;
  if (!show) return;
  const nodes = [];
  if (p) {
    // the roll is already in this chat (Manual order: on the message) — only cancel
    const armed = document.createElement("div");
    armed.className = "kulisy-fate-armed";
    const text = document.createElement("span");
    text.textContent = armedLabel(p);
    const off = document.createElement("button");
    off.type = "button";
    off.className = "kulisy-clear";
    off.textContent = ft("cancel");
    off.addEventListener("click", () => {
      fate.pending = null;
      paintDie();
    });
    armed.append(text, off);
    fel.tryBody.replaceChildren(armed);
    return;
  }
  const plan = planHere();
  const cast = fateCast();
  if (plan) fate.who = plan.who;
  if (fate.who !== "me" && !cast.includes(fate.who)) fate.who = "me";
  if (cast.length) {
    const label = document.createElement("div");
    label.className = "kulisy-label";
    label.textContent = ft("who");
    const who = document.createElement("div");
    who.className = "kulisy-mode-group kulisy-fate-chips";
    for (const id of ["me", ...cast]) {
      const chip = fateChip(id === "me" ? ft("me") : shortName(id), id === fate.who, () => {
        fate.who = id;
        if (plan) fate.plan = { ...plan, who: id };
        paintDie();
      });
      if (id !== "me") chip.title = state.names[id] || "";
      who.append(chip);
    }
    nodes.push(label, who);
  }
  const label = document.createElement("div");
  label.className = "kulisy-label";
  label.textContent = ft("how");
  const how = document.createElement("div");
  how.className = "kulisy-mode-group kulisy-fate-chips";
  for (const d of FATE_LEVELS) {
    const on = !!(plan && plan.d === d);
    how.append(
      fateChip(ft(d), on, () => {
        if (on) {
          fate.plan = null;
          return paintDie();
        }
        fate.plan = { chatId: state.chatId, who: fate.who, d };
        paintDie();
        // on a phone the sheet covers the send button the hint stands over — the chip above the box says it there
        const box = fateBox();
        if (box && !box.value.trim() && !PHONE.matches) flashHint(fate.who === "me" ? ft("write_me") : ft("write_char", { name: shortName(fate.who) }));
      }),
    );
  }
  nodes.push(label, how);
  fel.tryBody.replaceChildren(...nodes);
}

// The chips go into Marinara's composer right above its input row, where its own attachment chips sit.
function ensureChips() {
  const box = fateBox();
  const shell = box && box.closest(".mari-chat-input");
  if (!box || !shell || !state.chatId) {
    if (fate.chips && fate.chips.isConnected) fate.chips.remove();
    return;
  }
  if (!fate.chips) {
    fate.chips = document.createElement("div");
    fate.chips.className = "kulisy-chips";
    fate.chips.dataset.offstageNative = "";
    paintChips();
  }
  let row = box;
  while (row.parentElement && row.parentElement !== shell) row = row.parentElement;
  if (row.parentElement !== shell) return;
  if (fate.chips.parentElement === shell && fate.chips.nextElementSibling === row) return;
  shell.insertBefore(fate.chips, row);
}

function moveChip(icon, text, title, onOff) {
  const chip = document.createElement("span");
  chip.className = "kulisy-chip";
  if (title) chip.title = title;
  const label = document.createElement("span");
  label.textContent = `${icon} ${text}`;
  const off = document.createElement("button");
  off.type = "button";
  off.className = "kulisy-chip-off";
  off.textContent = "×";
  off.setAttribute("aria-label", `${ft("chip_off")}: ${text}`);
  off.addEventListener("click", (event) => {
    event.preventDefault();
    onOff();
    paintDie();
  });
  chip.append(label, off);
  return chip;
}

function paintChips() {
  if (!fate.chips) return;
  const chips = [];
  const plan = planHere();
  if (plan) {
    chips.push(
      moveChip("🎲", planWords(plan), "", () => {
        fate.plan = null;
      }),
    );
  }
  const p = armedHere();
  if (p) {
    chips.push(
      moveChip("🎲", rolledWords(p), "", () => {
        fate.pending = null;
      }),
    );
  }
  const w = whisperHere();
  if (w) {
    chips.push(
      moveChip("🤫", whisperWords(), w.all ? ft("chip_whisper_all", { all: w.all }) : "", () => {
        whisper.plan = null;
        dropHint();
      }),
    );
  }
  const hand = eventHere();
  if (hand) {
    const tone = deckHere() && deck.data.tone !== "any" ? ft(`tone_${deck.data.tone}`).toLowerCase() : "";
    const text = hand.s ? ft("chip_event_secret") : tone ? ft("chip_event_tone", { tone }) : ft("chip_event");
    chips.push(
      moveChip("🃏", text, hand.s ? "" : hand.cards.map((c) => c.t).join(" · "), () => {
        deck.pending = null;
        setDeckHint("");
        renderDeck();
      }),
    );
  }
  if (truthArmedHere()) {
    chips.push(
      moveChip("⚖️", ft("chip_truth"), "", () => {
        truth.pending = null;
        setTruthHint("");
        renderTruth();
      }),
    );
  }
  fate.chips.replaceChildren(...chips);
  fate.chips.hidden = !chips.length;
}

function armedLabel(p) {
  return p.s ? ft("armed_secret") : ft("armed", { d: ft(p.d), o: ft(p.o) });
}

function closeFatePop() {
  if (!fate.pop) return;
  fate.pop.remove();
  fate.pop = null;
  paintDie();
}

// Above the die — or above Marinara's send button while the die is hidden.
function fateAnchor() {
  return fate.die && fate.die.isConnected ? fate.die : sendButton();
}
// Above the whole input row: a box grown to several lines stands taller than the button; and above the turn's chips.
function placeAboveDie(node) {
  const rect = fateAnchor().getBoundingClientRect();
  const box = fateBox();
  const shell = box && box.closest(".mari-chat-input");
  let row = box;
  while (row && row.parentElement && row.parentElement !== shell) row = row.parentElement;
  let top = row && shell && row.contains(fateAnchor()) ? Math.min(rect.top, row.getBoundingClientRect().top) : rect.top;
  if (fate.chips && !fate.chips.hidden && fate.chips.isConnected && shell && shell.contains(fate.chips)) {
    top = Math.min(top, fate.chips.getBoundingClientRect().top);
  }
  node.style.right = `${Math.max(8, Math.round(window.innerWidth - rect.right))}px`;
  node.style.bottom = `${Math.round(window.innerHeight - top + 8)}px`;
  if (node === fate.pop) {
    const screenTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
    node.style.maxHeight = `${Math.max(160, Math.round(top - 8 - screenTop - 8))}px`;
  }
}

function fateItem(text, onClick) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "kulisy-fate-pick";
  item.setAttribute("role", "menuitem");
  item.textContent = text;
  item.addEventListener("click", onClick);
  return item;
}

function toggleFatePop() {
  if (fate.pop) return closeFatePop();
  if (!fate.die || !state.chatId) return;
  showFlash("", ""); // a hint from before would stand under the menu
  const pop = document.createElement("div");
  // Marinara's own popup classes: a theme that dresses Marinara's input popups dresses this one too
  pop.className = "kulisy-fate-pop kulisy-move-pop mari-chat-style-surface mari-chat-input-popup";
  pop.dataset.offstageNative = "";
  pop.setAttribute("role", "menu");
  const plan = planHere();
  fate.step = !!(plan || armedHere());
  fate.who = plan && (plan.who === "me" || fateCast().includes(plan.who)) ? plan.who : "me";
  const w = whisperHere();
  whisper.step = !fate.step && !!w;
  if (w) whisper.all = w.all;
  document.body.append(pop);
  fate.pop = pop;
  renderMovePop();
  paintDie();
}

function moveItem(icon, title, sub, on, onClick) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "kulisy-move-item";
  item.setAttribute("role", "menuitem");
  if (on) item.dataset.state = "on";
  const mark = document.createElement("span");
  mark.className = "kulisy-move-icon";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = icon;
  const text = document.createElement("span");
  text.className = "kulisy-move-text";
  const name = document.createElement("b");
  name.textContent = title;
  const more = document.createElement("span");
  more.textContent = sub;
  text.append(name, more);
  item.append(mark, text);
  item.addEventListener("click", onClick);
  return item;
}

function movePill(text, on, onClick) {
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "kulisy-fate-who";
  pill.textContent = text;
  pill.setAttribute("aria-pressed", on ? "true" : "false");
  pill.addEventListener("click", onClick);
  return pill;
}

function moveLabel(key) {
  const head = document.createElement("div");
  head.className = "kulisy-move-label";
  head.textContent = ft(key);
  return head;
}

function renderMovePop() {
  const pop = fate.pop;
  if (!pop) return;
  const plan = planHere();
  const p = armedHere();
  const nodes = [];
  nodes.push(
    moveItem("🎲", ft("move_try"), p ? armedLabel(p) : plan ? planWords(plan) : ft("move_try_sub"), !!(plan || p), () => {
      fate.step = !fate.step;
      if (fate.step) whisper.step = false;
      renderMovePop();
    }),
  );
  if (fate.step) {
    const step = document.createElement("div");
    step.className = "kulisy-move-step";
    if (p) {
      // the roll is already in this chat (Manual order: on the message) — no second roll, only cancel
      step.append(
        fateItem(ft("cancel"), () => {
          fate.pending = null;
          closeFatePop();
          paintDie();
        }),
      );
    } else {
      const cast = fateCast();
      if (cast.length) {
        step.append(moveLabel("who"));
        const who = document.createElement("div");
        who.className = "kulisy-move-pills";
        for (const id of ["me", ...cast]) {
          const pill = movePill(id === "me" ? ft("me") : shortName(id), id === fate.who, () => {
            fate.who = id;
            renderMovePop();
          });
          if (id !== "me") pill.title = state.names[id] || "";
          who.append(pill);
        }
        step.append(who);
      }
      step.append(moveLabel("how"));
      const how = document.createElement("div");
      how.className = "kulisy-move-pills";
      for (const d of FATE_LEVELS) {
        how.append(movePill(ft(d), !!(plan && plan.d === d && plan.who === fate.who), () => pickFate(d)));
      }
      step.append(how);
    }
    nodes.push(step);
  }
  const w = whisperHere();
  nodes.push(
    moveItem("🤫", ft("move_whisper"), w ? whisperWords() : ft("move_whisper_sub"), !!w, () => {
      const why = whisperBlocked();
      if (why) return showFateHint(why);
      whisper.step = !whisper.step;
      if (whisper.step) fate.step = false;
      renderMovePop();
    }),
  );
  if (whisper.step) nodes.push(whisperStep());
  const hand = eventHere();
  const tone = deckHere() && deck.data.tone !== "any" ? ft(`tone_${deck.data.tone}`).toLowerCase() : "";
  nodes.push(
    moveItem(
      "🃏",
      ft("move_event"),
      hand ? ft("move_waits") : tone ? ft("move_event_tone", { tone }) : ft("move_event_sub"),
      !!hand,
      () => {
        if (hand) return showFateHint(ft("deck_already"));
        const error = drawDeckNow();
        if (error) return showFateHint(error);
        closeFatePop();
      },
    ),
  );
  const asked = truthArmedHere();
  nodes.push(
    moveItem("⚖️", ft("move_truth"), asked ? ft("move_waits") : ft("move_truth_sub"), !!asked, () => {
      if (asked) return showFateHint(ft("truth_already"));
      rollTruth();
      closeFatePop();
    }),
  );
  const hint = document.createElement("div");
  hint.className = "kulisy-fate-hint";
  hint.hidden = true;
  nodes.push(hint);
  pop.replaceChildren(...nodes);
  placeAboveDie(pop);
}

// ---- the whisper (0.9.21): who hears is picked in the menu, the words go into Marinara's own box ----
function whisperHere() {
  return whisper.plan && whisper.plan.chatId === state.chatId ? whisper.plan : null;
}
// the checked hearers who are here (those away hear nothing)
function whisperHearers() {
  const heard = new Set(state.hearers[state.chatId] || []);
  return fateCast().filter((id) => heard.has(id));
}
function whisperWords() {
  const names = whisperHearers().map(shortName);
  return names.length ? ft("chip_whisper", { names: names.join(", ") }) : ft("whisper_pick");
}
// the same limits as the panel's whisper: someone not to hear it, and the engine hiding per character
function whisperBlocked() {
  const chat = state.chat;
  if (!chat || chat.characterIds.length < 2) return t("note_one");
  if (chat.groupChatMode !== "individual") return t("note_individual");
  return "";
}
function whisperStep() {
  const step = document.createElement("div");
  step.className = "kulisy-move-step";
  const cast = fateCast();
  step.append(moveLabel("whisper_hear"));
  if (cast.length) {
    const heard = new Set(whisperHearers());
    const who = document.createElement("div");
    who.className = "kulisy-move-pills";
    for (const id of cast) {
      const pill = movePill(shortName(id), heard.has(id), () => {
        void toggleHearer(id, !heard.has(id));
        renderWho();
        renderMovePop();
        paintDie();
      });
      pill.title = state.names[id] || "";
      who.append(pill);
    }
    step.append(who);
  } else {
    const none = document.createElement("div");
    none.className = "kulisy-move-label";
    none.textContent = ft("whisper_none");
    step.append(none);
  }
  step.append(moveLabel("whisper_all"));
  const all = document.createElement("input");
  all.type = "text";
  all.className = "kulisy-move-input";
  all.maxLength = 500;
  all.placeholder = ft("whisper_all_ph");
  all.value = whisper.all;
  all.addEventListener("input", () => {
    whisper.all = all.value;
    const w = whisperHere();
    if (w) {
      w.all = all.value.trim();
      paintDie();
    }
  });
  all.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    armWhisper();
  });
  step.append(all);
  const acts = document.createElement("div");
  acts.className = "kulisy-move-acts";
  const go = fateItem(whisperHere() ? ft("whisper_done") : ft("whisper_go"), armWhisper);
  go.classList.add("kulisy-move-go");
  acts.append(go);
  if (whisperHere()) {
    acts.append(
      fateItem(ft("whisper_off"), () => {
        whisper.plan = null;
        whisper.all = "";
        whisper.step = false;
        dropHint();
        closeFatePop();
      }),
    );
  }
  step.append(acts);
  return step;
}
function armWhisper() {
  if (!state.chatId) return closeFatePop();
  if (!whisperHearers().length) return showFateHint(ft(fateCast().length ? "whisper_pick" : "whisper_none"));
  whisper.plan = { chatId: state.chatId, all: whisper.all.trim() };
  whisper.step = false;
  closeFatePop();
  const box = fateBox();
  if (!box) return;
  if (!box.value.trim()) flashHint(ft("write_whisper"));
  box.focus();
}
// An armed whisper is never sent empty (an empty send would only call the next reply) or to no one.
function whisperStop(event) {
  const box = fateBox();
  if (!whisperHere() || !box) return;
  const text = box.value.trim();
  if (text.startsWith("/")) return; // a command of the user's own — Marinara's business
  const why = !text ? ft("write_whisper") : !whisperHearers().length ? ft("whisper_pick") : "";
  if (!why) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  flashHint(why);
}

function showFateHint(text) {
  const hint = fate.pop && fate.pop.querySelector(".kulisy-fate-hint");
  if (!hint) return;
  hint.textContent = text;
  hint.hidden = false;
}

function flashFate(p) {
  showFlash(p.s ? "" : fateLine(p), `is-${p.o}`);
}
// A short word above the move button (the roll's outcome, or what to do next) — gone in 5 s.
function flashHint(text) {
  showFlash(text, "is-hint");
}
function showFlash(text, kind) {
  if (fate.flash) fate.flash.remove();
  if (fate.flashTimer !== null) marinara.clearTimeout(fate.flashTimer);
  fate.flash = null;
  fate.flashTimer = null;
  if (!text || !fateAnchor()) return;
  const flash = document.createElement("div");
  flash.className = `kulisy-fate-flash ${kind}`;
  flash.dataset.offstageNative = "";
  flash.textContent = text;
  document.body.append(flash);
  placeAboveDie(flash);
  fate.flash = flash;
  fate.flashTimer = marinara.setTimeout(() => {
    fate.flashTimer = null;
    flash.remove();
    if (fate.flash === flash) fate.flash = null;
  }, 5000);
}

// Characters who can attempt: this chat's cards, except those sent away in "Who's here".
function fateCast() {
  if (!state.chat || !Array.isArray(state.chat.characterIds)) return [];
  const away = awayIds();
  return state.chat.characterIds.filter((id) => state.names[id] && !away.includes(id));
}

// Put text into Marinara's box the way typing does (its send reads the box itself).
function setBoxValue(textarea, value) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function fateBox() {
  return document.querySelector(".mari-chat-input .mari-chat-input-textarea");
}

// A difficulty in the move menu only sets the attempt's chip; the die is rolled when the turn is sent.
function pickFate(d) {
  if (!state.chatId) return closeFatePop();
  const who = fate.who !== "me" && fateCast().includes(fate.who) ? fate.who : "me";
  fate.plan = { chatId: state.chatId, who, d };
  closeFatePop();
  const box = fateBox();
  if (!box) return;
  if (!box.value.trim()) flashHint(who === "me" ? ft("write_me") : ft("write_char", { name: shortName(who) }));
  box.focus();
}

// The user's own attempt: rolled the moment Marinara sends the turn (a new message — not a regenerate, continue,
// impersonate, an empty send or the panel's whisper). From here it goes the die's old way (fate.pending).
function planTurn(input, init) {
  const plan = fate.plan;
  if (!plan || plan.who !== "me" || fate.pending) return;
  const path = requestPath(input);
  const body = JSON.parse(init.body);
  if (path === "/api/generate") {
    if (body.chatId !== plan.chatId || body.regenerateMessageId || body.continueMessageId || body.impersonate) return;
    if (typeof body.userMessage !== "string" || !body.userMessage.trim()) return;
  } else if (path === `/api/chats/${plan.chatId}/messages`) {
    const extra = body.extra && typeof body.extra === "object" ? body.extra : {};
    if (body.role !== "user" || extra.kulisy) return;
  } else {
    return;
  }
  fate.plan = null;
  const r = d20();
  const o = fateOutcome(plan.d, r);
  fate.pending = { chatId: plan.chatId, d: plan.d, r, o, s: fate.surprise ? 1 : 0, lang, at: Date.now(), msgDone: false };
  flashFate(fate.pending);
  paintDie();
}

// A character's attempt: Marinara's box must become "/guided respond for …" before Marinara reads it, so the send
// (its button, or Enter when Enter sends) is caught first. Our own click on the button goes through (sendPass).
let sendPass = false;
function clickSend(send) {
  sendPass = true;
  try {
    send.click();
  } finally {
    sendPass = false;
  }
}
function characterPlanHere() {
  const plan = planHere();
  return plan && plan.who !== "me" ? plan : null;
}
function firePlan(event) {
  const plan = characterPlanHere();
  const send = sendButton();
  const box = fateBox();
  if (!plan || !send || !box) return;
  const text = box.value.trim();
  if (text.startsWith("/")) return; // a command of the user's own — Marinara's business
  event.preventDefault();
  event.stopImmediatePropagation();
  const name = state.names[plan.who] ? shortName(plan.who) : "?";
  if (!text) return flashHint(ft("write_char", { name }));
  if (!fateCast().includes(plan.who)) return flashHint(ft("char_gone", { name }));
  if (sendStreaming(send)) return flashHint(ft("busy"));
  fate.plan = null;
  paintDie();
  rollAttempt(plan.who, plan.d, send, box);
}
function onSendClick(event) {
  if (sendPass || (!characterPlanHere() && !whisperHere())) return;
  const send = sendButton();
  if (!send || !(event.target instanceof Node) || !send.contains(event.target)) return;
  if (characterPlanHere()) firePlan(event);
  else if (!sendStreaming(send)) whisperStop(event); // while a reply streams the button is Marinara's Stop
}
// Marinara's "Enter to send" for roleplay (off by default) lives in its persisted UI store.
function enterSends() {
  try {
    const ui = JSON.parse(localStorage.getItem("marinara-engine-ui") || "null");
    return !!(ui && ui.state && ui.state.enterToSendRP === true);
  } catch {
    return false;
  }
}
function onSendKey(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing || (!characterPlanHere() && !whisperHere())) return;
  if (event.target !== fateBox() || !enterSends()) return;
  if (characterPlanHere()) firePlan(event);
  else whisperStop(event);
}

// The roll itself — from the die's menu or from the card: the attempt's words are already in Marinara's box.
function rollAttempt(who, d, send, textarea) {
  const r = d20();
  const o = fateOutcome(d, r);
  const s = fate.surprise ? 1 : 0;
  if (who === "me") {
    fate.pending = { chatId: state.chatId, d, r, o, s, lang, at: Date.now(), msgDone: false };
    flashFate(fate.pending);
    paintDie();
    clickSend(send);
    return;
  }
  // A character's attempt: Marinara's own "/guided respond for <name>: <direction>" — no message from the user.
  const name = state.names[who];
  const a = textarea.value.trim().replace(/\s+/g, " ");
  const p = { chatId: state.chatId, who, a, d, r, o, s, at: Date.now() };
  const direction = ft("guide_char", { name, a: a.replace(/[.!?…]+$/, ""), o: ft(`g_${o}`) }).replace(/\s+/g, " ");
  fate.marks.push({ chatId: p.chatId, who, rec: fateRecord(p), at: p.at });
  setBoxValue(textarea, `/guided respond for ${name}: ${direction}`);
  flashFate(p);
  clickSend(send);
}

function msTime(value) {
  return typeof value === "number" ? value : Date.parse(value);
}

// A character's roll goes on their reply once Marinara says the generation is done.
async function markFateReplies(chatId) {
  const due = fate.marks.filter((m) => m.chatId === chatId);
  if (!due.length) return;
  fate.marks = fate.marks.filter((m) => m.chatId !== chatId);
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=12"));
    const list = (Array.isArray(messages) ? messages : []).slice().reverse();
    for (const mark of due) {
      const found = list.find((m) => m.role === "assistant" && m.characterId === mark.who && msTime(m.createdAt) >= mark.at - 2000);
      if (!found) continue;
      const extra = parseMaybeJson(found.extra, {}) || {};
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      if (kulisy.fate) continue;
      const next = { ...kulisy, fate: mark.rec };
      await api(chatPath(chatId, `/messages/${encodeURIComponent(found.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({ kulisy: next }),
      });
      patchCachedExtra(chatId, found.id, { ...extra, kulisy: next });
    }
    scheduleBadges();
    scheduleFateLog();
  } catch (error) {
    marinara.log.warn("Could not mark the roll on the reply", error);
  }
}
// A regenerate is a new swipe of the reply, and every swipe keeps its own extra: the character's roll stays on the swipe
// it was written to. Marinara replays the same guide, so the outcome is the same — the roll is carried to the swipe now
// shown (only from a swipe with the very same guide). 0.9.6: Leah's regenerated rolls fell out of the log and the marker.
// Only a character's attempt ("guide_char"): the user's own roll lives on the user's message, which a regenerate keeps.
// The deck's draw (0.9.7) is carried the same way — the guide holds the drawn cards.
const FATE_GUIDE_MARKS = [["Попытка (", "броском кубика"], ["Attempt (", "by a die roll"]];
const SWIPE_CARRY = [
  { key: "fate", marks: FATE_GUIDE_MARKS, own: ["fate:guide_char"] },
  { key: "deck", marks: [["Колода событий:"], ["Event deck:"]], own: ["fate:deck_guide_many", "fate:deck_guide_one"] },
  { key: "truth", marks: [["Правда или ложь:"], ["Truth or lie:"]], own: ["fate:truth_guide_truth", "fate:truth_guide_lie"] },
];
function replayGuide(extra) {
  const guide = extra && extra.generationReplay && extra.generationReplay.generationGuide;
  return typeof guide === "string" ? guide : null;
}
function guideHas(guide, marks) {
  return !!guide && marks.some((set) => set.every((mark) => guide.includes(mark)));
}
async function healFateSwipes(chatId, messages) {
  let healed = 0;
  for (const m of Array.isArray(messages) ? messages : []) {
    if (m.role !== "assistant") continue;
    const extra = parseMaybeJson(m.extra, {}) || {};
    const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
    const guide = replayGuide(extra);
    const want = SWIPE_CARRY.filter((c) => !kulisy[c.key] && (guideHas(guide, c.marks) || guideFromOwn(guide, c.own)));
    if (!want.length) continue;
    try {
      const swipes = await api(chatPath(chatId, `/messages/${encodeURIComponent(m.id)}/swipes`));
      const others = (Array.isArray(swipes) ? swipes : []).map((swipe) => parseMaybeJson(swipe.extra, {}) || {});
      const next = { ...kulisy };
      for (const c of want) {
        const source = others.find(
          (e) => e.kulisy && typeof e.kulisy === "object" && e.kulisy[c.key] && replayGuide(e) === guide,
        );
        if (source) next[c.key] = source.kulisy[c.key];
      }
      if (!want.some((c) => next[c.key])) continue;
      await api(chatPath(chatId, `/messages/${encodeURIComponent(m.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({ kulisy: next }),
      });
      m.extra = { ...extra, kulisy: next };
      patchCachedExtra(chatId, m.id, m.extra);
      healed += 1;
    } catch (error) {
      marinara.log.warn("Could not carry the roll to the new swipe", error);
    }
  }
  if (healed) scheduleBadges();
  return healed;
}
async function afterGeneration(chatId) {
  await markFateReplies(chatId);
  await markDeckReplies(chatId);
  await markTruthReplies(chatId);
  try {
    if (await healFateSwipes(chatId, await api(chatPath(chatId, "/messages?limit=6")))) scheduleFateLog();
  } catch (error) {
    marinara.log.warn("Could not check the reply for a roll", error);
  }
}
function onGenerationComplete(event) {
  const chatId = event && event.detail && event.detail.chatId;
  if (chatId) void afterGeneration(chatId);
  if (chatId === state.chatId) scheduleFateLog();
}
function onGenerationError(event) {
  const chatId = event && event.detail && event.detail.chatId;
  if (chatId) fate.marks = fate.marks.filter((m) => m.chatId !== chatId);
  // the reply failed: the drawn cards wait for the next one
  if (chatId) for (const m of deck.marks.filter((mark) => mark.chatId === chatId)) restoreDeck(m.p);
  if (chatId) for (const m of truth.marks.filter((mark) => mark.chatId === chatId)) restoreTruth(m.p);
}

function onFateOutside(event) {
  if (!fate.pop) return;
  const target = event.target;
  if (target instanceof Node && (fate.pop.contains(target) || (fate.die && fate.die.contains(target)))) return;
  closeFatePop();
}
function onFateEscape(event) {
  if (event.key === "Escape" && fate.pop) closeFatePop();
}

// ---- the Deck and Log tabs: the deck, "Truth or lie", the die's options, this chat's roll log ----
// The log is read from the chat's messages (extra.kulisy.fate); a secret roll opens on a tap (s: 2).

const FATE_LOG_MAX = 40;

function paintFateTexts() {
  for (const root of [panel, fel.secretForm]) {
    for (const node of root.querySelectorAll("[data-ft]")) node.textContent = ft(node.dataset.ft);
    for (const node of root.querySelectorAll("[data-ft-ph]")) node.placeholder = ft(node.dataset.ftPh);
    for (const node of root.querySelectorAll("[data-ft-title]")) node.title = ft(node.dataset.ftTitle);
  }
  renderFatePages();
}

// ---- the Texts tab (developer mode): one card per group, a row per text; a tap opens it for editing ----
function renderPrompts() {
  if (!fateReady) return;
  fel.devIntro.textContent = ft("dev_intro", { lang: ft(`dev_lang_${lang}`) });
  const cards = [];
  for (const group of PROMPT_GROUPS) {
    const card = document.createElement("section");
    card.className = "kulisy-card kulisy-dev-group";
    // folded by default (Leah 20.10: the list grew too long); a group with a text being edited stays open
    const isOpen = prompts.groups.has(group.key) || group.items.some((item) => promptId(item) === prompts.open);
    const head = document.createElement("button");
    head.type = "button";
    head.className = "kulisy-card-head kulisy-dev-head";
    head.setAttribute("aria-expanded", String(isOpen));
    const words = document.createElement("span");
    words.className = "kulisy-dev-head-words";
    const title = document.createElement("span");
    title.className = "kulisy-card-title";
    title.textContent = ft(group.title);
    words.append(title);
    const changed = group.items.filter((item) => promptOwnItem(item, lang)).length;
    if (changed) {
      const sub = document.createElement("span");
      sub.className = "kulisy-card-sub";
      sub.textContent = ft("dev_changed", { n: changed });
      words.append(sub);
    }
    head.append(words);
    head.addEventListener("click", () => {
      if (isOpen) {
        prompts.groups.delete(group.key);
        if (group.items.some((item) => promptId(item) === prompts.open)) prompts.open = null;
      } else prompts.groups.add(group.key);
      savePromptGroups();
      renderPrompts();
    });
    card.append(head);
    cards.push(card);
    if (!isOpen) continue;
    const body = document.createElement("div");
    body.className = "kulisy-card-body kulisy-dev-list";
    if (group.hint) {
      const hint = document.createElement("div");
      hint.className = "kulisy-hint kulisy-dev-group-hint";
      hint.textContent = ft(group.hint);
      body.append(hint);
    }
    for (const item of group.items) {
      const id = promptId(item);
      const open = prompts.open === id;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "kulisy-dev-row";
      row.setAttribute("aria-expanded", String(open));
      const name = document.createElement("span");
      name.className = "kulisy-dev-name";
      name.textContent = ft(item.name);
      row.append(name);
      if (promptOwnItem(item, lang)) {
        const dot = document.createElement("span");
        dot.className = "kulisy-dev-dot";
        row.append(dot);
      }
      row.addEventListener("click", () => {
        if (prompts.open === id) prompts.open = null;
        else {
          prompts.open = id;
          const own = promptOwnItem(item, lang);
          prompts.draft = own ? own.t : promptBuiltIn(item, lang);
        }
        prompts.error = "";
        renderPrompts();
      });
      body.append(row);
      if (open) body.append(promptForm(item));
    }
    card.append(body);
  }
  cards.push(promptSetCard());
  fel.devGroups.replaceChildren(...cards);
}

// ---- the text set: all the player's texts as one file (0.9.32, Leah 20.10) ----
// The file: { offstage: "texts", version, texts: { ru|en: { "<src>:<key>": { t, b } } } }. Uploading replaces every
// own text with the file's (after sanitizePrompts); nothing is written before the player confirms.
function promptCount(own) {
  return LANGS.reduce((n, code) => n + Object.keys(own[code] || {}).length, 0);
}
function promptButton(text, cls, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = cls;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}
function promptSetCard() {
  const card = document.createElement("section");
  card.className = "kulisy-card kulisy-dev-set";
  const head = document.createElement("div");
  head.className = "kulisy-card-head";
  const title = document.createElement("div");
  title.className = "kulisy-card-title";
  title.textContent = ft("dev_set");
  head.append(title);
  const body = document.createElement("div");
  body.className = "kulisy-card-body";
  const hint = document.createElement("div");
  hint.className = "kulisy-hint";
  hint.textContent = ft("dev_set_hint");
  body.append(hint);
  const pending = prompts.pending;
  if (pending) {
    const ask = document.createElement("div");
    ask.className = "kulisy-hint kulisy-dev-set-ask";
    const mine = promptCount(prompts.own);
    ask.textContent = [
      ft("dev_set_ask", { n: pending.n }),
      mine ? ft("dev_set_replace", { m: mine }) : "",
      pending.skipped ? ft("dev_set_skipped", { n: pending.skipped }) : "",
    ]
      .filter(Boolean)
      .join(" ");
    const actions = document.createElement("div");
    actions.className = "kulisy-deck-actions";
    actions.append(
      promptButton(ft("dev_set_load"), "kulisy-send kulisy-dev-set-apply", () => void applyPromptSet()),
      promptButton(ft("dev_cancel"), "kulisy-clear", () => {
        prompts.pending = null;
        renderPrompts();
      }),
    );
    body.append(ask, actions);
  } else {
    const actions = document.createElement("div");
    actions.className = "kulisy-deck-actions";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = ".json,application/json";
    file.hidden = true;
    file.addEventListener("change", () => {
      const picked = file.files && file.files[0];
      if (picked) void readPromptSet(picked);
    });
    actions.append(
      promptButton(ft("dev_set_save"), "kulisy-send kulisy-dev-set-save", downloadPromptSet),
      promptButton(ft("dev_set_load"), "kulisy-clear kulisy-dev-set-load", () => file.click()),
      file,
    );
    body.append(actions);
  }
  if (prompts.setNote) {
    const note = document.createElement("div");
    note.className = "kulisy-hint kulisy-dev-set-note";
    note.textContent = prompts.setNote;
    body.append(note);
  }
  card.append(head, body);
  return card;
}
function downloadPromptSet() {
  if (!promptCount(prompts.own)) {
    prompts.setNote = ft("dev_set_empty");
    renderPrompts();
    return;
  }
  const file = { offstage: "texts", version: VERSION, texts: prompts.own };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const day = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  link.href = url;
  link.download = `offstage-texts-${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  prompts.setNote = "";
  renderPrompts();
}
async function readPromptSet(picked) {
  prompts.pending = null;
  prompts.setNote = "";
  let raw;
  try {
    raw = JSON.parse(await picked.text());
  } catch {
    raw = null;
  }
  const texts = raw && typeof raw === "object" && raw.offstage === "texts" ? raw.texts : null;
  if (!texts || typeof texts !== "object") {
    prompts.setNote = ft("dev_set_bad");
    renderPrompts();
    return;
  }
  // a text without its built-in one ("b") is taken as written over today's built-in text
  const full = {};
  let total = 0;
  for (const code of LANGS) {
    const src = texts[code] && typeof texts[code] === "object" ? texts[code] : {};
    for (const [id, value] of Object.entries(src)) {
      total += 1;
      const item = PROMPT_ITEMS.get(id);
      const t = typeof value === "string" ? value : value && typeof value.t === "string" ? value.t : "";
      const b = value && typeof value.b === "string" ? value.b : item ? promptBuiltIn(item, code) : "";
      (full[code] ||= {})[id] = { t, b };
    }
  }
  const own = sanitizePrompts(full);
  const n = promptCount(own);
  if (!n) prompts.setNote = ft("dev_set_none");
  else prompts.pending = { own, n, skipped: total - n };
  renderPrompts();
}
async function applyPromptSet() {
  const pending = prompts.pending;
  if (!pending) return;
  try {
    await marinara.storage.patch({ prompts: pending.own, modeTexts: {} });
  } catch (error) {
    marinara.log.warn("Could not upload the text set", error);
    prompts.setNote = ft("dev_set_error");
    renderPrompts();
    return;
  }
  prompts.own = pending.own;
  prompts.pending = null;
  prompts.open = null;
  prompts.error = "";
  prompts.setNote = ft("dev_set_done", { n: pending.n });
  renderPrompts();
  const chatId = state.chatId;
  if (chatId) void earQueue(async () => mode.loaded && reconcileMode(chatId));
}

function promptForm(item) {
  const built = promptBuiltIn(item, lang);
  const own = promptOwnItem(item, lang);
  const form = document.createElement("div");
  form.className = "kulisy-dev-form";
  if (own && own.b !== built) {
    const note = document.createElement("div");
    note.className = "kulisy-hint kulisy-dev-note";
    note.textContent = ft("dev_updated");
    form.append(note);
  }
  const area = document.createElement("textarea");
  area.className = "kulisy-dev-text";
  area.rows = 7;
  area.value = prompts.draft;
  area.addEventListener("input", () => {
    prompts.draft = area.value;
  });
  const vars = promptVars(built);
  const slots = document.createElement("div");
  slots.className = "kulisy-hint kulisy-dev-vars";
  if (vars.length) {
    slots.append(ft("dev_vars"));
    for (const v of vars) {
      const line = document.createElement("div");
      const code = document.createElement("code");
      code.textContent = `{${v}}`;
      const known = FATE_TEXT[lang][`dev_var_${v}`];
      line.append(code, known ? ` — ${known}` : "");
      slots.append(line);
    }
  } else slots.textContent = ft("dev_no_vars");
  form.append(area, slots);
  if (prompts.error) {
    const error = document.createElement("div");
    error.className = "kulisy-hint kulisy-fate-card-hint";
    error.textContent = prompts.error;
    form.append(error);
  }
  const actions = document.createElement("div");
  actions.className = "kulisy-deck-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "kulisy-send";
  save.textContent = ft("dev_save");
  save.addEventListener("click", () => void savePrompt(item));
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "kulisy-clear";
  cancel.textContent = ft("dev_cancel");
  cancel.addEventListener("click", () => {
    prompts.open = null;
    prompts.error = "";
    renderPrompts();
  });
  actions.append(save, cancel);
  form.append(actions);
  if (own || prompts.draft.trim() !== built) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "kulisy-clear kulisy-dev-reset";
    reset.textContent = ft("dev_reset");
    reset.addEventListener("click", () => {
      prompts.draft = built;
      prompts.error = "";
      renderPrompts();
    });
    form.append(reset);
  }
  return form;
}

async function savePrompt(item) {
  const built = promptBuiltIn(item, lang);
  const text = prompts.draft.trim();
  const id = promptId(item);
  const fail = (message) => {
    prompts.error = message;
    renderPrompts();
  };
  if (!text) return fail(ft("dev_empty"));
  const missing = promptMissing(text, built);
  if (missing.length) return fail(ft("dev_missing", { list: missing.map((v) => `{${v}}`).join(", ") }));
  const next = JSON.parse(JSON.stringify(prompts.own));
  next[lang] = next[lang] || {};
  if (text === built) delete next[lang][id];
  else next[lang][id] = { t: text, b: built };
  try {
    await marinara.storage.patch({ prompts: next, modeTexts: {} });
  } catch (error) {
    marinara.log.warn("Could not save the text", error);
    return fail(ft("dev_save_error"));
  }
  prompts.own = sanitizePrompts(next);
  prompts.open = null;
  prompts.error = "";
  renderPrompts();
  // the mode's lorebook entries carry the texts: rewrite this chat's now (other chats when they are opened)
  const chatId = state.chatId;
  if (item.src === "mode" && chatId) void earQueue(async () => mode.loaded && reconcileMode(chatId));
}

function fateChip(text, on, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "kulisy-mode-btn";
  button.textContent = text;
  button.dataset.state = on ? "on" : "";
  button.setAttribute("aria-pressed", String(on));
  button.addEventListener("click", onClick);
  return button;
}

function renderFatePages() {
  fel.surprise.checked = fate.surprise;
  fel.noDie.checked = fate.noDie;
  fel.devOn.checked = devMode;
  renderDeck();
  renderTruth();
  renderSecrets();
  renderFateLog();
  renderPrompts();
}

function fateTime(at) {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return "";
  const locale = lang === "ru" ? "ru-RU" : "en-GB";
  const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })} ${time}`;
}

function renderFateLog() {
  const list = fate.logChat === state.chatId ? fate.log : [];
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "kulisy-hint";
    empty.textContent = fate.logError ? ft("log_error") : fate.logChat === state.chatId ? ft("log_empty") : "";
    fel.log.replaceChildren(empty);
    return;
  }
  fel.log.replaceChildren(
    ...list.slice(0, FATE_LOG_MAX).map((item) => {
      if (item.key === "deck") return deckLogRow(item);
      if (item.key === "truth") return truthLogRow(item);
      const f = item.f;
      const secret = f.s === 1;
      const row = document.createElement(secret ? "button" : "div");
      row.className = "kulisy-fate-row" + (secret ? " is-secret" : "");
      const time = document.createElement("span");
      time.className = "kulisy-fate-time";
      time.textContent = fateTime(item.at);
      const what = document.createElement("span");
      what.className = "kulisy-fate-what";
      const who = f.who ? (state.names[f.who] ? shortName(f.who) : "?") : ft("me");
      what.textContent = `${secret ? "🔒" : "🎲"} ${who} · ${ft(f.d).toLowerCase()}`;
      if (!secret) {
        const result = document.createElement("b");
        result.textContent = `${f.r} — ${ft(f.o)}`;
        what.append(" · ", result);
      }
      row.append(time, what);
      if (secret || f.s === 2) {
        const sub = document.createElement("span");
        sub.className = "kulisy-fate-sub";
        sub.textContent = ft(secret ? "log_secret" : "log_was_secret");
        row.append(sub);
      }
      if (secret) {
        row.type = "button";
        row.addEventListener("click", () => void revealFate(item));
      }
      return row;
    }),
  );
}

async function loadFateLog() {
  const chatId = state.chatId;
  if (!chatId) return;
  const seq = ++fate.logSeq;
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=500"));
    if (seq !== fate.logSeq || chatId !== state.chatId) return;
    await healFateSwipes(chatId, messages); // older regenerated rolls, from before 0.9.6
    if (seq !== fate.logSeq || chatId !== state.chatId) return;
    const log = [];
    for (const m of Array.isArray(messages) ? messages : []) {
      const extra = parseMaybeJson(m.extra, {}) || {};
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      const at = msTime(m.createdAt);
      const f = kulisy.fate;
      if (f && FATE_EDGES[f.d] && FATE_OUTCOMES.includes(f.o)) log.push({ id: m.id, at, key: "fate", f, extra });
      const k = kulisy.deck;
      if (k && Array.isArray(k.c) && k.c.length) log.push({ id: m.id, at, key: "deck", f: k, extra });
      const tr = kulisy.truth;
      if (tr && TRUTH_OUTCOMES.includes(tr.o)) log.push({ id: m.id, at, key: "truth", f: tr, extra });
    }
    log.sort((a, b) => b.at - a.at);
    fate.log = log;
    fate.logChat = chatId;
    fate.logError = false;
    setSecretStart(chatId, messages);
  } catch (error) {
    if (seq !== fate.logSeq) return;
    fate.logError = true;
    marinara.log.warn("Could not read the roll log", error);
  }
  renderFateLog();
}

function scheduleFateLog() {
  if (!state.open || page !== "log") return;
  if (fate.logTimer !== null) marinara.clearTimeout(fate.logTimer);
  fate.logTimer = marinara.setTimeout(() => {
    fate.logTimer = null;
    void loadFateLog();
  }, 600);
}

// A drawn hand in the log: the card played (or "couldn't tell"), the hand under it; secret ones open on a tap.
function deckLogRow(item) {
  const f = item.f;
  const secret = f.s === 1;
  const row = document.createElement(secret ? "button" : "div");
  row.className = "kulisy-fate-row" + (secret ? " is-secret" : "");
  const time = document.createElement("span");
  time.className = "kulisy-fate-time";
  time.textContent = fateTime(item.at);
  const what = document.createElement("span");
  what.className = "kulisy-fate-what";
  what.textContent = `${secret ? "🔒" : "🃏"} ${ft(f.a ? "log_deck_auto" : "log_deck")}`;
  const played = typeof f.p === "number" && f.p >= 0 ? f.c[f.p] : "";
  if (!secret) {
    if (played) {
      const result = document.createElement("b");
      result.textContent = played;
      what.append(" · ", result);
    } else {
      what.append(` · ${ft("log_deck_unknown")}`);
    }
  }
  row.append(time, what);
  const sub = [];
  if (secret) sub.push(ft("log_deck_secret"));
  else if (f.c.length > 1) sub.push(ft("log_deck_from", { list: f.c.join(" · ") }));
  if (f.s === 2) sub.push(ft("log_was_secret"));
  if (sub.length) {
    const node = document.createElement("span");
    node.className = "kulisy-fate-sub";
    node.textContent = sub.join(" · ");
    row.append(node);
  }
  if (secret) {
    row.type = "button";
    row.addEventListener("click", () => void revealFate(item));
  }
  return row;
}

async function revealFate(item) {
  const chatId = state.chatId;
  const key = item.key || "fate";
  const kulisy = item.extra.kulisy && typeof item.extra.kulisy === "object" ? item.extra.kulisy : {};
  const next = { ...kulisy, [key]: { ...item.f, s: 2 } };
  item.f = next[key];
  item.extra = { ...item.extra, kulisy: next };
  renderFateLog();
  try {
    await api(chatPath(chatId, `/messages/${encodeURIComponent(item.id)}/extra`), {
      method: "PATCH",
      body: JSON.stringify({ kulisy: next }),
    });
    patchCachedExtra(chatId, item.id, item.extra);
    scheduleBadges();
  } catch (error) {
    marinara.log.warn("Could not reveal the roll", error);
    scheduleFateLog();
  }
}

// ---- the event deck (0.9.7): the user's own cards for a game, drawn by a tap ----
// Whose deck: a chat in a folder plays its folder's deck, so a game's scenes share their cards and their "played" marks;
// Roleplay and Conversation folders of the same name (one game in both modes) share it too. A chat outside folders has its own.
// The cards live in Offstage's storage on the server (every device sees them): "deck:n:<folder name>" or "deck:c:<chat id>"
// -> { cards: [{ id, t, tone, used }] }; the scene's tone is the chat's own, metadata kulisyDeck { tone }. "Draw" takes up to
// three unplayed cards of the scene's tone; they wait for the next reply in this chat and reach the model inside Marinara's
// generation guide — "pick the one that fits best". No extra request to the model, and a regenerate replays the same guide.
// Which card was played is guessed from the reply's words and marked played (the list lets the user fix it). The draw is kept
// on the reply (extra.kulisy.deck { c: [texts], p: index | -1, s }) and shown in the log only, never under the message.

const DECK_TONES = ["cozy", "tense", "danger"];
const DECK_DRAW = 3;
const DECK_MAX = 150;
// The starter set: a deck nobody has written yet starts with it (Leah 18.10); emptied, it stays empty. Fixed ids, so the
// played marks find their card until the deck is first saved.
const DECK_STARTER = {
  ru: {
    cozy: [
      "Начался дождь",
      "Порыв ветра",
      "Что-то упало и разбилось",
      "Вдалеке заиграла музыка",
      "Запахло чем-то вкусным",
      "Кто-то неподалёку громко рассмеялся",
      "Стало заметно холоднее",
      "Пролился напиток",
      "Мимо пробежала кошка",
      "Послышались чьи-то шаги",
    ],
    tense: [
      "Пришло письмо",
      "Неожиданный гость",
      "Кто-то проговорился о том, что скрывал",
      "Пропала нужная вещь",
      "Нашлась вещь, которую давно потеряли",
      "Кто-то подслушал разговор",
      "Пришли новости издалека",
      "Старый знакомый появился в неожиданном месте",
      "Кто-то просит о помощи",
      "Планы срываются в последний момент",
    ],
    danger: [
      "Погас свет",
      "Пожар",
      "Кто-то ранен",
      "Нападение",
      "Раздался крик о помощи",
      "Кто-то исчез",
      "Рядом что-то рушится",
      "Разыгралась буря, путь отрезан",
      "Раскрылось предательство",
      "Погоня",
    ],
  },
  en: {
    cozy: [
      "It starts to rain",
      "A gust of wind",
      "Something falls and breaks",
      "Music starts somewhere in the distance",
      "Something smells delicious",
      "Someone nearby laughs out loud",
      "It gets noticeably colder",
      "A drink gets spilled",
      "A cat runs past",
      "Footsteps can be heard",
    ],
    tense: [
      "A letter arrives",
      "An unexpected guest",
      "Someone lets slip what they were hiding",
      "Something needed goes missing",
      "Something lost long ago turns up",
      "Someone overhears the conversation",
      "News arrives from far away",
      "An old acquaintance turns up in an unexpected place",
      "Someone asks for help",
      "Plans fall apart at the last moment",
    ],
    danger: [
      "The lights go out",
      "A fire",
      "Someone is hurt",
      "An attack",
      "A cry for help",
      "Someone disappears",
      "Something collapses nearby",
      "A storm breaks out and cuts off the way",
      "A betrayal comes to light",
      "A chase",
    ],
  },
};
function starterDeck() {
  const set = DECK_STARTER[lang] || DECK_STARTER.en;
  const cards = [];
  for (const tone of DECK_TONES) set[tone].forEach((t, i) => cards.push({ id: `s${tone[0]}${i + 1}`, t, tone, used: 0 }));
  return cards;
}
const DECK_TEXT_MAX = 200;
// which size lists of the card list are unfolded — each device remembers its own
const DECK_GROUPS_KEY = "kulisy-deck-groups";
function loadDeckGroups() {
  try {
    const saved = JSON.parse(localStorage.getItem(DECK_GROUPS_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((t) => DECK_TONES.includes(t)) : []);
  } catch {
    return new Set();
  }
}
function saveDeckGroups() {
  try {
    localStorage.setItem(DECK_GROUPS_KEY, JSON.stringify([...deck.groups]));
  } catch {}
}
const deck = {
  groups: loadDeckGroups(), // tones whose card list is unfolded
  chatId: null, // the chat deck.data belongs to
  data: { tone: "any", cards: [] },
  folder: "", // the folder whose deck it is ("" - the chat's own)
  more: false, // "more ⋯" is open: Shuffle, Remove all
  adding: false, // tone whose list shows the new card's form ("+ New card" was tapped), or false
  openCard: null, // id of the card opened in the list
  formTone: "cozy",
  formUsed: false,
  bulk: false, // "Paste a list" is open
  undo: null, // { chatId, cards, pending } - what "Remove all cards" took; "Bring back" until the list closes
  pending: null, // { chatId, cards: [{ id, t }], s, a, lang, at } — drawn (a: by the deck itself), waiting for a generation
  auto: { f: "off", t: 0, skip: 0, n: 0 }, // the open chat's "draws by itself" (DECK_AUTO_KEY)
  marks: [], // [{ chatId, p, at }] — handed to a generation, waiting for its reply
  hands: {}, // chatId -> { m, cards, id, s, lang } — the last hand and its reply, until the user's next message
  queue: Promise.resolve(),
  writes: 0,
  deleteArmed: null,
  deleteTimer: null,
};

function sanitizeDeck(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const tone = DECK_TONES.includes(src.tone) ? src.tone : "any";
  const cards = [];
  const seen = new Set();
  for (const c of Array.isArray(src.cards) ? src.cards : []) {
    if (!c || typeof c.id !== "string" || seen.has(c.id) || typeof c.t !== "string" || !c.t.trim()) continue;
    seen.add(c.id);
    cards.push({
      id: c.id,
      t: c.t.trim().slice(0, DECK_TEXT_MAX),
      tone: DECK_TONES.includes(c.tone) ? c.tone : "cozy",
      used: c.used ? 1 : 0,
    });
    if (cards.length >= DECK_MAX) break;
  }
  return { tone, cards };
}

function randomIndex(n) {
  const box = new Uint32Array(1);
  crypto.getRandomValues(box);
  return Math.floor((box[0] / 4294967296) * n);
}
function deckCardId() {
  const box = new Uint32Array(2);
  crypto.getRandomValues(box);
  return `c${box[0].toString(36)}${box[1].toString(36)}`;
}

function deckHere() {
  return deck.chatId !== null && deck.chatId === state.chatId;
}
function deckArmedHere() {
  return deck.pending && deck.pending.chatId === state.chatId ? deck.pending : null;
}
function setDeckHint(text) {
  fel.deckHint.textContent = text;
  fel.deckHint.hidden = !text;
}

// Folder names, re-read at most once a minute: a deck follows its folder's name.
const folderNames = { at: 0, map: {} };
async function folderName(folderId) {
  if (!folderId) return "";
  if (!(folderId in folderNames.map) || Date.now() - folderNames.at > 60000) {
    try {
      const list = await api("/api/chat-folders");
      folderNames.map = {};
      for (const f of Array.isArray(list) ? list : []) folderNames.map[f.id] = typeof f.name === "string" ? f.name.trim() : "";
      folderNames.at = Date.now();
    } catch (error) {
      marinara.log.warn("Could not read the chat folders", error);
    }
  }
  return folderNames.map[folderId] || "";
}
async function readDeck(chatId) {
  const chat = await api(chatPath(chatId));
  const meta = parseMaybeJson(chat.metadata, {}) || {};
  const folder = await folderName(chat.folderId);
  const key = folder ? `deck:n:${folder.toLowerCase().replace(/\s+/g, " ")}` : `deck:c:${chatId}`;
  const stored = ((await marinara.storage.get()) || {})[key];
  const own = meta[DECK_KEY] && typeof meta[DECK_KEY] === "object" ? meta[DECK_KEY] : {};
  // a 0.9.7 test build kept the cards in the chat itself: they are taken over until the deck has its own
  const cards = stored && Array.isArray(stored.cards) ? stored.cards : Array.isArray(own.cards) ? own.cards : starterDeck();
  return {
    key,
    folder,
    data: sanitizeDeck({ tone: own.tone, cards }),
    hand: sanitizeHand(meta[DECK_HAND_KEY]),
    auto: sanitizeAuto(meta[DECK_AUTO_KEY]),
    truthHand: sanitizeTruthHand(meta[TRUTH_HAND_KEY]),
  };
}

// Every change is read-modify-write on the server's copy, one at a time: another device's edits and a reply's "played" mark
// are not lost. The open chat's list changes at once; the server's copy replaces it after the last queued write.
function deckWrite(chatId, mutate) {
  const seq = ++deck.writes;
  const task = deck.queue.then(async () => {
    const { key, folder, data } = await readDeck(chatId);
    mutate(data);
    await marinara.storage.patch({ [key]: { cards: data.cards } });
    await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [DECK_KEY]: { tone: data.tone } }) });
    if (seq === deck.writes && chatId === state.chatId && deck.chatId === chatId) {
      deck.data = data;
      deck.folder = folder;
      renderDeck();
    }
  });
  deck.queue = task.catch((error) => {
    marinara.log.warn("Could not save the deck", error);
    if (chatId === state.chatId) setDeckHint(ft("deck_save_error"));
  });
  return deck.queue;
}
function deckSave(mutate) {
  if (!deckHere()) return;
  mutate(deck.data);
  renderDeck();
  void deckWrite(deck.chatId, mutate);
}
// Read when a chat opens and when the card opens: the deck may have been changed in another scene or on another device.
function loadDeck() {
  const chatId = state.chatId;
  if (!chatId) return;
  deck.queue = deck.queue.then(async () => {
    const seq = deck.writes;
    try {
      const { folder, data, hand, auto, truthHand } = await readDeck(chatId);
      if (seq !== deck.writes || chatId !== state.chatId) return;
      deck.data = data;
      deck.folder = folder;
      deck.chatId = chatId;
      deck.auto = auto;
      if (hand) deck.hands[chatId] = hand;
      else delete deck.hands[chatId];
      renderDeck();
      if (hand) void checkDeckHand(chatId, false); // the reply may have been deleted on another device
      if (truthHand) truth.hands[chatId] = truthHand;
      else delete truth.hands[chatId];
      renderTruth();
      if (truthHand) void checkTruthHand(chatId, false);
    } catch (error) {
      marinara.log.warn("Could not read the deck", error);
    }
  });
}

function drawDeck() {
  const error = drawDeckNow();
  if (error) setDeckHint(error);
}
// -> "" when drawn, else why not
function drawDeckNow() {
  if (!deckHere()) return state.chatId ? ft("deck_loading") : "";
  // a hand the deck drew by itself is secret: a tap draws over it, without a word
  const armed = deckArmedHere();
  if (armed && !armed.a) return ft("deck_already");
  const cards = deck.data.cards;
  const fresh = cards.filter((c) => !c.used);
  const pool = fresh.filter((c) => deck.data.tone === "any" || c.tone === deck.data.tone);
  if (!pool.length) {
    if (!cards.length) return ft("deck_empty");
    if (!fresh.length) return ft("deck_spent");
    return ft("deck_no_tone", { tone: ft(`tone_${deck.data.tone}`) });
  }
  const picked = [];
  while (picked.length < DECK_DRAW && pool.length) picked.push(pool.splice(randomIndex(pool.length), 1)[0]);
  deck.pending = {
    chatId: state.chatId,
    cards: picked.map((c) => ({ id: c.id, t: c.t })),
    s: fate.surprise ? 1 : 0,
    lang,
    at: Date.now(),
  };
  setDeckHint("");
  renderDeck();
  return "";
}

function deckGuide(p) {
  const quote = p.lang === "ru" ? (text) => `«${text}»` : (text) => `“${text}”`;
  if (p.cards.length === 1) return ft("deck_guide_one", { list: quote(p.cards[0].t) }, p.lang);
  return ft("deck_guide_many", { list: p.cards.map((c, i) => `${i + 1}) ${quote(c.t)}`).join("; ") }, p.lang);
}

// Which card the reply played: the share of each card's word stems found in the reply; a tie or nothing found → -1.
function deckStems(text) {
  const words = String(text).toLowerCase().replace(/ё/g, "е").match(/\p{L}{4,}/gu) || [];
  return [...new Set(words.map((w) => (w.length <= 5 ? w.slice(0, w.length - 1) : w.slice(0, Math.min(6, w.length - 2)))))];
}
function guessDeckCard(cards, reply) {
  if (cards.length === 1) return 0;
  const hay = String(reply).toLowerCase().replace(/ё/g, "е");
  let best = -1;
  let bestScore = 0;
  let tie = false;
  cards.forEach((card, i) => {
    const stems = deckStems(card.t);
    if (!stems.length) return;
    const score = stems.filter((stem) => hay.includes(stem)).length / stems.length;
    if (score > bestScore) {
      best = i;
      bestScore = score;
      tie = false;
    } else if (score > 0 && score === bestScore) {
      tie = true;
    }
  });
  return tie ? -1 : best;
}

// The draw goes on the first reply after it; the played card is marked in the deck.
async function markDeckReplies(chatId) {
  const due = deck.marks.filter((m) => m.chatId === chatId);
  if (!due.length) return;
  deck.marks = deck.marks.filter((m) => m.chatId !== chatId);
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=12"));
    const list = Array.isArray(messages) ? messages : [];
    for (const mark of due) {
      const replies = list
        .filter((m) => m.role === "assistant" && msTime(m.createdAt) >= mark.at - 2000)
        .sort((a, b) => msTime(a.createdAt) - msTime(b.createdAt));
      if (!replies.length) continue;
      const target = replies[0];
      const extra = parseMaybeJson(target.extra, {}) || {};
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      if (kulisy.deck) continue;
      const pick = guessDeckCard(mark.p.cards, replies.map((m) => m.content || "").join("\n"));
      const rec = { c: mark.p.cards.map((c) => c.t), p: pick };
      if (mark.p.s) rec.s = 1;
      if (mark.p.a) rec.a = 1;
      const next = { ...kulisy, deck: rec };
      await api(chatPath(chatId, `/messages/${encodeURIComponent(target.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({ kulisy: next }),
      });
      patchCachedExtra(chatId, target.id, { ...extra, kulisy: next });
      await setDeckHand(chatId, {
        m: target.id,
        cards: mark.p.cards,
        id: pick >= 0 ? mark.p.cards[pick].id : "",
        s: mark.p.s,
        a: mark.p.a,
        lang: mark.p.lang,
      });
      if (pick >= 0) {
        const id = mark.p.cards[pick].id;
        if (chatId === state.chatId && deck.chatId === chatId) {
          const card = deck.data.cards.find((c) => c.id === id);
          if (card) card.used = 1;
          renderDeck();
        }
        await deckWrite(chatId, (data) => {
          const card = data.cards.find((c) => c.id === id);
          if (card) card.used = 1;
        });
      }
    }
    scheduleFateLog();
  } catch (error) {
    marinara.log.warn("Could not mark the drawn cards on the reply", error);
  }
}

// A hand whose reply is gone (Leah 18.10: she deleted it to call another character) was never played: its card is
// unmarked and the same hand waits for the next reply, as a roll nobody answered does. The hand is remembered (chat
// metadata, kulisyDeckHand) until the user's next message; a reply deleted after that stays played.
function sanitizeHand(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.m !== "string" || !raw.m || !Array.isArray(raw.cards)) return null;
  const cards = raw.cards
    .filter((c) => c && typeof c.id === "string" && typeof c.t === "string")
    .slice(0, DECK_DRAW)
    .map((c) => ({ id: c.id, t: c.t }));
  if (!cards.length) return null;
  return {
    m: raw.m,
    cards,
    id: typeof raw.id === "string" ? raw.id : "",
    s: raw.s ? 1 : 0,
    a: raw.a ? 1 : 0,
    lang: raw.lang === "en" ? "en" : "ru",
  };
}
async function setDeckHand(chatId, hand) {
  if (hand) deck.hands[chatId] = hand;
  else delete deck.hands[chatId];
  try {
    await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [DECK_HAND_KEY]: hand || null }) });
  } catch (error) {
    marinara.log.warn("Could not save the last hand", error);
  }
}
// newTurn: the user writes a new message — a hand whose reply is still there is done with.
async function checkDeckHand(chatId, newTurn) {
  const hand = deck.hands[chatId];
  if (!hand) return;
  let list;
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=40"));
    list = Array.isArray(messages) ? messages : null;
  } catch (error) {
    marinara.log.warn("Could not check the reply of the last hand", error);
  }
  if (!list || deck.hands[chatId] !== hand) return;
  if (list.some((m) => m.id === hand.m)) {
    if (newTurn) await setDeckHand(chatId, null);
    return;
  }
  await setDeckHand(chatId, null);
  if (hand.id) {
    if (chatId === state.chatId && deck.chatId === chatId) {
      const card = deck.data.cards.find((c) => c.id === hand.id);
      if (card) card.used = 0;
    }
    void deckWrite(chatId, (data) => {
      const card = data.cards.find((c) => c.id === hand.id);
      if (card) card.used = 0;
    });
  }
  if (!deck.pending) deck.pending = { chatId, cards: hand.cards, s: hand.s, a: hand.a, lang: hand.lang, at: Date.now() };
  renderDeck();
  scheduleFateLog();
}
// Requests that can end a hand: a generation, the user's message, a deleted message. For a generation the check comes
// first (the hand may go into it); the others are checked after they are done.
function deckHandRequest(input, init) {
  if (!init) return null;
  const method = String(init.method || "GET").toUpperCase();
  if (method !== "DELETE" && (method !== "POST" || typeof init.body !== "string")) return null;
  const path = requestPath(input);
  const hit = path.match(/^\/api\/chats\/([^/]+)\/messages(?:\/([^/]+))?$/);
  if (path === "/api/generate" && method === "POST") {
    const body = JSON.parse(init.body);
    if (!hasHand(body.chatId) || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
    const newTurn = typeof body.userMessage === "string" && body.userMessage.trim() !== "";
    return { before: true, chatId: body.chatId, newTurn };
  }
  if (!hit || !hasHand(decodeURIComponent(hit[1]))) return null;
  const chatId = decodeURIComponent(hit[1]);
  if (method === "DELETE" && hit[2]) return { chatId, newTurn: false };
  if (method === "POST" && hit[2] === "bulk-delete") return { chatId, newTurn: false };
  if (method === "POST" && !hit[2]) {
    const body = JSON.parse(init.body);
    if (body.role === "user") return { chatId, newTurn: true };
  }
  return null;
}

// The deck draws by itself (Leah 18.10): a secret hand of the scene's tone every few of the user's messages — a range per
// frequency, a new random gap after each event. A turn is the user's message, not a character's reply (several characters
// may answer one message). Counted from the server's own list: messages newer than the last event (t, the server's time of
// the newest message then; skip — the user's message that came with that very request), the whisper's hidden half not
// counted. Kept in the chat (DECK_AUTO_KEY), so every device counts the same. A hand drawn by tap is an event too: the
// count starts again.
const DECK_AUTO = { rare: [10, 15], some: [6, 10], often: [3, 6] };
const DECK_AUTO_SCAN = 100;
function autoGap(f) {
  const [lo, hi] = DECK_AUTO[f];
  return lo + randomIndex(hi - lo + 1);
}
function sanitizeAuto(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const f = Object.hasOwn(DECK_AUTO, src.f) ? src.f : "off";
  if (f === "off") return { f, t: 0, skip: 0, n: 0 };
  const [lo, hi] = DECK_AUTO[f];
  const n = Number.isInteger(src.n) && src.n >= lo && src.n <= hi ? src.n : autoGap(f);
  return { f, t: Number.isFinite(src.t) && src.t > 0 ? src.t : 0, skip: src.skip ? 1 : 0, n };
}
function autoFrom(f, list, mine) {
  const last = list.length ? list[list.length - 1] : null;
  return { f, t: last ? msTime(last.createdAt) || 0 : 0, skip: mine ? 1 : 0, n: autoGap(f) };
}
async function saveDeckAuto(chatId, auto) {
  await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [DECK_AUTO_KEY]: auto }) });
  if (chatId === state.chatId && deck.chatId === chatId) {
    deck.auto = auto;
    renderDeck();
  }
}
function setDeckAuto(f) {
  if (!deckHere()) return;
  const chatId = deck.chatId;
  deck.auto = { ...deck.auto, f };
  renderDeck();
  deck.queue = deck.queue
    .then(async () => {
      if (f === "off") return saveDeckAuto(chatId, sanitizeAuto(null));
      const messages = await api(chatPath(chatId, "/messages?limit=1"));
      await saveDeckAuto(chatId, autoFrom(f, Array.isArray(messages) ? messages : [], false));
    })
    .catch((error) => {
      marinara.log.warn("Could not save the deck's own draws", error);
      if (chatId === state.chatId) setDeckHint(ft("deck_save_error"));
    });
}
// A new generation (not a regenerate, continue, impersonate) — the deck may draw by itself before it goes.
function deckAutoRequest(input, init) {
  if (!init || typeof init.body !== "string" || String(init.method || "GET").toUpperCase() !== "POST") return null;
  if (requestPath(input) !== "/api/generate") return null;
  const body = JSON.parse(init.body);
  if (typeof body.chatId !== "string" || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
  return { chatId: body.chatId, mine: typeof body.userMessage === "string" && body.userMessage.trim() !== "" };
}
// one of a whisper's two messages that is not the turn: "what everyone sees" (kind "all"), or a whisper from before
// 0.9.21 (its unmarked "everyone" line was the turn)
function whisperHalf(m) {
  const extra = parseMaybeJson(m.extra, {}) || {};
  const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : null;
  return !!kulisy && (kulisy.kind === "all" || (kulisy.kind === "whisper" && !kulisy.turn));
}
async function deckAutoCheck(req) {
  try {
    const chat = await api(chatPath(req.chatId));
    const auto = sanitizeAuto((parseMaybeJson(chat.metadata, {}) || {})[DECK_AUTO_KEY]);
    if (auto.f === "off") return;
    const messages = await api(chatPath(req.chatId, `/messages?limit=${DECK_AUTO_SCAN}`));
    const list = Array.isArray(messages) ? messages : [];
    const p = deck.pending;
    if (p) {
      if (p.chatId === req.chatId && !p.a) await saveDeckAuto(req.chatId, autoFrom(auto.f, list, req.mine));
      return;
    }
    let turns = req.mine ? 1 : 0;
    for (const m of list) if (m.role === "user" && msTime(m.createdAt) > auto.t && !whisperHalf(m)) turns += 1;
    if (turns - auto.skip < auto.n) return;
    const { data } = await readDeck(req.chatId);
    const pool = data.cards.filter((c) => !c.used && (data.tone === "any" || c.tone === data.tone));
    if (!pool.length) return; // nothing of this size left: it waits for the next turn
    const picked = [];
    while (picked.length < DECK_DRAW && pool.length) picked.push(pool.splice(randomIndex(pool.length), 1)[0]);
    if (deck.pending) return;
    deck.pending = { chatId: req.chatId, cards: picked.map((c) => ({ id: c.id, t: c.t })), s: 1, a: 1, lang, at: Date.now() };
    await saveDeckAuto(req.chatId, autoFrom(auto.f, list, req.mine));
  } catch (error) {
    marinara.log.warn("Could not let the deck draw by itself", error);
  }
}

// The fetch wrapper hands the drawn cards to the next generation of their chat (not a regenerate: Marinara replays the
// guide itself; not continue / impersonate).
function deckGenerate(init, p) {
  const body = JSON.parse(init.body);
  if (body.chatId !== p.chatId || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
  const guide = deckGuide(p);
  const own = typeof body.generationGuide === "string" && body.generationGuide.trim() ? body.generationGuide : "";
  body.generationGuide = own ? `${own}\n\n${guide}` : guide;
  if (!body.generationGuideSource) body.generationGuideSource = "guide";
  deck.pending = null;
  deck.marks.push({ chatId: p.chatId, p, at: Date.now() });
  renderDeck();
  return { ...init, body: JSON.stringify(body) };
}
function restoreDeck(p) {
  deck.marks = deck.marks.filter((m) => m.p !== p);
  if (!deck.pending) deck.pending = p;
  renderDeck();
}
function watchDeck(request, p, t) {
  if (p || t) {
    const restore = () => {
      if (p) restoreDeck(p);
      if (t) restoreTruth(t);
    };
    request.then(
      (response) => {
        if (!response.ok) restore();
      },
      restore,
    );
  }
  return request;
}

// ---- truth or lie (0.9.12, Fate p. 6): a secret roll for the next reply ----
// Leah 18.10: the player neither picks nor sees the odds — the point is not knowing what the AI slips in. A tap rolls the
// truth or a lie (even odds; a half-truth was dropped — DeepSeek played it as a plain lie) for the next reply in this chat, whoever gives it (in manual order she calls
// the character herself; a one-character chat answers by itself). It reaches the model inside Marinara's guide, as the
// deck's cards do; the reply keeps it (extra.kulisy.truth { o, who, s }), shown in the log only and secret until a tap
// (s: 2). A deleted reply arms a fresh roll for the next one (0.9.14, Leah 18.10; the last reply is kept in TRUTH_HAND_KEY
// until the user's next message, as the deck's hand); a failed generation gives the same roll back; a regenerate replays
// the same guide, and SWIPE_CARRY moves the record to the new swipe.
const TRUTH_OUTCOMES = ["truth", "lie"];
const truth = {
  pending: null, // { chatId, o, lang, at } — rolled, waiting for a generation
  marks: [], // [{ chatId, p, at }] — handed to a generation, waiting for its reply
  hands: {}, // chatId -> { m, o, lang } — the last roll and its reply, until the user's next message
};
function truthArmedHere() {
  return truth.pending && truth.pending.chatId === state.chatId ? truth.pending : null;
}
function setTruthHint(text) {
  fel.truthHint.textContent = text;
  fel.truthHint.hidden = !text;
}
function renderTruth() {
  const asked = !!truthArmedHere();
  fel.truthRoll.replaceChildren(
    fateChip(`⚖️ ${ft("move_truth")}`, asked, () => {
      if (!asked) return rollTruth();
      truth.pending = null;
      setTruthHint("");
      renderTruth();
    }),
  );
  fel.truthArmed.hidden = !truthArmedHere();
  paintDie();
}
function rollTruth() {
  if (!state.chatId) return;
  if (truthArmedHere()) return setTruthHint(ft("truth_already"));
  truth.pending = { chatId: state.chatId, o: TRUTH_OUTCOMES[randomIndex(TRUTH_OUTCOMES.length)], lang, at: Date.now() };
  setTruthHint("");
  renderTruth();
}
function truthGenerate(init, p) {
  const body = JSON.parse(init.body);
  if (body.chatId !== p.chatId || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
  const guide = ft(`truth_guide_${p.o}`, {}, p.lang);
  const own = typeof body.generationGuide === "string" && body.generationGuide.trim() ? body.generationGuide : "";
  body.generationGuide = own ? `${own}\n\n${guide}` : guide;
  if (!body.generationGuideSource) body.generationGuideSource = "guide";
  truth.pending = null;
  truth.marks.push({ chatId: p.chatId, p, at: Date.now() });
  renderTruth();
  return { ...init, body: JSON.stringify(body) };
}
function restoreTruth(p) {
  truth.marks = truth.marks.filter((m) => m.p !== p);
  if (!truth.pending) truth.pending = p;
  renderTruth();
}
// The roll goes on the first reply after it.
async function markTruthReplies(chatId) {
  const due = truth.marks.filter((m) => m.chatId === chatId);
  if (!due.length) return;
  truth.marks = truth.marks.filter((m) => m.chatId !== chatId);
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=12"));
    const list = Array.isArray(messages) ? messages : [];
    for (const mark of due) {
      const target = list
        .filter((m) => m.role === "assistant" && msTime(m.createdAt) >= mark.at - 2000)
        .sort((a, b) => msTime(a.createdAt) - msTime(b.createdAt))[0];
      if (!target) continue;
      const extra = parseMaybeJson(target.extra, {}) || {};
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      if (kulisy.truth) continue;
      const next = { ...kulisy, truth: { o: mark.p.o, who: target.characterId || "", s: 1 } };
      await api(chatPath(chatId, `/messages/${encodeURIComponent(target.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({ kulisy: next }),
      });
      patchCachedExtra(chatId, target.id, { ...extra, kulisy: next });
      await setTruthHand(chatId, { m: target.id, o: mark.p.o, lang: mark.p.lang });
    }
    scheduleFateLog();
  } catch (error) {
    marinara.log.warn("Could not mark the truth roll on the reply", error);
  }
}
function sanitizeTruthHand(raw) {
  if (!raw || typeof raw !== "object" || typeof raw.m !== "string" || !raw.m || !TRUTH_OUTCOMES.includes(raw.o)) return null;
  return { m: raw.m, o: raw.o, lang: raw.lang === "en" ? "en" : "ru" };
}
async function setTruthHand(chatId, hand) {
  if (hand) truth.hands[chatId] = hand;
  else delete truth.hands[chatId];
  try {
    await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ [TRUTH_HAND_KEY]: hand || null }) });
  } catch (error) {
    marinara.log.warn("Could not save the last truth roll", error);
  }
}
// newTurn: the user writes a new message — a roll whose reply is still there is done with.
async function checkTruthHand(chatId, newTurn) {
  const hand = truth.hands[chatId];
  if (!hand) return;
  let list;
  try {
    const messages = await api(chatPath(chatId, "/messages?limit=40"));
    list = Array.isArray(messages) ? messages : null;
  } catch (error) {
    marinara.log.warn("Could not check the reply of the last truth roll", error);
  }
  if (!list || truth.hands[chatId] !== hand) return;
  if (list.some((m) => m.id === hand.m)) {
    if (newTurn) await setTruthHand(chatId, null);
    return;
  }
  await setTruthHand(chatId, null);
  if (!truth.pending) truth.pending = { chatId, o: TRUTH_OUTCOMES[randomIndex(TRUTH_OUTCOMES.length)], lang: hand.lang, at: Date.now() };
  renderTruth();
  scheduleFateLog();
}
function hasHand(chatId) {
  return !!(deck.hands[chatId] || truth.hands[chatId]);
}
async function checkHands(chatId, newTurn) {
  await checkDeckHand(chatId, newTurn);
  await checkTruthHand(chatId, newTurn);
}
function truthLogRow(item) {
  const f = item.f;
  const secret = f.s === 1;
  const row = document.createElement(secret ? "button" : "div");
  row.className = "kulisy-fate-row" + (secret ? " is-secret" : "");
  const time = document.createElement("span");
  time.className = "kulisy-fate-time";
  time.textContent = fateTime(item.at);
  const what = document.createElement("span");
  what.className = "kulisy-fate-what";
  const who = f.who && state.names[f.who] ? ` · ${shortName(f.who)}` : "";
  what.textContent = `${secret ? "🔒" : "🎭"} ${ft("log_truth")}${who}`;
  if (!secret) {
    const result = document.createElement("b");
    result.textContent = ft(`truth_${f.o}`);
    what.append(" · ", result);
  }
  row.append(time, what);
  if (secret || f.s === 2) {
    const sub = document.createElement("span");
    sub.className = "kulisy-fate-sub";
    sub.textContent = ft(secret ? "log_secret" : "log_was_secret");
    row.append(sub);
  }
  if (secret) {
    row.type = "button";
    row.addEventListener("click", () => void revealFate(item));
  }
  return row;
}

// ---- life between scenes (0.9.15): what happened to a character off-screen ----
// "What happened to them?" makes up a short private story of one character's time off-screen: one request to the chat's own
// connection through Marinara's /api/generate/raw (it writes nothing to the chat). The model reads the card, the summary and
// the scene's last messages (those the character missed are marked). The story's kind is a secret roll (good / bad / a
// meeting / a secret), its size the deck's "Event size" of this chat ("Any" rolls it too), how long ago the user picks
// ("recently / long ago" while the chat has no user message yet). The story becomes a lorebook entry only that character
// gets (constant, include -> them; a member of a cast card: the card, the member in the description), at the quiet depth,
// with a line on how to play it (visible traces at once, the story only when asked or when it fits).
// The book belongs to the game, like the deck: "Secrets — <folder>" is shared by every chat in folders of that name (Roleplay
// and Conversation alike); Offstage puts it into each chat's metadata.activeLorebookIds (how Marinara adds a book to a chat)
// and takes off another game's secrets book (a chat moved to another folder). A chat outside folders has its own. Not a
// character's book (characterIds): the secret would follow the card into other games.
// For the user it is a sealed envelope in the Fate card: a tap reads it, "Forget" erases it (the entry too). Storage:
// "secrets:n:<folder>" | "secrets:c:<chatId>" -> { book, items: [{ id (entry id), who, name, len, kind, size, at, open, t }] }.
const SECRET_KINDS = ["good", "bad", "meet", "secret"];
const SECRET_LENS = ["hours", "day", "week"];
const SECRET_START_LENS = ["recent", "long"];
const SECRET_KEEP = 3; // more than this per character: the card offers to forget the oldest
const SECRET_CONTEXT = 20; // the scene's last messages the model reads
const SECRET_TEXT_MAX = 2000;
const SECRET_ABOUT_MAX = 300; // the user's hint
const SECRET_ARRIVAL_MAX = 600;
// The book has no token budget of its own (0 = none): Marinara spends a book's budget on the whole chat's scan before it
// hands each character their entries, so other characters' secrets would crowd this one's out (default 2048).
const SECRET_BOOK_BUDGET = 0;
const secrets = {
  chatId: null, // the chat secrets.data was read for
  folder: "",
  data: { book: "", items: [] },
  who: null, // whose story the form asks for
  step: null, // the row whose "What happened to them?" form is open
  len: null,
  kind: "any", // "any" = the secret roll, or one of SECRET_KINDS
  size: "deck", // "deck" = the deck's event size of this chat, or one of DECK_TONES
  start: null, // id of the open chat while it has no user message yet
  busy: false, // a story is being written
  open: null, // id of the envelope being read
  forgetArmed: null,
  forgetTimer: null,
  queue: Promise.resolve(),
  writes: 0,
  offer: null, // { chatId, id } — "What happened to them?" under Who's here, after "here"
};

function secretsStart() {
  return !!state.chatId && secrets.start === state.chatId;
}
function setSecretStart(chatId, messages) {
  const begun = (Array.isArray(messages) ? messages : []).some((m) => m.role === "user");
  const was = secretsStart();
  if (!begun) secrets.start = chatId;
  else if (secrets.start === chatId) secrets.start = null;
  if (chatId === state.chatId && was !== secretsStart()) {
    secrets.len = null;
    renderSecrets();
  }
}
function setSecretNote(text, kind = "") {
  fel.secretNote.textContent = text;
  fel.secretNote.dataset.kind = kind;
  fel.secretNote.hidden = !text;
}
function sanitizeSecrets(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const items = [];
  for (const it of Array.isArray(src.items) ? src.items : []) {
    if (!it || typeof it.id !== "string" || typeof it.who !== "string" || typeof it.t !== "string") continue;
    items.push({
      id: it.id,
      who: it.who,
      name: typeof it.name === "string" ? it.name : "",
      len: [...SECRET_LENS, ...SECRET_START_LENS].includes(it.len) ? it.len : "day",
      kind: SECRET_KINDS.includes(it.kind) ? it.kind : "secret",
      size: DECK_TONES.includes(it.size) ? it.size : "cozy",
      at: Number(it.at) || 0,
      open: it.open ? 1 : 0,
      t: it.t,
      ...(typeof it.arr === "string" && it.arr ? { arr: it.arr } : {}),
      ...(typeof it.arrId === "string" && typeof it.arrBook === "string" ? { arrId: it.arrId, arrBook: it.arrBook } : {}),
    });
  }
  return { book: typeof src.book === "string" ? src.book : "", items };
}
function gameKey(folder) {
  return folder.toLowerCase().replace(/\s+/g, " ");
}
async function readSecrets(chatId) {
  const chat = await api(chatPath(chatId));
  const folder = await folderName(chat.folderId);
  const key = folder ? `secrets:n:${gameKey(folder)}` : `secrets:c:${chatId}`;
  const all = (await marinara.storage.get()) || {};
  return { chat, folder, key, all, data: sanitizeSecrets(all[key]) };
}
// The game's book goes into the chat's lorebooks; another game's secrets book is taken off.
async function attachSecrets(chatId, chat, all, book) {
  const meta = parseMaybeJson(chat.metadata, {}) || {};
  const active = Array.isArray(meta.activeLorebookIds) ? meta.activeLorebookIds.filter((id) => typeof id === "string") : [];
  const ours = new Set();
  for (const [key, value] of Object.entries(all || {})) {
    if (key.startsWith("secrets:") && value && typeof value.book === "string" && value.book) ours.add(value.book);
  }
  const next = active.filter((id) => id === book || !ours.has(id));
  if (book && !next.includes(book)) next.push(book);
  if (next.length === active.length && next.every((id, i) => id === active[i])) return;
  await api(chatPath(chatId, "/metadata"), { method: "PATCH", body: JSON.stringify({ activeLorebookIds: next }) });
  refreshChatDetail(chatId);
}
// A new book: every chat of the game gets it at once (a chat opened later gets it from loadSecrets).
async function attachSecretsEverywhere(chatId, ctx, book) {
  const targets = [chatId];
  if (ctx.folder) {
    try {
      const list = await api("/api/chats");
      for (const c of Array.isArray(list) ? list : []) {
        if (!c || !c.folderId || targets.includes(c.id)) continue;
        if (gameKey(await folderName(c.folderId)) === gameKey(ctx.folder)) targets.push(c.id);
      }
    } catch (error) {
      marinara.log.warn("Could not read the chats of the folder", error);
    }
  }
  for (const id of targets) {
    try {
      await attachSecrets(id, id === chatId ? ctx.chat : await api(chatPath(id)), ctx.all, book);
    } catch (error) {
      marinara.log.warn("Could not add the secrets to a chat", error);
    }
  }
}
// Read when a chat opens and when the card opens; the chat gets its game's book. Envelopes whose entries were deleted
// in Marinara's lorebook editor go too.
function loadSecrets() {
  const chatId = state.chatId;
  if (!chatId) return Promise.resolve();
  secrets.queue = secrets.queue.then(async () => {
    const seq = secrets.writes;
    try {
      const { chat, folder, all, data } = await readSecrets(chatId);
      let gone = null;
      if (data.book) {
        try {
          const book = await api(`/api/lorebooks/${encodeURIComponent(data.book)}`);
          if (Number(book && book.tokenBudget) !== SECRET_BOOK_BUDGET) {
            await api(`/api/lorebooks/${encodeURIComponent(data.book)}`, {
              method: "PATCH",
              body: JSON.stringify({ tokenBudget: SECRET_BOOK_BUDGET }),
            });
          }
          const entries = await api(`/api/lorebooks/${encodeURIComponent(data.book)}/entries`);
          const ids = new Set((Array.isArray(entries) ? entries : []).map((e) => e.id));
          gone = data.items.filter((it) => !ids.has(it.id)).map((it) => it.id);
        } catch (error) {
          if (!String(error.message).startsWith("404")) throw error;
          gone = "book";
        }
      }
      await attachSecrets(chatId, chat, all, gone === "book" ? "" : data.book);
      if (seq !== secrets.writes || chatId !== state.chatId) return;
      secrets.chatId = chatId;
      secrets.folder = folder;
      secrets.data = data;
      renderSecrets();
      if (gone === "book" || (gone && gone.length)) {
        void secretsWrite(chatId, (d) => {
          if (gone === "book") {
            d.book = "";
            d.items = [];
          } else {
            d.items = d.items.filter((it) => !gone.includes(it.id));
          }
        });
      }
    } catch (error) {
      marinara.log.warn("Could not read the secrets", error);
    }
  });
  return secrets.queue;
}
// Read-modify-write on the server's copy, one at a time (another device may have changed it).
function secretsWrite(chatId, mutate) {
  const seq = ++secrets.writes;
  const task = secrets.queue.then(async () => {
    const ctx = await readSecrets(chatId);
    await mutate(ctx.data, ctx);
    await marinara.storage.patch({ [ctx.key]: ctx.data });
    if (seq === secrets.writes && chatId === state.chatId) {
      secrets.chatId = chatId;
      secrets.folder = ctx.folder;
      secrets.data = ctx.data;
      renderSecrets();
    }
  });
  secrets.queue = task.catch((error) => {
    marinara.log.warn("Could not save the secrets", error);
    if (chatId === state.chatId) setSecretNote(ft("secret_save_error"));
  });
  return task;
}
async function ensureSecretBook(d, ctx, code) {
  if (d.book) {
    try {
      await api(`/api/lorebooks/${encodeURIComponent(d.book)}`);
      return false;
    } catch (error) {
      if (!String(error.message).startsWith("404")) throw error;
      d.book = "";
      d.items = [];
    }
  }
  const name = ctx.folder || ctx.chat.name || "";
  const book = await api("/api/lorebooks", {
    method: "POST",
    body: JSON.stringify({
      name: (name ? ft("secret_book", { name }, code) : ft("secret_book_bare", null, code)).slice(0, 200),
      description: ft("secret_book_desc", null, code),
      category: "uncategorized",
      tokenBudget: SECRET_BOOK_BUDGET,
    }),
  });
  d.book = book.id;
  return true;
}
async function secretConnection(id) {
  if (id && id !== "random") return id;
  if (id !== "random") return null;
  const list = await api("/api/connections");
  const pool = (Array.isArray(list) ? list : []).filter((c) => String(c.useForRandom) === "true");
  return pool.length ? pool[randomIndex(pool.length)].id : null;
}
function cleanStory(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, SECRET_TEXT_MAX);
}
async function secretPrompt(chatId, chat, here, who, len, kind, size, about, code) {
  const say = (key, vars) => ft(key, vars, code);
  const cardId = cardOf(who);
  const name = state.names[who] || "?";
  const parts = [];
  const user = here.personaName || say("sp_player");
  // /api/generate/raw resolves no macros: the card's {{user}} / {{char}} are put in here
  const macros = (text) =>
    text.replace(/\{\{\s*user\s*\}\}/gi, user).replace(/\{\{\s*char\s*\}\}/gi, state.names[cardId] || name);
  const add = (title, value, max) => {
    if (typeof value === "string" && value.trim()) parts.push(`${title}:\n${macros(value.trim()).slice(0, max)}`);
  };
  try {
    const card = await api(`/api/characters/${encodeURIComponent(cardId)}`);
    const data = parseMaybeJson(card && card.data, {}) || {};
    add(say("sp_card", { name: state.names[cardId] || name }), data.description, 6000);
    add(say("sp_personality"), data.personality, 2000);
    add(say("sp_scenario"), data.scenario, 2000);
  } catch (error) {
    marinara.log.warn("Could not read the character card", error);
  }
  if (isMember(who)) parts.push(say("sp_member", { name }));
  const meta = parseMaybeJson(chat.metadata, {}) || {};
  add(say("sp_summary"), meta.summary, 4000);
  const list = await api(chatPath(chatId, `/messages?limit=${SECRET_CONTEXT * 2}`));
  const lines = [];
  for (const m of Array.isArray(list) ? list : []) {
    const extra = parseMaybeJson(m.extra, {}) || {};
    if (extra.hiddenFromAI === true) continue;
    const text = typeof m.content === "string" ? m.content.trim() : "";
    if (!text) continue;
    const speaker = m.characterId ? state.names[m.characterId] || "?" : m.role === "user" ? user : say("sp_narrator");
    const unseen = Array.isArray(extra.hiddenFromAICharacterIds) && extra.hiddenFromAICharacterIds.includes(cardId);
    const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
    const missed = unseen && Array.isArray(kulisy.away) && kulisy.away.includes(cardId);
    const start = Array.isArray(extra.conversationStartForCharacterIds) && extra.conversationStartForCharacterIds.includes(cardId);
    lines.push({ unseen, missed, start, own: m.characterId === cardId, user: m.role === "user", text: `${speaker}: ${text.slice(0, 1500)}` });
  }
  // Entering the scene now (Roleplay only — Conversation has no place): a newcomer (Offstage's start mark, no line of their
  // own yet) or back from "away" (missed something after their last line). Then the model also writes how they got here.
  const lastOwn = lines.map((line) => line.own).lastIndexOf(true);
  const newcomer = lastOwn < 0 && lines.some((line) => line.start);
  const returned = lines.map((line) => line.missed).lastIndexOf(true) > lastOwn;
  const awayNow = Object.prototype.hasOwnProperty.call(here.away || {}, cardId);
  const entering = here.mode === "roleplay" && !awayNow && lines.some((line) => line.user) && (newcomer || returned);
  // What they missed is left out, only counted (0.9.15 tests: with it marked "unseen", the story was built on it).
  const recent = lines.slice(-SECRET_CONTEXT);
  const seen = recent.filter((line) => !line.unseen);
  if (seen.length) parts.push(`${say("sp_scene")}:\n${seen.map((line) => line.text).join("\n\n")}`);
  const missed = recent.length - seen.length;
  if (missed) parts.push(say("sp_missed", { name, n: missed }));
  // Added mid-game, or not a word yet: the scene so far may be news to them (0.9.15 tests: an added character's story
  // was built on the scene's plot).
  if (recent.some((line) => line.user) && !recent.some((line) => line.own)) parts.push(say("sp_absent", { name }));
  if (Object.prototype.hasOwnProperty.call(here.away || {}, cardId)) parts.push(say("sp_away", { name }));
  const vars = { name, user, when: say(`sw_${len}`), kind: say(`sg_${kind}`), size: say(`ss_${size}`), length: say(`sn_${size}`) };
  if (about) parts.push(say("sp_hint", { hint: about }));
  const system = say("sp_system", vars) + (entering ? ` ${say("sp_arrive", vars)}` : "");
  return {
    entering,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `${parts.join("\n\n")}\n\n${say("sp_ask", vars)}` },
    ],
  };
}
// The story, and under a "---" line the arrival (asked only of a character entering the scene).
function splitStory(text, entering) {
  const clean = cleanStory(text);
  const parts = clean.split(/^\s*[-—–]{3,}\s*$/m);
  if (parts.length < 2) return { story: clean, arrival: "" };
  const story = parts[0].trim();
  if (!story) return { story: clean, arrival: "" };
  const arrival = entering ? parts.slice(1).join(" ").replace(/\s+/g, " ").trim().slice(0, SECRET_ARRIVAL_MAX) : "";
  return { story, arrival };
}

// ---- the arrival: how a character entering the scene got here ----
// An entry of this chat's "in their ear" book (the arrival is true for this scene only; the secret itself belongs to the
// game), constant, only for them, at the quiet depth; never shown in the "in their ear" field. A new arrival replaces the
// old one; leaving ("away") and forgetting the envelope take it off.
function isArrivalEntry(name) {
  return Object.keys(FATE_TEXT).some((code) => String(name || "").startsWith(FATE_TEXT[code].arrive_entry_name.split("{name}")[0]));
}
async function arrivalEntries(bookId, slots) {
  const list = await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries`);
  return (Array.isArray(list) ? list : []).filter((entry) => {
    const ids = parseMaybeJson(entry.characterFilterIds, []) || [];
    return isArrivalEntry(entry.name) && ids.length === 1 && slots.includes(entrySlot(ids[0], entry.description));
  });
}
async function deleteEntry(bookId, entryId) {
  try {
    await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries/${encodeURIComponent(entryId)}`, { method: "DELETE" });
  } catch (error) {
    if (!String(error.message).startsWith("404")) throw error;
  }
}
function saveArrival(chatId, slot, arrival, code) {
  return earQueue(async () => {
    if (!state.chat || state.chatId !== chatId) return null;
    const bookId = await ensureEarLorebook(chatId);
    for (const old of await arrivalEntries(bookId, [slot])) await deleteEntry(bookId, old.id);
    const created = await api(`/api/lorebooks/${encodeURIComponent(bookId)}/entries`, {
      method: "POST",
      body: JSON.stringify({
        lorebookId: bookId,
        name: ft("arrive_entry_name", { name: entryTitle(slot) }, code).slice(0, 200),
        content: ft("arrive_entry", { name: state.names[slot] || "", arrival }, code),
        keys: [],
        constant: true,
        position: 2,
        depth: earQuietDepth(),
        role: "system",
        characterFilterMode: "include",
        ...entryTarget(slot),
      }),
    });
    return { id: created.id, book: bookId };
  });
}
function dropArrivals(chatId, slots) {
  return earQueue(async () => {
    const bookId = state.chat && state.chatId === chatId ? state.chat.earLorebookId : null;
    if (!bookId) return;
    for (const old of await arrivalEntries(bookId, slots)) await deleteEntry(bookId, old.id);
  });
}
function secretDate(at) {
  const date = new Date(at);
  return date.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "2-digit", month: "2-digit" });
}

async function askSecret() {
  if (secrets.busy || !state.chatId || !state.chat) return;
  const chatId = state.chatId;
  const here = state.chat;
  const who = secrets.who;
  if (!who || !here.slots.includes(who)) return setSecretNote(ft("secret_pick"));
  const start = secretsStart();
  if (!(start ? SECRET_START_LENS : SECRET_LENS).includes(secrets.len)) {
    return setSecretNote(ft(start ? "secret_pick_start" : "secret_pick_len"));
  }
  const len = secrets.len;
  const code = lang;
  const kind = SECRET_KINDS.includes(secrets.kind) ? secrets.kind : SECRET_KINDS[randomIndex(SECRET_KINDS.length)];
  const tone = DECK_TONES.includes(secrets.size) ? secrets.size : deckHere() ? deck.data.tone : "any";
  const size = DECK_TONES.includes(tone) ? tone : DECK_TONES[randomIndex(DECK_TONES.length)];
  const about = fel.secretAbout.value.trim().slice(0, SECRET_ABOUT_MAX);
  secrets.busy = true;
  setSecretNote("");
  renderSecrets();
  try {
    const chat = await api(chatPath(chatId));
    const connectionId = await secretConnection(chat.connectionId);
    if (!connectionId) throw new Error(ft("secret_no_conn"));
    const { messages, entering } = await secretPrompt(chatId, chat, here, who, len, kind, size, about, code);
    const reply = await api("/api/generate/raw", { method: "POST", body: JSON.stringify({ connectionId, messages }) });
    const { story, arrival } = splitStory(reply && !reply.aborted ? reply.content : "", entering);
    if (!story) throw new Error(ft("secret_empty"));
    const at = Date.now();
    const name = state.names[who] || "";
    await secretsWrite(chatId, async (d, ctx) => {
      const fresh = await ensureSecretBook(d, ctx, code);
      const entry = await api(`/api/lorebooks/${encodeURIComponent(d.book)}/entries`, {
        method: "POST",
        body: JSON.stringify({
          lorebookId: d.book,
          name: ft("secret_entry_name", { name: entryTitle(who), date: secretDate(at) }, code).slice(0, 200),
          content: ft("secret_entry", { name, when: ft(`sw_${len}`, null, code), story }, code),
          keys: [],
          constant: true,
          position: 2,
          depth: earQuietDepth(),
          role: "system",
          characterFilterMode: "include",
          ...entryTarget(who),
        }),
      });
      let arr = null;
      if (arrival) {
        try {
          arr = await saveArrival(chatId, who, arrival, code);
        } catch (error) {
          marinara.log.warn("Could not save the arrival", error);
        }
      }
      d.items.push({
        id: entry.id, who, name, len, kind, size, at, open: 0, t: story,
        ...(arr ? { arr: arrival, arrId: arr.id, arrBook: arr.book } : {}),
      });
      if (fresh) await attachSecretsEverywhere(chatId, ctx, d.book);
      else await attachSecrets(chatId, ctx.chat, ctx.all, d.book);
    });
    if (chatId === state.chatId) {
      secrets.len = null;
      secrets.kind = "any";
      secrets.size = "deck";
      fel.secretAbout.value = "";
      setSecretNote(ft("secret_done"), "ok");
    }
  } catch (error) {
    marinara.log.warn("Could not write what happened off-screen", error);
    if (chatId === state.chatId) setSecretNote(ft("secret_failed", { err: error.message }));
  } finally {
    secrets.busy = false;
    renderSecrets();
  }
}

function disarmSecretForget() {
  secrets.forgetArmed = null;
  if (secrets.forgetTimer !== null) marinara.clearTimeout(secrets.forgetTimer);
  secrets.forgetTimer = null;
}
// "Forget": the second tap within 3 s erases the envelope and its entry.
function forgetSecret(id) {
  if (secrets.forgetArmed !== id) {
    disarmSecretForget();
    secrets.forgetArmed = id;
    secrets.forgetTimer = marinara.setTimeout(() => {
      secrets.forgetTimer = null;
      secrets.forgetArmed = null;
      renderSecrets();
    }, 3000);
    return renderSecrets();
  }
  disarmSecretForget();
  const chatId = state.chatId;
  if (!chatId || secrets.chatId !== chatId) return;
  secrets.data.items = secrets.data.items.filter((it) => it.id !== id);
  if (secrets.open === id) secrets.open = null;
  renderSecrets();
  void secretsWrite(chatId, async (d) => {
    const gone = d.items.find((it) => it.id === id);
    if (gone && gone.arrId && gone.arrBook) await deleteEntry(gone.arrBook, gone.arrId);
    if (d.book && d.items.some((it) => it.id === id)) {
      try {
        await api(`/api/lorebooks/${encodeURIComponent(d.book)}/entries/${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (error) {
        if (!String(error.message).startsWith("404")) throw error;
      }
    }
    d.items = d.items.filter((it) => it.id !== id);
  });
}
function toggleSecret(id) {
  disarmSecretForget();
  secrets.open = secrets.open === id ? null : id;
  const it = secrets.data.items.find((item) => item.id === id);
  if (it && secrets.open === id && !it.open) {
    it.open = 1;
    void secretsWrite(state.chatId, (d) => {
      const item = d.items.find((x) => x.id === id);
      if (item) item.open = 1;
    });
  }
  renderSecrets();
}

function secretName(it) {
  return state.names[it.who] ? shortName(it.who) : it.name || "?";
}
function secretRow(it) {
  const wrap = document.createElement("div");
  wrap.className = "kulisy-secret";
  const reading = secrets.open === it.id;
  const row = document.createElement("button");
  row.type = "button";
  row.className = "kulisy-fate-row kulisy-secret-row" + (it.open ? "" : " is-secret");
  row.setAttribute("aria-expanded", String(reading));
  const time = document.createElement("span");
  time.className = "kulisy-fate-time";
  time.textContent = fateTime(it.at);
  const what = document.createElement("span");
  what.className = "kulisy-fate-what";
  what.textContent = `${it.open ? "📖" : "✉️"} ${secretName(it)} · ${ft(`sl_${it.len}`).toLowerCase()}`;
  if (it.open) {
    const kind = document.createElement("b");
    kind.textContent = `${ft(`sk_${it.kind}`)} · ${ft(`tone_${it.size}`).toLowerCase()}`;
    what.append(" · ", kind);
  }
  const sub = document.createElement("span");
  sub.className = "kulisy-fate-sub";
  sub.textContent = ft(reading ? "secret_read" : it.open ? "secret_closed" : "secret_sealed");
  row.append(time, what, sub);
  row.addEventListener("click", () => toggleSecret(it.id));
  wrap.append(row);
  if (reading) {
    const story = document.createElement("div");
    story.className = "kulisy-secret-text";
    story.textContent = it.t;
    const arrival = document.createElement("div");
    arrival.className = "kulisy-secret-text kulisy-secret-arrival";
    arrival.hidden = !it.arr;
    arrival.textContent = it.arr ? `${ft("secret_arrival")} ${it.arr}` : "";
    const forget = document.createElement("button");
    forget.type = "button";
    const armed = secrets.forgetArmed === it.id;
    forget.className = "kulisy-clear kulisy-secret-forget" + (armed ? " is-armed" : "");
    forget.textContent = ft(armed ? "secret_forget_sure" : "secret_forget");
    forget.addEventListener("click", () => forgetSecret(it.id));
    wrap.append(story, arrival, forget);
  }
  return wrap;
}
// The open character's envelopes, "What happened to them? ›" and, under it, the form (lent to that row).
function renderSecrets() {
  paintScene();
  const chat = state.chat;
  const id = scene.open;
  const row = id && scene.rows[id];
  if (secrets.step && (!chat || !chat.slots.includes(secrets.step))) secrets.step = null;
  if (!row || !state.names[id]) {
    fel.secretForm.remove();
    return;
  }
  const start = secretsStart();
  const lens = start ? SECRET_START_LENS : SECRET_LENS;
  if (secrets.len && !lens.includes(secrets.len)) secrets.len = null;
  fel.secretLenLabel.textContent = ft(start ? "secret_len_start" : "secret_len");
  fel.secretLen.replaceChildren(
    ...lens.map((l) =>
      fateChip(ft(`sl_${l}`), l === secrets.len, () => {
        secrets.len = l;
        setSecretNote("");
        renderSecrets();
      }),
    ),
  );
  const upFirst = (text) => text.charAt(0).toLocaleUpperCase() + text.slice(1);
  fel.secretKind.replaceChildren(
    ...["any", ...SECRET_KINDS].map((k) =>
      fateChip(k === "any" ? ft("secret_any") : upFirst(ft(`sk_${k}`)), k === secrets.kind, () => {
        secrets.kind = k;
        renderSecrets();
      }),
    ),
  );
  fel.secretSize.replaceChildren(
    ...["deck", ...DECK_TONES].map((s) => {
      const pick = () => {
        secrets.size = s;
        renderSecrets();
      };
      return s === "deck" ? fateChip(ft("secret_size_deck"), secrets.size === s, pick) : deckToneChip(s, secrets.size === s, pick);
    }),
  );
  fel.secretGo.textContent = ft(secrets.busy ? "secret_busy" : "secret_ask");
  fel.secretGo.disabled = secrets.busy;
  const items =
    secrets.chatId && secrets.chatId === state.chatId
      ? secrets.data.items.filter((it) => it.who === id).sort((a, b) => b.at - a.at)
      : [];
  const nodes = [];
  if (items.length) nodes.push(sceneLabel(ft("secrets_label")));
  if (items.length > SECRET_KEEP) {
    const oldest = items[items.length - 1];
    const box = document.createElement("div");
    box.className = "kulisy-fate-armed kulisy-secret-over";
    const text = document.createElement("span");
    text.textContent = ft("secret_over", { name: secretName(oldest), n: SECRET_KEEP });
    const button = document.createElement("button");
    button.type = "button";
    const armed = secrets.forgetArmed === oldest.id;
    button.className = "kulisy-clear" + (armed ? " is-armed" : "");
    button.textContent = ft(armed ? "secret_forget_sure" : "secret_forget_old");
    button.addEventListener("click", () => forgetSecret(oldest.id));
    box.append(text, button);
    nodes.push(box);
  }
  if (items.length) {
    const list = document.createElement("div");
    list.className = "kulisy-secret-list";
    list.append(...items.map(secretRow));
    nodes.push(list);
  }
  const asking = secrets.step === id;
  const opener = document.createElement("button");
  opener.type = "button";
  opener.className = "kulisy-clear kulisy-secret-open";
  opener.dataset.state = asking ? "on" : "";
  opener.setAttribute("aria-expanded", String(asking));
  opener.textContent = `${ft("secret_go")} ${asking ? "▴" : "›"}`;
  opener.addEventListener("click", () => {
    secrets.step = asking ? null : id;
    secrets.who = id;
    setSecretNote("");
    renderSecrets();
  });
  nodes.push(opener);
  if (asking) nodes.push(fel.secretForm);
  else fel.secretForm.remove();
  row.secrets.replaceChildren(...nodes);
}
function resetSecrets() {
  secrets.chatId = null;
  secrets.data = { book: "", items: [] };
  secrets.who = null;
  secrets.step = null;
  secrets.len = null;
  secrets.kind = "any";
  secrets.size = "deck";
  fel.secretAbout.value = "";
  secrets.open = null;
  disarmSecretForget();
  setSecretNote("");
  if (secrets.offer && secrets.offer.chatId !== state.chatId) secrets.offer = null;
  paintSecretOffer();
}
function paintSecretOffer() {
  const o = secrets.offer;
  const show = !!(o && o.chatId === state.chatId && state.names[o.id] && !awayIds().includes(o.id));
  el.hereAsk.hidden = !show;
  el.hereAsk.textContent = show ? ft("secret_offer", { name: shortName(o.id) }) : "";
}
function openSecretOffer() {
  const o = secrets.offer;
  secrets.offer = null;
  paintSecretOffer();
  if (!o || o.chatId !== state.chatId) return;
  secrets.who = o.id;
  secrets.step = o.id;
  secrets.len = null;
  setSecretNote("");
  scene.open = o.id;
  if (page !== "scene") showPage("scene");
  renderScene();
  const row = scene.rows[o.id];
  if (row) requestAnimationFrame(() => row.wrap.scrollIntoView({ block: "start" }));
}
fel.secretGo.addEventListener("click", () => void askSecret());
el.hereAsk.addEventListener("click", openSecretOffer);

function deckToneChip(tone, on, onClick) {
  const chip = fateChip(ft(`tone_${tone}`), on, onClick);
  chip.dataset.tone = tone;
  return chip;
}

function renderDeck() {
  const data = deckHere() ? deck.data : { tone: "any", cards: [] };
  fel.deckTone.replaceChildren(
    ...["any", ...DECK_TONES].map((tone) =>
      deckToneChip(tone, data.tone === tone, () => {
        setDeckHint("");
        deckSave((d) => {
          d.tone = tone;
        });
      }),
    ),
  );
  // the Deck tab's "for the next reply" (where there is no move button): a pressed chip is taken back by a second tap
  const drawn = deckArmedHere();
  const shown = !!drawn && !drawn.a;
  fel.deckDraw.replaceChildren(
    fateChip(`🃏 ${ft("move_event")}`, shown, () => {
      if (!shown) return drawDeck();
      deck.pending = null;
      setDeckHint("");
      renderDeck();
    }),
  );
  const auto = deckHere() ? deck.auto.f : "off";
  fel.deckAuto.replaceChildren(
    ...["off", ...Object.keys(DECK_AUTO)].map((f) => fateChip(ft(`auto_${f}`), auto === f, () => setDeckAuto(f))),
  );
  const dry = auto !== "off" && !data.cards.some((c) => !c.used && (data.tone === "any" || c.tone === data.tone));
  fel.deckAutoHint.textContent = dry ? ft("deck_auto_dry") : "";
  fel.deckAutoHint.hidden = !dry;
  const armed = deckArmedHere();
  const p = armed && !armed.a ? armed : null; // the deck's own hand stays secret: no plate
  fel.deckArmed.hidden = !p;
  fel.deckArmedText.textContent = !p
    ? ""
    : p.s
      ? ft("deck_armed_secret")
      : ft(p.cards.length === 1 ? "deck_armed_one" : "deck_armed", { list: p.cards.map((c) => c.t).join(" · ") });
  const left = data.cards.filter((c) => !c.used).length;
  const where = !deckHere()
    ? ""
    : deck.folder
      ? ft("deck_where_folder_short", { name: deck.folder })
      : ft("deck_where_chat_short");
  const count = data.cards.length ? ft("deck_count", { left, all: data.cards.length }) : ft("deck_none");
  fel.deckCount.textContent = where ? `${count} · ${where}` : count;
  renderDeckList(data);
  paintDie();
}

function renderDeckList(data) {
  const open = fel.deckList.querySelector(".kulisy-deck-form textarea");
  const draft = open && open.dataset.card === deck.openCard ? open.value : null;
  if (deck.openCard && !data.cards.some((c) => c.id === deck.openCard)) deck.openCard = null;
  const nodes = [];
  if (!data.cards.length) {
    const empty = document.createElement("div");
    empty.className = "kulisy-hint";
    empty.textContent = ft("deck_list_empty");
    nodes.push(empty);
  }
  // 0.9.22 (Leah 19.10): the cards hide in three folded lists, one per size; an open card keeps its list open
  const toneOf = (card) => (DECK_TONES.includes(card.tone) ? card.tone : "cozy");
  const openCard = deck.openCard && data.cards.find((c) => c.id === deck.openCard);
  if (openCard) deck.groups.add(toneOf(openCard));
  if (deck.adding) deck.groups.add(deck.adding);
  for (const tone of DECK_TONES) {
    const cards = data.cards.filter((c) => toneOf(c) === tone);
    const isOpen = deck.groups.has(tone);
    const head = document.createElement("button");
    head.type = "button";
    head.className = "kulisy-deck-group";
    head.dataset.tone = tone;
    head.setAttribute("aria-expanded", String(isOpen));
    const dot = document.createElement("span");
    dot.className = "kulisy-deck-dot";
    dot.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "kulisy-deck-group-name";
    name.textContent = ft(`tone_${tone}`);
    const count = document.createElement("span");
    count.className = "kulisy-deck-group-count";
    count.textContent = cards.length
      ? ft("deck_group_count", { left: cards.filter((c) => !c.used).length, all: cards.length })
      : ft("deck_group_none");
    head.append(dot, name, count);
    head.addEventListener("click", () => {
      disarmDeckDelete();
      if (deck.groups.has(tone)) {
        deck.groups.delete(tone);
        if (openCard && toneOf(openCard) === tone) deck.openCard = null;
        if (deck.adding === tone) deck.adding = false;
      } else deck.groups.add(tone);
      saveDeckGroups();
      renderDeck();
    });
    nodes.push(head);
    if (isOpen) nodes.push(...deckCardRows(cards, draft), deckNewRow(tone));
  }
  fel.deckList.replaceChildren(...nodes);
  renderDeckTools(data);
}

function deckCardRows(cards, draft) {
  const nodes = [];
  for (const card of cards) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "kulisy-deck-card" + (card.used ? " is-used" : "");
    row.dataset.tone = card.tone;
    row.setAttribute("aria-expanded", String(deck.openCard === card.id));
    const dot = document.createElement("span");
    dot.className = "kulisy-deck-dot";
    dot.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "kulisy-deck-text";
    text.textContent = card.t;
    row.append(dot, text);
    row.addEventListener("click", () => {
      disarmDeckDelete();
      if (deck.openCard === card.id) {
        deck.openCard = null;
      } else {
        deck.openCard = card.id;
        deck.formTone = card.tone;
        deck.formUsed = !!card.used;
      }
      renderDeck();
    });
    nodes.push(row);
    if (deck.openCard === card.id) nodes.push(deckForm(card, draft));
  }
  return nodes;
}

function renderDeckTools(data) {
  const canShuffle = data.cards.some((c) => c.used);
  fel.deckShuffle.hidden = !canShuffle;
  fel.deckBulk.hidden = !deck.bulk;
  fel.deckBulkOpen.hidden = deck.bulk;
  const allArmed = deck.deleteArmed === "*all";
  const undo = deck.undo && deck.undo.chatId === deck.chatId ? deck.undo : null;
  fel.deckUndo.hidden = !undo;
  fel.deckUndoText.textContent = undo ? ft("deck_undo_text", { n: undo.cards.length }) : "";
  fel.deckClearAll.hidden = !data.cards.length || !!undo;
  fel.deckClearAll.classList.toggle("is-armed", allArmed);
  fel.deckClearAll.textContent = ft(allArmed ? "deck_clear_sure" : "deck_clear_all");
  const hasMore = canShuffle || !fel.deckClearAll.hidden;
  if (!hasMore) deck.more = false;
  fel.deckMore.hidden = !hasMore;
  fel.deckMore.setAttribute("aria-expanded", String(deck.more));
  fel.deckMoreBox.hidden = !deck.more;
}

// "+ New card" at the end of an open size list; a tap turns it into a field with "Add" and "Cancel" (0.9.24, Leah 20.10:
// the card's size is its list's, so no size chips). The field is one node, kept across redraws.
const deckAddForm = document.createElement("div");
deckAddForm.className = "kulisy-deck-add";
const deckNewField = document.createElement("textarea");
deckNewField.className = "kulisy-deck-new";
deckNewField.rows = 2;
deckNewField.maxLength = DECK_TEXT_MAX;
const deckAddActions = document.createElement("div");
deckAddActions.className = "kulisy-deck-actions";
const deckAddBtn = document.createElement("button");
deckAddBtn.type = "button";
deckAddBtn.className = "kulisy-send";
const deckAddCancel = document.createElement("button");
deckAddCancel.type = "button";
deckAddCancel.className = "kulisy-clear";
deckAddActions.append(deckAddBtn, deckAddCancel);
deckAddForm.append(deckNewField, deckAddActions);
deckAddBtn.addEventListener("click", addDeckCard);
deckAddCancel.addEventListener("click", () => {
  deck.adding = false;
  deckNewField.value = "";
  renderDeck();
});
deckNewField.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    addDeckCard();
  }
});
function deckNewRow(tone) {
  if (deck.adding === tone) {
    deckNewField.placeholder = ft("deck_new_ph");
    deckAddBtn.textContent = ft("deck_add");
    deckAddCancel.textContent = ft("deck_cancel");
    return deckAddForm;
  }
  const row = document.createElement("button");
  row.type = "button";
  row.className = "kulisy-deck-new-row";
  row.textContent = ft("deck_new_card");
  row.addEventListener("click", () => {
    disarmDeckDelete();
    if (deck.adding !== tone) deckNewField.value = "";
    deck.adding = tone;
    deck.openCard = null;
    renderDeck();
    deckNewField.focus();
  });
  return row;
}

function deckForm(card, draft) {
  const form = document.createElement("div");
  form.className = "kulisy-deck-form";
  const area = document.createElement("textarea");
  area.rows = 2;
  area.maxLength = DECK_TEXT_MAX;
  area.dataset.card = card.id;
  area.value = draft !== null ? draft : card.t;
  const tones = document.createElement("div");
  tones.className = "kulisy-mode-group kulisy-fate-chips";
  tones.append(
    ...DECK_TONES.map((tone) =>
      deckToneChip(tone, tone === deck.formTone, () => {
        deck.formTone = tone;
        renderDeck();
      }),
    ),
  );
  const used = document.createElement("label");
  used.className = "kulisy-person";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = deck.formUsed;
  box.addEventListener("change", () => {
    deck.formUsed = box.checked;
  });
  const usedText = document.createElement("span");
  usedText.textContent = ft("deck_used");
  used.append(box, usedText);
  const actions = document.createElement("div");
  actions.className = "kulisy-deck-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "kulisy-send";
  save.textContent = ft("deck_save");
  save.addEventListener("click", () => {
    const t = area.value.trim().slice(0, DECK_TEXT_MAX);
    if (!t) return area.focus();
    const tone = deck.formTone;
    const isUsed = deck.formUsed ? 1 : 0;
    deck.openCard = null;
    deckSave((d) => {
      const c = d.cards.find((x) => x.id === card.id);
      if (c) Object.assign(c, { t, tone, used: isUsed });
    });
  });
  const del = document.createElement("button");
  del.type = "button";
  del.className = "kulisy-clear kulisy-deck-delete";
  const armed = deck.deleteArmed === card.id;
  del.classList.toggle("is-armed", armed);
  del.textContent = ft(armed ? "deck_delete_sure" : "deck_delete");
  del.addEventListener("click", () => {
    if (deck.deleteArmed !== card.id) {
      deck.deleteArmed = card.id;
      if (deck.deleteTimer !== null) marinara.clearTimeout(deck.deleteTimer);
      deck.deleteTimer = marinara.setTimeout(() => {
        deck.deleteTimer = null;
        deck.deleteArmed = null;
        renderDeck();
      }, 3000);
      return renderDeck();
    }
    disarmDeckDelete();
    deck.openCard = null;
    // a deleted card leaves the hand that waits for a reply too
    const p = deckArmedHere();
    if (p) {
      p.cards = p.cards.filter((c) => c.id !== card.id);
      if (!p.cards.length) deck.pending = null;
    }
    deckSave((d) => {
      d.cards = d.cards.filter((x) => x.id !== card.id);
    });
  });
  actions.append(save, del);
  form.append(area, tones, used, actions);
  return form;
}

function disarmDeckDelete() {
  if (deck.deleteTimer !== null) marinara.clearTimeout(deck.deleteTimer);
  deck.deleteTimer = null;
  deck.deleteArmed = null;
}

function addDeckCard() {
  const t = deckNewField.value.trim().slice(0, DECK_TEXT_MAX);
  if (!t) return deckNewField.focus();
  if (!deckHere() || !deck.adding || deck.data.cards.length >= DECK_MAX) return;
  const card = { id: deckCardId(), t, tone: deck.adding, used: 0 };
  deckNewField.value = "";
  deckNewField.focus();
  deckSave((d) => {
    if (!d.cards.some((c) => c.id === card.id)) d.cards.push({ ...card });
  });
}

// "Paste a list" (Leah 18.10: players write cards ahead or have an AI write a batch). One card per line; a heading line
// with a size's name ("Minor:", "## Twist", "Встряска") sets the size of the lines under it, lines before any heading are
// minor; other lines ending in a colon are skipped. List marks, numbers, bold and quotes around a line are dropped; a card already in the deck (same words) is skipped.
const DECK_HEAD_STEMS = {
  cozy: ["мелоч", "minor", "small", "уют", "cozy"],
  tense: ["поворот", "twist", "тревог", "tense"],
  danger: ["встряск", "shake", "опасн", "danger"],
};
function deckHead(line) {
  const hashed = line.startsWith("#");
  const bare = line.replace(/^[#*_\s]+|[*_\s]+$/g, "");
  const colon = bare.endsWith(":");
  const words = bare.replace(/:$/, "").trim().split(/\s+/);
  if (!words[0] || words.length > 3 || !(hashed || colon || words.length === 1)) return null;
  const first = words[0].toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}]/gu, "");
  if (!first) return null;
  for (const tone of DECK_TONES) if (DECK_HEAD_STEMS[tone].some((stem) => first.startsWith(stem))) return tone;
  return null;
}
function deckLine(line) {
  return line
    .replace(/^\s*(?:[-*•–—+]+|\d+[.)])\s*/, "")
    .replace(/\*\*/g, "")
    .trim()
    .replace(/^[«"“„']+|[»"”']+$/g, "")
    .replace(/\.$/, "")
    .trim()
    .slice(0, DECK_TEXT_MAX);
}
function deckTextKey(text) {
  return String(text).toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}
function showBulkResult(text) {
  fel.deckBulkResult.textContent = text;
  fel.deckBulkResult.hidden = !text;
}
function showDeckBulk(on) {
  deck.bulk = on;
  showBulkResult("");
  renderDeck();
  if (on) fel.deckBulkText.focus();
}
function addDeckList() {
  if (!deckHere()) return;
  let tone = "cozy";
  const found = [];
  for (const raw of fel.deckBulkText.value.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const head = deckHead(line);
    if (head) {
      tone = head;
      continue;
    }
    if (/:[*_\s]*$/.test(line)) continue; // another heading, e.g. an AI's "Here are your cards:"
    const t = deckLine(line);
    if (t) found.push({ t, tone });
  }
  if (!found.length) return showBulkResult(ft("deck_bulk_none"));
  const have = new Set(deck.data.cards.map((c) => deckTextKey(c.t)));
  const cards = [];
  let dupes = 0;
  let full = 0;
  for (const c of found) {
    const key = deckTextKey(c.t);
    if (have.has(key)) dupes += 1;
    else if (deck.data.cards.length + cards.length >= DECK_MAX) full += 1;
    else {
      have.add(key);
      cards.push({ id: deckCardId(), t: c.t, tone: c.tone, used: 0 });
    }
  }
  if (cards.length) {
    deckSave((d) => {
      const seen = new Set(d.cards.map((c) => deckTextKey(c.t)));
      for (const c of cards) {
        if (d.cards.length >= DECK_MAX || seen.has(deckTextKey(c.t))) continue;
        seen.add(deckTextKey(c.t));
        d.cards.push({ ...c });
      }
    });
  }
  fel.deckBulkText.value = "";
  deck.bulk = false;
  renderDeck();
  const parts = [ft("deck_bulk_done", { n: cards.length })];
  if (dupes) parts.push(ft("deck_bulk_dupes", { n: dupes }));
  if (full) parts.push(ft("deck_bulk_full", { n: full, max: DECK_MAX }));
  showBulkResult(parts.join(" "));
}


function saveFateOption(key, value) {
  marinara.storage.patch({ [key]: value }).catch((error) => marinara.log.warn("Could not save the die option", error));
}

fel.deckCancel.addEventListener("click", () => {
  deck.pending = null;
  setDeckHint("");
  renderDeck();
});
fel.truthCancel.addEventListener("click", () => {
  truth.pending = null;
  setTruthHint("");
  renderTruth();
});
fel.deckMore.addEventListener("click", () => {
  deck.more = !deck.more;
  disarmDeckDelete();
  renderDeck();
});
fel.deckBulkOpen.addEventListener("click", () => showDeckBulk(true));
fel.deckBulkCancel.addEventListener("click", () => showDeckBulk(false));
fel.deckBulkAdd.addEventListener("click", addDeckList);
// "Remove all cards": the second tap within 3 s removes them (as "Delete" on a card)
fel.deckClearAll.addEventListener("click", () => {
  if (deck.deleteArmed !== "*all") {
    deck.deleteArmed = "*all";
    if (deck.deleteTimer !== null) marinara.clearTimeout(deck.deleteTimer);
    deck.deleteTimer = marinara.setTimeout(() => {
      deck.deleteTimer = null;
      deck.deleteArmed = null;
      renderDeck();
    }, 3000);
    return renderDeck();
  }
  disarmDeckDelete();
  deck.openCard = null;
  if (!deckHere()) return;
  deck.undo = { chatId: deck.chatId, cards: deck.data.cards.map((c) => ({ ...c })), pending: deckArmedHere() };
  if (deckArmedHere()) deck.pending = null;
  showBulkResult("");
  deckSave((d) => {
    d.cards = [];
  });
});
// "Bring back" (Leah 18.10: in case "Remove all" was tapped by accident): the removed cards return in front of any added
// since, with their "played" marks; a hand that was waiting for a reply waits again.
fel.deckUndoBtn.addEventListener("click", () => {
  const undo = deck.undo;
  deck.undo = null;
  if (!undo || undo.chatId !== deck.chatId || !deckHere()) return renderDeck();
  if (undo.pending && !deck.pending) deck.pending = undo.pending;
  deckSave((d) => {
    const have = new Set(d.cards.map((c) => c.id));
    d.cards = [...undo.cards.filter((c) => !have.has(c.id)).map((c) => ({ ...c })), ...d.cards].slice(0, DECK_MAX);
  });
});
fel.deckShuffle.addEventListener("click", () => {
  deckSave((d) => {
    for (const c of d.cards) c.used = 0;
  });
});
fel.surprise.addEventListener("change", () => {
  fate.surprise = fel.surprise.checked;
  saveFateOption("fateSurprise", fate.surprise);
});
fel.noDie.addEventListener("change", () => {
  fate.noDie = fel.noDie.checked;
  saveFateOption("fateNoDie", fate.noDie);
  ensureDie();
});
fel.devOn.addEventListener("change", () => {
  devMode = fel.devOn.checked;
  saveFateOption("devMode", devMode);
  paintPages();
  if (devMode) showPage("texts");
});
fateReady = true;
paintFateTexts();

// ---- handing the roll to Marinara's own requests ----

const originalFetch = window.fetch;
function requestPath(input) {
  try {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
    return new URL(url, location.href).pathname;
  } catch {
    return "";
  }
}

// Show the roll at once: put the saved extra into Marinara's cached copy of the message (no refetch mid-stream).
function patchCachedExtra(chatId, messageId, extra) {
  const client = findQueryClient();
  if (!client) return;
  client.setQueryData(["chats", "messages", chatId], (data) => {
    if (!data || !Array.isArray(data.pages)) return data;
    return {
      ...data,
      pages: data.pages.map((page) =>
        Array.isArray(page)
          ? page.map((m) =>
              m && m.id === messageId ? { ...m, extra: typeof m.extra === "string" ? JSON.stringify(extra) : extra } : m,
            )
          : page,
      ),
    };
  });
}

// The usual group order: Marinara's /generate creates the user's message on the server — find it by the request's
// submissionId and write the roll to it.
async function markFateMessage(p, submissionId) {
  for (const wait of [400, 1200, 3000, 8000]) {
    await new Promise((resolve) => marinara.setTimeout(resolve, wait));
    try {
      const messages = await api(chatPath(p.chatId, "/messages?limit=12"));
      const found = (Array.isArray(messages) ? messages : []).find((m) => {
        if (m.role !== "user") return false;
        const extra = parseMaybeJson(m.extra, {}) || {};
        return submissionId ? extra.submissionId === submissionId : msTime(m.createdAt) >= p.at - 2000;
      });
      if (!found) continue;
      const extra = parseMaybeJson(found.extra, {}) || {};
      const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
      if (kulisy.fate) return;
      const next = { ...kulisy, fate: fateRecord(p) };
      await api(chatPath(p.chatId, `/messages/${encodeURIComponent(found.id)}/extra`), {
        method: "PATCH",
        body: JSON.stringify({ kulisy: next }),
      });
      patchCachedExtra(p.chatId, found.id, { ...extra, kulisy: next });
      scheduleBadges();
      scheduleFateLog();
      return;
    } catch (error) {
      marinara.log.warn("Could not mark the roll on the message", error);
    }
  }
}

function restorePending(p) {
  if (!fate.pending) fate.pending = p;
  paintDie();
}

function fateGenerate(input, init, p) {
  const body = JSON.parse(init.body);
  // a regenerate gets the guide back from Marinara itself; continue / impersonate are not the attempt's reply
  if (body.chatId !== p.chatId || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
  const guide = fateGuide(p);
  const own = typeof body.generationGuide === "string" && body.generationGuide.trim() ? body.generationGuide : "";
  body.generationGuide = own ? `${own}\n\n${guide}` : guide;
  if (!body.generationGuideSource) body.generationGuideSource = "guide";
  fate.pending = null;
  paintDie();
  const withMessage = !p.msgDone && typeof body.userMessage === "string" && body.userMessage.trim() !== "";
  const request = sendOut(input, { ...init, body: JSON.stringify(body) });
  // Marinara puts the text back into the box after a failed send — the same roll waits for the retry
  request.then(
    (response) => {
      if (!response.ok) restorePending(p);
      else if (withMessage) void markFateMessage(p, body.submissionId);
    },
    () => restorePending(p),
  );
  return request;
}

// The Manual group order: send only creates the user's message — the roll is written into it right away and waits
// for the generation from the character picker.
function fateMessage(input, init, p) {
  const body = JSON.parse(init.body);
  if (body.role !== "user") return null;
  const extra = body.extra && typeof body.extra === "object" ? body.extra : {};
  if (extra.kulisy) return null; // the panel's own whisper
  body.extra = { ...extra, kulisy: { fate: fateRecord(p) } };
  p.msgDone = true;
  return sendOut(input, { ...init, body: JSON.stringify(body) });
}

// ---- the whisper on its way (0.9.21): the user's next message in the chat becomes the whisper ----
// Hidden from everyone not checked (and from those away). "What everyone sees", if written, goes first as its own
// message. The usual group order: Marinara's /generate would create the message itself, unhidden, and build the reply
// from it at once — so the message is posted here first (with Marinara's submissionId and the same text: its send
// finds the turn arrived) and /generate goes on without a message, like an empty send. Manual order: Marinara's own
// POST of the message gets the hiding added.
function whisperRequest(input, init) {
  const plan = whisperHere();
  if (!plan || !state.chat || !init || typeof init.body !== "string") return null;
  if (String(init.method || "GET").toUpperCase() !== "POST") return null;
  const path = requestPath(input);
  const body = JSON.parse(init.body);
  if (path === "/api/generate") {
    if (body.chatId !== plan.chatId || body.regenerateMessageId || body.continueMessageId || body.impersonate) return null;
    if (body.pendingSpatialTransition || typeof body.userMessage !== "string" || !body.userMessage.trim()) return null;
    return { plan, body, generate: true };
  }
  if (path !== `/api/chats/${plan.chatId}/messages` || body.role !== "user") return null;
  const extra = body.extra && typeof body.extra === "object" ? body.extra : {};
  const kulisy = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
  if (kulisy.kind || kulisy.away) return null; // Offstage's own message
  return { plan, body, generate: false };
}
function whisperHiding() {
  const heard = new Set(whisperHearers());
  const away = awayIds();
  const kulisy = { kind: "whisper", turn: 1 }; // turn: the deck's "draws by itself" counts it (whisperHalf)
  if (away.length) kulisy.away = away;
  return { hiddenFromAICharacterIds: state.chat.characterIds.filter((id) => !heard.has(id)), kulisy };
}
// "What everyone sees": hidden only from those away; kind "all" — the whisper's public half
function allLine(chatId, text) {
  const away = awayIds();
  const kulisy = { kind: "all" };
  const extra = { kulisy };
  if (away.length) {
    kulisy.away = away;
    extra.hiddenFromAICharacterIds = away;
  }
  return { chatId, role: "user", characterId: null, content: text, extra };
}
async function postOwnMessage(chatId, init, body) {
  const headers = new Headers((init && init.headers) || {});
  headers.set("Content-Type", "application/json");
  headers.set("x-marinara-csrf", "1");
  headers.delete("Accept");
  const response = await originalFetch.call(window, chatPath(chatId, "/messages"), {
    method: "POST",
    headers,
    credentials: (init && init.credentials) || "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Offstage: the whisper was not saved (${response.status})`);
  return response.json();
}
async function postAllLine(plan, init) {
  if (!plan.all) return;
  await postOwnMessage(plan.chatId, init, allLine(plan.chatId, plan.all));
  plan.all = "";
  whisper.all = "";
}
// "write the whisper in the box" goes once the whisper is sent or taken back
function dropHint() {
  if (fate.flash && fate.flash.classList.contains("is-hint")) showFlash("", "");
}
function whisperSent(plan) {
  if (whisper.plan === plan) whisper.plan = null;
  dropHint();
  paintDie();
  scheduleBadges();
}
async function whisperGenerate(input, init, w) {
  const { plan, body } = w;
  const hiding = whisperHiding();
  await postAllLine(plan, init);
  const extra = { ...hiding };
  if (body.submissionId) extra.submissionId = body.submissionId;
  if (Array.isArray(body.attachments) && body.attachments.length) extra.attachments = body.attachments;
  if (body.replyTo) extra.replyTo = body.replyTo;
  await postOwnMessage(plan.chatId, init, {
    chatId: plan.chatId,
    role: "user",
    characterId: null,
    content: body.userMessage,
    extra,
  });
  whisperSent(plan);
  const next = { ...body, userMessage: null };
  delete next.attachments;
  delete next.replyTo;
  delete next.submissionId;
  return originalFetch.call(window, input, { ...init, body: JSON.stringify(next) });
}
async function whisperMessage(input, init, w) {
  const { plan, body } = w;
  const hiding = whisperHiding();
  const extra = body.extra && typeof body.extra === "object" ? body.extra : {};
  const own = extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy : {};
  const next = {
    ...body,
    extra: { ...extra, hiddenFromAICharacterIds: hiding.hiddenFromAICharacterIds, kulisy: { ...own, ...hiding.kulisy } },
  };
  await postAllLine(plan, init);
  const response = await originalFetch.call(window, input, { ...init, body: JSON.stringify(next) });
  if (response.ok) whisperSent(plan);
  return response;
}
function sendOut(input, init) {
  let w = null;
  try {
    w = whisperRequest(input, init);
  } catch (error) {
    marinara.log.warn("Could not check the request for the whisper", error);
  }
  if (!w) return originalFetch.call(window, input, init);
  return w.generate ? whisperGenerate(input, init, w) : whisperMessage(input, init, w);
}

// A roll on the user's last message that nobody has answered (the reply was deleted and someone else was called, Leah
// 18.10): the next reply gets the outcome too. Not for a new message of the user, a regenerate (Marinara replays its own
// guide), continue / impersonate, or a request that already carries a roll (a character's attempt).
const FATE_ANY_ROLL = ["броском кубика", "by a die roll"];
function wantsCarry(body) {
  if (!body || typeof body.chatId !== "string" || body.regenerateMessageId || body.continueMessageId || body.impersonate) return false;
  if (typeof body.userMessage === "string" && body.userMessage.trim()) return false;
  const own = typeof body.generationGuide === "string" ? body.generationGuide : "";
  return !FATE_ANY_ROLL.some((mark) => own.includes(mark)) && !guideFromOwn(own, ["fate:guide", "fate:guide_char"]);
}
async function fateCarryGenerate(input, init, body) {
  try {
    const messages = await api(chatPath(body.chatId, "/messages?limit=1"));
    const last = Array.isArray(messages) ? messages[messages.length - 1] : null;
    const extra = last && last.role === "user" ? parseMaybeJson(last.extra, {}) || {} : null;
    const f = extra && extra.kulisy && typeof extra.kulisy === "object" ? extra.kulisy.fate : null;
    if (f && !f.who && FATE_EDGES[f.d] && FATE_OUTCOMES.includes(f.o)) {
      const guide = fateGuide({ o: f.o, lang });
      const own = typeof body.generationGuide === "string" && body.generationGuide.trim() ? body.generationGuide : "";
      body.generationGuide = own ? `${own}

${guide}` : guide;
      if (!body.generationGuideSource) body.generationGuideSource = "guide";
      init = { ...init, body: JSON.stringify(body) };
    }
  } catch (error) {
    marinara.log.warn("Could not check the last message for a roll", error);
  }
  return originalFetch.call(window, input, init);
}

function routeFetch(input, init) {
  let hand = null;
  let auto = null;
  try {
    hand = deckHandRequest(input, init);
  } catch (error) {
    marinara.log.warn("Could not check the request for the last hand", error);
  }
  try {
    auto = deckAutoRequest(input, init);
  } catch (error) {
    marinara.log.warn("Could not check the request for the deck's own draw", error);
  }
  if ((hand && hand.before) || auto) {
    // a hand whose reply was deleted comes back first; the deck draws by itself only if nothing waits
    const ready = (hand && hand.before ? checkHands(hand.chatId, hand.newTurn) : Promise.resolve()).then(() =>
      auto ? deckAutoCheck(auto) : null,
    );
    return ready.then(
      () => offstageFetch(input, init),
      () => offstageFetch(input, init),
    );
  }
  if (!hand) return offstageFetch(input, init);
  const request = offstageFetch(input, init);
  request.then(
    (response) => {
      if (response.ok) void checkHands(hand.chatId, hand.newTurn);
    },
    () => {},
  );
  return request;
}
window.fetch = function (input, init) {
  const method = String((init && init.method) || "GET").toUpperCase();
  const path = requestPath(input);
  if (method === "POST" && path === "/api/generate" && init && typeof init.body === "string") {
    let chatId = null;
    try {
      chatId = JSON.parse(init.body).chatId;
    } catch {
      chatId = null;
    }
    if (typeof chatId === "string" && chatId) return checkNewcomers(chatId).then(() => routeFetch(input, init));
  }
  const request = routeFetch(input, init);
  const cast = method === "PATCH" && /^\/api\/chats\/([^/]+)$/.exec(path);
  if (cast && init && typeof init.body === "string" && init.body.includes('"characterIds"')) {
    request.then(
      (response) => {
        if (response.ok) void checkNewcomers(decodeURIComponent(cast[1]));
      },
      () => {},
    );
  }
  return request;
};
function offstageFetch(input, init) {
  let drawn = null; // the deck's cards handed to this request
  let asked = null; // the truth roll handed to this request
  if (init && typeof init.body === "string" && String(init.method || "GET").toUpperCase() === "POST") {
    try {
      planTurn(input, init);
    } catch (error) {
      marinara.log.warn("Could not roll the attempt for the turn", error);
    }
    try {
      const path = requestPath(input);
      if (path === "/api/generate" && deck.pending) {
        const p = deck.pending;
        const next = deckGenerate(init, p);
        if (next) {
          init = next;
          drawn = p;
        }
      }
    } catch (error) {
      marinara.log.warn("Could not add the drawn cards to the request", error);
    }
    try {
      if (requestPath(input) === "/api/generate" && truth.pending) {
        const p = truth.pending;
        const next = truthGenerate(init, p);
        if (next) {
          init = next;
          asked = p;
        }
      }
    } catch (error) {
      marinara.log.warn("Could not add the truth roll to the request", error);
    }
    try {
      const path = requestPath(input);
      const p = fate.pending;
      if (p) {
        let handled = null;
        if (path === "/api/generate") handled = fateGenerate(input, init, p);
        else if (!p.msgDone && path === `/api/chats/${p.chatId}/messages`) handled = fateMessage(input, init, p);
        if (handled) return watchDeck(handled, drawn, asked);
      }
      if (path === "/api/generate") {
        const body = JSON.parse(init.body);
        if (wantsCarry(body)) return watchDeck(fateCarryGenerate(input, init, body), drawn, asked);
      }
    } catch (error) {
      marinara.log.warn("Could not add the roll to the request", error);
    }
  }
  return watchDeck(sendOut(input, init), drawn, asked);
}

document.addEventListener("pointerdown", onFateOutside, true);
document.addEventListener("keydown", onFateEscape);
window.addEventListener("click", onSendClick, true);
window.addEventListener("keydown", onSendKey, true);
window.addEventListener("marinara:generation-complete", onGenerationComplete);
window.addEventListener("marinara:generation-error", onGenerationError);

// ---------- markers on hidden messages ----------
// For the user's eyes only: written to an attribute on the bubble and drawn by CSS; the model
// never sees it. 🔒 — hidden from those who were away; 🤫 heard by: … — whispers and other
// partial hiding.

function shortName(id) {
  const name = state.names[id] || "";
  // a card with a cast is a group ("The Smiths") — its first word alone would say nothing
  if (state.cast[id]) return name || "?";
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
    const extra = extras ? extras.get(row.getAttribute("data-message-id")) : null;
    const label = [fateBadge(extra), badgeFor(extra)].filter(Boolean).join(" · ") || null;
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

const observer = new MutationObserver(() => {
  scheduleBadges();
  ensureDie();
  if (PHONE.matches && state.chatId && !topBtn.isConnected) ensureTopButton();   // Marinara redrew its top bar
});
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
    el.who.textContent = "";
    ear.entries = {};
    renderEar();
    feel.data = {};
    feel.entries = {};
    feel.loaded = false;
    scene.open = null;
    feel.rowState = {};
    mode.data = {};
    mode.entries = {};
    mode.loaded = false;
    mode.status = { text: "", kind: "" };
    renderScene();
    for (const button of [el.hereClear, el.whoClear, el.modeClear, el.earClear, el.hereAsk]) button.hidden = true;
    paintModeStatus();
    paintModeHead();
    setStatus("");
  }
  showTab();
  if (changed) {
    closeFatePop();
    ensureDie();
    paintDie();
    fate.log = [];
    fate.logChat = null;
    fate.logError = false;
    deck.more = false;
    deck.adding = false;
    deck.undo = null;
    deck.openCard = null;
    deck.chatId = null;
    disarmDeckDelete();
    deckNewField.value = "";
    fel.deckBulkText.value = "";
    deck.bulk = false;
    showBulkResult("");
    setDeckHint("");
    resetSecrets();
    renderFatePages();
    loadDeck();
    void loadSecrets();
    if (state.open && page === "log") void loadFateLog();
  }
  if (!chatId) return;
  const seq = ++loadSeq;
  const modeVersion = mode.version;
  try {
    const chat = await loadChat(chatId);
    if (seq !== loadSeq || state.chatId !== chatId) return;
    // The "in their ear" lorebook may have just been created while metadata is not re-read yet.
    if (!chat.earLorebookId && state.chat && state.chat.earLorebookId) chat.earLorebookId = state.chat.earLorebookId;
    // Emotions are read from metadata only when a chat opens — after that the panel owns them.
    if (changed) feel.data = sanitizeFeelings(chat.feelingsRaw, chat.slots);
    // Mode is re-read while the panel is open too (it may have been changed on another device),
    // but only if nothing was tapped here in the meantime.
    let modeChanged = false;
    if (changed || (mode.version === modeVersion && !mode.queued && !mode.saving && !mode.metaDirty)) {
      const fresh = sanitizeMode(chat.modeRaw, chat.slots);
      if (changed || JSON.stringify(fresh) !== JSON.stringify(mode.data)) {
        mode.data = fresh;
        modeChanged = true;
      }
    }
    const before = JSON.stringify(state.chat);
    const castBefore = state.chat && !changed ? state.chat.characterIds.join(",") : null;
    state.chat = chat;
    if (castBefore !== chat.characterIds.join(",")) void checkNewcomers(chatId);
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

async function togglePanel() {
  state.open = !state.open;
  showTab();
  if (!state.open) return;
  deck.more = false;
  deck.adding = false;
  deck.undo = null;
  renderFatePages();
  loadPage();
  void loadSecrets();
  await syncChat(true);
  const chatId = state.chatId;
  if (!chatId) return;
  await refreshLanguage();
  void earQueue(() => loadEar(chatId));
}
tab.addEventListener("click", () => void togglePanel());
topBtn.addEventListener("click", () => void togglePanel());
const onPhoneChange = () => showTab();
PHONE.addEventListener("change", onPhoneChange);
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
  for (const node of [panel, tab, topBtn]) if (node.contains(target)) return;
  if (pinnedOpen()) return; // a pinned panel stays, and the tap reaches the chat
  state.open = false;
  showTab();
  // The top bar never lies under the panel: a tap there (e.g. the Damask theme's palette button) still works.
  const hit = target instanceof Element ? target : target.parentElement;
  if (!hit?.closest(".mari-topbar")) swallowClickUntil = Date.now() + 700;
}
function onSwallowClick(event) {
  if (Date.now() > swallowClickUntil) return;
  swallowClickUntil = 0;
  event.preventDefault();
  event.stopPropagation();
}
function onEscape(event) {
  if (event.key !== "Escape" || !state.open || panel.hidden) return;
  if (pinnedOpen()) return;
  state.open = false;
  showTab();
}
document.addEventListener("pointerdown", onOutsidePointer, true);
document.addEventListener("click", onSwallowClick, true);
document.addEventListener("keydown", onEscape);
window.addEventListener("concept-leya:menu", onThemeMenu);
window.addEventListener("resize", onViewportChange);
if (window.visualViewport) window.visualViewport.addEventListener("resize", onViewportChange);
window.addEventListener("marinara:chat-visual-viewport-change", onKeyboardViewport);
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
  window.removeEventListener("concept-leya:menu", onThemeMenu);
  window.removeEventListener("resize", onViewportChange);
  if (window.visualViewport) window.visualViewport.removeEventListener("resize", onViewportChange);
  window.removeEventListener("marinara:chat-visual-viewport-change", onKeyboardViewport);
  el.head.removeEventListener("pointerdown", onHeadDown);
  el.head.removeEventListener("pointermove", onHeadMove);
  el.head.removeEventListener("pointerup", onHeadUp);
  el.head.removeEventListener("pointercancel", onHeadUp);
  el.head.removeEventListener("dblclick", onHeadDouble);
  if (panelShown) {
    panelShown = false;
    document.documentElement.classList.remove("offstage-open");
    window.dispatchEvent(new CustomEvent("offstage:panel", { detail: { open: false } }));
  }
  observer.disconnect();
  if (window.fetch !== originalFetch) window.fetch = originalFetch;
  document.removeEventListener("pointerdown", onFateOutside, true);
  document.removeEventListener("keydown", onFateEscape);
  window.removeEventListener("click", onSendClick, true);
  window.removeEventListener("keydown", onSendKey, true);
  window.removeEventListener("marinara:generation-complete", onGenerationComplete);
  window.removeEventListener("marinara:generation-error", onGenerationError);
  if (fate.flashTimer !== null) marinara.clearTimeout(fate.flashTimer);
  if (fate.flash) fate.flash.remove();
  if (fate.pop) fate.pop.remove();
  if (fate.die) fate.die.remove();
  if (fate.chips) fate.chips.remove();
  if (fate.logTimer !== null) marinara.clearTimeout(fate.logTimer);
  if (deck.deleteTimer !== null) marinara.clearTimeout(deck.deleteTimer);
  delete document.documentElement.dataset.offstageLook;
  if (unsubscribeCache) unsubscribeCache();
  Storage.prototype.setItem = originalSetItem;
  Storage.prototype.removeItem = originalRemoveItem;
  for (const node of document.querySelectorAll("[data-kulisy-note]")) node.removeAttribute("data-kulisy-note");
  tab.remove();
  topBtn.remove();
  PHONE.removeEventListener("change", onPhoneChange);
  panel.remove();
});

marinara.log.info(`Offstage ${VERSION} loaded`);
