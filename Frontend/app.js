function score() {
  return Math.floor(Math.random() * 35) + 65;
}

function grade(s) {
  if (s >= 90) return "A+";
  if (s >= 80) return "A";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  return "D";
}

function analyze(url) {
  return {
    performance: score(),
    accessibility: score(),
    bestPractices: score(),
    seo: score(),
    pwa: score()
  };
}

function animateNumber(el, target) {
  let current = 0;
  let step = target / 40;
  let interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.innerText = Math.floor(current);
  }, 20);
}