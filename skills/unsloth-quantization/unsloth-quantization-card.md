## Description: <br>
Quantize and export a trained model with Unsloth — GGUF via save_pretrained_gguf / push_to_hub_gguf including the Dynamic 2.0/3.0 quants, FP8 and NVFP4 for Blackwell, quantization-aware training through TorchAO, merged 16-bit/4-bit safetensors, speculative-decoding draft models and ExecuTorch phone deployment, plus reading perplexity and KL-divergence benchmark tables. <br>

This skill is ready for commercial/non-commercial use. <br>

## Third-Party Community Consideration
<span style="color:#d73a49">This skill is not owned or developed by NVIDIA. This skill has been developed and built to a third-party's requirements for this application and use case; see link to Non-NVIDIA [Iván Rodríguez Murillo Agent Card](https://github.com/iromu/awesome-qwen).</span> <!-- VERIFY: The author email in the frontmatter is a personal, non-NVIDIA address and the repository is a third-party awesome list; the card_link is the source repo because no separate vendor card exists. --> <br>

### License/Terms of Use: <br>
<span style="color:#d73a49">MIT</span> <!-- VERIFY: No LICENSE file exists anywhere in the repository; MIT comes only from a 'License: MIT' badge in the root README, so the terms must be confirmed before submission. --> <br>
## Use Case: <br>
Developers and engineers turning a finished fine-tune into a deployable artifact — picking the quantization format for a target runtime (llama.cpp/Ollama/LM Studio GGUF, vLLM merged safetensors, FP8 or NVFP4 on Blackwell, QAT via TorchAO, ExecuTorch on a phone), writing the export or QAT code, and judging the resulting accuracy/size trade-off from perplexity and KL-divergence benchmarks. <br>

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
- [gguf-export.md](references/gguf-export.md) <br>
- [dynamic-gguf.md](references/dynamic-gguf.md) <br>
- [fp8.md](references/fp8.md) <br>
- [nvfp4.md](references/nvfp4.md) <br>
- [qat.md](references/qat.md) <br>
- [speculative-decoding.md](references/speculative-decoding.md) <br>
- [phone-deployment.md](references/phone-deployment.md) <br>
- [benchmarks.md](references/benchmarks.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Shell commands, Configuration instructions] <br>
**Output Format:** [Markdown with inline Python code blocks and shell/curl command blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Validated against 4 internal eval cases in `evals/evals.json` — multi-quant GGUF export pushed to Hugging Face, a Dynamic-GGUF versus standard-imatrix explanation with a recommendation, a complete QAT training script ending in a 4-bit model, and a merged safetensors export for vLLM — each carrying 5–6 per-case assertions, plus 9 automated schema/repository and semantic-version checks. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Correctness: Whether the export code uses the real Unsloth export surface (save_pretrained_gguf / push_to_hub_gguf quantization_method values, save_pretrained_merged save_method, qat_scheme and the torchao config plus the mandatory convert step) instead of invented arguments such as an imatrix parameter. <br>
- Discoverability: Whether the skill triggers on quantize/export/format-selection/benchmark-reading requests and hands back to unsloth-finetuning or unsloth-inference when the task is training or serving an already-exported file. <br>
- Reliability: Whether the skill consistently picks the format that fits the stated target hardware and repeats the documented constraints — Blackwell-only NVFP4, the QAT convert-before-save order, the chat-template and EOS-token causes of post-export gibberish, and the limits of perplexity and KL divergence as quality signals. <br>
- Efficiency: Whether the skill reaches the right export recipe and benchmark read without unnecessary steps, such as batching several quants in one call instead of separate slower runs. <br>

Underlying evaluation signals used in this run: <br>
- `expected_output`: Per-case assertion set checking the export calls, quant methods, QAT scheme and verification steps the answer should contain. <br>
- `assertions`: Explicit per-case check list (5–6 checks per case) scored against the generated script or explanation. <br>



## Evaluation Results: <br>
| Dimension | Score | Grade | Type |
|---|---:|---|---|
| Overall quality | 87.0 | B | guide-only |
| Correctness | 90.0 | — | — |
| Discoverability | 90.0 | — | — |
| Reliability | 75.0 | — | — |
| Efficiency | 95.0 | — | — |

## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>


