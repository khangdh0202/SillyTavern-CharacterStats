# Character State — Hướng dẫn sử dụng

[🇻🇳 Tiếng Việt](USER_GUIDE.vi.md) | [🌐 English](USER_GUIDE.md) · ← Về [README](README.vi.md)

Tài liệu đầy đủ cho extension Character State: mọi tính năng, mọi setting, giải thích từng bước.

---

## Mục lục

1. [Khái niệm cốt lõi: card defaults vs chat runtime](#1-khái-niệm-cốt-lõi)
2. [Bắt đầu](#2-bắt-đầu)
3. [Giao diện sheet](#3-giao-diện-sheet)
4. [Stats chi tiết](#4-stats-chi-tiết)
5. [Custom data](#5-custom-data)
6. [Skills & inventory](#6-skills--inventory)
7. [Effects](#7-effects)
8. [Đồng hồ game](#8-đồng-hồ-game)
9. [AI cập nhật trạng thái thế nào](#9-ai-cập-nhật-trạng-thái-thế-nào)
10. [Side NPC](#10-side-npc)
11. [Scenes](#11-scenes)
12. [Sheet cho {{user}}](#12-sheet-cho-user)
13. [Relationships](#13-relationships)
14. [AI Sheet Designer (chế độ ARM)](#14-ai-sheet-designer-chế-độ-arm)
15. [Event cards](#15-event-cards)
16. [Audit log](#16-audit-log)
17. [Snapshots & timeline](#17-snapshots--timeline)
18. [Presets, component & copy/paste field](#18-presets-component--copypaste-field)
19. [Đồ thị lịch sử stat](#19-đồ-thị-lịch-sử-stat)
20. [Group chat](#20-group-chat)
21. [An toàn dữ liệu](#21-an-toàn-dữ-liệu)
22. [Bảng tham khảo Settings](#22-bảng-tham-khảo-settings)
23. [Hỏi đáp & xử lý sự cố](#23-hỏi-đáp--xử-lý-sự-cố)

---

## 1. Khái niệm cốt lõi

Có **2 lớp dữ liệu** — hiểu 2 lớp này là hiểu 90% cách extension hoạt động:

| Lớp | Nằm ở | Ai thay đổi |
| --- | --- | --- |
| **Card defaults** (schema + giá trị khởi đầu) | Trong character card | Chỉ bạn — qua Sửa ▸ *Sửa mặc định của card (chat mới)*, ⋯ ▸ *Ghi chat này thành mặc định của card…*, paste, recovery |
| **Chat runtime** (trạng thái sống của truyện này) | Trong file lưu chat hiện tại | Bạn (Sửa ▸ *Sửa state của chat này*) và AI (state update) |

- Mở **chat mới** → runtime được seed từ card defaults.
- Sửa **card** không đụng chat hiện có. Sửa **chat runtime** không đụng card.
- Muốn thay đổi áp dụng cho mọi chat sau này: sửa trong chat rồi chọn **⋯ ▸ Ghi chat này thành mặc định của card…**.
- Xoá hết stats trong trình sửa chat (Sửa ▸ *Sửa state của chat này*) được coi là chủ-đình — extension sẽ không tự "hồi sinh" từ card (trong chat này; chat mới vẫn seed từ card).

## 2. Bắt đầu

1. Cài: trong SillyTavern mở panel **Extensions** → bấm **Install extension**, dán `https://github.com/khangdh0202/SillyTavern-CharacterStats` và cài (cho riêng user này hoặc tất cả). Cách thủ công: copy repo vào `data/<user-handle>/extensions/` hoặc `public/scripts/extensions/third-party/`, rồi reload SillyTavern.
2. Mở chat bất kỳ — nút sheet hiện phía trên ô nhập tin.
3. Card chưa có sheet? Tự dựng bằng editor (**Sửa ▸ Sửa mặc định của card (chat mới)**) hoặc dùng AI Sheet Designer (mục 14).
4. Chơi. AI giờ đọc trạng thái mỗi lượt và tự cập nhật — mỗi thay đổi hiện thành thẻ nhỏ trong chat.

## 3. Giao diện sheet

Mở sheet bằng nút **Character Sheet** phía trên ô nhập, mục trong menu đũa phép (Extensions) của ST, hoặc lệnh `/cs-sheet [tên]`. Header chỉ còn sáu nút:

| Nút | Chức năng |
| --- | --- |
| 🕐 đồng hồ | Đồng hồ game: xem, sửa tay, pause |
| **Sửa ▾** | *State của chat này* (giá trị, định nghĩa, skills, items, custom text) hoặc *Mặc định của card* (cho chat mới; chat hiện tại không đổi) |
| **Lịch sử ▾** | Nhật ký thay đổi (xuất JSON/CSV), dòng thời gian, snapshot, chụp snapshot ngay |
| **Thế giới ▾** | Tổng quan thế giới, cảnh, thêm NPC phụ, tạo sheet {{user}} (một lần) |
| **⋯** | Copy / paste schema, preset, component · ghi chat này thành mặc định card, reset chat từ card, gộp Mod vào Base · ước tính token · cài đặt |
| ✕ | Đóng (hoặc nhấn **Esc**) |

Nội dung chia thành tab có đếm số: **Chỉ số · Hiệu ứng · Kỹ năng · Túi đồ · Quan hệ · Tuỳ chỉnh**.

- **Chỉ số**: mỗi chỉ số một hàng, có giá trị hiệu lực, max, đơn vị, mũi tên xu hướng (thay đổi gần nhất) và thanh tiến độ. Chạm vào hàng để xem Base / Mod / phần cộng từ hiệu ứng và mô tả; chạm vào tên để mở biểu đồ lịch sử. Dùng các nút nhóm (có nút **Tất cả**) và ô **Lọc chỉ số…** để tìm nhanh.
- **Hiệu ứng**: các buff/debuff/trạng thái đang có, kèm delta và thời gian còn lại; chạm để sửa, ✕ để xoá, **Thêm hiệu ứng** để tạo mới.
- Sheet chưa có chỉ số sẽ hiện ba cách tạo: tự thiết kế, paste schema, hoặc để AI thiết kế.
- **Chỉnh nhanh**: trong phần chi tiết của một hàng, **−/+** đổi giá trị 1 đơn vị (Shift: 10), **Đặt…** để nhập giá trị chính xác; chỉ số dạng lựa chọn có dropdown, dạng đúng/sai có nút đảo. Nhiều lần bấm liên tiếp chỉ thành một dòng nhật ký.
- **★ Ghim** chỉ số để nó hiện thành thanh ở đầu tab Chỉ số và trên **HUD** phía trên ô chat (chỉ số đã ghim của các nhân vật trong chat và {{user}}, kèm thay đổi gần nhất; bấm để mở sheet).
- Tab **Quan hệ**: mọi quan hệ của đối tượng này (đi ra và đi vào); thêm quan hệ với loại (gợi ý từ các nhãn đã dùng), đích và ghi chú `key=value` tuỳ chọn, hoặc xoá.

Trong **chế độ sửa** cũng có các tab trên (trừ Hiệu ứng và Quan hệ), cộng thêm: thêm/sửa/xoá từng stat, **🗑 Clear All** (xoá mọi hàng stat — nhớ bấm **Lưu**), kéo thả ☷ sắp xếp, ⤒/⤓ chèn trên/dưới, ▣ Select chọn nhiều field để copy. Thoát khi còn thay đổi chưa lưu (Esc hoặc bấm ra ngoài) sẽ được hỏi lại.

Trên điện thoại, sheet chiếm toàn màn hình, menu mở từ dưới lên và hàng trong trình sửa xếp dọc.

## 4. Stats chi tiết

Một stat có các field (bắt buộc: name + type):

| Field | Ý nghĩa |
| --- | --- |
| `type` | `number` · `boolean` · `choice` (bắt buộc có options) · `text` |
| `base` | Giá trị "thật" (card khởi đầu với giá trị này) |
| `mod` | Điều chỉnh nổi — AI thường chơi với phần này (hiển thị = base + mod + delta effect) |
| `min` / `max` | Giới hạn (0/0 hoặc trống = không giới hạn) |
| `unit` | Đơn vị hiển thị (¥, kg, HP…) |
| `progressBar` | Thanh tiến độ cho number; màu thứ hai khi giá trị crossing 0 |
| `options` | Danh sách lựa chọn cho `choice` |
| `description` | Hiện trên sheet + chèn vào context của AI |
| `group` | Nhãn tab (chỉ hiển thị) |
| `onChange` | Tên trigger tự động khi stat đổi |
| `triggers` | Auto-event (xem dưới) |
| `syncCustom` | Khai báo tay cặp stat ⇄ custom path |
| `aiBaseEdit` | **Chìa khoá mở quyền sửa Base/min/max cho AI** |

**AI sửa thế nào.** Mặc định AI chỉ cộng/trừ delta (vào `mod`) và set giá trị boolean/choice/text. Stat có `aiBaseEdit` mới cho AI đụng Base và giới hạn — dùng cho thứ nên tăng vĩnh viễn (level up, thương tật, tuổi).

**Triggers.** Mỗi stat mang được auto-event, vd *"khi giá trị hiệu lực ≤ 0 → hiện toast"*. Edge-triggered (chỉ fire khi điều kiện chuyển sang đúng) và do extension thực thi, không phải AI.

**Sync pairs.** Khi một stat là tổng hợp của counter trong custom data (vd `Cash` ↔ `wallet.balance`), extension tự dò cặp và inject SYNC MAP vào context để 2 phía luôn khớp. Cặp không dò được thì khai tay bằng `syncCustom`.

## 5. Custom data

Custom data là JSON tự do theo từng nhân vật — tracker, suy nghĩ thầm kín, lịch sử sự kiện, bất cứ thứ gì.

- Bạn sửa qua ô custom text trên sheet (nhận JSON đẹp; JSON hỏng → không save).
- AI cập nhật qua protocol với deep merge: chỉ thêm key theo cấu trúc có sẵn, không bao giờ xoá/đổi tên của bạn.
- Key chứa dấu chấm tự chuyển thành object lồng.
- Bộ guard tự động chặn AI làm bẩn: trùng tên stat, bịa key gần-trùng, đè scalar bằng object (và ngược lại), fork tracker bằng tên biến thể. Mọi reject kèm giải thích AI nhận ở turn sau.
- Từng field có thể đánh dấu **hidden** để không vào prompt của AI (bạn và sheet vẫn thấy).

## 6. Skills & inventory

- **Skills**: danh sách tên + mô tả, AI hoặc bạn thêm/sửa.
- **Inventory**: item có số lượng + mô tả. Item `equippable` khi mặc có thể cấp **effects** (mục 7).
- Cả hai đều là "công dân" đầy đủ của protocol: AI thêm/sửa/xoá được.

## 7. Effects

Effect là modifier tạm thời, **tách hẳn** khỏi base/mod:

- Mỗi effect có: tên, nguồn (`buff`/`debuff`/`item`/`skill`/`condition`), stat bị ảnh hưởng, thời hạn theo **lượt** hoặc **phút trong game**, mô tả.
- Effect theo lượt giảm mỗi lượt AI; theo phút so với đồng hồ game. Clock stale → đóng băng, không đoán mốc.
- **Stack**: cộng dồn theo count (có cap) hoặc refresh (áp lại = reset thời gian).
- Hết hạn tự xoá + log + event card.
- Thêm/xoá tay từ chip effect trên sheet, hoặc để AI làm.

## 8. Đồng hồ game

- Đồng hồ đếm **phút trong truyện** từ đầu câu chuyện, theo từng chat. Badge hiện dạng lịch, vd **Ngày 3 · 22:07** (có icon ⏸ khi tạm dừng).
- AI kéo thời gian mỗi lượt. Lùi giờ bị từ chối. Quên gửi giờ thì đồng hồ đứng yên (đánh dấu *stale*) — không bao giờ tự đoán giờ.
- Bấm badge để mở hộp chỉnh đồng hồ: ô ngày / giờ / phút, **+10 phút · +1 giờ · +8 giờ (ngủ) · Sáng hôm sau**, dòng xem trước, **Tạm dừng** (AI không đổi được giờ) và **Lịch** (độ dài ngày, giờ bắt đầu ngày, số ngày mỗi mùa, tên các mùa).
- Swipe hoặc xoá tin nhắn sẽ khôi phục đồng hồ cho khớp.

## 9. AI cập nhật trạng thái thế nào

Bạn không cần nhớ chi tiết để chơi — nhưng biết giúp bạn dạy AI tốt hơn.

- Mỗi lượt, extension chèn bản xem gọn + luôn-cập-nhật của trạng thái vào context, kèm protocol nghiêm ngặt.
- AI trả lời truyện bình thường, rồi báo thay đổi qua cấu trúc có kiểm tra (hoặc tool call nếu model hỗ trợ — tự nhận diện).
- Extension kiểm tra tất cả: key lạ bị từ chối (kèm gợi ý key gần đúng), giá trị bị clamp theo limit, quyền được kiểm tra, và mọi reject thành "notice" ngắn AI đọc ở turn sau để tự sửa.
- AI còn có thể: tra lịch sử thay đổi, tạo side NPC/scene/user sheet (chỉ khi bạn yêu cầu), kéo thời gian kiểu semantic, đăng ký quan hệ.
- Model hỗ trợ native tool calling thì có tool riêng; không thì viết text block — 2 đường ngang quyền, và tool call viết dạng text trong tin nhắn cũng được thực thi (có dedupe).
- Có các cơ chế cứu lỗi model thường gặp: update bị cắt do hết token vẫn được salvage áp một phần; block nhại marker hệ thống bị loại bỏ (không áp) kèm bài học.

**Nhiều nhân vật cùng lúc**: một update có thể target nhiều nhân vật — tiện cho cảnh group.

**Tool cho AI.** Khi model hỗ trợ native tool calling, AI nhận các tool sau (cùng các thao tác đó vẫn chạy khi viết dạng tool call text):

| Tool | Chức năng |
| --- | --- |
| `state_get` | Đọc state hiện tại của một đối tượng (gọn: stats, skills, inventory, effects, custom data); `path` để xem sâu một nhánh |
| `state_update` | Áp thay đổi bằng object stat semantic (delta, hoặc Base/giới hạn cho stat có `aiBaseEdit`), kèm skills, inventory, effects, custom data |
| `state_history` | Đọc lịch sử giá trị đã ghi của các stat của một đối tượng (xu hướng, giá trị cũ) |
| `state_create_npc` | Tạo side NPC chat-local kèm state khởi đầu — chỉ khi bạn yêu cầu |
| `state_create_sheet` | Thiết kế sheet stat cho nhân vật — chỉ khi AI Sheet Designer đang ARM (mục 14) |
| `state_add_effect` | Thêm một effect có thời hạn (buff, debuff, item, skill, condition) kèm delta stat và thời lượng |
| `state_remove_effect` | Xoá effect đang có theo tên hoặc id |
| `state_advance_time` | Kéo đồng hồ game theo phút, hoặc sleep / travel / skip; không bao giờ lùi, đứng yên khi tạm dừng |
| `state_relationships` | Liệt kê, thêm/sửa hoặc xoá quan hệ giữa các đối tượng |

Tool cổ điển `UpdateCharacterState` (mỗi call một đối tượng) cũng được đăng ký.

## 10. Side NPC

Side NPC là nhân vật chat-local không có card: bartender, kẻ thù, bạn đồng hành tạm.

- Chỉ tạo khi **bạn yêu cầu rõ ràng** — nói với AI trong chat, hoặc chọn **Thế giới ▸ Thêm NPC phụ**.
- Schema kế thừa majority từ các nhân vật có sẵn; không có gì kế thừa → stats AI cung cấp lúc tạo thành định nghĩa sheet.
- Xuất hiện trong selector sheet, target được bằng state update, tối đa 10/conversation.
- Xoá vẫn giữ registry để rollback khôi phục được. Card và {{user}} không bao giờ bị AI tạo/xoá.

## 11. Scenes

Scene là state có tên (`scene:…`) chứa dữ liệu tự do: bối cảnh, thời tiết, mức nguy hiểm…

- Chỉ tạo khi bạn yêu cầu rõ ràng (`SCENE_CREATE`); AI kích hoạt khi truyện di chuyển (`SCENE_SWITCH`) — phải là scene đã tồn tại.
- Dữ liệu scene update như state thường. Scene active được chèn vào context.
- Chỉ bạn xoá được scene.

## 12. Sheet cho {{user}}

- Persona của bạn có sheet thật (stats, effects, custom data) lưu trong chat.
- Tạo một lần qua block user-state của AI hoặc **Thế giới ▸ Tạo sheet người chơi**.
- Schema mặc định lấy majority từ stats các nhân vật, hoặc từ template bạn đặt trong Settings.

## 13. Relationships

- Quan hệ đơn giản giữa các đối tượng: `{from, type, to}` — loại quan hệ là dữ liệu tự do (đối thủ, chị em, kẻ thù…), engine không diễn giải.
- Tự sửa trong tab **Quan hệ** của sheet, hoặc để AI ghi qua tool relationships khi bạn yêu cầu. Không bao giờ tự sinh từ truyện.

## 14. AI Sheet Designer (chế độ ARM)

Cho AI tự thiết kế cả bộ sheet — hợp khi nhân vật chưa có sheet, hoặc muốn thiết kế lại hoàn toàn.

1. ⚙ Settings → bật **"ARM: let the AI design a sheet once"**.
2. Yêu cầu AI trong chat ("tạo character stats cho Rika, format dating-sim…").
3. AI đưa ra **một** định nghĩa sheet có cấu trúc: type, giá trị khởi đầu, min/max, choice list — kèm custom data seed tuỳ chọn.
4. Extension **thay toàn bộ stats của target bằng thiết kế mới** trong chat hiện tại, rồi **tự tắt ARM** (một lần arm = một lần tạo).
5. Ưng thì chọn **⋯ ▸ Ghi chat này thành mặc định của card…** để nhận lên card. Card không bao giờ bị đụng tự động.

Lưới an toàn: choice thiếu options bị reject; tối đa 60 stats; trùng tên giữ cái đầu; mọi thứ được journal nên swipe rollback được; khi không ARM, protocol vô hình với AI (không thể nhại cái chưa từng được dạy).

## 15. Event cards

Mọi thay đổi được áp (state update, effect hết hạn, save editor, tool call) hiện thành thẻ ở đầu tin nhắn AI.

- Mặc định thu gọn một dòng: ai thay đổi, loại dữ liệu nào thay đổi, và hai thay đổi chỉ số lớn nhất. Bấm vào để xem mọi thay đổi, kèm progress bar và nút **Mở sheet**.
- Thẻ là system-level: không bao giờ vào context của AI, không tốn token.
- Lưu trong file chat, render lại sau reload, chuyển chat và "Show more messages".
- Settings: bật/tắt thẻ, mở rộng mặc định, và tuỳ chọn liệt kê giá trị mọi chỉ số trong thẻ.

## 16. Audit log

- Log theo chat của mọi thay đổi: nguồn (AI/thủ công/system/heuristic), target, thao tác, before → after.
- Có cap (mặc định 1000, chỉnh được) và xuất JSON/CSV từ **Lịch sử ▸ Nhật ký thay đổi**.
- AI có thể tự tra thay đổi gần đây bằng state-log query; kết quả trả ở turn sau, không bao giờ lộ chi tiết chỉnh sửa thủ công của bạn.

## 17. Snapshots & timeline

- **Lịch sử** (menu trên header) là một màn hình có ba tab: **Nhật ký thay đổi** (bộ lọc, xuất JSON/CSV), **Dòng thời gian** (thay đổi + snapshot, chi tiết dạng bảng) và **Snapshot**.
- Snapshot thủ công (Lịch sử ▸ Chụp snapshot ngay) + tự động mỗi N tin nhắn chat (mặc định 20). Snapshot tự động chỉ giữ 6 bản mới nhất để không đẩy snapshot thủ công/an toàn ra ngoài (tổng tối đa 20).
- Thao tác tay rủi ro (paste, lưu editor, reset, restore) tự chụp snapshot an toàn có nhãn trước.
- Restore thay toàn bộ trạng thái các đối tượng, đồng hồ và cảnh hiện tại, reset trigger flags. Trước khi restore sẽ chụp snapshot "before restore", nên restore hoàn tác được. Xoá được snapshot trong danh sách.
- Snapshot được lưu gọn: bản cũ nhất giữ toàn bộ thế giới, các bản sau chỉ lưu phần thay đổi so với bản trước (dữ liệu snapshot của chat đông giảm khoảng 95%). Snapshot cũ tự chuyển định dạng ở lần ghi snapshot kế tiếp.

## 18. Presets, component & copy/paste field

- **Presets**: lưu cả schema stat theo tên (lưu trong browser). Trùng tên = ghi đè có confirm.
- **Preset dựng sẵn theo thể loại**: đầu cửa sổ **Preset chỉ số** (⋯ ▸ Presets…) có sẵn sheet cho 10 thể loại — Fantasy RPG, Hệ thống / LitRPG / Isekai, Tu tiên, Siêu anh hùng, Sinh tồn / Zombie, Kinh dị / Bí ẩn, Tình cảm / Đời thường, Học đường, Cyberpunk / Khoa học viễn tưởng, Kinh doanh / Quản lý. Mỗi thể loại có 3 biến thể: **Nhân vật chính / {{user}}** (đầy đủ), **Đồng hành** (lõi thể loại + Affection, Trust, Relationship, Mood) và **NPC phụ** (3 chỉ số, tiết kiệm token). Bấm một biến thể → chọn cách áp (thay thế, chỉ thêm còn thiếu, hoặc xoá rồi thay) → xong. Sheet trống cũng có nút *Bắt đầu từ preset theo thể loại*. Preset dựng sẵn chỉ đọc và đi kèm extension; muốn có bản riêng thì Load, chỉnh, rồi 💾 lưu tên mới. Chỉ số danh tính / tiến triển (Level, chỉ số gốc…) cho phép AI đặt thẳng Base, nên nhân vật mới có giá trị thật thay vì nằm ở Mod.
- **Component 🧩**: lưu *một phần* định nghĩa để tái sử dụng; apply CHỈ thêm stat còn thiếu — không bao giờ đè định nghĩa hiện có.
- **Field copy/paste**: copy định nghĩa (+ giá trị) của một stat sang nhiều nhân vật trong chat cùng lúc — có tuỳ chọn cập nhật cả card defaults (chỉ định nghĩa). Giá trị lệch định nghĩa được giữ + cảnh báo, không bịa.

## 19. Đồ thị lịch sử stat

Stat number có sparkline trên sheet; click mở chart lớn (lưới, nhãn trục, dots) với trục thời gian = game clock hoặc số thứ tự tin nhắn. Tắt ghi dữ liệu được trong Settings.

## 20. Group chat

- Nhân vật đang nói nhận full state; member không hoạt động nhận 1 dòng tóm tắt (lazy loading — tiết kiệm token lớn).
- AI đọc đủ state của member theo yêu cầu.
- Priority từng member (0 chỉ tên — state vẫn đọc được qua `state_get`, 1 chỉ tóm tắt, 2 mặc định: full khi được nhắc tên trong tin nhắn mới nhất của bạn, không thì tóm tắt, 3 luôn full) không có nút chỉnh trong giao diện; đặt theo từng chat qua key metadata của chat `character_state_entity_priority` (`{ "<entity key>": 0..3 }`). Mặc định mọi member là 2.
- **Thành viên trùng tên**: SillyTavern không có id nhân vật nào ngoài file card, nên khi hai thành viên cùng tên, AI thấy họ là **"Alice (Alice)"** và **"Alice (Alice_2)"** (lấy từ tên file card nên không bao giờ đổi) (bộ chọn nhân vật trong sheet cũng vậy) và nhắm đúng người theo nhãn đó — tên file card (vd. `Alice_2.png`) cũng được. Người đang nói của một reply luôn được nhận đúng. Chat không có tên trùng thì không thay đổi gì.

## 21. An toàn dữ liệu

- **Journal mỗi tin nhắn**: trước khi xử lý reply của AI, các state bị chạm + clock được ghi lại. Swipe, xoá tin nhắn (kể cả "xoá đến cuối" bắt đầu từ tin nhắn của bạn) và regenerate đều đưa thế giới về khớp truyện. Continue giữ nguyên bản ghi trước tin nhắn.
- **Tool call cũng được journal**: xoá tin nhắn tool call sẽ hoàn tác những gì call đó đã đổi.
- **Swipe snapshot**: mỗi vị trí swipe giữ world state riêng; quay lại swipe nào khôi phục đúng swipe đó, kể cả clock và đồ thị lịch sử.
- **Giữ được qua F5**: bản ghi của reply CUỐI được lưu cùng chat, nên sau khi tải lại trang, swipe / regenerate / xoá nó vẫn rollback đúng.
- **Nhánh & checkpoint**: SillyTavern chép state mới nhất vào nhánh tạo từ một tin nhắn cũ. Khi mở nhánh như vậy, extension đề nghị khôi phục snapshot gần nhất (không sau) điểm tạo nhánh.
- **Xoá sạch là chủ đích**: save editor với 0 stats đánh dấu trạng thái "cố ý rỗng" — extension không "repair" từ card trong chat này.
- **Recovery**: card chưa có defaults nhưng chat cũ cùng nhân vật có → extension đề nghị khôi phục một lần, có xác nhận.
- **Snapshots** (mục 17) là lưới an toàn thủ công cho các thử nghiệm lớn.

## 22. Bảng tham khảo Settings

**Xuất cấu hình / Nhập…** (cuối Settings) lưu mọi thứ nằm trên trình duyệt này — cài đặt, preset, component, user template — vào một file JSON và nạp lại trên máy khác (dữ liệu chat không bao giờ bị đưa vào hay bị đụng).

| Setting | Mặc định | Ý nghĩa |
| --- | --- | --- |
| Ngôn ngữ giao diện | English | Tự động (theo SillyTavern) / English / Tiếng Việt |
| **Mức chi tiết của prompt** | Chuẩn | **Tối đa** cho model thấy tới 40.000 ký tự custom data (Chuẩn: 8.000) và luôn gửi đầy đủ mọi thành viên nhóm — lựa chọn để AI hiểu nhiều nhất khi không ngại token đầu vào |
| Hiện chỉ số đã ghim phía trên ô chat | ON | HUD (chỉ hiện khi có chỉ số được ghim) |
| Heuristic parser | OFF | Fallback dò câu đơn giản ("take 12 damage") khi model quên protocol (dễ false positive) |
| Record stat history | ON | Dữ liệu sparkline + chart |
| Show stat groups as tabs | ON | Hiện tab theo group |
| Show state-change cards | ON | Event cards trong chat |
| Mở rộng event card mặc định | OFF | Thẻ mở sẵn mọi dòng |
| Hiện toàn bộ chỉ số trên event card | OFF | Thêm giá trị hiện tại của mọi chỉ số vào mỗi thẻ |
| Lazy group prompt | ON | Member group không hoạt động → tóm tắt |
| **ARM: let the AI design a sheet once** | OFF | AI Sheet Designer (mục 14); tự tắt sau 1 lần thành công |
| Game clock fallback (+phút/lượt) | 0 | Tự kéo thời gian khi AI quên `<TIME>` |
| Auto-snapshot mỗi N tin nhắn chat | 20 | 0 = tắt |
| Audit cap per chat | 1000 | 0 = unlimited |
| Default custom display mode | UI | ui / compact / full cho mục custom |
| User State Template | (trống) | Schema mặc định cho sheet {{user}} |

## 23. Hỏi đáp & xử lý sự cố

**Xoá hết stats trong chat editor, save xong vào lại vẫn còn?**
Bạn đang chạy bản cũ (trước v2.0.20) — reload trang (F5). Từ v2.0.20 save rỗng được tôn trọng vĩnh viễn (trong chat này).

**AI thiết kế sheet xong nhưng chat mới không có?**
AI Sheet Designer chỉ áp trong chat hiện tại. Chọn ⋯ ▸ *Ghi chat này thành mặc định của card…* (hoặc nhập vào qua Sửa ▸ *Sửa mặc định của card (chat mới)*) để nhận lên card.

**AI không bao giờ cập nhật state?**
Kiểm tra extension đã bật và prompt có block trạng thái (prompt inspector của ST). Model yếu → cân nhắc bật heuristic hoặc dùng model hỗ trợ tool calling.

**Thấy text thô `[CSEVENT:#0 …]` trong chat?**
Bản cũ với marker xuống dòng — reload trang; extension tự sửa các message có sẵn.

**Muốn AI ngừng đụng Base?**
Đừng bật `aiBaseEdit` trên stat đó — mọi đường (delta, base set, semantic set) đều bị chặn ở core.

**Đổi card rồi mà chat này không đổi?**
Đúng thiết kế — card là defaults. Dùng ⋯ ▸ *Reset chat này từ card…* để áp vào chat hiện tại.

**Dữ liệu nằm ở đâu?**
Runtime state nằm trong file lưu chat hiện tại (và metadata). Card defaults nằm trong character card. Snapshots và settings nằm trong chat metadata / browser của bạn.

---

*Character State — truyện của bạn, có sổ sách.*
