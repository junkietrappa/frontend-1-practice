"use strict";

const MONTHS_NOMINATIVE = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const DAYS_OF_WEEK = [
  "воскресенье",
  "понедельник",
  "вторник",
  "среда",
  "четверг",
  "пятница",
  "суббота",
];

const TIME_SLOTS = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "12:00",
  "13:00",
  "14:00",
  "15:15",
  "16:30",
  "17:00",
  "18:15",
];

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
  currentMonth: today.getMonth(),
  currentYear: today.getFullYear(),
  selectedDay: today.getDate(),
  selectedTime: null,
};

const monthName = document.querySelector("#month-name");
const datesGrid = document.querySelector("#dates-grid");
const slotsGrid = document.querySelector("#slots-grid");
const slotsNote = document.querySelector("#slots-note");
const bookingSelection = document.querySelector("#booking-selection");
const summaryDate = document.querySelector("#summary-date");
const summaryTime = document.querySelector("#summary-time");
const continueButton = document.querySelector("#continue-button");
const resetButton = document.querySelector("#reset-selection");

function compareDates(date1, date2) {
  const first = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const second = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.sign(first.getTime() - second.getTime());
}

function isDateSelectable(day, month, year, currentDate) {
  return compareDates(new Date(year, month, day), currentDate) >= 0;
}

function buildCalendarGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.max(35, Math.ceil((firstWeekday + daysInMonth) / 7) * 7);
  const firstVisibleDate = new Date(year, month, 1 - firstWeekday);
  const weeks = [];

  for (let index = 0; index < cellCount; index += 1) {
    const date = new Date(
      firstVisibleDate.getFullYear(),
      firstVisibleDate.getMonth(),
      firstVisibleDate.getDate() + index,
    );
    const weekIndex = Math.floor(index / 7);

    if (!weeks[weekIndex]) {
      weeks[weekIndex] = [];
    }

    weeks[weekIndex].push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return weeks;
}

function getSelectedDate() {
  return new Date(state.currentYear, state.currentMonth, state.selectedDay);
}

function formatSelectedDate(date) {
  return `${DAYS_OF_WEEK[date.getDay()]}, ${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

function getReservedSlots(date) {
  const dateSeed = date.getFullYear() + date.getMonth() * 31 + date.getDate();
  const reservedIndices = new Set([
    dateSeed % TIME_SLOTS.length,
    (dateSeed + 4) % TIME_SLOTS.length,
    (dateSeed + 7) % TIME_SLOTS.length,
  ]);

  return reservedIndices;
}

function renderCalendar() {
  const monthLabel = MONTHS_NOMINATIVE[state.currentMonth];
  monthName.textContent = `${monthLabel[0].toLocaleUpperCase("ru-RU")}${monthLabel.slice(1)} ${state.currentYear}`;
  const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);

  datesGrid.innerHTML = weeks
    .flat()
    .map((date) => {
      const isSelected =
        date.isCurrentMonth &&
        date.day === state.selectedDay;
      const isSelectable =
        date.isCurrentMonth &&
        isDateSelectable(date.day, date.month, date.year, today);
      const classes = ["date-day"];

      if (!date.isCurrentMonth) {
        classes.push("muted");
      }

      if (isSelected) {
        classes.push("selected");
      }

      if (!isSelectable) {
        classes.push("disabled");
      }

      return `<button type="button" class="${classes.join(" ")}" data-day="${date.day}" ${
        isSelectable ? "" : "disabled"
      } aria-pressed="${isSelected}" aria-label="${date.day} ${MONTHS_GENITIVE[date.month]} ${date.year}">${date.day}</button>`;
    })
    .join("");

  datesGrid.querySelectorAll(".date-day:not(:disabled)").forEach((dayButton) => {
    dayButton.addEventListener("click", onDayClick);
  });
}

function renderTimeSlots() {
  const selectedDate = getSelectedDate();
  const reservedSlots = getReservedSlots(selectedDate);
  const availableCount = TIME_SLOTS.length - reservedSlots.size;

  slotsGrid.innerHTML = TIME_SLOTS.map((time, index) => {
    const isOccupied = reservedSlots.has(index);
    const isSelected = state.selectedTime === time;
    const classes = ["slot", isOccupied ? "slot-occupied" : "slot-available"];

    if (isSelected) {
      classes.push("slot-selected");
    }

    return `<button type="button" class="${classes.join(" ")}" data-time="${time}" ${
      isOccupied ? "disabled" : ""
    } aria-pressed="${isSelected}">${time}</button>`;
  }).join("");

  slotsNote.textContent = `${availableCount} свободных мест`;

  slotsGrid.querySelectorAll(".slot:not(:disabled)").forEach((slotButton) => {
    slotButton.addEventListener("click", onTimeSlotClick);
  });
}

function updateBottomBar() {
  const formattedDate = formatSelectedDate(getSelectedDate());
  const selectedTimeText = state.selectedTime ?? "выберите время";

  bookingSelection.textContent = `${formattedDate} • ${selectedTimeText}`;
  summaryDate.textContent = formattedDate;
  summaryTime.textContent = state.selectedTime ?? "Не выбрано";
  continueButton.disabled = state.selectedTime === null;
}

function render() {
  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

function onTimeSlotClick(event) {
  state.selectedTime = event.currentTarget.dataset.time;
  renderTimeSlots();
  updateBottomBar();
}

function setupMonthNavigation() {
  document.querySelectorAll("[data-month-shift]").forEach((button) => {
    button.addEventListener("click", () => {
      const monthDate = new Date(
        state.currentYear,
        state.currentMonth + Number(button.dataset.monthShift),
        1,
      );
      state.currentMonth = monthDate.getMonth();
      state.currentYear = monthDate.getFullYear();
      state.selectedDay = null;
      state.selectedTime = null;
      renderCalendar();
      slotsGrid.innerHTML = "";
      slotsNote.textContent = "Выберите день";
      bookingSelection.textContent = "Сначала выберите доступный день";
      summaryDate.textContent = "Не выбрана";
      summaryTime.textContent = "Не выбрано";
      continueButton.disabled = true;
    });
  });
}

function onDayClick(event) {
  const clickedButton = event.currentTarget;
  const nextDay = Number(clickedButton.dataset.day);

  if (!Number.isInteger(nextDay) || !isDateSelectable(nextDay, state.currentMonth, state.currentYear, today)) {
    return;
  }

  if (state.selectedDay !== nextDay) {
    state.selectedDay = nextDay;
    state.selectedTime = null;
  }
  render();
}

function init() {
  setupMonthNavigation();
  resetButton.addEventListener("click", () => {
    state.selectedTime = null;
    renderTimeSlots();
    updateBottomBar();
  });
  render();
}

document.addEventListener("DOMContentLoaded", init);
