# Deployment & Production Guidelines

## Build Process

The application now uses a proper PostCSS pipeline for production:

```bash
# Development
npm run dev

# Production Build
npm run build

# Preview built version
npm run preview
```

## What Was Changed

### Tailwind CSS Setup
**Before:** Loaded directly from CDN
```html
<!-- ❌ Not for production -->
<script src="https://cdn.tailwindcss.com"></script>
```

**After:** Built with PostCSS during production build
```bash
# PostCSS processes: @tailwind directives → optimized CSS
npm run build  # Generates: dist/assets/index-*.css
```

### CSS Processing Pipeline
```
src/index.css
  ↓ (Tailwind directives)
  ↓ (@tailwind base, components, utilities)
  ↓ (PostCSS processes)
  ↓
dist/assets/index-BiznId4g.css (9.75 kB gzip)
```

## Environment Variables

Make sure `.env.local` is configured:

```env
VITE_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` successfully
- [ ] Check `dist/` folder is created
- [ ] Verify no console errors in production build
- [ ] Test on local preview: `npm run preview`

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or with environment variables
vercel --env VITE_API_KEY=xxx --env VITE_GEMINI_API_KEY=xxx
```

### Environment Variables (Vercel)
Set in Vercel Project Settings → Environment Variables:
```
VITE_API_KEY = AIzaSy...
VITE_GEMINI_API_KEY = AIzaSy...
VITE_FIREBASE_API_KEY = AIzaSy...
```

## Performance Metrics

### Build Output
- **CSS:** 9.75 kB (gzip: 2.44 kB)
- **JS:** 1,288.34 kB (gzip: 330.79 kB)
- **HTML:** 2.31 kB (gzip: 1.05 kB)
- **Total:** ~1.3 MB (gzip: ~333 KB)

### Optimization Tips

1. **Code Splitting** (Future)
   - Use dynamic imports for large components
   - Split ExamRunner, ExamEditor into separate chunks

2. **Bundle Analysis**
   ```bash
   npm install -D rollup-plugin-visualizer
   # Add to vite.config.ts for visualization
   ```

3. **Lazy Loading**
   - Images
   - Heavy components
   - External libraries

## Troubleshooting

### "Tailwind CSS not working"
- [ ] Check `tailwind.config.js` exists
- [ ] Check `src/index.css` has `@tailwind` directives
- [ ] Check `index.tsx` imports the CSS file
- [ ] Rebuild: `npm run build`

### "CSS not loading in production"
- [ ] Check `dist/assets/index-*.css` file exists
- [ ] Verify CSS is included in HTML: `<link rel="stylesheet" href="...css">`
- [ ] Check browser dev tools Network tab

### "PostCSS plugin error"
- [ ] Delete `node_modules` and `package-lock.json`
- [ ] Run `npm install`
- [ ] Rebuild: `npm run build`

## Security Notes

⚠️ **Keep API Keys Safe:**
- Never commit `.env.local` to Git
- Use `.env.local` for local development
- Use Vercel/deployment platform's environment variables for production
- Rotate API keys regularly

## Next Production Release

### v1.1.0 Improvements
- [ ] Code splitting for better performance
- [ ] Service worker for offline support
- [ ] Image optimization
- [ ] Reduce JS bundle size
- [ ] Add caching strategies
- [ ] Implement proper error boundaries

---

**Last Updated:** 23/01/2026
**Build Status:** ✅ Production Ready
