const now = new Date();

export const today = {
  day: now.getDate(),
  month: now.getMonth(),
  year: now.getFullYear(),
};

export const slotSets = {
  weekday: [
    { time: "09:00", available: true },
    { time: "09:45", available: true },
    { time: "10:30", available: false },
    { time: "11:15", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: false },
    { time: "14:00", available: true },
    { time: "15:15", available: true },
    { time: "16:30", available: false },
    { time: "17:00", available: true },
    { time: "18:15", available: true },
  ],
  weekend: [
    { time: "09:00", available: false },
    { time: "09:45", available: true },
    { time: "10:30", available: true },
    { time: "11:15", available: false },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:15", available: false },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "18:15", available: true },
  ],
};

export function getSlotsForDate({ day, month, year }) {
  const date = new Date(year, month, day);
  const setName = date.getDay() === 0 || date.getDay() === 6 ? "weekend" : "weekday";

  return slotSets[setName].map((slot) => ({ ...slot }));
}
