# Reach Landing Page — Figma Design Files

**Status:** Assets Ready for Figma Import
**Designer:** Jony
**Date:** February 13, 2026

---

## ⚠️ Important: Figma API Limitations

The Figma REST API is **read-only** for design content. It cannot:
- Create new files
- Add design elements/nodes
- Modify existing designs

The API only supports reading file data, posting comments, and managing variables/dev resources.

**Sources:**
- [Figma REST API Documentation](https://developers.figma.com/docs/rest-api/)
- [Figma Forum: Create new file programmatically](https://forum.figma.com/t/create-new-figma-file-and-upload-images-programmatically/37296)

---

## ✅ What's Provided

Instead of programmatic Figma file creation, I've prepared **comprehensive design assets** that can be quickly imported into Figma:

### Design Assets Location

```
/workspace/group/designs/figma-assets/
├── concept-1/          # Crystalline Flow
│   ├── color-palette.svg
│   ├── buttons.svg
│   └── hero-desktop.svg
├── concept-2/          # Vibrant Momentum
│   ├── color-palette.svg
│   ├── buttons.svg
│   └── hero-desktop.svg
├── concept-3/          # Warm Studio
│   ├── color-palette.svg
│   ├── buttons.svg
│   └── hero-desktop.svg
└── shared/
    └── (typography specimens, icons)
```

### Full Design Specification

📄 **Complete specs:** `/workspace/group/designs/reach-landing-redesign.md`

Contains:
- Color systems with exact hex values
- Typography scales
- Component specifications
- Animation guidelines
- Responsive breakpoints
- Page layouts (ASCII wireframes)

---

## 🚀 How to Create Figma Files

### Option 1: Manual Creation (Recommended)

1. **Create new Figma file:** Go to [figma.new](https://figma.new)

2. **Set up pages:**
   - Page 1: Cover
   - Page 2: Concept 1 — Crystalline Flow
   - Page 3: Concept 2 — Vibrant Momentum
   - Page 4: Concept 3 — Warm Studio
   - Page 5: Component Library

3. **Import SVG assets:**
   - Drag and drop the `.svg` files from `figma-assets/` into Figma
   - They'll import as editable vector groups
   - Ungroup and reorganize as needed

4. **Set up Color Styles:**
   - Use the color values from `reach-landing-redesign.md`
   - Create local styles for each concept

5. **Create Component Sets:**
   - Convert button variants to components
   - Create component sets for each state

### Option 2: Use Figma Community Template

Search Figma Community for "landing page design system" and adapt:
- Apply our color tokens
- Use our typography scale
- Follow our layout specs

### Option 3: Figma Plugin (html.to.design)

1. Convert our SVGs to simple HTML pages
2. Use the [html.to.design](https://www.figma.com/community/plugin/1159123024924461424/html.to.design) plugin
3. Import directly into Figma

---

## 📋 Quick Reference: Design Tokens

### Concept 1: Crystalline Flow

```
Primary Accent:    #6366F1 (Indigo)
Background:        #FAFAFA
Text Primary:      #0A0A0A
Text Secondary:    #525252
Border:            #E5E5E5
Font:              Inter, Geist
```

### Concept 2: Vibrant Momentum

```
Gradient:          #7C3AED → #EC4899
Background:        #0F0F0F
Text Primary:      #FFFFFF
Text Secondary:    #A1A1AA
Border:            rgba(255,255,255,0.1)
Font:              Geist, Cal Sans
```

### Concept 3: Warm Studio

```
Primary Accent:    #FF6B6B (Coral)
Secondary:         #2DD4BF (Teal)
Background:        #FFFBF7
Text Primary:      #1A1613
Text Secondary:    #5C534A
Border:            #E8DED5
Font:              Plus Jakarta Sans
```

---

## 📐 Frame Sizes

For each concept, create frames at:

| Device | Width | Notes |
|--------|-------|-------|
| Desktop | 1440px | Primary design |
| Tablet | 768px | iPad portrait |
| Mobile | 375px | iPhone standard |

---

## 🎬 Next Steps

1. **Manual Figma Creation:** Use the guide above to create files
2. **Stakeholder Review:** Share Figma link for concept selection
3. **Detail Phase:** Expand chosen concept with full page designs
4. **Handoff to Turing:** Provide dev-ready specs

---

## 💬 Need Help?

If you need the actual Figma files created, options include:
- **Hire a designer** to convert specs to Figma
- **Use Figma's MCP Server** (requires desktop app) for AI-assisted design
- **Request manual creation** through the team

---

*The design system is complete. The limiting factor is Figma's API, not our specifications.*

— Jony
