---
paths:
  - "**/*.php"
  - "**/livewire/**"
  - "**/resources/views/**"
  - "**/app/**"
  - "**/routes/**"
  - "**/database/migrations/**"
  - "**/composer.json"
  - "**/*.blade.php"
---

# Laravel / Livewire Rules

## Stack

- Laravel 11+ with Livewire 3 (full-stack, no separate SPA)
- Blade templates + Livewire components for interactivity
- Alpine.js for client-side micro-interactions (ships with Livewire)
- Tailwind CSS if project uses it (override global CSS Modules default for Laravel projects)

## Architecture

- Feature-based structure: `app/Features/{Feature}/` over default Laravel directories for large apps
- Livewire components in `app/Livewire/` — one component per user interaction
- Form requests for validation: `app/Http/Requests/` — never validate in controllers
- Actions pattern: single-responsibility classes in `app/Actions/` for business logic
- Services for complex orchestration: `app/Services/`

## Livewire 3

- `wire:model.live` for real-time binding (not `.defer` — that's Livewire 2)
- `#[Validate]` attribute for inline validation rules
- `#[Computed]` for cached computed properties
- `$this->dispatch()` for events (not `$this->emit()` — that's Livewire 2)
- Lazy loading: `wire:init` for expensive initial loads
- File uploads: `WithFileUploads` trait, validate mime types and size

## Database

- Eloquent models with explicit `$fillable` (never `$guarded = []`)
- Migrations: descriptive names, `down()` method always implemented
- Soft deletes via `SoftDeletes` trait where needed
- Query scopes for reusable filters: `scopeActive()`, `scopeForUser()`
- Eager load relationships to prevent N+1: `with()` in queries
- Use `DB::transaction()` for multi-model operations

## Security

- CSRF: `@csrf` in all forms (Blade handles this, Livewire auto-includes)
- Auth: Laravel Breeze or Fortify (not Jetstream unless already installed)
- Authorization: Policies over Gates for model-based permissions
- Mass assignment: always use `$fillable`, never `$guarded = []`
- SQL injection: always use Eloquent or parameterized queries, never raw `DB::raw()` with user input
- XSS: `{{ }}` for escaped output, `{!! !!}` only for trusted HTML

## Testing

- PHPUnit or Pest for unit/feature tests
- Livewire test helpers: `Livewire::test(Component::class)->set()->call()->assertSee()`
- Factory-based test data: `Model::factory()->create()`
- `RefreshDatabase` trait for test isolation
- Test auth flows: `$this->actingAs($user)`

## Deployment

- `php artisan config:cache`, `route:cache`, `view:cache` in production
- Queue workers: `php artisan queue:work` with supervisor
- `.env` never committed — `.env.example` as template
- `composer install --no-dev --optimize-autoloader` for production

## Common Mistakes to Avoid

- Don't put business logic in controllers — use Actions or Services
- Don't use `$guarded = []` — always whitelist with `$fillable`
- Don't use `DB::raw()` with user input — SQL injection risk
- Don't skip `down()` in migrations — makes rollback impossible
- Don't use `wire:model` without `.live` or `.blur` in Livewire 3 (it's deferred by default now)
- Don't mix Livewire and Alpine for the same interaction — choose one
