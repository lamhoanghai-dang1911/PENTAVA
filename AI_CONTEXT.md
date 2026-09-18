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
src/services/                # API services và local persistence
src/types/                   # Type dùng chung
src/types/api/               # Request/response DTO của backend
```

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
