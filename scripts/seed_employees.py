
import sqlite3
import uuid

def seed():
    conn = sqlite3.connect('hr-platform/prisma/dev.db')
    cursor = conn.cursor()
    
    employees = [
        ('1', 'Морозова О.И.', 'ADMIN', 33600, 'Дзержинского 26'),
        ('2', 'Чебатькова А.А.', 'ADMIN', 33600, 'Дзержинского 26'),
        ('3', 'Таловерова А.А.', 'ADMIN', 33600, 'Дзержинского 26'),
        ('4', 'Садыкова К.Е.', 'ADMIN', 33600, 'Дзержинского 26'),
        ('5', 'Бритвина О.Ю.', 'ADMIN', 33600, 'Дзержинского 26'),
    ]
    
    for _, name, role, salary, branch in employees:
        emp_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO Employee (id, name, role, baseSalary, branch, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)",
            (emp_id, name, role, salary, branch)
        )
    
    conn.commit()
    conn.close()
    print("Employees seeded.")

if __name__ == "__main__":
    seed()
