# Phone Deployment (ExecuTorch)

Fine-tune a model in Unsloth, apply QAT, export an ExecuTorch `.pte`, and run it on Android
(Pixel 8) or iPhone (15 Pro) at ~40 tokens/s for Qwen3-0.6B — privacy-first, offline.

Source: `unsloth.ai/docs/basics/inference-and-deployment/deploy-llms-phone`.

Supported families: Qwen3, Gemma3, Llama3, Qwen2.5, Phi4 and more.

## 1. Install

```bash
pip install --upgrade unsloth unsloth_zoo
pip install torchao==0.14.0 executorch pytorch_tokenizers
```

## 2. Fine-tune with the phone-deployment QAT scheme

```python
from unsloth import FastLanguageModel
import torch
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Qwen3-0.6B",
    max_seq_length = 1024,
    full_finetuning = True,
    qat_scheme = "phone-deployment", # Flag for phone deployment
)
```

`qat_scheme = "phone-deployment"` uses **int8-int4 under the hood**: it fake-quantizes INT8
dynamic activations with INT4 weights in the Linear layers during training while computing in
16-bit. After training the model converts to real quantization, so the on-device model is
smaller and typically **retains accuracy better than naive PTQ**.

Train with the standard `SFTTrainer` flow (see the free
`Qwen3_(0_6B)-Phone_Deployment` Colab notebook for data prep and training).

## 3. Export to ExecuTorch `.pte`

```bash
# Convert the weight checkpoint state dict keys to one that ExecuTorch expects
python -m executorch.examples.models.qwen3.convert_weights "phone_model" pytorch_model_converted.bin
# Download model config from ExecuTorch repo
curl -L -o 0.6B_config.json https://raw.githubusercontent.com/pytorch/executorch/main/examples/models/qwen3/config/0_6b_config.json
# Export to ExecuTorch pte file
python -m executorch.examples.models.llama.export_llama \
    --model "qwen3_0_6b" \
    --checkpoint pytorch_model_converted.bin \
    --params 0.6B_config.json \
    --output_name qwen3_0.6B_model.pte \
    -kv --use_sdpa_with_kv_cache -X --xnnpack-extended-ops \
    --max_context_length 1024 --max_seq_length 128 --dtype fp32 \
    --metadata '{"get_bos_id":199999, "get_eos_ids":[200020,199999]}'
```

Result: `qwen3_0.6B_model.pte` (~472MB) plus the tokenizer file.

## 4a. iOS deployment (Xcode route)

- Requires a Mac with Xcode 15+; simulator needs no developer account, a physical iPhone needs
  the paid Apple Developer Program (ExecuTorch requires the `increased-memory-limit` capability).

```bash
# Download the LLM example app
curl -L https://github.com/meta-pytorch/executorch-examples/archive/main.tar.gz | \
  tar -xz --strip-components=2 executorch-examples-main/llm/apple
```

1. Open `apple/etLLM.xcodeproj` in Xcode, select the iPhone simulator, run — it launches.
2. Stop the simulator; in the simulator Files app create a folder (e.g. `Qwen3test`) under
   On My iPhone.
3. Copy the two files in from the terminal:

```bash
find ~/Library/Developer/CoreSimulator/Devices/ -type d -iname "*Qwen3test*"
cp tokenizer.json /path/to/Qwen3test/tokenizer.json
cp qwen3_0.6B_model.pte /path/to/Qwen3test/qwen3_model.pte
```

4. In etLLM, load the model + tokenizer from that folder and chat.

Physical iPhone: sign with your team, change the Bundle Identifier (fixes most provisioning
errors), add the "Increased Memory Limit" capability, enable Developer Mode on the phone,
drag-drop `.pte` + `tokenizer.json` into the app's Files tab from Finder.

## 4b. Android deployment (command-line route, no Android Studio)

Requirements: **Java 17** (Java 21 default may break builds), Android cmdline-tools, adb.

```bash
# SDK + NDK (ExecuTorch needs NDK 25)
mkdir -p ~/android-sdk/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-*.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest
export ANDROID_HOME=$HOME/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "platform-tools" "build-tools;34.0.0" "ndk;25.0.8775105"
export ANDROID_NDK=$ANDROID_HOME/ndk/25.0.8775105

git clone https://github.com/meta-pytorch/executorch-examples.git
cd executorch-examples
```

Known build fixes:

```bash
echo "sdk.dir=$HOME/android-sdk" > llm/android/LlamaDemo/local.properties
sed -i 's/e.getDetailedError()/e.getMessage()/g' llm/android/LlamaDemo/app/src/main/java/com/example/executorchllamademo/MainActivity.java
```

Build and install:

```bash
cd llm/android/LlamaDemo
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Push model files to the app's fixed load directory:

```bash
adb shell mkdir -p /data/local/tmp/llama
adb shell chmod 777 /data/local/tmp/llama
adb push <path_to_tokenizer.json> /data/local/tmp/llama
adb push <path_to_model.pte> /data/local/tmp/llama
```

Then in the LlamaDemo app: select the `.pte` model, select the tokenizer, pick the model type
(e.g. Qwen3), and tap Load Model.

## Troubleshooting

- Build fails → check `java -version`, it MUST be 17.
- Model not loading → both the `.pte` AND the tokenizer must be selected.
- App crashing → valid `.pte` files must be exported for ExecuTorch (XNNPACK backend for CPU).
- Blank model picker in LlamaDemo → the adb push failed; redo it.
