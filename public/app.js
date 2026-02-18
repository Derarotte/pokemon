const hint = document.getElementById("hint");
const sprite = document.getElementById("sprite");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const result = document.getElementById("result");
const nextBtn = document.getElementById("next");

let data = [];
let current = null;

function chooseOne() {
  current = data[Math.floor(Math.random() * data.length)];
  hint.textContent = `图鉴编号: #${current.id} | 属性: ${current.types.join(", ")}`;
  sprite.src = current.sprite;
  result.textContent = "";
  input.value = "";
}

async function boot() {
  const res = await fetch("../data/pokemon.json");
  data = await res.json();
  chooseOne();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const guess = input.value.trim().toLowerCase();
  if (!guess) return;
  if (guess === current.name.toLowerCase()) {
    result.textContent = `答对了: ${current.name}`;
    result.style.color = "#1d7a33";
  } else {
    result.textContent = `不对，正确答案是 ${current.name}`;
    result.style.color = "#b71c1c";
  }
});

nextBtn.addEventListener("click", chooseOne);

boot().catch((err) => {
  hint.textContent = "数据加载失败";
  console.error(err);
});
