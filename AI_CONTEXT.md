# Pentava AI Context

## Mục tiêu dự án

Pentava là ứng dụng Expo Router / React Native dùng để onboarding người dùng, tạo mục tiêu sức khỏe, quản lý daily tasks, mood và streak.

Khi hỗ trợ code, luôn ưu tiên:

- Code dễ đọc, dễ bảo trì.
- Tách logic, UI và type theo đúng module.
- Không làm thay đổi hành vi hiện tại nếu người dùng không yêu cầu.
- Không sửa lỗi ngoài phạm vi task.
- Sau khi sửa phải chạy lint hoặc validation phù hợp.
- Không tự ý commit, reset hoặc xóa thay đổi của người dùng.

## Công nghệ và quy ước

- Expo SDK 57.
- React Native 0.86.
- Expo Router.
- TypeScript strict.
- Alias import dùng `@/`.
- Dùng `import type` cho type-only imports.
- TypeScript code ưu tiên ASCII khi có thể.
- Dùng `apply_patch` để chỉnh sửa file hiện có.
- API dùng Axios thông qua `src/services/apiClient.ts`.
- Dữ liệu local dùng AsyncStorage.

## Cấu trúc thư mục

```text
app/                         # Expo Router screens, route composition
src/components/              # UI dùng chung
src/constants/               # Design và API constants
src/context/                 # React contexts
src/features/<feature>/      # Feature modules
  components/                # UI riêng của feature
  hooks/                     # Logic React riêng của feature
  types/                     # Props và type riêng của feature
  utils/                     # Hàm thuần dùng riêng trong feature
src/services/                # API services và local persistence
src/types/                   # Type dùng chung
src/types/api/               # Request/response DTO của backend
```

## Feature Home

Màn hình Home được chia theo feature để route chỉ làm nhiệm vụ kết nối màn hình:

```text
app/(tabs)/index.tsx
src/features/home/
  home-screen.tsx            # State, lifecycle, xử lý sự kiện và ghép giao diện
  home-screen.styles.ts      # StyleSheet dùng trong các phần giao diện Home
  components/
    home-header.tsx          # Lời chào, điều khiển theme, streak và Ruby
    home-scene-content.tsx   # Avatar, routine và chế độ xem toàn cảnh
    home-avatar.tsx          # Hiển thị avatar xếp lớp và animation linh vật
    home-bottom-bar.tsx      # Điều hướng nhanh ở cuối màn hình
    home-shop-and-task-modals.tsx
    home-notifications-modal.tsx
  utils/
    home-notifications.ts    # Tạo message và key ổn định cho thông báo
src/components/avatar/
  avatar-layer-stack.tsx     # Render chung Lottie BASE và các layer phụ kiện
```

Quy tắc:

- Giữ `app/(tabs)/index.tsx` mỏng; không đặt nghiệp vụ hoặc JSX màn hình lớn trong route.
- UI chỉ dùng trong Home đặt tại `src/features/home/components/`.
- `home-screen.tsx` giữ state và xử lý sự kiện, ghép các component Home qua props callback.
- Tách khu vực UI độc lập (header, nội dung linh vật, thanh điều hướng, modal) thành component riêng.
- Logic thuần theo feature đặt tại `src/features/home/utils/`; state và side effect màn hình hiện nằm trong `home-screen.tsx`.
- Style Home dùng chung đặt trong `home-screen.styles.ts`, không nhân bản style giữa component con.
- Khi tách module hiện có, giữ nguyên route, thứ tự gọi service, xử lý lỗi và tương tác của người dùng.
- Home và wardrobe dùng chung `src/components/avatar/avatar-layer-stack.tsx` để render Lottie BASE, phụ kiện, thứ tự layer và offset. Không tạo renderer riêng cho từng màn hình.
- BASE hiện dùng asset local `assets/avatar/pentava_cat_idle1.json` qua `lottie-react-native`; JSON có embedded PNG alpha, tự chạy và loop. Phụ kiện vẫn lấy image URL từ avatar API.
- Web của `lottie-react-native` cần `@lottiefiles/dotlottie-react`; dependency này được cài để hỗ trợ web.
- `assets/ezgif.com-video-to-webp-converter.webp` chỉ là asset thử nghiệm, có nền đen đục (alpha = 255), không dùng làm avatar trong suốt.

