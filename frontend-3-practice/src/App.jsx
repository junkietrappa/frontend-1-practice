import { useState } from "react";

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

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
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

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(
      firstVisibleDate.getFullYear(),
      firstVisibleDate.getMonth(),
      firstVisibleDate.getDate() + index,
    );

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function formatSelectedDate(date) {
  return `${DAYS_OF_WEEK[date.getDay()]}, ${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

function getSlotsForDate(date) {
  if (!date) {
    return [];
  }

  const dateSeed = date.getFullYear() + date.getMonth() * 31 + date.getDate();
  const reservedIndices = new Set([
    dateSeed % TIME_SLOTS.length,
    (dateSeed + 4) % TIME_SLOTS.length,
    (dateSeed + 7) % TIME_SLOTS.length,
  ]);

  return TIME_SLOTS.map((time, index) => ({
    time,
    isOccupied: reservedIndices.has(index),
  }));
}

function BrandHeader() {
  return (
    <header className="page-header">
      <div className="brand-block">
        <div className="brand-mark">B</div>
        <div className="brand-text">
          <span className="brand-name">Barber House</span>
          <span className="brand-subtitle">Студия мужской красоты</span>
        </div>
      </div>
      <button className="header-button" type="button">
        Назад
      </button>
    </header>
  );
}

function BookingSummary({ selectedDate, selectedTime }) {
  const dateLabel = selectedDate ? formatSelectedDate(selectedDate) : "Не выбрана";

  return (
    <aside className="booking-summary">
      <p className="summary-label">Запись</p>
      <h1>Выбор даты и времени</h1>

      <div className="summary-card">
        <div className="service-row">
          <span className="service-name">Классическая стрижка</span>
          <span className="service-price">2 200 ₽</span>
        </div>
        <div className="service-meta">
          <span>45 минут</span>
          <span>Барбер</span>
        </div>
      </div>

      <div className="summary-list">
        <div className="summary-item">
          <span className="summary-name">Мастер</span>
          <span className="summary-value">Александр</span>
        </div>
        <div className="summary-item">
          <span className="summary-name">Дата</span>
          <span className="summary-value">{dateLabel}</span>
        </div>
        <div className="summary-item">
          <span className="summary-name">Время</span>
          <span className="summary-value">{selectedTime ?? "Не выбрано"}</span>
        </div>
      </div>
    </aside>
  );
}

function CalendarHeader({ month, year, onMonthChange }) {
  const monthLabel = MONTHS_NOMINATIVE[month];
  const formattedMonth = `${monthLabel[0].toLocaleUpperCase("ru-RU")}${monthLabel.slice(1)} ${year}`;

  return (
    <div className="panel-top">
      <div>
        <p className="panel-label">Календарь</p>
        <h2>Выберите дату</h2>
      </div>
      <div className="month-switch" aria-label="Навигация по месяцам">
        <button
          type="button"
          className="month-arrow"
          aria-label="Предыдущий месяц"
          onClick={() => onMonthChange(-1)}
        >
          ‹
        </button>
        <span className="month-name" aria-live="polite">
          {formattedMonth}
        </span>
        <button
          type="button"
          className="month-arrow"
          aria-label="Следующий месяц"
          onClick={() => onMonthChange(1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({ month, year, selectedDay, onDaySelect }) {
  const calendarDays = buildCalendarGrid(year, month);

  return (
    <div className="calendar" aria-label="Календарь записи">
      <div className="weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="dates-grid" aria-label="Дни месяца">
        {calendarDays.map((date, index) => {
          const isSelected = date.isCurrentMonth && date.day === selectedDay;
          const isSelectable =
            date.isCurrentMonth &&
            isDateSelectable(date.day, date.month, date.year, today);
          const classNames = ["date-day"];

          if (!date.isCurrentMonth) {
            classNames.push("muted");
          }
          if (!isSelectable) {
            classNames.push("disabled");
          }
          if (isSelected) {
            classNames.push("selected");
          }

          return (
            <button
              key={`${date.year}-${date.month}-${date.day}-${index}`}
              type="button"
              className={classNames.join(" ")}
              disabled={!isSelectable}
              aria-pressed={isSelected}
              aria-label={`${date.day} ${MONTHS_GENITIVE[date.month]} ${date.year}`}
              onClick={() => onDaySelect(date.day)}
            >
              {date.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlots({ slots, selectedTime, onTimeSelect }) {
  const availableCount = slots.filter((slot) => !slot.isOccupied).length;

  return (
    <div className="slots-block">
      <div className="slots-header">
        <p className="panel-label">Свободное время</p>
        <span className="slots-note">
          {slots.length ? `${availableCount} свободных мест` : "Выберите день"}
        </span>
      </div>
      <div className="slots-grid" aria-label="Слоты времени">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const classNames = ["slot", slot.isOccupied ? "slot-occupied" : "slot-available"];

          if (isSelected) {
            classNames.push("slot-selected");
          }

          return (
            <button
              key={slot.time}
              type="button"
              className={classNames.join(" ")}
              disabled={slot.isOccupied}
              aria-pressed={isSelected}
              onClick={() => onTimeSelect(slot.time)}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingBottomBar({ selectedDate, selectedTime, onReset }) {
  const selectionLabel = selectedDate
    ? `${formatSelectedDate(selectedDate)} • ${selectedTime ?? "выберите время"}`
    : "Сначала выберите доступный день";

  return (
    <footer className="booking-actions">
      <p className="booking-selection">{selectionLabel}</p>
      <div className="booking-buttons">
        <button type="button" className="secondary-button" onClick={onReset}>
          Сбросить время
        </button>
        <button type="button" className="primary-button" disabled={!selectedTime}>
          Продолжить
        </button>
      </div>
    </footer>
  );
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState(() => getSlotsForDate(today));

  const selectedDate =
    selectedDay === null ? null : new Date(currentYear, currentMonth, selectedDay);

  function handleDaySelect(day) {
    const newDate = new Date(currentYear, currentMonth, day);
    if (!isDateSelectable(day, currentMonth, currentYear, today)) {
      return;
    }

    setSelectedDay(day);
    setSelectedTime(null);
    setSlots(getSlotsForDate(newDate));
  }

  function handleMonthChange(monthOffset) {
    const nextMonth = new Date(currentYear, currentMonth + monthOffset, 1);
    setCurrentMonth(nextMonth.getMonth());
    setCurrentYear(nextMonth.getFullYear());
    setSelectedDay(null);
    setSelectedTime(null);
    setSlots([]);
  }

  function handleTimeSelect(time) {
    setSelectedTime(time);
  }

  function handleTimeReset() {
    setSelectedTime(null);
  }

  return (
    <div className="page-shell">
      <BrandHeader />
      <main className="booking-page">
        <BookingSummary selectedDate={selectedDate} selectedTime={selectedTime} />
        <section className="booking-panel" aria-label="Выбор даты и времени">
          <CalendarHeader
            month={currentMonth}
            year={currentYear}
            onMonthChange={handleMonthChange}
          />
          <CalendarGrid
            month={currentMonth}
            year={currentYear}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
          />
          <TimeSlots
            slots={slots}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
          />
          <BookingBottomBar
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onReset={handleTimeReset}
          />
        </section>
      </main>
    </div>
  );
}
