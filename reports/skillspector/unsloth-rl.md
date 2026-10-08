# SkillSpector Security Report

**Skill:** unsloth-rl  
**Scanned:** 2026-10-08 06:38:22 UTC  

## Risk Assessment

| Metric | Value |
|--------|-------|
| Score | 100/100 |
| Severity | CRITICAL |
| Recommendation | DO NOT INSTALL |

## Components (10)

| File | Type | Lines | Executable |
|------|------|-------|------------|
| `SKILL.md` | markdown | 357 | No |
| `evals/evals.json` | json | 65 | No |
| `references/agents-rl.md` | markdown | 315 | No |
| `references/grpo-advanced.md` | markdown | 224 | No |
| `references/grpo-basics.md` | markdown | 118 | No |
| `references/preference.md` | markdown | 231 | No |
| `references/reward-functions.md` | markdown | 297 | No |
| `references/reward-hacking.md` | markdown | 112 | No |
| `references/vision-rl.md` | markdown | 254 | No |
| `references/vram-and-hardware.md` | markdown | 196 | No |

## Issues (15)

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 90%  

**Message:** Description-behavior mismatch: declared purpose is 'Skill declared for reinforcement learning and preference alignment workflows with Unsloth: GRPO/GSPO/DAPO/Dr.GRPO/BNPO training, reward function and verifier (RLVR) design, DPO/ORPO/KTO preference alignment, RLHF/PPO — explicitly excluding plain SFT/LoRA/QLoRA.' but code also performs: Plain supervised fine-tuning / LoRA adapter setup (excluded by the description, which directs such cases to unsloth-finetuning), 4-bit model loading/quantization and vLLM fast-inference configuration rather than RL/preference-alignment behavior.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk only loads a pretrained model with 4-bit quantization and fast inference, then attaches a LoRA adapter via get_peft_model (rank/alpha, target attention+MLP modules, gradient checkpointing). No RL trainer, reward function, verifier, or preference (chosen/rejected) dataset is present.`
- **code_end_line:** `124`
- **code_path:** `SKILL.md`
- **code_start_line:** `100`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 85%  

**Message:** Description-behavior mismatch: declared purpose is 'Use this skill whenever the user wants to do REINFORCEMENT LEARNING or preference alignment with the Unsloth Python library: train a model with GRPO (or GSPO, DAPO, Dr.GRPO, BNPO) to reason, follow rules, win a game, or produce verifiable answers; write or design reward functions and verifiers (RLVR); DPO-align, ORPO, or KTO a model with chosen/rejected preference data; RLHF/PPO questions; FP8 RL, long-context GRPO, vision RL (VLM GRPO/GSPO), or training AI agents with RL. Trigger on "reasoning model", "R1-' but code also performs: Plain model inference/generation (model.generate) with CUDA, which is outside the declared RL/preference-alignment purpose and closer to inference/serving., No reinforcement-learning or preference-alignment behavior such as GRPO/GSPO/DPO training, reward computation, verifier logic, or preference data handling..

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** ``
- **code_end_line:** `226`
- **code_path:** `references/vision-rl.md`
- **code_start_line:** `213`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** Description-behavior mismatch: declared purpose is 'Skill is declared as guidance for reinforcement-learning / preference-alignment work with Unsloth: designing reward functions and verifiers, and running GRPO/GSPO/DAPO/BNPO, DPO/ORPO/KTO, RLHF/PPO training. It explicitly excludes inference/serving ("NOT for ... running/serving models and SDKs — use unsloth-inference").' but code also performs: Model inference / text generation via vLLM (fast_generate + SamplingParams), Loading and applying a saved LoRA adapter for serving rather than training, Adapter export/save (save_lora), which borders on the excluded export/quantization scope.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The chunk saves a trained LoRA adapter (model.save_lora), builds a chat-template prompt, then configures vLLM SamplingParams and calls model.fast_generate with model.load_lora to perform text generation/inference with the loaded adapter. No training loop, reward function, verifier, or preference-data handling is present.`
- **code_end_line:** `265`
- **code_path:** `SKILL.md`
- **code_start_line:** `248`

---

### 🔴 HIGH: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 70%  

**Message:** Description-behavior mismatch: declared purpose is 'The description declares this skill for reinforcement learning and preference alignment workflows with Unsloth (GRPO/GSPO/DAPO/BNPO, reward functions/RLVR, DPO/ORPO/KTO, RLHF/PPO). It explicitly excludes model export/quantization (GGUF/FP8/NVFP4/QAT), directing those to the unsloth-quantization skill.' but code also performs: Model export/quantization (save_pretrained_merged with mxfp4 and merged_16bit save methods), which the description explicitly scopes out of this skill and assigns to unsloth-quantization.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The code chunk contains only two calls to model.save_pretrained_merged saving a merged model with save_method="mxfp4" and "merged_16bit" — i.e., model merging/export/quantization steps. It contains no RL training, reward function, or preference-alignment logic.`
- **code_end_line:** `244`
- **code_path:** `references/agents-rl.md`
- **code_start_line:** `243`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:36`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/agents-rl.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:314`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/agents-rl.md`

---

### 🔴 HIGH: AE1

**Location:** `SKILL.md:324`  
**Confidence:** 100%  

**Message:** Referenced artifact was not completely inspected

**Remediation:** Review the reported expression and analyzer's parsing limitation; correct the scanner if it misinterprets valid source, then rerun the scan. Keep required references; incomplete analysis is not proof of malicious evasion.

