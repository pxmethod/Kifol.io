# Marketing Website Update Guide

## Overview
The marketing website is now live at the root route (`/`) and follows the Carrd structure with Kifolio branding. This guide shows you exactly where to make changes for common updates.

## File Location
**Main marketing page**: `src/app/page.tsx`

## Quick Updates Guide

### 1. **Hero Section** (Lines 45-65)
```tsx
{/* Hero Section */}
<section className="py-20 px-4 text-center bg-gradient-to-br from-kifolio-bg to-white">
  <div className="max-w-4xl mx-auto">
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
      Kifolio  {/* ← Change main headline here */}
    </h1>
    <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
      Simple, beautiful portfolios for your child&apos;s achievements. {/* ← Change subtitle here */}
      <br className="hidden md:block" />
      Create, showcase, and celebrate every milestone. {/* ← Change second line here */}
    </p>
    {/* CTA buttons remain the same */}
  </div>
</section>
```

### 2. **"What is Kifolio?" Section** (Lines 67-79)
```tsx
{/* What is Kifolio Section */}
<section className="py-20 px-4 bg-white">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
      What is Kifolio? {/* ← Change section title here */}
    </h2>
    <p className="text-lg text-gray-600 mb-12 leading-relaxed">
      Build beautiful portfolios for your children that showcase their work, {/* ← Change description here */}
      milestones, and achievements. Whether it&apos;s artwork, school projects, 
      sports accomplishments, or personal growth, Kifolio has you covered. 
      Simple, responsive, and yes — totally free.
    </p>
  </div>
</section>
```

### 3. **Demo Sites Preview** (Lines 81-130)
```tsx
{/* Demo Sites Preview */}
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
      See Kifolio in Action {/* ← Change section title here */}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Demo Site 1 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {/* ← Replace placeholder with actual image */}
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>Portfolio Preview</p>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Emma&apos;s Art Portfolio</h3> {/* ← Change name here */}
          <p className="text-gray-600 text-sm">Showcasing creative projects and artistic growth</p> {/* ← Change description here */}
        </div>
      </div>
      {/* Repeat for Demo Sites 2 & 3 */}
    </div>
  </div>
</section>
```

### 4. **Features Section** (Lines 132-180)
```tsx
{/* Features Section */}
<section className="py-20 px-4 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="grid md:grid-cols-3 gap-12">
      <div className="text-center">
        <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          {/* ← Icon remains the same */}
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beautiful Templates</h3> {/* ← Change feature title here */}
        <p className="text-gray-600 leading-relaxed">
          Start with one of our beautiful templates and make it your own. {/* ← Change feature description here */}
          Customize colors, layouts, and content to match your child&apos;s personality.
        </p>
      </div>
      {/* Repeat for Features 2 & 3 */}
    </div>
  </div>
</section>
```

### 5. **Call-to-Action Section** (Lines 182-195)
```tsx
{/* CTA Section */}
<section className="py-20 px-4 bg-gradient-to-br from-kifolio-primary to-kifolio-primary-dark">
  <div className="max-w-4xl mx-auto text-center text-white">
    <h2 className="text-3xl md:text-4xl font-bold mb-6">
      Ready to Get Started? {/* ← Change CTA title here */}
    </h2>
    <p className="text-xl mb-8 opacity-90">
      Join thousands of parents creating beautiful portfolios for their children {/* ← Change CTA subtitle here */}
    </p>
    <Link
      href="/auth/signup"
      className="inline-block bg-white text-kifolio-primary hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
    >
      Create Your First Portfolio {/* ← Change button text here */}
    </Link>
  </div>
</section>
```

### 6. **Footer** (Lines 197-230)
```tsx
{/* Footer */}
<footer className="bg-gray-900 text-white py-12 px-4">
  <div className="max-w-6xl mx-auto">
    <div className="grid md:grid-cols-4 gap-8">
      <div className="md:col-span-2">
        <Image 
          src="/kifolio_logo.svg" 
          alt="Kifolio Logo" 
          width={120}
          height={32}
          className="h-8 w-auto mb-4"
        />
        <p className="text-gray-400 mb-4">
          Create beautiful portfolios to showcase your children&apos;s work, {/* ← Change footer description here */}
          milestones, and achievements.
        </p>
      </div>
      {/* Footer links remain the same */}
    </div>
    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
      <p>&copy; 2024 Kifolio. All rights reserved.</p> {/* ← Change copyright year here */}
    </div>
  </div>
</footer>
```

## Adding Images

### Replace Placeholder Images
Currently using gray placeholders with icons. To add real images:

1. **Upload your image** to the `public/` folder
2. **Replace the placeholder div** with an `<Image>` component:

```tsx
{/* Before (placeholder) */}
<div className="h-48 bg-gray-200 flex items-center justify-center">
  <div className="text-gray-400 text-center">
    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    <p>Portfolio Preview</p>
  </div>
</div>

{/* After (real image) */}
<div className="h-48 bg-gray-200">
  <Image
    src="/your-image.jpg"
    alt="Portfolio Preview"
    width={400}
    height={192}
    className="w-full h-full object-cover"
  />
</div>
```

## Color Customization

### Brand Colors (defined in `tailwind.config.ts`)
- **Primary**: `kifolio-primary` (orange)
- **Background**: `kifolio-bg` (light gray)
- **Text**: `kifolio-text` (dark gray)

### Common Color Classes
- **White**: `bg-white`, `text-white`
- **Gray**: `bg-gray-50`, `bg-gray-100`, `text-gray-600`, `text-gray-900`
- **Gradients**: `bg-gradient-to-br from-kifolio-primary to-kifolio-primary-dark`

## Layout Adjustments

### Spacing
- **Section padding**: `py-20` (vertical), `px-4` (horizontal)
- **Container width**: `max-w-4xl` (narrow), `max-w-6xl` (wide)
- **Grid gaps**: `gap-8` (large), `gap-12` (extra large)

### Responsive Design
- **Mobile**: `grid-cols-1`
- **Tablet**: `md:grid-cols-2`
- **Desktop**: `lg:grid-cols-3`

## Common Updates

### 1. **Change Headlines**
Find the `<h1>` and `<h2>` tags and update the text between them.

### 2. **Update Descriptions**
Find the `<p>` tags and update the text between them.

### 3. **Modify Button Text**
Find the `<Link>` or `<button>` tags and update the text between them.

### 4. **Add New Sections**
Copy an existing section and modify the content, maintaining the same structure.

### 5. **Change Images**
Replace placeholder divs with `<Image>` components pointing to your uploaded images.

## Testing Changes

1. **Save the file** (`src/app/page.tsx`)
2. **Check the browser** at `http://localhost:3000`
3. **Verify responsive design** by resizing the browser window
4. **Test all links** to ensure they work correctly

## Need Help?

- **Structure questions**: Check the Carrd website (https://carrd.co) for inspiration
- **Styling issues**: Refer to Tailwind CSS documentation
- **Layout problems**: Compare with existing sections for consistency

The marketing website is designed to be easily maintainable while keeping the professional Carrd-style layout and Kifolio branding!
