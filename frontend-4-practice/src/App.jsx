import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSlots, fetchToday } from "./api.js";

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

function getDateKey(date) {
  return `${date.year}-${date.month}-${date.day}`;
}

function isValidDateData(date) {
  if (
    !Number.isInteger(date?.day) ||
    !Number.isInteger(date?.month) ||
    !Number.isInteger(date?.year) ||
    date.day < 1 ||
    date.month < 0 ||
    date.month > 11
  ) {
    return false;
  }

  const parsedDate = new Date(date.year, date.month, date.day);
  return (
    parsedDate.getFullYear() === date.year &&
    parsedDate.getMonth() === date.month &&
    parsedDate.getDate() === date.day
  );
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

function CalendarGrid({ month, year, selectedDay, today, onDaySelect }) {
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

function TimeSlots({ slots, selectedTime, loading, error, onTimeSelect, onRetry }) {
  const availableCount = slots.filter((slot) => slot.available).length;

  return (
    <div className="slots-block">
      <div className="slots-header">
        <p className="panel-label">Свободное время</p>
        <span className="slots-note" aria-live="polite">
          {loading
            ? "Загрузка слотов…"
            : error
              ? "Не удалось загрузить"
              : slots.length
                ? `${availableCount} свободных мест`
                : "Выберите день"}
        </span>
      </div>
      {loading ? (
        <p className="request-state" role="status">
          Загрузка слотов…
        </p>
      ) : error ? (
        <div className="request-error" role="alert">
          <span>{error}</span>
          <button className="retry-button" type="button" onClick={onRetry}>
            Повторить
          </button>
        </div>
      ) : (
        <div className="slots-grid" aria-label="Слоты времени">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={`slot ${slot.available ? "slot-available" : "slot-occupied"}${
                selectedTime === slot.time ? " slot-selected" : ""
              }`}
              disabled={!slot.available}
              aria-pressed={selectedTime === slot.time}
              onClick={() => onTimeSelect(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
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
  const [today, setToday] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [retryToday, setRetryToday] = useState(0);
  const slotsRequestId = useRef(0);
  const selectedDateKey = useRef(null);
  const slotsController = useRef(null);

  const selectedDate =
    selectedDay === null || currentMonth === null || currentYear === null
      ? null
      : new Date(currentYear, currentMonth, selectedDay);

  const loadSlots = useCallback(async (date) => {
    const dateKey = getDateKey(date);
    selectedDateKey.current = dateKey;
    const requestId = slotsRequestId.current + 1;
    slotsRequestId.current = requestId;
    slotsController.current?.abort();

    const controller = new AbortController();
    slotsController.current = controller;
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(true);
    setSelectedTime(null);

    try {
      const response = await fetchSlots(date, { signal: controller.signal });

      if (requestId !== slotsRequestId.current) {
        return;
      }

      if (
        !isValidDateData(response.date) ||
        getDateKey(response.date) !== selectedDateKey.current
      ) {
        throw new Error("Сервер вернул слоты для другой даты. Попробуйте ещё раз.");
      }

      if (
        !Array.isArray(response.slots) ||
        response.slots.some(
          (slot) => typeof slot.time !== "string" || typeof slot.available !== "boolean",
        )
      ) {
        throw new Error("Сервер вернул некорректный список слотов.");
      }

      setSlots(response.slots);
    } catch (error) {
      if (error.name === "AbortError" || requestId !== slotsRequestId.current) {
        return;
      }
      setSlotsError(error.message);
    } finally {
      if (requestId === slotsRequestId.current) {
        setSlotsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadToday() {
      setCalendarLoading(true);
      setCalendarError(null);

      try {
        const date = await fetchToday({ signal: controller.signal });
        if (!isValidDateData(date)) {
          throw new Error("Сервер вернул некорректную текущую дату.");
        }
        if (!active) {
          return;
        }

        setToday(new Date(date.year, date.month, date.day));
        setCurrentMonth(date.month);
        setCurrentYear(date.year);
        setSelectedDay(date.day);
        loadSlots(date);
      } catch (error) {
        if (error.name === "AbortError" || !active) {
          return;
        }
        setCalendarError(error.message);
      } finally {
        if (active) {
          setCalendarLoading(false);
        }
      }
    }

    loadToday();

    return () => {
      active = false;
      controller.abort();
      slotsController.current?.abort();
      slotsRequestId.current += 1;
    };
  }, [loadSlots, retryToday]);

  function handleDaySelect(day) {
    if (
      today === null ||
      !isDateSelectable(day, currentMonth, currentYear, today)
    ) {
      return;
    }

    setSelectedDay(day);
    setSelectedTime(null);
    loadSlots({ day, month: currentMonth, year: currentYear });
  }

  function handleMonthChange(monthOffset) {
    if (currentMonth === null || currentYear === null) {
      return;
    }

    const nextMonth = new Date(currentYear, currentMonth + monthOffset, 1);
    setCurrentMonth(nextMonth.getMonth());
    setCurrentYear(nextMonth.getFullYear());
    setSelectedDay(null);
    setSelectedTime(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(false);
    selectedDateKey.current = null;
    slotsRequestId.current += 1;
    slotsController.current?.abort();
  }

  function handleSlotsRetry() {
    if (selectedDate) {
      loadSlots({
        day: selectedDate.getDate(),
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }

  return (
    <div className="page-shell">
      <BrandHeader />
      <main className="booking-page">
        <BookingSummary selectedDate={selectedDate} selectedTime={selectedTime} />
        <section className="booking-panel" aria-label="Выбор даты и времени">
          {calendarLoading ? (
            <p className="request-state calendar-loading" role="status">
              Загрузка…
            </p>
          ) : calendarError ? (
            <div className="request-error calendar-error" role="alert">
              <span>{calendarError}</span>
              <button
                className="retry-button"
                type="button"
                onClick={() => setRetryToday((attempt) => attempt + 1)}
              >
                Повторить
              </button>
            </div>
          ) : (
            <>
              <CalendarHeader
                month={currentMonth}
                year={currentYear}
                onMonthChange={handleMonthChange}
              />
              <CalendarGrid
                month={currentMonth}
                year={currentYear}
                selectedDay={selectedDay}
                today={today}
                onDaySelect={handleDaySelect}
              />
              <TimeSlots
                slots={slots}
                selectedTime={selectedTime}
                loading={slotsLoading}
                error={slotsError}
                onTimeSelect={setSelectedTime}
                onRetry={handleSlotsRetry}
              />
              <BookingBottomBar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onReset={() => setSelectedTime(null)}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
