import { BookOpen, Facebook, Twitter } from "lucide-react";

export default function FooterComponent() {
  return (
    <footer className="bg-background border-t py-8 sm:py-12 mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">NextBook</span>
            </div>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base max-w-xs">
              Cánh cửa dẫn đến những cuộc phiêu lưu đọc sách không giới hạn.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                rel="noreferrer noopener"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                rel="noreferrer noopener"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-6 sm:mt-0">
            <h4 className="font-semibold mb-3 sm:mb-4 text-base">Thư viện</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Duyệt sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Sách mới
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Sách bán chạy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Sách miễn phí
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-6 sm:mt-0">
            <h4 className="font-semibold mb-3 sm:mb-4 text-base">Cộng đồng</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Câu lạc bộ sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Đánh giá
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Sự kiện tác giả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Thử thách đọc sách
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-6 sm:mt-0">
            <h4 className="font-semibold mb-3 sm:mb-4 text-base">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 NextBook. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}
