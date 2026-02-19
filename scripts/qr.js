const state = {
  text: "",
  ecc: "H",
  fg: "#000000",
  bg: "#ffffffff",
  url: "",
  canDownload: false
};


// --------------------
// URL → State
// --------------------
function urlToState() {
  const p = new URLSearchParams(location.search);

  state.text = decodeURIComponent(p.get("text") || "");
  state.ecc = p.get("ecc") || "H";
  state.fg = "#" + (p.get("fg") || "000000");
  state.bg = "#" + (p.get("bg") || "ffffff");
  state.logo = p.get("logo") || "";
}


// --------------------
// State → URL
// --------------------
function stateToURL() {
  const p = new URLSearchParams();

  p.set("text", encodeURIComponent(state.text));
  p.set("ecc", state.ecc);
  p.set("fg", state.fg.replace("#", ""));
  p.set("bg", state.bg.replace("#", ""));
  p.set("logo", state.logo);

  history.replaceState(
    null,
    "",
    "?" + p.toString()
  );
}


// --------------------
// Safe Logo Size
// --------------------
function getSafeLogoSize(size, ecc) {
  const rate = { L:0.07, M:0.15, Q:0.25, H:0.30 };
  return Math.sqrt(size*size*rate[ecc]) * 0.6;
}


// --------------------
// QR 생성
// --------------------
async function generateQR() {

  if (!state.text) return;

  const svgString = await QRCode.toString(
    state.text,
    {
      type: "svg",
      errorCorrectionLevel: state.ecc,
      margin: 2,
      color: {
        dark: state.fg,
        light: state.bg
      }
    }
  );

  state.url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
  const preview = document.getElementById("preview");
  preview.innerHTML = svgString;
}

// --------------------
// UI → State
// --------------------
function bindUI() {

  document.getElementById("text")
    .addEventListener("input", e => {
      state.text = e.target.value;
      if(e.target.value === "") {
        
      }
      update();
    });

  document.getElementById("ecc")
    .addEventListener("change", e => {
      state.ecc = e.target.value;
      update();
    });

  document.getElementById("fg")
    .addEventListener("input", e => {
      state.fg = e.target.value;
      update();
    });

  document.getElementById("bg")
    .addEventListener("input", e => {
      state.bg = e.target.value;
      update();
    });

}

// Download QR
function download(){
  const link = document.createElement('a');
  link.href = state.url;
  link.download = 'QR.svg';

  document.body.appendChild(link);
  link.click();
}

function viewDownloadBtn(){
  if(state.text === "") {
    downloadBtn.style.display = "none";
  } else {
    downloadBtn.style.display = "inline";
    state.canDownload = true;
  }
}
// --------------------
// 업데이트 파이프라인
// --------------------
function update() {
  stateToURL();
  generateQR();
  viewDownloadBtn();
}


// --------------------
// 초기화
// --------------------
window.addEventListener("load", () => {

  urlToState();

  document.getElementById("text").value = state.text;
  document.getElementById("ecc").value = state.ecc;
  document.getElementById("fg").value = state.fg;
  document.getElementById("bg").value = state.bg;
  document.getElementById("downloadBtn").addEventListener('click',download);
  const downloadBtn = document.getElementById("downloadBtn");

  bindUI();
  generateQR();
});
