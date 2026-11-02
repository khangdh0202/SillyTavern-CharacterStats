# Character State — User Guide

[🌐 English](USER_GUIDE.md) | [🇻🇳 Tiếng Việt](USER_GUIDE.vi.md) · ← Back to [README](README.md)

The complete manual for the Character State extension: every feature, every setting, explained step by step.

---

## Table of contents

1. [Core concept: card defaults vs chat runtime](#1-core-concept)
2. [Getting started](#2-getting-started)
3. [The sheet interface](#3-the-sheet-interface)
4. [Stats in depth](#4-stats-in-depth)
5. [Custom data](#5-custom-data)
6. [Skills & inventory](#6-skills--inventory)
7. [Effects](#7-effects)
8. [The game clock](#8-the-game-clock)
9. [How the AI updates state](#9-how-the-ai-updates-state)
10. [Side NPCs](#10-side-npcs)
11. [Scenes](#11-scenes)
12. [The {{user}} sheet](#12-the-user-sheet)
13. [Relationships](#13-relationships)
14. [AI Sheet Designer (armed mode)](#14-ai-sheet-designer-armed-mode)
15. [Event cards](#15-event-cards)
16. [Audit log](#16-audit-log)
17. [Snapshots & timeline](#17-snapshots--timeline)
18. [Presets, components & field copy/paste](#18-presets-components--field-copypaste)
19. [Stat history graphs](#19-stat-history-graphs)
20. [Group chats](#20-group-chats)
21. [Data safety: journal, rollback, recovery](#21-data-safety)
22. [Settings reference](#22-settings-reference)
23. [FAQ & troubleshooting](#23-faq--troubleshooting)

---

## 1. Core concept

There are **two layers** of data, and understanding them explains 90% of how the extension behaves:

| Layer | Where it lives | Who changes it |
| --- | --- | --- |
| **Card defaults** (the schema + starting values) | Inside the character card itself | Only you — via Edit ▸ *Edit the card defaults (new chats)*, ⋯ ▸ *Save this chat as the card defaults…*, paste, or recovery |
| **Chat runtime** (the live state of this story) | Inside the current chat's save data | You (Edit ▸ *Edit this chat's state*) and the AI (state updates) |

- Opening a **new chat** seeds the runtime from the card defaults.
- Editing the **card** never touches an existing chat. Editing the **chat runtime** never touches the card.
- To make a change permanent for all future chats: change it in the chat, then choose **⋯ ▸ Save this chat as the card defaults…**.
- Deleting all stats in the chat editor (Edit ▸ *Edit this chat's state*) is respected as an intentional wipe — the extension will not silently restore them from the card (in this chat; new chats still seed from the card).

## 2. Getting started

1. Install: in SillyTavern open the **Extensions** panel → click **Install extension**, paste `https://github.com/khangdh0202/SillyTavern-CharacterStats` and install (for this user or for all users). Manual alternative: copy the repo into `data/<user-handle>/extensions/` or `public/scripts/extensions/third-party/`, then reload SillyTavern.
2. Open any chat. A sheet button appears above the input box.
3. If your card has no sheet yet, either build one in the editor (**Edit ▸ Edit the card defaults (new chats)**), or use the AI Sheet Designer (section 14).
4. Play. The AI now reads the state every turn and keeps it updated — every applied change appears as a small card in the chat.

## 3. The sheet interface

Open the sheet with the **Character Sheet** button above the input box, the entry in ST's wand (Extensions) menu, or the `/cs-sheet [name]` slash command. The header keeps six controls:

| Control | What it does |
| --- | --- |
| 🕐 clock | Game clock: view, adjust manually, pause |
| **Edit ▾** | *This chat's state* (values, definitions, skills, items, custom text) or *Card defaults* (new chats; the current chat is not modified) |
| **History ▾** | Change log (JSON/CSV export), timeline, snapshots, take a snapshot now |
| **World ▾** | World overview, scenes, add a side NPC, create the {{user}} sheet (once) |
| **⋯** | Copy / paste schema, presets, components · save this chat as the card defaults, reset this chat from the card, fold Mod into Base · token estimate · settings |
| ✕ | Close (or press **Esc**) |

The content is split into tabs with counts: **Stats · Effects · Skills · Inventory · Relations · Custom**.

- **Stats**: one row per stat with its effective value, max, unit, a trend arrow (last change) and a progress bar. Tap a row to see Base / Mod / effect bonus and the description; tap the stat name for its history graph. Use the group pills (with an **All** pill) and the **Filter stats…** box to find a stat quickly.
- **Effects**: active buffs/debuffs/conditions with their deltas and time left; tap one to edit, ✕ to remove, **Add effect** to create one.
- An empty sheet shows three ways to build one: by hand, by pasting a schema, or by letting the AI design it.
- **Quick adjust**: inside a row's details, **−/+** changes the value by 1 (Shift: 10) and **Set…** types an exact value; choice stats get a dropdown, booleans a toggle. A burst of taps becomes one change-log entry.
- **★ Pin** a stat to show it as a bar at the top of the Stats tab and in the **HUD** above the chat input (pinned stats of the chat's characters and {{user}}, with the last change; click to open the sheet).
- **Relations** tab: every relationship of this entity (outgoing and incoming); add one with a type (suggestions from labels already used), a target and optional `key=value` notes, or delete one.

Inside the **edit mode** you get the same tabs (except Effects and Relations) plus: add / edit / delete individual stats, **🗑 Clear All** (removes every stat row — then press **Save** to keep), drag-and-drop ordering (☷), insert above/below (⤒/⤓), ▣ Select for multi-field copy. Leaving with unsaved input (Esc or a click outside) asks first.

On a phone the sheet is full-screen, menus open as bottom sheets and editor rows stack vertically.

## 4. Stats in depth

A stat definition supports these fields (all optional except name/type):

| Field | Meaning |
| --- | --- |
| `type` | `number` · `boolean` · `choice` (requires options) · `text` |
| `base` | The "real" value (what the card starts with) |
| `mod` | A floating adjustment the AI typically plays with (displayed value = base + mod + effect deltas) |
| `min` / `max` | Limits (0/0 or empty = unlimited) |
| `unit` | Display unit (¥, kg, HP…) |
| `progressBar` | Show a bar for number stats; second color when the value crosses zero |
| `options` | The choice list for `choice` stats |
| `description` | Shown on the sheet and injected into the AI's context |
| `group` | Tab label (display only) |
| `onChange` | Auto-trigger name fired when this stat changes |
| `triggers` | Automatic events (see below) |
| `syncCustom` | Manual stat ⇄ custom-data pairing |
| `aiBaseEdit` | **The key that unlocks Base/min/max for the AI** |

**How AI edits work.** By default the AI can only add deltas (plus/minus on `mod`) and set boolean/choice/text values. A stat flagged `aiBaseEdit` additionally allows the AI to move its Base and limits — use this for things that should grow permanently (level-ups, permanent damage, age).

**Triggers.** Each stat can carry automatic events, e.g. *"when effective value ≤ 0 → show a toast"*. They are edge-triggered (fire once when the condition turns true) and executed by the extension, not the AI.

**Sync pairs.** When a stat is an aggregate of custom-data counters (e.g. `Cash` ↔ `wallet.balance`), the extension detects the pairing automatically and shows a SYNC MAP in the AI's context so both sides stay consistent. Un-detected pairs can be declared manually via `syncCustom`.

## 5. Custom data

Custom data is free-form JSON per character — quest trackers, hidden thoughts, event history, anything.

- You edit it via the sheet's custom text area (accepts pretty JSON; invalid JSON refuses to save).
- The AI updates it through the state-update protocol with a deep merge: it can add new keys following your existing structure, never delete or rename yours.
- Keys with dots are automatically converted into nested objects.
- A set of automatic guards stops the AI from polluting the data: duplicating a stat as a custom key, inventing near-duplicate keys, overwriting a scalar with an object (or vice versa), or forking an existing tracker under a slightly different name. Every rejection comes with an explanation the AI receives next turn.
- Individual fields can be flagged **hidden** so they stay out of the AI's context (you and the sheet still see them).

## 6. Skills & inventory

- **Skills**: name + description list, added/updated by the AI or by you.
- **Inventory**: items with quantity and description. An item can be `equippable`; equipping it can grant **effects** (section 7) that apply while equipped.
- Both are full citizens of the state-update protocol: the AI can add, update and remove them.

## 7. Effects

Effects are temporary modifiers kept **separate** from base/mod:

- Each has a name, a source (`buff`, `debuff`, `item`, `skill`, `condition`), the stats it modifies, a duration in **turns** or **in-game minutes**, and a description.
- Turn-based effects tick down every AI reply; minute-based ones expire against the game clock. If the clock is stale, minute effects freeze rather than guess.
- **Stacking**: an effect can stack (adding increases the stack count up to a cap) or refresh (re-applying resets its timer).
- Expired effects are removed automatically, logged, and shown in an event card.
- Add/remove manually from the sheet's effect chips, or let the AI do it.

## 8. The game clock

- The clock counts **in-game minutes** from the story's start, per chat. The badge shows the calendar view, e.g. **Day 3 · 22:07** (a ⏸ icon when paused).
- The AI advances it every turn. Going backwards is rejected. Forgetting to send time freezes the clock (marked *stale*) — it never invents time on its own.
- Click the badge to open the clock editor: day / hour / minute fields, **+10 min · +1 hour · +8 hours (sleep) · Next morning**, a live preview, **Pause** (the AI cannot change the time) and the **Calendar** (day length, hour a day starts, days per season, season names).
- Swiping or deleting a message restores the clock to match.

## 9. How the AI updates state

You don't need to memorize any of this to play — but knowing it helps you write better instructions for your AI.

- The extension injects a compact, always-current view of the state into the AI's context every turn, together with a strict protocol.
- The AI answers normally, then reports its changes through a structured update (or a tool call, when your model supports function calling — detected automatically).
- The extension validates everything: unknown stat keys are rejected (with the closest real keys suggested), values are clamped to limits, permissions are checked, and any rejection becomes a short "notice" the AI reads next turn so it can self-correct.
- The AI can also: query recent changes on demand, create side NPCs / scenes / the user sheet (only when you asked), advance time with semantic ops, and register relationships.
- If the model supports native tool calling it gets proper tools; otherwise it writes simple text blocks — both paths are equal, and text tool calls written inside the message are executed too (with de-duplication).
- Several safety recoveries exist for common model failures: a state update cut off by the token limit is salvaged and partially applied; blocks mimicking the system's own event markers are discarded (never applied) with a lesson attached.

**Multiple characters at once**: one update can target several characters — handy in group scenes.

**AI tools.** When native tool calling is available, the AI gets these tools (the same actions also work when written as text tool calls):

| Tool | What it does |
| --- | --- |
| `state_get` | Read one entity's current state (compact: stats, skills, inventory, effects, custom data); `path` drills into one subtree |
| `state_update` | Apply state changes with semantic stat objects (deltas, or Base/limits for `aiBaseEdit` stats), plus skills, inventory, effects and custom data |
| `state_history` | Read the recorded value history of an entity's stats (trends, past values) |
| `state_create_npc` | Create a chat-local side NPC with its starting state — only when you asked for it |
| `state_create_sheet` | Design a character's stat sheet — only while the AI Sheet Designer is armed (section 14) |
| `state_add_effect` | Add one timed effect (buff, debuff, item, skill, condition) with stat deltas and a duration |
| `state_remove_effect` | Remove active effects by name or id |
| `state_advance_time` | Advance the game clock by minutes, or by sleep / travel / skip; never backwards, frozen while paused |
| `state_relationships` | List, add/update or remove relationship edges between entities |

The classic `UpdateCharacterState` tool (one call per entity) is registered as well.

## 10. Side NPCs

Side NPCs are chat-local characters without a card: a bartender, a rival, a temporary companion.

- Created **only on your explicit request** — tell the AI in chat, or use **World ▸ Add side NPC**.
- Their schema is inherited from the majority of your existing characters; with nothing to inherit, the stats the AI provides at creation become the sheet.
- They appear in the sheet selector, can be targeted by state updates, and are limited to 10 per chat.
- Deleting one keeps its registry entry so a swipe-rollback can restore it. Cards and {{user}} can never be created or deleted by the AI.

## 11. Scenes

A scene is a named location/state (`scene:…`) holding free-form data: where the story is, weather, danger level — whatever you want.

- Created only when you explicitly ask (`SCENE_CREATE`); activated by the AI when the story moves (`SCENE_SWITCH`) — switching requires the scene to exist.
- Scene data is updated like any other state. The active scene is injected into the AI's context.
- Only you can delete a scene.

## 12. The {{user}} sheet

- Your own persona gets a real sheet (stats, effects, custom data) stored in the chat.
- Created once via the AI's user-state block or **World ▸ Create user sheet**.
- Its default schema comes from the majority of your characters' stats, or from a template you can define in Settings.

## 13. Relationships

- Simple relationship edges between entities: `{from, type, to}` — the type is free-form data (rival, sister, sworn enemy…), never interpreted by the engine.
- Edit them yourself in the sheet's **Relations** tab, or let the AI register one through the relationships tool when you ask. Never invented from the story on its own.

## 14. AI Sheet Designer (armed mode)

Lets the AI design an entire character sheet — useful for a fresh character without one, or a full redesign.

1. Open ⚙ Settings and enable **"ARM: let the AI design a sheet once"**.
2. Ask the AI in chat to design the sheet ("create character stats for Rika, dating-sim format…").
3. The AI produces a single structured sheet definition: stat types, starting values, limits, choice lists — plus optional starting custom data.
4. The extension **replaces the target's stats with the new design** in the current chat only, then **automatically disarms** (one creation per arm).
5. Happy with it? Choose **⋯ ▸ Save this chat as the card defaults…** to adopt it on the card. The card is never touched automatically.

Safety rails: choice stats without options are rejected; a 60-stat cap; duplicate names keep the first definition; everything is journaled so a swipe rolls it back; when disarmed the protocol is invisible to the AI (it cannot imitate what it has never been taught).

## 15. Event cards

Every applied change (state update, effect expiry, editor save, tool call) appears as a card at the top of the AI's message.

- Collapsed by default to one line: who changed, what kinds of data changed, and the two biggest stat moves. Click it to see every change, with progress bars and an **Open sheet** button.
- Cards are system-level: they never enter the AI's context and cost no tokens.
- They are stored inside the chat file and re-rendered after reloads, chat switches and "Show more messages".
- Settings: show/hide cards, expand them by default, and optionally list every stat's value inside each card.

## 16. Audit log

- A per-chat log of every change: source (AI / manual / system / heuristic), target, operation, before → after.
- Capped (default 1000 entries, adjustable) and exportable to JSON/CSV from **History ▸ Change log**.
- The AI can query recent changes itself with a state-log query; the answer is delivered next turn and never leaks your manual edits' details.

## 17. Snapshots & timeline

- **History** (header menu) is one screen with three tabs: **Change log** (filters, JSON/CSV export), **Timeline** (changes + snapshots, details as a readable table) and **Snapshots**.
- Manual snapshots (History ▸ Take snapshot now) plus automatic ones every N chat messages (default 20). Automatic snapshots keep only the newest 6 so they never push your manual or safety snapshots out (20 kept in total).
- Risky manual operations (paste, editor save, reset, restore) take a labelled safety snapshot first.
- Restoring replaces all entity states, the clock and the active scene, and resets trigger flags. A "before restore" snapshot is taken first, so a restore can be undone. Snapshots can be deleted from the list.
- Snapshots are stored compactly: the oldest keeps the full world, every later one only what changed since the previous one (a busy chat's snapshot data shrinks by ~95%). Older snapshots are converted automatically the next time a snapshot is written.

## 18. Presets, components & field copy/paste

- **Presets**: save the whole stat schema under a name (saved in your browser). Same name = overwrite with confirmation.
- **Built-in genre presets**: the top of **Stat Presets** (⋯ ▸ Presets…) lists ready-made sheets for 10 genres — Fantasy RPG, System / LitRPG / Isekai, Cultivation, Superhero, Survival / Zombie, Horror / Mystery, Romance / Slice of Life, School Life, Cyberpunk / Sci-fi, Business / Management. Each genre has three variants: **Protagonist / {{user}}** (the full sheet), **Companion** (the genre core + Affection, Trust, Relationship, Mood) and **Minor NPC** (3 stats, cheap in tokens). Press a variant → pick how to apply it (replace, add missing, or clear and replace) → done. An empty sheet also offers *Start from a genre preset*. Built-ins are read-only and ship with the extension; to keep your own version, load one, adjust it, then 💾 save it under a new name. Identity and progression stats (Level, attributes, Age-like values) allow the AI to set Base directly, so a new character gets real values instead of Mod.
- **Components 🧩**: save a *subset* of stat definitions as a reusable bundle; applying a component only adds stats that are missing — it never overwrites existing definitions.
- **Field copy/paste**: copy a single stat's definition (+ value) from one character and paste it to any selection of characters in the chat — with an option to also update the card defaults (definitions only). Values that don't fit the definition are kept and flagged, never fabricated.

## 19. Stat history graphs

Number stats get a sparkline on the sheet; clicking it opens a larger chart (grid lines, axis labels, dots) with the game clock or message index as the time axis. Recording can be turned off in Settings.

## 20. Group chats

- In groups, the current speaker gets the full state; inactive members get a one-line summary (lazy loading — big token saver).
- The AI can read a member's full state on demand.
- Per-member priority (0 name only — the state is still readable via `state_get`, 1 summary only, 2 default: full when named in your latest message, else summary, 3 always full) has no UI control; it can be set per chat in the chat metadata key `character_state_entity_priority` (`{ "<entity key>": 0..3 }`). Everyone defaults to 2.
- **Members with the same name**: SillyTavern has no character id besides the card file, so when two members share a display name the model sees them as **"Alice (Alice)"** and **"Alice (Alice_2)"** (from the card file name, so they never change) (also in the sheet's character picker) and targets them that way — the card file name (e.g. `Alice_2.png`) works too. A reply's own speaker is always recognized. Chats without duplicate names are unchanged.

## 21. Data safety

- **Journal per message**: before the AI's reply is processed, the touched states + clock are recorded. Swiping, deleting messages (including "delete to the end" from your own message) and regenerating roll the world back to match the story. Continue keeps the original pre-message record.
- **Tool calls are journaled too**: deleting a tool-call message rolls back what that call changed.
- **Swipe snapshots**: each swipe position holds its own world state; returning to a swipe restores it exactly, clock and stat-history graph included.
- **Survives a reload**: the record of the LAST reply is saved with the chat, so swiping, regenerating or deleting it after F5 still rolls back correctly.
- **Branches & checkpoints**: SillyTavern copies the newest state into a branch made from an older message. On opening such a branch the extension offers the snapshot taken closest to (not after) the branch point.
- **Deliberate wipes are respected**: saving the chat editor with zero stats marks the state as intentionally empty — the extension will not "repair" it from the card in this chat.
- **Recovery**: if a card has no defaults but an older chat of the same character does, the extension offers a one-time, confirmed recovery.
- **Snapshots** (section 17) are your manual safety net for bigger experiments.

## 22. Settings reference

**Export configuration / Import…** (Settings footer) saves everything stored in this browser — settings, presets, components, user template — to one JSON file, and loads it back on another machine (chat data is never included or touched).

| Setting | Default | What it does |
| --- | --- | --- |
| Interface language | English | Auto (follows SillyTavern) / English / Tiếng Việt |
| **Prompt detail** | Standard | **Maximum** shows the model up to 40,000 characters of custom data (Standard: 8,000) and always sends every group member in full — the smartest option when input tokens are not a concern |
| Show pinned stats above the chat input | ON | The HUD (only appears when something is pinned) |
| Heuristic parser | OFF | Local fallback that parses simple damage/gain sentences when the model forgets the protocol (risk of false positives) |
| Record stat history | ON | Data for sparklines and charts |
| Show stat groups as tabs | ON | Tabbed display for grouped stats |
| Show state-change cards | ON | Event cards in chat |
| Expand event cards by default | OFF | Cards open with every row visible |
| Show the full stat list on event cards | OFF | Adds every stat's current value inside each card |
| Lazy group prompt | ON | Inactive group members summarized instead of fully injected |
| **ARM: let the AI design a sheet once** | OFF | AI Sheet Designer (section 14); auto-disarms after one success |
| Game clock fallback (+minutes per turn) | 0 | Advance time automatically when the AI forgets `<TIME>` |
| Auto-snapshot every N chat messages | 20 | 0 = off |
| Audit cap per chat | 1000 | 0 = unlimited |
| Default custom display mode | UI | ui / compact / full for the custom section |
| User State Template | (empty) | Default schema for the {{user}} sheet |

## 23. FAQ & troubleshooting

**I deleted all stats in the chat editor, saved, but they came back.**
You are on an older build (before v2.0.20) — reload the page (F5). Since v2.0.20 an empty save is intentional and permanent (in this chat).

**The AI designed a sheet, but a new chat doesn't have it.**
The AI Sheet Designer is chat-scoped. Choose ⋯ ▸ *Save this chat as the card defaults…* (or edit it in via Edit ▸ *Edit the card defaults (new chats)*) to adopt it on the card.

**The AI never updates the state.**
Check that the extension is enabled and the prompt contains the state block (SillyTavern prompt inspector). Weak models may need the heuristic parser or tool-calling-capable models.

**I see raw text like `[CSEVENT:#0 …]` in the chat.**
Old build with multi-line markers — reload the page; the extension repairs existing messages automatically.

**I want the AI to stop touching Base values.**
Leave `aiBaseEdit` off for those stats — every path (deltas, explicit base sets, semantic sets) is blocked at the core.

**I changed the card but this chat didn't change.**
By design — the card holds defaults. Use ⋯ ▸ *Reset this chat from the card…* to apply them here.

**Where is my data?**
All runtime state lives inside the current chat's save file (and its metadata). Card defaults live inside the character card. Snapshots and settings live in the chat metadata / your browser.

---

*Character State — your story, with a ledger.*
