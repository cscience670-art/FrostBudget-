-- 1. جدول المستخدمين (Users)


CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(64) DEFAULT NULL,
    lastName VARCHAR(64) DEFAULT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول الحسابات المالية (Account)
CREATE TABLE account (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(200) NOT NULL,
    currency VARCHAR(50) DEFAULT NULL, -- مثل (USD, EUR, SAR, DZD)
    balance DOUBLE PRECISION DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. جدول التصنيفات (Category)
CREATE TABLE category (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    typeEnum VARCHAR(50) DEFAULT NULL, -- مثل (income, expense)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول الأهداف المالية والسبات (Goals / Hibernation)
CREATE TABLE goals (
    id VARCHAR(255) PRIMARY KEY,
    goalId BIGINT DEFAULT NULL, -- يدعم نطاقات الأرقام الكبيرة المذكورة
    goalName VARCHAR(100) NOT NULL,
    startDate TIMESTAMP NOT NULL,
    achieved BOOLEAN DEFAULT FALSE,
    goalAmount DOUBLE PRECISION DEFAULT 0.00,
    progress DOUBLE PRECISION DEFAULT 0.00,
    userId VARCHAR(200) NOT NULL,
    typeEnum VARCHAR(50) DEFAULT NULL, -- مثل (hibernation, standard_saving)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. جدول المعاملات المالية (Transactions)
CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(200) NOT NULL,
    name VARCHAR(150) NOT NULL,
    accountId VARCHAR(200) NOT NULL,
    amount DOUBLE PRECISION NOT NULL CHECK (amount >= 1), -- لضمان ألا يقل المبلغ عن 1
    typeEnum VARCHAR(50) DEFAULT NULL, -- مثل (income, expense)
    category VARCHAR(100) NOT NULL, -- اسم الفئة أو معرفها
    date TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (accountId) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE monthly_budget (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(200) NOT NULL,
    categoryId VARCHAR(255) NOT NULL, -- الفئة المخصص لها المال
    month_year DATE NOT NULL, -- لحفظ الشهر والسنة (مثلاً: 2026-07-01 لتمثيل شهر يوليو)
    allocatedAmount DOUBLE PRECISION DEFAULT 0.00, -- المبلغ الذي خصصته بيدك لهذه الفئة (Budgeted)
    activityAmount DOUBLE PRECISION DEFAULT 0.00, -- مجموع ما صرفته فعلياً من جدول transactions (تحدث تلقائياً)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES category(id) ON DELETE CASCADE,
    UNIQUE(userId, categoryId, month_year) -- تمنع تكرار الميزانية لنفس الفئة في نفس الشهر
);

CREATE TABLE user_cash_on_hand (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(200) NOT NULL UNIQUE,
    toBeBudgeted DOUBLE PRECISION DEFAULT 0.00, -- يمثل "Icebox Bucket" (المال المتاح للتوزيع حالياً)
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

