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

## Cache và tài khoản người dùng

Cache local phải tách theo `userId`. Không dùng key AsyncStorage chung cho nhiều tài khoản.

Các namespace hiện tại:

```text
@pentava/onboarding-data:{userId}
@pentava/onboarding-response:{userId}
@pentava/task-history:{userId}:{startDate}:{endDate}
@pentava/daily-status:{userId}:{goalId}
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
