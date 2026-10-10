## Description: <br>
Reinforcement learning and preference alignment with the Unsloth Python library — GRPO/GSPO/DAPO/Dr.GRPO/BNPO and DPO/ORPO/KTO through the TRL trainers, including reward-function and verifier design (RLVR), FP8, long-context and vision RL, and agent training; not plain supervised fine-tuning, quantization/export, or serving. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: The author email in the frontmatter is a personal, non-NVIDIA address and the repository is a third-party awesome list; the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers turning an instruct model into a reasoner or aligning it to preference data — designing reward functions and verifiers for a verifiable task, choosing between the GRPO family and DPO/ORPO/KTO given what labels they have, and sizing num_generations, sequence budgets and VRAM for an RL run on a specific GPU. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Not Specified] <br>
**Credential Type(s):** [None identified] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [grpo-basics.md](references/grpo-basics.md) <br>
- [reward-functions.md](references/reward-functions.md) <br>
- [grpo-advanced.md](references/grpo-advanced.md) <br>
- [preference.md](references/preference.md) <br>
- [vision-rl.md](references/vision-rl.md) <br>
- [agents-rl.md](references/agents-rl.md) <br>
- [reward-hacking.md](references/reward-hacking.md) <br>
- [vram-and-hardware.md](references/vram-and-hardware.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Configuration instructions] <br>
**Output Format:** [Markdown with inline Python code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Validated against 4 internal eval cases in `evals/evals.json` — a full GRPO reasoning run on GSM8K with hand-written reward functions and GRPOConfig, DPO alignment on a 2k chosen/rejected pair dataset, reward-function design for strict JSON-schema answers, and a vision GRPO/GSPO setup for Qwen3-VL on MathVista — each carrying 6 per-case assertions, plus 9 automated schema/repository and semantic-version checks. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the produced RL code uses the real trainer surface and argument names (GRPOTrainer/GRPOConfig, DPOTrainer with PatchDPOTrainer first, num_generations, loss_type, epsilon/epsilon_high/delta, max_prompt_length and max_completion_length, FastVisionModel for vision RL) and reward functions with the correct signature and return shape. <br>
- Discoverability: Whether the skill triggers on RL, reward-function and preference-alignment requests and hands plain SFT/LoRA work back to unsloth-finetuning, and export or serving work to unsloth-quantization and unsloth-inference. <br>
- Reliability: Whether the skill consistently routes to the right method for the signal available (verifiable answer to a fresh generation vs chosen/rejected pairs vs single labels) and repeats the documented constraints — minimum 300 steps before judging, num_generations above 2, the float16 stability note, and per-family vLLM support gaps such as gpt-oss. <br>
- Efficiency: Whether the skill designs the reward and reaches the trainer configuration without unnecessary steps, routing into the matching references file rather than re-deriving GRPO internals. <br>

Underlying evaluation signals used in this run: <br>
- `expected_output`: Per-case assertion set checking the trainer, config keys, reward functions and dataset preparation the answer should contain. <br>
- `assertions`: Explicit per-case check list (6 checks per case) scored against the generated script, reward function or explanation. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 90.2 | A | guide-only |
| Correctness | 90.0 | — | — |
| Discoverability | 90.0 | — | — |
| Reliability | 85.0 | — | — |
| Efficiency | 100.0 | — | — |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>


