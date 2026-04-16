const url = "https://predict-69b1337f2fe9bcb05191-dproatj77a-et.a.run.app/predict";
const apiKey = "ul_8d3a352596743b76333c819ee7a3f05f3460588a";

const fileInput = document.getElementById("fileInput");
const detectBtn = document.getElementById("detectBtn");
const imagePreview = document.getElementById("imagePreview");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultList = document.getElementById("resultList");
const resultImage = document.getElementById("resultImage");
const resultCanvas = document.getElementById("resultCanvas");
const rctx = resultCanvas.getContext("2d");

// Preview gambar
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Klik deteksi
detectBtn.addEventListener("click", async () => {
  if (!fileInput.files[0]) {
    alert("Pilih gambar dulu!");
    return;
  }

  const form = new FormData();
  form.append("file", fileInput.files[0]);

  form.append("conf", "0.25");
  form.append("iou", "0.7");
  form.append("imgsz", "640");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const data = await response.json();
    // tampilkan gambar ke kanan
    resultImage.src = imagePreview.src;

    // tunggu gambar load baru gambar box
    resultImage.onload = () => {
    tampilkanHasil(data);
    };

  } catch (err) {
    console.error(err);
    alert("Error API!");
  }
});

// Tampilkan hasil
function tampilkanHasil(data) {
  const results = data.images?.[0]?.results || [];

  const width = resultImage.clientWidth;
  const height = resultImage.clientHeight;

  console.log("IMAGE SIZE:", width, height);

  // samakan canvas dengan tampilan gambar
  resultCanvas.width = width;
  resultCanvas.height = height;

  rctx.clearRect(0, 0, width, height);
  resultList.innerHTML = "";

  if (results.length === 0) {
    resultList.innerHTML = "<li>Tidak ada objek</li>";
    return;
  }

  results.forEach(det => {
    const { x1, y1, x2, y2 } = det.box;

    console.log("RAW BOX:", x1, y1, x2, y2);

    // langsung dari normalized → display pixel
    const left = x1;
    const top = y1;
    const w = (x2 - x1);
    const h = (y2 - y1);

    // DEBUG
    console.log("BOX:", left, top, w, h);

    // bounding box
    rctx.strokeStyle = "red";
    rctx.lineWidth = 2;
    rctx.strokeRect(left, top, w, h);

    // label background
    rctx.fillStyle = "red";
    rctx.fillRect(left, top - 18, 120, 18);

    // text
    rctx.fillStyle = "white";
    rctx.font = "12px Arial";
    rctx.fillText(
      `${det.name} ${(det.confidence * 100).toFixed(1)}%`,
      left + 4,
      top - 5
    );

    // list kanan
    const li = document.createElement("li");
    li.textContent = `${det.name} - ${(det.confidence * 100).toFixed(1)}%`;
    resultList.appendChild(li);
  });
}