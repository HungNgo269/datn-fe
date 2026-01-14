# AGENTS.md — Frontend Next.js Performance + ESLint Fixes

## Mục tiêu chính

1. Sửa warning/lint: `react-hooks/set-state-in-effect` (tránh cascading renders).
2. Tối ưu render: giảm re-render không cần thiết, giảm hydration cost, giữ UX đúng.
3. Không thay đổi behavior UI trừ khi cần (nêu rõ nếu có thay đổi).

## Dự án

- Next.js 16.x, React 19.x
- Package manager: pnpm
- Scripts:
  - dev: `pnpm dev`
  - build: `pnpm build` (gồm `pnpm generate:api && next build`)
  - lint: `pnpm lint`

## Quy tắc khi Codex sửa code

- Ưu tiên giải pháp “derived state” hoặc “clamp trong render/updates” thay vì `setState` trong `useEffect`.
- Tránh tạo vòng: render -> effect -> setState -> render.
- Nếu bắt buộc dùng effect để sync external store, giải thích rõ “vì sao” và cân nhắc `startTransition` hoặc refactor.
- Giữ code rõ ràng, không thêm dependency mới trừ khi thực sự cần.
- Mọi thay đổi phải kèm:
  - Lý do
  - Ảnh hưởng hiệu năng (giảm render / tránh cascading)
  - Cách verify (lệnh)

## Task: Fix cụ thể cho lỗi đang gặp

File: `app/feature/account/components/readerBookmarksSection.tsx`

Hiện tại có effect:

```ts
useEffect(() => {
  if (page > totalPages) setPage(totalPages);
}, [page, totalPages]);
```
