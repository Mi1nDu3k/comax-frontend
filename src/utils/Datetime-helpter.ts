// src/utils/date-helper.ts
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/vi'; // Import ngôn ngữ tiếng Việt

// Kích hoạt các plugin
dayjs.extend(relativeTime);
dayjs.extend(utc);

// Thiết lập ngôn ngữ mặc định là tiếng Việt
dayjs.locale('vi');

/**
 * Tính khoảng cách thời gian từ hiện tại đến thời điểm được cung cấp.
 * Hỗ trợ đầu vào là chuỗi thời gian UTC.
 * Ví dụ: "vài giây trước", "2 phút trước", "1 ngày trước".
 * * @param dateString - Chuỗi thời gian (UTC)
 * @returns Chuỗi hiển thị khoảng cách thời gian
 */
export const formatTimeAgo = (dateString?: string | Date): string => {
    if (!dateString) return '';

    // 1. dayjs.utc(dateString): Parse chuỗi thời gian dười dạng UTC
    // 2. .local(): Chuyển đổi sang múi giờ của người dùng (Browser timezone)
    // 3. .fromNow(): Tính khoảng cách thời gian so với hiện tại
    return dayjs.utc(dateString).local().fromNow();
};


export const formatDateTime = (dateString?: string | Date, format = 'DD/MM/YYYY HH:mm'): string => {
    if (!dateString) return '';
    return dayjs.utc(dateString).local().format(format);
};