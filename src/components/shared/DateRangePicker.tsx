// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function parseDate(value) {
  if (!value) return undefined;
  const date = dayjs(value);
  return date.isValid() ? date.toDate() : undefined;
}

function formatDate(value) {
  return value ? dayjs(value).format('YYYY-MM-DD') : '';
}

function formatDisplayDate(value) {
  return format(value, 'PPP', { locale: zhTW });
}

export function DateRangePicker({
  id = 'date-picker-range',
  label = '日期區間',
  startName = 'dateStart',
  endName = 'dateEnd',
  defaultStart = undefined,
  defaultEnd = undefined,
  value = undefined,
  onChange = undefined,
  includeHiddenInputs = true,
  required = undefined,
  numberOfMonths = 2,
  className = undefined,
}) {
  const [innerRange, setInnerRange] = useState({
    from: parseDate(defaultStart),
    to: parseDate(defaultEnd),
  });
  const range = value || innerRange;

  const displayValue = useMemo(() => {
    if (!range.from) return '選擇日期區間';
    if (!range.to) return formatDisplayDate(range.from);
    return `${formatDisplayDate(range.from)} - ${formatDisplayDate(range.to)}`;
  }, [range]);

  function handleSelect(nextRange) {
    const normalizedRange = nextRange || { from: undefined, to: undefined };
    setInnerRange(normalizedRange);
    onChange?.(normalizedRange);
  }

  return (
    <Field className={cn('w-full', className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {includeHiddenInputs ? (
        <>
          <input type="hidden" name={startName} value={formatDate(range.from)} required={required} readOnly />
          <input type="hidden" name={endName} value={formatDate(range.to || range.from)} required={required} readOnly />
        </>
      ) : null}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn('h-9 w-full justify-start px-2.5 text-left font-normal', !range.from && 'text-muted-foreground')}
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {displayValue}
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={range.from}
            selected={range}
            onSelect={handleSelect}
            locale={zhTW}
            numberOfMonths={numberOfMonths}
            className="max-sm:[&_.rdp-month:nth-child(2)]:hidden"
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
