# 🚀 Pull Request Title Convention

> Keep the Pull Request history **clean** and **easy to understand** by following a consistent title format.

---

## 📐 Format

```
<type>(<scope>): <summary>
   │       │          │
   │       │          └─ Summary of the change (imperative, capitalised, no period)
   │       │
   │       └─ Scope (optional) – specific area affected
   │
   └─ Type – category of the change
```

### Quick Examples
- `feat(protocol): Add device registration messages`
- `fix(core): Handle reconnect failures`
- `refactor: Simplify transport lifecycle`
- `docs: Improve installation guide`

---

## 🏷️ Types

| Type       | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `feat`     | A new feature                                                            |
| `fix`      | A bug fix                                                                |
| `perf`     | A code change that improves performance                                  |
| `test`     | Adding missing tests or correcting existing tests                        |
| `docs`     | Documentation-only changes                                               |
| `refactor` | A behavior-neutral code change that does not fix a bug or add a feature  |
| `build`    | Changes affecting the build system or external dependencies              |
| `ci`       | Changes to CI configuration files and scripts                            |
| `chore`    | Routine tasks, maintenance, and minor updates not covered by other types |

---

## 🎯 Scope (Optional)

Use a scope **only** when the change clearly belongs to a specific part of the project.  
If the change spans multiple areas or is unclear, simply omit the scope.

### Supported Scopes

| Scope       | Description                             |
| ----------- | --------------------------------------- |
| `core`      | Core functionality and internal logic   |
| `protocol`  | Device communication protocol changes   |
| `sdk`       | Public SDK changes                      |
| `transport` | Communication transport implementations |
| `cli`       | Command-line interface changes          |
| `examples`  | Example applications and demos          |
| `docs`      | Documentation changes                   |
| `ci`        | Continuous integration and automation   |
| `build`     | Build system and dependency changes     |

*Scopes may be expanded as the project grows.*

### Examples with Scope
- `feat(protocol): Add message validation`
- `fix(core): Prevent duplicate device registration`
- `test(sdk): Add device lifecycle tests`

### Examples without Scope
- `feat: Add device discovery support`
- `refactor: Simplify package exports`
- `docs: Update contribution guide`

---

## ✍️ Summary Rules

- Use **imperative present tense** (e.g., “Add”, not “Added” or “Adds”).
- Start with a **capital letter**.
- Be **concise** and **descriptive**.
- **Do not** end with a period.

### ✅ Good
```
feat(protocol): Add device registration messages
```

### ❌ Bad
```
feat(protocol): Added device registration messages.
```

---

## 📋 Complete Examples

### ✔️ Valid Titles
```
feat: Add device discovery support
feat(protocol): Add handshake message format
fix(core): Handle disconnected devices correctly
refactor(transport): Simplify connection management
docs: Improve development setup guide
```

### ✖️ Invalid Titles
```
Added new feature          ← wrong tense, missing type
update stuff               ← lowercase, vague
fix: fixed a bug.          ← wrong tense, period
feature(protocol): Add...  ← wrong type keyword (use feat)
