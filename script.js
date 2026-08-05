
    const STORAGE_KEY = "workmark_days_v2";
    const MONTHLY_SALARY = 35000;
    const DAILY_SALARY = MONTHLY_SALARY / 30;

    let workDays = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    let viewDate = new Date();
    let selectedDate = stripTime(new Date());

    const monthNames = [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ];

    const calendarGrid = document.getElementById("calendarGrid");
    const monthTitle = document.getElementById("monthTitle");
    const selectedDateText = document.getElementById("selectedDateText");
    const statusValue = document.getElementById("statusValue");
    const toggleBtn = document.getElementById("toggleBtn");
    const totalCount = document.getElementById("totalCount");
    const monthCount = document.getElementById("monthCount");
    const streakCount = document.getElementById("streakCount");
    const salaryCount = document.getElementById("salaryCount");
    const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
});
    function stripTime(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function toKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...workDays].sort()));
    }

    function isFuture(date) {
      return stripTime(date) > stripTime(new Date());
    }

    function sameDate(a, b) {
      return toKey(a) === toKey(b);
    }

    function formatLong(date) {
      return date.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    function renderCalendar() {
      calendarGrid.innerHTML = "";

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      monthTitle.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

      for (let i = 0; i < totalCells; i++) {
        const dayNumber = i - startOffset + 1;
        const button = document.createElement("button");
        button.className = "day";

        if (dayNumber < 1 || dayNumber > lastDay.getDate()) {
          button.classList.add("muted");
          button.disabled = true;
          calendarGrid.appendChild(button);
          continue;
        }

        const current = new Date(year, month, dayNumber);
        const key = toKey(current);

        button.innerHTML = `<span>${dayNumber}</span>`;

        if (sameDate(current, new Date())) button.classList.add("today");
        if (workDays.has(key)) {
          button.classList.add("worked");
          button.insertAdjacentHTML("beforeend", '<span class="dot"></span>');
        }
        if (sameDate(current, selectedDate)) button.classList.add("selected");
        if (isFuture(current)) {
          button.classList.add("future");
          button.disabled = true;
          button.title = "Будущие дни пока нельзя отмечать";
        }

        button.addEventListener("click", () => {
          selectedDate = current;
          render();
        });

        calendarGrid.appendChild(button);
      }
    }

    function calculateStreak() {
      let streak = 0;
      let cursor = stripTime(new Date());

      while (workDays.has(toKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }

      return streak;
    }

    function renderStats() {
      totalCount.textContent = workDays.size;

      const prefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;
      const monthTotal = [...workDays].filter(date => date.startsWith(prefix)).length;
      monthCount.textContent = monthTotal;
      salaryCount.textContent = Math.round(monthTotal * DAILY_SALARY).toLocaleString("ru-RU");

      streakCount.textContent = calculateStreak();
    }

    function renderSelected() {
      const key = toKey(selectedDate);
      const worked = workDays.has(key);

      selectedDateText.textContent = formatLong(selectedDate);
      statusValue.textContent = worked ? "Рабочий день ✓" : "Не отмечен";

      toggleBtn.textContent = worked ? "Удалить отметку" : "Отметить как рабочий";
      toggleBtn.classList.toggle("remove", worked);
      toggleBtn.disabled = isFuture(selectedDate);
    }

    function render() {
      renderCalendar();
      renderStats();
      renderSelected();
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
    }

    toggleBtn.addEventListener("click", () => {
      const key = toKey(selectedDate);

      if (workDays.has(key)) {
        workDays.delete(key);
        showToast("Отметка удалена");
      } else {
        workDays.add(key);
        showToast("Рабочий день отмечен");
      }

      save();
      render();
    });

    document.getElementById("prevMonth").addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      render();
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      render();
    });

    document.getElementById("todayBtn").addEventListener("click", () => {
      viewDate = new Date();
      selectedDate = stripTime(new Date());
      render();
    });

    render();
  


    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
      });
    }
  
