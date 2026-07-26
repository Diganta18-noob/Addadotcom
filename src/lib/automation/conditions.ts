// ─── Automation Condition Evaluator ──────────────────────────────────────────

export type Operator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "in"
  | "not_in"
  | "exists"
  | "is_peak_hours"
  | "is_weekend";

export interface Condition {
  field?: string; // e.g. "total", "orderType", "status", "rating"
  operator: Operator;
  value?: any;
}

export function evaluateConditions(conditions: Condition[] | string, data: Record<string, any>): boolean {
  let condList: Condition[] = [];

  if (typeof conditions === "string") {
    try {
      condList = JSON.parse(conditions);
    } catch {
      condList = [];
    }
  } else if (Array.isArray(conditions)) {
    condList = conditions;
  }

  if (!condList || condList.length === 0) return true;

  return condList.every((condition) => evaluateSingle(condition, data || {}));
}

function getNestedValue(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  const cleanPath = path.startsWith("data.") ? path.slice(5) : path;
  return cleanPath.split(".").reduce((acc, key) => (acc !== null && acc !== undefined ? acc[key] : undefined), obj);
}

function evaluateSingle(condition: Condition, data: Record<string, any>): boolean {
  if (condition.operator === "is_peak_hours") {
    const hour = new Date().getHours();
    return (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 22);
  }

  if (condition.operator === "is_weekend") {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  if (!condition.field) return false;

  const actual = getNestedValue(data, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case "eq":
      return String(actual).toLowerCase() === String(expected).toLowerCase();
    case "neq":
      return String(actual).toLowerCase() !== String(expected).toLowerCase();
    case "gt":
      return Number(actual) > Number(expected);
    case "gte":
      return Number(actual) >= Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    case "lte":
      return Number(actual) <= Number(expected);
    case "contains":
      return String(actual || "").toLowerCase().includes(String(expected || "").toLowerCase());
    case "not_contains":
      return !String(actual || "").toLowerCase().includes(String(expected || "").toLowerCase());
    case "in":
      return Array.isArray(expected) && expected.map((v) => String(v).toLowerCase()).includes(String(actual).toLowerCase());
    case "not_in":
      return Array.isArray(expected) && !expected.map((v) => String(v).toLowerCase()).includes(String(actual).toLowerCase());
    case "exists":
      return actual !== null && actual !== undefined && actual !== "";
    default:
      return false;
  }
}
