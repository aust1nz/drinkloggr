CREATE TABLE users (
    "id" INT primary key GENERATED ALWAYS AS IDENTITY,
    "email" TEXT NOT NULL UNIQUE,
    "googleSub" TEXT UNIQUE,
    "name" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    "id" INT primary key GENERATED ALWAYS AS IDENTITY,
    "expirationDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "userId" INT NOT NULL REFERENCES users(id)
);

CREATE TABLE "drinkLogs" (
    "id" INT primary key GENERATED ALWAYS AS IDENTITY,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "userId" INT NOT NULL REFERENCES users(id),
    "date" DATE NOT NULL,
    "drinks" INT NOT NULL,
    UNIQUE("userId", "date")
);