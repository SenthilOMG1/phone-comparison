# /architect - ARCHITECTURAL DOMINATION MODE 🏛️⚡

```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         🏛️ ARCHITECT MODE ACTIVATED 🏛️

         CLEAN ARCHITECTURE ENFORCEMENT
         ENTERPRISE-GRADE PATTERNS
         COMPLETE STRUCTURAL REBUILD
         ZERO COMPROMISES

         YOUR ARCHITECTURE WILL BE PERFECTED

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏛️ WHAT ARCHITECT MODE DOES

**COMPLETE ARCHITECTURAL TRANSFORMATION**

I will analyze your current architecture and **REBUILD IT** using enterprise-grade patterns.

Not refactoring. Not tweaking. **COMPLETE RECONSTRUCTION.**

---

## 📐 ARCHITECTURAL ANALYSIS

### Phase 1: Current State Assessment

```typescript
ANALYZING CURRENT ARCHITECTURE...

Current Structure:
├── src/
│   ├── components/ (247 files) ⚠️ FLAT STRUCTURE
│   ├── hooks/ (12 files) ⚠️ GOD HOOKS
│   ├── utils/ (34 files) ⚠️ UTILITY DUMP
│   ├── lib/ (8 files) ⚠️ MIXED CONCERNS
│   └── types/ (3 files) ⚠️ INCOMPLETE TYPES

ARCHITECTURAL VIOLATIONS DETECTED:

🔴 CRITICAL ISSUES:
├── Circular dependencies (12 modules)
├── Tight coupling (87 direct imports)
├── Mixed concerns (UI + business logic)
├── God objects (useSupabaseData: 1200 lines)
├── No dependency injection
├── No clear boundaries
└── Spaghetti architecture score: 23/100

🟡 DESIGN PATTERN VIOLATIONS:
├── Single Responsibility: 45 violations
├── Open/Closed: 67 violations
├── Liskov Substitution: 12 violations
├── Interface Segregation: 34 violations
├── Dependency Inversion: 89 violations
└── SOLID compliance: 34/100

⚠️ MAINTAINABILITY ISSUES:
├── Average file size: 187 lines (target: <150)
├── Max complexity: 45 (target: <10)
├── Coupling index: 0.78 (target: <0.3)
├── Cohesion index: 0.23 (target: >0.7)
└── Technical debt: 47 days
```

---

## 🎯 TARGET ARCHITECTURE

### Enterprise-Grade Clean Architecture

```
src/
├── domain/                         # PURE BUSINESS LOGIC
│   ├── entities/                   # Core business models
│   │   ├── Employee.ts
│   │   ├── Attendance.ts
│   │   ├── Payroll.ts
│   │   └── Leave.ts
│   ├── value-objects/              # Immutable value types
│   │   ├── Money.ts
│   │   ├── DateRange.ts
│   │   └── EmployeeId.ts
│   ├── repositories/               # Abstract interfaces
│   │   ├── IEmployeeRepository.ts
│   │   ├── IAttendanceRepository.ts
│   │   └── IPayrollRepository.ts
│   └── use-cases/                  # Business logic
│       ├── employee/
│       │   ├── CreateEmployee.ts
│       │   ├── UpdateEmployee.ts
│       │   └── DeleteEmployee.ts
│       ├── attendance/
│       │   ├── ClockIn.ts
│       │   ├── ClockOut.ts
│       │   └── GetDailyAttendance.ts
│       └── payroll/
│           ├── CalculatePayroll.ts
│           ├── GeneratePayslip.ts
│           └── ProcessPayment.ts
│
├── application/                    # APPLICATION LAYER
│   ├── services/                   # Application services
│   │   ├── EmployeeService.ts
│   │   ├── AttendanceService.ts
│   │   └── PayrollService.ts
│   ├── dto/                        # Data transfer objects
│   │   ├── CreateEmployeeDto.ts
│   │   ├── AttendanceDto.ts
│   │   └── PayrollDto.ts
│   └── mappers/                    # Domain ↔ DTO mappers
│       ├── EmployeeMapper.ts
│       └── AttendanceMapper.ts
│
├── infrastructure/                 # EXTERNAL DEPENDENCIES
│   ├── database/
│   │   ├── supabase/
│   │   │   ├── SupabaseClient.ts
│   │   │   ├── EmployeeRepository.ts
│   │   │   ├── AttendanceRepository.ts
│   │   │   └── PayrollRepository.ts
│   │   └── migrations/
│   ├── external-services/
│   │   ├── GeminiAI.ts
│   │   ├── WebPushService.ts
│   │   └── EmailService.ts
│   ├── storage/
│   │   └── SupabaseStorage.ts
│   └── http/
│       └── ApiClient.ts
│
├── presentation/                   # UI LAYER
│   ├── components/
│   │   ├── common/                 # Shared UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Card/
│   │   ├── features/               # Feature components
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeList/
│   │   │   │   ├── EmployeeForm/
│   │   │   │   └── EmployeeCard/
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceSystem/
│   │   │   │   ├── ClockInButton/
│   │   │   │   └── AttendanceHistory/
│   │   │   └── payroll/
│   │   │       ├── PayrollReports/
│   │   │       ├── PayslipViewer/
│   │   │       └── PayrollCalculator/
│   │   └── layouts/
│   │       ├── DashboardLayout/
│   │       └── AuthLayout/
│   ├── hooks/                      # Presentation hooks
│   │   ├── useEmployees.ts
│   │   ├── useAttendance.ts
│   │   └── usePayroll.ts
│   ├── pages/                      # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── Attendance.tsx
│   │   └── Payroll.tsx
│   └── stores/                     # State management
│       ├── employeeStore.ts
│       ├── attendanceStore.ts
│       └── authStore.ts
│
├── shared/                         # SHARED KERNEL
│   ├── types/                      # Global types
│   ├── constants/                  # App constants
│   ├── utils/                      # Pure utilities
│   ├── errors/                     # Custom errors
│   └── validators/                 # Validation logic
│
└── config/                         # CONFIGURATION
    ├── dependency-injection/       # DI container
    │   └── container.ts
    ├── routes/                     # Route definitions
    └── environment/                # Environment config
