const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const chartData = {
  "This week": [38, 64, 48, 78, 56, 31, 18],
  "Last week": [26, 44, 52, 35, 67, 41, 22]
};
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function renderChart(range = "This week") {
  const values = chartData[range];
  $("#activityBars").innerHTML = values.map((value, index) => `
    <div class="bar-col ${index === 2 && range === "This week" ? "today" : ""}">
      <div class="bar-fill" style="height:${value}%" data-value="${value} min"></div>
      <span>${days[index]}</span>
    </div>`).join("");
  $("#weeklyHours").textContent = (values.reduce((a, b) => a + b, 0) / 60).toFixed(1);
}
renderChart();
$("#rangeSelect").addEventListener("change", (event) => renderChart(event.target.value));

const workoutModal = $("#workoutModal");
const logModal = $("#logModal");
const openModal = modal => { modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); };
const closeModal = modal => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };

$("#startWorkout").addEventListener("click", () => {
  openModal(workoutModal);
  if (!timerInterval) startTimer();
});
$("#quickLogBtn").addEventListener("click", () => openModal(logModal));
$$('.close-modal').forEach(button => button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop"))));
$$('.modal-backdrop').forEach(modal => modal.addEventListener("click", event => {
  if (event.target === modal) closeModal(modal);
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") $$('.modal-backdrop.open').forEach(closeModal);
});

let elapsed = 0;
let timerInterval;
let timerRunning = true;
function startTimer() {
  timerRunning = true;
  timerInterval = setInterval(() => {
    elapsed++;
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    $("#timer").textContent = `${mins}:${secs}`;
  }, 1000);
}
$("#pauseTimer").addEventListener("click", event => {
  if (timerRunning) {
    clearInterval(timerInterval); timerInterval = null; timerRunning = false; event.currentTarget.textContent = "▶";
  } else {
    startTimer(); event.currentTarget.textContent = "Ⅱ";
  }
});

const exercises = [
  ["Incline Dumbbell Press", "4 sets · 10 reps · 60 sec rest", 4],
  ["Single-arm Row", "4 sets · 12 reps · 45 sec rest", 4],
  ["Arnold Press", "3 sets · 10 reps · 60 sec rest", 3],
  ["Cable Fly", "3 sets · 12 reps · 45 sec rest", 3],
  ["Hammer Curl", "3 sets · 12 reps · 45 sec rest", 3],
  ["Rope Pushdown", "3 sets · 15 reps · 45 sec rest", 3]
];
let exercise = 0;
let set = 1;
function updateExercise() {
  const current = exercises[exercise];
  $("#exerciseIndex").textContent = exercise + 1;
  $("#modalTitle").textContent = current[0];
  $("#exerciseDetail").textContent = current[1];
  $("#setStatus").textContent = `SET ${set} OF ${current[2]} · READY WHEN YOU ARE`;
}
$("#completeSet").addEventListener("click", () => {
  const maxSets = exercises[exercise][2];
  if (set < maxSets) set++;
  else if (exercise < exercises.length - 1) { exercise++; set = 1; }
  else { closeModal(workoutModal); showToast("Workout complete", "A powerful finish. Recovery starts now."); clearInterval(timerInterval); }
  updateExercise();
});
$("#skipExercise").addEventListener("click", () => { exercise = (exercise + 1) % exercises.length; set = 1; updateExercise(); });

let selectedActivity = "Strength";
$$('.activity-options button').forEach(button => {
  if (button.dataset.activity === selectedActivity) button.classList.add("selected");
  button.addEventListener("click", () => {
    $$('.activity-options button').forEach(item => item.classList.remove("selected"));
    button.classList.add("selected"); selectedActivity = button.dataset.activity;
  });
});
$("#durationRange").addEventListener("input", event => $("#durationValue").textContent = `${event.target.value} min`);
$("#saveLog").addEventListener("click", () => {
  const duration = Number($("#durationRange").value);
  $("#calories").textContent = Number($("#calories").textContent) + Math.round(duration * 7.4);
  closeModal(logModal);
  showToast(`${selectedActivity} logged`, `${duration} minutes added to your momentum.`);
});

function showToast(title, detail) {
  const toast = $("#toast");
  $("b", toast).textContent = title; $("small", toast).textContent = detail;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

function coachReply(message) {
  $("#coachMessage").textContent = message;
  $("#coachInput").value = "";
}
$$('[data-reply]').forEach(button => button.addEventListener("click", () => {
  coachReply(button.dataset.reply === "adjust"
    ? "Done — I reduced pressing volume by 10% and added a longer warm-up. You'll still get a strong stimulus without outrunning recovery."
    : "Locked in. I'll watch your strain signals and check in after the third movement.");
}));
$("#sendCoach").addEventListener("click", () => {
  const query = $("#coachInput").value.trim();
  if (query) coachReply(`Great question. Based on your 87 readiness score, I'd prioritize quality reps today. For “${query},” start conservatively and adjust after set one.`);
});
$("#coachInput").addEventListener("keydown", event => { if (event.key === "Enter") $("#sendCoach").click(); });

$(".mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
$$('.nav-item').forEach(item => item.addEventListener("click", () => {
  $$('.nav-item').forEach(link => link.classList.remove("active")); item.classList.add("active");
  if (innerWidth < 760) $(".sidebar").classList.remove("open");
}));
$("#planBtn").addEventListener("click", event => { event.currentTarget.textContent = "✓ Session added"; showToast("Plan updated", "A new training slot is ready for you."); });
$("#upgradeBtn").addEventListener("click", () => showToast("You're on the list", "We'll notify you when Pro access opens."));
$("#searchBtn").addEventListener("click", () => showToast("Search ready", "Press / anytime to find a workout."));
