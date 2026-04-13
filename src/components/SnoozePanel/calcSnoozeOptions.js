// @flow
import moment from 'moment';

export const SNOOZE_TYPE_REPEATED = 'periodically';
export const SNOOZE_TYPE_SPECIFIC_DATE = 'specific_date';

export type SnoozeOption = {
  id: string,
  title: string,
  tooltip: string,
  when?: Date,
  isProFeature?: boolean,
};

export default function calcSnoozeOptions(settings: Settings): Array<SnoozeOption> {
  const {
    workdayEnd,
    weekStartDay,
    weekEndDay,
    workdayStart,
    somedayMonthsDelta,
    customSnoozeOptions,
  } = settings;

  const isVeryLateAtNight = moment().hour() <= 3;
  const isNightTime = moment().hour() >= workdayEnd || moment().hour() < 3;
  const isWeekend =
    moment().day() === weekEndDay || moment().day() === (weekEndDay + 1) % 7;

  const roundDate = (m: any) => m.minutes(0).seconds(0).millisecond(0);
  const dayStart = (m: any) => roundDate(m.hour(workdayStart));

  const resolveWhen = (opt: CustomSnoozeOption): ?Date => {
    switch (opt.type) {
      case 'offset':
        return moment().add(opt.offsetMinutes ?? 60, 'minutes').toDate();
      case 'evening':
        return roundDate(
          moment().hour() >= workdayEnd
            ? moment().add(1, 'day').hour(workdayEnd)
            : moment().hour(workdayEnd)
        ).toDate();
      case 'tomorrow':
        return (isVeryLateAtNight ? dayStart(moment()) : dayStart(moment().add(1, 'days'))).toDate();
      case 'weekend':
        return (isWeekend
          ? dayStart(moment().day(7 + weekEndDay))
          : dayStart(moment().day(weekEndDay))
        ).toDate();
      case 'next_week':
        return dayStart(moment().day(weekStartDay + 7)).toDate();
      case 'in_a_month':
        return dayStart(moment().add(1, 'months')).toDate();
      case 'someday':
        return dayStart(moment().add(somedayMonthsDelta, 'months')).toDate();
      default:
        return null;
    }
  };

  const formatTooltip = (opt: CustomSnoozeOption, when: ?Date): string => {
    if (!when) {
      if (opt.type === SNOOZE_TYPE_REPEATED) return 'Open this tab on a periodic basis';
      if (opt.type === SNOOZE_TYPE_SPECIFIC_DATE) return 'Select a specific date & time';
      return '';
    }
    const m = moment(when);
    if (opt.type === 'offset') {
      const hours = (opt.offsetMinutes ?? 60) / 60;
      return `${m.calendar()}`;
    }
    if (opt.type === 'in_a_month' || opt.type === 'someday') return m.format('LL');
    return m.calendar();
  };

  const options = customSnoozeOptions ?? [];

  return options.map(opt => {
    const when = resolveWhen(opt);
    return {
      id: opt.id,
      title: opt.label,
      tooltip: formatTooltip(opt, when),
      when: when ?? undefined,
      isProFeature: opt.type === SNOOZE_TYPE_REPEATED,
    };
  });
}
