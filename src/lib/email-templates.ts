export const emailTemplates = {
  // 1. Đăng ký tài khoản (OTP)
  registerOtp: (code: string) => ({
    subject: "Mã OTP kích hoạt tài khoản Vinh Danh Trực Tuyến",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a56db;">Trường Cao đẳng Bách Khoa Nam Sài Gòn</h2>
          <h3>Kích hoạt tài khoản</h3>
        </div>
        <p>Chào bạn,</p>
        <p>Bạn đã đăng ký tài khoản trên hệ thống Vinh Danh Trực Tuyến. Vui lòng sử dụng mã OTP dưới đây để kích hoạt tài khoản của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a56db; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Mã OTP này có hiệu lực trong vòng 5 phút.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <br>
        <p>Trân trọng,<br>Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn</p>
      </div>
    `
  }),

  // 2. Quên mật khẩu (OTP)
  forgotPasswordOtp: (code: string) => ({
    subject: "Mã OTP đặt lại mật khẩu Vinh Danh Trực Tuyến",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a56db;">Trường Cao đẳng Bách Khoa Nam Sài Gòn</h2>
          <h3>Đặt lại mật khẩu</h3>
        </div>
        <p>Chào bạn,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để xác nhận:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a56db; background: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>Mã OTP này có hiệu lực trong vòng 5 phút.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, hãy bảo mật tài khoản và bỏ qua email này.</p>
        <br>
        <p>Trân trọng,<br>Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn</p>
      </div>
    `
  }),

  // 3. Nộp hồ sơ thành công
  applicationSubmitted: (userName: string, campaignName: string) => ({
    subject: "Xác nhận nộp hồ sơ thành công",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1a56db;">Trường Cao đẳng Bách Khoa Nam Sài Gòn</h2>
          <h3>Nộp hồ sơ thành công</h3>
        </div>
        <p>Chào <strong>${userName}</strong>,</p>
        <p>Hệ thống đã ghi nhận hồ sơ của bạn cho đợt vinh danh: <strong>${campaignName}</strong>.</p>
        <p>Hồ sơ của bạn hiện đang ở trạng thái <strong>Chờ duyệt</strong>. Ban tổ chức sẽ tiến hành xét duyệt và thông báo kết quả đến bạn trong thời gian sớm nhất.</p>
        <p>Cảm ơn bạn đã tham gia!</p>
        <br>
        <p>Trân trọng,<br>Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn</p>
      </div>
    `
  }),

  // 4. Trạng thái hồ sơ
  applicationStatus: (userName: string, campaignName: string, status: string, feedback?: string) => {
    let statusText = "";
    let color = "";
    if (status === "APPROVED") {
      statusText = "ĐÃ ĐƯỢC DUYỆT";
      color = "#10b981"; // green
    } else if (status === "REJECTED") {
      statusText = "TỪ CHỐI";
      color = "#ef4444"; // red
    } else if (status === "CHANGES_REQUESTED") {
      statusText = "YÊU CẦU CHỈNH SỬA";
      color = "#f59e0b"; // yellow
    }

    return {
      subject: `Cập nhật trạng thái hồ sơ: ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1a56db;">Trường Cao đẳng Bách Khoa Nam Sài Gòn</h2>
            <h3>Cập nhật trạng thái hồ sơ</h3>
          </div>
          <p>Chào <strong>${userName}</strong>,</p>
          <p>Hồ sơ của bạn cho đợt vinh danh <strong>${campaignName}</strong> đã được cập nhật trạng thái.</p>
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${color}; background-color: #f9fafb;">
            <p style="margin: 0;">Trạng thái mới: <strong style="color: ${color};">${statusText}</strong></p>
            ${feedback ? `<p style="margin-top: 10px;"><strong>Phản hồi từ ban xét duyệt:</strong><br>${feedback}</p>` : ''}
          </div>
          <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>
          <br>
          <p>Trân trọng,<br>Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn</p>
        </div>
      `
    };
  }
};
