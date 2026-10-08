import { MinimalFooter } from "@primer/react-brand";

export function LargeFooter() {
  return (
    <MinimalFooter logoHref="https://github.com/iromu/awesome-qwen" socialLinks={false}>
      <MinimalFooter.Link href="https://github.com/QwenLM/Qwen">
        Qwen Code
      </MinimalFooter.Link>
      <MinimalFooter.Link href="https://github.com/iromu/awesome-qwen">
        Repository
      </MinimalFooter.Link>
      <MinimalFooter.Link href="https://github.com/iromu/awesome-qwen/blob/main/README.md">
        README
      </MinimalFooter.Link>
      <MinimalFooter.Link href="https://github.com/iromu/awesome-qwen/blob/main/CONTRIBUTING.md">
        Contribute
      </MinimalFooter.Link>
    </MinimalFooter>
  );
}
