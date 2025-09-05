# Environment Variables Setup for Portfolio Domain System

## Required Environment Variables

Create these environment variables in your deployment platform (Vercel) or local `.env.local` file:

### 1. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Email Configuration (Resend)
```bash
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Kifolio <noreply@kifol.io>
EMAIL_DOMAIN=kifol.io
SUPPORT_EMAIL=support@kifol.io
```

### 3. Events API Configuration (Ticketmaster)
```bash
NEXT_PUBLIC_TICKETMASTER_API_KEY=your_ticketmaster_api_key
```

### 4. Meetup API (Optional - for additional event sources)
```bash
NEXT_PUBLIC_MEETUP_CLIENT_ID=your_meetup_client_id
MEETUP_CLIENT_SECRET=your_meetup_client_secret
```

### 5. App URLs and Domains
```bash
NEXT_PUBLIC_APP_URL=https://kifol.io
NEXT_PUBLIC_PORTFOLIO_DOMAIN=my.kifol.io
```

### 5. Database Configuration
```bash
DATABASE_URL=your_database_connection_string
```

### 6. Authentication
```bash
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://kifol.io
```

## Portfolio Domain System

The portfolio domain system allows users to share portfolios at:
- `my.kifol.io/p/{short-id}` (short 6-character codes)

### How It Works:
1. **Portfolio Creation**: Generates unique UUID and short ID
2. **URL Generation**: Uses `NEXT_PUBLIC_PORTFOLIO_DOMAIN` environment variable
3. **Public Access**: Routes to `/p/[shortId]` page
4. **Sharing**: Users can copy and share the generated short URL

### Next.js Configuration:
- **Rewrites**: `my.kifol.io/p/:shortId` → `/p/:shortId`
- **Rewrites**: `my.kifol.io/preview/:portfolioId` → `/preview/:portfolioId`
- **Redirects**: `my.kifol.io/` → `https://kifol.io`

## Setup Steps

### 1. Local Development
```bash
# Copy environment variables
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### 2. Vercel Deployment
1. Go to your Vercel project settings
2. Add all environment variables
3. Redeploy the project

### 3. Domain Configuration
1. Ensure `kifol.io` points to Vercel
2. Ensure `my.kifol.io` points to Vercel
3. Verify SSL certificates are active

## Testing the Portfolio Domain System

1. **Create a portfolio** in the app
2. **Copy the generated URL** (should show `my.kifol.io/{id}`)
3. **Test the URL** in an incognito browser
4. **Verify it loads** the portfolio preview page

## Troubleshooting

### Portfolio URLs not working?
- Check `NEXT_PUBLIC_PORTFOLIO_DOMAIN` is set
- Verify DNS records for `my.kifol.io`
- Check Vercel domain configuration

### Build errors?
- Ensure all required environment variables are set
- Check Next.js configuration syntax
- Verify TypeScript types are correct
