import os
from urllib.parse import quote_plus
from sqlalchemy import inspect, text
from sqlmodel import SQLModel, create_engine


def build_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    user = os.getenv("MYSQL_USER", "root")
    password = quote_plus(os.getenv("MYSQL_PASSWORD", "20011231"))
    database = os.getenv("MYSQL_DATABASE", "expense_tracker")

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"


DATABASE_URL = build_database_url()

engine = create_engine(DATABASE_URL, echo=True)


def _add_columns_if_missing(connection, table_name: str, column_specs: list[tuple[str, str]]):
    inspector = inspect(connection)
    if not inspector.has_table(table_name):
        return

    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}

    for column_name, column_sql in column_specs:
        if column_name not in existing_columns:
            connection.execute(text(f"ALTER TABLE `{table_name}` ADD COLUMN {column_sql}"))
            existing_columns.add(column_name)


def migrate_existing_tables():
    with engine.begin() as connection:
        _add_columns_if_missing(
            connection,
            "user",
            [
                ("created_at", "`created_at` VARCHAR(64) NOT NULL DEFAULT ''"),
            ],
        )
        _add_columns_if_missing(
            connection,
            "expense",
            [
                ("user_id", "`user_id` INT NULL"),
                ("username", "`username` VARCHAR(255) NULL"),
                ("created_at", "`created_at` VARCHAR(64) NOT NULL DEFAULT ''"),
                ("updated_at", "`updated_at` VARCHAR(64) NOT NULL DEFAULT ''"),
            ],
        )

        inspector = inspect(connection)
        if inspector.has_table("useractivity"):
            activity_columns = {
                column["name"] for column in inspector.get_columns("useractivity")
            }
            if {"user_id", "action", "created_at"}.issubset(activity_columns):
                connection.execute(
                    text(
                        """
                        UPDATE `user` AS users
                        JOIN (
                            SELECT user_id, MIN(created_at) AS first_seen_at
                            FROM `useractivity`
                            WHERE action = 'register' AND user_id IS NOT NULL
                            GROUP BY user_id
                        ) AS first_activity
                            ON first_activity.user_id = users.id
                        SET users.created_at = first_activity.first_seen_at
                        WHERE users.created_at = ''
                        """
                    )
                )


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    migrate_existing_tables()