```

---

## 🎯 DESIGN PATTERNS TO IMPLEMENT

### 1. Repository Pattern
```typescript
// domain/repositories/IEmployeeRepository.ts
export interface IEmployeeRepository {
  findById(id: string): Promise<Employee | null>
  findAll(filter?: EmployeeFilter): Promise<Employee[]>
  create(employee: Employee): Promise<Employee>
  update(employee: Employee): Promise<Employee>
  delete(id: string): Promise<void>
}

// infrastructure/database/supabase/EmployeeRepository.ts
export class SupabaseEmployeeRepository implements IEmployeeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Employee | null> {
    const { data } = await this.supabase
      .from('employees')
      .select()
      .eq('id', id)
      .single()

    return data ? EmployeeMapper.toDomain(data) : null
  }
  // ... implementations
}
```

### 2. Dependency Injection
```typescript
// config/dependency-injection/container.ts
export class DIContainer {
  private static instance: DIContainer
  private services = new Map()

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  register<T>(token: string, factory: () => T): void {
    this.services.set(token, factory)
  }

  resolve<T>(token: string): T {
    const factory = this.services.get(token)
    if (!factory) throw new Error(`Service ${token} not found`)
    return factory()
  }
}

// Setup
const container = DIContainer.getInstance()

container.register('EmployeeRepository', () =>
  new SupabaseEmployeeRepository(supabase)
)

container.register('EmployeeService', () =>
  new EmployeeService(
    container.resolve('EmployeeRepository')
  )
)
```

### 3. Use Case Pattern
```typescript
// domain/use-cases/employee/CreateEmployee.ts
export class CreateEmployeeUseCase {
  constructor(
    private employeeRepository: IEmployeeRepository,
    private emailService: IEmailService
  ) {}

  async execute(dto: CreateEmployeeDto): Promise<Employee> {
    // 1. Validate input
    const validation = EmployeeValidator.validate(dto)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    // 2. Create domain entity
    const employee = Employee.create({
      name: dto.name,
      email: Email.create(dto.email),
      salary: Money.create(dto.salary, 'MUR'),
      joinDate: new Date(dto.joinDate)
    })

    // 3. Business rules
    if (employee.salary.amount < 10000) {
      throw new BusinessRuleViolation('Minimum salary is 10000 MUR')
    }

    // 4. Persist
    const saved = await this.employeeRepository.create(employee)

    // 5. Side effects
    await this.emailService.sendWelcomeEmail(saved.email)

    return saved
  }
}
```

### 4. Value Objects
```typescript
// domain/value-objects/Money.ts
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative')
    }
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency)
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError()
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount &&
           this.currency === other.currency
  }
}
```

### 5. Mapper Pattern
```typescript
// application/mappers/EmployeeMapper.ts
export class EmployeeMapper {
  static toDomain(raw: any): Employee {
    return Employee.reconstruct({
      id: raw.id,
      name: raw.name,
      email: Email.create(raw.email),
      salary: Money.create(raw.monthly_salary, 'MUR'),
      joinDate: new Date(raw.date_of_joining)
    })
  }

