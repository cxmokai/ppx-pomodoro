import type { Timezone } from '../utils/themes';

export const TIMEZONE_NAMES: Record<Timezone, string> = {
  'UTC': 'UTC',
  'America/New_York': 'New York (EST/EDT)',
  'America/Los_Angeles': 'Los Angeles (PST/PDT)',
  'America/Chicago': 'Chicago (CST/CDT)',
  'America/Denver': 'Denver (MST/MDT)',
  'America/Phoenix': 'Phoenix (MST)',
  'America/Anchorage': 'Alaska (AKST/AKDT)',
  'Pacific/Honolulu': 'Hawaii (HST)',
  'America/Toronto': 'Toronto (EST/EDT)',
  'America/Vancouver': 'Vancouver (PST/PDT)',
  'America/Winnipeg': 'Winnipeg (CST/CDT)',
  'America/Edmonton': 'Edmonton (MST/MDT)',
  'Europe/London': 'London (GMT/BST)',
  'Europe/Paris': 'Paris (CET/CEST)',
  'Europe/Berlin': 'Berlin (CET/CEST)',
  'Europe/Amsterdam': 'Amsterdam (CET/CEST)',
  'Europe/Madrid': 'Madrid (CET/CEST)',
  'Europe/Rome': 'Rome (CET/CEST)',
  'Europe/Stockholm': 'Stockholm (CET/CEST)',
  'Europe/Zurich': 'Zurich (CET/CEST)',
  'Europe/Moscow': 'Moscow (MSK)',
  'Europe/Istanbul': 'Istanbul (TRT)',
  'Asia/Dubai': 'Dubai (GST)',
  'Asia/Kolkata': 'India (IST)',
  'Asia/Shanghai': 'Shanghai (CST)',
  'Asia/Tokyo': 'Tokyo (JST)',
  'Asia/Seoul': 'Seoul (KST)',
  'Asia/Singapore': 'Singapore (SGT)',
  'Asia/Hong_Kong': 'Hong Kong (HKT)',
  'Australia/Sydney': 'Sydney (AEST/AEDT)',
  'Australia/Melbourne': 'Melbourne (AEST/AEDT)',
};

export function getTimezoneName(timezone: Timezone): string {
  return TIMEZONE_NAMES[timezone] || timezone;
}

export function formatTimeInTimezone(timestamp: number, _timezone: string): Date {
  return new Date(timestamp);
}

export function getCurrentTimeInTimezone(_timezone: string): Date {
  return new Date();
}
