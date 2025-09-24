const fs = require('fs');
const path = require('path');

// Auto-discover all section files
function discoverSections() {
  const sections = [];
  const sectionFiles = fs.readdirSync('./sections/');
  
  // Find all .css files and match with .js files
  sectionFiles.forEach(file => {
    if (file.endsWith('.css')) {
      const sectionName = file.replace('.css', '');
      const jsFile = `${sectionName}.js`;
      
      if (fs.existsSync(`./sections/${jsFile}`)) {
        sections.push(sectionName);
        console.log(`📁 Found section: ${sectionName}`);
      }
    }
  });
  
  return sections;
}

function buildGHLSection(sectionName) {
  try {
    // Read section files
    const css = fs.readFileSync(`./sections/${sectionName}.css`, 'utf8');
    const js = fs.readFileSync(`./sections/${sectionName}.js`, 'utf8');
    
    // Read core system files (if they exist)
    let engineCSS = '', engineJS = '', liveCSS = '', liveJS = '', functions = '';
    
    if (fs.existsSync('./shockwave-engine.css')) {
      engineCSS = fs.readFileSync('./shockwave-engine.css', 'utf8');
    }
    if (fs.existsSync('./shockwave-engine.js')) {
      engineJS = fs.readFileSync('./shockwave-engine.js', 'utf8');
    }
    if (fs.existsSync('./shockwave-live.css')) {
      liveCSS = fs.readFileSync('./shockwave-live.css', 'utf8');
    }
    if (fs.existsSync('./shockwave-live.js')) {
      liveJS = fs.readFileSync('./shockwave-live.js', 'utf8');
    }
    if (fs.existsSync('./shockwave-functions.js')) {
      functions = fs.readFileSync('./shockwave-functions.js', 'utf8');
    }
    
    // Build GHL-ready code
    const ghlCode = `<style>
/* SHOCKWAVE CORE STYLES */
${engineCSS}

/* SHOCKWAVE LIVE STYLES */
${liveCSS}

/* ${sectionName.toUpperCase()} SECTION STYLES */
${css}
</style>

<script>
// SHOCKWAVE CORE FUNCTIONS
${functions}

// SHOCKWAVE ENGINE
${engineJS}

// SHOCKWAVE LIVE SYSTEM
${liveJS}

// ${sectionName.toUpperCase()} SECTION LOGIC
(function() {
  'use strict';
  ${js}
})();
</script>`;

    // Ensure dist directory exists
    if (!fs.existsSync('./dist/')) {
      fs.mkdirSync('./dist/');
    }
    
    // Save GHL-ready file
    fs.writeFileSync(`./dist/${sectionName}-ghl-ready.html`, ghlCode);
    console.log(`✅ ${sectionName} → dist/${sectionName}-ghl-ready.html`);
    
  } catch (error) {
    console.error(`❌ Error building ${sectionName}:`, error.message);
  }
}

// Auto-build all discovered sections
console.log('🚀 ShockwaveHQ Build System Starting...\n');

const sections = discoverSections();

if (sections.length === 0) {
  console.log('⚠️  No sections found. Make sure you have matching .css and .js files in ./sections/');
} else {
  sections.forEach(buildGHLSection);
  console.log(`\n🎉 Built ${sections.length} section(s) for GHL deployment!`);
  console.log('📂 Check ./dist/ folder for ready-to-copy code\n');
}
