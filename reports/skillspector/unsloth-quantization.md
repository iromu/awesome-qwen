# SkillSpector Security Report

**Skill:** unsloth-quantization  
**Scanned:** 2026-10-08 06:20:54 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (10)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 223 | No |
| `evals/evals.json` | json | 64 | No |
| `references/benchmarks.md` | markdown | 90 | No |
| `references/dynamic-gguf.md` | markdown | 121 | No |
| `references/fp8.md` | markdown | 49 | No |
| `references/gguf-export.md` | markdown | 177 | No |
| `references/nvfp4.md` | markdown | 127 | No |
| `references/phone-deployment.md` | markdown | 139 | No |
| `references/qat.md` | markdown | 178 | No |
| `references/speculative-decoding.md` | markdown | 104 | No |

## Issues (25)

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 90%  

**Message:** Description-behavior mismatch: declared purpose is 'Guidance for quantizing and exporting models with Unsloth: GGUF conversion via save_pretrained_gguf/push_to_hub_gguf, LoRA merging, merged 16/4-bit exports, QAT, FP8/NVFP4, speculative-decoding draft models, and ExecuTorch .te export. Explicitly excludes running/serving models (deferred to an 'unsloth-inference' skill).' but code also performs: Importing/registering a model into a local Ollama server (ollama create with a Modelfile) rather than performing GGUF/FP8/NVFP4 quantization or export via Unsloth APIs, Invoking live model inference/serving through the Ollama HTTP chat API on localhost:11434, a capability the description explicitly excludes ('NOT for ... running/serving models'), No quantization, LoRA merge, save_pretrained_gguf/push_to_hub_gguf, imatrix, QAT, or .pte export logic present at all.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk contains only Ollama serving commands: `ollama create unsloth_model -f ./model/Modelfile` to register/import a model into a local Ollama server, then a `curl` POST to http://localhost:11434/api/chat to issue an inference chat request against the served model.`
- **code_end_line:** `128`
- **code_path:** `SKILL.md`
- **code_start_line:** `127`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 90%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill claims to cover quantization and export of models (GGUF via save_pretrained_gguf/push_to_hub_gguf, LoRA merging, merged 16/4-bit exports, FP8/NVFP4, QAT, speculative-decoding drafts, ExecuTorch .pte, reading quant benchmarks) and explicitly excludes running/serving models (deferred to an 'unsloth-inference' skill).' but code also performs: Executing model inference via the Ollama chat API (curl POST to localhost:11434/api/chat) - explicitly excluded by the description's 'NOT for running/serving models' clause, Packaging/importing a model into a runtime (ollama create) rather than performing GGUF quantization or export APIs such as save_pretrained_gguf.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk contains no quantization or export code. It runs `ollama create` to package a model from a Modelfile into Ollama, then performs live chat inference by POSTing a prompt to the Ollama HTTP API at localhost:11434.`
- **code_end_line:** `147`
- **code_path:** `references/gguf-export.md`
- **code_start_line:** `138`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 75%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill declares itself scoped to quantization and export workflows (GGUF conversion via save_pretrained_gguf/push_to_hub_gguf, LoRA merge, merged 16/4-bit exports, QAT, NVFP4/FP8, speculative-decoding drafts, ExecuTorch .pte export, and reading quantization benchmarks), and explicitly excludes training, RL, and running/serving models (deferred to unsloth-inference).' but code also performs: Running/serving a model via llama-cli inference (sampling params: temp, top-p, top-k) — an activity the description explicitly places OUT of scope and delegates to a separate 'unsloth-inference' skill, Loading a multimodal projector file (--mmproj) for chat/inference use, unrelated to quantize/export tooling.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk is a shell example that launches ./llama.cpp/llama-cli against an already-quantized UD-Q4_K_XL GGUF checkpoint plus an mmproj file, setting --temp/--top-p/--top-k sampling parameters. This is a model inference/serving invocation, not any quantization, export, or benchmark-reading operation.`
- **code_end_line:** `177`
- **code_path:** `references/qat.md`
- **code_start_line:** `172`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 72%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill description scopes the skill to quantization and export workflows: converting fine-tunes to GGUF (save_pretrained_gguf / push_to_hub_gguf), LoRA merging, merged 16-bit/4-bit exports, FP8/NVFP4 exports, QAT, speculative-decoding draft models, ExecuTorch .pte export, and reading quantization benchmarks. It explicitly excludes training, RL, and "running/serving models (unsloth-inference)".' but code also performs: Executing/running a model for inference via llama.cpp llama-cli (model loading onto GPU with n-gpu-layers, context size, sampling parameters temp/top-p/min-p), which the description explicitly excludes as 'unsloth-inference' scope, Generating arbitrary application output (writing a 'Flappy Bird game' code snippet) from a user prompt, unrelated to any quantization/export task, No quantization, GGUF export, LoRA merge, QAT, or benchmark-reading operation is actually performed by the chunk.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The supplied chunk is a single shell command that launches ./llama.cpp/llama-cli against an already-quantized GGUF file (Llama-4-Scout UD-IQ2_XXS), configuring runtime inference parameters (threads, ctx-size 16384, n-gpu-layers 99, CPU offload of FFN experts via -ot, seed, priority, temp/min-p/top-p, -no-cnv) and issuing a free-form generation prompt ("Create a Flappy Bird game"). No quantization, conversion, merging, export, or benchmark-reading logic is present; the file merely invokes a model for text generation.`
- **code_end_line:** `82`
- **code_path:** `references/dynamic-gguf.md`
- **code_start_line:** `70`

