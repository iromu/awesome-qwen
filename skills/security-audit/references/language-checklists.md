# Language-Specific Security Checklists

## Node.js / JavaScript

### Dependency Security
```bash
npm audit --audit-level=high
npx @snyk/cli protect --severity-threshold=high
```

### Code-Level Checks
- [ ] No `eval()`, `Function()`, or `setTimeout(string)` — use parsed inputs
- [ ] No `child_process.exec()` with user input — use `execFile()` or `spawn()`
- [ ] JSON parsed with `JSON.parse()`, not `eval()`
- [ ] Template literals used for HTML output (not string concatenation)
- [ ] `helmet` middleware installed for security headers
- [ ] `express-rate-limit` or equivalent for rate limiting
- [ ] CSRF protection enabled for state-changing routes
- [ ] CORS configured explicitly (not `*` wildcard in production)
- [ ] `secure` flag set on cookies in production
- [ ] `sameSite: 'strict'` or `'lax'` on cookies
- [ ] Input validation with `zod`, `joi`, or `yup`
- [ ] SQL queries use parameterized statements (no string interpolation)
- [ ] JWTs verified with `jwt.verify()` and explicit algorithm whitelist
- [ ] `crypto` module used for hashing (bcrypt, scrypt, argon2) — no MD5/SHA1 for passwords
- [ ] `.env` files in `.gitignore`
- [ ] No `console.log()` of request bodies or headers in production

### Common Vulnerabilities
| CWE | Pattern | Fix |
|-----|---------|-----|
| CWE-94 | `eval(userInput)` | Use `JSON.parse()` or safe parsers |
| CWE-79 | Unescaped user input in HTML | Use template engines with auto-escaping |
| CWE-89 | SQL string interpolation | Use parameterized queries or an ORM |
| CWE-78 | `exec(userInput)` | Use `execFile()` with explicit args |
| CWE-611 | XXE in XML parsing | Use JSON; if XML, disable DTDs |
| CWE-434 | Unrestricted file upload | Validate MIME type, size, and sanitize filenames |

---

## Python

### Dependency Security
```bash
pip-audit
safety check
pipdeptree  # check for conflicting/unused deps
```

### Code-Level Checks
- [ ] No `eval()` or `exec()` — use `ast.literal_eval()` for data parsing
- [ ] No `pickle.loads()` on untrusted data — use `json` instead
- [ ] SQL queries use parameterized statements (`?` or `%(name)s`)
- [ ] `bcrypt` or `argon2-cffi` for password hashing
- [ ] `python-dotenv` or equivalent for secret management
- [ ] No hardcoded API keys or credentials
- [ ] `logging` configured to exclude sensitive data
- [ ] `requests` library used with `timeout` parameter
- [ ] `yaml.safe_load()` used (not `yaml.load()`)
- [ ] `jinja2` templates auto-escape enabled
- [ ] CSRF protection in web frameworks (Flask-WTF, Django CSRF)
- [ ] Rate limiting configured for API endpoints
- [ ] `--no-cache-dir` or explicit cache paths in CI

### Common Vulnerabilities
| CWE | Pattern | Fix |
|-----|---------|-----|
| CWE-78 | `os.system(user_input)` | Use `subprocess.run()` with list args |
| CWE-502 | `pickle.loads(untrusted_data)` | Use JSON or msgpack |
| CWE-94 | `eval(user_input)` | Use `ast.literal_eval()` |
| CWE-20 | Unvalidated input to `yaml.load()` | Use `yaml.safe_load()` |
| CWE-79 | Unescaped output in Jinja2 | Enable `autoescape=True` |

---

## Java

### Dependency Security
```bash
mvn org.owasp:dependency-check-maven:check
mvn com.github.spotbugs:spotbugs-maven-plugin:check
```