## Feature Wardrobe

Màn hình kho trang phục được chia theo feature:

```text
app/wardrobe.tsx
src/features/wardrobe/
  wardrobe-screen.tsx         # Ghép route screen và các thành phần wardrobe
  wardrobe.styles.ts          # Style dùng chung của màn hình wardrobe
  constants.ts                # Thứ tự slot và tên hiển thị
  components/
    wardrobe-header.tsx
    wardrobe-content.tsx      # Trạng thái loading/error, preview và danh sách
    avatar-preview.tsx
    inventory-card.tsx
  hooks/
    use-wardrobe.ts           # Tải avatar/inventory, trang bị và gỡ vật phẩm
  types/
    wardrobe.ts               # Props component và kiểu trả về của hook
```

Quy tắc:

- `app/wardrobe.tsx` chỉ làm entry point cho Expo Router.
- Giữ tải dữ liệu, sắp xếp inventory và nghiệp vụ trang bị/gỡ đồ trong `use-wardrobe.ts`.
- Component trong `components/` chỉ render UI và nhận dữ liệu/callback qua props.
- Khi chỉnh sửa cấu trúc, giữ nguyên lời gọi service, refresh/retry, trạng thái loading/error và hành vi trang bị/gỡ đồ.

## Feature Subscription (Hội viên)

Màn hình gói cước hội viên được chia theo feature:

```text
app/membership.tsx
src/features/subscription/
  subscription-screen.tsx        # Ghép route screen và các thành phần subscription
  subscription.styles.ts         # Style dùng chung của màn hình subscription
  components/
    subscription-header.tsx      # Nút đóng quay lại
    subscription-banner.tsx      # Banner thông điệp hội viên
    subscription-active-card.tsx # Thẻ thông tin gói cước đang kích hoạt
    subscription-plan-card.tsx   # Thẻ gói cước, radio chọn và danh sách đặc quyền
    subscription-footer.tsx      # Nút bấm tiến hành đăng ký/thanh toán
    subscription-qr-modal.tsx    # Modal hiển thị mã VietQR SePay và kiểm tra trạng thái
  hooks/
    use-subscription.ts          # State chọn gói, khởi tạo giao dịch, polling/check status
  types/
    subscription.ts              # Props component và kiểu dữ liệu UI feature
  utils/
    subscription-utils.ts        # Helper format tiền VND, icon gói và định dạng ngày
```

Quy tắc:

- `app/membership.tsx` chỉ làm entry point cho Expo Router.
- Giữ logic gọi service, tạo QR và xác nhận giao dịch trong `use-subscription.ts`.
- Component trong `components/` chỉ render UI và nhận dữ liệu/callback qua props.
- Định dạng tiền, icon và ngày đặt trong `subscription-utils.ts`.
- Giữ nguyên luồng xử lý giao dịch VietQR SePay, polling trạng thái và mock-confirm.

## Feature Cinema (PENTA-CINEMA)

Màn hình PENTA-CINEMA được chia theo feature:

```text
app/cinema.tsx
src/features/cinema/
  cinema-screen.tsx            # Ghép route screen và các thành phần cinema
  cinema.styles.ts             # Style dùng chung của màn hình cinema
  components/
    cinema-header.tsx          # Back button, search mục tiêu, tiêu đề và SectionTabs
    goal-card.tsx              # Thẻ hiển thị mục tiêu sức khỏe và trạng thái
    week-card.tsx              # Thẻ tuần với màu sắc WEEK_COLORS
    goal-weeks-content.tsx     # Danh sách 4 tuần của mục tiêu
    week-options-content.tsx   # Lựa chọn: Danh sách ảnh / Danh sách video
    clip-video-card.tsx        # Card phát video expo-video và nút chia sẻ social
    clips-content.tsx          # Danh sách video đã tạo trong tuần
    week-photos-content.tsx    # Lưới ảnh check-in, chọn ảnh và nút tạo video
    cinema-modals.tsx          # ErrorAlertModal, PhotoActionModal, PhotoViewerModal
  hooks/
    use-cinema.ts              # State mục tiêu, tuần, ảnh, clips, modals và handlers
  types/
    cinema.ts                  # Props component của feature cinema
  utils/
    cinema-utils.ts            # Helper định dạng ngày, nhãn trạng thái và màu tuần
```

Quy tắc:

- `app/cinema.tsx` chỉ làm entry point cho Expo Router.
- Giữ logic gọi service, lọc mục tiêu, chọn ảnh và điều khiển clip trong `use-cinema.ts`.
- Component trong `components/` chỉ render UI và nhận dữ liệu/callback qua props.
- Helper format ngày, nhãn trạng thái và màu tuần đặt trong `cinema-utils.ts`.
- Giữ nguyên video player `expo-video` (`useVideoPlayer`, `VideoView`) và luồng chuyển sang `social-post`.

## Feature Shop (Nạp Ruby & Cửa hàng)

Màn hình Nạp Ruby được chia theo feature:

```text
app/ruby-topup.tsx
src/features/shop/
  ruby-topup-screen.tsx        # Ghép route screen và các thành phần nạp ruby
  shop.styles.ts               # Style dùng chung của màn hình nạp ruby
  components/
    detail-row.tsx             # Hàng thông tin chi tiết giao dịch chuyển khoản
    topup-header.tsx           # Back button và tiêu đề
    topup-rate-card.tsx        # Thẻ tỷ lệ quy đổi 1 Ruby = VND
    topup-packages-list.tsx    # Danh sách các gói nạp Ruby cố định
    custom-topup-form.tsx      # Form nhập số Ruby tùy chọn và nút tạo QR
    topup-transaction-card.tsx # Card mã VietQR SePay, kiểm tra trạng thái và số dư
  hooks/
    use-ruby-topup.ts          # State bảng giá, tính tiền, tạo QR, polling kiểm tra giao dịch
  types/
    shop.ts                    # Props component của feature shop
  utils/
    shop-utils.ts              # Helper formatVnd
```

Quy tắc:

- `app/ruby-topup.tsx` chỉ làm entry point cho Expo Router.
- Giữ logic gọi service, tạo QR nạp ruby và polling kiểm tra giao dịch trong `use-ruby-topup.ts`.
- Component trong `components/` chỉ render UI và nhận dữ liệu/callback qua props.
- Helper format tiền đặt trong `shop-utils.ts`.
- Giữ nguyên cơ chế tự động polling 5s kiểm tra trạng thái giao dịch VietQR SePay.

## Feature tasks hiện tại

Daily tasks đã được tách theo feature:

```text
app/daily-tasks.tsx
src/features/tasks/
  constants.ts
  task-utils.ts
  components/
    daily-task-modals.tsx
    daily-tasks-header.tsx
    task-card.tsx
  hooks/
    use-daily-tasks.ts
  types/
    daily-task-modals.ts
    daily-tasks-header.ts
    task-card.ts
    use-daily-tasks.ts
```

Quy tắc:

- `app/daily-tasks.tsx` chỉ compose màn hình.
- `use-daily-tasks.ts` chứa state, gọi service và nghiệp vụ daily task.
- Component chỉ tập trung render UI.
- Props type của component/hook đặt trong `src/features/tasks/types/`, không khai báo inline nếu type dài.
- API DTO đặt trong `src/types/api/task.ts` hoặc file API tương ứng.
- Không đưa task UI props vào `src/types/api`.

## Feature Community (Mạng xã hội & Cộng đồng)

Màn hình bảng tin cộng đồng được chia theo feature:

```text
app/community.tsx
src/features/community/
  community-screen.tsx                # Ghép route screen và các thành phần cộng đồng
  community.styles.ts                 # Style dùng chung của màn hình cộng đồng
  components/
    community-header.tsx              # Back button, tiêu đề và nút xem lời mời kết bạn
    feed-tabs.tsx                     # Tab chuyển đổi "For You" và "Friend"
    friend-suggestion-card.tsx        # Thẻ gợi ý kết bạn đơn lẻ
    friend-suggestions-section.tsx    # Danh sách cuộn ngang gợi ý kết bạn
    feed-post-card.tsx                # Card bài đăng feed, video expo-video, High-Five và bình luận
    image-avatar.tsx                  # Avatar người dùng với fallback ảnh mặc định
    community-modals.tsx              # ErrorModal và DeleteCommentModal xác nhận xóa bình luận
  hooks/
    use-community.ts                  # State feed, tabs, high-five, bình luận, gợi ý kết bạn và modals
  types/
    community.ts                      # Props component và type của feature community
  utils/
    community-utils.ts                # Helper xử lý lỗi, format ngày và mapper toCommunityPost
```

