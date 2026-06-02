const base = document.querySelector("#base"), mode = document.querySelector("#mode"), palette = document.querySelector("#palette"), css = document.querySelector("#css");
    function hexToHsl(hex) {
      let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b); let h=0, s=0, l=(max+min)/2;
      if (max !== min) { const d = max-min; s = l > .5 ? d/(2-max-min) : d/(max+min); h = max === r ? (g-b)/d + (g < b ? 6 : 0) : max === g ? (b-r)/d + 2 : (r-g)/d + 4; h *= 60; }
      return [h,s,l];
    }
    function hslToHex(h,s,l) {
      const a = s * Math.min(l, 1-l);
      const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); return Math.round(255*c).toString(16).padStart(2,"0"); };
      return `#${f(0)}${f(8)}${f(4)}`;
    }
    function harmony(hex) {
      const [h,s,l] = hexToHsl(hex);
      const sets = { complementary:[0,180,210,30,150], triadic:[0,120,240,60,300], analogous:[0,20,40,-20,-40], mono:[0,0,0,0,0] };
      return sets[mode.value].map((d,i) => hslToHex((h+d+360)%360, Math.min(1, s * (i ? .86 + i*.04 : 1)), Math.max(.18, Math.min(.82, l + (i-2)*.08))));
    }
    function contrast(hex) {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return (r*299 + g*587 + b*114) / 1000 < 130;
    }
    function render(colors = harmony(base.value)) {
      palette.innerHTML = colors.map((c,i) => `<button class="swatch ${contrast(c) ? "dark" : ""}" style="background:${c}" data-color="${c}"><strong>${c}</strong><span>Token ${i+1}</span></button>`).join("");
      css.value = `:root {\\n${colors.map((c,i) => `  --color-${i+1}: ${c};`).join("\\n")}\\n}`;
      document.querySelector("#preview").innerHTML = `<div class="mock" style="background:${colors[0]};color:${contrast(colors[0]) ? "#fff" : "#111"}"><h2>Primary surface</h2><p>Readable text preview.</p></div><div class="mock" style="background:linear-gradient(135deg,${colors[1]},${colors[3]});color:${contrast(colors[1]) ? "#fff" : "#111"}"><h2>Gradient card</h2><p>Harmony preview.</p></div>`;
    }
    function extract(file) {
      const img = new Image(), canvas = document.querySelector("#canvas"), ctx = canvas.getContext("2d");
      img.onload = () => {
        canvas.width = 80; canvas.height = 80; ctx.drawImage(img,0,0,80,80);
        const data = ctx.getImageData(0,0,80,80).data, buckets = {};
        for (let i=0; i<data.length; i+=16) {
          const r = Math.round(data[i]/32)*32, g = Math.round(data[i+1]/32)*32, b = Math.round(data[i+2]/32)*32;
          const key = `${r},${g},${b}`; buckets[key] = (buckets[key] || 0) + 1;
        }
        const colors = Object.entries(buckets).sort((a,b) => b[1]-a[1]).slice(0,5).map(([k]) => "#" + k.split(",").map(v => Math.min(255,+v).toString(16).padStart(2,"0")).join(""));
        render(colors);
      };
      img.src = URL.createObjectURL(file);
    }
    document.querySelector("#file").onchange = e => e.target.files[0] && extract(e.target.files[0]);
    document.querySelector("#drop").ondragover = e => e.preventDefault();
    document.querySelector("#drop").ondrop = e => { e.preventDefault(); if (e.dataTransfer.files[0]) extract(e.dataTransfer.files[0]); };
    palette.onclick = e => { const swatch = e.target.closest(".swatch"); if (swatch) navigator.clipboard.writeText(swatch.dataset.color); };
    document.querySelector("#copy").onclick = () => navigator.clipboard.writeText(css.value);
    base.oninput = () => render(); mode.onchange = () => render(); render();

