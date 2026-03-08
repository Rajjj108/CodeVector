import Queue from "bull";

export const judgeQueue = new Queue(
  "judge-queue",
  "redis://127.0.0.1:6379"
);

judgeQueue.process(async (job) => {
  const { filePath, language } = job.data;
  return runCode(filePath, language);
});

const job = await judgeQueue.add({
  filePath,
  language
});

const result = await job.finished();