Quy tắc:

- `app/community.tsx` chỉ làm entry point cho Expo Router (`export { default } from "@/src/features/community/community-screen"`).
- Giữ logic gọi service `socialService`, chuyển đổi tab, gửi lời mời kết bạn, high-five và bình luận trong `use-community.ts`.
- Component trong `components/` chỉ render UI và nhận dữ liệu/callback qua props.
- Helper format ngày, parse error message và chuyển đổi kiểu bài viết đặt trong `community-utils.ts`.
## Feature Settings (Hồ sơ & Cài đặt)

Màn hình cài đặt và thông tin tài khoản được chia theo feature:

```text
app/settings.tsx                      # Thin entry point trỏ sang src/features/settings
src/features/settings/
  settings-screen.tsx                 # Ghép route screen và các thành phần settings
  settings.styles.ts                  # Style dùng chung của màn hình settings & modal
  constants.ts                        # MENU_ITEMS danh sách điều hướng cài đặt
  components/
    settings-header.tsx               # Nút back và tiêu đề "Hồ sơ của tôi"
    settings-profile-card.tsx         # Thẻ hiển thị avatar và tên, link mở social profile
    settings-menu-list.tsx            # Danh sách mục cài đặt: Quyền riêng tư, Tài khoản, Thành viên, Đăng xuất
    account-modal.tsx                 # Modal xem chi tiết và chỉnh sửa hồ sơ kèm KeyboardAvoidingView
  hooks/
    use-settings.ts                   # Quản lý state profile, chọn avatar, cập nhật bio/name và logout
  types/
    settings.ts                       # Type MenuItem và Props các component
```

Quy tắc:

- `app/settings.tsx` chỉ làm entry point cho Expo Router (`export { default } from "@/src/features/settings/settings-screen"`).
- Giữ logic gọi service `authService`, `avatarService`, chọn ảnh đại diện và đăng xuất trong `use-settings.ts`.
- `account-modal.tsx` xử lý bàn phím thông qua `KeyboardAvoidingView` với `behavior={Platform.OS === 'android' ? 'padding' : 'height'}` và `keyboardVerticalOffset={0}`, co giãn tự động theo chiều cao khả dụng (`maxHeight: isKeyboardOpen ? '90%' : '85%'`). Kết hợp cùng `ref={scrollViewRef}` tự động cuộn đến `bioInput` khi focus, đảm bảo hiển thị hoàn hảo trên mọi kích thước màn hình Android (responsive) và android.
- Logout xóa token/session hiện tại nhưng không xóa cache local của người dùng.

## Feature Mood (Cảm xúc & Chọn Task)

Màn hình Mood và chọn 5 nhiệm vụ hàng ngày:

```text
app/mood.tsx                          # Thin entry point trỏ sang src/features/mood
src/features/mood/
  mood-screen.tsx                     # Ghép màn hình chính, thanh trượt cảm xúc, Mascot và bảng task
  mood.styles.ts                      # Style dùng chung của màn hình mood
  components/
    MoodMascot.tsx                    # Linh vật đổi biểu cảm mắt, miệng, lông mày theo cảm xúc
    mood-task-panel.tsx               # Khung chọn 5 nhiệm vụ hàng ngày
    mood-task-item.tsx                # Thẻ nhiệm vụ phẳng (không bo góc, không màu xanh nhạt)
  hooks/
    useMoodSelector.ts                # Hook quản lý slider và danh sách cảm xúc MOOD_OPTIONS
```

## Cache và tài khoản người dùng

Cache local phải tách theo `userId`. Không dùng key AsyncStorage chung cho nhiều tài khoản.

Các namespace hiện tại:

```text
@pentava/onboarding-data:{userId}
@pentava/onboarding-response:{userId}
@pentava/task-history:{userId}:{startDate}:{endDate}
@pentava/daily-status:{userId}:{goalId}
@pentava/checkin-image:{userId}:{progressId}
```

Mục tiêu bắt buộc:

1. Account A đăng nhập: đọc cache của A.
2. Logout A: xóa token/session hiện tại nhưng không xóa cache của A.
3. Account B đăng nhập: không được đọc cache của A.
4. Logout B rồi đăng nhập lại A: cache của A vẫn còn và được đọc lại.
5. Request cũ của A không được ghi dữ liệu sang cache của B.

