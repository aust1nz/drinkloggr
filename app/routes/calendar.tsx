import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { getDay, getDaysInMonth, startOfMonth } from 'date-fns';
import { findDrinkLogsByUserAndDateRange } from '~/queries/drink-logs.server';
import { requireUserId } from '~/utils/auth/require-user-id';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const monthLogs = await findDrinkLogsByUserAndDateRange(userId);
  return json({ monthLogs });
};

export default function Calendar() {
  const { monthLogs } = useLoaderData<typeof loader>();
  const daysInMonth = getDaysInMonth(new Date());
  const monthWeekdayStart = getDay(startOfMonth(new Date()));

  return (
    <div className="mb-4">
      <div className="grid grid-cols-7 rounded-sm border">
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          SUN
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          MON
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          TUES
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          WED
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          THURS
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          FRI
        </div>
        <div className=" w-full border text-center font-medium uppercase tracking-wide text-gray-600">
          SAT
        </div>
        {Array.from({ length: monthWeekdayStart }).map((_, i) => (
          <div key={i} className="" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const matchingDay = monthLogs.find(
            (log) => new Date(log.date).getDate() === i,
          );
          return (
            <div
              key={i}
              className="flex h-16 w-full flex-col justify-between border px-0.5"
            >
              <div className="text-sm text-gray-400">{i + 1}</div>
              <div
                className={clsx(
                  isNaN(Number(matchingDay?.drinks)) && 'text-gray-400',
                  i + 1 === new Date().getDate() && 'font-bold',
                  'mb-1 h-auto text-center text-lg',
                )}
              >
                {i < new Date().getDate() && (
                  <Link
                    to={`/?date=${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`}
                  >
                    {matchingDay?.drinks ?? '?'}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
