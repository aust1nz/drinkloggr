import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, json, useLoaderData } from "@remix-run/react";
import { addDays, subDays } from "date-fns";
import { z } from "zod";
import SignIn from "~/components/sign-in";
import {
  findDrinkLogByUserAndDate,
  logDrink,
  removeDrink,
} from "~/queries/drink-logs.server";
import { findUser } from "~/queries/users.server";
import { getUserId } from "~/utils/auth/get-user-id";
import { requireUserId } from "~/utils/auth/require-user-id";

export const meta: MetaFunction = () => {
  return [
    { title: "Drinkloggr" },
    {
      name: "description",
      content: "Easily keep track of your drinking habits",
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
  const queryDate = searchParams.get("date"); // null or YYYY-MM-DD
  const [month, day, year] = new Date().toLocaleDateString().split("/");

  const date = queryDate
    ? new Date(queryDate)
    : new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);

  const logs = await findDrinkLogByUserAndDate(userId, date);

  return json({
    user,
    logs: logs ?? { drinks: 0, date },
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
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { date } = submission.value;

  if (submission.intent === "add-drink") {
    await logDrink(userId, date);
  } else if (submission.intent === "remove-drink") {
    await removeDrink(userId, date);
  }
  return null;
}

const formatDate = (isoDate: string) => {
  const isoDateOnly = isoDate.split("T")[0];
  const [year, month, day] = isoDateOnly.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
  });
};

const getWeekday = (isoDate: string) => {
  const isoDateOnly = isoDate.split("T")[0];
  const [year, month, day] = isoDateOnly.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
  });
};

export default function Index() {
  const { user, logs } = useLoaderData<typeof loader>();
  const [form] = useForm({});
  const [month, day, year] = new Date().toLocaleDateString().split("/");
  const today = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  );

  if (!user)
    return (
      <div>
        <SignIn />
      </div>
    );

  return (
    <>
      <div className="text-center font-semibold text-gray-500 flex justify-center mb-20">
        <div className="mt-auto">
          <Link
            to={`/?date=${
              subDays(new Date(logs.date), 1).toISOString().split("T")[0]
            }`}
          >
            ←
          </Link>
        </div>
        <div className="mx-4 w-32">
          <div className="text-lg">
            {logs.date === today.toISOString()
              ? "Today"
              : getWeekday(logs.date)}
          </div>

          <div className="text-blue-800 font-semibold text-3xl">
            {formatDate(logs.date)}
          </div>
        </div>
        <div className="mt-auto">
          {new Date(logs.date) >= today ? (
            <span className="text-gray-300">→</span>
          ) : (
            <Link
              to={`/?date=${
                addDays(new Date(logs.date), 1).toISOString().split("T")[0]
              }`}
            >
              →
            </Link>
          )}
        </div>
      </div>

      <Form method="post" {...form.props}>
        <input
          type="hidden"
          name={"date"}
          value={new Date(logs.date).toISOString().split("T")[0]}
        />
        <div className="flex space-x-4 justify-center my-8">
          <button
            type="submit"
            name={conform.INTENT}
            value="remove-drink"
            disabled={logs?.drinks <= 0}
            className={`${
              logs?.drinks > 0 ? "bg-gray-400 hover:bg-gray-500" : "bg-gray-300"
            } rounded-full  p-1 h-12 w-12 text-white mt-auto text-2xl font-bold mb-2`}
          >
            -
          </button>
          <div className="w-24 text-center">
            <div className="text-8xl font-bold text-center">{logs?.drinks}</div>
            <div className="-mt-1 text-gray-600 text-center">drinks</div>
          </div>
          <button
            type="submit"
            name={conform.INTENT}
            value="add-drink"
            className="rounded-full bg-blue-500 text-white p-1 h-12 w-12 mt-auto text-2xl font-bold mb-2 hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </Form>
    </>
  );
}
