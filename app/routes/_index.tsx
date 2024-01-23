import { conform, useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Form, json, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { addDays, subDays } from 'date-fns';
import { z } from 'zod';
import SignIn from '~/components/sign-in';
import {
  findDrinkLogByUserAndDate,
  logDrink,
  removeDrink,
  setDrinks,
} from '~/queries/drink-logs.server';
import { findUser } from '~/queries/users.server';
import { getUserId } from '~/utils/auth/get-user-id';
import { requireUserId } from '~/utils/auth/require-user-id';

export const meta: MetaFunction = () => {
  return [
    { title: 'Drinkloggr' },
    {
      name: 'description',
      content: 'Easily keep track of your drinking habits',
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    return json({ user: null, logs: null });
  }
  const user = await findUser(userId);

  const { searchParams } = new URL(request.url);
  const queryDate = searchParams.get('date'); // null or YYYY-MM-DD
  const [month, day, year] = new Date().toLocaleDateString().split('/');

  const date = queryDate
    ? new Date(queryDate)
    : new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);

  const logs = await findDrinkLogByUserAndDate(userId, date);

  return json({
    user,
    logs: logs ?? { drinks: null, date },
  });
}

export async function action({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: z.object({
      date: z.date(),
    }),
  });

  if (!submission.value) {
    return json({ status: 'error', submission } as const, { status: 400 });
  }

  const { date } = submission.value;

  if (submission.intent === 'not-drinking') {
    await setDrinks(userId, date, 0);
  } else if (submission.intent === 'add-drink') {
    await logDrink(userId, date);
  } else if (submission.intent === 'remove-drink') {
    await removeDrink(userId, date);
  }
  return null;
}

const formatDate = (isoDate: string) => {
  const isoDateOnly = isoDate.split('T')[0];
  const [year, month, day] = isoDateOnly.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  });
};

const getWeekday = (isoDate: string) => {
  const isoDateOnly = isoDate.split('T')[0];
  const [year, month, day] = isoDateOnly.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
  });
};

export default function Index() {
  const { user, logs } = useLoaderData<typeof loader>();
  const [form] = useForm({});
  const [month, day, year] = new Date().toLocaleDateString().split('/');
  const today = new Date(
    `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
  );

  if (!user)
    return (
      <div>
        <SignIn />
      </div>
    );

  return (
    <>
      <div className="mb-20 flex justify-center text-center font-semibold text-gray-500">
        <div className="">
          <Form method="get">
            <input
              type="hidden"
              id="date"
              name="date"
              value={
                subDays(new Date(logs.date), 1).toISOString().split('T')[0]
              }
            />
            <button type="submit">←</button>
          </Form>
        </div>
        <div className="mx-4 w-32">
          <div className="text-lg">
            {logs.date === today.toISOString()
              ? 'Today'
              : getWeekday(logs.date)}
          </div>

          <div className="text-3xl font-semibold text-blue-800">
            {formatDate(logs.date)}
          </div>
        </div>
        <div className="">
          <Form method="get">
            <input
              type="hidden"
              id="date"
              name="date"
              value={
                addDays(new Date(logs.date), 1).toISOString().split('T')[0]
              }
            />
            <button
              type="submit"
              disabled={new Date(logs.date) >= today}
              className={clsx(new Date(logs.date) >= today && 'text-gray-300')}
            >
              →
            </button>
          </Form>
        </div>
      </div>

      <Form method="post" {...form.props} className="min-h-32">
        <input
          type="hidden"
          name={'date'}
          value={new Date(logs.date).toISOString().split('T')[0]}
        />
        <div className="my-8 flex justify-center space-x-4">
          <button
            type="submit"
            name={conform.INTENT}
            value="remove-drink"
            disabled={!logs.drinks || logs?.drinks <= 0}
            className={clsx(
              logs?.drinks && logs.drinks > 0
                ? 'bg-gray-400 hover:bg-gray-500'
                : 'bg-gray-300',
              'mb-2  mt-auto h-12 w-12 rounded-full p-1 text-2xl font-bold text-white',
            )}
          >
            -
          </button>
          <div className="w-24 text-center">
            <div
              className={clsx(
                logs?.drinks === null && 'text-gray-500',
                'text-center text-8xl font-bold',
              )}
            >
              {logs?.drinks ?? '?'}
            </div>
            <div className="-mt-1 text-center text-gray-600">drinks</div>
          </div>
          <div className="mt-auto">
            {logs?.drinks === null && (
              <div>
                <button
                  className="mb-2 h-12 w-12 rounded-full bg-green-600 text-2xl font-bold text-white hover:bg-green-500"
                  type="submit"
                  name={conform.INTENT}
                  value="not-drinking"
                >
                  ⊘
                </button>
              </div>
            )}
            <div>
              <button
                type="submit"
                name={conform.INTENT}
                value="add-drink"
                className="mb-2 h-14 w-14 rounded-full bg-blue-500 p-1 text-2xl font-bold text-white hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