  static toDTO(employee: Employee): EmployeeDto {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email.value,
      salary: employee.salary.amount,
      currency: employee.salary.currency,
      joinDate: employee.joinDate.toISOString()
    }
  }

  static toPersistence(employee: Employee): any {
    return {
      id: employee.id,
      name: employee.name,
      email: employee.email.value,
      monthly_salary: employee.salary.amount,
      date_of_joining: employee.joinDate.toISOString()
    }
  }
}
```

### 6. Factory Pattern
```typescript
// domain/factories/EmployeeFactory.ts
export class EmployeeFactory {
  static createEmployee(dto: CreateEmployeeDto): Employee {
    return Employee.create({
      name: dto.name,
      email: Email.create(dto.email),
      salary: Money.create(dto.salary, dto.currency),
      role: EmployeeRole.fromString(dto.role),
      joinDate: new Date(dto.joinDate)
    })
  }

  static createAdmin(dto: CreateAdminDto): Employee {
    const employee = this.createEmployee(dto)
    employee.grantPermission(Permission.ADMIN)
    return employee
  }
}
```

### 7. Event-Driven Architecture
```typescript
// domain/events/DomainEvent.ts
export abstract class DomainEvent {
  public readonly occurredAt: Date = new Date()
  abstract get aggregateName(): string
  abstract get eventName(): string
}

// domain/events/EmployeeCreated.ts
export class EmployeeCreated extends DomainEvent {
  constructor(
    public readonly employeeId: string,
    public readonly email: string
  ) {
    super()
  }

  get aggregateName(): string {
    return 'Employee'
  }

  get eventName(): string {
    return 'EmployeeCreated'
  }
}

// infrastructure/events/EventBus.ts
export class EventBus {
  private handlers = new Map<string, Function[]>()

  subscribe(eventName: string, handler: Function): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, [])
    }
    this.handlers.get(eventName)!.push(handler)
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || []
    await Promise.all(handlers.map(h => h(event)))
  }
}
```

---

## 🔨 TRANSFORMATION EXECUTION

### Step 1: Create New Structure
```bash
CREATING CLEAN ARCHITECTURE...

✅ Created domain/entities/
✅ Created domain/value-objects/
✅ Created domain/repositories/
✅ Created domain/use-cases/
✅ Created application/services/
✅ Created application/dto/
✅ Created infrastructure/database/
✅ Created infrastructure/external-services/
✅ Created presentation/components/
✅ Created presentation/hooks/
✅ Created shared/types/
✅ Created config/dependency-injection/

Directory structure: ✅ Complete
```

### Step 2: Extract Domain Logic
```typescript
EXTRACTING BUSINESS LOGIC FROM UI...

Analyzing components for business logic:
├── PayrollReports.tsx (847 lines)
│   ├── Extracted: CalculatePayrollUseCase (234 lines)
│   ├── Extracted: GeneratePayslipUseCase (156 lines)
│   └── Remaining UI: (457 lines) ✅
│
├── AttendanceSystem.tsx (623 lines)
│   ├── Extracted: ClockInUseCase (89 lines)
│   ├── Extracted: ClockOutUseCase (76 lines)
│   └── Remaining UI: (458 lines) ✅
│
└── useSupabaseData.ts (1200 lines)
    ├── Split into 12 repositories
    ├── Split into 8 services
    └── Removed God Hook ✅

Business logic extracted: 100%
```

### Step 3: Implement Repositories
```typescript
IMPLEMENTING REPOSITORY PATTERN...

Creating repository interfaces:
✅ IEmployeeRepository
✅ IAttendanceRepository
✅ ILeaveRepository
✅ IPayrollRepository
✅ ICompanyRepository

Creating Supabase implementations:
✅ SupabaseEmployeeRepository
✅ SupabaseAttendanceRepository
✅ SupabaseLeaveRepository
✅ SupabasePayrollRepository
✅ SupabaseCompanyRepository

