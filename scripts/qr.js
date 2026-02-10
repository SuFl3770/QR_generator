const state = {
  text: "",
  ecc: "H",
  fg: "#000000",
  bg: "#ffffff",
  logo: ""
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

  const preview = document.getElementById("preview");
  preview.innerHTML = svgString;

  const svg = preview.querySelector("svg");

  // 템플릿 padding
  svg.style.background = state.bg;
  svg.style.padding = "20px";
  svg.style.borderRadius = "12px";


}


// --------------------
// 로고 삽입
// --------------------
function insertLogo(svg) {

  const box = svg.viewBox.baseVal;
  const size = getSafeLogoSize(box.width, state.ecc);

  const svgNS = "http://www.w3.org/2000/svg";
  const img = document.createElementNS(svgNS, "image");

  img.setAttribute(
    "href",
    "assets/logos/" + state.logo
  );

  img.setAttribute("width", size);
  img.setAttribute("height", size);

  img.setAttribute(
    "x",
    box.width/2 - size/2
  );

  img.setAttribute(
    "y",
    box.height/2 - size/2
  );

  svg.appendChild(img);
}


// --------------------
// UI → State
// --------------------
function bindUI() {

  document.getElementById("text")
    .addEventListener("input", e => {
      state.text = e.target.value;
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


function test(){
  const input = document.getElementById("fileInput");
  const preview = document.getElementById("preview");

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    insertLogo(file)
  });
}


// --------------------
// 업데이트 파이프라인
// --------------------
function update() {
  stateToURL();
  generateQR();
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

  bindUI();
  generateQR();
});
