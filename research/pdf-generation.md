# PDF Generation for SociSync - Research & Recommendations

**Date:** 6 Feb 2026  
**Context:** Next.js 14 app deployed on Vercel  
**Use Case:** Professional marketing reports with charts, branding, and data visualizations

---

## Executive Summary

**Recommended Approach: @react-pdf/renderer + chartjs-to-image**

For generating professional marketing reports with charts and branding on Vercel, `@react-pdf/renderer` offers the best balance of quality, Vercel compatibility, cost, and ease of use. For high-volume or complex requirements, consider a hybrid approach with external services as fallback.

---

## Option Comparison

### 1. @react-pdf/renderer (Server-Side)

**What it is:** React-based PDF renderer that generates PDFs on browser or server using a declarative component syntax.

#### Pros
- ✅ **Vercel Compatible:** Pure JavaScript, no native dependencies, works in serverless
- ✅ **React-Native Syntax:** Uses familiar flexbox layouts, easy for React devs
- ✅ **No Binary Dependencies:** Avoids Chromium/Puppeteer size issues
- ✅ **Server & Client:** Can generate on server (API routes) or client (browser)
- ✅ **Free & Open Source:** MIT license, 16k+ GitHub stars, 860k+ weekly downloads
- ✅ **Professional Output:** Clean PDF rendering with custom fonts, colors, images

#### Cons
- ⚠️ **No Direct Chart Support:** Must convert charts to images first (solvable)
- ⚠️ **Learning Curve:** Uses its own primitives (`<View>`, `<Text>`, `<Image>`) not standard HTML
- ⚠️ **CSS Subset:** Only supports subset of CSS (flexbox, no CSS Grid)

#### Charts Solution
```javascript
// Use chartjs-to-image to convert charts to base64
import ChartJsImage from 'chartjs-to-image';
import { Document, Page, Image } from '@react-pdf/renderer';

const chart = new ChartJsImage();
chart.setConfig({ type: 'bar', data: chartData });
const imageUrl = await chart.toDataUrl();

// Then use in PDF
<Image src={imageUrl} />
```

#### Vercel Compatibility
| Metric | Status |
|--------|--------|
| Bundle Size | ~2-3MB (well under 250MB limit) |
| Cold Start | Fast (~500ms) |
| Memory Usage | Low (~128-256MB) |
| Execution Time | Fast (seconds for typical reports) |

**Verdict:** ⭐⭐⭐⭐⭐ **Best Choice for Our Use Case**

---

### 2. react-pdf (Client-Side Viewer)

**What it is:** Library for *displaying* existing PDFs in React apps (NOT for generation).

#### Important Distinction
- `react-pdf` = **view** existing PDFs
- `@react-pdf/renderer` = **create** new PDFs

**Not applicable for our use case** - we need to *generate* PDFs, not display them.

**Verdict:** ❌ **Wrong tool for the job**

---

### 3. Puppeteer/Playwright (Headless Browser)

**What it is:** Headless Chrome automation to render HTML and capture as PDF.

#### Pros
- ✅ **Pixel-Perfect:** Renders exactly like browser, full CSS support
- ✅ **Existing HTML/CSS:** Can convert existing web pages/templates
- ✅ **Chart Libraries:** Works with any browser-based chart library natively

#### Cons
- ❌ **Vercel Complexity:** Requires special setup with `@sparticuz/chromium-min`
- ❌ **Large Bundle:** Chromium binary needs special handling (downloads at runtime)
- ❌ **Cold Start Penalty:** First request downloads chromium (~50MB), slow cold starts
- ❌ **Memory Intensive:** Needs 1-2GB memory for reliable operation
- ❌ **Timeout Risk:** Complex PDFs can exceed default timeouts

#### Vercel Setup Required
```javascript
// Requires special packages
npm install puppeteer-core @sparticuz/chromium-min

// Downloads chromium binary at runtime
executablePath: await chromium.executablePath(
  'https://github.com/Sparticuz/chromium/releases/download/v129.0.0/chromium-v129.0.0-pack.tar'
)
```

#### Vercel Compatibility
| Metric | Status |
|--------|--------|
| Bundle Size | ~50MB compressed (runtime download) |
| Cold Start | Slow (3-10 seconds first request) |
| Memory Usage | High (~1-2GB) |
| Execution Time | Moderate (5-30 seconds) |

| Plan | Timeout | Memory | Viable? |
|------|---------|--------|---------|
| Hobby | 60s max | 2GB | ⚠️ Risky |
| Pro | 300s max | 4GB | ✅ Works |
| Pro + Fluid | 800s max | 4GB | ✅ Comfortable |

**Verdict:** ⭐⭐⭐ **Viable but complex, better for pixel-perfect HTML needs**

---

### 4. External Services

#### PDFShift
**What it is:** API service using headless Chrome for HTML→PDF conversion.

| Feature | Details |
|---------|---------|
| Pricing | Free: 50 credits/month (5MB = 1 credit), Paid: from $9/month |
| Timeout | Free: 30s, Paid: 100s |
| Quality | Good (Chromium-based) |
| Features | CSS support, headers/footers, encryption |

**Pros:** Simple API, no infrastructure  
**Cons:** Per-document costs, external dependency, latency

