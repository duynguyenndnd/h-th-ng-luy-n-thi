# Hỗ Trợ Ký Hiệu Toán Học - Math Symbol Support

## Thay đổi đã thực hiện:

### 1. Cập nhật `MathText.tsx` 
- Component hiện tại hỗ trợ **tất cả các định dạng**:
  - `$...$` (inline math) - KaTeX inline
  - `$$...$$` (display math) - KaTeX display  
  - `\(...\)` (LaTeX inline)
  - `\[...\]` (LaTeX display)
  - **`${...}$` (tự động chuyển thành `$...$`)** - ✅ MỚI

### 2. Xử lý Tự động:
Mọi `${...}$` sẽ tự động chuyển thành `$...$` trước khi render

### 3. Ví dụ các định dạng được hỗ trợ:

```json
{
  "text": "Tính góc ${45^\\circ}$ (sẽ chuyển thành $45^\\circ$)",
  "explanation": "Ta có ${\\triangle ABD}$ vuông tại A"
}
```

## Cách sử dụng file JSON:

### Option 1: Dùng định dạng `${...}$` (tương thích với file cũ)
```json
{
  "text": "Phương trình ${x^2 + 2x = 0}$ có nghiệm là",
  "explanation": "Giải: ${x(x+2) = 0 \\Rightarrow x = 0 \\text{ hoặc } x = -2}$"
}
```

### Option 2: Dùng định dạng `$...$` (khuyến nghị)
```json
{
  "text": "Phương trình $x^2 + 2x = 0$ có nghiệm là",
  "explanation": "Giải: $x(x+2) = 0 \\Rightarrow x = 0 \\text{ hoặc } x = -2$"
}
```

## Cách khôi phục file đề 2.json:

File `đề 2.json` đã bị lỗi trong quá trình tự động sửa. Vui lòng cung cấp lại file gốc.

Hệ thống giờ sẽ tự động xử lý các ký hiệu toán học từ cả hai định dạng!

## Live URL: https://hethongluyenthi-e1386.web.app
