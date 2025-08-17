# Email Template Editing Guide

This guide explains how to easily update email templates for the Kifolio application.

## 📁 Template Structure

Email templates are now organized in separate HTML files for easy editing:

```
src/lib/email/templates/
├── welcome-email.html       # Welcome email for new users
├── password-reset.html      # Password reset instructions
├── engagement.html          # Re-engagement marketing emails
├── invitation.html          # Invitation emails
└── template-loader.ts       # Template processing utility
```

## 🎨 How to Edit Templates

### 1. **Welcome Email**
**File**: `src/lib/email/templates/welcome-email.html`
**When sent**: Automatically when users sign up
**Variables available**:
- `{{USER_NAME}}` - User's display name
- `{{APP_URL}}` - Application URL for assets
- `{{LOGIN_URL}}` - Link to login page

**Example edits**:
```html
<!-- Change the greeting -->
<h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px; text-align: center;">
  Hey {{USER_NAME}}, welcome to the Kifolio family! 🚀
</h1>

<!-- Update getting started tips -->
<li style="margin-bottom: 8px;">🎯 Set your portfolio goals</li>
<li style="margin-bottom: 8px;">📸 Upload your best work</li>
```

### 2. **Password Reset Email**
**File**: `src/lib/email/templates/password-reset.html`
**When sent**: When users request password reset
**Variables available**:
- `{{USER_NAME}}` - User's display name
- `{{RESET_URL}}` - Password reset link
- `{{EXPIRES_AT}}` - Expiration date/time
- `{{APP_URL}}` - Application URL

### 3. **Engagement Email**
**File**: `src/lib/email/templates/engagement.html`
**When sent**: Marketing campaigns to re-engage users
**Variables available**:
- `{{ENGAGEMENT_TITLE}}` - Dynamic header based on user state
- `{{ENGAGEMENT_MESSAGE}}` - Personalized message
- `{{TIPS_TITLE}}` - Section title for tips
- `{{TIP_1}}`, `{{TIP_2}}`, `{{TIP_3}}` - Dynamic tips
- `{{CTA_URL}}` - Call-to-action link
- `{{CTA_TEXT}}` - Call-to-action button text

### 4. **Invitation Email**
**File**: `src/lib/email/templates/invitation.html`
**When sent**: When users invite others via the profile page
**Variables available**:
- `{{INVITER_NAME}}` - Name of person sending invite
- `{{PERSONAL_MESSAGE}}` - Optional personal message
- `{{INVITE_URL}}` - Sign-up link with invitation
- `{{EXPIRES_AT}}` - Invitation expiration date

## 🔧 Template Variables

### **Simple Variables**
Use `{{VARIABLE_NAME}}` for simple text replacement:
```html
<h1>Welcome, {{USER_NAME}}!</h1>
<a href="{{LOGIN_URL}}">Login here</a>
```

### **Conditional Blocks**
Use `{{#VARIABLE}}...{{/VARIABLE}}` for optional content:
```html
{{#PERSONAL_MESSAGE}}
<div style="background: #f8fafc; padding: 20px;">
  <p>"{{PERSONAL_MESSAGE}}"</p>
</div>
{{/PERSONAL_MESSAGE}}
```

If `PERSONAL_MESSAGE` is empty, the entire block is removed.

## 🎨 Styling Guidelines

### **Colors (Kifolio Brand)**
- Primary Blue: `#2563eb`
- Text Dark: `#1f2937`
- Text Medium: `#4b5563`
- Text Light: `#9ca3af`
- Background Light: `#f8fafc`
- Success Green: `#10b981`
- Warning Orange: `#f59e0b`

### **Typography**
```css
/* Headers */
font-size: 28px; font-weight: bold; color: #1f2937;

/* Body text */
font-size: 16px; line-height: 1.6; color: #4b5563;

/* Small text */
font-size: 14px; color: #6b7280;

/* Footer text */
font-size: 12px; color: #9ca3af;
```

### **Buttons**
```css
background: #2563eb; 
color: white; 
padding: 12px 30px; 
text-decoration: none; 
border-radius: 6px; 
font-weight: 600; 
display: inline-block;
box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
```

### **Cards/Sections**
```css
background: #f8fafc; 
padding: 20px; 
border-radius: 8px; 
margin: 20px 0; 
border-left: 4px solid #3b82f6;
```

## 📝 Common Edits

### **Change Button Text**
```html
<!-- In welcome-email.html -->
<a href="{{LOGIN_URL}}" style="...">
  Get Started Today  <!-- Change this text -->
</a>
```

### **Update Welcome Message**
```html
<!-- In welcome-email.html -->
<p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
  Thanks for joining our community! We're here to help you showcase your amazing work.
</p>
```

### **Add New Section**
```html
<!-- Add anywhere in the main content area -->
<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #1f2937; margin-top: 0;">New Section Title</h3>
  <p style="color: #4b5563; margin-bottom: 0;">Your content here...</p>
</div>
```

### **Change Logo**
```html
<!-- Update the logo source in any template -->
<img src="{{APP_URL}}/your-new-logo.svg" alt="Kifolio" style="height: 40px;" />
```

## 🧪 Testing Changes

1. **Edit template file** in your code editor
2. **Save the file**
3. **Test the email** by triggering it (e.g., sign up for welcome email)
4. **Check your email** to see the changes

No server restart needed - changes are applied immediately!

## 📱 Mobile Responsiveness

All templates are designed to work on mobile devices. Key principles:

- **Max width**: 600px with responsive padding
- **Font sizes**: Large enough for mobile reading
- **Buttons**: Touch-friendly size (44px+ height)
- **Images**: Responsive and optimized

## 🔍 Troubleshooting

### **Template not loading**
- Check file path: `src/lib/email/templates/[template-name].html`
- Ensure filename matches exactly (case-sensitive)
- Check for syntax errors in HTML

### **Variables not replacing**
- Ensure variable names match exactly: `{{USER_NAME}}`
- Check for typos in variable names
- Verify the variable is passed from the email service

### **Styling not working**
- Use inline CSS only (email clients don't support external CSS)
- Test in multiple email clients (Gmail, Outlook, etc.)
- Keep styles simple and widely supported

## 🚀 Advanced Customization

### **Add New Template**
1. Create new HTML file in `src/lib/email/templates/`
2. Add interface in `template-loader.ts`
3. Add loader function in `EmailTemplates`
4. Create service function in `service.ts`
5. Add API endpoint case in `route.ts`

### **Custom Variables**
1. Define in template loader interface
2. Pass from email service function
3. Use in HTML template with `{{VARIABLE_NAME}}`

### **Conditional Content**
Use conditional blocks for optional sections:
```html
{{#SHOW_TIPS}}
<div>Tips content here</div>
{{/SHOW_TIPS}}
```

---

## 📞 Need Help?

- **Template issues**: Check syntax and variable names
- **Styling problems**: Use inline CSS and test across email clients  
- **New features**: Modify template loader and service functions

Happy email templating! 🎉