#### DocRaptor
**What it is:** Premium API using Prince HTML (commercial rendering engine).

| Feature | Details |
|---------|---------|
| Pricing | Free: 5 docs/month, Paid: from $15/month |
| Quality | Excellent (Prince engine - print-quality) |
| Features | Full CSS3, advanced typography, HIPAA/SOC2 compliant |

**Pros:** Best quality output, compliance certifications  
**Cons:** Higher cost, requires Prince CSS knowledge

#### Comparison Table
| Service | Free Tier | Starting Price | Best For |
|---------|-----------|----------------|----------|
| PDFShift | 50 credits/mo | $9/month | Volume, simple docs |
| DocRaptor | 5 docs/mo | $15/month | Quality, compliance |
| API2PDF | 800/month | $14.99/month | Flexibility |

**Verdict:** ⭐⭐⭐⭐ **Good fallback option, consider for scale**

---

## Recommendation for SociSync

### Primary Approach: @react-pdf/renderer

**Why:**
1. **Vercel-Native:** No binary dependencies, works perfectly in serverless
2. **Cost:** Free, no per-document charges
3. **Control:** Full control over PDF layout and styling
4. **Performance:** Fast generation, low memory footprint
5. **Charts:** Use `chartjs-to-image` to convert charts to images

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  1. User requests report                                    │
│  2. Charts rendered in hidden canvas                        │
│  3. Charts converted to base64 images (chartjs-to-image)    │
│  4. POST to API with data + chart images                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Route (Vercel Function)                 │
├─────────────────────────────────────────────────────────────┤
│  1. Receive report data + chart images                      │
│  2. Build PDF using @react-pdf/renderer components          │
│  3. Add branding (logo, colors, fonts)                      │
│  4. Return PDF buffer                                       │
└─────────────────────────────────────────────────────────────┘
```

### Code Example

```typescript
// app/api/generate-report/route.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from '@/components/pdf/ReportDocument';

export async function POST(request: Request) {
  const { reportData, chartImages } = await request.json();
  
  const pdfBuffer = await renderToBuffer(
    <ReportDocument 
      data={reportData} 
      charts={chartImages}
    />
  );
  
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${Date.now()}.pdf"`,
    },
  });
}
```

```typescript
// components/pdf/ReportDocument.tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', marginBottom: 20 },
  logo: { width: 120, height: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  chart: { width: '100%', height: 200, marginVertical: 15 },
  // ... more styles
});

export const ReportDocument = ({ data, charts }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with branding */}
      <View style={styles.header}>
        <Image src="/logo.png" style={styles.logo} />
        <Text style={styles.title}>{data.title}</Text>
      </View>
      
      {/* Charts as images */}
      {charts.map((chart, i) => (
        <Image key={i} src={chart.base64} style={styles.chart} />
      ))}
      
      {/* Data tables, metrics, etc */}
    </Page>
  </Document>
);
```

### Fallback Strategy

For edge cases (very complex layouts, pixel-perfect HTML needs):

1. **Primary:** @react-pdf/renderer (99% of cases)
2. **Fallback:** PDFShift API for complex HTML templates

```typescript
async function generatePDF(data: ReportData) {
  try {
    // Try @react-pdf/renderer first
    return await generateWithReactPDF(data);
  } catch (error) {
    // Fallback to external service for complex cases
    console.warn('Falling back to PDFShift:', error);
    return await generateWithPDFShift(data);
  }
}
```

---

## Cost Analysis

### @react-pdf/renderer (Recommended)
| Component | Cost |
|-----------|------|
| Library | Free (MIT) |
| Vercel Functions | Included in plan |
| Font licensing | Check font licenses |
| **Monthly estimate** | **$0** (within Vercel limits) |

### External Service (High Volume)
| Volume | PDFShift | DocRaptor |
|--------|----------|-----------|
| 50/month | Free | $15/month |
| 500/month | $24/month | $35/month |
| 2,500/month | $49/month | $75/month |
| 10,000/month | $99/month | $225/month |

---

## Final Recommendations

### For MVP/Launch
✅ Use `@react-pdf/renderer` with `chartjs-to-image`
- Zero external costs
- Full control over design
- Vercel-native compatibility

### For Scale (1000+ reports/month)
Consider hybrid approach:
- `@react-pdf/renderer` for standard reports
- External API for complex/custom templates
- Implement caching for repeated report structures

### Implementation Checklist
- [ ] Install: `npm install @react-pdf/renderer chartjs-to-image`
- [ ] Create PDF template components
- [ ] Set up custom fonts (register with react-pdf)
- [ ] Build chart-to-image utility
- [ ] Create API route for generation
- [ ] Add download/preview UI components
- [ ] Test memory usage on Vercel
- [ ] Add error handling and fallbacks

---

## Resources

- [@react-pdf/renderer docs](https://react-pdf.org/)
- [Charts in react-pdf (Stack Overflow)](https://stackoverflow.com/questions/75210938/how-to-use-chart-js-or-recharts-in-react-pdf-renderer)
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- [chartjs-to-image](https://www.npmjs.com/package/chartjs-to-image)
- [PDFShift API](https://pdfshift.io/)
- [DocRaptor API](https://docraptor.com/)
