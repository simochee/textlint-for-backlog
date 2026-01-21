export const loadTextlint = async () => {
  const { textlintWorkerUrl } = useAppConfig();

  const res = await fetch(textlintWorkerUrl);
  const worker = new Worker(URL.createObjectURL(await res.blob()));

  return worker;
};
