import { AccountContent } from "@/app/feature/account/components/account-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favourite Books | NextBook",
  description: "Xem và quản lý danh sách những cuốn sách bạn yêu thích nhất.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Hồ sơ
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Không gian cá nhân của bạn
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi những cuốn sách đã đánh dấu yêu thích và quay lại đọc bất cứ lúc nào.
          </p>
        </div>

        <AccountContent />
      </div>
    </div>
  );
}