Các file liên quan:

- `src/services/authStorage.ts`: lưu current user, access token và auth state listener.
- `src/services/authService.ts`: sau login thường/Google phải lưu current user.
- `src/services/taskCacheStorage.ts`: đọc/ghi cache daily task theo user.
- `src/context/onboarding-context.tsx`: onboarding persistence theo user.
- `app/settings.tsx`: logout xóa session/token, không xóa cache user.
- `src/features/tasks/hooks/use-daily-tasks.ts`: đọc cache trước, gọi API khi chưa có cache, cập nhật cache sau complete/confirm/swap.

## Hành vi server cần giữ

- Không gọi API tuần 1 đến tuần 10 tuần tự khi người dùng chuyển nhanh.
- Khi đổi tuần, chỉ nên tải dữ liệu tuần đang cần.
- `isActive` chỉ ngăn request cũ cập nhật state; nó không hủy HTTP request.
- Không gọi lại API nếu dữ liệu đã có cache phù hợp.
- Với nhiều request liên tiếp, ưu tiên debounce, AbortController hoặc cache nếu triển khai thêm.
- Không tự ý gọi 4 API tuần 1-4 để lấy swap candidates nếu chưa thống nhất API/backend mới.

## Modal daily tasks

`DailyTaskModals` là component dùng chung cho daily tasks và Home.

- Modal task hôm qua đã được tách khỏi `app/daily-tasks.tsx` và dùng lại trong `app/(tabs)/index.tsx`.
- Không tạo lại JSX modal cũ ở Home hoặc daily tasks.
- Nếu modal chỉ dùng một phần tính năng, truyền props rỗng hoặc callback no-op có chủ đích, nhưng không làm thay đổi UI ngoài yêu cầu.
- Tránh lồng `Pressable` trong `Pressable` vì trên web có thể tạo `<button>` lồng `<button>` và gây hydration error.

## Onboarding types

Các type context đã đưa sang:

```text
src/types/onboarding.ts
```

Bao gồm:

- `OnboardingData`
- `OnboardingContextValue`

Response API onboarding nằm trong:

```text
src/types/api/onboarding.ts
```

Không import domain type từ context nếu có thể đặt ở `src/types`.

## Authentication feature

Login business logic is separated from the Expo Router screen:

```text
app/login.tsx                         # Login UI and route composition
src/features/auth/hooks/use-login.ts  # Login, Google OAuth, forgot-password flow, modal state
src/services/authService.ts           # Backend calls, access token and current-user persistence
src/services/authStorage.ts           # AsyncStorage keys and auth-state listeners
```

Rules:

- Keep `app/login.tsx` focused on rendering UI and route-only actions such as opening `/register`.
- Keep React state, form validation, forgot-password step transitions, login-success navigation, and Google OAuth orchestration in `use-login.ts`.
- Do not move UI state or Expo Router logic into `authService.ts`; it is the API and persistence boundary.
- Google OAuth client IDs remain environment variables prefixed with `EXPO_PUBLIC_`; never put Google client secrets in the mobile app.
- Preserve the existing confirmation-modal sequence: successful login or OAuth only navigates after the user confirms the notification.

## Quy chuẩn Clean Code & Tối ưu hiệu năng (Clean Code & Optimization Guidelines)

Tài liệu này dành cho thành viên thực hiện nhiệm vụ Clean Code & Refactor. Mục tiêu: **Tối ưu hóa hiệu năng, giảm giật lag, chia nhỏ module dễ bảo trì mà KHÔNG làm thay đổi bất kỳ hành vi hay tính năng nào đang chạy.**

### 1. Nguyên tắc vàng khi Clean Code (Golden Rules)
- **TUYỆT ĐỐI KHÔNG VIẾT THÊM TÍNH NĂNG MỚI:** Không sửa flow API, không tự ý đổi logic nghiệp vụ, không đổi tên public routes hoặc storage keys.
- **THIN ROUTE RULE:** Thư mục `app/` chỉ chứa thin wrapper (dưới 50 dòng) để phục vụ Expo Router điều hướng. Toàn bộ UI, state, modal, styles chuyển về `src/features/<feature>/`.
- **KIẾN TRÚC 4 TẦNG FEATURE:**
  ```text
  src/features/<feature>/
    components/      # UI components thuần, nhận data qua props, bọc React.memo
    hooks/           # Custom hook quản lý state, effects, API calls và SWR cache
    types/           # TypeScript interfaces, props và data models riêng
    utils/           # Pure functions, formatters, hằng số cấu hình
  ```
