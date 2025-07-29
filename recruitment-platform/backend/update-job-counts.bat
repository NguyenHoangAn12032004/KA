@echo off
echo ===== Cập nhật số lượt xem và số ứng viên cho tất cả công việc =====
echo.

node scripts/update-job-counts.js

echo.
echo ===== Hoàn thành =====
pause 