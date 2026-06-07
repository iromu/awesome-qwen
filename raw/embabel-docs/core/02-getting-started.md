# Embabel Framework - Getting Started

Source: https://docs.embabel.com/embabel-agent/guide/0.1.2-SNAPSHOT/

## Quickstart

There are two GitHub template repos you can use to create your own project:

- Java template - github.com/embabel/java-agent-template
- Kotlin template - github.com/embabel/kotlin-agent-template

Or you can use our project creator to create a custom project:

```
uvx --from git+https://github.com/embabel/project-creator.git project-creator
```

## Getting the Binaries

### Maven

Add the Embabel Agent Spring Boot starter to your pom.xml:

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-starter</artifactId>
    <version>${embabel-agent.version}</version>
</dependency>
```

Add the Embabel repository to your pom.xml:

```xml
<repositories>
    <repository>
        <id>embabel-releases</id>
        <url>https://repo.embabel.com/artifactory/libs-release</url>
        <releases>
            <enabled>true</enabled>
        </releases>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>embabel-snapshots</id>
        <url>https://repo.embabel.com/artifactory/libs-snapshot</url>
        <releases>
            <enabled>false</enabled>
        </releases>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
    <repository>
        <id>spring-milestones</id>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

### Gradle

```kotlin
repositories {
    mavenCentral()
    maven {
        name = "embabel-releases"
        url = uri("https://repo.embabel.com/artifactory/libs-release")
        mavenContent { releasesOnly() }
    }
    maven {
        name = "embabel-snapshots"
        url = uri("https://repo.embabel.com/artifactory/libs-snapshot")
        mavenContent { snapshotsOnly() }
    }
    maven {
        name = "Spring Milestones"
        url = uri("https://repo.spring.io/milestone")
    }
}

dependencies {
    implementation("com.embabel.agent:embabel-agent-starter:${embabel-agent.version}")
}
```

### Environment Setup

Required:
- `OPENAI_API_KEY`: For OpenAI models

Optional but recommended:
- `ANTHROPIC_API_KEY`: For Anthropic models

## Running the Examples

```bash
git clone https://github.com/embabel/embabel-agent-examples
cd embabel-agent-examples/scripts/java
./shell.sh
```

## Using the Shell

```bash
# Simple horoscope agent
execute "My name is Sarah and I'm a Leo"

# Research with web tools
execute "research the recent australian federal election. what is the position of the Greens party?"

# Fact checking
x "fact check the following: holden cars are still made in australia"
```

Options:
- `-p` logs prompts
- `-r` logs LLM responses

## Adding AI to Your Application

```java
@Component
public record InjectedComponent(Ai ai) {
    public String tellJokeAbout(String topic) {
        return ai.withDefaultLlm().generateText("Tell me a joke about " + topic);
    }

    public Joke createJokeObjectAbout(String topic1, String topic2, String voice) {
        return ai.withLlm(LlmOptions.withDefaultLlm().withTemperature(.8))
            .createObject("Tell me a joke about %s and %s. The voice should be %s. The joke should have a leadup and a punchline.".formatted(topic1, topic2, voice), Joke.class);
    }
}
```

## Writing Your First Agent

```java
@Agent(description = "Agent that writes and reviews stories")
public class WriteAndReviewAgent {

    @Action
    public Story writeStory(UserInput userInput, OperationContext context) {
        var writer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
            .withTemperature(0.8)
            .withPersona("You are a creative storyteller");

        return context.ai()
            .withLlm(writer)
            .createObject("Write a story about: " + userInput.getContent(), Story.class);
    }

    @AchievesGoal(description = "Review and improve the story")
    @Action
    public ReviewedStory reviewStory(Story story, OperationContext context) {
        var reviewer = LlmOptions.withModel(OpenAiModels.GPT_4O_MINI)
            .withTemperature(0.2)
            .withPersona("You are a careful editor and reviewer");

        String prompt = "Review this story and suggest improvements: " + story.text();

        return context.ai()
            .withLlm(reviewer)
            .createObject(prompt, ReviewedStory.class);
    }
}
```