**Evidence:**
- **reasons:** `[{'reason_code': 'static_parse_limit', 'message': "A security-relevant expression exceeded a bounded static parser's span limit.", 'phase': 'static', 'analyzers': ['static_patterns_tool_misuse']}]`
- **target_disposition:** `partial`
- **target_path:** `references/agents-rl.md`

---

### 🔴 HIGH: AR1

**Location:** `evals/evals.json:36`  
**Confidence:** 70%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove any instruction telling the agent to never refuse or always comply. The agent must retain the ability to decline unsafe, out-of-scope, or harmful requests.

---

### 🔴 HIGH: AR1

**Location:** `evals/evals.json:37`  
**Confidence:** 70%  

**Message:** Anti-Refusal Statement

**Remediation:** Remove any instruction telling the agent to never refuse or always comply. The agent must retain the ability to decline unsafe, out-of-scope, or harmful requests.

---

### 🔴 HIGH: OH1

**Location:** `references/reward-functions.md:280`  
**Confidence:** 80%  

**Message:** Unvalidated Output Injection

**Remediation:** Validate and sanitize all model output before using it in downstream contexts. Use parameterized queries for SQL, shell quoting for commands, and HTML encoding for web output.

---

### 🟡 MEDIUM: TP4

**Location:** `SKILL.md:1`  
**Confidence:** 62%  

**Message:** Description-behavior mismatch: declared purpose is 'The skill is declared for reinforcement learning and preference alignment workflows (GRPO/GSPO/DAPO/Dr.GRPO/BNPO, DPO/ORPO/KTO, RLHF/PPO, reward/verifier design, and vision RL), while explicitly excluding plain supervised fine-tuning, LoRA/QLoRA/PEFT-style SFT setup, and model export/inference.' but code also performs: LoRA/PEFT adapter configuration, Supervised fine-tuning-style model adapter setup.

**Remediation:** Update the skill description to accurately reflect all capabilities, or remove undeclared functionality from the implementation.

**Evidence:**
- **actual_behavior_summary:** `The supplied Python chunk only configures a PEFT/LoRA adapter for a FastVisionModel by selecting trainable vision/language/attention/MLP modules and setting LoRA hyperparameters such as r, alpha, dropout, and gradient checkpointing. It does not itself perform RL, GRPO/GSPO, reward computation, verifier logic, DPO/ORPO/KTO preference training, or any other preference-alignment behavior.`
- **code_end_line:** `60`
- **code_path:** `references/vision-rl.md`
- **code_start_line:** `45`

---

### 🟡 MEDIUM: SQP-2

**Location:** `references/agents-rl.md:261–300`  
**Confidence:** 60%  

**Message:** RULER reward scoring sends agent trajectory data to a third-party LLM API ("openai/o3") with no privacy/data-egress warning

**Remediation:** Add an explicit warning that RULER transmits trajectory contents to an external API (openai/o3 or equivalent), note that an OpenAI API key is required and incurs cost, and advise users to redact or exclude sensitive user data from trajectories before scoring, or to point RULER at a locally hosted judge model instead.

---

### 🟢 LOW: SDI-4

**Location:** `references/vision-rl.md:30`  
**Confidence:** 60%  

**Message:** Comment on `fast_inference = False` says "Enable vLLM fast inference", contradicting the code

**Remediation:** Change the comment to "# False to disable vLLM fast inference (True to enable)", or set `fast_inference = True` if vLLM rollout is actually intended for this recipe, and state which VLMs require it to be off.

---

### 🟢 LOW: SQP-2

**Location:** `references/vision-rl.md:243–249`  
**Confidence:** 35%  

**Message:** Model/token upload to Hugging Face Hub is shown without any user-facing warning about public disclosure of model weights or safe handling of the access token

**Remediation:** Add an explicit caution above the Saving block: pushing to the Hub publishes the adapter/merged weights externally and may expose proprietary or licensed model weights, so verify the repo is private before pushing, and pass the write token via an environment variable / secret manager rather than an inline literal in the notebook.

---

### 🟢 LOW: SDI-2

**Location:** `references/vision-rl.md:248–249`  
**Confidence:** 50%  

**Message:** Reference doc directs model merging and GGUF export/push-to-hub, which the manifest explicitly scopes to the unsloth-quantization skill

**Remediation:** Drop the merge/GGUF guidance from this reference and add a pointer to the unsloth-quantization skill for export, or (if kept) explicitly mark it as out-of-scope hand-off and remove the hub-upload example so no credential/token usage is implied here.

---

## Inspection Completeness

| Metric | Value |
|--------|-------|
| Execution | successful |
| Status | partial |
| Coverage | 90.0% |
| Fully inspected | 9 |
| Partially inspected | 1 |
| Entirely uninspected | 0 |

### Ledger Exceptions

| Reason / Status | Location | Details |
|-----------------|----------|---------|
| reference_missing | `SKILL.md:279-279` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| reference_missing | `SKILL.md:280-280` | A local path-like reference does not match any bundled artifact, such as a file the skill writes at runtime. |
| static_parse_limit | `references/agents-rl.md` | A security-relevant expression exceeded a bounded static parser's span limit. |

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
| completed | `reference_coverage` |  |
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
| degraded | `static_patterns_tool_misuse` |  |
| completed | `static_yara` |  |

### Limitations

- Analyzer static_patterns_tool_misuse status: degraded.

## Metadata

- **Executable Scripts:** No

*Generated by SkillSpector v2.12.0*