---

### 🔴 HIGH: SC2

**Location:** `references/gguf-export.md:131`  
**Confidence:** 90%  

**Message:** External Script Fetching

**Remediation:** Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. If remote fetch is required, verify checksums and use HTTPS.

---

### 🔴 HIGH: TM2

**Location:** `references/gguf-export.md:131`  
**Confidence:** 70%  

**Message:** Chaining Abuse

**Remediation:** Limit tool chaining depth and validate the output of each tool before passing it to the next. Require explicit user approval for multi-step chains.

---

### 🔴 HIGH: AR3

**Location:** `references/phone-deployment.md:83`  
**Confidence:** 75%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove jailbreak framing that nullifies safety policies or restrictions. Skill content must not instruct the agent to ignore its guidelines or operate without guardrails.

---

### 🔴 HIGH: P1

**Location:** `references/phone-deployment.md:83`  
**Confidence:** 70%  

**Message:** Instruction Override

**Remediation:** Remove or rewrite any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content. Ensure skill content cannot be injected to alter agent behavior.

---

### 🔴 HIGH: SQP-2

**Location:** `references/phone-deployment.md:125–128`  
**Confidence:** 72%  

**Message:** The snippet creates /data/local/tmp/llama on the Android device with mode 777 and pushes the .pte model and tokenizer.json into it. /data/local/tmp is the world-writable, adb-shell-accessible staging area on Android; making it 0777 removes the last remaining isolation, so any app or process able to reach that path (or any adb connection, e.g. over adb-over-TCP / a compromised dev host) can read, replace, or delete the pushed model and tokenizer. Tampering with tokenizer.json or the .pte is a model-integrity/vector-poisoning vector, and the docs give no warning that the directory is shared or that the files are world-readable. Severity is limited because this is a developer-only sideload path (requires an adb-connected host) and the payload is a public model weight file, not credentials.

**Remediation:** Use a private app-private path (e.g. /sdcard/Android/data/<package>/files or run-as app storage) instead of /data/local/tmp, or at minimum use `adb shell chmod 700` / `chmod 755` on the directory and `chmod 600` on the pushed files, and add a note that /data/local/tmp is a device-wide shared, adb-exposed location. If /data/local/tmp must be used, delete the pushed files after loading and warn against leaving other data there.

---

### 🔴 HIGH: TM1

**Location:** `references/phone-deployment.md:126`  
**Confidence:** 80%  

**Message:** Tool Parameter Abuse

**Remediation:** Validate all tool parameters against an allowlist. Reject dangerous parameter values (shell=True, --force, -rf /) and use safe defaults.

---

### 🟡 MEDIUM: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 68%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill is described as handling model quantization and export workflows: GGUF conversion/export, LoRA merging, quantization methods, QAT, merged exports, speculative-decoding GGUF draft model creation, and related benchmark reading. It explicitly excludes training, RL, and running/serving models.' but code also performs: Model serving/inference through vLLM, Runtime speculative decoding configuration.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The supplied chunk is a shell command that launches `vllm serve` with a speculative decoding configuration (`method: mtp`, `num_speculative_tokens: 2`). Its primary behavior is running/serving a model in vLLM, not quantizing, exporting, or creating a GGUF draft model.`
- **code_end_line:** `87`
- **code_path:** `references/speculative-decoding.md`
- **code_start_line:** `86`

---

### 🟡 MEDIUM: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 62%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill is declared to cover model quantization and export workflows: GGUF conversion/export, LoRA merging, FP8/NVFP4 exports, quantization-aware training, benchmark reading, and related export commands.' but code also performs: model loading / 4-bit load-time model initialization, no GGUF conversion or export, no LoRA merge/export, no save_pretrained_gguf, push_to_hub_gguf, save_pretrained_merged, or similar export behavior.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The supplied code only imports Unsloth and loads a pretrained fine-tuned LoRA model and tokenizer in 4-bit using FastLanguageModel.from_pretrained. It does not convert or export GGUF, merge LoRA adapters, save/push a model, run quantization benchmarks, or perform any export/quantization conversion.`
- **code_end_line:** `82`
- **code_path:** `SKILL.md`
- **code_start_line:** `77`

