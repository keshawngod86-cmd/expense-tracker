from sqlmodel import SQLModel, create_engine

DATABASE_URL = "mysql+pymysql://root:20011231@localhost:3306/expense_tracker"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)