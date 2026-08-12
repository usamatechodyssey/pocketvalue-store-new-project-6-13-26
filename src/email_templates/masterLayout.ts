// 📂 src/email_templates/masterLayout.ts

interface MasterLayoutProps {
  preheaderText: string;
  headerText: string;
  bodyHtml: string;
}

// ================================================================
// 🚀 MASTER EMAIL HTML LAYOUT (100% RECONCILED & INBOX-SAFE)
// ================================================================
export const createMasterEmailLayout = ({
  preheaderText,
  headerText,
  bodyHtml,
}: MasterLayoutProps): string => {
  const year = new Date().getFullYear();
  
  // ✅ 1. PRIMARY PRIORITY: Cloud PNG Image URL (Prevents broken image boxes in Gmail/Outlook!)
  const cloudLogoUrl = "https://i.ibb.co/KjQxLdMn/Logo1.png";
  
  // 2. FALLBACK SECONDARY PRIORITY: Local SVG Path
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketvalue.pk';
  const fallbackLogoUrl = `${baseUrl}/usamabrand.svg`;

  // ✅ 3. SYNC BRAND COLORS: Matched 1:1 with globals.css & admin.css
  const brandPrimary = '#FF8F32'; // Warm Orange
  const headerBgColor = '#ffffff';
  const bodyBgColor = '#F9FAFB'; // Premium soft zinc bg
  const darkBgColor = '#111827'; // Dark mode bg

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
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;" class="dark-border">
              
              <!-- LOGO & HEADER -->
              <tr>
                <td align="center" valign="top" style="padding: 30px 20px; background-color: ${headerBgColor}; border-bottom: 1px solid #e5e7eb; border-radius: 12px 12px 0 0;" class="dark-header">
                  <a href="https://www.pocketvalue.pk" target="_blank" style="text-decoration: none; display: block;">
                    <!-- ✅ CLOUD LOGO WITH LOCAL FALLBACK (Gmail & Outlook Compatible!) -->
                    <img 
                      src="${cloudLogoUrl}" 
                      onerror="this.onerror=null; this.src='${fallbackLogoUrl}';" 
                      alt="PocketValue Logo" 
                      width="64" 
                      style="display: block; width: 64px; height: 64px; margin: 0 auto; border-radius: 14px;"
                    >
                    <span style="display: block; color: #1F2937; font-size: 20px; font-weight: bold; margin-top: 12px;" class="dark-text">PocketValue</span>
                    <span style="display: block; color: ${brandPrimary}; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Your Pocket. Our Value.</span>
                  </a>
                </td>
              </tr>
              
              <!-- MAIN HEADING -->
              <tr>
                <td align="center" style="padding: 24px 20px 0; background-color: #ffffff;" class="dark-card">
                   <h1 style="color: #1F2937; font-size: 22px; font-weight: bold; margin: 0; padding: 0;" class="dark-text">${headerText}</h1>
                </td>
              </tr>

              <!-- CONTENT BODY -->
              <tr>
                <td align="center" style="padding: 20px 30px 30px; background-color: #ffffff;" class="dark-card">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #4B5563; font-size: 15px; line-height: 1.65; text-align: left;" class="dark-text">
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
                      <td align="center" style="font-size: 11px; color: #6B7280; line-height: 1.6;" class="dark-subtext">
                        <p style="margin: 0 0 10px;">If you have any questions, reply to this email or contact us at <a href="mailto:support@pocketvalue.pk" style="color: ${brandPrimary}; text-decoration: none; font-weight: bold;">support@pocketvalue.pk</a>.</p>
                        <p style="margin: 0 0 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: ${brandPrimary};">Your Pocket. Our Value.</p>
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