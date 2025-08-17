# Kifolio Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub repository with your code
2. Vercel account (free tier available)
3. Domain name (optional, can use Vercel subdomain initially)

### Steps

#### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your Kifolio repository
5. Vercel will auto-detect Next.js settings

#### 2. Add Environment Variables
In Vercel dashboard > Project > Settings > Environment Variables, add:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Email (Production)
RESEND_API_KEY=your_production_resend_api_key
EMAIL_FROM=Kifolio <noreply@yourdomain.com>
EMAIL_DOMAIN=yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# URLs
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 3. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test your live site

## Alternative: Deploy to Netlify

### Steps
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Site settings
5. Deploy

## Post-Deployment Checklist

### Essential Tests
- [ ] Site loads correctly
- [ ] User can sign up/login
- [ ] Portfolio creation works
- [ ] Email sending works
- [ ] All pages accessible
- [ ] Mobile responsive

### Performance Optimizations
- [ ] Image optimization enabled
- [ ] Caching headers configured
- [ ] CDN enabled (automatic with Vercel)
- [ ] Bundle size optimized

### Security Checks
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables secure
- [ ] Database permissions correct
- [ ] API routes protected

## Custom Domain Setup

### 1. Purchase Domain
- Use Namecheap, GoDaddy, or Cloudflare
- .com recommended for professional appearance

### 2. Configure DNS
In Vercel:
1. Go to Project > Settings > Domains
2. Add your domain
3. Follow DNS instructions

### 3. Update Environment Variables
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
EMAIL_DOMAIN=yourdomain.com
EMAIL_FROM=Kifolio <noreply@yourdomain.com>
```

## Monitoring & Maintenance

### Analytics Setup
- Vercel Analytics (built-in)
- Google Analytics
- PostHog (optional)

### Error Monitoring
- Vercel Error Monitoring
- Sentry (optional)

### Backup Strategy
- Supabase automatic backups
- Regular database exports
- Git repository backup

## Cost Estimation

### Free Tier (Good for Launch)
- Vercel: Free for personal projects
- Supabase: Free tier (500MB database, 50K monthly users)
- Resend: Free tier (3K emails/month)
- **Total: $0/month**

### Paid Tier (Scaling)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Resend Pro: $20/month
- Custom domain: $10-15/year
- **Total: ~$65/month + domain**

## Troubleshooting

### Build Fails
1. Check Node.js version compatibility
2. Verify all dependencies installed
3. Check TypeScript errors
4. Review build logs

### Site Won't Load
1. Check environment variables
2. Verify database connection
3. Check function logs
4. Test API endpoints

### Email Not Sending
1. Verify Resend API key
2. Check domain verification
3. Test from development
4. Review email service logs

## Support Resources
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-to-prod)
- [Resend Documentation](https://resend.com/docs)

---

**Ready to deploy?** Start with Vercel free tier, then scale up as needed!