- **BẢO TOÀN SWR & CACHE PERSISTENCE:** Các logic đọc cache `AsyncStorage` theo `userId` (ví dụ `@pentava/daily-status:{userId}:{goalId}`) bắt buộc giữ nguyên thứ tự: Đọc cache hiển thị 0ms -> Gọi API background cập nhật state và cache.

### 2. Kỹ thuật loại bỏ Giật Lag & Tối ưu Re-render (Anti-Lag & Performance)
- **Memoization đúng cách:**
  - Bọc tất cả component lá hoặc item trong danh sách bằng `React.memo`.
  - Bọc tất cả hàm callback truyền qua props (`onPress`, `onToggle`, ...) bằng `useCallback`.
  - Bọc các phép biến đổi dữ liệu mảng nặng (`filter`, `map`, `sort`) hoặc object style tính toán bằng `useMemo`.
- **Tối ưu List / ScrollView:**
  - Với danh sách dài, dùng `FlatList` thay vì map trực tiếp trong `ScrollView`.
  - Tránh truyền anonymous function `renderItem={() => ...}` hoặc `keyExtractor={(item) => ...}` trực tiếp trong JSX; hãy khai báo hàm riêng hoặc bọc `useCallback`.
  - Cấu hình FlatList tối ưu: `windowSize={5}`, `maxToRenderPerBatch={5}`, `initialNumToRender={5}`, `removeClippedSubviews={true}` trên Android.
- **Tối ưu Hình ảnh & Lottie:**
  - Dùng `expo-image` (`contentFit="contain"`, `cachePolicy="memory-disk"`) thay thế `Image` của `react-native`.
  - Với `lottie-react-native`, luôn bật `renderMode="HARDWARE"` và `hardwareAccelerationAndroid`. Kết hợp `useFocusEffect` để tắt loop khi màn hình mất focus (`autoPlay={isFocused}`, `loop={isFocused}`).
- **Phân tách StyleSheet khổng lồ:**
  - Tránh các file style tập trung hàng trăm dòng (>500 dòng). Tách style theo từng component con để tránh gom bộ nhớ và dễ sửa giao diện cục bộ.

### 3. Quy trình an toàn trước & sau khi Clean (Safety Checklist)
1. **Trước khi sửa:** Đọc kỹ luồng dữ liệu, các props truyền vào, các hook đang lắng nghe event.
2. **Trong khi tách:** Tách từng file nhỏ một, không refactor 10 file cùng một lúc.
3. **Sau khi tách:**
   - Chạy `npx eslint <cac-file-vua-sua>`
   - Chạy `npx tsc --noEmit` xác nhận 0 lỗi TypeScript
   - Mở app chạy thực tế kiểm tra xem chức năng và vị trí UI có bị ảnh hưởng không.

---

## Danh mục các Màn hình & File cần Clean Code (Refactoring Backlog)

Dưới đây là danh sách các file đang quá cồng kềnh, chứa lẫn lộn logic hoặc làm chậm ứng dụng, xếp theo độ ưu tiên:

