-- User Table
-- 사용자 정보를 저장합니다. (앱 사용자 및 관리자)
CREATE TABLE "User" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "email" VARCHAR UNIQUE NOT NULL,
    "password" VARCHAR NOT NULL,
    "nickname" VARCHAR NOT NULL,
    "role" VARCHAR CHECK("role" IN ('user', 'admin')) NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Challenge Table
-- 챌린지 자체의 정보를 저장합니다.
CREATE TABLE "Challenge" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "title" VARCHAR NOT NULL,
    "thumbnail" VARCHAR NOT NULL,
    "frequency" VARCHAR NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "authCountPerDay" VARCHAR NOT NULL,
    "authDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- ChallengeParticipation Table
-- 사용자와 챌린지 간의 참여 관계를 저장하는 중간 테이블입니다.
CREATE TABLE "ChallengeParticipation" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "status" VARCHAR CHECK("status" IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')) NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "userId" INTEGER,
    "challengeId" INTEGER,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Proof Table
-- 사용자의 개별 인증 기록(피드)을 저장합니다.
CREATE TABLE "Proof" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" VARCHAR NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now')),
    "userId" INTEGER,
    "participationId" INTEGER,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY ("participationId") REFERENCES "ChallengeParticipation" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

