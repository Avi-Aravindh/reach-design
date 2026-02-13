/**
 * Screenshot Generator for Reach Landing Page Prototype
 * Generates high-resolution screenshots for design review
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function generateScreenshots() {
    console.log('Launching browser...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Viewport configurations
    const viewports = [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'mobile', width: 375, height: 812 }
    ];

    // Pages to capture
    const pages = [
        { name: 'landing-page', path: 'index.html' },
        { name: 'design-system', path: 'design-system.html' }
    ];

    for (const pageConfig of pages) {
        const filePath = `file://${path.join(__dirname, pageConfig.path)}`;

        for (const viewport of viewports) {
            console.log(`Capturing ${pageConfig.name} at ${viewport.name} (${viewport.width}x${viewport.height})...`);

            await page.setViewport({
                width: viewport.width,
                height: viewport.height,
                deviceScaleFactor: 2  // 2x for high-res
            });

            await page.goto(filePath, { waitUntil: 'networkidle0' });

            // Wait for fonts to load
            await page.evaluate(() => document.fonts.ready);

            // Wait a bit for animations to settle
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Full page screenshot
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, `${pageConfig.name}-${viewport.name}-full.png`),
                fullPage: true
            });

            // Above-the-fold screenshot (viewport only)
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, `${pageConfig.name}-${viewport.name}-viewport.png`),
                fullPage: false
            });

            console.log(`  ✓ Saved ${pageConfig.name}-${viewport.name}`);
        }
    }

    // Generate specific section screenshots (desktop only)
    console.log('\nCapturing individual sections...');

    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(`file://${path.join(__dirname, 'index.html')}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 500));

    const sections = [
        { name: 'hero', selector: '.hero' },
        { name: 'metrics', selector: '.metrics' },
        { name: 'features', selector: '.features' },
        { name: 'testimonial', selector: '.testimonial' },
        { name: 'pricing', selector: '.pricing' },
        { name: 'cta', selector: '.final-cta' },
        { name: 'footer', selector: '.footer' }
    ];

    for (const section of sections) {
        try {
            const element = await page.$(section.selector);
            if (element) {
                await element.screenshot({
                    path: path.join(SCREENSHOTS_DIR, `section-${section.name}.png`)
                });
                console.log(`  ✓ Saved section-${section.name}`);
            }
        } catch (err) {
            console.log(`  ✗ Could not capture ${section.name}: ${err.message}`);
        }
    }

    await browser.close();

    console.log('\n✅ Screenshots generated successfully!');
    console.log(`📁 Location: ${SCREENSHOTS_DIR}`);

    // List generated files
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    console.log('\nGenerated files:');
    files.forEach(file => console.log(`  - ${file}`));
}

generateScreenshots().catch(err => {
    console.error('Error generating screenshots:', err);
    process.exit(1);
});
