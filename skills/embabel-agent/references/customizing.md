# Customizing Reference

Custom LLM integration, options converters, knowledge cutoff, and embedding models. See SKILL.md for the core workflow.

## Custom LLM Integration

Implement the `LlmService` interface or use `SpringAiLlmService` to wrap any Spring AI `ChatModel`.

### SpringAiLlmService

`SpringAiLlmService` implements `LlmService` and provides framework-agnostic LLM operations, including tool-loop and message-sender support.

```java
@Configuration
public class LlmsConfig {
    @Bean
    public LlmService<?> myLlm() {
        org.springframework.ai.chat.model.ChatModel chatModel = ...;
        return new SpringAiLlmService(
                "myChatModel",              // name — used for model selection
                "myChatModelProvider",      // provider — e.g. "OpenAI", "Anthropic"
                chatModel
            )
            .withOptionsConverter(new MyLlmOptionsConverter())  // convert LlmOptions → ChatOptions
            .withKnowledgeCutoffDate(LocalDate.of(2025, 4, 1)); // temporal awareness
    }
}
```

### Configuration Options

| Option | Required | Description |
|---|---|---|
| `name` | Yes | Model name used for selection |
| `provider` | Yes | Provider name (e.g. "OpenAI", "Anthropic", "Mistral") |
| `OptionsConverter` | No | Converts Embabel `LlmOptions` to provider-specific `ChatOptions` |
| `knowledge cutoff date` | No | Adds `KnowledgeCutoffDate` prompt contributor |
| `pricing model` | No | Enables cost tracking |
| `PromptContributor` | No | Additional contributors applied to every LLM call |

### OpenAI-Compatible LLMs

Built-in OpenAI-compatible providers are available as static factories on `OpenAiCompatibleModelFactory` — use them directly for user-supplied keys (e.g., BYOK):

```kotlin
// DeepSeek (OpenAI-compatible endpoint)
val service: LlmService<*> = OpenAiCompatibleModelFactory.deepSeek(userKey).buildValidated()

// Atlas Cloud (OpenAI-compatible endpoint)
val service: LlmService<*> = OpenAiCompatibleModelFactory.atlasCloud(userKey).buildValidated()
```

`buildValidated()` validates the key with a probe call. The provider's SDK does not retry a 401, 402
or 403 response, so a refused key is reported after one request. The SDK retries a 429 response
twice, so a rate-limited key is reported after three requests. The SDK also retries other failures
it treats as temporary, such as a failed connection.

Extend `OpenAiCompatibleModelFactory` to register your own OpenAI-compatible providers as beans:

```java
@Configuration
public class CustomOpenAiCompatibleModels extends OpenAiCompatibleModelFactory {

    public CustomOpenAiCompatibleModels(
            @Value("${MY_BASE_URL:#{null}}") String baseUrl,
            @Value("${MY_API_KEY}") String apiKey,
            ObservationRegistry observationRegistry) {
        super(baseUrl, apiKey, observationRegistry);
    }

    @Bean
    public LlmService<?> myGreatModel() {
        return openAiCompatibleLlm(
            "my-great-model",
            "me",
            LocalDate.of(2025, 1, 1),
            new PerTokenPricingModel(0.40, 1.6)
        );
    }
}
```

### Serving a model over the Responses API (v1.5.4)

`openAiCompatibleLlm` uses the OpenAI Chat Completions API. Some models need the OpenAI Responses
API instead: GPT-5.6 and GPT-6 models reject function tools over Chat Completions when reasoning is
enabled, and `*-pro` models are served only over Responses.

| Model type | API | Reasoning |
|------------|-----|-----------|
| Standard models | Chat Completions | On or off |
| GPT-5.6 and GPT-6 (including `*-pro`) | Responses | On or off |
| GPT-5.6 and GPT-6 (non-`*-pro`) | Chat Completions | Off only when using function tools |

For Responses-served models, build the service with `openAiResponsesLlm` from the same factory:

