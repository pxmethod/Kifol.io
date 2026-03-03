# Kifolio Email Service Setup

This document provides instructions for setting up and configuring the email service for the Kifolio application using MailerSend.

## 📧 Email Service Overview

Kifolio uses **MailerSend** as the email service provider for sending transactional and engagement emails. The email service supports:

- ✅ Welcome emails on sign-up
- ✅ Password reset emails
- ✅ Invitation emails
- ✅ Engagement emails
- 🔜 Monthly invoice confirmations (future)
- 🔜 Cancellation confirmations (future)

## 🚀 Getting Started

### 1. Create MailerSend Account

1. Visit [mailersend.com](https://www.mailersend.com) and create an account
2. Verify your email address
3. Access your dashboard

### 2. Get API Key

1. Go to your MailerSend dashboard
2. Navigate to "API Tokens" (or Integrations > API)
3. Create a new token
4. Give it a name (e.g., "Kifolio Production" or "Kifolio Development")
5. Copy the generated API key

### 3. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Email Configuration (MailerSend)
MAILERSEND_API_KEY=your_mailersend_api_key_here

# Email Settings
EMAIL_FROM=Kifolio <noreply@kifolio.com>
EMAIL_DOMAIN=kifolio.com
SUPPORT_EMAIL=support@kifolio.com

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Domain Configuration (Production)

For production, you'll need to:

1. **Add your domain to MailerSend:**
   - Go to Domains in your MailerSend dashboard
   - Add your domain (e.g., `kifolio.com`)
   
2. **Configure DNS records:**
   - Add the DKIM, SPF, and DMARC records provided by MailerSend
   - Wait for verification (can take up to 72 hours)

3. **Update environment variables:**
   ```bash
   EMAIL_FROM=Kifolio <noreply@yourdomain.com>
   EMAIL_DOMAIN=yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## 📁 File Structure

```
src/
├── lib/
│   └── email/
│       ├── client.ts              # MailerSend client configuration
│       ├── service.ts             # Email sending functions
│       ├── types.ts               # TypeScript interfaces
│       └── templates/
│           ├── WelcomeEmail.tsx   # Welcome email template
│           ├── PasswordResetEmail.tsx # Password reset template
│           └── EngagementEmail.tsx # Engagement email template
└── app/
    └── api/
        └── email/
            └── send/
                └── route.ts       # Email API endpoint
```

## 🔧 Usage Examples

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email/service';

const result = await sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'John Doe',
  subject: 'Welcome to Kifolio!',
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Send via API

```typescript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    data: {
      to: 'user@example.com',
      userName: 'John Doe',
    }
  }),
});
```

## 🎨 Email Templates

All email templates are built with React Email and support:

- **Responsive Design**: Mobile-friendly layouts
- **Brand Consistency**: Uses Kifolio colors and styling
- **Accessibility**: Proper semantic HTML and alt text
- **Dark Mode**: Consistent across email clients

### Template Features

- **Header**: Kifolio logo and branding
- **Main Content**: Dynamic content based on email type
- **Footer**: Legal links and unsubscribe options
- **Security**: Safe handling of user data and links

## 🧪 Testing

### Development Testing

```bash
# Test email service (development only)
curl "http://localhost:3000/api/email/send?email=test@example.com"
```

### Preview Templates

React Email provides a preview server:

```bash
npx react-email dev
```

This opens a browser with live previews of all email templates.

## 📊 Monitoring

### Email Analytics

MailerSend provides built-in analytics for:
- Delivery rates
- Open rates
- Click-through rates
- Bounce rates
- Spam complaints

### Error Handling

The email service includes comprehensive error handling:

```typescript
// Email service never throws - always returns result object
const result = await sendWelcomeEmail(data);

if (!result.success) {
  // Handle error gracefully
  console.error('Email error:', result.error);
  // Continue with application flow
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Rate Limiting**: MailerSend includes built-in rate limiting
3. **Validation**: All email data is validated before sending
4. **Error Logging**: Failed emails are logged but don't expose sensitive data
5. **Unsubscribe**: All marketing emails include unsubscribe links

## 💰 Pricing

### MailerSend Pricing
- **Free Tier**: 3,000 emails/month
- **Pro Tier**: $20/month for 50,000 emails
- **Additional**: $1 per 10,000 emails beyond tier limit

### Cost Optimization
- Transactional emails only sent when necessary
- Engagement emails respect user preferences
- Failed sends don't count against quota

## 🚨 Troubleshooting

### Common Issues

1. **"API key not found"**
   - Check `.env.local` file exists
   - Verify `MAILERSEND_API_KEY` is set correctly
   - Restart development server

2. **"Domain not verified"**
   - Check DNS records in your domain provider
   - Wait up to 72 hours for propagation
   - Use sandbox domain for testing

3. **"Template not rendering"**
   - Check React Email syntax
   - Verify all imports are correct
   - Test template in React Email preview

4. **High bounce rate**
   - Verify domain authentication
   - Check email content for spam triggers
   - Monitor sender reputation

### Support

- **MailerSend Documentation**: [developers.mailersend.com](https://developers.mailersend.com)
- **React Email Docs**: [react.email](https://react.email)
- **Kifolio Support**: Contact development team

---

## ✅ Setup Checklist

- [ ] MailerSend account created
- [ ] API key generated and added to `.env.local`
- [ ] Domain configured (production only)
- [ ] DNS records added (production only)
- [ ] Email templates tested
- [ ] Welcome email integrated with sign-up
- [ ] Invitation email integrated with invitations feature
- [ ] Email preferences configured in user profile
- [ ] Error handling and logging implemented
- [ ] Analytics and monitoring set up

## 🔮 Future Enhancements

- A/B testing for email templates
- Advanced segmentation for engagement emails
- Email automation workflows
- Custom email builder for marketing campaigns
- Integration with customer support system
- SMS notifications via Twilio
- Push notifications for mobile app
