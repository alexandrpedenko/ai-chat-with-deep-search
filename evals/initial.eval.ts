import { evalite } from "evalite";
import { askDeepSearch } from "~/deep-search";
import { Factuality } from "~/scorers/factuality";
import { AnswerRelevancy } from "~/scorers/answer-relevancy";
import { devData } from "./dev";
import { ciData } from "./ci";
import { regressionData } from "./regression";
import { env } from "~/env";
import type { Message } from "ai";

const buildDataset = () => {
  let data = [...devData];

  if (env.EVAL_DATASET === "ci") {
    data.push(...ciData);
  } else if (env.EVAL_DATASET === "regression") {
    data.push(...ciData, ...regressionData);
  }

  return data;
};

evalite("Deep Search Eval", {
  data: async (): Promise<{ input: string; expected: string }[]> => {
    return buildDataset();
  },
  task: async (input) => {
    const messages: Message[] = [
      {
        id: "1",
        role: "user",
        content: input,
      },
    ];
    return askDeepSearch(messages);
  },
  scorers: [
    Factuality,
    AnswerRelevancy,
    {
      name: "Contains Links",
      description: "Checks if the output contains any markdown links.",
      scorer: ({ output }) => {
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const containsLinks = markdownLinkRegex.test(output as string);
        return containsLinks ? 1 : 0;
      },
    },
  ],
});