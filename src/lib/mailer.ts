import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailConfig {
  user: string;
  pass: string;
  from: string;
}

// Create reusable transporter
const createTransporter = () => {
  console.log('🔧 Creating email transporter...');
  
  const config: EmailConfig = {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
    from: process.env.EMAIL_FROM!,
  };

  console.log('📧 Email config check:', {
    hasUser: !!config.user,
    hasPass: !!config.pass,
    hasFrom: !!config.from,
    userEmail: config.user ? config.user.substring(0, 3) + '***' : 'missing'
  });

  if (!config.user || !config.pass || !config.from) {
    console.error('❌ Missing email configuration:', {
      GMAIL_USER: !!process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM
    });
    throw new Error('Missing email configuration. Please check GMAIL_USER, GMAIL_APP_PASSWORD, and EMAIL_FROM environment variables.');
  }

  console.log('✅ Creating nodemailer transport with Gmail service...');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

export const sendMail = async (options: EmailOptions): Promise<void> => {
  console.log('📨 Starting email send process...');
  console.log('📧 Email details:', {
    to: options.to,
    subject: options.subject,
    hasHtml: !!options.html,
    hasText: !!options.text
  });

  try {
    console.log('🔧 Creating transporter...');
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully');

    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
    };

    console.log('📤 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length,
      textLength: mailOptions.text.length
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Email info:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
