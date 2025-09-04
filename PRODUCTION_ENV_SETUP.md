# Production Environment Variables Setup

## Required Environment Variables for Production

Create these environment variables in your deployment platform (Vercel, Netlify, etc.):

### 1. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### 2. Email Configuration (Resend)
```bash
RESEND_API_KEY=your_production_resend_api_key
EMAIL_FROM=Kifolio <noreply@yourdomain.com>
EMAIL_DOMAIN=yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

### 3. Events API Configuration (Ticketmaster)
```bash
NEXT_PUBLIC_TICKETMASTER_API_KEY=your_production_ticketmaster_api_key
```

### 4. Meetup API (Optional - for additional event sources)
```bash
NEXT_PUBLIC_MEETUP_CLIENT_ID=your_meetup_client_id
MEETUP_CLIENT_SECRET=your_meetup_client_secret
```

### 5. App URLs
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Setup Steps

### Step 1: Supabase Production Database
1. Create a new Supabase project for production (separate from development)
2. Run the SQL schema from `SUPABASE_SETUP.md`
3. Get your production URL and anon key
4. Add to deployment platform environment variables

### Step 2: Email Domain Setup
1. Purchase/configure your domain
2. Add domain to Resend dashboard
3. Configure DNS records (DKIM, SPF, DMARC)
4. Update EMAIL_FROM and EMAIL_DOMAIN variables
5. Test email delivery

### Step 3: Deployment Platform
1. Connect your git repository
2. Add all environment variables
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

## Security Notes
- Never commit production API keys to git
- Use different Supabase projects for dev/staging/production
- Rotate API keys regularly
- Monitor email quotas and costs

## Testing Checklist
- [ ] Supabase connection works
- [ ] User signup/login works
- [ ] Email sending works
- [ ] Portfolio creation works
- [ ] File uploads work (if implemented)
- [ ] All pages load correctly
- [ ] Mobile responsiveness works