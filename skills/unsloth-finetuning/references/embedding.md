# Embedding Model Fine-tuning

Fine-tune embedding / classifier / BERT / reranker models to align a model's
vectors with your domain's notion of "similarity" — improves retrieval, RAG,
clustering, and recommendations.

Unsloth trains these **~1.8-3.3x faster** with ~20% less memory and ~2x longer
context than other Flash Attention 2 implementations, with no accuracy
degradation. EmbeddingGemma-300M QLoRA runs on **3GB VRAM** (LoRA on 6GB).
Trained models deploy anywhere: transformers, LangChain, Ollama, vLLM,
llama.cpp, sentence-transformers, TEI, vector DBs.

Unsloth uses [SentenceTransformers](https://github.com/huggingface/sentence-transformers)
to support compatible models (Qwen3-Embedding, BERT, etc.). Even models with no
notebook/upload are supported.

## Features

- LoRA/QLoRA or full fine-tuning for embeddings, without rewriting your pipeline
- Best support for encoder-only `SentenceTransformer` models (with a `modules.json`)
- Cross-encoder models confirmed to train properly under the fallback path
- Supports `transformers v5`
- Limited support for models without `modules.json` (auto-assigns default
  `SentenceTransformers` pooling modules). For custom heads / nonstandard
  pooling, double-check the pooled embedding behavior.

## Workflow: `FastSentenceTransformer`

The flow is centered on `FastSentenceTransformer`. Save/push methods:

- `save_pretrained()` — saves **LoRA adapters** to a local folder
- `save_pretrained_merged()` — saves the **merged model** to a local folder
- `push_to_hub()` — pushes **LoRA adapters** to Hugging Face
- `push_to_hub_merged()` — pushes the **merged model** to Hugging Face

**Important: inference loading requires `for_inference=True`.**

```python
model = FastSentenceTransformer.from_pretrained(
    "sentence-transformers/all-MiniLM-L6-v2",
    for_inference=True,
)
```

For HF auth, run `hf auth login` in the same venv before calling the hub
methods — then `push_to_hub()` / `push_to_hub_merged()` don't require a token
argument.

## Inference / deployment

```python
# 1. Load a pretrained Sentence Transformer model
model = SentenceTransformer("<your-unsloth-finetuned-model")

query = "Which planet is known as the Red Planet?"
documents = [
    "Venus is often called Earth's twin because of its similar size and proximity.",
    "Mars, known for its reddish appearance, is often referred to as the Red Planet.",
    "Jupiter, the largest planet in our solar system, has a prominent red spot.",
    "Saturn, famous for its rings, is sometimes mistaken for the Red Planet."
]

# 2. Encode via encode_query and encode_document to automatically use the right prompts, if needed
query_embedding = model.encode_query(query)
document_embedding = model.encode_document(documents)
print(query_embedding.shape, document_embedding.shape)

# 3. Compute similarity, e.g. via the built-in similarity helper function
similarity = model.similarity(query_embedding, document_embedding)
print(similarity)
```

## Supported models (examples, not exhaustive)

```
Alibaba-NLP/gte-modernbert-base
BAAI/bge-large-en-v1.5
BAAI/bge-m3
BAAI/bge-reranker-v2-m3
Qwen/Qwen3-Embedding-0.6B
answerdotai/ModernBERT-base
answerdotai/ModernBERT-large
google/embeddinggemma-300m
intfloat/e5-large-v2
intfloat/multilingual-e5-large-instruct
mixedbread-ai/mxbai-embed-large-v1
sentence-transformers/all-MiniLM-L6-v2
sentence-transformers/all-mpnet-base-v2
Snowflake/snowflake-arctic-embed-l-v2.0
```

Most common `sentence-transformers` models are already supported. Free
notebooks exist for EmbeddingGemma (300M), Qwen3-Embedding (4B / 0.6B), BGE M3,
ModernBERT classification, and All-MiniLM-L6-v2.

Source: https://unsloth.ai/docs/basics/embedding-finetuning.md (fetched 2026-09-26).
