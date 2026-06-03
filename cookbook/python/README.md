# Python Cookbook

Quick reference recipes for common Qwen Code tasks in Python projects.

## Table of Contents
- [Scaffold a New Project](#scaffold-a-new-project)
- [Set Up Virtual Environment](#set-up-virtual-environment)
- [Configure Pytest](#configure-pytest)
- [Create a CLI Tool with Click](#create-a-cli-tool-with-click)
- [Set Up Pre-commit Hooks](#set-up-pre-commit-hooks)

---

## Scaffold a New Project

**Prompt**: "Scaffold a new Python project"

```bash
# What Qwen will do:
mkdir my-project && cd my-project
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Create structure
mkdir src tests
touch src/__init__.py src/main.py
touch tests/__init__.py

# pyproject.toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.10"
```

## Set Up Virtual Environment

**Prompt**: "Set up a virtual environment for this project"

```bash
# Create
python -m venv .venv

# Activate
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Freeze current deps
pip freeze > requirements.txt

# Deactivate
deactivate
```

## Configure Pytest

**Prompt**: "Set up pytest for this project"

```bash
pip install pytest pytest-cov pytest-mock

# pyproject.toml addition
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --tb=short"

# tests/conftest.py (shared fixtures)
import pytest

@pytest.fixture
def sample_data():
    return {"key": "value", "count": 42}

# Run tests
pytest                           # All tests
pytest tests/test_auth.py        # Single file
pytest -k "test_login"           # By name pattern
pytest --cov=src --cov-report=html  # With coverage
```

## Create a CLI Tool with Click

**Prompt**: "Create a CLI tool with subcommands"

```python
# src/cli.py
import click

@click.group()
@click.version_option("0.1.0")
def cli():
    """My awesome CLI tool."""
    pass

@cli.command()
@click.argument("name")
@click.option("--greeting", default="Hello", help="Greeting message")
def greet(name: str, greeting: str):
    """Greet someone by name."""
    click.echo(f"{greeting}, {name}!")

@cli.command()
@click.option("--count", default=1, help="Number of items")
def list_items(count: int):
    """List items."""
    for i in range(1, count + 1):
        click.echo(f"Item {i}")

if __name__ == "__main__":
    cli()

# pyproject.toml
[project.scripts]
mytool = "src.cli:cli"

# Usage
# mytool greet World --greeting "Hi"
# mytool list-items --count 5
```

## Set Up Pre-commit Hooks

**Prompt**: "Set up pre-commit hooks for this project"

```bash
pip install pre-commit

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```