| Độ ưu tiên | File cần xử lý | Số dòng | Vấn đề hiện tại | Hướng dẫn Clean an toàn |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **Cao nhất** | `src/features/tasks/custom-roadmap-screen.tsx` | ~1,844 dòng | File nguyên khối cực kỳ lớn, chứa toàn bộ state lộ trình, render node, modal, tính toán tuần và tương tác kéo thả. | Tách hook `use-custom-roadmap.ts`; tách các component con `roadmap-header.tsx`, `roadmap-node.tsx`, `roadmap-timeline.tsx`, `roadmap-modals.tsx`. |
| 🔴 **Cao nhất** | `src/features/assessment/components/assessment-report-view.tsx` | ~818 dòng | Trộn lẫn biểu đồ chart, radar, tính điểm và toàn bộ view report. | Tách các cụm chart thành component độc lập (`assessment-radar-chart.tsx`, `assessment-score-card.tsx`). |
| 🔴 **Cao nhất** | `src/features/home/home-screen.styles.ts` & `home-screen.tsx` | ~742 & 616 dòng | `home-screen.styles.ts` quá dài; `home-screen.tsx` ôm nhiều modal inline và logic phụ (NoGoalModal, StreakFreezeModal). | Chia nhỏ style vào từng component con tương ứng; tách modal phụ thành hook/component quản lý riêng. |
| 🔴 **Cao nhất** | `src/components/home/shop-sheet.tsx` | ~706 dòng | Bottom sheet mua đồ quá dài, trộn lẫn tab lọc, danh mục item và animation mua hàng. | Chuyển về đúng module `src/features/shop/` hoặc tách thành `shop-item-card.tsx`, `shop-category-tabs.tsx`. |
| 🟡 **Ưu tiên 2** | `app/social-profile.tsx` | ~646 dòng | Vi phạm quy tắc Thin Route; viết thẳng toàn bộ logic và JSX trang cá nhân mạng xã hội trong `app/`. | Tạo `src/features/community/social-profile-screen.tsx` (và hook `use-social-profile.ts`); để `app/social-profile.tsx` chỉ làm thin wrapper. |
| 🟡 **Ưu tiên 2** | `src/features/tasks/components/task-card.tsx` | ~594 dòng | Thẻ nhiệm vụ chứa quá nhiều animation con, popup swap task inline, modal checkin. | Tách popup swap task thành component riêng; tối ưu memoization để khi hoàn thành 1 task không render lại 4 task còn lại. |
| 🟡 **Ưu tiên 2** | `app/goal-assessment.tsx` | ~517 dòng | Vi phạm Thin Route; toàn bộ logic đánh giá mục tiêu nằm trong thư mục route. | Chuyển logic và JSX về `src/features/assessment/assessment-screen.tsx`. |
| 🟡 **Ưu tiên 2** | `src/features/tasks/hooks/use-daily-tasks.ts` | ~500 dòng | Hook quá ôm đồm: vừa gọi API, quản lý SWR cache, swap candidates, confirm modal. | Tách các hàm thuần toán sang `task-utils.ts`, chia nhỏ logic swap sang sub-hook `use-task-swap.ts`. |
| 🟡 **Ưu tiên 2** | `app/daily-tasks.tsx` | ~494 dòng | File route chứa cả danh sách task và modal, chưa tối ưu thin entry point. | Chuyển view sang `src/features/tasks/daily-tasks-screen.tsx`, route chỉ giữ vai trò composition. |
| 🟢 **Ưu tiên 3** | `src/features/cinema/cinema.styles.ts` & `journey-clip-modal.tsx` | ~699 & 470 dòng | Stylesheet lớn; modal xem clip video `expo-video` cần memoize để tránh giật lag khi cuộn video. | Tách player card thành component riêng, tối ưu memory leak khi unmount video player. |
| 🟢 **Ưu tiên 3** | `app/login.tsx` & `app/social-post.tsx` | ~380 & 362 dòng | Đang chứa UI phức tạp trong route `app/`. | Chuyển về `src/features/auth/` và `src/features/community/`. |

## Validation

Lệnh thường dùng:

```bash
npx eslint <files-changed>
npx tsc --noEmit
```

Project hiện có một số lỗi TypeScript nền ngoài phạm vi daily tasks ở theme/icon và `StyleSheet.absoluteFillObject`. Khi validation gặp chúng, cần phân biệt lỗi mới do thay đổi với lỗi có sẵn; không tự sửa lỗi ngoài task nếu người dùng không yêu cầu.

## Cách trả lời và làm việc

- Nếu yêu cầu chưa rõ, hỏi ngắn gọn trước khi thay đổi lớn.
- Nếu yêu cầu rõ, chỉnh code trực tiếp, không chỉ đưa proposal.
- Trước khi edit, đọc file hiện tại vì người dùng có thể đã chỉnh file.
- Giữ thay đổi nhỏ và đúng phạm vi.
- Sau edit phải chạy validation hẹp trước khi mở rộng phạm vi.
- Khi báo kết quả, nêu file đã đổi, hành vi đã giữ, validation đã chạy và lỗi còn lại nếu có.
- Không tự ý đổi tên public API, route hoặc key storage.
- Không xóa cache user khi logout trừ khi người dùng yêu cầu xóa dữ liệu tài khoản trên thiết bị.
