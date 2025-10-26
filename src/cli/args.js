const parseArgs = () => {
  const args = process.argv;
  args.forEach((elem, i) => {
    if (elem.startsWith("--")) {
      console.log(`${elem} is ${args[i + 1]}`);
    }
  });
};

parseArgs();
