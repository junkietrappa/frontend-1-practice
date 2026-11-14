async function requestJson(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error("Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Ошибка сервера (${response.status}).`);
  }

  if (data === null) {
    throw new Error("Сервер вернул некорректный ответ.");
  }

  return data;
}

export function fetchToday(options) {
  return requestJson("/api/booking/today", options);
}

export function fetchSlots(date, options) {
  const query = new URLSearchParams({
    day: String(date.day),
    month: String(date.month),
    year: String(date.year),
  });

  return requestJson(`/api/slots?${query}`, options);
}
