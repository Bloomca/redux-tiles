export const get = (url, params) => {
  return new Promise(res => {
    setTimeout(() => {
      res({ amount: Math.floor(Math.random() * 300) + 100 });
    }, Math.floor(Math.random() * 300));
  })
}
