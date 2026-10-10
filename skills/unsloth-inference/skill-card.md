## Description: <br>
Run, serve and integrate local models with the Unsloth ecosystem — the Desktop app and Studio UI, `unsloth run` and its OpenAI/Anthropic-compatible endpoint, the openai/anthropic Python SDKs, native 2x-faster in-process inference, and deployment through vLLM, SGLang, llama-server, Ollama or LM Studio. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: The author email in the frontmatter is a personal, non-NVIDIA address and the repository is a third-party awesome list; the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers who need to run a quantized checkpoint locally or expose it as an OpenAI-compatible endpoint — picking a serving path that fits the hardware (GGUF on CPU/Mac vs vLLM/SGLang on a datacenter GPU), wiring a coding agent or MCP client to the local model, and choosing the engine flags, ports and chat template that make the served model behave. <br>

### Deployment Geography for Use: <br>
Global <br>

## Requirements / Dependencies: <br>
**Requires API Key or External Credential:** [Yes] <br>
**Credential Type(s):** [API key, OAuth Token] <br>  

Do not include secrets in prompts/logs/output; use least-privilege credentials; rotate keys as appropriate. See skill body for more details. <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [desktop-studio.md](references/desktop-studio.md) <br>
- [api.md](references/api.md) <br>
- [python-sdk.md](references/python-sdk.md) <br>
- [vllm.md](references/vllm.md) <br>
- [llama-server.md](references/llama-server.md) <br>
- [ollama-lmstudio.md](references/ollama-lmstudio.md) <br>
- [native-inference.md](references/native-inference.md) <br>
- [Unsloth documentation](https://unsloth.ai/docs) <br>
- [Unsloth model catalog on Hugging Face](https://huggingface.co/unsloth) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Shell commands, Configuration instructions] <br>
**Output Format:** [Markdown with inline Python code blocks and shell/curl command blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Validated against 9 internal eval cases in `evals/evals.json` — local GGUF serving tested with curl, OpenAI SDK calls against the local endpoint, vLLM FP8 deployment with LoRA hot swapping, connecting Claude Code to a local model, exporting and serving a fine-tune in Ollama, in-process Python inference with streaming, LAN and Cloudflare remote access, and a local tool-calling loop — each with 4–6 per-case assertions, one of the nine being a deliberately non-triggering fine-tuning request; plus 9 automated schema/repository and semantic-version checks. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the served-model recipe uses real Unsloth/Studio/vLLM/SGLang/llama.cpp commands and endpoint shapes (real engine arguments, correct endpoint paths and ports, correct SDK base-URL handling) rather than invented flags or URLs. <br>
- Discoverability: Whether the skill triggers on run/serve/integrate requests and stays silent on fine-tuning requests, which belong to unsloth-finetuning. <br>
- Reliability: Whether the skill consistently routes to the right inference path for the target hardware and repeats the documented caveats — matching chat template, bind-address tool policy, LoRA hot-swap env flag, remote-access exposure limits. <br>
- Efficiency: Whether the skill reaches a working endpoint or serving command without unnecessary steps, including looking up a quantized model repo instead of assuming an FP16 checkpoint fits. <br>

Underlying evaluation signals used in this run: <br>
- `expected_output`: Per-case assertion set naming the commands, endpoints, ports, headers and flags the answer should contain. <br>
- `should_trigger`: Routing check that the skill activates for serving/integration requests and stays silent for fine-tuning requests. <br>
- `assertions`: Explicit per-case check list (4–6 checks per case) scored against the generated answer. <br>



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