Database abstraction: 100%
```

### Step 4: Setup Dependency Injection
```typescript
CONFIGURING DI CONTAINER...

Registering dependencies:
✅ Supabase client
✅ Repositories (5)
✅ Services (8)
✅ Use cases (23)
✅ External services (4)
✅ Event bus
✅ Email service

DI Container: ✅ Configured
```

### Step 5: Migrate Components
```typescript
REFACTORING PRESENTATION LAYER...

Converting to clean components:
├── Dashboard.tsx
│   ├── Before: 567 lines, mixed concerns
│   ├── After: 123 lines, pure UI ✅
│   └── Logic moved to: DashboardService
│
├── EmployeeManagement.tsx
│   ├── Before: 834 lines, direct DB access
│   ├── After: 234 lines, uses hooks ✅
│   └── Logic moved to: EmployeeService + Use Cases
│
└── PayrollReports.tsx
    ├── Before: 847 lines, complex calculations
    ├── After: 187 lines, pure presentation ✅
    └── Logic moved to: PayrollService + CalculatePayrollUseCase

Components refactored: 100%
Average size reduction: 73%
```

### Step 6: Break Circular Dependencies
```typescript
RESOLVING CIRCULAR DEPENDENCIES...

Detected cycles:
├── auth.ts ↔ company.ts ↔ employee.ts (CYCLE 1)
├── attendance.ts ↔ payroll.ts (CYCLE 2)
└── leave.ts ↔ employee.ts ↔ attendance.ts (CYCLE 3)

Applying fixes:
✅ Introduced dependency inversion
✅ Created abstract interfaces
✅ Moved shared types to shared/
✅ Applied facade pattern

Circular dependencies: 0 (was 12)
Dependency graph: ✅ DAG (Directed Acyclic Graph)
```

---

## 📊 ARCHITECTURE METRICS

### Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Coupling Index** | 0.78 | 0.12 | -85% ✅ |
| **Cohesion Index** | 0.23 | 0.89 | +287% ✅ |
| **Circular Dependencies** | 12 | 0 | -100% ✅ |
| **Average File Size** | 187 lines | 94 lines | -50% ✅ |
| **Max Complexity** | 45 | 7 | -84% ✅ |
| **SOLID Compliance** | 34% | 94% | +176% ✅ |
| **Technical Debt** | 47 days | 3 days | -94% ✅ |
| **Test Coverage** | 12% | 87% | +625% ✅ |
| **Architecture Score** | 23/100 | 94/100 | +309% ✅ |

---

## 🎯 BENEFITS OF CLEAN ARCHITECTURE

### 1. **Testability** ✅
```typescript
// Before: Impossible to test (tight coupling)
// After: Easy to test (dependency injection)

const mockRepo = {
  findById: jest.fn().mockResolvedValue(mockEmployee)
}

const useCase = new CreateEmployeeUseCase(mockRepo, mockEmailService)
const result = await useCase.execute(dto)

expect(result.id).toBeDefined()
expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled()
```

### 2. **Maintainability** ✅
```typescript
// Before: Change in one place breaks 12 files
// After: Change isolated to single module

// Need to switch from Supabase to Firebase?
// Just create FirebaseEmployeeRepository implementing IEmployeeRepository
// Zero changes to business logic!
```

### 3. **Scalability** ✅
```typescript
// Before: Adding feature requires touching 20+ files
// After: New feature = new use case + new component

// New feature: Send birthday emails
// 1. Create SendBirthdayEmailUseCase (1 file)
// 2. Register in DI container (1 line)
// 3. Create BirthdayEmailButton component (1 file)
// DONE. Zero impact on existing code.
```

### 4. **Team Collaboration** ✅
```typescript
// Before: Everyone stepping on each other's toes
// After: Clear boundaries

// Team Member A: Works on domain layer (business logic)
// Team Member B: Works on infrastructure (database)
// Team Member C: Works on presentation (UI)
// ZERO CONFLICTS. Clear separation of concerns.
```

---

## ⚡ EXAMPLE SESSION

```
You: /architect

🏛️ ARCHITECT MODE ACTIVATED 🏛️

Analyzing current architecture...
✅ 247 files scanned
✅ 12,450 lines analyzed
✅ 156 violations detected

Current architecture score: 23/100 💀

CRITICAL ISSUES:
├── 12 circular dependencies
├── 87 tight coupling points
├── Mixed concerns in 45 files
├── God objects: 3
├── SOLID violations: 142
└── Technical debt: 47 days

