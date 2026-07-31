// src/email_templates/masterLayout.ts

interface MasterLayoutProps {
  preheaderText: string;
  headerText: string;
  bodyHtml: string;
}

// ✅ SYNC: No async, no DB, no API calls — just pure speed!
export const createMasterEmailLayout = ({
  preheaderText,
  headerText,
  bodyHtml,
}: MasterLayoutProps): string => {
  const year = new Date().getFullYear();
  
  // ✅ Statically served from public folder (No DB/Cloudinary dependency)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketvalue.pk';
  const logoUrl = `${baseUrl}/email-logo.svg`; // Place your logo at public/email-logo.png

  const brandPrimary = '#F97316';
  const headerBgColor = '#ffffff';
  const bodyBgColor = '#F3F4F6';
  const darkBgColor = '#111827';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerText}</title>
      <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Helvetica Neue', Arial, sans-serif; }

        @media (prefers-color-scheme: dark) {
          .dark-bg { background-color: ${darkBgColor} !important; }
          .dark-text { color: #E5E7EB !important; }
          .dark-subtext { color: #9CA3AF !important; }
          .dark-border { border-color: #374151 !important; }
          .dark-card { background-color: #1F2937 !important; }
          .dark-header { background-color: #1F2937 !important; border-bottom: 1px solid #374151 !important; }
        }
      </style>
    </head>
    <body style="background-color: ${bodyBgColor}; margin: 0 !important; padding: 20px 0 !important;">
      <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheaderText}
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" class="dark-bg">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;" class="dark-border">
              
              <!-- LOGO & HEADER -->
              <tr>
                <td align="center" valign="top" style="padding: 30px 20px; background-color: ${headerBgColor}; border-bottom: 1px solid #e5e7eb; border-radius: 8px 8px 0 0;" class="dark-header">
                  <a href="https://www.pocketvalue.pk" target="_blank" style="text-decoration: none;">
                    <!-- ✅ STATIC LOGO FROM PUBLIC FOLDER (FASTEST!) -->
                    <img src="${logoUrl}" alt="PocketValue Logo" width="80" style="display: block; width: 80px; margin: 0 auto;">
                    <span style="display: block; color: #1F2937; font-size: 20px; font-weight: bold; margin-top: 10px;" class="dark-text">PocketValue</span>
                  </a>
                </td>
              </tr>
              
              <!-- MAIN HEADING -->
              <tr>
                <td align="center" style="padding: 20px 20px 0; background-color: #ffffff;" class="dark-card">
                   <h1 style="color: #1F2937; font-size: 24px; font-weight: bold; margin: 0; padding: 0;" class="dark-text">${headerText}</h1>
                </td>
              </tr>

              <!-- CONTENT BODY -->
              <tr>
                <td align="center" style="padding: 20px 30px 30px; background-color: #ffffff;" class="dark-card">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #4B5563; font-size: 16px; line-height: 1.6;" class="dark-text">
                        ${bodyHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- FOOTER -->
              <tr>
                <td align="center" style="padding: 30px 20px; background-color: #F9FAFB;" class="dark-card">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="font-size: 12px; color: #6B7280;" class="dark-subtext">
                        <p style="margin: 0 0 10px;">If you have any questions, reply to this email or contact us at <a href="mailto:support@pocketvalue.pk" style="color: ${brandPrimary}; text-decoration: none;">support@pocketvalue.pk</a>.</p>
                        <p style="margin: 0;">© ${year} PocketValue. All Rights Reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};