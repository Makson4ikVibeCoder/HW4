// --- 1. ТИПИ ТА ENUMS ---

// String literal type для статусу
type TaskStatus = 'todo' | 'in-progress' | 'done';

// Enum для пріоритету
enum TaskPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

// Базовий інтерфейс задачі
interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  completedAt?: Date; // Опціональне поле
}

// --- 2. UTILITY TYPES ---

// Для створення задачі генеруємо id, status, createdAt автоматично
type CreateTaskDTO = Pick<Task, 'title' | 'description' | 'priority'>;

// Для оновлення задачі всі поля робимо необов'язковими, забороняючи змінювати id та createdAt
type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'createdAt'>>;

// --- 3. TYPE GUARDS ТА GENERICS ---

// Type guard: перевіряє, чи дійсно об'єкт є задачею
function isTask(obj: unknown): obj is Task {
  if (typeof obj !== 'object' || obj === null) return false;
  const t = obj as Task;
  return (
    typeof t.id === 'number' &&
    typeof t.title === 'string' &&
    ['todo', 'in-progress', 'done'].includes(t.status)
  );
}

// Generic-функція для пошуку будь-якого елемента за id
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// --- 4. КЛАС TASK MANAGER ---

class TaskManager {
  private tasks: Task[] = [];

  constructor(initialTasks: Task[] = []) {
    this.tasks = initialTasks;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  addTask(dto: CreateTaskDTO): Task {
    const newId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
    
    const newTask: Task = {
      id: newId,
      ...dto,
      status: 'todo',
      createdAt: new Date()
    };
    
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: number, updateDto: UpdateTaskDTO): Task {
    const task = findById(this.tasks, id);
    if (!task) {
      throw new Error(`Помилка: Задачу з ID ${id} не знайдено для оновлення.`);
    }

    // Автоматично ставимо completedAt, якщо статус змінюється на done
    if (updateDto.status === 'done' && task.status !== 'done') {
      updateDto.completedAt = new Date();
    }

    Object.assign(task, updateDto);
    return task;
  }

  deleteTask(id: number): void {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Помилка: Задачу з ID ${id} не знайдено для видалення.`);
    }
    this.tasks.splice(index, 1);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  getTasksByPriority(priority: TaskPriority): Task[] {
    return this.tasks.filter(t => t.priority === priority);
  }
}

// --- 5. ТЕСТОВІ ДАНІ (8 задач) ---

const initialData: Task[] = [
  { id: 1, title: 'Спроєктувати архітектуру БД для Holy Graill', description: 'Розробити схеми для MongoDB', status: 'in-progress', priority: TaskPriority.High, createdAt: new Date('2026-06-01') },
  { id: 2, title: 'Написати парсер на Python + Selenium', description: 'Збір даних з платформи Prometheus', status: 'todo', priority: TaskPriority.Medium, createdAt: new Date('2026-06-02') },
  { id: 3, title: 'Симуляція 4-бітного лічильника', description: 'Зібрати та протестувати схему в Tinkercad', status: 'done', priority: TaskPriority.High, createdAt: new Date('2026-05-20'), completedAt: new Date('2026-05-22') },
  { id: 4, title: 'Огляд Rick Owens FW26', description: 'Проаналізувати нову колекцію', status: 'done', priority: TaskPriority.Low, createdAt: new Date('2026-06-05'), completedAt: new Date('2026-06-06') },
  { id: 5, title: 'Легіт-чек худі Chrome Hearts', description: 'Перевірити бірки та принти', status: 'todo', priority: TaskPriority.Medium, createdAt: new Date('2026-06-08') },
  { id: 6, title: 'Вивчити RxJS оператори', description: 'switchMap, combineLatest, debounceTime', status: 'in-progress', priority: TaskPriority.High, createdAt: new Date('2026-06-09') },
  { id: 7, title: 'Оновити C# мікросервіс', description: 'Рефакторинг логіки авторизації', status: 'todo', priority: TaskPriority.High, createdAt: new Date('2026-06-10') },
  { id: 8, title: 'Скласти графік змін у Делікаті', description: 'Розподілити години на наступний тиждень', status: 'todo', priority: TaskPriority.Medium, createdAt: new Date('2026-06-10') },
];

// --- 6. ДЕМОНСТРАЦІЯ РОБОТИ ---

const manager = new TaskManager(initialData);

console.log('--- 1. СПИСОК УСІХ ЗАДАЧ ---');
console.table(manager.getAllTasks().map(t => ({ ID: t.id, Назва: t.title, Статус: t.status, Пріоритет: t.priority })));

console.log('\n--- 2. ДОДАВАННЯ НОВОЇ ЗАДАЧІ ---');
const newTask = manager.addTask({
  title: 'Налаштувати CI/CD pipeline',
  description: 'Додати GitHub Actions для автоматичного деплою',
  priority: TaskPriority.High
});
console.log('Додано:', { ID: newTask.id, Назва: newTask.title, Статус: newTask.status });

console.log('\n--- 3. ОНОВЛЕННЯ ЗАДАЧІ (ID: 5) ---');
const updatedTask = manager.updateTask(5, { status: 'done' });
console.log('Оновлено (змінено статус на done):', { ID: updatedTask.id, Назва: updatedTask.title, Статус: updatedTask.status, Завершено: updatedTask.completedAt });

console.log('\n--- 4. ВИДАЛЕННЯ ЗАДАЧІ (ID: 4) ---');
manager.deleteTask(4);
console.log('Задачу з ID 4 видалено. Поточна кількість задач:', manager.getAllTasks().length);

console.log('\n--- 5. ФІЛЬТРАЦІЯ (Задачі в процесі) ---');
console.table(manager.getTasksByStatus('in-progress').map(t => ({ ID: t.id, Назва: t.title, Статус: t.status })));

console.log('\n--- 6. ОБРОБКА ПОМИЛОК ---');
try {
  manager.updateTask(999, { status: 'done' });
} catch (error: unknown) {
  if (error instanceof Error) console.log(error.message);
}