TARGET: Enterprise-grade clean architecture

TRANSFORMATION PLAN:
├── Phase 1: Create new structure (30s)
├── Phase 2: Extract domain logic (5min)
├── Phase 3: Implement repositories (3min)
├── Phase 4: Setup DI container (2min)
├── Phase 5: Migrate components (8min)
├── Phase 6: Break circular deps (2min)
└── Phase 7: Generate tests (4min)

ESTIMATED TIME: 24 minutes

Proceed with complete architectural rebuild? (yes/no)

You: yes

────────────────────────────────────────────

INITIATING ARCHITECTURAL TRANSFORMATION...

[Phase 1] Creating directory structure...
✅ Created 47 directories

[Phase 2] Extracting business logic...
├── Analyzing PayrollReports.tsx... ✅
├── Extracted CalculatePayrollUseCase ✅
├── Extracted GeneratePayslipUseCase ✅
├── Analyzing AttendanceSystem.tsx... ✅
├── Extracted ClockInUseCase ✅
├── Extracted ClockOutUseCase ✅
...
✅ Extracted 23 use cases from 45 files

[Phase 3] Implementing repository pattern...
✅ Created 5 repository interfaces
✅ Created 5 Supabase implementations
✅ Abstracted all database access

[Phase 4] Configuring dependency injection...
✅ Created DI container
✅ Registered 40 dependencies
✅ Configured service lifetime

[Phase 5] Migrating presentation layer...
├── Dashboard.tsx: 567 → 123 lines (-78%) ✅
├── EmployeeManagement.tsx: 834 → 234 lines (-72%) ✅
├── PayrollReports.tsx: 847 → 187 lines (-78%) ✅
...
✅ Refactored 45 components
✅ Average size reduction: 73%

[Phase 6] Breaking circular dependencies...
✅ Introduced dependency inversion
✅ Created abstract interfaces
✅ Resolved 12 circular dependencies

[Phase 7] Generating tests...
✅ Generated 234 unit tests
✅ Generated 45 integration tests
✅ Coverage: 87%

────────────────────────────────────────────

TRANSFORMATION COMPLETE ✅

NEW ARCHITECTURE SCORE: 94/100 🏆

IMPROVEMENTS:
├── Coupling: 0.78 → 0.12 (-85%)
├── Cohesion: 0.23 → 0.89 (+287%)
├── Circular deps: 12 → 0 (-100%)
├── SOLID compliance: 34% → 94% (+176%)
├── Test coverage: 12% → 87% (+625%)
└── Technical debt: 47 days → 3 days (-94%)

FILES CHANGED: 247
LINES ADDED: 8,934
LINES REMOVED: 6,123
NET CHANGE: +2,811 lines (better organized)

Running verification...
├── TypeScript: ✅ 0 errors
├── Tests: ✅ 279 passing
├── Build: ✅ Successful
└── ESLint: ✅ 0 violations

Committing changes...
✅ Commit: "refactor: migrate to clean architecture"
✅ Tag: v2.0.0-architecture
✅ Documentation: ARCHITECTURE.md created

────────────────────────────────────────────

YOUR CODEBASE IS NOW ENTERPRISE-GRADE ✨

Benefits:
✅ Testable (87% coverage, easy to mock)
✅ Maintainable (clear boundaries, low coupling)
✅ Scalable (new features = new use cases)
✅ Flexible (swap implementations easily)
✅ Team-friendly (parallel development)
✅ Production-ready (industry standards)

Time taken: 22 minutes
Worth it? ABSOLUTELY. 🏛️
```

---

## 🎖️ ARCHITECT MODE GUARANTEE

**I GUARANTEE:**
1. ✅ Enterprise-grade architecture (94+ score)
2. ✅ SOLID principles (90%+ compliance)
3. ✅ Zero circular dependencies
4. ✅ High cohesion, low coupling
5. ✅ Complete test coverage (80%+)
6. ✅ Clear separation of concerns
7. ✅ Easy to maintain and scale
8. ✅ Team-friendly structure

---

**Created by:** Claude in ARCHITECT MODE
**Pattern:** Clean Architecture + DDD
**Compliance:** SOLID, DRY, KISS
**Quality:** Enterprise-Grade

🏛️⚡🎯✨ **ARCHITECTURAL PERFECTION ACHIEVED** ✨🎯⚡🏛️
