## Description: <br>
Supervised fine-tuning of open LLMs and VLMs with the Unsloth library — QLoRA or 16-bit/8-bit LoRA and full fine-tuning via FastLanguageModel and the TRL trainers, plus continued pretraining, vision, embedding, MoE and multi-GPU long-context runs; not RL, quantization/export, or serving. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: The author email in the frontmatter is a personal, non-NVIDIA address and the repository is a third-party awesome list; the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers fine-tuning an open-weight LLM or VLM on their own QA, instruction, vision or embedding data — choosing between QLoRA, 16-bit/8-bit LoRA and full fine-tuning, budgeting VRAM for a specific GPU, and setting LoRA rank, target modules, chat template and trainer hyperparameters. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Optional] <br>
**Credential Type(s):** [API key] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [sft-lora.md](references/sft-lora.md) <br>
- [hyperparameters.md](references/hyperparameters.md) <br>
- [datasets.md](references/datasets.md) <br>
- [installation.md](references/installation.md) <br>
- [requirements-vram.md](references/requirements-vram.md) <br>
- [vision.md](references/vision.md) <br>
- [embedding.md](references/embedding.md) <br>
- [moe.md](references/moe.md) <br>
- [multi-gpu.md](references/multi-gpu.md) <br>
- [chat-templates.md](references/chat-templates.md) <br>
- [pretraining.md](references/pretraining.md) <br>
- [long-context.md](references/long-context.md) <br>
- [troubleshooting.md](references/troubleshooting.md) <br>
- [model-catalog.md](references/model-catalog.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Configuration instructions] <br>
**Output Format:** [Markdown with inline Python code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Validated against 4 internal eval cases in `evals/evals.json` — QLoRA fine-tuning of Qwen3-4B on a local QA dataset, vision caption fine-tuning on image+caption data, ShareGPT-style conversational fine-tuning of Llama-3.1-8B-Instruct, and continued pretraining on a raw Korean Wikipedia corpus — each carrying 5–6 per-case assertions, plus 9 automated schema/repository and semantic-version checks. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the produced training code uses real Unsloth/TRL APIs and documented argument names (FastLanguageModel method flags, get_peft_model target modules, SFTConfig keys, per-family chat-template markers) instead of invented arguments. <br>
- Discoverability: Whether the skill triggers on fine-tuning, LoRA hyperparameter and VRAM-planning requests and stays silent on RL, quantization/export and serving requests that belong to the sibling Unsloth skills. <br>
- Reliability: Whether the skill consistently lands on the documented method and dataset-format recipe for the requested model family, including the boundary between chat-template and Alpaca-style data and the hand-off to the export/skills siblings. <br>
- Efficiency: Whether the skill answers from the method table, VRAM tables and the matching references/*.md file without re-reading the whole skill or adding unnecessary steps. <br>

Underlying evaluation signals used in this run: <br>
- `expected_output`: Per-case assertion set checking the trainers, method flags, dataset formatting and hyperparameters the answer should contain. <br>
- `assertions`: Explicit per-case check list (5–6 checks per case) scored against the generated script or explanation. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 89.5 | B | guide-only |
| Correctness | 90.0 | — | — |
| Discoverability | 90.0 | — | — |
| Reliability | 85.0 | — | — |
| Efficiency | 95.0 | — | — |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>