---

### 🟡 MEDIUM: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 60%  

**Message:** Description-behavior mismatch: declared purpose is 'Description scopes the skill to quantization and export workflows: GGUF creation (save_pretrained_gguf/push_to_hub_gguf, quants, imatrix), Dynamic GGUF 2.0/3.0, FP8/NVFP4 quantization for Blackwell, QAT schemes, merged 16/4-bit exports, speculative-decoding draft GGUF, ExecuTorch .pte export, and reading quantization benchmarks. It explicitly excludes running/serving models (deferred to unsloth-inference).' but code also performs: Launching a vLLM inference/serving server (explicitly excluded: 'NOT for running/serving models (unsloth-inference)'), Setting an inference runtime kernel/target-arch flag (CUTE_DSL_ARCH=sm_121a) and MoE backend selection (flashinfer_b12x) rather than performing any quantize/export step.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk contains no quantization or export logic. It only sets CUTE_DSL_ARCH=sm_121a (a GPU/CUTLASS DSL target-arch flag) and launches an inference server with `vllm serve unsloth/Qwen3.6-35B-A3B-NVFP4-Fast --moe-backend flashinfer_b12x`, i.e. deploying/serving an already-quantized NVFP4 MoE checkpoint on Blackwell-class hardware via vLLM with the FlashInfer MoE backend.`
- **code_end_line:** `114`
- **code_path:** `references/nvfp4.md`
- **code_start_line:** `113`

---

### 🟡 MEDIUM: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 60%  

**Message:** Description-behavior mismatch: declared purpose is 'The description scopes the skill to quantization and export workflows: GGUF export via save_pretrained_gguf/push_to_hub_gguf, LoRA merging, merged 16-bit/4-bit exports, QAT, FP8/NVFP4 targets, speculative-decoding drafts, ExecuTorch .pte export, and reading quantization benchmarks. It explicitly excludes running/serving models (deferred to a separate 'unsloth-inference' skill).' but code also performs: Installation of an external model-serving runtime (Ollama) via remote script execution (curl | sh), which the description explicitly carves out as 'NOT for ... running/serving models', System-level package installation (apt-get install zstd) and arbitrary network-downloaded code execution — capabilities not implied by the quantize/export purpose.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk installs system packages via apt-get (zstd) and installs the Ollama inference runtime by piping a remote install script into a shell (curl -fsSL https://ollama.com/install.sh | sh), then prints the auto-generated Ollama Modelfile after GGUF export.`
- **code_end_line:** `134`
- **code_path:** `references/gguf-export.md`
- **code_start_line:** `129`

---

### 🟡 MEDIUM: SQP-2

**Location:** `SKILL.md:89–146`  
**Confidence:** 62%  

**Message:** Hugging Face Hub upload examples (`push_to_hub_gguf` / `push_to_hub_merged` / `push_to_hub`, L91, L95, L99, L105-110, L136, L140, L145-146) transmit model weights, tokenizer/chat-template metadata and an access token off-machine, with no warning about repo visibility (public by default), about embedding a literal `token = "YOUR_HF_TOKEN"` in code, or about verifying the exported chat template before publishing.

**Remediation:** Add an explicit warning in Step 2 and in the Core Workflow code fences: (1) `push_to_hub_*` uploads to a remote repo that is public unless the repo is created private — confirm the user wants the artifact published and confirm repo visibility before running; (2) read the token from an environment variable / secret store rather than an inline `token = "YOUR_HF_TOKEN"` literal, and warn against committing it or pasting it into logs/notes; (3) instruct the user to verify the exported GGUF locally (Step 4) before any push, and to revoke a token that was ever pasted into code.

---

### 🟡 MEDIUM: E1

**Location:** `SKILL.md:128`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: E1

**Location:** `references/gguf-export.md:142`  
**Confidence:** 60%  

**Message:** External Transmission

**Remediation:** Verify the destination URL is trusted and necessary. Remove or replace with documented APIs. Ensure no secrets, tokens, or PII are transmitted.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/fp8.md:25–26`  
**Confidence:** 55%  

**Message:** Upload-to-Hub path (push_to_hub=True with a raw HF token) is documented with no warning about publishing model weights or handling the credential

**Remediation:** Add a caution before the code example stating that push_to_hub=True uploads model weights to Hugging Face Hub (default repo visibility must be checked before publishing proprietary weights), that the access token should be supplied via an environment variable or secret manager rather than typed inline, and that the upload is irreversible once the weights are public. Consider recommending a dry-run / save-locally-first step before any upload.

---

### 🟡 MEDIUM: PE2

**Location:** `references/nvfp4.md:98`  
**Confidence:** 70%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/phone-deployment.md:64–66`  
**Confidence:** 55%  

