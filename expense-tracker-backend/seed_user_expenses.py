import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote_plus

import pymysql


HOST = os.getenv("MYSQL_HOST", "localhost")
PORT = int(os.getenv("MYSQL_PORT", "3306"))
USER = os.getenv("MYSQL_USER", "root")
PASSWORD = os.getenv("MYSQL_PASSWORD", "20011231")
DATABASE = os.getenv("MYSQL_DATABASE", "expense_tracker")

CATEGORIES = {
    "Food": [
        "Coffee",
        "Lunch",
        "Dinner",
        "Bakery",
        "Groceries",
        "Milk Tea",
    ],
    "Transport": [
        "Bus Ticket",
        "Train Fare",
        "Fuel",
        "Parking",
        "Ride Share",
        "Metro Card",
    ],
    "Bills": [
        "Rent Share",
        "Phone Bill",
        "Internet Bill",
        "Electricity",
        "Water Bill",
        "Subscription",
    ],
    "Shopping": [
        "Clothes",
        "Stationery",
        "Household Items",
        "Accessories",
        "Skincare",
        "Online Order",
    ],
    "Entertainment": [
        "Movie Ticket",
        "Game Pass",
        "Concert",
        "Streaming",
        "Cafe Meetup",
        "Museum",
    ],
    "Other": [
        "Gift",
        "Medicine",
        "Repair",
        "Printing",
        "Course Material",
        "Misc Expense",
    ],
}

DESCRIPTIONS = [
    "seeded personal test record",
    "mobile UI test data",
    "monthly spending sample",
    "admin review sample",
    "dashboard chart sample",
    "personal expense sample",
]


def connect(database=None):
    return pymysql.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database=database,
        charset="utf8mb4",
        autocommit=False,
        cursorclass=pymysql.cursors.DictCursor,
    )


def column_exists(cursor, table_name, column_name):
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
        """,
        (DATABASE, table_name, column_name),
    )
    return cursor.fetchone()["count"] > 0


def add_column_if_missing(cursor, table_name, column_name, column_sql):
    if not column_exists(cursor, table_name, column_name):
        cursor.execute(f"ALTER TABLE `{table_name}` ADD COLUMN {column_sql}")


def ensure_schema(cursor):
    cursor.execute(
        f"""
        CREATE DATABASE IF NOT EXISTS `{DATABASE}`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
        """
    )
    cursor.execute(f"USE `{DATABASE}`")
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS `user` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `username` VARCHAR(255) NOT NULL,
            `email` VARCHAR(255) NULL,
            `password_hash` VARCHAR(255) NOT NULL,
            `role` VARCHAR(50) NOT NULL DEFAULT 'user',
            `created_at` VARCHAR(64) NOT NULL DEFAULT '',
            PRIMARY KEY (`id`),
            KEY `ix_user_username` (`username`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS `expense` (
            `id` VARCHAR(255) NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `category` VARCHAR(255) NOT NULL,
            `amount` DOUBLE NOT NULL,
            `date` VARCHAR(255) NOT NULL,
            `description` VARCHAR(255) NULL DEFAULT '',
            `user_id` INT NULL,
            `username` VARCHAR(255) NULL,
            `created_at` VARCHAR(64) NOT NULL DEFAULT '',
            `updated_at` VARCHAR(64) NOT NULL DEFAULT '',
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS `useractivity` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `user_id` INT NULL,
            `username` VARCHAR(255) NOT NULL,
            `action` VARCHAR(255) NOT NULL,
            `detail` VARCHAR(255) NOT NULL DEFAULT '',
            `created_at` VARCHAR(64) NOT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    )

    add_column_if_missing(cursor, "user", "created_at", "`created_at` VARCHAR(64) NOT NULL DEFAULT ''")
    add_column_if_missing(cursor, "expense", "user_id", "`user_id` INT NULL")
    add_column_if_missing(cursor, "expense", "username", "`username` VARCHAR(255) NULL")
    add_column_if_missing(cursor, "expense", "created_at", "`created_at` VARCHAR(64) NOT NULL DEFAULT ''")
    add_column_if_missing(cursor, "expense", "updated_at", "`updated_at` VARCHAR(64) NOT NULL DEFAULT ''")


def make_expense(user_id, username, index):
    category = random.choice(list(CATEGORIES.keys()))
    title = random.choice(CATEGORIES[category])
    days_ago = random.randint(0, 365)
    created = datetime.now(timezone.utc) - timedelta(
        days=days_ago,
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )
    amount = round(random.uniform(3.5, 520.0), 2)

    return {
        "id": f"seed-{user_id}-{index}-{uuid.uuid4().hex[:12]}",
        "title": title,
        "category": category,
        "amount": amount,
        "date": created.date().isoformat(),
        "description": random.choice(DESCRIPTIONS),
        "user_id": user_id,
        "username": username,
        "created_at": created.replace(microsecond=0).isoformat(),
        "updated_at": created.replace(microsecond=0).isoformat(),
    }


def main():
    random.seed()

    with connect() as connection:
        with connection.cursor() as cursor:
            ensure_schema(cursor)
            connection.commit()

    with connect(DATABASE) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username FROM `user` ORDER BY id")
            users = cursor.fetchall()

            if not users:
                print("No users found. Register at least one user first, then rerun this script.")
                return

            cursor.execute("SELECT COUNT(*) AS count FROM expense")
            old_expense_count = cursor.fetchone()["count"]
            cursor.execute("DELETE FROM expense")
            cursor.execute(
                """
                DELETE FROM useractivity
                WHERE action IN (
                    'create_expense',
                    'update_expense',
                    'delete_expense',
                    'seed_expenses'
                )
                """
            )

            expense_sql = """
                INSERT INTO expense (
                    id, title, category, amount, date, description,
                    user_id, username, created_at, updated_at
                )
                VALUES (
                    %(id)s, %(title)s, %(category)s, %(amount)s, %(date)s,
                    %(description)s, %(user_id)s, %(username)s,
                    %(created_at)s, %(updated_at)s
                )
            """
            activity_sql = """
                INSERT INTO useractivity (
                    user_id, username, action, detail, created_at
                )
                VALUES (%s, %s, %s, %s, %s)
            """

            inserted = 0
            now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

            for user in users:
                rows = [
                    make_expense(user["id"], user["username"], index)
                    for index in range(1, 101)
                ]
                cursor.executemany(expense_sql, rows)
                cursor.execute(
                    activity_sql,
                    (
                        user["id"],
                        user["username"],
                        "seed_expenses",
                        "Generated 100 personal expense records",
                        now,
                    ),
                )
                inserted += len(rows)

            connection.commit()

            print(f"Users seeded: {len(users)}")
            print(f"Old expenses deleted: {old_expense_count}")
            print(f"New expenses inserted: {inserted}")


if __name__ == "__main__":
    try:
        main()
    except pymysql.err.OperationalError as error:
        print("MySQL connection failed.")
        print(f"Tried: mysql+pymysql://{USER}:{quote_plus(PASSWORD)}@{HOST}:{PORT}/{DATABASE}")
        raise error
