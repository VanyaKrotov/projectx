import { create, autorun } from "../../packages/projectx";

const obj = {
  value: {
    data: 1,
    array: [{ value: 1 }, { value: 2 }, { value: 3 }],
  },
  set(value: number) {
    this.value.data = value;
  },
};

const obs = create(obj);

let j = 0;
autorun(() => {
  if (j < 10) {
    console.log(obs.value.data);
  } else {
    console.log(JSON.parse(JSON.stringify(obs.value.array)));
  }
});

console.log(obs);