**Message:** Remote archives are downloaded and executed/extracted without integrity checks (`curl -L ... | tar -xz`, `git clone`, and `sed -i` rewriting an app source file in place), none of which is flagged to the user

**Remediation:** Instruct the user to download the archive separately and verify its checksum/signature before extraction, and add a note that the `sed -i` and `echo >` fix-up commands modify project files in place so the working tree should be committed or backed up first.

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/phone-deployment.md:96–100`  
**Confidence:** 60%  

**Message:** `yes | sdkmanager --licenses` blindly auto-accepts every Android SDK/NDK license on the user's machine without review, and the script exports ANDROID_HOME/ANDROID_NDK/PATH into the session, with no disclosure

**Remediation:** Replace the blind acceptance with `sdkmanager --licenses` run interactively (or `--sdk_root`-scoped) and add a sentence stating that this step accepts all pending SDK/NDK licenses on the user's behalf, plus a note that ANDROID_HOME, ANDROID_NDK and PATH are modified for the current shell session.

---

### 🟡 MEDIUM: PE2

**Location:** `references/phone-deployment.md:126`  
**Confidence:** 80%  

**Message:** Sudo/Root Execution

**Remediation:** Avoid sudo/root unless strictly required. Prefer least-privilege patterns. If elevation is needed, document the justification and scope.

---

### 🟢 LOW: SDI-1

**Location:** `SKILL.md:126–129`  
**Confidence:** 45%  

**Message:** Serving/inference steps are embedded in the export workflow even though the manifest declares running/serving models out of scope ("Ollama run", vLLM/SGLang → unsloth-inference)

**Remediation:** Either move the `ollama create` + chat-test snippet and the vLLM/SGLang launch/backend flags into `unsloth-inference` (leaving only "load the GGUF in your runtime to sanity-check the chat template" as prose), or amend the manifest description to state explicitly that export-adjacent smoke-test run commands for Ollama/vLLM/SGLang are in scope, so the boundary claim and the content agree.

---

### 🟢 LOW: SQP-1

**Location:** `references/fp8.md:1–49`  
**Confidence:** 0%  

**Message:** No activation trigger or invocation description present in this reference file

**Remediation:** No action required.

---

### 🟢 LOW: SQP-2

**Location:** `references/qat.md:113–120`  
**Confidence:** 55%  

**Message:** HF Hub upload example (push_to_hub=True with an API token) is presented without any warning that this publishes model weights/training-derived artifacts publicly and handles a credential

**Remediation:** Add an explicit note next to the push_to_hub example warning that the upload is irreversible and, if the repo is public, exposes model weights (and any data memorised in them) to anyone; tell the user to verify repository visibility, use a scoped/write-scoped, revocable token, and never hard-code or commit the token (read it from the HF_TOKEN env var instead).

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 100.0% |
| Fully inspected | 10 |
| Partially inspected | 0 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:4-4` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:24-24` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:127-127` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:169-169` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:209-209` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:222-222` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |

### Analyzer Statuses

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| completed | `artifact_integrity` |  |
| no_applicable_files | `behavioral_ast` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `behavioral_taint_tracking` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `bundled_execution_surface` | No files matched this analyzer's applicability contract. |
| no_applicable_files | `mcp_least_privilege` | No files matched this analyzer's applicability contract. |
| completed | `mcp_rug_pull` |  |
| completed | `mcp_tool_poisoning` |  |
| completed | `meta_analyzer` |  |
| completed | `semantic_developer_intent` |  |
| completed | `semantic_quality_policy` |  |
| completed | `semantic_security_discovery` |  |
| completed | `static_patterns_agent_snooping` |  |
| completed | `static_patterns_anti_refusal` |  |
| completed | `static_patterns_data_exfiltration` |  |
| completed | `static_patterns_deserialization` |  |
| completed | `static_patterns_excessive_agency` |  |
| completed | `static_patterns_harmful_content` |  |
| completed | `static_patterns_memory_poisoning` |  |
| completed | `static_patterns_output_handling` |  |
| completed | `static_patterns_privilege_escalation` |  |
| completed | `static_patterns_prompt_injection` |  |
| completed | `static_patterns_rogue_agent` |  |
| completed | `static_patterns_ssrf` |  |
| completed | `static_patterns_supply_chain` |  |
| completed | `static_patterns_system_prompt_leakage` |  |
| completed | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*
