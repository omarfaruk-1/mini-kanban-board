function registrationTemplate(name, url) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
      ">
        <div style="
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        ">

          <!-- Header -->
          <div style="
            background-color: #2563eb;
            padding: 28px 20px;
            text-align: center;
          ">
            <h1 style="
              margin: 0;
              color: #ffffff;
              font-size: 26px;
            ">
              Welcome!
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 35px 30px;">
            <h2 style="
              margin-top: 0;
              color: #1f2937;
              font-size: 22px;
            ">
              Hello ${name},
            </h2>

            <p style="
              font-size: 15px;
              line-height: 1.7;
              color: #4b5563;
            ">
              Thank you for registering with us. We're excited to have you
              on board!
            </p>

            <p style="
              font-size: 15px;
              line-height: 1.7;
              color: #4b5563;
            ">
              Please verify your email address by clicking the button below:
            </p>

            <!-- Button -->
            <div style="
              text-align: center;
              margin: 30px 0;
            ">
              <a
                href="${url}"
                style="
                  display: inline-block;
                  padding: 13px 28px;
                  background-color: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  font-size: 15px;
                  font-weight: bold;
                  border-radius: 7px;
                "
              >
                Verify Email
              </a>
            </div>

            <p style="
              font-size: 13px;
              line-height: 1.6;
              color: #6b7280;
            ">
              If you did not create an account with us, you can safely ignore
              this email.
            </p>

            <p style="
              margin-bottom: 0;
              font-size: 15px;
              color: #374151;
            ">
              Best regards,<br />
              <strong>Your Company Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="
            padding: 18px 20px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          ">
            <p style="
              margin: 0;
              font-size: 12px;
              color: #9ca3af;
            ">
              © ${new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
}

export default registrationTemplate;