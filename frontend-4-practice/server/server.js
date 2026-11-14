import { getSlotsForDate, today } from "./database.js";

const DELAY_MS = 700;

function sendJson(response, statusCode, data) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(data));
}

function parseDate(searchParams) {
  const day = Number(searchParams.get("day"));
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 0 ||
    month > 11
  ) {
    return null;
  }

  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

export default function mockApi() {
  return {
    name: "booking-mock-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url ?? "/", "http://localhost");

        if (!requestUrl.pathname.startsWith("/api/")) {
          next();
          return;
        }

        if (request.method !== "GET") {
          sendJson(response, 405, { message: "Поддерживаются только GET-запросы." });
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

        if (response.destroyed) {
          return;
        }

        if (requestUrl.pathname === "/api/booking/today") {
          sendJson(response, 200, today);
          return;
        }

        if (requestUrl.pathname === "/api/slots") {
          const date = parseDate(requestUrl.searchParams);

          if (!date) {
            sendJson(response, 400, { message: "Укажите корректные day, month и year." });
            return;
          }

          sendJson(response, 200, {
            date,
            slots: getSlotsForDate(date),
          });
          return;
        }

        sendJson(response, 404, { message: "API-эндпоинт не найден." });
      });
    },
  };
}
