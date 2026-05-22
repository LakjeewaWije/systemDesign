# System Design Learning API

This is a NestJS API used to learn practical backend and systems design ideas through a small doctor scheduling and booking domain.

The goal is not to build the biggest possible app. The goal is to build features in a way that teaches good engineering habits:

- clear module boundaries
- simple business rules
- testable services
- real database integration tests where they matter
- room to add concurrency, Redis, queues, and scaling patterns later

## Current Domain

The app currently has these main areas:

- `users`: stores users with roles such as `doctor` and `patient`
- `schedules`: doctors define weekly availability, slot duration, and breaks
- `bookings`: patients book a doctor slot inside the doctor's schedule
- `auth`: guards protected routes with JWT authentication

Booking is intentionally simple in this phase. It checks whether a slot is valid and already booked, but it does not yet implement distributed concurrency control. That is planned for the Redis phase.

## Running The App

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run start:dev
```

Run unit tests:

```bash
npm test
```

Run integration tests:

```bash
npm run test:int
```

Integration tests require a test PostgreSQL database. By default they use:

```env
TEST_DB_HOST=127.0.0.1
TEST_DB_PORT=5432
TEST_DB_USERNAME=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=system_design_test
```

Build:

```bash
npm run build
```

## Important Booking Rules

`BookingsService` is where the booking business rules live.

A patient can book a doctor only when:

- the authenticated user is a patient
- the target user is a doctor
- the doctor has a schedule for the requested day
- the requested start time is inside the schedule
- the requested start time aligns with the doctor's `slotDuration`
- the requested slot does not overlap a schedule break
- the slot has not already been booked

Example:

```ts
await bookingsService.create(patientId, {
  doctorId,
  appointmentDate: '2026-05-25',
  startTime: '09:30',
});
```

If the doctor's schedule is `09:00` to `17:00` with `slotDuration: 30`, then `09:30` is valid. `09:15` is invalid because it does not align with the schedule's slot duration.

## SOLID Principles In This Codebase

SOLID principles are not rules to memorize. They are a way to keep code understandable as a system grows.

### Single Responsibility Principle

A class should have one main reason to change.

In this project:

- `BookingsController` handles HTTP request and response concerns.
- `BookingsService` handles booking business rules.
- `Booking` entity describes the database shape.
- `CreateBookingDto` describes the input contract.

Example:

```ts
@Post()
async create(@Body() dto: CreateBookingDto, @Req() req: Request) {
  return await this.bookingsService.create(this.getAuthUserId(req), dto);
}
```

The controller does not calculate slot times or check schedule breaks. It passes the request to the service. That keeps HTTP logic separate from business logic.

### Open/Closed Principle

Code should be open for extension but closed for unnecessary modification.

The booking module is registered as its own Nest module:

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Booking, Schedule, User])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
```

This lets the app add booking behavior without rewriting the schedules or users modules. Later, we can add Redis locking or payment logic around bookings while keeping the existing controller shape mostly stable.

### Liskov Substitution Principle

Objects should be replaceable by compatible implementations without breaking the system.

In NestJS, this often shows up through dependency injection. Tests replace real repositories with mocks:

```ts
{
  provide: getRepositoryToken(Booking),
  useValue: bookingsRepository,
}
```

`BookingsService` does not know whether it receives a real TypeORM repository or a mocked repository in a unit test. It only depends on the repository contract it uses.

### Interface Segregation Principle

Code should depend only on the behavior it actually needs.

The service does not take the whole app as a dependency. It only asks for the repositories it needs:

```ts
constructor(
  @InjectRepository(Booking)
  private bookingsRepository: Repository<Booking>,
  @InjectRepository(Schedule)
  private schedulesRepository: Repository<Schedule>,
  @InjectRepository(User)
  private usersRepository: Repository<User>,
) {}
```

This makes the service easier to test and easier to reason about.

### Dependency Inversion Principle

High-level business logic should not manually create low-level infrastructure.

`BookingsService` does not create database connections. Nest and TypeORM provide repositories through dependency injection. This keeps the service focused on business rules:

```ts
const existingBooking = await this.bookingsRepository.findOne({
  where: {
    doctor: { userId: createBookingDto.doctorId as UUID },
    appointmentDate: createBookingDto.appointmentDate,
    startTime: createBookingDto.startTime,
    status: BookingStatus.BOOKED,
  },
});
```

The service asks for data. It does not care how the connection is created.

## Design Patterns Used

### Module Pattern

Nest modules group related behavior.

Example:

```text
src/bookings
  bookings.controller.ts
  bookings.service.ts
  bookings.module.ts
  dto/
  entity/
  enum/
```

This keeps booking code together and makes the feature easier to find, test, and extend.

### Controller-Service Pattern

Controllers handle transport concerns. Services handle use cases.

In this app:

- controllers read route params, body, and authenticated user data
- services validate rules, query repositories, and save changes

This is one of the most useful NestJS patterns because it stops controllers from becoming huge.

### Repository Pattern

TypeORM repositories hide most database access details.

Example:

```ts
await this.schedulesRepository.findOne({
  where: {
    doctor: { userId: doctorId as UUID },
    dayOfWeek: appointmentDay,
  },
});
```

The service does not write raw SQL for normal feature behavior. It asks the repository for the data it needs.

### DTO Pattern

DTOs define what input is allowed.

Example:

```ts
export class CreateBookingDto {
  @IsUUID()
  doctorId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  appointmentDate!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime!: string;
}
```

This keeps request validation close to the request shape. It also makes Swagger documentation clearer.

### Guard And Decorator Pattern

Routes use guards and role decorators to protect access.

Example:

```ts
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.PATIENT)
@Post()
```

This means only authenticated patients can create bookings. The controller method can focus on the use case because authentication and authorization happen before it runs.

### Entity Pattern

Entities describe persisted data and relationships.

Example:

```ts
@ManyToOne(() => User, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'patientId', referencedColumnName: 'userId' })
patient?: User;
```

This tells the system that a booking belongs to a patient.

### Configuration Pattern

Runtime settings are read through `ConfigModule` and `configuration.ts`.

Example:

```ts
redis: {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}
```

This keeps environment-specific values out of feature code.

### Test Pyramid

The project uses two useful test layers:

Unit tests:

- fast
- use mocks
- test business rules directly
- run with `npm test`

Integration tests:

- use a real PostgreSQL database
- cover important database-backed flows
- run with `npm run test:int`

Current booking integration tests cover only:

- create booking success
- duplicate booking conflict
- cancel booking success

That is intentionally small. Integration tests are valuable, but too many slow tests make development painful.

## CI For Pull Requests

GitHub Actions runs checks for pull requests into `main`.

The workflow:

```text
npm ci
npm test -- --runInBand
npm run test:int
npm run build
```

The integration test job starts PostgreSQL as a GitHub Actions service container. It does not use production, staging, or a shared dev database.

## Systems Design Lessons In This App

This app is small, but it already teaches important systems design habits.

### Keep Business Rules In One Place

Booking rules live in `BookingsService`. This makes it easier to add Redis concurrency later because there is one main place where booking decisions happen.

### Separate Fast Tests From Real Infrastructure Tests

Unit tests should be quick and reliable. Integration tests should prove that important flows work with real infrastructure. Keeping them separate gives a better developer experience.

### Design For The Next Phase Without Building It Too Early

The booking module currently checks duplicate bookings, but it does not solve race conditions yet. That is okay because the next phase will introduce Redis-based concurrency control. Good design leaves space for the next step without pretending the current step already solves everything.

### Prefer Clear Boundaries Over Clever Abstractions

This codebase uses straightforward NestJS modules, services, DTOs, guards, and repositories. That is enough for the current system. More abstraction can be added later when the system proves it needs it.

## Suggested Next Learning Steps

Good next phases for systems design practice:

1. Add Redis locking to prevent two patients from booking the same slot at the same time.
2. Add database-level uniqueness for active bookings.
3. Add booking availability queries.
4. Add cancellation rules, such as no cancellation within 24 hours.
5. Add event-driven notifications after booking creation.
6. Add observability: request IDs, structured logs, and metrics.

Each step should come with tests and a short design note explaining the tradeoff.
