function uidGenerator(): () => number {
  let i = 0;

  return (): number => i++;
}

const uid = uidGenerator();

export { uidGenerator, uid };