### Code-Level Checks
- [ ] No `Runtime.exec()` with user input — use `ProcessBuilder` with list args
- [ ] SQL queries use `PreparedStatement` (no string concatenation)
- [ ] JAXB/XStream deserialization uses safe configurations
- [ ] `spring-security` configured with CSRF, session fixation protection
- [ ] No `commons-collections` 3.x (known Gadget chain)
- [ ] Logging excludes sensitive data (passwords, tokens)
- [ ] `SecureRandom` used for tokens (not `Random`)
- [ ] `HttpOnly` and `Secure` flags on cookies
- [ ] CORS configured explicitly
- [ ] `@PreAuthorize` or `@Secured` on sensitive methods
- [ ] Deserialization whitelist configured (Jackson `@JsonTypeInfo`)
- [ ] No debug endpoints enabled in production

---

## Go

### Dependency Security
```bash
govulncheck ./...
gosec ./...
go list -m -u all  # check for newer versions
```

### Code-Level Checks
- [ ] No `exec.Command("sh", "-c", userInput)` — use explicit commands
- [ ] SQL queries use `db.QueryContext()` with `?` placeholders
- [ ] `crypto/rand` used for tokens (not `math/rand`)
- [ ] `httputil.ReverseProxy` sanitizes `Host` header
- [ ] `path/filepath.Clean()` applied to file paths
- [ ] `net/url.Parse()` validated before use in HTTP requests (SSRF)
- [ ] `encoding/json` used with explicit struct tags (no `map[string]interface{}` for untrusted input)
- [ ] `crypto/tls` configured with modern cipher suites
- [ ] No `fmt.Print()` of sensitive data in production logs
- [ ] `context` used for cancellation and timeouts on all I/O

---

## Ruby

### Dependency Security
```bash
bundle audit
bundle check
```

### Code-Level Checks
- [ ] No `eval()` or `instance_eval()` on user input
- [ ] SQL queries use `where(id: params[:id])` (no string interpolation)
- [ ] `strong_parameters` used for mass assignment protection
- [ ] `rack-cors` configured explicitly
- [ ] `protect_from_forgery` enabled in controllers
- [ ] No `YAML.load()` on untrusted input — use `YAML.safe_load()`
- [ ] `secrets.yml` or `Rails.application.credentials` used (no hardcoded secrets)
- [ ] `rack-mini-profiler` and `bullet` disabled in production

---

## Docker / Container Security

### Image Scanning
```bash
trivy image myapp:latest
grype myapp:latest
```

### Dockerfile Best Practices
- [ ] Multi-stage builds to minimize image size
- [ ] Non-root user (`USER appuser`)
- [ ] No `sudo` or `apt-get install` of unnecessary packages
- [ ] Pin base image versions (e.g., `node:18.19.0-alpine`, not `node:latest`)
- [ ] `.dockerignore` excludes `.git`, `node_modules`, `.env`
- [ ] Single `RUN` layer for package installs (caching)
- [ ] No secrets baked into image layers
- [ ] `COPY --chown` used for file ownership

### Docker Compose Security
- [ ] No `privileged: true` unless absolutely necessary
- [ ] Resource limits set (`mem_limit`, `cpus`)
- [ ] Networks isolated (no `network_mode: host`)
- [ ] Secrets injected via Docker secrets or environment files (not plaintext)

---

## Kubernetes / Helm

### Manifest Scanning
```bash
trivy config ./k8s/
checkov -d ./k8s/
```

### Checklist
- [ ] No `privileged: true` in pod specs
- [ ] Resource limits and requests set
- [ ] `securityContext.runAsNonRoot: true`
- [ ] No `hostNetwork`, `hostPID`, or `hostIPC`
- [ ] RBAC configured with least privilege
- [ ] Network policies defined
- [ ] Secrets stored in external vault (Vault, AWS Secrets Manager)
- [ ] Image pull policy set (`Always` or specific tag)
- [ ] Liveness and readiness probes configured
- [ ] Pod disruption budgets defined for critical workloads