```kotlin
@Bean
fun luna(): LlmService<*> =
    openAiResponsesLlm(
        model = "gpt-6-luna",
        provider = "OpenAI",
        // Optional: the shipped OpenAI catalog's native structured-output settings
        nativeSupport = OpenAiModelLoader().loadAutoConfigMetadata().nativeSupportDefaults,
    )
```

- **Requests** — no sampling parameters are sent, and `LlmOptions.maxTokens` becomes
  `max_output_tokens` (which also covers reasoning tokens).
- **Reasoning** — set the effort per call with `LlmOptions.withOpenAiReasoningEffort("low")`. It is
  sent as the Responses `reasoning.effort` whatever the `provider` name is.
- **Structured output** — native only when `nativeSupport` declares it; schemas that fail the
  native-output compatibility check fall back to prompt-based output. Without `nativeSupport`,
  structured output is prompt-based.
- **Limits** — this transport does not stream, and it rejects media content in messages. The
  endpoint must implement `/v1/responses`.

## Options Converters

Use an `OptionsConverter` to translate Embabel's `LlmOptions` into provider-specific options (e.g., Spring AI's `ChatOptions`). Chain it via `.withOptionsConverter()`:

```java
public class MyLlmOptionsConverter implements OptionsConverter {
    @Override
    public ChatOptions convert(LlmOptions options) {
        var builder = ChatOptions.builder()
            .model(options.getModel())
            .temperature(options.getTemperature());
        // Add provider-specific options here
        return builder.build();
    }
}
```

## Knowledge Cutoff

Set a knowledge cutoff date so the LLM knows its training data boundary:

```java
return new SpringAiLlmService("model", "provider", chatModel)
    .withKnowledgeCutoffDate(LocalDate.of(2025, 4, 1));
```

When a cutoff date is provided, Embabel automatically adds the `KnowledgeCutoffDate` prompt contributor to every call.

## Embedding Models

Embedding models are registered as beans of type `EmbeddingService`, wrapped via `SpringAiEmbeddingService`:

```java
@Configuration
public class EmbeddingModelsConfig {
    @Bean
    public EmbeddingService myEmbeddingModel() {
        org.springframework.ai.embedding.EmbeddingModel embeddingModel = ...;
        return new SpringAiEmbeddingService(
                "myEmbeddingModel",
                "myEmbeddingModelProvider",
                embeddingModel);
    }
}
```

## Key Points

- `SpringAiLlmService` wraps any Spring AI `ChatModel`
- Use `OptionsConverter` to map `LlmOptions` → provider-specific options
- Add a knowledge cutoff date for temporal awareness
- Use `OpenAiCompatibleModelFactory.<provider>(userKey).buildValidated()` for built-in OpenAI-compatible providers (DeepSeek, Mistral, Gemini, Atlas Cloud)
- Extend `OpenAiCompatibleModelFactory` for custom OpenAI-compatible providers
- Use `openAiResponsesLlm` for GPT-5.6/GPT-6 models served over the Responses API
- Embedding models use `SpringAiEmbeddingService` with the same pattern

## InvalidApiKeyException (BYOK)

`InvalidApiKeyException` (in `com.embabel.common.byok`) is the only type a caller needs to catch.
When `buildValidated()` on an OpenAI-compatible or Anthropic factory throws it (for a chat or an
embedding model), the exception carries provider-specific details:

- `statusCode` is the HTTP status code of the provider's response. It is `null` when no status code
  could be found: the connection failed, the key was blank so no request was made, or the provider
  responded and the response then failed a local check.
- `cause` is the provider's own exception — use it for logging.

Providers do not use the same status code for the same reason (e.g. an unknown key gets 401 from
OpenAI and 400 from Google's OpenAI-compatible endpoint), so decide what a status code means only
after you know which provider responded. `detectProvider` tries several providers and throws a new
`InvalidApiKeyException` when all fail — that exception has no status code and no cause; to get each
provider's status code, call `buildValidated()` on each factory yourself.

*Source: Embabel Agent v1.5.4 documentation — `references/customizing`*
